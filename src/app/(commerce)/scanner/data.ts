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
}

// 결과 카드 카테고리 라벨 (레퍼런스 고정 문구)
export const RESULT_CATEGORY = "단백질 쉐이크";

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
  },
  {
    id: "plant-pea-grain",
    name: "식물성 피 프로틴 쉐이크",
    subtitle: "곡물맛 · 750g",
    blurb: "완두·현미 단백 블렌드, 유당 걱정 없는 비건 포뮬러.",
    price: 36000,
    image: "/products/hymune-active-vegan.png",
    tags: ["plant_based", "lactose_free", "gut_friendly", "meal_replacement"],
  },
  {
    id: "marshmallow-topping",
    name: "마시멜로 토핑 단백질쉐이크",
    subtitle: "초코맛 · 630g",
    blurb: "씹히는 마시멜로 토핑으로 든든한 한 끼 대용.",
    price: 32000,
    image: "/products/flymeal-choco.png",
    tags: ["meal_replacement", "topping", "tasty"],
  },
  {
    id: "casein-vanilla",
    name: "슬로우 카제인 쉐이크",
    subtitle: "바닐라맛 · 900g",
    blurb: "천천히 흡수되는 카제인, 가벼운 체중 관리에.",
    price: 38000,
    image: "/products/hymune-active-milkshake.png",
    tags: ["weight_management", "low_gi", "smooth", "low_sugar"],
  },
  {
    id: "lactofree-whey-berry",
    name: "락토프리 웨이 쉐이크",
    subtitle: "딸기맛 · 800g",
    blurb: "유당을 제거해 속 편한 운동 후 단백질 보충.",
    price: 34000,
    image: "/products/nucare-allprotein-banana.png",
    tags: ["lactose_free", "gut_friendly", "post_workout"],
  },
  {
    id: "collagen-protein",
    name: "콜라겐 단백질 쉐이크",
    subtitle: "베리맛 · 500g",
    blurb: "단백질에 콜라겐을 더한 이너뷰티 한 잔.",
    price: 39000,
    image: "/products/labnosh-slim-injeolmi.png",
    tags: ["beauty", "tasty", "smooth"],
  },
  {
    id: "zero-sugar-clear",
    name: "제로슈가 클리어 프로틴",
    subtitle: "자몽맛 · 450g",
    blurb: "음료처럼 가벼운 제로당 클리어 프로틴.",
    price: 28000,
    image: "/products/selex-profit-banana.png",
    tags: ["low_sugar", "low_gi", "gut_friendly", "smooth"],
  },
  {
    id: "granola-topping",
    name: "그래놀라 토핑 프로틴",
    subtitle: "쿠키맛 · 630g",
    blurb: "바삭한 그래놀라 토핑으로 즐기는 식사 대용 쉐이크.",
    price: 33000,
    image: "/products/flymeal-brown.png",
    tags: ["meal_replacement", "topping", "tasty"],
  },
];

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
