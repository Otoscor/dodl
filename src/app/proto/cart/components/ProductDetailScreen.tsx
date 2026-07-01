"use client";

import Image from "next/image";
import { DETAIL_PRODUCT } from "../data";
import { formatWon } from "../policy";
import StatusBar from "./StatusBar";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={filled ? "#ffb400" : "#e5e3e3"} aria-hidden>
      <path d="M8 1.3l2 4 4.4.6-3.2 3.1.8 4.4L8 11l-4 2.1.8-4.4L1.6 5.9 6 5.3z" />
    </svg>
  );
}

function Check({ on }: { on: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 8.5L6.5 12L13 4.5" stroke={on ? "#3fbf50" : "#bebbbb"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProductDetailScreen({
  onAdd,
  onBack,
}: {
  onAdd: () => void;
  onBack: () => void;
}) {
  const p = DETAIL_PRODUCT;
  return (
    <div className="flex justify-center">
      <div className="relative w-[360px] min-h-screen bg-white pb-[120px]">
        {/* 상태바 + 타이틀바 */}
        <div className="absolute left-0 top-0 z-20 w-full">
          <StatusBar />
          <div className="flex h-[56px] items-center justify-between px-[16px]">
            <button type="button" aria-label="뒤로가기" onClick={onBack} className="size-[24px]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15 5L8 12L15 19" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M14 6a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM6 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm8 6a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" stroke="#0a0a0a" strokeWidth="1.6" />
              <path d="M10 11l4-2.5M10 13l4 2.5" stroke="#0a0a0a" strokeWidth="1.6" />
            </svg>
          </div>
        </div>

        {/* 히어로 이미지 */}
        <div className="relative h-[360px] w-full bg-[#f5f5f5]">
          <Image src={p.hero} alt="" fill sizes="360px" className="object-cover" priority />
        </div>

        {/* 상품 정보 */}
        <div className="flex flex-col gap-[16px] px-[16px] pb-[24px] pt-[16px]">
          <div className="flex flex-col gap-[12px]">
            <p className="text-[17px] font-bold text-[#1d1d1d]">{p.name}</p>
            <div className="flex gap-[4px] text-[13px]">
              <span className="text-[#a6a1a1]">원산지:</span>
              <span className="text-[#8a8585]">{p.origin}</span>
            </div>
          </div>
          <p className="text-[20px] font-bold text-[#1a1919]">{formatWon(p.price)}</p>
          <div className="flex items-center gap-[4px]">
            <div className="flex items-center">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} filled={i < p.rating} />
              ))}
            </div>
            <p className="text-[13px] text-[#a6a1a1]">{p.reviewCount}개 리뷰 보기</p>
          </div>
        </div>

        {/* 클린 스코어 카드 */}
        <div className="mx-[16px] flex flex-col gap-[16px] rounded-[20px] border border-[rgba(26,25,25,0.1)] p-[16px]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-[4px]">
              <p className="text-[13px] font-bold text-[#8a8585]">클린 스코어</p>
              <p className="text-[28px] font-bold text-[#1a1919]">{p.cleanScore}점</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M6 3.5L10.5 8L6 12.5" stroke="#bebbbb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#f4f3f3]">
            <div className="h-full rounded-full bg-[#5fda6b]" style={{ width: `${p.scorePercent}%` }} />
          </div>
          <div className="flex flex-col gap-[16px]">
            {p.tags.map((t) => (
              <div key={t.label} className="flex items-center gap-[4px]">
                <Check on={t.on} />
                <p className={`text-[13px] font-bold ${t.on ? "text-[#1a1919]" : "text-[#bebbbb]"}`}>
                  {t.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 구매하기 */}
        <div className="fixed bottom-0 left-1/2 z-30 w-[360px] -translate-x-1/2">
          <div className="h-[24px] bg-gradient-to-t from-white to-transparent" />
          <div className="bg-white px-[16px] pb-[36px]">
            <button
              type="button"
              onClick={onAdd}
              className="flex h-[53px] w-full items-center justify-center rounded-full bg-[#1a1919] text-[17px] font-bold text-white"
            >
              구매하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
