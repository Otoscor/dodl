"use client";

import { useState } from "react";
import { BackHeader } from "@/components/layout/BackHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { MOCK_FAQS } from "../mock";

export default function MyFaqPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const faqs = MOCK_FAQS;

  return (
    <div className="min-h-screen bg-white">
      <BackHeader title="자주 묻는 질문" />

      {faqs.length === 0 ? (
        <EmptyState icon="help_outline" title="등록된 질문이 없습니다" />
      ) : (
        <div className="divide-y divide-border-subtle">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id}>
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between gap-3 px-6 py-4 text-left"
                >
                  <span className="text-[15px] text-text-primary">
                    <span className="text-[#aaa] mr-2">Q</span>
                    {faq.question}
                  </span>
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
                      {faq.answer}
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
