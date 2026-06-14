"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    name: "홈",
    href: "/home",
    match: (path: string) => path.startsWith("/home"),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#5e6ad2" : "#8a8f98"} strokeWidth="1.8">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: "상품",
    href: "/products",
    match: (path: string) => path.startsWith("/products"),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#5e6ad2" : "#8a8f98"} strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" strokeLinecap="round"/>
        <rect x="14" y="3" width="7" height="7" rx="1" strokeLinecap="round"/>
        <rect x="3" y="14" width="7" height="7" rx="1" strokeLinecap="round"/>
        <rect x="14" y="14" width="7" height="7" rx="1" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: "마이",
    href: "/my",
    match: (path: string) => path.startsWith("/my") || path.startsWith("/orders") || path.startsWith("/wallet"),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#5e6ad2" : "#8a8f98"} strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 21v-1a6 6 0 00-8-5.7A6 6 0 004 20v1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface-base/90 backdrop-blur-md border-t border-border-subtle z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 py-1 min-w-[56px]"
            >
              <div className="relative">
                {tab.icon(isActive)}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-action-primary" : "text-text-tertiary"
                }`}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
