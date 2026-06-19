// 단백질 스캐너 — 정적 데이터 (DB와 무관, 스캐너 전용)
// 3단계 단일선택 설문 → 태그 매칭으로 단백질 쉐이크 Top 3 추천

export type Tag =
  | "post_workout"
  | "meal_replacement"
  | "weight_management"
  | "low_sugar"
  | "gut_friendly"
  | "tasty"
  | "plant_based"
  | "beauty"
  | "lactose_free"
  | "low_gi"
  | "topping"
  | "smooth";

// 건강 지표 등급 (A–E · 흑백 표기)
export type Grade = "A" | "B" | "C" | "D" | "E";

// 속성 필터 태그 (결과 화면 필터/칩)
export type AttrFilter = "식물성" | "락토프리" | "제로슈거" | "클린라벨" | "Non-GMO";

// 핵심 영양 (상세 페이지)
export interface Nutrition {
  calories: number; // kcal
  protein: number; // g
  sugar: number; // g
  fat: number; // g
  fiber: number; // g (식이섬유)
}

export interface QuizOption {
  label: string;
  tags: Tag[];
}

export interface QuizQuestion {
  id: string;
  step: string; // 스텝 인디케이터 라벨 (목적 · 부담 · 식감)
  title: string;
  description: string; // 타이틀 아래 서브 캡션
  options: QuizOption[];
}

export interface ProteinProduct {
  id: string;
  name: string;
  subtitle: string; // 맛 · 용량
  blurb: string; // 한 줄 소개
  price: number; // 임의 가격 (데모)
  image: string; // 제품 누끼 이미지 (public/products)
  tags: Tag[];
  grades: Grade[]; // DETAIL_METRICS 순서 (7개); 결과 카드/정렬은 앞 6개만 사용
  rating: number; // 평점 (목업)
  reviewCount: number; // 리뷰 수 (목업)
  attrs: AttrFilter[]; // 속성 필터 태그 (목업)
  origin: string; // 원산지 (상세)
  nutrition: Nutrition; // 핵심 영양 (상세)
}

// 결과 카드 카테고리 라벨 (레퍼런스 고정 문구)
export const RESULT_CATEGORY = "단백질 쉐이크";

// 6개 건강 지표 (결과 카드/정렬 순서)
export const METRICS = ["다이어트", "혈당", "근육", "포만감", "피부", "속편함"] as const;

// 상세 지표등급표 = 결과 6지표 + 클린라벨 (7개)
export const DETAIL_METRICS = [...METRICS, "클린라벨"] as const;

// 등급 → 상태 문구 (A–E)
export const GRADE_STATUS: Record<Grade, string> = {
  A: "적극 권장",
  B: "권장",
  C: "주의",
  D: "권장 안 함",
  E: "경고",
};

// 속성 필터 목록 (빠른 칩 + 필터 시트)
export const ATTR_FILTERS: AttrFilter[] = ["식물성", "락토프리", "제로슈거", "클린라벨", "Non-GMO"];

// 정렬 옵션 (추천순 + 지표별 등급순)
export const SORT_OPTIONS = ["추천순", ...METRICS] as const;
export type SortKey = (typeof SORT_OPTIONS)[number];

// 각 질문의 가중치 (1번 목적이 가장 중요)
export const QUESTION_WEIGHT: Record<string, number> = {
  goal: 3,
  reduce: 2,
  texture: 1,
};

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "goal",
    step: "목적",
    title: "지금 단백질 음료를 찾는 가장 큰 이유는?",
    description: "지금 마음에 가장 가까운 것을 하나만 골라 주세요.",
    options: [
      { label: "운동 후 단백질을 채우고 싶어요", tags: ["post_workout"] },
      { label: "식사 대신 든든하게 먹고 싶어요", tags: ["meal_replacement"] },
      { label: "체중 관리를 가볍게 하고 싶어요", tags: ["weight_management"] },
      { label: "당류·혈당 부담이 낮은 제품을 찾고 있어요", tags: ["low_sugar"] },
      { label: "마시면 속이 편한 제품이 좋아요", tags: ["gut_friendly"] },
      { label: "맛있어서 꾸준히 먹을 수 있는 게 중요해요", tags: ["tasty"] },
      { label: "식물성·클린한 단백질이 좋아요", tags: ["plant_based"] },
      { label: "피부·이너뷰티에 관심 있어요", tags: ["beauty"] },
    ],
  },
  {
    id: "reduce",
    step: "부담",
    title: "어떤 부담을 줄이고 싶어요?",
    description: "줄이고 싶은 부담을 선택해 주세요.",
    options: [
      { label: "유당이 신경 쓰여요", tags: ["lactose_free"] },
      { label: "혈당 스파이크가 신경 쓰여요", tags: ["low_gi"] },
      { label: "둘 다 신경 쓰여요", tags: ["lactose_free", "low_gi"] },
      { label: "특별히 신경 안 써요", tags: [] },
    ],
  },
  {
    id: "texture",
    step: "식감",
    title: "분말 쉐이크 식감 선호는?",
    description: "선호하는 분말 쉐이크 식감을 골라 주세요.",
    options: [
      { label: "토핑 있는 · 씹는 재미 · 든든함", tags: ["topping"] },
      { label: "토핑 없음 · 속편안 · 부드러움", tags: ["smooth"] },
      { label: "상관없음", tags: [] },
    ],
  },
];

