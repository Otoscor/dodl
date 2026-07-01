"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEXTURE_QUESTION } from "./data";

/**
 * 단백질 스캐너 — Figma node 817:7472 "혜택_홈_상세" 100% 재현.
 * 360×800 프레임. 초록 그라데이션(블러 타원 4장) + 상태바 + 타이틀바 + 옵션 6.
 * 색·폰트·radius·여백을 흑백 시스템으로 바꾸지 않고 Figma 값 그대로 사용한다.
 *
 * 현재는 식감 질문 단계 단일 화면. 나머지 질문/결과 프레임 확정 시
 * screen-state 머신으로 확장한다.
 */
export default function ScannerProtoPage() {
  const router = useRouter();
  const q = TEXTURE_QUESTION;
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="flex justify-center">
      <div className="relative w-[360px] min-h-screen overflow-hidden bg-white">
        {/* ── 초록 그라데이션 (블러 타원 4장, 하단 글로우) ── */}
        <div className="absolute h-[710.5px] left-[-171px] top-[440.5px] w-[702px]">
          <div className="absolute inset-[-9.98%_-10.1%]">
            <img alt="" className="block size-full max-w-none" src="/proto/scanner/ellipse4.svg" />
          </div>
        </div>
        <div className="absolute h-[568.5px] left-[-124px] top-[535.5px] w-[608px]">
          <div className="absolute inset-[-12.47%_-11.66%]">
            <img alt="" className="block size-full max-w-none" src="/proto/scanner/ellipse3.svg" />
          </div>
        </div>
        <div className="absolute h-[486px] left-[-84px] top-[578px] w-[528px]">
          <div className="absolute inset-[-14.59%_-13.43%]">
            <img alt="" className="block size-full max-w-none" src="/proto/scanner/ellipse2.svg" />
          </div>
        </div>
        <div className="absolute h-[318px] left-[-35px] top-[697px] w-[430px]">
          <div className="absolute inset-[-22.3%_-16.49%]">
            <img alt="" className="block size-full max-w-none" src="/proto/scanner/ellipse1.svg" />
          </div>
        </div>

        {/* ── 옵션 리스트 ── */}
        <div className="absolute left-[16px] top-[214px] flex w-[328px] flex-col gap-[16px]">
          {q.options.map((opt, i) => {
            const active = selected === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                className={`flex w-full items-center rounded-[20px] border p-[24px] text-left transition-colors ${
                  active
                    ? "border-[rgba(26,25,25,0.16)] bg-[rgba(255,255,255,0.7)]"
                    : "border-[rgba(26,25,25,0.05)] bg-[rgba(255,255,255,0.16)]"
                }`}
              >
                <p className="min-w-0 flex-1 break-words text-[15px] font-medium leading-[1.6] text-[#1a1919]">
                  {opt}
                </p>
              </button>
            );
          })}
        </div>

        {/* ── 헤더 (상태바 + 타이틀바 + 타이틀) ── */}
        <div className="absolute left-0 top-0 h-[190px] w-[360px]">
          {/* 타이틀 */}
          <div className="absolute left-[16px] top-[116px] flex w-[328px] flex-col gap-[8px]">
            <p className="text-[22px] font-bold text-[#1a1919]">{q.title}</p>
            <p className="text-[17px] font-normal text-[#8a8585]">{q.caption}</p>
          </div>

          {/* 타이틀바 */}
          <div className="absolute left-0 top-[52px] flex h-[56px] w-full items-center gap-[16px] px-[16px]">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={() => router.back()}
              className="size-[24px] shrink-0"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" />
                <path d="M11 6L5 12L11 18" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {/* 구매하기 — Figma상 opacity 0 (자리 유지용) */}
            <p className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[20px] font-normal text-[#1a1919] opacity-0">
              구매하기
            </p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="whitespace-nowrap text-right text-[15px] font-medium text-[#bebbbb]"
            >
              다시하기
            </button>
          </div>

          {/* 상태바 */}
          <div className="absolute left-0 top-0 flex h-[52px] w-[360px] items-end justify-between overflow-clip px-[24px] py-[10px]">
            <p className="text-[14px] font-medium leading-[20px] tracking-[0.14px] text-[#1a1919]">9:30</p>
            <img alt="" className="h-[15px] w-[46px] shrink-0" src="/proto/scanner/statusbar-right.svg" />
          </div>
        </div>
      </div>
    </div>
  );
}
