import type { ReviewSummary } from "@/types/product";
import { ReviewStars } from "./ReviewStars";

// 평점 요약 — 대형 평균 점수 + 별점 + 리뷰 수 + 별점 분포 막대
export function RatingSummary({ summary }: { summary: ReviewSummary }) {
  const { average_rating, review_count, rating_distribution } = summary;

  return (
    <div className="px-6 py-6 flex items-center gap-6">
      {/* 평균 점수 */}
      <div className="flex flex-col items-center shrink-0 w-[96px]">
        <span className="text-[40px] font-bold text-black leading-none">
          {average_rating.toFixed(1)}
        </span>
        <div className="mt-2">
          <ReviewStars rating={Math.round(average_rating)} size={16} />
        </div>
        <span className="mt-1.5 text-[13px] text-[#aaa]">리뷰 {review_count}개</span>
      </div>

      {/* 별점 분포 */}
      <div className="flex-1 space-y-1.5">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = rating_distribution[star];
          const pct = review_count > 0 ? (count / review_count) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-[13px] text-[#aaa] w-3 text-right shrink-0">{star}</span>
              <div className="flex-1 h-[6px] rounded-full bg-[#f0f0f0] overflow-hidden">
                <div className="h-full rounded-full bg-black" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[12px] text-[#bbb] w-5 shrink-0">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
