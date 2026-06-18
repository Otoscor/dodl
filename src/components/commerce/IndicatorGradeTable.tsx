import type { IndicatorGrade } from "@/types/product";

interface IndicatorGradeTableProps {
  grades: IndicatorGrade[];
}

export function IndicatorGradeTable({ grades }: IndicatorGradeTableProps) {
  return (
    <section className="pt-10 px-6">
      <h2 className="text-[17px] text-black mb-5">지표등급표</h2>
      <div className="grid grid-cols-2 gap-3">
        {grades.map((g) => (
          <div
            key={g.metric}
            className="bg-white border border-[#e8e8e8] rounded-[14px] p-4 flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[#888] mb-1.5">{g.metric}</p>
              <p className="text-[17px] font-bold text-black leading-tight">{g.status}</p>
            </div>
            <div className="w-11 h-11 rounded-full bg-[#f0f0f0] flex items-center justify-center shrink-0">
              <span className="text-[16px] font-semibold text-[#555]">{g.grade}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
