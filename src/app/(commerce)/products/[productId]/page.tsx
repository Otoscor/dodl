"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { OptionSelector } from "@/components/commerce/OptionSelector";
import { IndicatorGradeTable } from "@/components/commerce/IndicatorGradeTable";
import { AdditiveCards } from "@/components/commerce/AdditiveCards";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/hooks/useCart";
import { formatPrice, originalPrice } from "@/lib/utils";
import type { ProductDetail, Sku, Review, ReviewSummary } from "@/types/product";

type SheetAction = "cart" | "buy";

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

  // Review sheet state
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Write review sheet state
  const [writeSheetOpen, setWriteSheetOpen] = useState(false);
  const [writeRating, setWriteRating] = useState(0);
  const [writeName, setWriteName] = useState("");
  const [writeBody, setWriteBody] = useState("");
  const [writeSubmitting, setWriteSubmitting] = useState(false);
  const [writePhotos, setWritePhotos] = useState<{ file: File; preview: string }[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

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

  const openReviewSheet = useCallback(() => {
    setReviewSheetOpen(true);
    if (reviews.length === 0) {
      setReviewsLoading(true);
      fetch(`/api/products/${productId}/reviews`)
        .then((r) => r.json())
        .then((data) => {
          setReviews(data.reviews);
          setReviewsLoading(false);
        });
    }
  }, [productId, reviews.length]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - writePhotos.length;
    const toAdd = files.slice(0, remaining).map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setWritePhotos(prev => [...prev, ...toAdd]);
    e.target.value = "";
  };

  const handlePhotoRemove = (index: number) => {
    setWritePhotos(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleWriteReview = async () => {
    if (writeRating === 0 || writeName.trim() === "") return;
    setWriteSubmitting(true);

    let photoUrls: string[] = [];
    if (writePhotos.length > 0) {
      const results = await Promise.all(
        writePhotos.map(async ({ file }) => {
          const fd = new FormData();
          fd.append("file", file);
          const r = await fetch("/api/upload", { method: "POST", body: fd });
          const d = await r.json();
          return d.success ? (d.url as string) : null;
        })
      );
      photoUrls = results.filter((u): u is string => u !== null);
    }

    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author_name: writeName, rating: writeRating, body: writeBody, photo_urls: photoUrls }),
    });
    const data = await res.json();
    setWriteSubmitting(false);
    if (data.success) {
      showToast("리뷰가 등록되었습니다.");
      setWriteSheetOpen(false);
      setWriteRating(0);
      setWriteName("");
      setWriteBody("");
      writePhotos.forEach(p => URL.revokeObjectURL(p.preview));
      setWritePhotos([]);
      setReviewsLoading(true);
      fetch(`/api/products/${productId}/reviews`)
        .then((r) => r.json())
        .then((d) => { setReviews(d.reviews); setReviewsLoading(false); });
    } else {
      showToast(data.message ?? "오류가 발생했습니다.", "error");
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

  // 바텀시트 CTA 레이블
  const confirmLabel = () => {
    if (!selectedSku || selectedSku.stock === 0) return "옵션을 선택해주세요";
    const total = formatPrice(selectedSku.price * quantity);
    return sheetAction === "cart"
      ? `${total} 장바구니 담기`
      : `${total} 구매하기`;
  };

  return (
    <>
      {/* 본문 — CTA 바(56px) + 탭바(56px) 높이만큼 하단 여백 */}
      <div className="min-h-screen bg-white pb-36">
        <BackHeader title={product.category_name} />

        {/* 상품 이미지 */}
        <div className="aspect-[3/4] bg-[#f5f5f5] relative flex items-center justify-center">
          {product.image_url?.startsWith("http") ? (
            <img src={product.image_url} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <span className="material-icons-outlined text-[72px] text-[#e0e0e0]">medication</span>
          )}
          {allSoldOut && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Badge variant="red" className="text-[15px] px-4 py-1.5">
                품절
              </Badge>
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="px-6 py-8 space-y-4">
          <p className="text-[12px] text-[#aaa] uppercase tracking-[0.12em] mb-2">{product.category_name}</p>
          <h1 className="text-[24px] text-black leading-snug tracking-[-0.02em] mb-2">
            {product.name}
          </h1>

          {/* 가격 — 옵션 선택 전 범위 표시 (정상가/최종가) */}
          {allSoldOut ? (
            <div className="flex items-baseline gap-1 !mt-0">
              <span className="text-[15px] text-[#e0e0e0]">품절</span>
            </div>
          ) : (
            <div className="space-y-1 !mt-0">
              {/* 정상가 — 할인 전 가격, 취소선 */}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#aaa]">정상가</span>
                <span className="font-mono text-[15px] text-[#aaa] line-through">
                  {formatPrice(originalPrice(minPrice))}
                </span>
              </div>
              {/* 최종가 — 실제 판매가, 강조 */}
              <div className="flex items-baseline gap-2">
                <span className="text-[14px] text-[#888]">최종가</span>
                <span className="font-mono text-[20px] font-semibold text-black">
                  {formatPrice(minPrice)}
                  {hasRange && <span className="text-[#aaa] text-[14px] font-normal"> ~</span>}
                </span>
              </div>
            </div>
          )}

          {product.review_summary.review_count > 0 && (
            <button
              type="button"
              onClick={openReviewSheet}
              className="flex items-center gap-1.5 text-[15px] text-[#888] active:opacity-70"
            >
              <span className="text-black">★</span>
              <span className="text-black">
                {product.review_summary.average_rating.toFixed(1)}
              </span>
              <span className="text-[#aaa]">
                ({product.review_summary.review_count}개)
              </span>
              <span className="text-[#e0e0e0] text-[11px] ml-0.5">›</span>
            </button>
          )}

          <div className="border-t border-[#e0e0e0] pt-3">
            <p className="text-[15px] text-[#888] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* 옵션 안내 */}
          {!allSoldOut && product.option_groups.length > 0 && (
            <div className="flex items-center gap-2 text-[14px] text-[#aaa] pt-1">
              <span>옵션</span>
              <span className="text-[#e0e0e0]">|</span>
              {product.option_groups.map((g) => g.name).join(", ")}
            </div>
          )}
        </div>

        {/* 지표등급표 */}
        {product.detail_info?.indicatorGrades && product.detail_info.indicatorGrades.length > 0 && (
          <IndicatorGradeTable grades={product.detail_info.indicatorGrades} />
        )}

        {/* 첨가물 알아보기 */}
        {product.detail_info?.additives && product.detail_info.additives.length > 0 && (
          <AdditiveCards additives={product.detail_info.additives} />
        )}

        {/* 상세 정보 섹션 */}
        {product.detail_info && (
          <div className="px-6 pb-8 space-y-0">
            {/* a) 배송 정보 */}
            {product.detail_info.shipping && (
              <div className="py-8 border-t border-[#e0e0e0]">
                <div className="flex items-start gap-2.5">
                  <span className="material-icons-outlined text-[20px] text-[#888] mt-0.5 shrink-0">local_shipping</span>
                  <div>
                    <p className="text-[14px] text-[#888] mb-1">배송 정보</p>
                    <p className="text-[15px] text-black leading-relaxed">{product.detail_info.shipping}</p>
                  </div>
                </div>
              </div>
            )}

            {/* b) 주요 정보 */}
            {product.detail_info.keySpecs && product.detail_info.keySpecs.length > 0 && (
              <div className="py-8 border-t border-[#e0e0e0]">
                <p className="text-[14px] text-[#888] mb-2">주요 정보</p>
                <ul className="space-y-1.5">
                  {product.detail_info.keySpecs.map((spec, i) => (
                    <li key={i} className="flex items-start gap-2 text-[15px] text-black">
                      <span className="text-[#e0e0e0] mt-[2px] shrink-0">·</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* c) 섭취 방법 */}
            {product.detail_info.dosage && (
              <div className="py-8 border-t border-[#e0e0e0]">
                <div className="flex items-start gap-2.5">
                  <span className="material-icons-outlined text-[20px] text-[#888] mt-0.5 shrink-0">schedule</span>
                  <div>
                    <p className="text-[14px] text-[#888] mb-1">섭취 방법</p>
                    <p className="text-[15px] text-black leading-relaxed">{product.detail_info.dosage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* d) 주의사항 */}
            {product.detail_info.caution && (
              <div className="py-8 border-t border-[#e0e0e0]">
                <div className="bg-[#f5f5f5] rounded-[10px] px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <span className="material-icons-outlined text-[20px] text-[#888] mt-0.5 shrink-0">warning_amber</span>
                    <div>
                      <p className="text-[14px] text-[#888] mb-1">주의사항</p>
                      <p className="text-[15px] text-black leading-relaxed">{product.detail_info.caution}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* e) 제조사·원산지 */}
            {product.detail_info.manufacturer && (
              <div className="py-8 border-t border-[#e0e0e0]">
                <div className="flex items-start gap-2.5">
                  <span className="material-icons-outlined text-[20px] text-[#888] mt-0.5 shrink-0">business</span>
                  <div>
                    <p className="text-[14px] text-[#888] mb-1">제조사·원산지</p>
                    <p className="text-[15px] text-black leading-relaxed">{product.detail_info.manufacturer}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 고정 하단 CTA — 탭바 위 */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-md px-6 py-4 z-30">
        {allSoldOut ? (
          <Button fullWidth disabled size="lg">
            품절
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => openSheet("cart")}
            >
              장바구니
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
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

      {/* 리뷰 바텀시트 */}
      <BottomSheet open={reviewSheetOpen} onClose={() => setReviewSheetOpen(false)}>
        <div className="px-4 pt-2 pb-4 border-b border-[#e0e0e0] flex items-start justify-between">
          <div>
            <p className="text-[18px] text-black">구매 후기</p>
            {product.review_summary.review_count > 0 && (
              <p className="text-[14px] text-[#aaa] mt-0.5">
                <span className="text-black">★</span>{" "}
                <span className="text-black">
                  {product.review_summary.average_rating.toFixed(1)}
                </span>
                {" "}· 총 {product.review_summary.review_count}개
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setWriteSheetOpen(true)}
            className="text-[14px] text-[#888] active:opacity-70 mt-0.5"
          >
            리뷰 쓰기
          </button>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          {/* 별점 분포 */}
          {product.review_summary.review_count > 0 && (
            <RatingDistributionChart
              distribution={product.review_summary.rating_distribution}
              total={product.review_summary.review_count}
            />
          )}

          {/* 포토 스트립 — 로딩 완료 후 */}
          {!reviewsLoading && (
            <PhotoStrip photos={reviews.flatMap((r) => r.photo_urls)} />
          )}

          {/* 리뷰 목록 */}
          <div className="px-4 py-3">
            {reviewsLoading ? (
              <div className="py-8 flex justify-center"><LoadingSpinner /></div>
            ) : reviews.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-[#aaa]">
                아직 작성된 후기가 없습니다.
              </p>
            ) : (
              reviews.map((review) => <ReviewCard key={review.id} review={review} />)
            )}
          </div>
          <div className="h-6" />
        </div>
      </BottomSheet>

      {/* 리뷰 작성 바텀시트 */}
      <BottomSheet open={writeSheetOpen} onClose={() => setWriteSheetOpen(false)}>
        <div className="px-4 pt-2 pb-4 border-b border-[#e0e0e0]">
          <p className="text-[18px] text-black">리뷰 작성</p>
          <p className="text-[14px] text-[#aaa] mt-0.5">{product.name}</p>
        </div>
        <div className="px-4 py-5 space-y-5 overflow-y-auto max-h-[65vh]">
          {/* 별점 선택 */}
          <div>
            <p className="text-[15px] text-[#888] mb-2">별점</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setWriteRating(star)}
                  className={`text-[32px] transition-opacity ${star <= writeRating ? "text-black" : "text-[#e0e0e0]"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          {/* 이름 */}
          <div>
            <p className="text-[15px] text-[#888] mb-1.5">이름</p>
            <input
              type="text"
              value={writeName}
              onChange={(e) => setWriteName(e.target.value)}
              placeholder="닉네임을 입력해주세요"
              className="w-full px-3 py-2.5 bg-white text-[15px] text-black placeholder:text-[#cccccc] outline-none rounded-[10px] border border-[#e0e0e0]"
              maxLength={20}
            />
          </div>
          {/* 본문 */}
          <div>
            <p className="text-[15px] text-[#888] mb-1.5">내용 <span className="text-[#e0e0e0]">(선택)</span></p>
            <textarea
              value={writeBody}
              onChange={(e) => setWriteBody(e.target.value)}
              placeholder="상품 사용 후기를 자유롭게 작성해주세요."
              rows={4}
              className="w-full px-3 py-2.5 bg-white text-[15px] text-black placeholder:text-[#cccccc] outline-none resize-none rounded-[10px] border border-[#e0e0e0]"
              maxLength={500}
            />
          </div>
          {/* 사진 첨부 */}
          <div>
            <p className="text-[15px] text-[#888] mb-1.5">
              사진 <span className="text-[#e0e0e0]">(선택 · 최대 5장)</span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {writePhotos.map((p, i) => (
                <div key={i} className="relative w-[72px] h-[72px] rounded-[10px] overflow-hidden bg-[#f5f5f5] shrink-0">
                  <img src={p.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handlePhotoRemove(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-[11px] flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {writePhotos.length < 5 && (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-[72px] h-[72px] rounded-[10px] bg-white border border-dashed border-[#e0e0e0] flex items-center justify-center text-[#cccccc] text-[22px] shrink-0"
                >
                  +
                </button>
              )}
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
          </div>
        </div>
        <div className="px-4 pt-3 pb-6 border-t border-[#e0e0e0]">
          <Button
            fullWidth
            size="lg"
            disabled={writeRating === 0 || writeName.trim() === "" || writeSubmitting}
            onClick={handleWriteReview}
          >
            {writeSubmitting ? "등록 중..." : "리뷰 등록"}
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}

function RatingDistributionChart({
  distribution, total,
}: {
  distribution: ReviewSummary["rating_distribution"];
  total: number;
}) {
  return (
    <div className="py-4 px-4 border-b border-[#e0e0e0] space-y-2">
      {([5, 4, 3, 2, 1] as const).map((star) => {
        const count = distribution[star];
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-2">
            <span className="text-[14px] text-[#aaa] w-3 text-right shrink-0">{star}</span>
            <span className="text-black text-[13px] shrink-0">★</span>
            <div className="flex-1 h-[5px] rounded-full bg-[#f5f5f5] overflow-hidden">
              <div className="h-full rounded-full bg-black" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[14px] text-[#aaa] w-4 shrink-0">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function PhotoStrip({ photos }: { photos: string[] }) {
  if (photos.length === 0) return null;
  return (
    <div className="py-3 px-4 border-b border-[#e0e0e0]">
      <p className="text-[14px] text-[#aaa] mb-2">포토 리뷰 {photos.length}장</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {photos.map((url, i) => (
          <div key={i} className="w-[72px] h-[72px] rounded-[10px] bg-[#f5f5f5] shrink-0 overflow-hidden">
            <img src={url} alt={`포토 리뷰 ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="py-3 border-b border-[#e0e0e0] last:border-b-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[15px] text-black">
          {review.author_name}
        </span>
        <span className="text-[13px] text-[#aaa]">
          {review.created_at.slice(0, 10)}
        </span>
      </div>
      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={i < review.rating ? "text-black" : "text-[#e0e0e0]"}
            style={{ fontSize: "15px" }}
          >
            ★
          </span>
        ))}
      </div>
      {review.body && (
        <p className="text-[15px] text-[#888] leading-relaxed">
          {review.body}
        </p>
      )}
      {review.photo_urls.length > 0 && (
        <div className="flex gap-1.5 mt-2 overflow-x-auto">
          {review.photo_urls.map((url, i) => (
            <div key={i} className="w-[60px] h-[60px] rounded-[10px] bg-[#f5f5f5] shrink-0 overflow-hidden">
              <img src={url} alt={`사진 ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
