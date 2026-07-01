"use client";

import { useState } from "react";
import { PRODUCT } from "../../data";
import { Screen } from "../wf";

// S-01 · 상품 상세 → "구매하기" 탭 시 구매/선물 선택 시트 (캡처 1·2).
export default function S01Product({ onGift }: { onGift: () => void }) {
  const [sheet, setSheet] = useState(false);
  const [qty, setQty] = useState(1);

  return (
    <Screen>
      {/* 앱바 — 온라인 스토어 */}
      <div className="flex h-[48px] items-center gap-[10px] border-b border-[#ececec] px-[14px]">
        <span className="text-[16px] text-[#9a9a9a]">‹</span>
        <p className="flex-1 text-center text-[14px] font-bold text-[#333]">온라인 스토어</p>
        <span className="size-[16px] rounded-full border border-[#c9c9c9]" />
        <span className="size-[16px] rounded-[3px] border border-[#c9c9c9]" />
        <span className="text-[14px] text-[#9a9a9a]">✕</span>
      </div>

      <div className="flex flex-1 flex-col gap-[14px] p-[16px]">
        <div className="wf-img h-[220px] w-full rounded-[8px]" />
        <p className="text-[15px] font-bold text-[#333]">{PRODUCT.name}</p>
        <p className="text-[12px] leading-[1.6] text-[#9a9a9a]">{PRODUCT.desc}</p>
        <p className="text-[18px] font-bold text-[#333]">{PRODUCT.price.toLocaleString("ko-KR")}원</p>
        <div className="flex items-center justify-between border-t border-[#ececec] pt-[14px]">
          <span className="text-[13px] font-bold text-[#6b6b6b]">상품정보</span>
          <span className="size-[22px] rounded-full border border-[#c9c9c9]" />
        </div>
      </div>

      {/* 구매하기 */}
      <div className="mt-auto border-t border-[#ececec] p-[14px]">
        <button
          type="button"
          onClick={() => setSheet(true)}
          className="flex h-[46px] w-full items-center justify-center gap-[8px] rounded-[8px] bg-[#2f2f2f] text-[14px] font-bold text-white"
        >
          <span className="text-[13px]">🛒</span> 구매하기
        </button>
      </div>

      {/* 구매/선물 선택 시트 */}
      {sheet && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end bg-[rgba(0,0,0,0.35)]">
          <button type="button" aria-label="닫기" onClick={() => setSheet(false)} className="flex-1" />
          <div className="rounded-t-[16px] bg-white p-[16px]">
            <p className="text-[14px] font-bold text-[#333]">{PRODUCT.name}</p>
            <div className="mt-[12px] flex items-center justify-between rounded-[8px] border border-[#e0e0e0] p-[12px]">
              <div className="flex items-center gap-[10px]">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex size-[26px] items-center justify-center rounded-full border border-[#c9c9c9] text-[#4b4b4b]">−</button>
                <span className="w-[24px] text-center text-[14px] font-bold text-[#333]">{qty}</span>
                <button type="button" onClick={() => setQty((q) => q + 1)} className="flex size-[26px] items-center justify-center rounded-full border border-[#c9c9c9] text-[#4b4b4b]">+</button>
              </div>
              <span className="text-[13px] font-bold text-[#333]">{PRODUCT.price.toLocaleString("ko-KR")}원</span>
            </div>
            <div className="mt-[12px] flex items-center justify-between">
              <span className="text-[13px] text-[#6b6b6b]">총 금액</span>
              <span className="text-[16px] font-bold text-[#333]">{(PRODUCT.price * qty).toLocaleString("ko-KR")}원</span>
            </div>
            <div className="mt-[14px] flex items-center gap-[8px]">
              <span className="text-[16px] text-[#9a9a9a]">🛒</span>
              <button
                type="button"
                onClick={onGift}
                className="h-[46px] flex-1 rounded-[8px] border border-[#2f2f2f] bg-white text-[14px] font-bold text-[#2f2f2f]"
              >
                선물하기
              </button>
              <button
                type="button"
                onClick={() => setSheet(false)}
                className="h-[46px] flex-1 rounded-[8px] bg-[#2f2f2f] text-[14px] font-bold text-white"
              >
                구매하기
              </button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
