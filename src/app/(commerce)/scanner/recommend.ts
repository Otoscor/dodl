import {
  PRODUCTS,
  QUESTIONS,
  QUESTION_WEIGHT,
  ProteinProduct,
  Tag,
} from "./data";

export interface Recommendation {
  product: ProteinProduct;
  reasons: Tag[];
}

// answers: { [questionId]: 선택한 옵션 인덱스 }
export function recommend(answers: Record<string, number>): Recommendation[] {
  // 사용자가 선택한 모든 태그와, 그 태그가 속한 질문의 가중치를 모은다
  const selected: { tag: Tag; weight: number }[] = [];
  for (const question of QUESTIONS) {
    const optionIndex = answers[question.id];
    if (optionIndex == null) continue;
    const option = question.options[optionIndex];
    if (!option) continue;
    const weight = QUESTION_WEIGHT[question.id] ?? 1;
    for (const tag of option.tags) {
      selected.push({ tag, weight });
    }
  }

  const scored = PRODUCTS.map((product, index) => {
    let score = 0;
    const reasons: Tag[] = [];
    for (const { tag, weight } of selected) {
      if (product.tags.includes(tag)) {
        score += weight;
        if (!reasons.includes(tag)) reasons.push(tag);
      }
    }
    return { product, reasons, score, index };
  });

  // 점수 내림차순, 동점이면 원래 순서(index) 유지
  scored.sort((a, b) => b.score - a.score || a.index - b.index);

  return scored.slice(0, 3).map(({ product, reasons }) => ({ product, reasons }));
}
