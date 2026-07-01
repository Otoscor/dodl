"use client";

import { STEPS, type StepId } from "../data";

// 1~5 단계 진행 + 현재 상태 머신 값.
export default function StepIndicator({ current }: { current: StepId }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  const state = STEPS[idx]?.state ?? "—";

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center">
        {STEPS.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-[4px]">
                <span
                  className={`flex size-[26px] items-center justify-center rounded-full border text-[12px] font-bold ${
                    active
                      ? "border-[#2f2f2f] bg-[#2f2f2f] text-white"
                      : done
                        ? "border-[#9a9a9a] bg-[#9a9a9a] text-white"
                        : "border-[#c9c9c9] bg-white text-[#9a9a9a]"
                  }`}
                >
                  {s.num}
                </span>
                <span
                  className={`hidden whitespace-nowrap text-[10px] sm:block ${
                    active ? "font-bold text-[#333]" : "text-[#9a9a9a]"
                  }`}
                >
                  {s.title.split(" · ")[0]}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-[2px] mb-[16px] h-px flex-1 ${done ? "bg-[#9a9a9a]" : "bg-[#dcdcdc]"}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-[#9a9a9a]">
        상태 머신: <span className="font-bold text-[#4b4b4b]">{state}</span>
      </p>
    </div>
  );
}
