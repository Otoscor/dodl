"use client";

import { formatPrice } from "@/lib/utils";

interface PointInputProps {
  balance: number;
  applied: number;
  onApplyAll: () => void;
  onReset: () => void;
}

export function PointInput({ balance, applied, onApplyAll, onReset }: PointInputProps) {
  const isEmpty = balance === 0;
  const isApplied = applied > 0;

  return (
    <div className="space-y-2">
      <div className="bg-[#f5f5f5] rounded-[12px] px-4 py-3.5">
        <p className="text-[12px] text-[#888] mb-1">포인트</p>
        <div className="flex items-center justify-between">
          <span className={`text-[22px] font-medium tabular-nums ${isApplied ? "text-black" : "text-[#ccc]"}`}>
            {applied}p
          </span>
          <button
            type="button"
            onClick={isApplied ? onReset : onApplyAll}
            disabled={isEmpty}
            className={`px-3.5 py-1.5 text-[13px] rounded-full border transition-colors ${
              isEmpty
                ? "border-[#e0e0e0] text-[#ccc] cursor-not-allowed opacity-30"
                : "border-[#cccccc] text-black hover:border-black bg-white"
            }`}
          >
            {isApplied ? "취소" : "모두 사용"}
          </button>
        </div>
      </div>
      <p className="text-[13px] font-bold text-black px-1">
        보유 {formatPrice(balance)}P
      </p>
    </div>
  );
}
