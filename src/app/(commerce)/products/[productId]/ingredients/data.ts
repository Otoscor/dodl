// 원재료 전체보기 — 임시(데모) 데이터.
// TODO: 실제 상품별 데이터로 교체 시 seed(detail_info)로 이전 가능.

export type IngredientCategory = "영양강화" | "살펴보기" | "알아두기";

export interface Ingredient {
  name: string;
  category: IngredientCategory;
}

export interface IngredientDetail {
  category: "살펴보기" | "알아두기";
  name: string;
  summary: string; // 이름 아래 한 줄 설명 (접힘 상태에서도 노출)
  balanced: string; // 균형안
  direct: string; // 직접안
  basis: string; // 기관 근거
}

// 카테고리 명도 (흑백 테마) — solid: 점/게이지 그레이 3단계
export const CATEGORY_STYLE: Record<IngredientCategory, { solid: string }> = {
  영양강화: { solid: "#3a3a3a" },
  살펴보기: { solid: "#8c8c8c" },
  알아두기: { solid: "#c2c2c2" },
};

export const CATEGORY_ORDER: IngredientCategory[] = ["영양강화", "살펴보기", "알아두기"];

// 인포그래픽 (정적 · 디자인용 임시 수치)
export const CALORIE_BREAKDOWN: { category: IngredientCategory; value: number }[] = [
  { category: "영양강화", value: 870 },
  { category: "살펴보기", value: 350 },
  { category: "알아두기", value: 230 },
];
export const TOTAL_CALORIES = 1450;

// 전체 원재료
export const INGREDIENTS: Ingredient[] = [
  { name: "우유", category: "영양강화" },
  { name: "우유단백농축 30.7%", category: "영양강화" },
  { name: "정제수", category: "알아두기" },
  { name: "코코아분말", category: "영양강화" },
  { name: "분말셀룰로스", category: "살펴보기" },
  { name: "카복시메틸셀룰로스나트륨", category: "살펴보기" },
  { name: "제이인산나트륨", category: "알아두기" },
  { name: "락타아제", category: "살펴보기" },
  { name: "감미료", category: "알아두기" },
  { name: "볶음병아리콩분말", category: "영양강화" },
  { name: "열풍검정쌀", category: "영양강화" },
  { name: "현미", category: "영양강화" },
  { name: "볶음귀리분말", category: "영양강화" },
  { name: "7곡혼합분말", category: "영양강화" },
  { name: "볶음보리분말", category: "영양강화" },
  { name: "바나바잎추출분말", category: "영양강화" },
  { name: "얼라이브! 지오 블렌드", category: "영양강화" },
  { name: "나한과추출분말", category: "영양강화" },
  { name: "프로바이오틱스", category: "영양강화" },
  { name: "효소식품(파인애플추출분말)", category: "영양강화" },
  { name: "차전자피분말", category: "영양강화" },
  { name: "멀티비타민미네랄믹스", category: "영양강화" },
  { name: "소처리스테비아(감미료)", category: "알아두기" },
  { name: "합성향료", category: "살펴보기" },
  { name: "효소처리스테비아", category: "알아두기" },
  { name: "소금", category: "알아두기" },
];

// 설명이 필요한 주요 재료 (아코디언)
export const INGREDIENT_DETAILS: IngredientDetail[] = [
  {
    category: "살펴보기",
    name: "합성향료",
    summary: "맛과 향을 더하는 합성 착향료",
    balanced:
      "허용 기준 내 소량만 사용되며 일반적으로 안전하게 평가돼요. 향에 민감한 분은 참고하면 좋아요.",
    direct:
      "인공 향료에 민감하거나 알레르기 이력이 있다면 섭취 전 성분표를 한 번 살펴보세요.",
    basis:
      "식약처 식품첨가물 공전 등재 · 국제식품규격(CODEX) 사용 기준 준수. 일일섭취허용량(ADI) 범위 내 사용을 권장하고 있어요.",
  },
  {
    category: "알아두기",
    name: "효소처리스테비아",
    summary: "스테비아 잎에서 유래한 감미료 · 기관 허용 ADI 0–4 mg/kg(스테비올 기준)",
    balanced:
      "설탕을 대체하는 고감미 감미료로 혈당에 주는 영향이 적어요. 일부는 특유의 끝맛을 느낄 수 있어요.",
    direct:
      "감미료에 민감하거나 속이 불편한 분은 섭취량을 조절하고 몸 상태를 살펴보세요.",
    basis:
      "JECFA ADI 0–4 mg/kg(스테비올 기준) · EFSA·FDA(GRAS) 감미료로 승인. 국제기관이 허용 기준 내 사용을 인정해 왔어요.",
  },
  {
    category: "살펴보기",
    name: "카복시메틸셀룰로스나트륨",
    summary: "점도를 높여 안정시키는 합성 증점·안정제",
    balanced:
      "음료의 점도·식감을 잡아주는 용도로 널리 쓰이며 허용 기준 내에서 안전하게 평가돼요.",
    direct: "장이 예민하거나 증점제에 민감한 분은 원재료를 한 번 살펴보면 좋아요.",
    basis:
      "JECFA ADI ‘제한 없음(not specified)’ 수준으로 평가 · EFSA·FDA 사용 승인. 식품 전반에서 폭넓게 허용돼 왔어요.",
  },
];
