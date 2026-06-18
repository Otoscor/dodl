"use client";

import { useMemo, useState } from "react";
import { MetabolicChips } from "@/components/commerce/MetabolicChips";
import { MagazineCard } from "@/components/commerce/MagazineCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ProductListItem } from "@/types/product";
import { HEALTH_CONCERNS, augmentFor } from "./mock";

interface HomeFeedProps {
  products: ProductListItem[];
}

// 모든 상품을 한 번 보강(index round-robin) — 칩/탭 필터의 단일 소스.
export function HomeFeed({ products }: HomeFeedProps) {
  const [activeId, setActiveId] = useState<string | null>(null); // null = 전체

  const augmented = useMemo(
    () => products.map((product, i) => ({ product, augment: augmentFor(product.id, i) })),
    [products]
  );

  const filtered = activeId
    ? augmented.filter((a) => a.augment.concern.id === activeId)
    : augmented;

  // 칩 탭: 같은 칩 재선택 시 전체로 토글
  const handleChipSelect = (id: string) => setActiveId((prev) => (prev === id ? null : id));

  const tabs: { id: string | null; label: string }[] = [
    { id: null, label: "전체" },
    ...HEALTH_CONCERNS.map((c) => ({ id: c.id, label: c.label })),
  ];

  return (
    <>
      {/* 건강 고민 칩 레일 */}
      <section className="mt-2">
        <h2 className="text-[20px] leading-snug text-black px-6 mb-5">
          오늘 당신의 대사 상태는 어떤가요?
        </h2>
        <MetabolicChips
          concerns={HEALTH_CONCERNS}
          activeId={activeId}
          onSelect={handleChipSelect}
        />
      </section>

      {/* 언더라인 필터 탭 */}
      <div className="mt-8 flex border-b border-[#e0e0e0] sticky top-16 z-20 bg-white overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <button
              key={tab.id ?? "all"}
              onClick={() => setActiveId(tab.id)}
              className={`shrink-0 px-5 py-3.5 text-[14px] tracking-[0.02em] transition-colors relative ${
                active ? "text-black font-bold" : "text-[#aaa]"
              }`}
            >
              {tab.label}
              {active && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />}
            </button>
          );
        })}
      </div>

      {/* 피드 */}
      {filtered.length > 0 ? (
        <section className="mt-10 flex flex-col gap-12 px-6">
          {filtered.map(({ product, augment }) => (
            <MagazineCard key={product.id} product={product} augment={augment} />
          ))}
        </section>
      ) : (
        <EmptyState title="상품 준비 중" description="이 건강 고민에 맞는 상품을 준비하고 있어요." />
      )}
    </>
  );
}
