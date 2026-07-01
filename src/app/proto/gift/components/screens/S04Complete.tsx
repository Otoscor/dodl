"use client";

import { useState } from "react";
import { PRODUCT, TOTAL } from "../../data";
import { Screen } from "../wf";
import OrderCancelFlow from "./OrderCancelFlow";

interface Props {
  receiverName?: string;
  receiverPhone?: string;
  onRestart: () => void;
}

const won = (n: number) => n.toLocaleString("ko-KR") + "원";

// S-04 · 주문이 완료되었습니다 (캡처 Frame 159).
export default function S04Complete({ receiverName, receiverPhone, onRestart }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  return (
    <Screen>
      {/* 앱바 */}
      <div className="flex h-[48px] items-center gap-[10px] border-b border-[#ececec] px-[14px]">
        <p className="flex-1 text-center text-[14px] font-bold text-[#333]">온라인 스토어</p>
        <span className="size-[16px] rounded-full border border-[#c9c9c9]" />
        <span className="size-[16px] rounded-[3px] border border-[#c9c9c9]" />
        <span className="text-[14px] text-[#9a9a9a]">✕</span>
      </div>

      <div className="flex flex-1 flex-col px-[16px] pb-[16px]">
        <p className="py-[16px] text-[20px] font-bold text-[#333]">주문이 완료되었습니다</p>

        {/* 선물 정보 */}
        <div className="border-t border-[#ececec] py-[14px]">
          <p className="text-[13px] font-bold text-[#333]">선물 정보</p>
          <p className="mt-[8px] text-[12px] text-[#9a9a9a]">받는 분</p>
          <p className="text-[14px] font-bold text-[#333]">{receiverName || "받는 분"}</p>
          <p className="text-[13px] text-[#4b4b4b]">{receiverPhone || "000-0000-0000"}</p>
          <p className="mt-[8px] text-[11px] text-[#9a9a9a]">· 받는 분이 배송지를 입력하면 배송이 시작됩니다.</p>
        </div>

        {/* 주문내역 */}
        <div className="border-t border-[#ececec] py-[14px]">
          <p className="mb-[12px] text-[13px] font-bold text-[#333]">
            주문내역 <span className="text-[11px] font-normal text-[#9a9a9a]">| 받는 분 1명 / 상품 1개</span>
          </p>
          <div className="flex gap-[10px]">
            <span className="wf-img size-[48px] shrink-0 rounded-[6px]" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] text-[#333]">{PRODUCT.name}</span>
              <span className="block text-[11px] text-[#9a9a9a]">1개</span>
            </span>
          </div>
        </div>

        {/* 결제 금액 */}
        <div className="border-t border-[#ececec] py-[14px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#333]">결제 금액</span>
            <span className="text-[18px] font-bold text-[#333]">{won(TOTAL)}</span>
          </div>
          <div className="mt-[8px] flex items-center justify-between text-[12px]">
            <span className="text-[#9a9a9a]">계좌 간편결제</span>
            <span className="text-[#4b4b4b]">{won(TOTAL)}</span>
          </div>
        </div>

        {/* 적립 안내 */}
        <div className="rounded-[8px] bg-[#f4f4f4] px-[12px] py-[10px]">
          <p className="text-[11px] leading-[1.5] text-[#9a9a9a]">
            적립 조건을 충족한 경우, 배송 완료로부터 9일차에 구매자에게 적립됩니다.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto flex gap-[8px] p-[16px]">
        <button type="button" onClick={() => setDetailOpen(true)} className="h-[46px] flex-1 rounded-[8px] border border-[#c9c9c9] bg-white text-[14px] font-bold text-[#4b4b4b]">
          상세정보 확인
        </button>
        <button type="button" onClick={onRestart} className="h-[46px] flex-1 rounded-[8px] bg-[#2f2f2f] text-[14px] font-bold text-white">
          메인으로 가기
        </button>
      </div>

      {/* 상세정보 확인 → 주문 취소 플로우 */}
      {detailOpen && <OrderCancelFlow onClose={() => setDetailOpen(false)} onGoMain={onRestart} />}
    </Screen>
  );
}
