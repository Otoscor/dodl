"use client";

import type { CartItem } from "../policy";
import { formatWon } from "../policy";

// 가격 변동 확인 모달 (정책서 3.1 예외 — PRICE_CHANGED만 있을 때 확인 후 진행).
export default function ConfirmModal({
  items,
  onConfirm,
  onCancel,
}: {
  items: CartItem[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-[24px]">
      <button type="button" aria-label="닫기" onClick={onCancel} className="absolute inset-0 bg-[rgba(0,0,0,0.6)]" />
      <div className="relative w-full max-w-[320px] rounded-[16px] bg-white p-[20px]">
        <p className="text-[17px] font-bold text-[#1a1919]">변경된 금액을 확인해주세요</p>
        <p className="mt-[6px] text-[13px] text-[#8a8585]">
          담은 이후 아래 상품의 가격이 변경되었어요. 반영 후 결제를 진행할까요?
        </p>
        <div className="my-[16px] flex flex-col gap-[10px]">
          {items.map((i) => (
            <div key={i.id} className="flex items-center justify-between text-[13px]">
              <span className="min-w-0 flex-1 truncate pr-[8px] text-[#1a1919]">{i.name}</span>
              <span className="shrink-0">
                {i.prevPrice !== undefined && (
                  <span className="text-[#bebbbb] line-through">{formatWon(i.prevPrice)}</span>
                )}{" "}
                <span className="font-bold text-[#1a1919]">{formatWon(i.salePrice)}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-[8px]">
          <button
            type="button"
            onClick={onCancel}
            className="h-[48px] flex-1 rounded-full border border-[rgba(26,25,25,0.2)] bg-white text-[15px] font-bold text-[#1a1919]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-[48px] flex-1 rounded-full bg-[#1a1919] text-[15px] font-bold text-white"
          >
            반영 후 결제
          </button>
        </div>
      </div>
    </div>
  );
}
