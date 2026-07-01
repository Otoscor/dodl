"use client";

import Image from "next/image";
import { DETAIL_PRODUCT, POPULAR_PRODUCTS } from "../data";
import { formatWon } from "../policy";

function ChevronRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 3.5L10.5 8L6 12.5" stroke="#bebbbb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AddedSheet({
  onGoCart,
  onClose,
}: {
  onGoCart: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex justify-center">
      {/* 딤 */}
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-[rgba(0,0,0,0.6)]" />

      {/* 시트 */}
      <div className="absolute bottom-0 w-[360px] overflow-hidden rounded-t-[24px] bg-white">
        {/* 담김 링크 행 */}
        <button type="button" onClick={onGoCart} className="flex w-full items-center gap-[8px] px-[16px] pt-[24px] pb-[16px]">
          <div className="relative size-[56px] shrink-0 overflow-hidden rounded-[8px] bg-[#f5f5f5]">
            <Image src={DETAIL_PRODUCT.hero} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <p className="flex-1 text-left text-[13px] font-bold text-[#1a1919]">
            장바구니에 상품을 담았습니다.
          </p>
          <ChevronRight />
        </button>

        <div className="h-px w-full bg-[rgba(26,25,25,0.05)]" />

        {/* 두들 인기상품 */}
        <div className="flex items-center justify-between px-[16px] pt-[24px] pb-[16px]">
          <p className="text-[17px] font-bold text-[#1d1d1d]">두들 인기상품</p>
          <ChevronRight size={24} />
        </div>
        <div className="flex gap-[16px] overflow-x-auto px-[16px] pb-[16px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {POPULAR_PRODUCTS.map((p) => (
            <div key={p.id} className="flex w-[140px] shrink-0 flex-col gap-[16px]">
              <div className="relative h-[140px] w-full overflow-hidden rounded-[8px] bg-[#f5f5f5]">
                <Image src={p.image} alt="" fill sizes="140px" className="object-cover" />
              </div>
              <div className="flex flex-col gap-[8px]">
                <p className="w-full break-words text-[15px] text-[#1a1919]">{p.name}</p>
                <p className="text-[13px] font-bold text-black">{formatWon(p.price)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 닫기 */}
        <div className="px-[16px] pb-[36px] pt-[8px]">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[52px] w-full items-center justify-center rounded-full border border-[rgba(26,25,25,0.2)] bg-white text-[17px] font-bold text-[#1a1919]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
