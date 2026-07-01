"use client";

import "./wireframe.css";
import { useState } from "react";
import Link from "next/link";
import { type ContactAccess, type GiftState, type StepId } from "./data";
import PhoneFrame from "./components/PhoneFrame";
import StepIndicator from "./components/StepIndicator";
import AnnotationPanel from "./components/AnnotationPanel";
import FlowToggle from "./components/FlowToggle";
import S01Product from "./components/screens/S01Product";
import S02Compose from "./components/screens/S02Compose";
import S03Payment from "./components/screens/S03Payment";
import S04Complete from "./components/screens/S04Complete";

const INITIAL: GiftState = { cardThemeId: "thanks", message: "", multiSend: false };

/**
 * 선물하기(발신자) 프로토타입 — 와이어프레임 + 주석 패널.
 * 사용자 캡처(Frame 156) 기준: 상품상세 → 구매/선물 시트 → 선물하기(카드·메시지·받는분) → 결제 → 발송완료.
 * 좌: 폰 목업(단계 클릭 진행) · 우: 현재 화면 POLICY/CASE/DATA 주석.
 */
export default function GiftProtoPage() {
  const [step, setStep] = useState<StepId>("S01");
  const [gift, setGift] = useState<GiftState>(INITIAL);
  const [contactAccess, setContactAccess] = useState<ContactAccess>("none");
  const update = (p: Partial<GiftState>) => setGift((g) => ({ ...g, ...p }));

  function restart() {
    setGift(INITIAL);
    setStep("S01");
  }

  return (
    <div className="wf-root min-h-screen bg-[#fafafa]">
      <div className="mx-auto flex max-w-[980px] flex-col gap-[16px] px-[20px] py-[24px]">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          <div>
            <Link href="/proto" className="text-[13px] text-[#9a9a9a] hover:text-[#4b4b4b]">
              ← 프로토타입 허브
            </Link>
            <h1 className="mt-[4px] text-[20px] font-bold text-[#333]">선물하기 프로토타입 · 발신자</h1>
            <p className="text-[12px] text-[#9a9a9a]">실물배송형 · 와이어프레임 · 정책 주석</p>
          </div>
          <FlowToggle />
        </div>

        {/* 단계 인디케이터 */}
        <div className="rounded-[12px] border border-[#e8e8e8] bg-white p-[16px]">
          <StepIndicator current={step} />
        </div>

        {/* 듀얼페인 */}
        <div className="flex flex-col gap-[20px] lg:flex-row lg:items-start">
          <div className="flex justify-center lg:justify-start">
            <PhoneFrame>
              {step === "S01" && <S01Product onGift={() => setStep("S02")} />}
              {step === "S02" && (
                <S02Compose
                  gift={gift}
                  access={contactAccess}
                  setAccess={setContactAccess}
                  onResetToProduct={() => setStep("S01")}
                  onBack={() => setStep("S01")}
                  onNext={(patch) => {
                    update(patch);
                    setStep("S03");
                  }}
                />
              )}
              {step === "S03" && (
                <S03Payment
                  onBack={() => setStep("S02")}
                  onPaid={() => setStep("S04")}
                  receiverPhone={gift.receiverPhone}
                />
              )}
              {step === "S04" && (
                <S04Complete
                  receiverName={gift.receiverName}
                  receiverPhone={gift.receiverPhone}
                  onRestart={restart}
                />
              )}
            </PhoneFrame>
          </div>

          {/* 주석 패널 */}
          <div className="flex-1 rounded-[12px] border border-[#e8e8e8] bg-white p-[20px]">
            <AnnotationPanel current={step} />
          </div>
        </div>
      </div>
    </div>
  );
}
