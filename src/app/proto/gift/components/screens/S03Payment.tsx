"use client";

import { useState } from "react";
import { PRODUCT, SHIPPING, TOTAL } from "../../data";
import { Screen } from "../wf";

interface Props {
  onBack: () => void;
  onPaid: () => void;
  receiverPhone?: string;
}

const won = (n: number) => n.toLocaleString("ko-KR") + "원";

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-[#ececec] py-[14px]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between">
        <span className="flex items-center gap-[8px]">
          <span className="text-[14px] font-bold text-[#333]">{title}</span>
          {sub && <span className="text-[11px] text-[#9a9a9a]">| {sub}</span>}
        </span>
        <span className="text-[12px] text-[#9a9a9a]">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="mt-[12px]">{children}</div>}
    </div>
  );
}

// S-03 · 결제하기 + 계좌 간편결제 PIN (캡처 Frame 158).
export default function S03Payment({ onBack, onPaid, receiverPhone }: Props) {
  const [pinOpen, setPinOpen] = useState(false);
  const [dots, setDots] = useState(0);

  function tap() {
    const n = dots + 1;
    setDots(n);
    if (n >= 4) setTimeout(onPaid, 350);
  }

  return (
    <Screen>
      {/* 앱바 */}
      <div className="flex h-[48px] items-center gap-[10px] border-b border-[#ececec] px-[14px]">
        <button type="button" aria-label="뒤로" onClick={onBack} className="text-[16px] text-[#9a9a9a]">‹</button>
        <p className="flex-1 text-center text-[14px] font-bold text-[#333]">온라인 스토어</p>
        <span className="text-[14px] text-[#9a9a9a]">✕</span>
      </div>

      <div className="flex flex-1 flex-col px-[16px] pb-[16px]">
        <p className="py-[16px] text-[20px] font-bold text-[#333]">결제하기</p>

        {/* 선물정보 */}
        <div className="pb-[14px]">
          <p className="text-[13px] font-bold text-[#333]">선물정보</p>
          <p className="mt-[8px] text-[12px] text-[#9a9a9a]">받는 분</p>
          <p className="text-[13px] text-[#333]">{receiverPhone || "000-0000-0000"}</p>
        </div>

        {/* 주문내역 */}
        <Section title="주문내역" sub="받는 분 1명 / 상품 1개">
          <div className="flex gap-[10px]">
            <span className="wf-img size-[48px] shrink-0 rounded-[6px]" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] text-[#333]">{PRODUCT.name}</span>
              <span className="block text-[11px] text-[#9a9a9a]">1개</span>
            </span>
          </div>
        </Section>

        {/* 쿠폰 및 할인 */}
        <Section title="쿠폰 및 할인">
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-center justify-between text-[13px]"><span className="text-[#4b4b4b]">🎟️ 쿠폰</span><span className="text-[#bcbcbc]">›</span></div>
            <div className="flex items-center justify-between text-[13px]"><span className="text-[#4b4b4b]">🧧 모바일 상품권</span><span className="text-[#bcbcbc]">›</span></div>
          </div>
        </Section>

        {/* 결제수단 */}
        <Section title="결제수단">
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-[8px]">
                <span className="size-[16px] rounded-full border border-[#c9c9c9]" />
                <span className="text-[13px] text-[#9a9a9a]">스타벅스 카드 (1)</span>
              </span>
              <span className="text-[11px] font-bold text-[#e5484d]">잔액 부족</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <span className="flex size-[16px] items-center justify-center rounded-full border border-[#2f2f2f]"><span className="size-[8px] rounded-full bg-[#2f2f2f]" /></span>
              <span className="text-[13px] font-bold text-[#333]">계좌 간편결제</span>
            </div>
          </div>
        </Section>

        {/* 가격 요약 */}
        <div className="mt-[4px] flex flex-col gap-[8px] border-t border-[#ececec] pt-[14px] text-[13px]">
          <div className="flex justify-between"><span className="text-[#9a9a9a]">상품 금액</span><span className="text-[#4b4b4b]">{won(PRODUCT.price)}</span></div>
          <div className="flex justify-between"><span className="text-[#9a9a9a]">배송비</span><span className="text-[#4b4b4b]">{won(SHIPPING)}</span></div>
          <div className="flex justify-between border-t border-[#ececec] pt-[8px]"><span className="font-bold text-[#333]">결제 금액</span><span className="text-[16px] font-bold text-[#333]">{won(TOTAL)}</span></div>
        </div>
      </div>

      {/* 결제 CTA */}
      <div className="mt-auto p-[16px]">
        <button
          type="button"
          onClick={() => { setDots(0); setPinOpen(true); }}
          className="h-[46px] w-full rounded-[8px] bg-[#2f2f2f] text-[14px] font-bold text-white"
        >
          {won(TOTAL)} 결제하기
        </button>
      </div>

      {/* 계좌 간편결제 PIN */}
      {pinOpen && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#f4f4f4]">
          <div className="flex h-[44px] items-center justify-end px-[16px]">
            <button type="button" aria-label="닫기" onClick={() => setPinOpen(false)} className="text-[15px] text-[#9a9a9a]">✕</button>
          </div>
          <div className="flex flex-col items-center px-[16px]">
            <p className="text-center text-[17px] font-bold leading-[1.4] text-[#8a7a6a]">
              계좌 간편결제 비밀번호를
              <br />
              입력해 주세요
            </p>
            <div className="my-[22px] flex gap-[14px]">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`size-[12px] rounded-full ${i < dots ? "bg-[#2f2f2f]" : "border border-[#c9c9c9]"}`} />
              ))}
            </div>
            <p className="text-[12px] text-[#9a9a9a] underline">계좌 간편결제 비밀번호를 잊어버리셨나요?</p>
            <div className="mt-[16px] flex items-start gap-[6px] rounded-[8px] bg-[#ececec] px-[12px] py-[10px]">
              <span className="text-[12px]">💡</span>
              <span className="text-[11px] leading-[1.5] text-[#7a7a7a]">
                다양한 금융기관의 계좌를 간편결제 서비스에서 안전하게 사용하기 위한 결제 비밀번호예요.
                <span className="mt-[4px] block text-right text-[#b0b0b0]">Powered by OO은행</span>
              </span>
            </div>
          </div>
          {/* 스크램블 키패드 */}
          <div className="mt-auto grid grid-cols-3 border-t border-[#dcdcdc] text-[18px] font-bold text-[#333]">
            {[5, 0, 4, 9, 8, 6, 7, 1, 2, "재배열", 3, "⌫"].map((k, i) => (
              <button
                key={i}
                type="button"
                onClick={() => (k === "⌫" ? setDots((d) => Math.max(0, d - 1)) : typeof k === "number" ? tap() : undefined)}
                className={`h-[56px] border-b border-r border-[#dcdcdc] ${k === "재배열" ? "text-[13px] text-[#9a9a9a]" : ""}`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}
    </Screen>
  );
}
