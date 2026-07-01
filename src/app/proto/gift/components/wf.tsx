"use client";

import type { ReactNode } from "react";

// 공용 와이어프레임 UI 아톰 (무채색·보더).

export function AppBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="flex h-[48px] items-center gap-[10px] border-b border-[#ececec] px-[14px]">
      {onBack ? (
        <button type="button" aria-label="뒤로" onClick={onBack} className="size-[22px]">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <path d="M13.5 5L8 11L13.5 17" stroke="#4b4b4b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <span className="size-[22px]" />
      )}
      <p className="flex-1 text-[15px] font-bold text-[#333]">{title}</p>
    </div>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return <div className="flex min-h-full flex-col">{children}</div>;
}

export function Body({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col gap-[16px] p-[16px]">{children}</div>;
}

export function Footer({ children }: { children: ReactNode }) {
  return <div className="mt-auto flex flex-col gap-[8px] p-[16px]">{children}</div>;
}

export function Primary({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-[46px] w-full rounded-[8px] bg-[#2f2f2f] text-[14px] font-bold text-white disabled:bg-[#cfcfcf]"
    >
      {children}
    </button>
  );
}

export function Secondary({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[46px] w-full rounded-[8px] border border-[#c9c9c9] bg-white text-[14px] font-bold text-[#4b4b4b]"
    >
      {children}
    </button>
  );
}

// 정보/정책 배너 (ℹ)
export function Banner({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-[8px] rounded-[8px] border border-[#dcdcdc] bg-[#f4f4f4] px-[12px] py-[10px]">
      <span className="mt-[1px] flex size-[16px] shrink-0 items-center justify-center rounded-full border border-[#9a9a9a] text-[10px] font-bold text-[#6b6b6b]">
        i
      </span>
      <p className="text-[12px] leading-[1.5] text-[#5a5a5a]">{children}</p>
    </div>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-[8px] border border-[#e0e0e0] p-[14px]">{children}</div>;
}

export function Line({ w = "60%", h = 10 }: { w?: string; h?: number }) {
  return <span className="wf-line block" style={{ width: w, height: h }} />;
}
