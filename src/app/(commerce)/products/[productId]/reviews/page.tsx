"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { RatingSummary } from "@/components/commerce/review/RatingSummary";
import { PhotoStrip } from "@/components/commerce/review/PhotoStrip";
import { ReviewCard } from "@/components/commerce/review/ReviewCard";
import type { ProductDetail, Review } from "@/types/product";

type SortKey = "recent" | "high" | "low";

const SORT_TABS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "최신순" },
  { key: "high", label: "평점 높은순" },
  { key: "low", label: "평점 낮은순" },
];

export default function ProductReviewsPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState<SortKey>("recent");
  const [photoOnly, setPhotoOnly] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${productId}`).then((r) => r.json()),
      fetch(`/api/products/${productId}/reviews`).then((r) => r.json()),
    ]).then(([productData, reviewData]) => {
      setProduct(productData);
      setReviews(reviewData.reviews ?? []);
      setLoading(false);
    });
  }, [productId]);

  const visibleReviews = useMemo(() => {
    let list = reviews;
    if (photoOnly) list = list.filter((r) => r.photo_urls.length > 0);
    const sorted = [...list];
    if (sort === "recent") {
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    } else if (sort === "high") {
      sorted.sort((a, b) => b.rating - a.rating || b.created_at.localeCompare(a.created_at));
    } else {
      sorted.sort((a, b) => a.rating - b.rating || b.created_at.localeCompare(a.created_at));
    }
    return sorted;
  }, [reviews, sort, photoOnly]);

  const photos = useMemo(() => reviews.flatMap((r) => r.photo_urls), [reviews]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <BackHeader title="리뷰" />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      <BackHeader title="리뷰" />

      {product && product.review_summary.review_count > 0 && (
        <RatingSummary summary={product.review_summary} />
      )}

      <PhotoStrip
        photos={photos}
        onSeeAll={() => router.push(`/products/${productId}/reviews/photos`)}
      />

      {/* 정렬 탭 + 포토리뷰만 필터 */}
      <div className="sticky top-16 z-20 bg-white border-b border-[#e0e0e0]">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            {SORT_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setSort(t.key)}
                className={`text-[14px] ${
                  sort === t.key ? "text-black font-medium" : "text-[#aaa]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPhotoOnly((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
              photoOnly
                ? "border-black bg-black text-white"
                : "border-[#e0e0e0] text-[#888] active:bg-[#f5f5f5]"
            }`}
          >
            <span className="material-icons-outlined text-[15px]">photo_camera</span>
            포토리뷰
          </button>
        </div>
      </div>

      <div className="px-6">
        {visibleReviews.length === 0 ? (
          <p className="py-12 text-center text-[14px] text-[#aaa]">
            {photoOnly ? "포토 리뷰가 없습니다." : "아직 작성된 후기가 없습니다."}
          </p>
        ) : (
          visibleReviews.map((review) => <ReviewCard key={review.id} review={review} />)
        )}
      </div>
    </div>
  );
}
