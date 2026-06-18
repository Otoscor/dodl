"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";
import { findWellnessProduct } from "../data";

export default function WellnessProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const [detailExpanded, setDetailExpanded] = useState(false);

  const product = findWellnessProduct(productId);

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <BackHeader />
        <p className="p-8 text-center text-[14px] text-[#aaa]">상품을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: product.name, url }); } catch { /* 취소 */ }
    } else {
      showToast("공유 링크가 복사되었습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-36">
      <BackHeader
        rightAction={
          <button
            onClick={handleShare}
            aria-label="공유"
            className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-black"
          >
            <span className="material-icons-outlined text-[20px]">ios_share</span>
          </button>
        }
      />

      {/* 상품 이미지 */}
      <div className="aspect-square bg-[#f5f5f5] relative flex items-center justify-center overflow-hidden">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="material-icons-outlined text-[72px] text-[#e0e0e0]">sensors</span>
        )}
        {/* 캐러셀 점 (장식) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full ${i === 0 ? "w-4 bg-black" : "w-1.5 bg-black/20"}`}
            />
          ))}
        </div>
      </div>

      {/* 상품 정보 */}
      <div className="px-6 pt-7 pb-8">
        <h1 className="text-[22px] text-black leading-snug tracking-[-0.02em] whitespace-pre-line">
          {product.name}
        </h1>
        <div className="mt-3">
          <span className="font-mono text-[24px] font-semibold text-black">
            {formatPrice(product.price)}
          </span>
        </div>
        {product.notes.length > 0 && (
          <ul className="mt-3 space-y-1">
            {product.notes.map((note) => (
              <li key={note} className="text-[13px] text-[#999]">※ {note}</li>
            ))}
          </ul>
        )}
        <p className="mt-5 text-[14px] leading-relaxed text-[#888]">{product.description}</p>
      </div>

      {/* 상품정보 스펙 표 */}
      <div className="px-6 pt-6 pb-2 border-t border-[#e0e0e0]">
        <p className="text-[17px] text-black mb-4">상품정보</p>
        <dl className="divide-y divide-[#f0f0f0]">
          {product.specs.map((row) => (
            <div key={row.label} className="flex gap-4 py-3">
              <dt className="w-24 shrink-0 text-[14px] text-[#888]">{row.label}</dt>
              <dd className="flex-1 text-[14px] text-[#111] break-all leading-relaxed">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* 제품 정보 더보기 (이미지 플레이스홀더) */}
      <div className="border-t border-[#e0e0e0] mt-4">
        <p className="px-6 pt-8 pb-5 text-[17px] text-black">제품 정보</p>
        <div
          className="overflow-hidden"
          style={{ maxHeight: detailExpanded ? 1200 : 320 }}
        >
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={`${product.name} 상세`}
              className="w-full object-cover"
              style={{ minHeight: 500 }}
            />
          ) : (
            <div className="w-full bg-[#f5f5f5] flex flex-col items-center justify-center gap-3" style={{ height: 500 }}>
              <span className="material-icons-outlined text-[48px] text-[#d0d0d0]">sensors</span>
              <p className="text-[13px] text-[#ccc]">제품 상세 이미지</p>
            </div>
          )}
        </div>
        {!detailExpanded && (
          <div
            className="flex flex-col items-center"
            style={{ marginTop: -96, paddingBottom: 32, background: "linear-gradient(to bottom, transparent, white 50%)" }}
          >
            <div style={{ height: 60 }} />
            <button
              onClick={() => setDetailExpanded(true)}
              className="rounded-full bg-[#f0f0f0] px-8 py-3 text-[15px] text-black active:bg-[#e0e0e0]"
            >
              제품 정보 더보기
            </button>
          </div>
        )}
        {detailExpanded && (
          <div className="flex justify-center pt-4 pb-8">
            <button
              onClick={() => setDetailExpanded(false)}
              className="rounded-full bg-[#f0f0f0] px-8 py-3 text-[15px] text-black active:bg-[#e0e0e0]"
            >
              접기
            </button>
          </div>
        )}
      </div>

      {/* 하단 아코디언 */}
      <div className="border-t border-[#e0e0e0] mt-4 divide-y divide-[#f0f0f0]">
        <Accordion title="사용 방법">
          <p className="text-[14px] text-[#666] leading-relaxed">{product.usageGuide}</p>
        </Accordion>
        <Accordion title="배송 안내">
          <p className="text-[14px] text-[#666] leading-relaxed">{product.shipping}</p>
        </Accordion>
        <Accordion title="주의사항">
          <p className="text-[14px] text-[#666] leading-relaxed">{product.caution}</p>
        </Accordion>
      </div>

      {/* 고정 하단 CTA */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white px-6 py-4 z-30 border-t border-[#f0f0f0]">
        <Button
          fullWidth
          size="lg"
          onClick={() => showToast("준비 중입니다", "info")}
        >
          {formatPrice(product.price)} 구매하기
        </Button>
      </div>
    </div>
  );
}
