"use client";

import { useEffect, useMemo, useState, use } from "react";
import { BackHeader } from "@/components/layout/BackHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Review } from "@/types/product";

export default function ProductPhotoReviewsPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  const photos = useMemo(() => reviews.flatMap((r) => r.photo_urls), [reviews]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <BackHeader title="포토리뷰" />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      <BackHeader title="포토리뷰" />

      {photos.length === 0 ? (
        <EmptyState icon="photo_camera" title="등록된 포토리뷰가 없습니다" />
      ) : (
        <>
          <p className="px-6 py-3 text-[14px] text-[#888]">총 {photos.length}장</p>
          <div className="grid grid-cols-3 gap-1 px-1">
            {photos.map((url, i) => (
              <div key={i} className="aspect-square bg-[#f5f5f5] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`포토리뷰 ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
