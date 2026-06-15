"use client";

import { useState } from "react";
import { BackHeader } from "@/components/layout/BackHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { MOCK_NOTICES } from "../mock";

export default function MyNoticesPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const notices = MOCK_NOTICES;

  return (
    <div className="min-h-screen bg-white">
      <BackHeader title="공지사항" />

      {notices.length === 0 ? (
        <EmptyState icon="campaign" title="공지사항이 없습니다" />
      ) : (
        <div className="divide-y divide-border-subtle">
          {notices.map((notice) => {
            const isOpen = openId === notice.id;
            return (
              <div key={notice.id}>
                <button
                  onClick={() => setOpenId(isOpen ? null : notice.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] text-text-primary truncate">{notice.title}</p>
                    <p className="text-[12px] text-text-quaternary mt-0.5">{notice.date}</p>
                  </div>
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    className={`text-text-quaternary shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  >
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 -mt-1">
                    <p className="text-[15px] text-[#888] leading-relaxed bg-[#f5f5f5] rounded-[10px] px-4 py-3">
                      {notice.body}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
