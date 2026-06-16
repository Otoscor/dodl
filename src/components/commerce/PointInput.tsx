"use client";

import { useState, useEffect, useRef } from "react";
import { formatPrice } from "@/lib/utils";

interface PointInputProps {
  balance: number;
  applied: number;
  onChange: (amount: number) => void;
}

export function PointInput({ balance, applied, onChange }: PointInputProps) {
  const isEmpty = balance === 0;
  const [draft, setDraft] = useState(applied > 0 ? String(applied) : "");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setDraft(applied > 0 ? String(applied) : "");
  }, [applied]);

  const handleInput = (raw: string) => {
    const onlyNums = raw.replace(/[^0-9]/g, "");
    setDraft(onlyNums);
    const num = Number(onlyNums);
    if (onlyNums === "" || num === 0) {
      onChange(0);
    } else {
      onChange(Math.min(num, balance));
    }
  };

  const handleApplyAll = () => {
    setDraft(String(balance));
    onChange(balance);
  };

  const handleReset = () => {
    setDraft("");
    onChange(0);
  };

  const isApplied = applied > 0;

  return (
    <div className="space-y-2">
      <div className={`bg-[#f5f5f5] rounded-[12px] px-4 py-3.5 border-2 transition-colors ${focused ? "border-black" : "border-transparent"}`}>
        <p className="text-[12px] text-[#888] mb-1">포인트</p>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1 flex-1 min-w-0">
            <input
              type="text"
              inputMode="numeric"
              value={draft}
              onChange={(e) => handleInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="0"
              disabled={isEmpty}
              className="bg-transparent text-[22px] font-medium text-black w-full outline-none placeholder:text-[#ccc] tabular-nums disabled:cursor-not-allowed"
            />
            {(draft !== "" || isApplied) && (
              <span className="text-[16px] text-[#888] shrink-0">p</span>
            )}
          </div>
          <button
            type="button"
            onClick={isApplied ? handleReset : handleApplyAll}
            disabled={isEmpty}
            className={`px-3.5 py-1.5 text-[13px] rounded-full border shrink-0 transition-colors ${
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
