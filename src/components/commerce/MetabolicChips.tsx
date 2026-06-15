// 홈 상단 "오늘 당신의 대사 상태는 어떤가요?" 칩 행.
// UI 전용 — 아직 동작하지 않으므로 링크/onClick 없이 정적으로만 렌더한다.

interface MetabolicChip {
  icon: string; // Material Icons (outlined) 이름
  title: string;
  desc: string; // 2줄 설명 (\n 으로 줄바꿈)
}

const CHIPS: MetabolicChip[] = [
  { icon: "show_chart", title: "식후 스파이크형", desc: "밥 먹고 나면\n혈당이 너무 튀어요" },
  { icon: "restaurant", title: "식탐 제어형", desc: "단 걸 먹어도 자꾸\n가짜 허기가 져요" },
  { icon: "health_and_safety", title: "면역 강화형", desc: "환절기마다\n쉽게 지치고 아파요" },
  { icon: "spa", title: "장 건강형", desc: "속이 더부룩하고\n화장실이 불편해요" },
  { icon: "bedtime", title: "수면 질형", desc: "잠들기 어렵고\n자주 뒤척여요" },
];

export function MetabolicChips() {
  return (
    <div className="flex gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {CHIPS.map((chip) => (
        <div
          key={chip.title}
          className="shrink-0 w-[185px] rounded-[10px] border border-[#e0e0e0] bg-white px-4 py-3.5"
        >
          <div className="flex items-center gap-1.5">
            <span className="material-icons-outlined text-[18px] text-[#888]">{chip.icon}</span>
            <span className="text-[14px] text-black">{chip.title}</span>
          </div>
          <p className="mt-2 text-[12px] leading-[1.45] text-[#888] whitespace-pre-line">
            {chip.desc}
          </p>
        </div>
      ))}
    </div>
  );
}
