"use client";

import type { ReactNode } from "react";

// 폰 목업 셸 (와이어프레임) — 상태바 + 360폭 뷰포트 + 홈 인디케이터.
export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[380px] shrink-0 rounded-[36px] border-[6px] border-[#2f2f2f] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      <div className="relative h-[760px] w-full overflow-hidden rounded-[30px] bg-white">
        {/* 상태바 */}
        <div className="flex h-[36px] items-center justify-between px-[20px] text-[11px] font-medium text-[#9a9a9a]">
          <span>9:41</span>
          <div className="flex items-center gap-[4px]">
            <span className="h-[8px] w-[16px] rounded-sm border border-[#c9c9c9]" />
            <span className="h-[8px] w-[10px] rounded-sm bg-[#ececec]" />
            <span className="h-[8px] w-[18px] rounded-sm border border-[#c9c9c9]" />
          </div>
        </div>

        {/* 화면 콘텐츠 (스크롤) */}
        <div className="h-[calc(760px-36px-16px)] overflow-y-auto">{children}</div>

        {/* 홈 인디케이터 */}
        <div className="flex h-[16px] items-center justify-center">
          <span className="h-[4px] w-[110px] rounded-full bg-[#d4d4d4]" />
        </div>
      </div>
    </div>
  );
}
