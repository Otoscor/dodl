"use client";

// 발신자 / 받는분 토글 (받는분은 후속 — 준비중 disabled).
export default function FlowToggle() {
  return (
    <div className="inline-flex rounded-full border border-[#d4d4d4] bg-white p-[3px] text-[13px]">
      <span className="rounded-full bg-[#2f2f2f] px-[14px] py-[6px] font-bold text-white">발신자</span>
      <span
        className="cursor-not-allowed rounded-full px-[14px] py-[6px] text-[#bcbcbc]"
        title="후속 단계에서 구현 예정"
        aria-disabled
      >
        받는분 · 준비중
      </span>
    </div>
  );
}
