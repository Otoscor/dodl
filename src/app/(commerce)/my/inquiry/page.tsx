"use client";

import { useState } from "react";
import { BackHeader } from "@/components/layout/BackHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { INQUIRY_CATEGORIES, MOCK_INQUIRIES } from "../mock";

const inputClass =
  "w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-4 py-3 text-[15px] text-black placeholder:text-[#cccccc] outline-none focus:border-black transition-colors";

export default function MyInquiryPage() {
  const { showToast } = useToast();
  const [openId, setOpenId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [category, setCategory] = useState<string>(INQUIRY_CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const canSubmit = title.trim() !== "" && body.trim() !== "";

  const handleSubmit = () => {
    if (!canSubmit) return;
    showToast("문의가 접수되었습니다.");
    setTitle("");
    setBody("");
    setCategory(INQUIRY_CATEGORIES[0]);
    setSheetOpen(false);
  };

  const handleClose = () => {
    setSheetOpen(false);
    setTitle("");
    setBody("");
    setCategory(INQUIRY_CATEGORIES[0]);
  };

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
        <Button fullWidth size="lg" onClick={() => setSheetOpen(true)}>
          문의하기
        </Button>
      </div>

      {/* 문의 작성 바텀시트 */}
      <BottomSheet open={sheetOpen} onClose={handleClose}>
        <div className="px-4 pt-2 pb-4 border-b border-[#e0e0e0]">
          <p className="text-[18px] text-black">1:1 문의</p>
          <p className="text-[14px] text-[#aaa] mt-0.5">궁금한 점을 남겨주세요.</p>
        </div>

        <div className="px-4 py-5 space-y-4 overflow-y-auto max-h-[65vh]">
          <div>
            <p className="text-[13px] uppercase tracking-[0.08em] text-black mb-2">문의 유형</p>
            <div className="flex flex-wrap gap-2">
              {INQUIRY_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 text-[13px] rounded-[10px] border transition-colors ${
                    category === c
                      ? "border-black bg-black text-white"
                      : "border-[#e0e0e0] bg-[#f5f5f5] text-[#888]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[13px] uppercase tracking-[0.08em] text-black mb-2">제목</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요"
              className={inputClass}
              maxLength={50}
            />
          </div>

          <div>
            <p className="text-[13px] uppercase tracking-[0.08em] text-black mb-2">내용</p>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="문의 내용을 자세히 작성해주세요."
              rows={5}
              className={`${inputClass} resize-none`}
              maxLength={1000}
            />
          </div>
        </div>

        <div className="px-4 pt-3 pb-6 border-t border-[#e0e0e0]">
          <Button fullWidth size="lg" disabled={!canSubmit} onClick={handleSubmit}>
            문의 접수
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
