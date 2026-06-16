"use client";

import { formatPrice } from "@/lib/utils";

interface SelectedItemCardProps {
  optionName: string;
  quantity: number;
  max: number;
  unitPrice: number;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
}

export function SelectedItemCard({
  optionName,
  quantity,
  max,
  unitPrice,
  onQuantityChange,
  onRemove,
}: SelectedItemCardProps) {
  const total = unitPrice * quantity;

  return (
    <div className="bg-[#f5f5f5] rounded-[14px] px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[15px] font-semibold text-black">{optionName}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-[#888] hover:text-black transition-colors"
          aria-label="선택 해제"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="w-8 h-8 rounded-full bg-[#e0e0e0] flex items-center justify-center text-[#888] text-[16px] disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            aria-label="수량 감소"
          >
            −
          </button>
          <span className="text-[15px] font-medium text-black tabular-nums min-w-[16px] text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(Math.min(max, quantity + 1))}
            disabled={quantity >= max}
            className="w-8 h-8 rounded-full bg-[#e0e0e0] flex items-center justify-center text-[#888] text-[16px] disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            aria-label="수량 증가"
          >
            +
          </button>
        </div>

        <span className="text-[20px] font-bold text-black tabular-nums">
          {formatPrice(total)}원
        </span>
      </div>
    </div>
  );
}
