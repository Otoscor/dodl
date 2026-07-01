"use client";

import { useState } from "react";
import { SCENARIOS, SCENARIO_ORDER, type ScenarioId } from "../data";

// 정책 검증 시나리오 스위처 (정책서 §5 "정책 검증 프레임"의 인터랙티브 버전).
// Figma 디자인 밖의 개발 도구 — 의도적으로 다른 톤(점선 pill).
export default function ScenarioSwitcher({
  current,
  onSelect,
}: {
  current: ScenarioId;
  onSelect: (id: ScenarioId) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-[104px] right-[12px] z-40 flex items-center gap-[6px] rounded-full border border-dashed border-[#8a8585] bg-white/90 px-[12px] py-[8px] text-[12px] font-bold text-[#5a5555] shadow-sm backdrop-blur"
      >
        <span>🧪</span>
        <span className="max-w-[120px] truncate">{SCENARIOS[current].label}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-center">
          <button type="button" aria-label="닫기" onClick={() => setOpen(false)} className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" />
          <div className="absolute bottom-0 w-[360px] rounded-t-[24px] bg-white pb-[24px]">
            <div className="flex items-center justify-between px-[20px] pb-[8px] pt-[20px]">
              <p className="text-[17px] font-bold text-[#1a1919]">정책 검증 시나리오</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="닫기" className="size-[24px]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="#1a1919" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex max-h-[60vh] flex-col overflow-y-auto px-[12px]">
              {SCENARIO_ORDER.map((id) => {
                const s = SCENARIOS[id];
                const active = id === current;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onSelect(id);
                      setOpen(false);
                    }}
                    className={`flex items-center gap-[12px] rounded-[12px] px-[12px] py-[12px] text-left ${
                      active ? "bg-[rgba(26,25,25,0.05)]" : ""
                    }`}
                  >
                    <span
                      className={`size-[16px] shrink-0 rounded-full border-2 ${
                        active ? "border-[#1a1919] bg-[#1a1919]" : "border-[#d5d2d2]"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold text-[#1a1919]">{s.label}</p>
                      <p className="text-[12px] text-[#8a8585]">{s.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
