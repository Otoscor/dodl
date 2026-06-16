"use client";

import { useState } from "react";
import Link from "next/link";
import { BackHeader } from "@/components/layout/BackHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MOCK_INQUIRIES } from "../mock";

export default function MyInquiryPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white pb-32">
      <BackHeader title="1:1 문의" />

      {/* 문의 내역 */}
      {MOCK_INQUIRIES.length === 0 ? (
        <EmptyState
          icon="chat_bubble_outline"
          title="문의 내역이 없습니다"
          description="궁금한 점이 있으시면 문의하기를 눌러주세요."
        />
      ) : (
        <>
          <p className="px-6 pt-4 pb-1 text-[14px] text-text-tertiary">
            총 {MOCK_INQUIRIES.length}건
          </p>
          <div className="divide-y divide-border-subtle">
            {MOCK_INQUIRIES.map((iq) => {
              const isOpen = openId === iq.id;
              return (
                <div key={iq.id}>
                  {/* 문의 헤더 — 탭으로 펼침/접힘 */}
                  <button
                    onClick={() => setOpenId(isOpen ? null : iq.id)}
                    className="w-full px-6 py-4 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant={iq.status === "답변완료" ? "green" : "muted"}>
                        {iq.status}
                      </Badge>
                      <span className="text-[13px] text-text-tertiary">{iq.category}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[15px] text-text-primary leading-snug flex-1 text-left">
                        {iq.title}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[12px] text-text-quaternary">{iq.date}</span>
                        <svg
                          width="16" height="16" viewBox="0 0 16 16" fill="none"
                          className={`text-text-quaternary transition-transform ${isOpen ? "rotate-90" : ""}`}
                        >
                          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* 펼쳐진 Q&A 스레드 */}
                  {isOpen && (
                    <div className="mx-6 mb-4 rounded-[10px] overflow-hidden border border-[#e0e0e0]">
                      {/* Q — 내 문의 내용 */}
                      <div className="bg-[#f9f9f9] px-4 py-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-[22px] h-[22px] rounded-full bg-[#e0e0e0] flex items-center justify-center text-[12px] font-bold text-[#888] shrink-0">Q</span>
                          <span className="text-[13px] text-[#888]">{iq.date}</span>
                        </div>
                        <p className="text-[14px] text-black leading-relaxed whitespace-pre-line pl-[30px]">
                          {iq.body}
                        </p>
                      </div>

                      {/* A — 답변 */}
                      {iq.answer ? (
                        <div className="border-t border-[#e0e0e0] bg-white px-4 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-[22px] h-[22px] rounded-full bg-black flex items-center justify-center text-[12px] font-bold text-white shrink-0">A</span>
                            <span className="text-[13px] text-[#888]">{iq.answer.date}</span>
                          </div>
                          <p className="text-[14px] text-black leading-relaxed whitespace-pre-line pl-[30px]">
                            {iq.answer.body}
                          </p>
                        </div>
                      ) : (
                        <div className="border-t border-[#e0e0e0] bg-white px-4 py-4 flex items-center gap-2">
                          <span className="w-[22px] h-[22px] rounded-full bg-[#f5f5f5] flex items-center justify-center text-[12px] font-bold text-[#ccc] shrink-0">A</span>
                          <p className="text-[14px] text-[#aaa]">답변을 준비 중입니다.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 하단 고정 문의하기 버튼 */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-md px-6 py-4 z-30 border-t border-[#e0e0e0]">
        <Link href="/my/inquiry/write">
          <Button fullWidth size="lg">
            문의하기
          </Button>
        </Link>
      </div>
    </div>
  );
}
