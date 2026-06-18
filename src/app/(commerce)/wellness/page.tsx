"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";
import { WELLNESS_INTRO, WELLNESS_BRANDS, type WellnessProduct } from "./data";

export default function WellnessPage() {
  const { showToast } = useToast();
  const [activeBrandId, setActiveBrandId] = useState(WELLNESS_BRANDS[0].id);
  const [imgError, setImgError] = useState(false);
  const activeBrand =
    WELLNESS_BRANDS.find((b) => b.id === activeBrandId) ?? WELLNESS_BRANDS[0];

  return (
    <div className="min-h-screen bg-white px-6 pt-10 pb-28">
      {/* 인트로 카피 */}
      <h1 className="text-[20px] font-bold leading-[1.45] text-black whitespace-pre-line">
        {WELLNESS_INTRO.title}
      </h1>
      <p className="mt-4 text-[14px] leading-[1.7] text-[#888]">
        {WELLNESS_INTRO.description}
      </p>

      {/* 일러스트레이션 (public/wellness/intro.png) */}
      <div className="mt-8 mb-4 flex justify-center">
        {imgError ? (
          <div className="w-[200px] h-[160px] rounded-[14px] bg-[#f5f5f5] flex items-center justify-center">
            <span className="material-icons-outlined text-[40px] text-[#d0d0d0]">image</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={WELLNESS_INTRO.image}
            alt="웰니스 센서 일러스트"
            className="w-[200px] h-auto object-contain"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* 브랜드 탭 */}
      <div className="mt-6 flex gap-6 border-b border-[#e0e0e0]">
        {WELLNESS_BRANDS.map((brand) => {
          const active = brand.id === activeBrandId;
          return (
            <button
              key={brand.id}
              onClick={() => setActiveBrandId(brand.id)}
              className={`relative pb-3 text-[15px] transition-colors ${
                active ? "text-black font-bold" : "text-[#aaa]"
              }`}
            >
              {brand.label}
              {active && <span className="absolute -bottom-px left-0 w-full h-[2px] bg-black" />}
            </button>
          );
        })}
      </div>

      {/* 상품 카드 */}
      <div className="mt-5 space-y-4">
        {activeBrand.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpen={() => showToast("준비 중입니다", "info")}
          />
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onOpen,
}: {
  product: WellnessProduct;
  onOpen: () => void;
}) {
  return (
    <div className="relative rounded-[14px] border border-[#e0e0e0] bg-white p-5 min-h-[200px]">
      <button
        onClick={onOpen}
        aria-label="자세히 보기"
        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center active:bg-[#e8e8e8] transition-colors"
      >
        <span className="material-icons-outlined text-[18px] text-[#666]">north_east</span>
      </button>

      <h2 className="text-[15px] leading-snug text-black whitespace-pre-line pr-12">
        {product.name}
      </h2>
      <p className="mt-3 text-[16px] font-bold text-black">{formatPrice(product.price)}</p>

      {product.notes.length > 0 && (
        <ul className="mt-3 space-y-1">
          {product.notes.map((note) => (
            <li key={note} className="text-[12px] text-[#999]">※ {note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
