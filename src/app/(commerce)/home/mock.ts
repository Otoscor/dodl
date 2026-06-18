// 홈 피드 보강용 정적 데이터 (DB와 무관 — 표시 전용).
// 실제 상품(getProducts)에는 없는 "건강 고민 카테고리 · 식이섬유 · 두들 인사이트"를
// 여기서 채운다. 상품 id를 모르므로 index 기반 round-robin으로 결정적으로 매핑한다.

// 건강 고민 카테고리 — 상단 칩 레일과 필터 탭이 공유하는 단일 소스.
export interface HealthConcern {
  id: string;
  label: string; // 탭/배지 라벨 (혈당 건강 등)
  chipIcon: string; // Material Icons (outlined) 이름
  chipTitle: string; // 칩 제목 (식후 스파이크형 등)
  chipDesc: string; // 칩 2줄 설명 (\n 줄바꿈)
}

export const HEALTH_CONCERNS: HealthConcern[] = [
  {
    id: "glucose",
    label: "혈당 건강",
    chipIcon: "show_chart",
    chipTitle: "식후 스파이크형",
    chipDesc: "밥 먹고 나면\n혈당이 너무 튀어요",
  },
  {
    id: "appetite",
    label: "체중·식욕",
    chipIcon: "restaurant",
    chipTitle: "식탐 제어형",
    chipDesc: "단 걸 먹어도 자꾸\n가짜 허기가 져요",
  },
  {
    id: "immune",
    label: "면역",
    chipIcon: "health_and_safety",
    chipTitle: "면역 강화형",
    chipDesc: "환절기마다\n쉽게 지치고 아파요",
  },
  {
    id: "gut",
    label: "장 건강",
    chipIcon: "spa",
    chipTitle: "장 건강형",
    chipDesc: "속이 더부룩하고\n화장실이 불편해요",
  },
  {
    id: "sleep",
    label: "수면",
    chipIcon: "bedtime",
    chipTitle: "수면 질형",
    chipDesc: "잠들기 어렵고\n자주 뒤척여요",
  },
];

export function concernById(id: string): HealthConcern | undefined {
  return HEALTH_CONCERNS.find((c) => c.id === id);
}

// 두들 인사이트 — 전문가 코멘트 (목업, 여러 변형을 상품별로 순환)
export interface Insight {
  author: string;
  role: string;
  body: string;
}

const INSIGHTS: Insight[] = [
  {
    author: "홍길동",
    role: "내과 전문의",
    body: "공복 상태로 맞이하는 오전은 하루의 대사 흐름을 결정짓는 중요한 타임입니다. 밤새 상승한 스트레스 호르몬의 영향으로 아침 시간에는 세포의 인슐린 저항성이 일시적으로 높아지기 쉽습니다. 이때 정제 탄수화물 위주의 식사로 혈당 스파이크가 발생하면, 췌장은 과도한 인슐린을 분비하게 됩니다.",
  },
  {
    author: "김서연",
    role: "임상영양사",
    body: "같은 영양소라도 '언제, 무엇과 함께' 먹느냐에 따라 흡수율과 체감 효과가 크게 달라집니다. 식이섬유와 단백질을 먼저 채우면 이어지는 탄수화물의 흡수 속도가 완만해지고, 식후 포만감도 오래 유지됩니다. 보충제는 식단의 빈틈을 메우는 보조 수단으로 활용하는 것이 좋습니다.",
  },
  {
    author: "이준호",
    role: "가정의학과 전문의",
    body: "장내 미생물 환경은 면역과 수면, 심지어 기분까지 영향을 미치는 핵심 축입니다. 규칙적인 식사 시간과 충분한 수분, 그리고 발효식품·식이섬유의 꾸준한 섭취가 건강한 장 환경의 기본입니다. 특정 성분에 의존하기보다 생활 리듬을 함께 다듬는 것을 권장합니다.",
  },
];

// 상품 보강 결과
export interface FeedAugment {
  concern: HealthConcern;
  fiber: number; // 식이섬유 (g) — DB에 없어 목업으로 보강
  insight: Insight;
}

const FIBER_POOL = [6.3, 4.1, 0, 2.8, 5.5, 1.2, 3.6, 0.4];

// 상품 id별 명시 매핑이 없으므로 index 기반 round-robin으로 결정적으로 보강한다.
// → 모든 건강 고민 탭에 최소 1개 이상의 상품이 배정되도록 보장.
export function augmentFor(productId: string, index: number): FeedAugment {
  const concern = HEALTH_CONCERNS[index % HEALTH_CONCERNS.length];
  const fiber = FIBER_POOL[index % FIBER_POOL.length];
  const insight = INSIGHTS[index % INSIGHTS.length];
  return { concern, fiber, insight };
}
