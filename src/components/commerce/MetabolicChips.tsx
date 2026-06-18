// 홈 상단 "오늘 당신의 대사 상태는 어떤가요?" 칩 행.
// 건강 고민 카테고리(HEALTH_CONCERNS)를 렌더하며, 탭 필터와 동일한 상태를 공유한다.
// 칩을 탭하면 해당 고민으로 피드가 필터링된다(다시 누르면 전체).

import type { HealthConcern } from "@/app/(commerce)/home/mock";

interface MetabolicChipsProps {
  concerns: HealthConcern[];
  activeId: string | null; // null = 전체
  onSelect: (id: string) => void;
}

export function MetabolicChips({ concerns, activeId, onSelect }: MetabolicChipsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {concerns.map((chip) => {
        const active = chip.id === activeId;
        return (
          <button
            key={chip.id}
            onClick={() => onSelect(chip.id)}
            className={`shrink-0 w-[185px] text-left rounded-[10px] border bg-white px-4 py-3.5 transition-colors ${
              active ? "border-black" : "border-[#e0e0e0]"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`material-icons-outlined text-[18px] ${active ? "text-black" : "text-[#888]"}`}>
                {chip.chipIcon}
              </span>
              <span className="text-[14px] text-black">{chip.chipTitle}</span>
            </div>
            <p className="mt-2 text-[12px] leading-[1.45] text-[#888] whitespace-pre-line">
              {chip.chipDesc}
            </p>
          </button>
        );
      })}
    </div>
  );
}
