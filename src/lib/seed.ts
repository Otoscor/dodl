import type Database from "better-sqlite3";
import { v5 as uuidv5 } from "uuid";
import { INITIAL_WALLET_BALANCE, WALLET_TX_TYPE, ORDER_STATUS } from "./constants";

const DEMO_SESSION = "demo-session-001";
const NS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"; // DNS namespace
let _seedCounter = 0;
/** 결정론적 UUID — 같은 시드 순서면 항상 같은 ID */
function deterministicId(label?: string): string {
  _seedCounter++;
  return uuidv5(label ?? `seed-${_seedCounter}`, NS);
}

export function seedDatabase(db: Database.Database) {
  const existing = db.prepare("SELECT COUNT(*) as cnt FROM categories").get() as { cnt: number };
  if (existing.cnt > 0) return;
  _seedCounter = 0;

  // --- Categories ---
  const categories = [
    { id: deterministicId(), name: "비타민", slug: "vitamin", image_url: "/categories/vitamin.svg", sort_order: 1 },
    { id: deterministicId(), name: "프로바이오틱스", slug: "probiotics", image_url: "/categories/probiotics.svg", sort_order: 2 },
    { id: deterministicId(), name: "오메가3", slug: "omega3", image_url: "/categories/omega3.svg", sort_order: 3 },
    { id: deterministicId(), name: "미네랄", slug: "mineral", image_url: "/categories/mineral.svg", sort_order: 4 },
    { id: deterministicId(), name: "콜라겐", slug: "collagen", image_url: "/categories/collagen.svg", sort_order: 5 },
    { id: deterministicId(), name: "어린이", slug: "kids", image_url: "/categories/kids.svg", sort_order: 6 },
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
    "INSERT INTO products (id, category_id, name, description, image_url, base_price, detail_info) VALUES (?, ?, ?, ?, ?, ?, ?)"
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
    skuDefs: { optionKeys: string[]; price: number; stock: number; code: string }[],
    detailInfo?: Record<string, unknown>
  ) {
    const pid = deterministicId();
    insertProduct.run(pid, catMap[catSlug], name, desc, imgUrl, basePrice, JSON.stringify(detailInfo ?? {}));

    const ovMap: Record<string, string> = {};

    for (let gi = 0; gi < options.length; gi++) {
      const g = options[gi];
      const gid = deterministicId();
      insertOptionGroup.run(gid, pid, g.groupName, gi + 1);
      for (let vi = 0; vi < g.values.length; vi++) {
        const vid = deterministicId();
        insertOptionValue.run(vid, gid, g.values[vi], vi + 1);
        ovMap[g.values[vi]] = vid;
      }
    }

    for (const s of skuDefs) {
      const sid = deterministicId();
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
  const pidMultivitamin = createProduct("vitamin", "데일리 멀티비타민", "하루 한 알로 필수 비타민 13종을 채우세요. 무향료, 무색소로 온 가족이 안심하고 섭취할 수 있습니다.", 18000, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=533&fit=crop",
    [
      { groupName: "맛", values: ["오렌지", "포도"] },
      { groupName: "용량", values: ["30정", "60정"] },
    ],
    [
      { optionKeys: ["오렌지", "30정"], price: 18000, stock: 50, code: "VIT-MV-OR30" },
      { optionKeys: ["오렌지", "60정"], price: 32000, stock: 30, code: "VIT-MV-OR60" },
      { optionKeys: ["포도", "30정"], price: 18000, stock: 3, code: "VIT-MV-GR30" },
      { optionKeys: ["포도", "60정"], price: 32000, stock: 0, code: "VIT-MV-GR60" },
    ],
    { shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송)", keySpecs: ["비타민 13종 복합", "무향료·무색소", "건강기능식품 인증", "1일 1정"], dosage: "1일 1회, 1회 1정을 물과 함께 식후에 섭취하세요.", caution: "특정 성분에 알레르기가 있는 분은 성분을 확인 후 섭취하세요. 임산부 및 수유부는 전문가와 상담 후 섭취하세요.", manufacturer: "제조사: (주)헬스케어랩 | 원산지: 대한민국 | 유통기한: 제조일로부터 24개월" }
  );

  // 2. 비타민C 1000 (단일 옵션: 용량)
  const pidVitaminC = createProduct("vitamin", "고함량 비타민C 1000", "영국산 비타민C 1000mg, 항산화 및 면역력 강화에 도움을 줍니다.", 15000, "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=533&fit=crop",
    [{ groupName: "용량", values: ["60정", "120정", "180정"] }],
    [
      { optionKeys: ["60정"], price: 15000, stock: 80, code: "VIT-C-60" },
      { optionKeys: ["120정"], price: 27000, stock: 45, code: "VIT-C-120" },
      { optionKeys: ["180정"], price: 38000, stock: 2, code: "VIT-C-180" },
    ],
    { shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송)", keySpecs: ["비타민C 1000mg 고함량", "영국산 원료", "항산화 기능성 인증", "정제 타입"], dosage: "1일 1회, 1회 1정을 물과 함께 섭취하세요. 공복 시 속쓰림이 있을 수 있으니 식후 섭취를 권장합니다.", caution: "위장이 민감한 분은 식후에 섭취하세요. 과다 섭취 시 복통이나 설사가 발생할 수 있습니다.", manufacturer: "제조사: (주)헬스케어랩 | 원산지: 영국(원료), 대한민국(제조) | 유통기한: 제조일로부터 24개월" }
  );

  // 3. 비타민D3 (옵션 없음)
  const pidVitaminD = createProduct("vitamin", "햇빛 비타민D3 2000IU", "실내 생활이 많은 현대인을 위한 비타민D3. 뼈 건강과 면역 기능에 필수적입니다.", 12000, "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=533&fit=crop",
    [],
    [{ optionKeys: [], price: 12000, stock: 100, code: "VIT-D3-2000" }],
    { shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송)", keySpecs: ["비타민D3 2000IU", "소프트캡슐", "뼈 건강 기능성 인증", "3개월분"], dosage: "1일 1회, 1회 1캡슐을 식사 중 또는 식후에 섭취하세요.", caution: "비타민D를 과다 섭취하면 고칼슘혈증이 발생할 수 있습니다. 1일 섭취량을 지켜주세요.", manufacturer: "제조사: (주)헬스케어랩 | 원산지: 대한민국 | 유통기한: 제조일로부터 24개월" }
  );

  // 4. 프로바이오틱스 (조합형: 균주×용량) → 4 SKU
  const pidProbiotics = createProduct("probiotics", "장건강 프로바이오틱스", "19종 복합 유산균 100억 CFU. 장까지 살아서 도달하는 특허 코팅 기술 적용.", 25000, "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=533&fit=crop",
    [
      { groupName: "균주", values: ["19종 복합", "김치유산균"] },
      { groupName: "기간", values: ["1개월분", "3개월분"] },
    ],
    [
      { optionKeys: ["19종 복합", "1개월분"], price: 25000, stock: 60, code: "PRO-19-1M" },
      { optionKeys: ["19종 복합", "3개월분"], price: 65000, stock: 20, code: "PRO-19-3M" },
      { optionKeys: ["김치유산균", "1개월분"], price: 28000, stock: 40, code: "PRO-KM-1M" },
      { optionKeys: ["김치유산균", "3개월분"], price: 72000, stock: 0, code: "PRO-KM-3M" },
    ],
    { shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송)", keySpecs: ["19종 복합 유산균", "100억 CFU 보장", "특허 코팅 기술", "냉장 보관 불필요"], dosage: "1일 1회, 1회 1캡슐을 식전 또는 취침 전에 섭취하세요.", caution: "유제품 알레르기가 있는 분은 주의하세요. 항생제와 함께 섭취 시 효과가 감소할 수 있습니다.", manufacturer: "제조사: (주)헬스케어랩 | 원산지: 대한민국 | 유통기한: 제조일로부터 18개월" }
  );

  // 5. 어린이 프로바이오틱스 (단일: 맛)
  createProduct("probiotics", "키즈 유산균 츄어블", "아이들이 좋아하는 맛으로 만든 츄어블 유산균. 방부제 무첨가.", 19000, "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=533&fit=crop",
    [{ groupName: "맛", values: ["딸기", "바나나"] }],
    [
      { optionKeys: ["딸기"], price: 19000, stock: 35, code: "PRO-KD-ST" },
      { optionKeys: ["바나나"], price: 19000, stock: 4, code: "PRO-KD-BN" },
    ],
    { shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송)", keySpecs: ["츄어블 타입", "방부제 무첨가", "유산균 50억 CFU", "어린이 맞춤 설계"], dosage: "1일 1회, 1회 1정을 씹어서 섭취하세요. 만 3세 이상부터 섭취 가능합니다.", caution: "알레르기 체질인 경우 성분을 확인하세요. 만 3세 미만의 영유아는 섭취하지 마세요.", manufacturer: "제조사: (주)헬스케어랩 | 원산지: 대한민국 | 유통기한: 제조일로부터 18개월" }
  );

  // 6. 알티지 오메가3 (단일: 용량)
  const pidOmega3 = createProduct("omega3", "알티지 오메가3", "초임계 추출 rTG 오메가3. EPA+DHA 고함량으로 혈행 건강에 도움.", 35000, "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=400&h=533&fit=crop",
    [{ groupName: "용량", values: ["60캡슐", "120캡슐"] }],
    [
      { optionKeys: ["60캡슐"], price: 35000, stock: 55, code: "OMG-RTG-60" },
      { optionKeys: ["120캡슐"], price: 62000, stock: 25, code: "OMG-RTG-120" },
    ],
    { shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송)", keySpecs: ["rTG 오메가3", "EPA 600mg + DHA 400mg", "초임계 추출 공법", "소프트캡슐"], dosage: "1일 1회, 1회 1캡슐을 식후에 물과 함께 섭취하세요.", caution: "수술 예정인 분은 2주 전부터 섭취를 중단하세요. 혈액응고 관련 약물 복용 시 전문가와 상담하세요.", manufacturer: "제조사: (주)헬스케어랩 | 원산지: 노르웨이(원료), 대한민국(제조) | 유통기한: 제조일로부터 24개월" }
  );

  // 7. 식물성 오메가3 (옵션 없음)
  createProduct("omega3", "식물성 오메가3 DHA", "미세조류 유래 식물성 DHA. 비건 인증, 중금속 걱정 없는 깨끗한 오메가3.", 29000, "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=533&fit=crop",
    [],
    [{ optionKeys: [], price: 29000, stock: 70, code: "OMG-VG-DHA" }],
    { shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송)", keySpecs: ["미세조류 유래 DHA", "비건 인증", "중금속 無검출", "식물성 캡슐"], dosage: "1일 1회, 1회 2캡슐을 식후에 물과 함께 섭취하세요.", caution: "해조류 알레르기가 있는 분은 섭취하지 마세요.", manufacturer: "제조사: (주)헬스케어랩 | 원산지: 미국(원료), 대한민국(제조) | 유통기한: 제조일로부터 24개월" }
  );

  // 8. 마그네슘 (단일: 타입)
  createProduct("mineral", "프리미엄 마그네슘", "산화마그네슘 대비 흡수율 높은 킬레이트 마그네슘. 근육 이완과 숙면에 도움.", 16000, "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=533&fit=crop",
    [{ groupName: "타입", values: ["킬레이트", "구연산"] }],
    [
      { optionKeys: ["킬레이트"], price: 16000, stock: 90, code: "MIN-MG-CH" },
      { optionKeys: ["구연산"], price: 14000, stock: 85, code: "MIN-MG-CT" },
    ],
    { shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송)", keySpecs: ["킬레이트/구연산 마그네슘", "높은 흡수율", "근육·신경 기능 지원", "90정 (3개월분)"], dosage: "1일 1회, 1회 1정을 취침 전에 물과 함께 섭취하세요.", caution: "신장 질환이 있는 분은 전문가와 상담 후 섭취하세요. 설사가 발생할 경우 섭취량을 줄여주세요.", manufacturer: "제조사: (주)헬스케어랩 | 원산지: 대한민국 | 유통기한: 제조일로부터 24개월" }
  );

  // 9. 아연+셀레늄 (옵션 없음)
  createProduct("mineral", "아연 + 셀레늄", "남성 건강에 필수적인 아연과 셀레늄을 한 알에. 면역력과 항산화에 도움.", 13000, "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=533&fit=crop",
    [],
    [{ optionKeys: [], price: 13000, stock: 65, code: "MIN-ZN-SE" }],
    { shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송)", keySpecs: ["아연 12mg + 셀레늄 50μg", "면역 기능 강화", "항산화 기능", "60정 (2개월분)"], dosage: "1일 1회, 1회 1정을 식후에 물과 함께 섭취하세요.", caution: "구리 흡수를 방해할 수 있으므로 장기 복용 시 전문가와 상담하세요.", manufacturer: "제조사: (주)헬스케어랩 | 원산지: 대한민국 | 유통기한: 제조일로부터 24개월" }
  );

  // 10. 저분자 콜라겐 (조합형: 타입×용량) → 4 SKU — 전 SKU 품절
  createProduct("collagen", "저분자 피쉬 콜라겐", "분자량 500Da 이하 초저분자 콜라겐. 피부 탄력과 보습에 도움.", 28000, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=533&fit=crop",
    [
      { groupName: "타입", values: ["분말", "정제"] },
      { groupName: "용량", values: ["30일분", "60일분"] },
    ],
    [
      { optionKeys: ["분말", "30일분"], price: 28000, stock: 0, code: "COL-PW-30" },
      { optionKeys: ["분말", "60일분"], price: 50000, stock: 0, code: "COL-PW-60" },
      { optionKeys: ["정제", "30일분"], price: 32000, stock: 0, code: "COL-TB-30" },
      { optionKeys: ["정제", "60일분"], price: 56000, stock: 0, code: "COL-TB-60" },
    ],
    { shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송)", keySpecs: ["초저분자 500Da 이하", "피쉬 콜라겐 펩타이드", "피부 보습·탄력 기능성 인증", "분말/정제 선택 가능"], dosage: "1일 1회, 분말은 1포를 물이나 음료에 타서, 정제는 2정을 물과 함께 섭취하세요.", caution: "어류 알레르기가 있는 분은 섭취하지 마세요.", manufacturer: "제조사: (주)헬스케어랩 | 원산지: 프랑스(원료), 대한민국(제조) | 유통기한: 제조일로부터 24개월" }
  );

  // 11. 콜라겐 젤리스틱 (단일: 맛)
  createProduct("collagen", "콜라겐 젤리스틱", "간편하게 먹는 석류맛 콜라겐 젤리. 휴대가 편리한 스틱 포장.", 22000, "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=533&fit=crop",
    [{ groupName: "맛", values: ["석류", "블루베리", "레몬"] }],
    [
      { optionKeys: ["석류"], price: 22000, stock: 40, code: "COL-JL-PM" },
      { optionKeys: ["블루베리"], price: 22000, stock: 1, code: "COL-JL-BB" },
      { optionKeys: ["레몬"], price: 22000, stock: 30, code: "COL-JL-LM" },
    ],
    { shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송)", keySpecs: ["콜라겐 1000mg/포", "젤리 스틱 타입", "석류/블루베리/레몬 3종", "휴대 간편 개별포장"], dosage: "1일 1회, 1포를 그대로 섭취하세요. 냉장 보관 시 더 맛있게 드실 수 있습니다.", caution: "젤라틴 알레르기가 있는 분은 섭취하지 마세요. 어린이가 섭취 시 목에 걸리지 않도록 주의하세요.", manufacturer: "제조사: (주)헬스케어랩 | 원산지: 대한민국 | 유통기한: 제조일로부터 12개월" }
  );

  // 12. 어린이 멀티비타민 (단일: 맛)
  createProduct("kids", "어린이 종합비타민 젤리", "곰돌이 모양 젤리로 아이들이 즐겁게 먹는 종합비타민. 13종 비타민+미네랄.", 20000, "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=400&h=533&fit=crop",
    [{ groupName: "맛", values: ["오렌지", "딸기"] }],
    [
      { optionKeys: ["오렌지"], price: 20000, stock: 45, code: "KID-MV-OR" },
      { optionKeys: ["딸기"], price: 20000, stock: 50, code: "KID-MV-ST" },
    ],
    { shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송)", keySpecs: ["비타민 13종 + 미네랄", "곰돌이 모양 젤리", "인공색소 무첨가", "만 3세 이상"], dosage: "만 3~5세: 1일 1회 1정, 만 6세 이상: 1일 1회 2정을 씹어서 섭취하세요.", caution: "만 3세 미만은 섭취하지 마세요. 한 번에 여러 개를 입에 넣지 않도록 보호자 지도 하에 섭취하세요.", manufacturer: "제조사: (주)헬스케어랩 | 원산지: 대한민국 | 유통기한: 제조일로부터 18개월" }
  );

  // 13. 어린이 칼슘 (옵션 없음)
  createProduct("kids", "성장기 칼슘 + 비타민D", "뼈 건강에 필수인 칼슘과 비타민D를 한번에. 성장기 어린이에게 추천.", 17000, "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=533&fit=crop&q=80",
    [],
    [{ optionKeys: [], price: 17000, stock: 55, code: "KID-CA-VD" }],
    { shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송)", keySpecs: ["칼슘 500mg + 비타민D 400IU", "성장기 맞춤 배합", "츄어블 타입", "60정 (2개월분)"], dosage: "1일 1회, 1회 1정을 씹어서 섭취하세요. 만 4세 이상부터 섭취 가능합니다.", caution: "만 4세 미만은 섭취하지 마세요. 신장 질환이 있는 어린이는 전문가와 상담 후 섭취하세요.", manufacturer: "제조사: (주)헬스케어랩 | 원산지: 대한민국 | 유통기한: 제조일로부터 24개월" }
  );

  // --- Reviews ---
  const insertReview = db.prepare(
    `INSERT INTO reviews (id, product_id, session_id, author_name, rating, body, photo_urls, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ? || ' days'))`
  );

  const reviewSeeds = [
    { pid: pidMultivitamin, items: [
      { name: "김지연", rating: 5, body: "하루 한 알 챙겨 먹기 딱 좋아요. 오렌지 맛이라 거부감 없어요.", photos: ["/reviews/r1.jpg", "/reviews/r2.jpg"], daysAgo: 3 },
      { name: "박성호", rating: 4, body: "비타민 13종 가성비 최고. 60정 두 달치라 경제적이에요.", photos: [], daysAgo: 7 },
      { name: "이현정", rating: 5, body: "무향료 무색소라 믿고 먹을 수 있어요. 피부 톤도 올라왔어요.", photos: [], daysAgo: 14 },
    ]},
    { pid: pidVitaminC, items: [
      { name: "최민준", rating: 5, body: "1000mg인데 속 쓰림 없이 잘 먹혀요. 감기 기운에 효과 봤어요.", photos: ["/reviews/r3.jpg"], daysAgo: 2 },
      { name: "정수아", rating: 4, body: "영국산 원료라 믿음이 가요. 매일 아침 챙겨 먹고 있어요.", photos: [], daysAgo: 10 },
      { name: "오지은", rating: 3, body: "효과는 있는데 알약이 좀 커서 삼키기 불편해요.", photos: [], daysAgo: 25 },
    ]},
    { pid: pidVitaminD, items: [
      { name: "강태훈", rating: 5, body: "실내 직장인에게 필수품. 혈액검사에서 비타민D 수치 올랐습니다.", photos: [], daysAgo: 5 },
      { name: "임소연", rating: 4, body: "2000IU라 과잉 걱정 없어요. 가격도 합리적이에요.", photos: [], daysAgo: 18 },
      { name: "신재원", rating: 5, body: "겨울 내내 먹었더니 감기 한 번도 안 걸렸어요.", photos: [], daysAgo: 30 },
    ]},
    { pid: pidProbiotics, items: [
      { name: "조현우", rating: 5, body: "장까지 살아서 도달하는 게 느껴질 정도로 소화가 편해졌어요.", photos: [], daysAgo: 4 },
      { name: "배지영", rating: 4, body: "변비가 개선됐습니다. 꾸준히 먹을 예정이에요.", photos: [], daysAgo: 12 },
      { name: "윤민석", rating: 5, body: "3개월분 구매했는데 계속 재구매할 것 같아요.", photos: [], daysAgo: 22 },
    ]},
    { pid: pidOmega3, items: [
      { name: "홍성민", rating: 5, body: "rTG 오메가3 중 가성비 최고. 비린내도 전혀 없어요.", photos: ["/reviews/r4.jpg", "/reviews/r5.jpg"], daysAgo: 6 },
      { name: "서유진", rating: 5, body: "혈액검사 결과 중성지방이 줄었어요. 꾸준히 먹은 보람이 있네요.", photos: [], daysAgo: 15 },
      { name: "권태수", rating: 4, body: "고함량 EPA+DHA 제품 중 이게 제일 잘 맞아요.", photos: [], daysAgo: 28 },
    ]},
  ];

  for (const { pid, items } of reviewSeeds) {
    for (const r of items) {
      insertReview.run(deterministicId(), pid, `seed-${deterministicId()}`, r.name, r.rating, r.body, JSON.stringify(r.photos ?? []), `-${r.daysAgo}`);
    }
  }

  // --- Banners ---
  const insertBanner = db.prepare(
    "INSERT INTO banners (id, title, subtitle, image_url, link_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
  );
  insertBanner.run(deterministicId(), "여름 건강 챙기기", "인기 비타민 최대 30% 할인", "/banners/summer.jpg", "/products?category=vitamin", 1);
  insertBanner.run(deterministicId(), "프로바이오틱스 기획전", "장 건강의 시작, 유산균", "/banners/probiotics.jpg", "/products?category=probiotics", 2);
  insertBanner.run(deterministicId(), "우리 아이 영양제", "성장기 필수 영양소 모음", "/banners/kids.jpg", "/products?category=kids", 3);

  // --- Demo wallet + orders for demo session ---
  const walletId = deterministicId();
  const DEMO_GRANT = 1000000;
  db.prepare("INSERT INTO wallets (id, session_id, balance) VALUES (?, ?, ?)").run(walletId, DEMO_SESSION, DEMO_GRANT);
  db.prepare(
    "INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(deterministicId(), walletId, WALLET_TX_TYPE.GRANT, DEMO_GRANT, DEMO_GRANT, "가상 지갑 초기 부여");

  // --- 주문 생성 헬퍼 ---
  const insertOrder = db.prepare(
    `INSERT INTO orders (id, order_number, session_id, status, recipient_name, recipient_phone, address_line1, address_line2, product_total, shipping_fee, total_amount, payment_method, expected_delivery_date, created_at, cancelled_at, return_reason, return_note, returned_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ? || ' days'), ?, ?, ?, ?)`
  );
  const insertOrderItem = db.prepare(
    "INSERT INTO order_items (id, order_id, sku_id, product_name, option_summary, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const insertWalletTx = db.prepare(
    "INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ? || ' days'))"
  );

  let orderNum = 0;
  function makeOrderNumber(daysAgo: number) {
    orderNum++;
    const d = new Date(); d.setDate(d.getDate() - daysAgo);
    const ds = d.getFullYear().toString().slice(2) + String(d.getMonth()+1).padStart(2,"0") + String(d.getDate()).padStart(2,"0");
    return `ORD-${ds}-${String(orderNum).padStart(3,"0")}`;
  }

  interface DemoOrder {
    status: string;
    daysAgo: number;
    recipient: string;
    phone: string;
    addr1: string;
    addr2: string;
    items: { name: string; option: string; price: number; qty: number }[];
    cancelledDaysAgo?: number;
    returnReason?: string;
    returnNote?: string;
    returnedDaysAgo?: number;
  }

  function seedOrder(o: DemoOrder) {
    const oid = deterministicId();
    const productTotal = o.items.reduce((s, i) => s + i.price * i.qty, 0);
    const shippingFee = productTotal >= 30000 ? 0 : 3000;
    const total = productTotal + shippingFee;

    // expected_delivery_date = order date + 3 days
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - o.daysAgo + 3);
    const expectedDeliveryDate = expectedDate.toISOString().slice(0, 10);

    insertOrder.run(
      oid, makeOrderNumber(o.daysAgo), DEMO_SESSION, o.status,
      o.recipient, o.phone, o.addr1, o.addr2,
      productTotal, shippingFee, total,
      "가상지갑", expectedDeliveryDate,
      `-${o.daysAgo}`,
      o.cancelledDaysAgo ? `datetime('now', '-${o.cancelledDaysAgo} days')` : null,
      o.returnReason ?? null,
      o.returnNote ?? "",
      o.returnedDaysAgo ? `datetime('now', '-${o.returnedDaysAgo} days')` : null,
    );
    // cancelled_at / returned_at 은 SQL 함수로 넣어야 하므로 별도 UPDATE
    if (o.cancelledDaysAgo) {
      db.prepare("UPDATE orders SET cancelled_at = datetime('now', ? || ' days') WHERE id = ?").run(`-${o.cancelledDaysAgo}`, oid);
    }
    if (o.returnedDaysAgo) {
      db.prepare("UPDATE orders SET returned_at = datetime('now', ? || ' days') WHERE id = ?").run(`-${o.returnedDaysAgo}`, oid);
    }

    for (const item of o.items) {
      insertOrderItem.run(deterministicId(), oid, `demo-sku-${deterministicId().slice(0,4)}`, item.name, item.option, item.price, item.qty, item.price * item.qty);
    }

    // 결제 트랜잭션
    insertWalletTx.run(deterministicId(), walletId, WALLET_TX_TYPE.PAYMENT, total, 0, "주문 결제", oid, `-${o.daysAgo}`);

    // 취소/반품 환불 트랜잭션
    if (o.status === ORDER_STATUS.CANCELLED && o.cancelledDaysAgo) {
      insertWalletTx.run(deterministicId(), walletId, WALLET_TX_TYPE.REFUND, total, 0, "주문 취소 환불", oid, `-${o.cancelledDaysAgo}`);
    }
    if (o.status === ORDER_STATUS.RETURN_COMPLETED && o.returnedDaysAgo) {
      insertWalletTx.run(deterministicId(), walletId, WALLET_TX_TYPE.REFUND, total, 0, "반품 환불", oid, `-${o.returnedDaysAgo}`);
    }
    return total;
  }

  const addr = { recipient: "홍길동", phone: "010-1234-5678", addr1: "서울시 강남구 테헤란로 123", addr2: "4층 401호" };
  const addr2 = { recipient: "김민수", phone: "010-9876-5432", addr1: "서울시 마포구 월드컵북로 21", addr2: "302호" };
  const addr3 = { recipient: "이서연", phone: "010-5555-1234", addr1: "경기도 성남시 분당구 판교역로 166", addr2: "A동 1201호" };

  let totalSpent = 0;
  let totalRefunded = 0;

  // ===== 결제완료 (3건) =====
  const paidOrders: DemoOrder[] = [
    { ...addr, status: ORDER_STATUS.PAID, daysAgo: 0, items: [
      { name: "데일리 멀티비타민", option: "오렌지 / 30정", price: 18000, qty: 1 },
    ]},
    { ...addr2, status: ORDER_STATUS.PAID, daysAgo: 0, items: [
      { name: "고함량 비타민C 1000", option: "120정", price: 27000, qty: 2 },
    ]},
    { ...addr, status: ORDER_STATUS.PAID, daysAgo: 1, items: [
      { name: "장건강 프로바이오틱스", option: "19종 복합 / 1개월분", price: 25000, qty: 1 },
      { name: "아연 + 셀레늄", option: "", price: 13000, qty: 1 },
    ]},
  ];

  // ===== 배송준비 (3건) =====
  const preparingOrders: DemoOrder[] = [
    { ...addr, status: ORDER_STATUS.PREPARING, daysAgo: 1, items: [
      { name: "알티지 오메가3", option: "120캡슐", price: 62000, qty: 1 },
    ]},
    { ...addr3, status: ORDER_STATUS.PREPARING, daysAgo: 2, items: [
      { name: "프리미엄 마그네슘", option: "킬레이트", price: 16000, qty: 2 },
    ]},
    { ...addr2, status: ORDER_STATUS.PREPARING, daysAgo: 2, items: [
      { name: "키즈 유산균 츄어블", option: "딸기", price: 19000, qty: 1 },
      { name: "어린이 종합비타민 젤리", option: "딸기", price: 20000, qty: 1 },
    ]},
  ];

  // ===== 배송중 (3건) =====
  const shippingOrders: DemoOrder[] = [
    { ...addr, status: ORDER_STATUS.SHIPPING, daysAgo: 3, items: [
      { name: "햇빛 비타민D3 2000IU", option: "", price: 12000, qty: 3 },
    ]},
    { ...addr2, status: ORDER_STATUS.SHIPPING, daysAgo: 4, items: [
      { name: "식물성 오메가3 DHA", option: "", price: 29000, qty: 1 },
      { name: "프리미엄 마그네슘", option: "구연산", price: 14000, qty: 1 },
    ]},
    { ...addr3, status: ORDER_STATUS.SHIPPING, daysAgo: 5, items: [
      { name: "콜라겐 젤리스틱", option: "석류", price: 22000, qty: 2 },
    ]},
  ];

  // ===== 배송완료 (4건) =====
  const deliveredOrders: DemoOrder[] = [
    { ...addr, status: ORDER_STATUS.DELIVERED, daysAgo: 7, items: [
      { name: "고함량 비타민C 1000", option: "120정", price: 27000, qty: 1 },
      { name: "아연 + 셀레늄", option: "", price: 13000, qty: 1 },
    ]},
    { ...addr2, status: ORDER_STATUS.DELIVERED, daysAgo: 10, items: [
      { name: "알티지 오메가3", option: "60캡슐", price: 35000, qty: 1 },
    ]},
    { ...addr3, status: ORDER_STATUS.DELIVERED, daysAgo: 12, items: [
      { name: "장건강 프로바이오틱스", option: "김치유산균 / 1개월분", price: 28000, qty: 1 },
      { name: "데일리 멀티비타민", option: "포도 / 60정", price: 32000, qty: 1 },
    ]},
    { ...addr, status: ORDER_STATUS.DELIVERED, daysAgo: 14, items: [
      { name: "성장기 칼슘 + 비타민D", option: "", price: 17000, qty: 2 },
    ]},
  ];

  // ===== 취소완료 (2건) =====
  const cancelledOrders: DemoOrder[] = [
    { ...addr, status: ORDER_STATUS.CANCELLED, daysAgo: 5, cancelledDaysAgo: 4, items: [
      { name: "장건강 프로바이오틱스", option: "19종 복합 / 3개월분", price: 65000, qty: 1 },
    ]},
    { ...addr2, status: ORDER_STATUS.CANCELLED, daysAgo: 8, cancelledDaysAgo: 7, items: [
      { name: "키즈 유산균 츄어블", option: "바나나", price: 19000, qty: 1 },
    ]},
  ];

  // ===== 반품완료 (3건) =====
  const returnOrders: DemoOrder[] = [
    { ...addr, status: ORDER_STATUS.RETURN_COMPLETED, daysAgo: 20, returnedDaysAgo: 16, returnReason: "상품 불량", returnNote: "캡슐이 일부 깨져있었습니다.", items: [
      { name: "알티지 오메가3", option: "60캡슐", price: 35000, qty: 1 },
    ]},
    { ...addr3, status: ORDER_STATUS.RETURN_COMPLETED, daysAgo: 18, returnedDaysAgo: 15, returnReason: "단순 변심", returnNote: "", items: [
      { name: "고함량 비타민C 1000", option: "180정", price: 38000, qty: 1 },
    ]},
    { ...addr2, status: ORDER_STATUS.RETURN_COMPLETED, daysAgo: 25, returnedDaysAgo: 22, returnReason: "배송 중 파손", returnNote: "박스가 찌그러져서 제품이 손상되었어요.", items: [
      { name: "데일리 멀티비타민", option: "오렌지 / 60정", price: 32000, qty: 1 },
      { name: "햇빛 비타민D3 2000IU", option: "", price: 12000, qty: 1 },
    ]},
  ];

  // ===== 교환완료 (2건) =====
  const exchangeOrders: DemoOrder[] = [
    { ...addr, status: ORDER_STATUS.EXCHANGE_COMPLETED, daysAgo: 15, returnedDaysAgo: 13, returnReason: "오배송 (다른 상품 수령)", returnNote: "포도맛을 주문했는데 오렌지맛이 왔습니다.", items: [
      { name: "데일리 멀티비타민", option: "포도 / 30정", price: 18000, qty: 1 },
    ]},
    { ...addr3, status: ORDER_STATUS.EXCHANGE_COMPLETED, daysAgo: 22, returnedDaysAgo: 19, returnReason: "상품이 설명과 다름", returnNote: "용량이 표기와 달랐습니다.", items: [
      { name: "식물성 오메가3 DHA", option: "", price: 29000, qty: 1 },
    ]},
  ];

  const allOrders = [
    ...paidOrders, ...preparingOrders, ...shippingOrders,
    ...deliveredOrders, ...cancelledOrders, ...returnOrders, ...exchangeOrders,
  ];

  for (const o of allOrders) {
    const spent = seedOrder(o);
    totalSpent += spent;
    if (o.status === ORDER_STATUS.CANCELLED || o.status === ORDER_STATUS.RETURN_COMPLETED) {
      totalRefunded += spent;
    }
  }

  // 최종 지갑 잔액 = 초기 - 총지출 + 총환불
  const finalBalance = DEMO_GRANT - totalSpent + totalRefunded;
  db.prepare("UPDATE wallets SET balance = ? WHERE id = ?").run(finalBalance, walletId);

  // --- Cart items (데모용) ---
  const cartSkus = db.prepare(
    `SELECT s.id FROM skus s
     JOIN products p ON s.product_id = p.id
     WHERE s.stock > 0
     ORDER BY p.created_at
     LIMIT 3`
  ).all() as { id: string }[];

  const insertCartItem = db.prepare(
    "INSERT OR IGNORE INTO cart_items (id, session_id, sku_id, quantity) VALUES (?, ?, ?, ?)"
  );
  const cartQuantities = [2, 1, 1];
  for (let i = 0; i < cartSkus.length; i++) {
    insertCartItem.run(deterministicId(), DEMO_SESSION, cartSkus[i].id, cartQuantities[i]);
  }
}
