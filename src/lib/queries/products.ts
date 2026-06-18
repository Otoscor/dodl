import { getDb } from "../db";
import { v4 as uuidv4 } from "uuid";
import type { Category, ProductListItem, ProductDetail, Banner, Review } from "@/types/product";

export function getCategories(): Category[] {
  const db = getDb();
  return db.prepare("SELECT * FROM categories ORDER BY sort_order").all() as Category[];
}

export function getBanners(): Banner[] {
  const db = getDb();
  return db.prepare("SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order").all() as Banner[];
}

export function getProducts(categorySlug?: string): ProductListItem[] {
  const db = getDb();
  let sql = `
    SELECT p.*,
      c.name as category_name,
      MIN(s.price) as min_price,
      MAX(s.price) as max_price,
      CASE WHEN MAX(s.stock) = 0 THEN 1 ELSE 0 END as all_sold_out,
      COALESCE(r.review_count, 0) as review_count,
      COALESCE(ROUND(r.average_rating, 1), 0) as average_rating
    FROM products p
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN skus s ON s.product_id = p.id AND s.is_active = 1
    LEFT JOIN (
      SELECT product_id, COUNT(*) AS review_count, AVG(rating) AS average_rating
      FROM reviews GROUP BY product_id
    ) r ON r.product_id = p.id
    WHERE p.is_active = 1
  `;
  const params: string[] = [];

  if (categorySlug) {
    sql += " AND c.slug = ?";
    params.push(categorySlug);
  }

  sql += " GROUP BY p.id ORDER BY p.created_at DESC";

  const rows = db.prepare(sql).all(...params) as (ProductListItem & { detail_info: string })[];

  return rows.map(row => {
    let keySpecs: string[] = [];
    let nutrition: ProductListItem["nutrition"] = null;
    let brand = "";
    try {
      const parsed = JSON.parse(row.detail_info || '{}');
      keySpecs = parsed.keySpecs || [];
      nutrition = parsed.nutrition ?? null;
      brand = parsed.brand || parseBrand(parsed.manufacturer);
    } catch {}
    return { ...row, key_specs: keySpecs, nutrition, brand };
  });
}

// detail_info.manufacturer 문자열("제조사: (주)헬스케어랩 | 원산지: ... | ...")에서
// 브랜드/제조사명만 추출. brand 필드가 없을 때의 폴백.
function parseBrand(manufacturer?: string): string {
  if (!manufacturer) return "";
  const firstSegment = manufacturer.split("|")[0].trim();
  return firstSegment.replace(/^제조사\s*:\s*/, "").trim();
}

export function getProductDetail(productId: string): ProductDetail | null {
  const db = getDb();

  const product = db.prepare(`
    SELECT
      p.*,
      c.name AS category_name,
      COALESCE(r.review_count, 0)             AS review_count,
      COALESCE(ROUND(r.average_rating, 1), 0) AS average_rating,
      COALESCE(r.count_5, 0) AS count_5,
      COALESCE(r.count_4, 0) AS count_4,
      COALESCE(r.count_3, 0) AS count_3,
      COALESCE(r.count_2, 0) AS count_2,
      COALESCE(r.count_1, 0) AS count_1
    FROM products p
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN (
      SELECT product_id,
             COUNT(*)    AS review_count,
             AVG(rating) AS average_rating,
             SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS count_5,
             SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS count_4,
             SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS count_3,
             SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS count_2,
             SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS count_1
      FROM reviews
      GROUP BY product_id
    ) r ON r.product_id = p.id
    WHERE p.id = ? AND p.is_active = 1
  `).get(productId) as Record<string, unknown> | undefined;

  if (!product) return null;

  const optionGroups = db.prepare(`
    SELECT * FROM option_groups WHERE product_id = ? ORDER BY sort_order
  `).all(productId) as { id: string; product_id: string; name: string; sort_order: number }[];

  const enrichedGroups = optionGroups.map((g) => {
    const values = db.prepare(`
      SELECT * FROM option_values WHERE option_group_id = ? ORDER BY sort_order
    `).all(g.id) as { id: string; option_group_id: string; name: string; sort_order: number }[];
    return { ...g, values };
  });

  const skus = db.prepare(`
    SELECT * FROM skus WHERE product_id = ? AND is_active = 1
  `).all(productId) as { id: string; product_id: string; sku_code: string; price: number; stock: number; is_active: number; created_at: string }[];

  const enrichedSkus = skus.map((sku) => {
    const optionValues = db.prepare(`
      SELECT ov.name as value_name, og.name as group_name
      FROM sku_option_values sov
      JOIN option_values ov ON ov.id = sov.option_value_id
      JOIN option_groups og ON og.id = ov.option_group_id
      WHERE sov.sku_id = ?
      ORDER BY og.sort_order
    `).all(sku.id) as { value_name: string; group_name: string }[];
    return { ...sku, option_values: optionValues };
  });

  const detailInfoRaw = (product.detail_info as string) || '{}';
  let detailInfo;
  try {
    detailInfo = JSON.parse(detailInfoRaw);
  } catch {
    detailInfo = {};
  }

  return {
    ...product,
    detail_info: detailInfo,
    option_groups: enrichedGroups,
    skus: enrichedSkus,
    review_summary: {
      average_rating: product.average_rating as number,
      review_count: product.review_count as number,
      rating_distribution: {
        5: (product.count_5 as number) ?? 0,
        4: (product.count_4 as number) ?? 0,
        3: (product.count_3 as number) ?? 0,
        2: (product.count_2 as number) ?? 0,
        1: (product.count_1 as number) ?? 0,
      },
    },
  } as ProductDetail;
}

export function createReview(
  productId: string,
  sessionId: string,
  data: { author_name: string; rating: number; body: string; photo_urls?: string[] }
): { success: boolean; message?: string } {
  const db = getDb();

  const product = db.prepare("SELECT id FROM products WHERE id = ? AND is_active = 1").get(productId);
  if (!product) return { success: false, message: "상품을 찾을 수 없습니다." };

  const existing = db.prepare(
    "SELECT id FROM reviews WHERE session_id = ? AND product_id = ?"
  ).get(sessionId, productId);
  if (existing) return { success: false, message: "이미 이 상품에 리뷰를 작성하셨습니다." };

  db.prepare(
    `INSERT INTO reviews (id, product_id, session_id, author_name, rating, body, photo_urls)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(uuidv4(), productId, sessionId, data.author_name.trim(), data.rating, data.body.trim(),
        JSON.stringify(data.photo_urls ?? []));

  return { success: true };
}

export function getReviews(productId: string): Review[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, product_id, author_name, rating, body, photo_urls, created_at
    FROM reviews
    WHERE product_id = ?
    ORDER BY created_at DESC
  `).all(productId) as (Omit<Review, "photo_urls"> & { photo_urls: string })[];

  return rows.map((r) => ({
    ...r,
    photo_urls: JSON.parse(r.photo_urls || "[]") as string[],
  }));
}
