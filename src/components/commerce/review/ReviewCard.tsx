"use client";

import { useState } from "react";
import type { Review } from "@/types/product";
import { ReviewStars } from "./ReviewStars";
import { helpfulBase } from "./helpful";

// 개별 리뷰 카드 — 작성자·날짜·별점·본문·인라인 포토 + 동작하는 도움돼요(로컬 토글)
export function ReviewCard({ review }: { review: Review }) {
  const [liked, setLiked] = useState(false);
  const base = helpfulBase(review.id);
  const helpfulCount = base + (liked ? 1 : 0);

  return (
    <div className="py-4 border-b border-[#e0e0e0] last:border-b-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[15px] text-black">{review.author_name}</span>
        <span className="text-[13px] text-[#aaa]">{review.created_at.slice(0, 10)}</span>
      </div>
      <div className="mb-2">
        <ReviewStars rating={review.rating} size={15} />
      </div>
      {review.body && (
        <p className="text-[15px] text-[#888] leading-relaxed">{review.body}</p>
      )}
      {review.photo_urls.length > 0 && (
        <div className="flex gap-1.5 mt-2 overflow-x-auto">
          {review.photo_urls.map((url, i) => (
            <div
              key={i}
              className="w-[60px] h-[60px] rounded-[10px] bg-[#f5f5f5] shrink-0 overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`사진 ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
      {/* 도움돼요 — 클라이언트 로컬 토글 (영속 X) */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
            liked
              ? "border-black bg-black text-white"
              : "border-[#e0e0e0] text-[#888] active:bg-[#f5f5f5]"
          }`}
        >
          <span className="material-icons-outlined text-[15px]">thumb_up</span>
          도움돼요 {helpfulCount}
        </button>
      </div>
    </div>
  );
}
