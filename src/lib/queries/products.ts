import { getDb } from "../db";
import type { Category, ProductListItem, ProductDetail, Banner } from "@/types/product";

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
      CASE WHEN MAX(s.stock) = 0 THEN 1 ELSE 0 END as all_sold_out
    FROM products p
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN skus s ON s.product_id = p.id AND s.is_active = 1
    WHERE p.is_active = 1
  `;
  const params: string[] = [];

  if (categorySlug) {
    sql += " AND c.slug = ?";
    params.push(categorySlug);
  }

  sql += " GROUP BY p.id ORDER BY p.created_at DESC";

  return db.prepare(sql).all(...params) as ProductListItem[];
}

export function getProductDetail(productId: string): ProductDetail | null {
  const db = getDb();

  const product = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
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

  return {
    ...product,
    option_groups: enrichedGroups,
    skus: enrichedSkus,
  } as ProductDetail;
}
