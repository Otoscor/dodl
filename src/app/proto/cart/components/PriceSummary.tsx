// 가격 요약 (최종 결제 금액) — Figma Order.PriceSummary + 정책서 시뮬레이션 결과.
import { formatWon, type PriceSummary as Summary } from "../policy";

export default function PriceSummary({
  summary,
  onRecalculate,
}: {
  summary: Summary;
  onRecalculate: () => void;
}) {
  const rows = [
    { label: "총 금액", value: formatWon(summary.total) },
    { label: "예상 할인 금액", value: `-${formatWon(summary.discount)}` },
    { label: "배송비 (예상)", value: formatWon(summary.shipping) },
  ];

  return (
    <div className="flex w-full flex-col gap-[16px]">
      <div className="flex items-center justify-between">
        <p className="text-[17px] font-bold text-[#1d1d1d]">최종 결제 금액</p>
        <button
          type="button"
          onClick={onRecalculate}
          className="flex items-center gap-[4px] text-[12px] font-medium text-[#8a8585]"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <path d="M11 6.5a4.5 4.5 0 1 1-1.3-3.2M11 1.5v2.2H8.8" stroke="#8a8585" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          다시 계산
        </button>
      </div>
      <div className="flex w-full flex-col gap-[17px]">
        <div className="flex w-full flex-col gap-[8px]">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-[13px]">
              <p className="text-[#a6a1a1]">{r.label}</p>
              <p className="text-right text-[#8a8585]">{r.value}</p>
            </div>
          ))}
        </div>
        <div className="h-px w-full bg-[rgba(26,25,25,0.05)]" />
        <div className="flex w-full items-center justify-between">
          <p className="text-[13px] text-[#a6a1a1]">결제 예상 금액</p>
          <p className="text-right text-[17px] font-bold text-[#1d1d1d]">{formatWon(summary.payable)}</p>
        </div>
      </div>
    </div>
  );
}
