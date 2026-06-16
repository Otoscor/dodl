"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";

interface PointInputProps {
  balance: number;
  applied: number;
  onChange: (amount: number) => void;
}

export function PointInput({ balance, applied, onChange }: PointInputProps) {
  const isEmpty = balance === 0;
  const isApplied = applied > 0;
  const [draft, setDraft] = useState(applied > 0 ? String(applied) : "");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setDraft(applied > 0 ? String(applied) : "");
  }, [applied]);

  const handleInput = (raw: string) => {
    const onlyNums = raw.replace(/[^0-9]/g, "");
    setDraft(onlyNums);
    const num = Number(onlyNums);
    onChange(onlyNums === "" || num === 0 ? 0 : Math.min(num, balance));
  };

  const handleApplyAll = () => {
    setDraft(String(balance));
    onChange(balance);
  };

  const handleReset = () => {
    setDraft("");
    onChange(0);
  };

  return (
    <div className="space-y-2">
      <div
        className={`bg-[#f5f5f5] rounded-[14px] px-4 py-3.5 border-2 transition-colors ${
          focused ? "border-black" : "border-transparent"
        }`}
      >
        <p className="text-[12px] text-[#888] mb-1.5">포인트</p>
        <div className="flex items-center gap-3">
          {/* 금액 입력 */}
          <input
            type="text"
            inputMode="numeric"
            value={draft}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="0"
            disabled={isEmpty}
            className={`bg-transparent text-[20px] outline-none tabular-nums w-20 shrink-0 disabled:cursor-not-allowed transition-colors ${
              isApplied ? "font-bold text-black" : "font-normal text-[#aaa]"
            }`}
          />

          {/* 구분자 */}
          <span className="text-[#ccc] text-[16px] shrink-0">·</span>

          {/* 버튼 (Empty Balance일 때 숨김) */}
          {!isEmpty && (
            <button
              type="button"
              onClick={isApplied ? handleReset : handleApplyAll}
              className="ml-auto px-3.5 py-1.5 text-[13px] rounded-full border border-[#cccccc] bg-white text-black hover:border-black shrink-0 transition-colors"
            >
              {isApplied ? "취소" : "모두 사용"}
            </button>
          )}
        </div>
      </div>

      <p className="text-[13px] font-bold text-black px-1">
        보유 {formatPrice(balance)}P
      </p>
    </div>
  );
}
