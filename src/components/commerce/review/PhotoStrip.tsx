// 포토 영상 리뷰 — 가로 썸네일 스트립 + 전체보기
export function PhotoStrip({
  photos,
  onSeeAll,
}: {
  photos: string[];
  onSeeAll?: () => void;
}) {
  if (photos.length === 0) return null;
  return (
    <div className="py-4 px-6 border-b border-[#e0e0e0]">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[15px] text-black">포토 영상 리뷰</p>
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-[13px] text-[#aaa] active:opacity-70"
          >
            전체보기 ›
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {photos.map((url, i) => (
          <div
            key={i}
            className="w-[88px] h-[88px] rounded-[10px] bg-[#f5f5f5] shrink-0 overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`포토 리뷰 ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
