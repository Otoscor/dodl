"use client";

import { useState } from "react";
import { CANCEL_REASONS, ORDER, PRODUCT, SHIPPING, TOTAL } from "../../data";

type View = "detail" | "select" | "reason" | "confirm" | "complete" | "cxdetail";

interface Props {
  onClose: () => void; // 주문 완료 화면으로 복귀
  onGoMain: () => void; // 메인으로 가기 (처음으로)
}

const won = (n: number) => n.toLocaleString("ko-KR") + "원";
const STEP_LABELS = ["상품 선택", "사유 선택", "정보 확인", "취소 완료"];

function Bar({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex h-[48px] items-center gap-[10px] border-b border-[#ececec] px-[14px]">
      {onBack ? (
        <button type="button" aria-label="뒤로" onClick={onBack} className="text-[16px] text-[#9a9a9a]">‹</button>
      ) : (
        <span className="w-[10px]" />
      )}
      <p className="flex-1 text-center text-[14px] font-bold text-[#333]">{title}</p>
      <span className="flex min-w-[10px] justify-end">{right}</span>
    </div>
  );
}

function Stepper({ active }: { active: number }) {
  return (
    <div className="flex items-center gap-[6px] px-[16px] py-[12px]">
      {STEP_LABELS.map((l, i) => (
        <div key={l} className="flex flex-1 flex-col items-center gap-[6px]">
          <span className={`text-[11px] ${i === active ? "font-bold text-[#333]" : "text-[#bcbcbc]"}`}>{l}</span>
          <span className={`h-[3px] w-full rounded-full ${i <= active ? "bg-[#2f2f2f]" : "bg-[#e5e5e5]"}`} />
        </div>
      ))}
    </div>
  );
}

function ProductRow({ badge }: { badge?: string }) {
  return (
    <div className="flex gap-[10px]">
      <span className="wf-img size-[56px] shrink-0 rounded-[6px]" />
      <span className="min-w-0 flex-1">
        {badge && <span className="block text-[11px] font-bold text-[#e5484d]">{badge}</span>}
        <span className="block text-[13px] text-[#333]">{PRODUCT.name}</span>
        <span className="block text-[13px] font-bold text-[#333]">{won(PRODUCT.price)} <span className="font-normal text-[#9a9a9a]">1개</span></span>
      </span>
    </div>
  );
}

function RefundRows({ totalLabel = "환불 금액" }: { totalLabel?: string }) {
  return (
    <div className="flex flex-col gap-[8px] text-[13px]">
      <div className="flex justify-between"><span className="text-[#9a9a9a]">상품 금액</span><span className="text-[#4b4b4b]">{won(PRODUCT.price)}</span></div>
      <div className="flex justify-between"><span className="text-[#9a9a9a]">배송비</span><span className="text-[#4b4b4b]">{won(SHIPPING)}</span></div>
      <div className="flex justify-between border-t border-[#ececec] pt-[8px]"><span className="font-bold text-[#333]">{totalLabel}</span><span className="text-[16px] font-bold text-[#333]">{won(TOTAL)}</span></div>
    </div>
  );
}

const btnPrimary = "h-[46px] flex-1 rounded-[8px] bg-[#2f2f2f] text-[14px] font-bold text-white";
const btnGhost = "h-[46px] flex-1 rounded-[8px] border border-[#c9c9c9] bg-white text-[14px] font-bold text-[#4b4b4b]";

// 주문 상세 → 주문 취소(위저드) → 취소 완료 → 취소 상세 정보 (캡처 취소 플로우).
export default function OrderCancelFlow({ onClose, onGoMain }: Props) {
  const [view, setView] = useState<View>("detail");
  const [reasonIdx, setReasonIdx] = useState(0);
  const [memo, setMemo] = useState("");
  const [modal, setModal] = useState(false);

  // ── 주문 상세 ──
  if (view === "detail") {
    return (
      <div className="absolute inset-0 z-50 flex flex-col bg-white">
        <Bar title="온라인 스토어" onBack={onClose} right={<span className="text-[13px] text-[#9a9a9a]">🔍</span>} />
        <div className="flex-1 overflow-y-auto px-[16px] pb-[16px]">
          <p className="pt-[14px] text-[12px] text-[#9a9a9a]">{ORDER.orderedAt.split(" ")[0]} · 주문 상세</p>
          <p className="text-[11px] text-[#bcbcbc]">주문번호 {ORDER.no}</p>

          <p className="mt-[14px] text-[13px] font-bold text-[#2f7a43]">받는 분</p>
          <div className="mt-[10px] rounded-[10px] border border-[#e0e0e0] p-[12px]">
            <ProductRow />
            <div className="mt-[12px] flex gap-[8px]">
              <button type="button" onClick={() => setView("select")} className="h-[38px] flex-1 rounded-[8px] border border-[#c9c9c9] text-[13px] font-bold text-[#4b4b4b]">주문취소</button>
              <button type="button" className="h-[38px] flex-1 rounded-[8px] bg-[#2f2f2f] text-[13px] font-bold text-white">상품 정보 더 알아보기</button>
            </div>
          </div>

          <div className="mt-[16px] border-t border-[#ececec] pt-[14px]">
            <p className="mb-[10px] text-[13px] font-bold text-[#333]">주문 정보</p>
            <div className="flex justify-between text-[13px]"><span className="text-[#9a9a9a]">주문일시</span><span className="text-[#4b4b4b]">{ORDER.orderedAt}</span></div>
            <div className="mt-[8px] flex justify-between text-[13px]"><span className="text-[#9a9a9a]">주문번호</span><span className="text-[#4b4b4b]">{ORDER.no}</span></div>
          </div>

          <div className="mt-[16px] border-t border-[#ececec] pt-[14px]">
            <p className="mb-[10px] text-[13px] font-bold text-[#333]">결제 정보</p>
            <RefundRows totalLabel="결제 금액" />
          </div>
        </div>
      </div>
    );
  }

  // ── 취소 완료 ──
  if (view === "complete") {
    return (
      <div className="absolute inset-0 z-50 flex flex-col bg-white">
        <Bar title="주문 취소" />
        <Stepper active={3} />
        <div className="flex-1 overflow-y-auto px-[16px] pb-[16px]">
          <p className="py-[14px] text-[18px] font-bold text-[#333]">주문 취소가 완료되었습니다</p>
          <p className="mb-[10px] text-[13px] font-bold text-[#333]">취소 상품 (1)</p>
          <ProductRow />
          <div className="mt-[16px] border-t border-[#ececec] pt-[14px]">
            <p className="mb-[6px] text-[13px] font-bold text-[#333]">취소 사유</p>
            <p className="text-[13px] text-[#4b4b4b]">{CANCEL_REASONS[reasonIdx]}</p>
          </div>
          <div className="mt-[16px] border-t border-[#ececec] pt-[14px]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#333]">환불 금액</span>
              <span className="text-[16px] font-bold text-[#333]">{won(TOTAL)}</span>
            </div>
            <div className="mt-[6px] flex justify-between text-[12px]"><span className="text-[#9a9a9a]">계좌 간편결제</span><span className="text-[#4b4b4b]">{won(TOTAL)}</span></div>
          </div>
        </div>
        <div className="mt-auto flex gap-[8px] p-[16px]">
          <button type="button" onClick={() => setView("cxdetail")} className={btnGhost}>상세정보 확인</button>
          <button type="button" onClick={onGoMain} className={btnPrimary}>메인으로 가기</button>
        </div>
      </div>
    );
  }

  // ── 취소 상세 정보 ──
  if (view === "cxdetail") {
    return (
      <div className="absolute inset-0 z-50 flex flex-col bg-white">
        <Bar title="온라인 스토어" onBack={() => setView("complete")} right={<span className="text-[13px] text-[#9a9a9a]">🔍</span>} />
        <div className="flex-1 overflow-y-auto px-[16px] pb-[16px]">
          <p className="py-[14px] text-[18px] font-bold text-[#333]">취소 상세 정보</p>
          <p className="text-[11px] text-[#bcbcbc]">주문번호 {ORDER.no}</p>
          <div className="mt-[12px]"><ProductRow badge="주문취소" /></div>
          <div className="mt-[16px] border-t border-[#ececec] pt-[14px]">
            <p className="mb-[6px] text-[13px] font-bold text-[#333]">취소 사유</p>
            <p className="text-[13px] text-[#4b4b4b]">{CANCEL_REASONS[reasonIdx]}</p>
          </div>
          <div className="mt-[16px] border-t border-[#ececec] pt-[14px]">
            <p className="mb-[10px] text-[13px] font-bold text-[#333]">취소 정보</p>
            <div className="flex justify-between text-[13px]"><span className="text-[#e5484d]">취소일시</span><span className="text-[#4b4b4b]">{ORDER.canceledAt}</span></div>
            <div className="mt-[8px] flex justify-between text-[13px]"><span className="text-[#9a9a9a]">주문번호</span><span className="text-[#4b4b4b]">{ORDER.no}</span></div>
          </div>
          <div className="mt-[16px] border-t border-[#ececec] pt-[14px]">
            <p className="mb-[10px] text-[13px] font-bold text-[#333]">환불 정보</p>
            <div className="flex justify-between text-[13px]"><span className="text-[#9a9a9a]">환불 상태</span><span className="font-bold text-[#333]">환불 대기</span></div>
            <div className="mt-[8px] flex justify-between text-[13px]"><span className="text-[#9a9a9a]">취소 금액</span><span className="text-[16px] font-bold text-[#333]">{won(TOTAL)}</span></div>
          </div>
        </div>
      </div>
    );
  }

  // ── 위저드: 상품 선택 / 사유 선택 / 정보 확인 ──
  const stepIdx = view === "select" ? 0 : view === "reason" ? 1 : 2;
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white">
      <Bar title="주문 취소" onBack={() => setView(view === "select" ? "detail" : view === "reason" ? "select" : "reason")} />
      <Stepper active={stepIdx} />

      <div className="flex-1 overflow-y-auto px-[16px] pb-[16px]">
        {view === "select" && (
          <>
            <p className="py-[8px] text-[14px] font-bold text-[#333]">취소 상품 (1)</p>
            <ProductRow />
          </>
        )}

        {view === "reason" && (
          <>
            <p className="py-[8px] text-[14px] font-bold text-[#333]">취소 사유 선택</p>
            <div className="flex flex-col gap-[14px]">
              {CANCEL_REASONS.map((r, i) => {
                const on = reasonIdx === i;
                return (
                  <button key={r} type="button" onClick={() => setReasonIdx(i)} className="flex items-center gap-[10px] text-left">
                    <span className={`flex size-[20px] shrink-0 items-center justify-center rounded-full border ${on ? "border-[#2f2f2f]" : "border-[#c9c9c9]"}`}>
                      {on && <span className="size-[10px] rounded-full bg-[#2f2f2f]" />}
                    </span>
                    <span className={`text-[13px] ${on ? "font-bold text-[#333]" : "text-[#4b4b4b]"}`}>{r}</span>
                  </button>
                );
              })}
            </div>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value.slice(0, 150))}
              placeholder="취소 사유를 입력해주세요 (선택)"
              rows={4}
              className="mt-[16px] w-full resize-none rounded-[8px] border border-[#e0e0e0] p-[12px] text-[13px] text-[#333] outline-none placeholder:text-[#bcbcbc] focus:border-[#2f2f2f]"
            />
            <p className="text-right text-[11px] text-[#9a9a9a]">{memo.length}/150자</p>
          </>
        )}

        {view === "confirm" && (
          <>
            <p className="py-[8px] text-[14px] font-bold text-[#333]">취소 정보 확인</p>
            <p className="mb-[10px] text-[13px] font-bold text-[#6b6b6b]">취소 상품</p>
            <ProductRow />
            <div className="mt-[16px] border-t border-[#ececec] pt-[14px]">
              <p className="mb-[6px] text-[13px] font-bold text-[#333]">취소 사유</p>
              <p className="text-[13px] text-[#4b4b4b]">{CANCEL_REASONS[reasonIdx]}</p>
            </div>
            <div className="mt-[16px] border-t border-[#ececec] pt-[14px]">
              <p className="mb-[10px] text-[13px] font-bold text-[#333]">환불 정보</p>
              <RefundRows />
            </div>
          </>
        )}
      </div>

      <div className="mt-auto flex gap-[8px] p-[16px]">
        {view !== "select" && (
          <button type="button" onClick={() => setView(view === "reason" ? "select" : "reason")} className={btnGhost}>‹ 이전 단계</button>
        )}
        {view === "select" && <button type="button" onClick={() => setView("reason")} className={btnPrimary}>다음 단계 ›</button>}
        {view === "reason" && <button type="button" onClick={() => setView("confirm")} className={btnPrimary}>다음 단계 ›</button>}
        {view === "confirm" && <button type="button" onClick={() => setModal(true)} className={btnPrimary}>신청하기</button>}
      </div>

      {/* 취소 확인 모달 */}
      {modal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[rgba(0,0,0,0.35)] px-[28px]">
          <div className="w-full rounded-[14px] bg-white">
            <p className="px-[20px] py-[22px] text-center text-[14px] font-bold text-[#333]">주문을 취소하시겠어요?</p>
            <div className="flex border-t border-[#e5e5e5] text-[14px] font-bold">
              <button type="button" onClick={() => setModal(false)} className="flex-1 border-r border-[#e5e5e5] py-[12px] text-[#6b6b6b]">아니오</button>
              <button type="button" onClick={() => { setModal(false); setView("complete"); }} className="flex-1 py-[12px] text-[#2f2f2f]">취소하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
