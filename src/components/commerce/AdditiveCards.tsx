// 상품 상세 — 첨가물 알아보기.
// 대표 첨가물 가로 스크롤(카드는 UI 전용). "원재료 전체보기"는 원재료 페이지로 이동.

import Link from "next/link";
import type { Additive } from "@/types/product";

interface AdditiveCardsProps {
  additives: Additive[];
  productId: string;
}

export function AdditiveCards({ additives, productId }: AdditiveCardsProps) {
  return (
    <section className="pt-10 pb-6">
      <div className="flex items-center justify-between px-6 mb-5">
        <h2 className="text-[17px] text-black">첨가물 알아보기</h2>
        <Link
          href={`/products/${productId}/ingredients`}
          className="flex items-center gap-0.5 text-[13px] text-[#888] active:opacity-60"
        >
          원재료 전체보기
          <span className="material-icons-outlined text-[16px]">chevron_right</span>
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {additives.map((a) => {
          const filled = a.tag === "살펴보기"; // 흑백 구분: 살펴보기=채움 / 알아두기=비움
          return (
            <div
              key={a.name}
              className="shrink-0 w-[170px] bg-white border border-[#e0e0e0] rounded-[10px] p-4 flex flex-col"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    filled ? "bg-[#888]" : "border border-[#888]"
                  }`}
                />
                <span className="text-[12px] text-[#888]">{a.tag}</span>
              </div>
              <p className="mt-2 text-[15px] text-black font-medium line-clamp-1">{a.name}</p>
              <p className="mt-1 text-[12px] text-[#888] leading-[1.45] line-clamp-2 whitespace-pre-line">
                {a.desc}
              </p>
              {/* 비동작 화살표 — UI 전용 */}
              <span className="material-icons-outlined text-[18px] text-[#888] self-end mt-3">
                north_east
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
