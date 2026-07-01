"use client";

// 상단 배너 (정책서 2.2 NEEDS_CONFIRMATION) — 문제 항목 개수 요약 + 해당 항목으로 이동.
export default function CartBanner({
  count,
  reason,
  onJump,
}: {
  count: number;
  reason: string;
  onJump: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onJump}
      className="flex w-full items-center gap-[12px] rounded-[12px] bg-[rgba(255,78,50,0.08)] px-[16px] py-[12px] text-left"
    >
      <span className="flex size-[20px] shrink-0 items-center justify-center rounded-full bg-[#ff4e32]">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M6 3V6.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="6" cy="8.6" r="0.8" fill="white" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-[#1a1919]">확인이 필요한 상품이 {count}개 있어요</p>
        <p className="mt-0.5 text-[12px] text-[#8a8585]">{reason}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
        <path d="M6 3.5L10.5 8L6 12.5" stroke="#8a8585" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
