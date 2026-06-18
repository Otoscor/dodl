import type Database from "better-sqlite3";
import { v5 as uuidv5 } from "uuid";
import { WALLET_TX_TYPE, ORDER_STATUS } from "./constants";

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
    { id: deterministicId(), name: "드링크", slug: "drink", image_url: "/categories/drink.svg", sort_order: 1 },
    { id: deterministicId(), name: "쉐이크", slug: "shake", image_url: "/categories/shake.svg", sort_order: 2 },
    { id: deterministicId(), name: "저당", slug: "lowsugar", image_url: "/categories/lowsugar.svg", sort_order: 3 },
    { id: deterministicId(), name: "비건", slug: "vegan", image_url: "/categories/vegan.svg", sort_order: 4 },
    { id: deterministicId(), name: "어린이", slug: "kids", image_url: "/categories/kids.svg", sort_order: 5 },
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

  // === 지표등급표 / 첨가물 알아보기 (임의 데이터) ===
  // 5종 고정 지표: 다이어트·혈당·근육·면역·장건강. ig("B","B","C","A","B") 형태로 등급 5개 전달.
  const GRADE_STATUS: Record<string, string> = { A: "적극 권장", B: "권장", C: "주의", D: "권장 안 함", E: "비권장" };
  const IG_METRICS = ["다이어트", "혈당", "근육", "면역", "장건강"];
  function ig(...grades: ("A" | "B" | "C" | "D" | "E")[]) {
    return IG_METRICS.map((metric, i) => ({ metric, grade: grades[i], status: GRADE_STATUS[grades[i]] }));
  }

  // === 단백질 음료 카탈로그 (제품 누끼 이미지 연동, public/products/{slug}.png) ===
  // 모두 단일 SKU(옵션 없음) 즉석 음용/파우치 제품.
  type Grade = "A" | "B" | "C" | "D" | "E";
  const PROTEIN: {
    slug: string; cat: string; name: string; brand: string; desc: string;
    price: number; stock: number; kcal: number; protein: number; sugar: number; fat: number;
    specs: string[]; grades: [Grade, Grade, Grade, Grade, Grade];
  }[] = [
    { slug: "hymune-drink-balance", cat: "drink", name: "하이뮨 마시는 프로틴 밸런스", brand: "일동후디스 하이뮨", desc: "식물성 6:4 균형 단백질을 간편하게 마시는 데일리 프로틴 음료입니다.", price: 2500, stock: 80, kcal: 125, protein: 8, sugar: 5, fat: 2, specs: ["단백질 8g", "식물성 6:4 균형", "125ml"], grades: ["B", "B", "B", "B", "B"] },
    { slug: "hymune-active-choco", cat: "drink", name: "하이뮨 액티브 딥초코", brand: "일동후디스 하이뮨", desc: "진한 딥초코 맛에 단백질 20g, 제로 슈가로 즐기는 액티브 프로틴 드링크.", price: 3200, stock: 90, kcal: 104, protein: 20, sugar: 1, fat: 0, specs: ["단백질 20g", "제로 슈가", "250ml"], grades: ["B", "A", "A", "B", "C"] },
    { slug: "hymune-active-milkshake", cat: "drink", name: "하이뮨 액티브 밀크쉐이크", brand: "일동후디스 하이뮨", desc: "부드러운 밀크쉐이크 맛의 고단백 제로 슈가 음료.", price: 3200, stock: 85, kcal: 110, protein: 20, sugar: 2, fat: 0.5, specs: ["단백질 20g", "제로 슈가", "250ml"], grades: ["B", "A", "A", "B", "C"] },
    { slug: "hymune-active-coffee", cat: "drink", name: "하이뮨 액티브 더블샷 커피", brand: "일동후디스 하이뮨", desc: "더블샷 커피와 단백질 20g을 한 번에. 아침 대용으로 좋은 프로틴 커피.", price: 3200, stock: 75, kcal: 104, protein: 20, sugar: 1, fat: 0, specs: ["단백질 20g", "더블샷 커피", "250ml"], grades: ["B", "A", "A", "B", "C"] },
    { slug: "flymeal-brown", cat: "shake", name: "플라이밀 브라운", brand: "플라이밀", desc: "17곡 미숫가루 베이스의 고단백 쉐이크. 든든한 한 끼 대용으로.", price: 3300, stock: 60, kcal: 166, protein: 20, sugar: 1, fat: 3, specs: ["단백질 20g", "17곡 미숫가루", "고단백 쉐이크"], grades: ["B", "C", "A", "B", "B"] },
    { slug: "flymeal-black", cat: "shake", name: "플라이밀 블랙", brand: "플라이밀", desc: "고소한 흑임자 고단백 쉐이크. 토핑이 씹히는 든든한 식사 대용.", price: 3300, stock: 55, kcal: 160, protein: 22, sugar: 2, fat: 4, specs: ["단백질 22g", "흑임자", "식이섬유 4.5g"], grades: ["B", "C", "A", "B", "B"] },
    { slug: "flymeal-choco", cat: "shake", name: "플라이밀 초코", brand: "플라이밀", desc: "달콤한 초코맛 고단백 쉐이크. 토핑이 씹히는 식사 대용 쉐이크.", price: 3300, stock: 70, kcal: 150, protein: 22, sugar: 3.6, fat: 4, specs: ["단백질 22g", "초코맛", "식이섬유 5.6g"], grades: ["B", "C", "A", "B", "B"] },
    { slug: "flymeal-green", cat: "shake", name: "플라이밀 그린", brand: "플라이밀", desc: "말차·녹차 베이스의 고단백 쉐이크. 식이섬유까지 챙긴 한 끼.", price: 3300, stock: 50, kcal: 156, protein: 21, sugar: 2.8, fat: 4, specs: ["단백질 21g", "말차·녹차", "식이섬유 5.7g"], grades: ["B", "B", "A", "B", "B"] },
    { slug: "flymeal-sweetpotato", cat: "shake", name: "플라이밀 고구마", brand: "플라이밀", desc: "달콤한 고구마맛 고단백 쉐이크. 포만감 좋은 식사 대용.", price: 3300, stock: 45, kcal: 148, protein: 19, sugar: 3.7, fat: 3, specs: ["단백질 19g", "고구마맛", "식이섬유 4.3g"], grades: ["B", "C", "A", "B", "B"] },
    { slug: "flymeal-dolcelatte", cat: "shake", name: "플라이밀 돌체라떼", brand: "플라이밀", desc: "달콤 쌉싸름한 돌체라떼 고단백 쉐이크.", price: 3300, stock: 40, kcal: 150, protein: 20, sugar: 3.6, fat: 3, specs: ["단백질 20g", "돌체라떼", "식이섬유 4.3g"], grades: ["B", "C", "A", "B", "B"] },
    { slug: "takefit-max-choco", cat: "drink", name: "테이크핏 맥스 초코맛", brand: "매일유업 테이크핏", desc: "단백질 24g 고함량, 당류 1g 미만의 100% 완전단백 프로틴 드링크.", price: 3000, stock: 95, kcal: 106, protein: 24, sugar: 1, fat: 0, specs: ["단백질 24g", "SUGAR < 1g", "250ml"], grades: ["A", "A", "A", "B", "C"] },
    { slug: "hymune-active-vegan", cat: "vegan", name: "하이뮨 액티브 비건 단백질", brand: "일동후디스 하이뮨", desc: "아몬드·완두콩·피칸틴 식물성 단백질 20g. 비건 인증 제로 슈가 음료.", price: 3400, stock: 60, kcal: 99, protein: 20, sugar: 1, fat: 1.5, specs: ["식물성 단백질 20g", "비건", "제로 슈가"], grades: ["A", "B", "A", "B", "A"] },
    { slug: "hamsoa-proteinact-choco", cat: "kids", name: "함소아 액션가면 프로틴액트 초코", brand: "함소아", desc: "성장기 어린이를 위한 단백질 30g 초코 음료. L-카르니틴·BCAA 함유.", price: 2800, stock: 50, kcal: 240, protein: 30, sugar: 5, fat: 3, specs: ["단백질 30g", "어린이 단백질", "L-카르니틴 200mg"], grades: ["C", "B", "A", "A", "B"] },
    { slug: "danbaek-14grain", cat: "shake", name: "단백한끼 14곡물", brand: "대상웰라이프 단백한끼", desc: "14가지 곡물과 단백질 17g을 담은 파우치 쉐이크. 93kcal 가벼운 한 끼.", price: 2500, stock: 70, kcal: 93, protein: 17, sugar: 2, fat: 1.5, specs: ["단백질 17g", "14곡물", "93kcal"], grades: ["B", "B", "A", "B", "B"] },
    { slug: "danbaek-blackbean", cat: "shake", name: "단백한끼 검은콩", brand: "대상웰라이프 단백한끼", desc: "검은콩 분말 16%와 단백질 15g의 고소한 파우치 쉐이크.", price: 2500, stock: 65, kcal: 85, protein: 15, sugar: 1.5, fat: 1.5, specs: ["단백질 15g", "검은콩 16%", "85kcal"], grades: ["B", "B", "A", "B", "B"] },
    { slug: "danbaek-chococookie", cat: "shake", name: "단백한끼 초코쿠키", brand: "대상웰라이프 단백한끼", desc: "초코쿠키 맛 단백질 12g 파우치 쉐이크. 72kcal 가벼운 간식.", price: 2500, stock: 60, kcal: 72, protein: 12, sugar: 3, fat: 1.5, specs: ["단백질 12g", "초코쿠키", "72kcal"], grades: ["B", "C", "B", "B", "B"] },
    { slug: "seoulmilk-protein-choco", cat: "drink", name: "서울우유 프로틴 에너지 초코", brand: "서울우유", desc: "단백질 21g과 BCAA·아르기닌을 담은 초코 프로틴 드링크.", price: 2800, stock: 90, kcal: 145, protein: 21, sugar: 5, fat: 2, specs: ["단백질 21g", "BCAA 3500mg", "240ml"], grades: ["B", "C", "A", "B", "C"] },
    { slug: "seoulmilk-protein-coffee", cat: "drink", name: "서울우유 프로틴 에너지 커피", brand: "서울우유", desc: "단백질 21g과 BCAA·아르기닌을 담은 커피 프로틴 드링크.", price: 2800, stock: 85, kcal: 135, protein: 21, sugar: 4, fat: 2, specs: ["단백질 21g", "BCAA 3500mg", "240ml"], grades: ["B", "C", "A", "B", "C"] },
    { slug: "thedanbaek-melon", cat: "lowsugar", name: "더:단백 멜론", brand: "빙그레 더:단백", desc: "달콤한 멜론맛에 단백질 20g, 당류 1g 미만·BCAA 4000mg.", price: 3000, stock: 70, kcal: 110, protein: 20, sugar: 1, fat: 0, specs: ["단백질 20g", "SUGAR < 1g", "BCAA 4000mg"], grades: ["A", "A", "A", "B", "C"] },
    { slug: "nucare-allprotein-choco", cat: "drink", name: "뉴케어 올프로틴 초코맛", brand: "대상 뉴케어", desc: "단백질 25g 고함량, 락토프리·아르기닌 함유 초코 프로틴 음료.", price: 3300, stock: 80, kcal: 150, protein: 25, sugar: 3, fat: 2, specs: ["단백질 25g", "락토프리", "아르기닌"], grades: ["B", "B", "A", "B", "C"] },
    { slug: "nucare-allprotein-banana", cat: "drink", name: "뉴케어 올프로틴 바나나맛", brand: "대상 뉴케어", desc: "단백질 25g 고함량, 락토프리·아르기닌 함유 바나나 프로틴 음료.", price: 3300, stock: 75, kcal: 150, protein: 25, sugar: 3, fat: 2, specs: ["단백질 25g", "락토프리", "아르기닌"], grades: ["B", "B", "A", "B", "C"] },
    { slug: "nucare-allprotein-savory", cat: "drink", name: "뉴케어 올프로틴 고소한맛", brand: "대상 뉴케어", desc: "단백질 25g 고함량, 락토프리·아르기닌 함유 고소한맛 프로틴 음료.", price: 3300, stock: 70, kcal: 150, protein: 25, sugar: 2, fat: 2, specs: ["단백질 25g", "락토프리", "아르기닌"], grades: ["B", "B", "A", "B", "C"] },
    { slug: "motbam-protein-zero", cat: "lowsugar", name: "못밤 프로틴 당류ZERO", brand: "정식품 못밤", desc: "당류 ZERO에 단백질 21g을 담은 가벼운 프로틴 음료.", price: 2900, stock: 65, kcal: 110, protein: 21, sugar: 0, fat: 1, specs: ["단백질 21g", "당류 ZERO", "250ml"], grades: ["A", "A", "A", "B", "C"] },
    { slug: "selex-profit-banana", cat: "lowsugar", name: "셀렉스 프로핏 바나나", brand: "매일헬스뉴트리션 셀렉스", desc: "완전단백질 20g, 제로 슈가·BCAA 4200mg의 바나나 프로틴 음료.", price: 3100, stock: 80, kcal: 100, protein: 20, sugar: 0, fat: 1, specs: ["완전단백질 20g", "ZERO SUGAR", "BCAA 4200mg"], grades: ["A", "A", "A", "B", "C"] },
    { slug: "renewphy-pistachio-choco", cat: "shake", name: "한손한끼 르네오피 피스타치오 초코", brand: "르네오피", desc: "피스타치오 초코 맛의 고단백 파우치 쉐이크.", price: 3500, stock: 40, kcal: 158, protein: 15, sugar: 4, fat: 5, specs: ["고단백 쉐이크", "피스타치오 초코", "파우치"], grades: ["B", "C", "A", "B", "B"] },
    { slug: "hymune-balance-original", cat: "drink", name: "하이뮨 프로틴 밸런스 오리지널", brand: "일동후디스 하이뮨", desc: "간편하게 마시는 단백질 음료 오리지널. BCAA 1500mg 함유.", price: 2400, stock: 90, kcal: 165, protein: 10, sugar: 9, fat: 3, specs: ["단백질 10g", "BCAA 1500mg", "190ml"], grades: ["B", "C", "B", "B", "C"] },
    { slug: "labnosh-protein-cookie", cat: "drink", name: "랩노쉬 프로틴 드링크 쿠키앤크림", brand: "랩노쉬", desc: "단백질 27g 고함량 쿠키앤크림 프로틴 드링크.", price: 3800, stock: 70, kcal: 180, protein: 27, sugar: 3, fat: 3, specs: ["단백질 27g", "쿠키앤크림", "350ml"], grades: ["B", "B", "A", "B", "C"] },
    { slug: "labnosh-protein-melon", cat: "drink", name: "랩노쉬 프로틴 드링크 메론", brand: "랩노쉬", desc: "상큼한 메론맛 단백질 27g 고함량 프로틴 드링크.", price: 3800, stock: 65, kcal: 130, protein: 27, sugar: 2, fat: 1, specs: ["단백질 27g", "메론맛", "350ml"], grades: ["B", "B", "A", "B", "C"] },
    { slug: "labnosh-slim-injeolmi", cat: "lowsugar", name: "랩노쉬 슬림쉐이크 인절미", brand: "랩노쉬", desc: "고소한 인절미 맛 다이어트 쉐이크. 단백질 20g·식이섬유 5.3g.", price: 3300, stock: 60, kcal: 165, protein: 20, sugar: 5, fat: 3, specs: ["단백질 20g", "식이섬유 5.3g", "다이어트 쉐이크"], grades: ["A", "B", "A", "B", "B"] },
    { slug: "labnosh-slim-matcha", cat: "lowsugar", name: "랩노쉬 슬림쉐이크 제주말차", brand: "랩노쉬", desc: "제주말차 맛 다이어트 쉐이크. 단백질 20g·식이섬유 7.5g.", price: 3300, stock: 55, kcal: 165, protein: 20, sugar: 4, fat: 3, specs: ["단백질 20g", "식이섬유 7.5g", "다이어트 쉐이크"], grades: ["A", "B", "A", "B", "B"] },
    { slug: "labnosh-slim-blacksesame", cat: "lowsugar", name: "랩노쉬 슬림쉐이크 로스팅 흑임자", brand: "랩노쉬", desc: "로스팅 흑임자 맛 다이어트 쉐이크. 단백질 20g·식이섬유 7g.", price: 3300, stock: 50, kcal: 165, protein: 20, sugar: 4, fat: 4, specs: ["단백질 20g", "식이섬유 7g", "다이어트 쉐이크"], grades: ["A", "B", "A", "B", "B"] },
    { slug: "labnosh-protein-banana", cat: "drink", name: "랩노쉬 프로틴 드링크 바나나", brand: "랩노쉬", desc: "단백질 27g 고함량 바나나 프로틴 드링크.", price: 3800, stock: 75, kcal: 160, protein: 27, sugar: 5, fat: 2, specs: ["단백질 27g", "바나나맛", "350ml"], grades: ["B", "B", "A", "B", "C"] },
  ];

  // 첨가물 알아보기 — 먹는 상품(단백질 음료) 공통 고정 데이터 (확인 전용)
  const FIXED_ADDITIVES = [
    { name: "카라기난", tag: "살펴보기", desc: "점도·식감을 잡는\n해조류 유래 증점제" },
    { name: "효소처리스테비아", tag: "알아두기", desc: "설탕 대신 단맛을 내는\n식물 유래 감미료" },
    { name: "구연산", tag: "살펴보기", desc: "상큼한 맛을 더하는\n천연 유래 산미료" },
    { name: "잔탄검", tag: "살펴보기", desc: "성분이 분리되지 않게 잡아주는\n발효 유래 안정제" },
    { name: "혼합토코페롤", tag: "알아두기", desc: "산패를 막아주는\n천연 비타민E 산화방지제" },
  ];

  const proteinPid: Record<string, string> = {};
  for (const p of PROTEIN) {
    proteinPid[p.slug] = createProduct(
      p.cat, p.name, p.desc, p.price, `/products/${p.slug}.png`,
      [],
      [{ optionKeys: [], price: p.price, stock: p.stock, code: p.slug.toUpperCase().replace(/-/g, "_") }],
      {
        shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송)",
        keySpecs: p.specs,
        brand: p.brand,
        nutrition: { calories: p.kcal, protein: p.protein, sugar: p.sugar, fat: p.fat },
        indicatorGrades: ig(...p.grades),
        additives: FIXED_ADDITIVES,
        manufacturer: `제조사: ${p.brand} | 원산지: 대한민국 | 유통기한: 제조일로부터 별도 표기`,
      }
    );
  }

  // 리뷰가 참조하는 대표 상품 (기존 변수명 유지)
  const pidMultivitamin = proteinPid["hymune-active-choco"];
  const pidVitaminC = proteinPid["flymeal-choco"];
  const pidVitaminD = proteinPid["labnosh-protein-banana"];
  const pidProbiotics = proteinPid["nucare-allprotein-choco"];
  const pidOmega3 = proteinPid["takefit-max-choco"];

  // --- Reviews ---
  const insertReview = db.prepare(
    `INSERT INTO reviews (id, product_id, session_id, author_name, rating, body, photo_urls, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ? || ' days'))`
  );

  // 리뷰 포토 풀 — 로컬 에셋 + unsplash(영양제·건강 테마). 리뷰 사진은 <img>라 next 설정 불필요.
  const P = {
    r1: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop&q=80",
    r2: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop&q=80",
    r3: "https://images.unsplash.com/photo-1626716493137-b67fe9501e76?w=400&h=400&fit=crop&q=80",
    r4: "https://images.unsplash.com/photo-1626202373152-8db1760c8f61?w=400&h=400&fit=crop&q=80",
    r5: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop&q=80",
    u1: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&q=80",
    u2: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop&q=80",
    u3: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop&q=80",
    u4: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop&q=80",
    u5: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=400&fit=crop&q=80",
    u6: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&q=80",
    u7: "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=400&h=400&fit=crop&q=80",
    u8: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop&q=80",
  };

  const reviewSeeds = [
    { pid: pidMultivitamin, items: [
      { name: "김지연", rating: 5, body: "운동 끝나고 딥초코로 마시면 단백질 20g이 든든해요. 진짜 초코우유 맛이에요.", photos: [P.r1, P.r2], daysAgo: 3 },
      { name: "박성호", rating: 4, body: "제로 슈가인데 단맛이 충분해요. 한 박스 쟁여두고 먹어요.", photos: [], daysAgo: 7 },
      { name: "이현정", rating: 5, body: "아침 대용으로 딱이에요. 250ml라 부담 없이 마셔요.", photos: [P.u1], daysAgo: 9 },
      { name: "장우혁", rating: 5, body: "헬스장 갈 때마다 챙겨요. 단백질 보충 간편합니다.", photos: [P.u2, P.u3], daysAgo: 12 },
      { name: "한소희", rating: 4, body: "초코맛 진하고 목 넘김이 부드러워요.", photos: [], daysAgo: 16 },
      { name: "노태준", rating: 3, body: "맛은 좋은데 가격이 살짝 있어요.", photos: [], daysAgo: 19 },
      { name: "문가영", rating: 5, body: "재구매했어요. 다이어트 중 단백질 채우기 좋아요.", photos: [P.u4], daysAgo: 23 },
      { name: "백승현", rating: 5, body: "운동 직후 한 잔이면 든든. 비린맛 전혀 없어요.", photos: [], daysAgo: 27 },
      { name: "정유미", rating: 4, body: "냉장고에 쟁여두고 마셔요. 깔끔합니다.", photos: [P.u5], daysAgo: 31 },
      { name: "구자철", rating: 2, body: "저한텐 좀 달았어요. 호불호 갈릴 듯해요.", photos: [], daysAgo: 38 },
    ]},
    { pid: pidVitaminC, items: [
      { name: "최민준", rating: 5, body: "한 끼 대용으로 든든해요. 토핑 씹히는 식감이 재밌어요.", photos: [P.r3], daysAgo: 2 },
      { name: "정수아", rating: 4, body: "초코맛이 달달하고 단백질 22g이라 포만감 좋아요.", photos: [P.u6], daysAgo: 6 },
      { name: "오지은", rating: 3, body: "맛은 좋은데 약간 텁텁해요. 물 많이 타면 나아요.", photos: [], daysAgo: 11 },
      { name: "강민서", rating: 5, body: "아침 거를 때 이거 하나면 점심까지 든든해요.", photos: [P.u7], daysAgo: 14 },
      { name: "윤하준", rating: 5, body: "식이섬유까지 챙겨져서 좋네요. 다이어트용으로 굿.", photos: [], daysAgo: 18 },
      { name: "서지우", rating: 4, body: "토핑이 씹혀서 포만감이 오래가요.", photos: [P.u1, P.u8], daysAgo: 22 },
      { name: "임도현", rating: 5, body: "물에 타먹기 간편하고 초코맛이 진해요.", photos: [], daysAgo: 26 },
      { name: "조아라", rating: 2, body: "저는 좀 달아서 아쉬웠어요.", photos: [], daysAgo: 33 },
      { name: "김태형", rating: 4, body: "운동 후 식사대용으로 잘 먹고 있어요.", photos: [P.u2], daysAgo: 40 },
    ]},
    { pid: pidVitaminD, items: [
      { name: "강태훈", rating: 5, body: "단백질 27g 고함량인데 바나나맛이 자연스러워요.", photos: [P.u3], daysAgo: 5 },
      { name: "임소연", rating: 4, body: "350ml라 양도 넉넉하고 든든해요.", photos: [], daysAgo: 8 },
      { name: "신재원", rating: 5, body: "운동 후 단백질 보충용으로 최고예요.", photos: [P.u4], daysAgo: 13 },
      { name: "황보름", rating: 5, body: "바나나우유 같은 맛이라 부담 없이 마셔요.", photos: [], daysAgo: 17 },
      { name: "차은우", rating: 4, body: "고단백인데 목 넘김이 부드러워요. 재구매 의사 있어요.", photos: [P.u5], daysAgo: 21 },
      { name: "남주혁", rating: 3, body: "맛은 좋은데 살짝 단 편이에요.", photos: [], daysAgo: 29 },
      { name: "유인나", rating: 5, body: "헬스 끝나고 마시기 딱이에요.", photos: [], daysAgo: 35 },
      { name: "박보검", rating: 4, body: "휴대하기 좋고 든든합니다.", photos: [P.u6], daysAgo: 42 },
    ]},
    { pid: pidProbiotics, items: [
      { name: "조현우", rating: 5, body: "단백질 25g 고함량인데 락토프리라 속이 편해요.", photos: [P.u7], daysAgo: 4 },
      { name: "배지영", rating: 4, body: "유당 때문에 배 아픈 분께 추천. 초코맛도 좋아요.", photos: [], daysAgo: 9 },
      { name: "윤민석", rating: 5, body: "어르신 단백질 보충용으로 사드렸는데 잘 드세요.", photos: [P.u8], daysAgo: 13 },
      { name: "한지민", rating: 5, body: "아르기닌까지 들어 운동 보충에 좋아요.", photos: [], daysAgo: 17 },
      { name: "정해인", rating: 4, body: "맛이 진하고 든든해요. 꾸준히 먹는 중.", photos: [P.u1], daysAgo: 20 },
      { name: "손예진", rating: 3, body: "살짝 묽은 편이지만 무난해요.", photos: [], daysAgo: 24 },
      { name: "현빈", rating: 5, body: "락토프리라 우유 못 먹는 제게 딱이에요.", photos: [P.u2, P.u3], daysAgo: 30 },
      { name: "김고은", rating: 4, body: "가족 단백질 보충용으로 잘 먹어요.", photos: [], daysAgo: 37 },
    ]},
    { pid: pidOmega3, items: [
      { name: "홍성민", rating: 5, body: "단백질 24g에 당류 1g 미만! 다이어트 중 최고예요.", photos: [P.r4, P.r5], daysAgo: 6 },
      { name: "서유진", rating: 5, body: "완전단백질이라 운동 후 회복이 빨라요. 비린맛 없어요.", photos: [P.u4], daysAgo: 10 },
      { name: "권태수", rating: 4, body: "고함량 프로틴 중 맛이 제일 깔끔해요.", photos: [], daysAgo: 15 },
      { name: "이나영", rating: 5, body: "초코맛 진하고 제로슈가라 부담 없어요. 강추!", photos: [P.u5], daysAgo: 19 },
      { name: "공유", rating: 4, body: "아침 공복에 마셔도 속이 편해요.", photos: [], daysAgo: 23 },
      { name: "전도연", rating: 3, body: "맛은 무난한데 약간 묽어요.", photos: [], daysAgo: 28 },
      { name: "주지훈", rating: 5, body: "헬스장 필수템. 재구매했습니다.", photos: [P.u6, P.u7], daysAgo: 34 },
      { name: "김혜수", rating: 4, body: "단백질 보충 목적으로 잘 마시고 있어요.", photos: [], daysAgo: 41 },
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
  insertBanner.run(deterministicId(), "단백질 충전 기획전", "인기 프로틴 드링크 최대 30% 할인", "/banners/summer.jpg", "/products?category=drink", 1);
  insertBanner.run(deterministicId(), "제로 슈가 단백질", "당 부담 없이 즐기는 저당 프로틴", "/banners/probiotics.jpg", "/products?category=lowsugar", 2);
  insertBanner.run(deterministicId(), "간편한 한 끼 쉐이크", "든든한 식사대용 프로틴 쉐이크", "/banners/kids.jpg", "/products?category=shake", 3);

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
    "INSERT INTO order_items (id, order_id, sku_id, product_id, product_name, option_summary, image_url, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );

  // 주문 상품 스냅샷용 — 상품명 → 이미지/id 맵 (이미 생성된 products에서 구성)
  const PRODUCT_IMG: Record<string, string> = {};
  const PRODUCT_ID: Record<string, string> = {};
  for (const row of db.prepare("SELECT id, name, image_url FROM products").all() as { id: string; name: string; image_url: string }[]) {
    PRODUCT_IMG[row.name] = row.image_url;
    PRODUCT_ID[row.name] = row.id;
  }
  const FALLBACK_IMG = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&q=80";
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
      insertOrderItem.run(deterministicId(), oid, `demo-sku-${deterministicId().slice(0,4)}`, PRODUCT_ID[item.name] ?? "", item.name, item.option, PRODUCT_IMG[item.name] ?? FALLBACK_IMG, item.price, item.qty, item.price * item.qty);
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
      { name: "하이뮨 액티브 딥초코", option: "", price: 3200, qty: 6 },
    ]},
    { ...addr2, status: ORDER_STATUS.PAID, daysAgo: 0, items: [
      { name: "플라이밀 초코", option: "", price: 3300, qty: 4 },
    ]},
    { ...addr, status: ORDER_STATUS.PAID, daysAgo: 1, items: [
      { name: "뉴케어 올프로틴 초코맛", option: "", price: 3300, qty: 3 },
      { name: "셀렉스 프로핏 바나나", option: "", price: 3100, qty: 2 },
    ]},
  ];

  // ===== 배송준비 (3건) =====
  const preparingOrders: DemoOrder[] = [
    { ...addr, status: ORDER_STATUS.PREPARING, daysAgo: 1, items: [
      { name: "테이크핏 맥스 초코맛", option: "", price: 3000, qty: 8 },
    ]},
    { ...addr3, status: ORDER_STATUS.PREPARING, daysAgo: 2, items: [
      { name: "단백한끼 14곡물", option: "", price: 2500, qty: 10 },
    ]},
    { ...addr2, status: ORDER_STATUS.PREPARING, daysAgo: 2, items: [
      { name: "함소아 액션가면 프로틴액트 초코", option: "", price: 2800, qty: 2 },
      { name: "단백한끼 초코쿠키", option: "", price: 2500, qty: 4 },
    ]},
  ];

  // ===== 배송중 (3건) =====
  const shippingOrders: DemoOrder[] = [
    { ...addr, status: ORDER_STATUS.SHIPPING, daysAgo: 3, items: [
      { name: "랩노쉬 프로틴 드링크 바나나", option: "", price: 3800, qty: 3 },
    ]},
    { ...addr2, status: ORDER_STATUS.SHIPPING, daysAgo: 4, items: [
      { name: "하이뮨 액티브 비건 단백질", option: "", price: 3400, qty: 4 },
      { name: "단백한끼 14곡물", option: "", price: 2500, qty: 3 },
    ]},
    { ...addr3, status: ORDER_STATUS.SHIPPING, daysAgo: 5, items: [
      { name: "랩노쉬 슬림쉐이크 인절미", option: "", price: 3300, qty: 6 },
    ]},
  ];

  // ===== 배송완료 (4건) =====
  const deliveredOrders: DemoOrder[] = [
    { ...addr, status: ORDER_STATUS.DELIVERED, daysAgo: 7, items: [
      { name: "플라이밀 초코", option: "", price: 3300, qty: 4 },
      { name: "셀렉스 프로핏 바나나", option: "", price: 3100, qty: 2 },
    ]},
    { ...addr2, status: ORDER_STATUS.DELIVERED, daysAgo: 10, items: [
      { name: "테이크핏 맥스 초코맛", option: "", price: 3000, qty: 10 },
    ]},
    { ...addr3, status: ORDER_STATUS.DELIVERED, daysAgo: 12, items: [
      { name: "뉴케어 올프로틴 초코맛", option: "", price: 3300, qty: 6 },
      { name: "하이뮨 액티브 딥초코", option: "", price: 3200, qty: 4 },
    ]},
    { ...addr, status: ORDER_STATUS.DELIVERED, daysAgo: 14, items: [
      { name: "함소아 액션가면 프로틴액트 초코", option: "", price: 2800, qty: 3 },
    ]},
  ];

  // ===== 취소완료 (2건) =====
  const cancelledOrders: DemoOrder[] = [
    { ...addr, status: ORDER_STATUS.CANCELLED, daysAgo: 5, cancelledDaysAgo: 4, items: [
      { name: "뉴케어 올프로틴 초코맛", option: "", price: 3300, qty: 12 },
    ]},
    { ...addr2, status: ORDER_STATUS.CANCELLED, daysAgo: 8, cancelledDaysAgo: 7, items: [
      { name: "함소아 액션가면 프로틴액트 초코", option: "", price: 2800, qty: 2 },
    ]},
  ];

  // ===== 반품완료 (3건) =====
  const returnOrders: DemoOrder[] = [
    { ...addr, status: ORDER_STATUS.RETURN_COMPLETED, daysAgo: 20, returnedDaysAgo: 16, returnReason: "상품 불량", returnNote: "포장이 새서 내용물이 일부 샜어요.", items: [
      { name: "테이크핏 맥스 초코맛", option: "", price: 3000, qty: 6 },
    ]},
    { ...addr3, status: ORDER_STATUS.RETURN_COMPLETED, daysAgo: 18, returnedDaysAgo: 15, returnReason: "단순 변심", returnNote: "", items: [
      { name: "플라이밀 초코", option: "", price: 3300, qty: 4 },
    ]},
    { ...addr2, status: ORDER_STATUS.RETURN_COMPLETED, daysAgo: 25, returnedDaysAgo: 22, returnReason: "배송 중 파손", returnNote: "박스가 찌그러져서 제품이 손상되었어요.", items: [
      { name: "하이뮨 액티브 딥초코", option: "", price: 3200, qty: 6 },
      { name: "랩노쉬 프로틴 드링크 바나나", option: "", price: 3800, qty: 2 },
    ]},
  ];

  // ===== 구매확정 (3건) — 반품/교환 불가, 배송조회·재구매만 =====
  const confirmedOrders: DemoOrder[] = [
    { ...addr, status: ORDER_STATUS.CONFIRMED, daysAgo: 9, items: [
      { name: "하이뮨 액티브 딥초코", option: "", price: 3200, qty: 8 },
    ]},
    { ...addr2, status: ORDER_STATUS.CONFIRMED, daysAgo: 11, items: [
      { name: "랩노쉬 프로틴 드링크 바나나", option: "", price: 3800, qty: 4 },
      { name: "플라이밀 초코", option: "", price: 3300, qty: 2 },
    ]},
    { ...addr3, status: ORDER_STATUS.CONFIRMED, daysAgo: 16, items: [
      { name: "랩노쉬 슬림쉐이크 인절미", option: "", price: 3300, qty: 6 },
    ]},
  ];

  // ===== 교환완료 (2건) =====
  const exchangeOrders: DemoOrder[] = [
    { ...addr, status: ORDER_STATUS.EXCHANGE_COMPLETED, daysAgo: 15, returnedDaysAgo: 13, returnReason: "오배송 (다른 상품 수령)", returnNote: "초코맛을 주문했는데 다른 맛이 왔습니다.", items: [
      { name: "하이뮨 액티브 딥초코", option: "", price: 3200, qty: 4 },
    ]},
    { ...addr3, status: ORDER_STATUS.EXCHANGE_COMPLETED, daysAgo: 22, returnedDaysAgo: 19, returnReason: "상품이 설명과 다름", returnNote: "표기된 성분과 실제가 달랐습니다.", items: [
      { name: "하이뮨 액티브 비건 단백질", option: "", price: 3400, qty: 3 },
    ]},
  ];

  const allOrders = [
    ...paidOrders, ...preparingOrders, ...shippingOrders,
    ...deliveredOrders, ...confirmedOrders, ...cancelledOrders, ...returnOrders, ...exchangeOrders,
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
