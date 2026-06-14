"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";

export function HomeCartIcon() {
  const { count } = useCart();

  return (
    <Link href="/cart" className="relative w-9 h-9 flex items-center justify-center">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 6h18" strokeLinecap="round"/>
        <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-black text-white text-[10px] font-bold rounded-full px-1">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
