"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { OptionSelector } from "@/components/commerce/OptionSelector";
import { IndicatorGradeTable } from "@/components/commerce/IndicatorGradeTable";
import { AdditiveCards } from "@/components/commerce/AdditiveCards";
import { Accordion } from "@/components/ui/Accordion";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import { RatingSummary } from "@/components/commerce/review/RatingSummary";
import { PhotoStrip } from "@/components/commerce/review/PhotoStrip";
import { ReviewCard } from "@/components/commerce/review/ReviewCard";
import { useCart } from "@/hooks/useCart";
import { formatPrice, originalPrice } from "@/lib/utils";
import type { ProductDetail, Sku, Review } from "@/types/product";

const REVIEW_PREVIEW_COUNT = 3;

type SheetAction = "cart" | "buy" | "gift";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { refresh } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [detailExpanded, setDetailExpanded] = useState(false);

  // Review section (상세 하단 인라인 섹션)
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const reviewSectionRef = useRef<HTMLElement>(null);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetAction, setSheetAction] = useState<SheetAction>("cart");
  const [selectedSku, setSelectedSku] = useState<Sku | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  }, [productId]);

  // 리뷰는 상세 하단 섹션에서 항상 노출 → 마운트 시 로드 (초기 reviewsLoading=true)
  useEffect(() => {
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews);
        setReviewsLoading(false);
      })
      .catch(() => setReviewsLoading(false));
  }, [productId]);

  const scrollToReviews = () => {
    reviewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: product?.name ?? "dodl", url });
      } catch {
        /* 사용자 취소 — 무시 */
      }
    } else {
      showToast("공유 링크가 복사되었습니다.");
    }
  };

  const handleSkuSelected = useCallback((sku: Sku | null, qty: number) => {
    setSelectedSku(sku);
    setQuantity(qty);
  }, []);

  const openSheet = (action: SheetAction) => {
    setSheetAction(action);
    setSheetOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedSku || selectedSku.stock === 0) return;

    // 선물하기 — 장바구니 비경유, 선택 SKU를 쿼리로 선물 플로우에 전달
    if (sheetAction === "gift") {
      router.push(`/gift?skuId=${selectedSku.id}&qty=${quantity}`);
      return;
    }

    setConfirming(true);

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skuId: selectedSku.id, quantity }),
    });
    const data = await res.json();

    if (data.success) {
      await refresh();
      if (sheetAction === "cart") {
        showToast("장바구니에 담았습니다.");
        setSheetOpen(false);
      } else {
        router.push("/checkout");
      }
    } else {
      showToast(data.message, "error");
    }
    setConfirming(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!product)
    return (
      <div className="p-8 text-center text-[#aaa]">
        상품을 찾을 수 없습니다.
      </div>
    );

  const allSoldOut = product.skus.every((s) => s.stock === 0);
  const minPrice = Math.min(...product.skus.map((s) => s.price));
  const maxPrice = Math.max(...product.skus.map((s) => s.price));
  const hasRange = minPrice !== maxPrice;

  const info = product.detail_info;
  const brand = info?.brand;
  const specRows = buildSpecRows(product);

  // 바텀시트 CTA 레이블
  const confirmLabel = () => {
    if (!selectedSku || selectedSku.stock === 0) return "옵션을 선택해주세요";
    const total = formatPrice(selectedSku.price * quantity);
    if (sheetAction === "cart") return `${total} 장바구니 담기`;
    if (sheetAction === "gift") return `${total} 선물하기`;
    return `${total} 구매하기`;
  };

  return (
    <>
      {/* 본문 — CTA 바(56px) + 탭바(56px) 높이만큼 하단 여백 */}
      <div className="min-h-screen bg-white pb-36">
        <BackHeader
          rightAction={
            <button
              onClick={handleShare}
              aria-label="공유"
              className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-black cursor-pointer"
            >
              <span className="material-icons-outlined text-[20px]">ios_share</span>
            </button>
          }
        />

        {/* 상품 이미지 — 캐러셀 쉘 (이미지 1장 + 장식용 점) + 영양 배지 */}
        <div className="aspect-[3/4] bg-[#f5f5f5] relative flex items-center justify-center overflow-hidden">
          {product.image_url?.startsWith("http") ? (
            <img src={product.image_url} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <span className="material-icons-outlined text-[72px] text-[#e0e0e0]">medication</span>
          )}

          {/* 캐러셀 점 (장식) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === 0 ? "w-4 bg-black" : "w-1.5 bg-white/70"
                }`}
              />
            ))}
          </div>

          {allSoldOut && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Badge variant="red" className="text-[15px] px-4 py-1.5">
                품절
              </Badge>
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="px-6 pt-7 pb-8">
          {brand && (
            <p className="text-[13px] text-[#888] mb-1.5">{brand}</p>
          )}
          <h1 className="text-[22px] text-black leading-snug tracking-[-0.02em]">
            {product.name}
          </h1>

          {/* 가격 — 취소선 정상가 + 큰 최종가 */}
          {allSoldOut ? (
            <p className="mt-3 text-[15px] text-[#e0e0e0]">품절</p>
          ) : (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-[14px] text-[#bbb] line-through">
                {formatPrice(originalPrice(minPrice))}
              </span>
              <span className="font-mono text-[24px] font-semibold text-black">
                {formatPrice(minPrice)}
                {hasRange && <span className="text-[#aaa] text-[15px] font-normal"> ~</span>}
              </span>
            </div>
          )}

          {/* 별점 + 리뷰 보기 */}
          {product.review_summary.review_count > 0 && (
            <button
              type="button"
              onClick={scrollToReviews}
              className="mt-3 flex items-center gap-1.5 text-[14px] active:opacity-70"
            >
              <span className="text-black">★</span>
              <span className="text-black">
                {product.review_summary.average_rating.toFixed(1)}
              </span>
              <span className="text-[#aaa]">
                {product.review_summary.review_count}개 리뷰 보기
              </span>
              <span className="text-[#e0e0e0] text-[11px]">›</span>
            </button>
          )}
        </div>

        {/* 지표등급표 */}
        {product.detail_info?.indicatorGrades && product.detail_info.indicatorGrades.length > 0 && (
          <IndicatorGradeTable grades={product.detail_info.indicatorGrades} />
        )}

        {/* 첨가물 알아보기 */}
        {product.detail_info?.additives && product.detail_info.additives.length > 0 && (
          <AdditiveCards additives={product.detail_info.additives} productId={product.id} />
        )}

        {/* 상품정보 — 스펙 표 */}
        {specRows.length > 0 && (
          <div className="px-6 pt-8 pb-2 border-t border-[#e0e0e0]">
            <p className="text-[17px] text-black mb-4">상품정보</p>
            <dl className="divide-y divide-[#f0f0f0]">
              {specRows.map((row) => (
                <div key={row.label} className="flex gap-4 py-3">
                  <dt className="w-24 shrink-0 text-[14px] text-[#888]">{row.label}</dt>
                  <dd className="flex-1 text-[14px] text-[#111] break-all leading-relaxed">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* 제품 정보 — 이미지 + 더보기/접기 */}
        <div className="border-t border-[#e0e0e0]">
          <p className="px-6 pt-8 pb-5 text-[17px] text-black">제품 정보</p>

          <div
            className="overflow-hidden"
            style={{ maxHeight: detailExpanded ? 1200 : 320 }}
          >
            {product.image_url?.startsWith("http") ? (
              <img
                src={product.image_url}
                alt={`${product.name} 상세`}
                className="w-full object-cover"
                style={{ minHeight: 500 }}
              />
            ) : (
              <div className="w-full bg-[#f5f5f5]" style={{ height: 500 }} />
            )}
          </div>

          {/* 그라디언트 페이드 + 더보기 버튼 — overflow 바깥 */}
          {!detailExpanded && (
            <div
              className="flex flex-col items-center"
              style={{
                marginTop: -96,
                paddingBottom: 32,
                background: "linear-gradient(to bottom, transparent, white 50%)",
              }}
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

        {/* 리뷰 — 인라인 섹션 */}
        <section ref={reviewSectionRef} className="border-t border-[#e0e0e0] scroll-mt-16">
          <div className="px-6 pt-6 pb-1">
            <h2 className="text-[17px] font-medium text-black">리뷰</h2>
          </div>

          {/* 평점 요약 */}
          {product.review_summary.review_count > 0 && (
            <RatingSummary summary={product.review_summary} />
          )}

          {/* 포토 영상 리뷰 */}
          {!reviewsLoading && (
            <PhotoStrip
              photos={reviews.flatMap((r) => r.photo_urls)}
              onSeeAll={() => router.push(`/products/${productId}/reviews/photos`)}
            />
          )}

          {/* 리뷰 목록 (미리보기 상위 N개) */}
          <div className="px-6">
            {reviewsLoading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : reviews.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-[#aaa]">
                아직 작성된 후기가 없습니다.
              </p>
            ) : (
              reviews
                .slice(0, REVIEW_PREVIEW_COUNT)
                .map((review) => <ReviewCard key={review.id} review={review} />)
            )}
          </div>

          {/* 전체보기 */}
          {reviews.length > 0 && (
            <div className="px-6 pt-5 pb-2">
              <button
                type="button"
                onClick={() => router.push(`/products/${productId}/reviews`)}
                className="w-full rounded-[10px] border border-[#e0e0e0] py-3.5 text-[15px] text-black active:bg-[#f5f5f5]"
              >
                상품 리뷰 전체보기 ({product.review_summary.review_count})
              </button>
            </div>
          )}
        </section>

        {/* 하단 아코디언 */}
        <div className="mt-6 border-t border-[#e8e8e8]">
          <Accordion title="상품 번호">
            <span className="break-all">{product.id}</span>
          </Accordion>
          <Accordion title="상품 결제 정보">
            가상 지갑(데모)으로 결제됩니다. 주문 즉시 잔액에서 차감되며, 취소·반품 시 전액
            환불됩니다. 실제 결제 수단(카드·계좌)은 연동되어 있지 않습니다.
          </Accordion>
          <Accordion title="배송 안내">
            {info?.shipping ?? "배송 정보가 준비 중입니다."}
          </Accordion>
          <Accordion title="교환 / 반품 안내">
            배송 완료 후 7일 이내 교환·반품 신청이 가능합니다. 단순 변심의 경우 왕복 배송비가
            부과되며, 개봉·섭취한 식품은 교환·반품이 제한될 수 있습니다.
          </Accordion>
          <Accordion title="고객센터 문의">
            평일 10:00–18:00 (점심 12:00–13:00, 주말·공휴일 휴무). 1:1 문의는 마이페이지 &gt;
            1:1 문의에서 접수해 주세요.
          </Accordion>
        </div>
      </div>

      {/* 고정 하단 CTA — 탭바 위 */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-md px-5 py-3 z-30">
        {allSoldOut ? (
          <Button fullWidth disabled size="lg">
            품절
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            {/* 선물하기 — 아이콘 버튼 */}
            <button
              onClick={() => openSheet("gift")}
              className="flex items-center justify-center w-[52px] h-[52px] rounded-[10px] bg-[#f5f5f5] shrink-0 active:bg-[#ebebeb] transition-colors"
            >
              <span className="material-icons text-[22px] text-[#555]">redeem</span>
            </button>
            {/* 장바구니 — 아이콘 버튼 */}
            <button
              onClick={() => openSheet("cart")}
              className="flex items-center justify-center w-[52px] h-[52px] rounded-[10px] bg-[#f5f5f5] shrink-0 active:bg-[#ebebeb] transition-colors"
            >
              <span className="material-icons text-[22px] text-[#555]">shopping_cart</span>
            </button>
            {/* 구매하기 — 메인 CTA */}
            <Button
              variant="primary"
              size="lg"
              className="flex-1 !h-[52px]"
              onClick={() => openSheet("buy")}
            >
              구매하기
            </Button>
          </div>
        )}
      </div>

      {/* 옵션 선택 바텀시트 */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        {/* 시트 헤더 — 상품 미니 요약 */}
        <div className="flex items-center gap-3 px-4 pt-2 pb-4 border-b border-[#e0e0e0]">
          <div className="w-12 h-12 bg-[#ebebeb] rounded-[10px] flex items-center justify-center shrink-0">
            <span className="material-icons-outlined text-[24px] text-[#aaa]">medication</span>
          </div>
          <div className="min-w-0">
            <p className="text-[16px] text-black truncate">
              {product.name}
            </p>
            <p className="font-mono text-[15px] text-[#888] mt-0.5">
              {hasRange
                ? `${formatPrice(minPrice)} ~`
                : formatPrice(minPrice)}
            </p>
          </div>
        </div>

        {/* 옵션 선택 영역 — 높은 상품은 스크롤 */}
        <div className="px-4 py-4 overflow-y-auto max-h-[52vh]">
          <OptionSelector
            optionGroups={product.option_groups}
            skus={product.skus}
            onSkuSelected={handleSkuSelected}
          />
        </div>

        {/* 시트 하단 확정 버튼 */}
        <div className="px-4 pt-3 pb-6 border-t border-[#e0e0e0]">
          <Button
            fullWidth
            size="lg"
            disabled={!selectedSku || selectedSku.stock === 0 || confirming}
            onClick={handleConfirm}
          >
            {confirming ? "처리 중..." : confirmLabel()}
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}

// detail_info를 레퍼런스 스펙표 형태로 매핑 (있는 데이터만)
function buildSpecRows(product: ProductDetail): { label: string; value: string }[] {
  const info = product.detail_info ?? ({} as ProductDetail["detail_info"]);
  const rows: { label: string; value: string }[] = [];

  // manufacturer는 "제조사: … | 원산지: … | 유통기한: …" 파이프 문자열
  if (info.manufacturer) {
    for (const part of info.manufacturer.split("|")) {
      const idx = part.indexOf(":");
      if (idx === -1) continue;
      const label = part.slice(0, idx).trim();
      const value = part.slice(idx + 1).trim();
      if (label && value) rows.push({ label, value });
    }
  }

  // 주요 정보 — keySpecs 묶음
  if (info.keySpecs && info.keySpecs.length > 0) {
    rows.push({ label: "주요 정보", value: info.keySpecs.join(" · ") });
  }

  // 상품번호
  rows.push({ label: "상품번호", value: product.id });

  return rows;
}
