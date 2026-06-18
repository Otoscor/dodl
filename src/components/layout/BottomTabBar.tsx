"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  name: string;
  href: string;
  match: (path: string) => boolean;
  icon: string;
  placeholder?: boolean; // 라우트 없이 UI만 존재하는 탭
}

const tabs: Tab[] = [
  {
    name: "홈",
    href: "/home",
    match: (path: string) => path.startsWith("/home"),
    icon: "home",
  },
  {
    name: "단백질 스캐너",
    href: "/scanner",
    match: (path: string) => path.startsWith("/scanner"),
    icon: "qr_code_scanner",
  },
  {
    name: "웰니스 센서",
    href: "/wellness",
    match: (path: string) => path.startsWith("/wellness"),
    icon: "sensors",
  },
  {
    name: "마이",
    href: "/my",
    match: (path: string) => path.startsWith("/my") || path.startsWith("/orders") || path.startsWith("/wallet"),
    icon: "person",
  },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = tab.match(pathname);
          const inner = (
            <>
              <span className={`material-icons-outlined text-[22px] ${isActive ? "text-black" : "text-[#aaa]"}`}>
                {tab.icon}
              </span>
              <span
                className={`text-[12px] tracking-[0.08em] uppercase ${
                  isActive ? "text-black" : "text-[#aaa]"
                }`}
              >
                {tab.name}
              </span>
            </>
          );
          const className = "flex flex-col items-center gap-0.5 py-1 min-w-[56px]";

          // 아직 라우트가 없는 UI 전용 탭 — 이동하지 않는 버튼으로 렌더
          if (tab.placeholder) {
            return (
              <button key={tab.href} type="button" className={className}>
                {inner}
              </button>
            );
          }
          return (
            <Link key={tab.href} href={tab.href} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
