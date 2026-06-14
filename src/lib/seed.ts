import type Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import { INITIAL_WALLET_BALANCE, WALLET_TX_TYPE } from "./constants";

const DEMO_SESSION = "demo-session-001";

export function seedDatabase(db: Database.Database) {
  const existing = db.prepare("SELECT COUNT(*) as cnt FROM categories").get() as { cnt: number };
  if (existing.cnt > 0) return;

  // --- Categories ---
  const categories = [
    { id: uuidv4(), name: "비타민", slug: "vitamin", image_url: "/categories/vitamin.svg", sort_order: 1 },
    { id: uuidv4(), name: "프로바이오틱스", slug: "probiotics", image_url: "/categories/probiotics.svg", sort_order: 2 },
    { id: uuidv4(), name: "오메가3", slug: "omega3", image_url: "/categories/omega3.svg", sort_order: 3 },
    { id: uuidv4(), name: "미네랄", slug: "mineral", image_url: "/categories/mineral.svg", sort_order: 4 },
    { id: uuidv4(), name: "콜라겐", slug: "collagen", image_url: "/categories/collagen.svg", sort_order: 5 },
    { id: uuidv4(), name: "어린이", slug: "kids", image_url: "/categories/kids.svg", sort_order: 6 },
  ];

  const insertCategory = db.prepare(
    "INSERT INTO categories (id, name, slug, image_url, sort_order) VALUES (?, ?, ?, ?, ?)"
  );
  for (const c of categories) {
    insertCategory.run(c.id, c.name, c.slug, c.image_url, c.sort_order);
  }

  const catMap: Record<string, string> = {};
  for (const c of categories) catMap[c.slug] = c.id;

  // --- Products ---
  const insertProduct = db.prepare(
    "INSERT INTO products (id, category_id, name, description, image_url, base_price) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insertOptionGroup = db.prepare(
    "INSERT INTO option_groups (id, product_id, name, sort_order) VALUES (?, ?, ?, ?)"
  );
  const insertOptionValue = db.prepare(
    "INSERT INTO option_values (id, option_group_id, name, sort_order) VALUES (?, ?, ?, ?)"
  );
  const insertSku = db.prepare(
    "INSERT INTO skus (id, product_id, sku_code, price, stock) VALUES (?, ?, ?, ?, ?)"
  );
  const insertSkuOV = db.prepare(
    "INSERT INTO sku_option_values (sku_id, option_value_id) VALUES (?, ?)"
  );

  // Helper
  function createProduct(
    catSlug: string,
    name: string,
    desc: string,
    basePrice: number,
    imgUrl: string,
    options: { groupName: string; values: string[] }[],
    skuDefs: { optionKeys: string[]; price: number; stock: number; code: string }[]
  ) {
    const pid = uuidv4();
    insertProduct.run(pid, catMap[catSlug], name, desc, imgUrl, basePrice);

    const ovMap: Record<string, string> = {};

    for (let gi = 0; gi < options.length; gi++) {
      const g = options[gi];
      const gid = uuidv4();
      insertOptionGroup.run(gid, pid, g.groupName, gi + 1);
      for (let vi = 0; vi < g.values.length; vi++) {
        const vid = uuidv4();
        insertOptionValue.run(vid, gid, g.values[vi], vi + 1);
        ovMap[g.values[vi]] = vid;
      }
    }

    for (const s of skuDefs) {
      const sid = uuidv4();
      insertSku.run(sid, pid, s.code, s.price, s.stock);
      for (const key of s.optionKeys) {
        if (ovMap[key]) {
          insertSkuOV.run(sid, ovMap[key]);
        }
      }
    }

    return pid;
  }

  // 1. 멀티비타민 (조합형: 맛×용량) → 4 SKU
  createProduct("vitamin", "데일리 멀티비타민", "하루 한 알로 필수 비타민 13종을 채우세요. 무향료, 무색소로 온 가족이 안심하고 섭취할 수 있습니다.", 18000, "/products/multivitamin.jpg",
    [
      { groupName: "맛", values: ["오렌지", "포도"] },
      { groupName: "용량", values: ["30정", "60정"] },
    ],
    [
      { optionKeys: ["오렌지", "30정"], price: 18000, stock: 50, code: "VIT-MV-OR30" },
      { optionKeys: ["오렌지", "60정"], price: 32000, stock: 30, code: "VIT-MV-OR60" },
      { optionKeys: ["포도", "30정"], price: 18000, stock: 3, code: "VIT-MV-GR30" },
      { optionKeys: ["포도", "60정"], price: 32000, stock: 0, code: "VIT-MV-GR60" },
    ]
  );

  // 2. 비타민C 1000 (단일 옵션: 용량)
  createProduct("vitamin", "고함량 비타민C 1000", "영국산 비타민C 1000mg, 항산화 및 면역력 강화에 도움을 줍니다.", 15000, "/products/vitaminc.jpg",
    [{ groupName: "용량", values: ["60정", "120정", "180정"] }],
    [
      { optionKeys: ["60정"], price: 15000, stock: 80, code: "VIT-C-60" },
      { optionKeys: ["120정"], price: 27000, stock: 45, code: "VIT-C-120" },
      { optionKeys: ["180정"], price: 38000, stock: 2, code: "VIT-C-180" },
    ]
  );

  // 3. 비타민D3 (옵션 없음)
  createProduct("vitamin", "햇빛 비타민D3 2000IU", "실내 생활이 많은 현대인을 위한 비타민D3. 뼈 건강과 면역 기능에 필수적입니다.", 12000, "/products/vitamind.jpg",
    [],
    [{ optionKeys: [], price: 12000, stock: 100, code: "VIT-D3-2000" }]
  );

  // 4. 프로바이오틱스 (조합형: 균주×용량) → 4 SKU
  createProduct("probiotics", "장건강 프로바이오틱스", "19종 복합 유산균 100억 CFU. 장까지 살아서 도달하는 특허 코팅 기술 적용.", 25000, "/products/probiotics.jpg",
    [
      { groupName: "균주", values: ["19종 복합", "김치유산균"] },
      { groupName: "기간", values: ["1개월분", "3개월분"] },
    ],
    [
      { optionKeys: ["19종 복합", "1개월분"], price: 25000, stock: 60, code: "PRO-19-1M" },
      { optionKeys: ["19종 복합", "3개월분"], price: 65000, stock: 20, code: "PRO-19-3M" },
      { optionKeys: ["김치유산균", "1개월분"], price: 28000, stock: 40, code: "PRO-KM-1M" },
      { optionKeys: ["김치유산균", "3개월분"], price: 72000, stock: 0, code: "PRO-KM-3M" },
    ]
  );

  // 5. 어린이 프로바이오틱스 (단일: 맛)
  createProduct("probiotics", "키즈 유산균 츄어블", "아이들이 좋아하는 맛으로 만든 츄어블 유산균. 방부제 무첨가.", 19000, "/products/kids-probiotics.jpg",
    [{ groupName: "맛", values: ["딸기", "바나나"] }],
    [
      { optionKeys: ["딸기"], price: 19000, stock: 35, code: "PRO-KD-ST" },
      { optionKeys: ["바나나"], price: 19000, stock: 4, code: "PRO-KD-BN" },
    ]
  );

  // 6. 알티지 오메가3 (단일: 용량)
  createProduct("omega3", "알티지 오메가3", "초임계 추출 rTG 오메가3. EPA+DHA 고함량으로 혈행 건강에 도움.", 35000, "/products/omega3.jpg",
    [{ groupName: "용량", values: ["60캡슐", "120캡슐"] }],
    [
      { optionKeys: ["60캡슐"], price: 35000, stock: 55, code: "OMG-RTG-60" },
      { optionKeys: ["120캡슐"], price: 62000, stock: 25, code: "OMG-RTG-120" },
    ]
  );

  // 7. 식물성 오메가3 (옵션 없음)
  createProduct("omega3", "식물성 오메가3 DHA", "미세조류 유래 식물성 DHA. 비건 인증, 중금속 걱정 없는 깨끗한 오메가3.", 29000, "/products/vegan-omega.jpg",
    [],
    [{ optionKeys: [], price: 29000, stock: 70, code: "OMG-VG-DHA" }]
  );

  // 8. 마그네슘 (단일: 타입)
  createProduct("mineral", "프리미엄 마그네슘", "산화마그네슘 대비 흡수율 높은 킬레이트 마그네슘. 근육 이완과 숙면에 도움.", 16000, "/products/magnesium.jpg",
    [{ groupName: "타입", values: ["킬레이트", "구연산"] }],
    [
      { optionKeys: ["킬레이트"], price: 16000, stock: 90, code: "MIN-MG-CH" },
      { optionKeys: ["구연산"], price: 14000, stock: 85, code: "MIN-MG-CT" },
    ]
  );

  // 9. 아연+셀레늄 (옵션 없음)
  createProduct("mineral", "아연 + 셀레늄", "남성 건강에 필수적인 아연과 셀레늄을 한 알에. 면역력과 항산화에 도움.", 13000, "/products/zinc-selenium.jpg",
    [],
    [{ optionKeys: [], price: 13000, stock: 65, code: "MIN-ZN-SE" }]
  );

  // 10. 저분자 콜라겐 (조합형: 타입×용량) → 4 SKU — 전 SKU 품절
  createProduct("collagen", "저분자 피쉬 콜라겐", "분자량 500Da 이하 초저분자 콜라겐. 피부 탄력과 보습에 도움.", 28000, "/products/collagen.jpg",
    [
      { groupName: "타입", values: ["분말", "정제"] },
      { groupName: "용량", values: ["30일분", "60일분"] },
    ],
    [
      { optionKeys: ["분말", "30일분"], price: 28000, stock: 0, code: "COL-PW-30" },
      { optionKeys: ["분말", "60일분"], price: 50000, stock: 0, code: "COL-PW-60" },
      { optionKeys: ["정제", "30일분"], price: 32000, stock: 0, code: "COL-TB-30" },
      { optionKeys: ["정제", "60일분"], price: 56000, stock: 0, code: "COL-TB-60" },
    ]
  );

  // 11. 콜라겐 젤리스틱 (단일: 맛)
  createProduct("collagen", "콜라겐 젤리스틱", "간편하게 먹는 석류맛 콜라겐 젤리. 휴대가 편리한 스틱 포장.", 22000, "/products/collagen-jelly.jpg",
    [{ groupName: "맛", values: ["석류", "블루베리", "레몬"] }],
    [
      { optionKeys: ["석류"], price: 22000, stock: 40, code: "COL-JL-PM" },
      { optionKeys: ["블루베리"], price: 22000, stock: 1, code: "COL-JL-BB" },
      { optionKeys: ["레몬"], price: 22000, stock: 30, code: "COL-JL-LM" },
    ]
  );

  // 12. 어린이 멀티비타민 (단일: 맛)
  createProduct("kids", "어린이 종합비타민 젤리", "곰돌이 모양 젤리로 아이들이 즐겁게 먹는 종합비타민. 13종 비타민+미네랄.", 20000, "/products/kids-vitamin.jpg",
    [{ groupName: "맛", values: ["오렌지", "딸기"] }],
    [
      { optionKeys: ["오렌지"], price: 20000, stock: 45, code: "KID-MV-OR" },
      { optionKeys: ["딸기"], price: 20000, stock: 50, code: "KID-MV-ST" },
    ]
  );

  // 13. 어린이 칼슘 (옵션 없음)
  createProduct("kids", "성장기 칼슘 + 비타민D", "뼈 건강에 필수인 칼슘과 비타민D를 한번에. 성장기 어린이에게 추천.", 17000, "/products/kids-calcium.jpg",
    [],
    [{ optionKeys: [], price: 17000, stock: 55, code: "KID-CA-VD" }]
  );

  // --- Banners ---
  const insertBanner = db.prepare(
    "INSERT INTO banners (id, title, subtitle, image_url, link_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
  );
  insertBanner.run(uuidv4(), "여름 건강 챙기기", "인기 비타민 최대 30% 할인", "/banners/summer.jpg", "/products?category=vitamin", 1);
  insertBanner.run(uuidv4(), "프로바이오틱스 기획전", "장 건강의 시작, 유산균", "/banners/probiotics.jpg", "/products?category=probiotics", 2);
  insertBanner.run(uuidv4(), "우리 아이 영양제", "성장기 필수 영양소 모음", "/banners/kids.jpg", "/products?category=kids", 3);

  // --- Demo wallet + orders for demo session ---
  const walletId = uuidv4();
  db.prepare("INSERT INTO wallets (id, session_id, balance) VALUES (?, ?, ?)").run(walletId, DEMO_SESSION, 52000);
  const txId = uuidv4();
  db.prepare(
    "INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(txId, walletId, WALLET_TX_TYPE.GRANT, INITIAL_WALLET_BALANCE, INITIAL_WALLET_BALANCE, "가상 지갑 초기 부여");

  // Demo order 1: 배송완료
  const orderId1 = uuidv4();
  db.prepare(
    `INSERT INTO orders (id, order_number, session_id, status, recipient_name, recipient_phone, address_line1, address_line2, product_total, shipping_fee, total_amount, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-7 days'))`
  ).run(orderId1, "ORD-260607-ABC123", DEMO_SESSION, "배송완료", "홍길동", "010-1234-5678", "서울시 강남구 테헤란로 123", "4층 401호", 33000, 0, 33000);
  db.prepare(
    "INSERT INTO order_items (id, order_id, sku_id, product_name, option_summary, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(uuidv4(), orderId1, "demo-sku-1", "고함량 비타민C 1000", "120정", 27000, 1, 27000);
  db.prepare(
    "INSERT INTO order_items (id, order_id, sku_id, product_name, option_summary, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(uuidv4(), orderId1, "demo-sku-2", "아연 + 셀레늄", "", 13000, 1, 13000);
  // payment tx
  db.prepare(
    "INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-7 days'))"
  ).run(uuidv4(), walletId, WALLET_TX_TYPE.PAYMENT, 33000, 67000, "주문 결제", orderId1);

  // Demo order 2: 결제완료 (취소 가능)
  const orderId2 = uuidv4();
  db.prepare(
    `INSERT INTO orders (id, order_number, session_id, status, recipient_name, recipient_phone, address_line1, address_line2, product_total, shipping_fee, total_amount, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-1 days'))`
  ).run(orderId2, "ORD-260613-DEF456", DEMO_SESSION, "결제완료", "홍길동", "010-1234-5678", "서울시 강남구 테헤란로 123", "4층 401호", 18000, 3000, 21000);
  db.prepare(
    "INSERT INTO order_items (id, order_id, sku_id, product_name, option_summary, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(uuidv4(), orderId2, "demo-sku-3", "데일리 멀티비타민", "오렌지 / 30정", 18000, 1, 18000);
  // payment tx
  db.prepare(
    "INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-1 days'))"
  ).run(uuidv4(), walletId, WALLET_TX_TYPE.PAYMENT, 21000, 46000, "주문 결제", orderId2);

  // Demo order 3: 취소완료
  const orderId3 = uuidv4();
  db.prepare(
    `INSERT INTO orders (id, order_number, session_id, status, recipient_name, recipient_phone, address_line1, address_line2, product_total, shipping_fee, total_amount, created_at, cancelled_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-3 days'), datetime('now', '-2 days'))`
  ).run(orderId3, "ORD-260611-GHI789", DEMO_SESSION, "취소완료", "홍길동", "010-1234-5678", "서울시 강남구 테헤란로 123", "4층 401호", 25000, 3000, 28000);
  db.prepare(
    "INSERT INTO order_items (id, order_id, sku_id, product_name, option_summary, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(uuidv4(), orderId3, "demo-sku-4", "장건강 프로바이오틱스", "19종 복합 / 1개월분", 25000, 1, 25000);
  // payment + refund txs
  db.prepare(
    "INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-3 days'))"
  ).run(uuidv4(), walletId, WALLET_TX_TYPE.PAYMENT, 28000, 39000, "주문 결제", orderId3);
  db.prepare(
    "INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 days'))"
  ).run(uuidv4(), walletId, WALLET_TX_TYPE.REFUND, 28000, 67000, "주문 취소 환불", orderId3);

  // Update final wallet balance to match transactions: 100000 - 33000 - 21000 = 46000
  // (The cancelled order was refunded, so: 100000 - 33000 - 28000 + 28000 - 21000 = 46000)
  db.prepare("UPDATE wallets SET balance = 46000 WHERE id = ?").run(walletId);
}
