// 수량 스텝퍼 (Catalog.QuantitySelector 재현).
// 비활성 로직은 policy.ts(canDecrement/canIncrement)로 결정 — 아이콘 색만 회색 처리.

interface Props {
  value: number;
  canDec: boolean;
  canInc: boolean;
  onDec: () => void;
  onInc: () => void;
}

export default function QuantityStepper({ value, canDec, canInc, onDec, onInc }: Props) {
  return (
    <div className="flex h-[32px] w-fit shrink-0 items-center self-start rounded-[8px] border border-[rgba(26,25,25,0.1)] bg-white px-[4px]">
      <button
        type="button"
        aria-label="수량 감소"
        disabled={!canDec}
        onClick={onDec}
        className="flex size-[24px] items-center justify-center rounded-full disabled:cursor-not-allowed"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3.5 8H12.5" stroke={canDec ? "#1a1919" : "#d5d2d2"} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      <span className="w-[40px] min-w-[40px] text-center text-[15px] font-medium text-[#1a1919]">
        {value}
      </span>
      <button
        type="button"
        aria-label="수량 증가"
        disabled={!canInc}
        onClick={onInc}
        className="flex size-[24px] items-center justify-center rounded-full disabled:cursor-not-allowed"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 3.5V12.5M3.5 8H12.5" stroke={canInc ? "#1a1919" : "#d5d2d2"} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
