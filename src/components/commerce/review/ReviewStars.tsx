// 5★ 채움/빈 별 렌더 — 리뷰 카드·요약 등에서 공용으로 사용
export function ReviewStars({
  rating,
  size = 15,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="flex gap-0.5" aria-label={`별점 ${rating}점`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < rating ? "text-black" : "text-[#e0e0e0]"}
          style={{ fontSize: `${size}px`, lineHeight: 1 }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
