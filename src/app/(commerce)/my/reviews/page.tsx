"use client";

import { useState } from "react";
import { BackHeader } from "@/components/layout/BackHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { WriteReviewSheet } from "@/components/commerce/WriteReviewSheet";
import { formatPrice } from "@/lib/utils";
import { MOCK_REVIEWS, MOCK_WRITABLE_REVIEWS, MockWritableReview } from "../mock";

type Tab = "writable" | "written";

export default function MyReviewsPage() {
  const [tab, setTab] = useState<Tab>("writable");
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [sheetItem, setSheetItem] = useState<MockWritableReview | null>(null);

  const writableItems = MOCK_WRITABLE_REVIEWS.filter((w) => !submitted.has(w.id));
  const writtenReviews = MOCK_REVIEWS;

  const handleSuccess = () => {
    if (sheetItem) {
      setSubmitted((prev) => new Set(prev).add(sheetItem.id));
    }
    setSheetItem(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <BackHeader title="내 리뷰" />

      {/* 탭 */}
      <div className="flex border-b border-[#e0e0e0] sticky top-16 z-20 bg-white">
        {(["writable", "written"] as Tab[]).map((t) => {
          const label = t === "writable" ? "작성 가능한 리뷰" : "내 리뷰";
          const count = t === "writable" ? writableItems.length : writtenReviews.length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3.5 text-[14px] tracking-[0.02em] transition-colors relative ${
                tab === t ? "text-black font-bold" : "text-[#aaa]"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`ml-1 text-[12px] ${tab === t ? "text-black" : "text-[#ccc]"}`}>
                  {count}
                </span>
              )}
              {tab === t && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
              )}
            </button>
          );
        })}
      </div>

      {/* 작성 가능한 리뷰 탭 */}
      {tab === "writable" && (
        writableItems.length === 0 ? (
          <EmptyState
            icon="check_circle"
            title="작성 가능한 리뷰가 없습니다"
            description="구매 후 배송이 완료되면 리뷰를 남길 수 있어요."
          />
        ) : (
          <div className="divide-y divide-border-subtle">
            {writableItems.map((item) => (
              <div key={item.id} className="px-6 py-5">
                {/* 배송완료 날짜 */}
                <p className="text-[13px] text-[#888] mb-3">
                  배송완료로{" "}
                  <span className="text-black font-medium">{item.deliveredDate}</span> 도착
                </p>

                {/* 상품 카드 */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center shrink-0">
                    <span className="material-icons-outlined text-[24px] text-[#e0e0e0]">medication</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] text-[#aaa] uppercase tracking-[0.08em]">{item.category}</p>
                    <p className="text-[15px] text-text-primary mt-0.5 leading-snug">{item.productName}</p>
                    <p className="text-[13px] text-text-tertiary mt-0.5">
                      [{item.option}] {item.quantity}개
                    </p>
                    <p className="font-mono text-[15px] text-text-primary font-bold mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>

                {/* 후기 작성 버튼 */}
                <Button
                  variant="secondary"
                  fullWidth
                  size="md"
                  onClick={() => setSheetItem(item)}
                >
                  후기 작성
                </Button>
              </div>
            ))}
          </div>
        )
      )}

      {/* 내 리뷰 탭 */}
      {tab === "written" && (
        writtenReviews.length === 0 ? (
          <EmptyState icon="rate_review" title="작성한 리뷰가 없습니다" description="구매한 상품에 리뷰를 남겨보세요." />
        ) : (
          <>
            <p className="px-6 pt-4 pb-2 text-[14px] text-text-tertiary">총 {writtenReviews.length}개</p>
            <div className="divide-y divide-border-subtle">
              {writtenReviews.map((review) => (
                <div key={review.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[15px] text-text-primary">{review.productName}</span>
                    <span className="text-[13px] text-text-quaternary">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
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
                    {review.photos && review.photos.length > 0 && (
                      <span className="text-[12px] text-[#aaa] tracking-[0.04em]">
                        포토 {review.photos.length}장
                      </span>
                    )}
                  </div>
                  {/* 포토 스트립 */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                      {review.photos.map((url, i) => (
                        <div
                          key={i}
                          className="w-[72px] h-[72px] rounded-[10px] bg-[#f5f5f5] shrink-0 overflow-hidden"
                        >
                          <img src={url} alt={`사진 ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[15px] text-[#888] leading-relaxed">{review.body}</p>
                </div>
              ))}
            </div>
          </>
        )
      )}

      {/* 리뷰 작성 바텀시트 */}
      <WriteReviewSheet
        open={sheetItem !== null}
        onClose={() => setSheetItem(null)}
        productName={sheetItem?.productName ?? ""}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
