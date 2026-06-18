"use client";

import { useRouter } from "next/navigation";

interface BackHeaderProps {
  title?: string;
  rightAction?: React.ReactNode;
}

export function BackHeader({ title, rightAction }: BackHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 bg-white">
      <div className="flex items-center h-16 px-6">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-black -ml-1 cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {title && (
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[16px] text-black tracking-[-0.01em]">
            {title}
          </h1>
        )}
        {rightAction && <div className="ml-auto">{rightAction}</div>}
      </div>
    </header>
  );
}
