// 상품 상세 — 지표등급표.
// 상품이 다이어트·혈당·근육 등 지표에 좋은지/나쁜지를 A~E 등급으로 간략 표현.
// 정적 표시(UI 전용) · 가로 스크롤.

import type { IndicatorGrade } from "@/types/product";

interface IndicatorGradeTableProps {
  grades: IndicatorGrade[];
}

export function IndicatorGradeTable({ grades }: IndicatorGradeTableProps) {
  return (
    <section className="pt-10">
      <h2 className="text-[17px] text-black px-6 mb-5">지표등급표</h2>
      <div className="flex gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {grades.map((g) => (
          <div
            key={g.metric}
            className="shrink-0 w-[112px] bg-[#f5f5f5] rounded-[10px] p-4 flex flex-col"
          >
            <span className="text-[44px] font-bold text-black leading-none">{g.grade}</span>
            <div className="mt-8">
              <p className="text-[13px] text-[#888] mb-0.5">{g.metric}</p>
              <p className="text-[15px] text-black font-medium leading-snug">{g.status}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
