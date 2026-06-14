"use client";

import { useRouter } from "next/navigation";

interface BackHeaderProps {
  title?: string;
  rightAction?: React.ReactNode;
}

export function BackHeader({ title, rightAction }: BackHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 bg-surface-base/80 backdrop-blur-md border-b border-border-subtle">
      <div className="flex items-center h-12 px-4">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary -ml-1 cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {title && (
          <h1 className="flex-1 text-center text-[15px] font-medium text-text-primary -mr-8">
            {title}
          </h1>
        )}
        {rightAction && <div className="ml-auto">{rightAction}</div>}
      </div>
    </header>
  );
}