export const PRODUCTS: ProteinProduct[] = [
  {
    id: "whey-iso-choco",
    name: "퓨어 웨이 아이솔레이트",
    subtitle: "초코맛 · 1kg",
    blurb: "흡수 빠른 분리유청 단백질, 운동 직후 한 잔.",
    price: 42000,
    image: "/products/hymune-active-choco.png",
    tags: ["post_workout", "low_sugar", "smooth", "tasty"],
    grades: ["B", "B", "A", "B", "C", "B", "D"],
    rating: 4.3,
    reviewCount: 412,
    attrs: ["락토프리", "제로슈거"],
    origin: "대한민국",
    nutrition: { calories: 104, protein: 20, sugar: 1, fat: 0, fiber: 1 },
  },
  {
    id: "plant-pea-grain",
    name: "식물성 피 프로틴 쉐이크",
    subtitle: "곡물맛 · 750g",
    blurb: "완두·현미 단백 블렌드, 유당 걱정 없는 비건 포뮬러.",
    price: 36000,
    image: "/products/hymune-active-vegan.png",
    tags: ["plant_based", "lactose_free", "gut_friendly", "meal_replacement"],
    grades: ["B", "B", "B", "A", "B", "A", "A"],
    rating: 4.4,
    reviewCount: 537,
    attrs: ["식물성", "락토프리", "클린라벨", "Non-GMO"],
    origin: "대한민국",
    nutrition: { calories: 150, protein: 15, sugar: 2, fat: 2, fiber: 5 },
  },
  {
    id: "marshmallow-topping",
    name: "마시멜로 토핑 단백질쉐이크",
    subtitle: "초코맛 · 630g",
    blurb: "씹히는 마시멜로 토핑으로 든든한 한 끼 대용.",
    price: 32000,
    image: "/products/flymeal-choco.png",
    tags: ["meal_replacement", "topping", "tasty"],
    grades: ["C", "C", "B", "A", "C", "B", "E"],
    rating: 4.5,
    reviewCount: 289,
    attrs: [],
    origin: "중국",
    nutrition: { calories: 210, protein: 12, sugar: 9, fat: 4, fiber: 2 },
  },
  {
    id: "casein-vanilla",
    name: "슬로우 카제인 쉐이크",
    subtitle: "바닐라맛 · 900g",
    blurb: "천천히 흡수되는 카제인, 가벼운 체중 관리에.",
    price: 38000,
    image: "/products/hymune-active-milkshake.png",
    tags: ["weight_management", "low_gi", "smooth", "low_sugar"],
    grades: ["A", "A", "B", "A", "C", "B", "C"],
    rating: 4.2,
    reviewCount: 310,
    attrs: ["제로슈거"],
    origin: "대한민국",
    nutrition: { calories: 120, protein: 18, sugar: 0, fat: 1, fiber: 1 },
  },
  {
    id: "lactofree-whey-berry",
    name: "락토프리 웨이 쉐이크",
    subtitle: "딸기맛 · 800g",
    blurb: "유당을 제거해 속 편한 운동 후 단백질 보충.",
    price: 34000,
    image: "/products/nucare-allprotein-banana.png",
    tags: ["lactose_free", "gut_friendly", "post_workout"],
    grades: ["B", "C", "A", "B", "C", "A", "C"],
    rating: 4.1,
    reviewCount: 198,
    attrs: ["락토프리"],
    origin: "대한민국",
    nutrition: { calories: 110, protein: 20, sugar: 2, fat: 0, fiber: 1 },
  },
  {
    id: "collagen-protein",
    name: "콜라겐 단백질 쉐이크",
    subtitle: "베리맛 · 500g",
    blurb: "단백질에 콜라겐을 더한 이너뷰티 한 잔.",
    price: 39000,
    image: "/products/labnosh-slim-injeolmi.png",
    tags: ["beauty", "tasty", "smooth"],
    grades: ["C", "C", "C", "B", "A", "B", "B"],
    rating: 4.6,
    reviewCount: 521,
    attrs: ["클린라벨"],
    origin: "대한민국",
    nutrition: { calories: 90, protein: 10, sugar: 1, fat: 1, fiber: 0 },
  },
  {
    id: "zero-sugar-clear",
    name: "제로슈가 클리어 프로틴",
    subtitle: "자몽맛 · 450g",
    blurb: "음료처럼 가벼운 제로당 클리어 프로틴.",
    price: 28000,
    image: "/products/selex-profit-banana.png",
    tags: ["low_sugar", "low_gi", "gut_friendly", "smooth"],
    grades: ["A", "A", "C", "C", "B", "A", "B"],
    rating: 4.4,
    reviewCount: 365,
    attrs: ["제로슈거"],
    origin: "대한민국",
    nutrition: { calories: 80, protein: 15, sugar: 0, fat: 0, fiber: 2 },
  },
  {
    id: "granola-topping",
    name: "그래놀라 토핑 프로틴",
    subtitle: "쿠키맛 · 630g",
    blurb: "바삭한 그래놀라 토핑으로 즐기는 식사 대용 쉐이크.",
    price: 33000,
    image: "/products/flymeal-brown.png",
    tags: ["meal_replacement", "topping", "tasty"],
    grades: ["C", "B", "B", "A", "C", "C", "D"],
    rating: 4.3,
    reviewCount: 274,
    attrs: ["클린라벨"],
    origin: "대한민국",
    nutrition: { calories: 190, protein: 13, sugar: 7, fat: 5, fiber: 3 },
  },
];

