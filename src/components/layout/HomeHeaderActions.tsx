"use client";

import { HomeCartIcon } from "./HomeCartIcon";
import { useToast } from "@/components/ui/Toast";

// 홈 헤더 우측 액션 — 검색 · 알림 · 장바구니.
// 검색/알림은 아직 라우트가 없어 UI 전용(토스트), 장바구니는 실제 동작.
export function HomeHeaderActions() {
  const { showToast } = useToast();

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => showToast("준비 중입니다", "info")}
        aria-label="검색"
        className="w-9 h-9 flex items-center justify-center text-black"
      >
        <span className="material-icons-outlined text-[22px]">search</span>
      </button>
      <button
        onClick={() => showToast("준비 중입니다", "info")}
        aria-label="알림"
        className="w-9 h-9 flex items-center justify-center text-black"
      >
        <span className="material-icons-outlined text-[22px]">notifications</span>
      </button>
      <HomeCartIcon />
    </div>
  );
}
