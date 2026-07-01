// 시뮬레이션 진행 중(SIMULATING) 스켈레톤 — "금액 계산 중" (정책서 2.2).
function Bar({ w, h = 12 }: { w: string; h?: number }) {
  return (
    <div
      className="animate-pulse rounded-[4px] bg-[rgba(26,25,25,0.08)]"
      style={{ width: w, height: h }}
    />
  );
}

export default function CartSkeleton() {
  return (
    <div className="px-[16px] pt-[24px]">
      <div className="mb-[16px] flex items-center justify-center rounded-[12px] bg-[rgba(26,25,25,0.04)] py-[10px]">
        <span className="mr-[8px] size-[14px] animate-spin rounded-full border-2 border-[rgba(26,25,25,0.2)] border-t-[#1a1919]" />
        <span className="text-[13px] text-[#8a8585]">금액 계산 중…</span>
      </div>
      <div className="flex flex-col gap-[24px]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-[16px]">
            <div className="size-[72px] shrink-0 animate-pulse rounded-[8px] bg-[rgba(26,25,25,0.08)]" />
            <div className="flex flex-1 flex-col gap-[10px] pt-[4px]">
              <Bar w="80%" />
              <Bar w="50%" h={10} />
              <Bar w="35%" h={14} />
              <div className="mt-[6px]">
                <Bar w="96px" h={32} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