// 등급 정렬 가중치 (낮을수록 좋음)
const GRADE_RANK: Record<Grade, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };

// id로 스캐너 상품 조회 (상세 페이지)
export function findProteinProduct(id: string): ProteinProduct | null {
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

// "왜 이런 평가일까" 사유 — 지표·등급 기반 템플릿
export function gradeReason(metric: string, grade: Grade): string {
  const status = GRADE_STATUS[grade];
  const tone: Record<Grade, string> = {
    A: `${metric} 측면에서 특히 우수한 구성이에요. 관련 성분이 균형 있게 충족돼 적극 추천돼요.`,
    B: `${metric}에 도움이 되는 구성이에요. 큰 부담 없이 무난하게 선택할 수 있어요.`,
    C: `${metric}는 보통 수준이에요. 목적에 따라 다른 제품과 비교해 보는 걸 권해요.`,
    D: `${metric} 측면에서는 권장하기 어려운 편이에요. 해당 목적이라면 신중히 검토하세요.`,
    E: `${metric}에 부담이 될 수 있는 구성이에요. 민감하다면 섭취를 피하는 게 좋아요.`,
  };
  return `'${status}' 등급이에요. ${tone[grade]}`;
}

// 이런 분께 (추천/고민) — 등급·속성 기반 파생
export function audienceFor(p: ProteinProduct): { recommend: string[]; caution: string[] } {
  const recommend: string[] = [];
  const caution: string[] = [];
  METRICS.forEach((m, i) => {
    const r = GRADE_RANK[p.grades[i]];
    if (r <= 1) recommend.push(`${m} 관리를 신경 쓰는 분`);
    if (r >= 3) caution.push(`${m} 부담을 줄이고 싶은 분`);
  });
  if (p.attrs.includes("식물성")) recommend.push("식물성·비건 단백질을 찾는 분");
  if (p.attrs.includes("락토프리")) recommend.push("유당이 불편했던 분");
  if (recommend.length === 0) recommend.push("단백질을 가볍게 챙기고 싶은 분");
  if (caution.length === 0) caution.push("가벼운 저칼로리 음료를 찾는 분");
  return { recommend: recommend.slice(0, 3), caution: caution.slice(0, 2) };
}

// 가장 약한(등급 낮은) 지표 인덱스 — "비슷한 제품" 기준
export function weakestMetricIndex(p: ProteinProduct): number {
  let idx = 0;
  let worst = -1;
  METRICS.forEach((_, i) => {
    if (GRADE_RANK[p.grades[i]] > worst) {
      worst = GRADE_RANK[p.grades[i]];
      idx = i;
    }
  });
  return idx;
}

// 비슷한 제품 — 특정 지표 등급이 더 좋은 다른 제품
export function similarBy(p: ProteinProduct, metricIndex: number): ProteinProduct[] {
  const mine = GRADE_RANK[p.grades[metricIndex]];
  return PRODUCTS.filter((x) => x.id !== p.id && GRADE_RANK[x.grades[metricIndex]] < mine)
    .sort((a, b) => GRADE_RANK[a.grades[metricIndex]] - GRADE_RANK[b.grades[metricIndex]])
    .slice(0, 4);
}

// 추천 이유 칩 라벨
export const TAG_LABEL: Record<Tag, string> = {
  post_workout: "운동 후 보충",
  meal_replacement: "식사 대용",
  weight_management: "체중 관리",
  low_sugar: "저당",
  gut_friendly: "속 편안",
  tasty: "맛 만족",
  plant_based: "식물성",
  beauty: "이너뷰티",
  lactose_free: "유당 ZERO",
  low_gi: "혈당 부담↓",
  topping: "토핑·식감",
  smooth: "부드러움",
};
