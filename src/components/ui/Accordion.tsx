"use client";

import { useState } from "react";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#e8e8e8] bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 h-14 text-left"
      >
        <span className="text-[15px] font-semibold text-black">{title}</span>
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          className={`shrink-0 text-[#888] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 8l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="bg-[#f9f9f9] rounded-[10px] px-4 py-4 text-[14px] text-[#444] leading-relaxed">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
