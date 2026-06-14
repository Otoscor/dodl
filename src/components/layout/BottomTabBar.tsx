"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    name: "홈",
    href: "/home",
    match: (path: string) => path.startsWith("/home"),
    icon: "home",
  },
  {
    name: "상품",
    href: "/products",
    match: (path: string) => path.startsWith("/products"),
    icon: "grid_view",
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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-md z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 py-1 min-w-[56px]"
            >
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
