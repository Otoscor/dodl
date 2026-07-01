"use client";

import { Fragment } from "react";
import type { CartItem, SimState } from "../policy";
import {
  blockReason,
  ctaMode,
  formatWon,
  MAX_ITEMS,
  priceSummary,
  problemItems,
} from "../policy";
import StatusBar from "./StatusBar";
import CartItemRow from "./CartItemRow";
import PriceSummary from "./PriceSummary";
import CartBanner from "./CartBanner";
import CartSkeleton from "./CartSkeleton";

interface Props {
  items: CartItem[];
  simState: SimState;
  loadingId: string | null;
  emptyKind?: "normal" | "cleanup";
  onBack: () => void;
  onDec: (id: string) => void;
  onInc: (id: string) => void;
  onRemove: (id: string) => void;
  onAdjustStock: (id: string) => void;
  onAcceptPrice: (id: string) => void;
  onRecalculate: () => void;
  onCheckout: () => void;
}

export default function CartScreen(props: Props) {
  const { items, simState, loadingId, emptyKind, onBack, onRecalculate, onCheckout } = props;
  const empty = items.length === 0;
  const problems = problemItems(items);
  const mode = ctaMode(items);
  const summary = priceSummary(items);

  const jumpToFirstProblem = () => {
    if (problems[0]) {
      document.getElementById(`row-${problems[0].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const ctaLabel =
    simState !== "READY"
      ? "결제하기"
      : mode === "checkout"
        ? `${formatWon(summary.payable)} 결제하기`
        : mode === "confirm"
          ? "변경 확인 후 결제"
          : "결제하기";
  const ctaDisabled = mode === "blocked" || simState !== "READY";

  return (
    <div className="flex justify-center">
      <div className="relative w-[360px] min-h-screen bg-white pb-[150px]">
        {/* 앱바 */}
        <div className="sticky top-0 z-20 flex flex-col bg-white">
          <StatusBar />
          <div className="flex h-[56px] items-center gap-[16px] px-[16px]">
            <button type="button" aria-label="뒤로가기" onClick={onBack} className="size-[24px] shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15 5L8 12L15 19" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="min-w-0 flex-1 truncate text-[20px] text-[#0a0a0a]">장바구니</p>
          </div>
        </div>

        {/* ── 본문 ── */}
        {empty ? (
          <EmptyState kind={emptyKind ?? "normal"} />
        ) : simState === "SIMULATING" ? (
          <CartSkeleton />
        ) : simState === "FAILED" ? (
          <FailedState onRetry={onRecalculate} />
        ) : (
          <>
            {problems.length > 0 && (
              <div className="px-[16px] pt-[16px]">
                <CartBanner count={problems.length} reason={blockReason(items)} onJump={jumpToFirstProblem} />
              </div>
            )}

            <div className="flex flex-col gap-[24px] px-[16px] pt-[24px]">
              {items.map((item, i) => (
                <Fragment key={item.id}>
                  {i > 0 && <div className="h-px w-full bg-[rgba(26,25,25,0.05)]" />}
                  <div id={`row-${item.id}`} className="scroll-mt-[120px]">
                    <CartItemRow
                      item={item}
                      loading={loadingId === item.id}
                      onDec={() => props.onDec(item.id)}
                      onInc={() => props.onInc(item.id)}
                      onRemove={() => props.onRemove(item.id)}
                      onAdjustStock={() => props.onAdjustStock(item.id)}
                      onAcceptPrice={() => props.onAcceptPrice(item.id)}
                    />
                  </div>
                </Fragment>
              ))}
            </div>

            {/* 최대 100개 안내 (정책서 1) */}
            <p className="px-[16px] pt-[16px] text-[11px] text-[#bebbbb]">
              장바구니는 최대 {MAX_ITEMS}개까지 담을 수 있어요. ({items.length}/{MAX_ITEMS})
            </p>

            <div className="mt-[24px] h-[4px] w-full bg-[rgba(26,25,25,0.05)]" />
            <div className="px-[16px] pt-[24px]">
              <PriceSummary summary={summary} onRecalculate={onRecalculate} />
            </div>
          </>
        )}

        {/* ── 플로팅 CTA ── */}
        <div className="fixed bottom-0 left-1/2 z-30 w-[360px] -translate-x-1/2">
          <div className="h-[24px] bg-gradient-to-t from-white to-transparent" />
          <div className="bg-white px-[16px] pb-[36px]">
            {mode === "blocked" && !empty && simState === "READY" && (
              <p className="mb-[8px] text-center text-[12px] text-[#ff4e32]">{blockReason(items)}</p>
            )}
            <button
              type="button"
              onClick={onCheckout}
              disabled={ctaDisabled || empty}
              className="flex h-[53px] w-full items-center justify-center rounded-full bg-[#1a1919] text-[17px] font-bold text-white transition-opacity disabled:opacity-40"
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ kind }: { kind: "normal" | "cleanup" }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-[8px] px-[24px] text-center">
      <span className="mb-[4px] text-[36px]">🛒</span>
      {kind === "cleanup" ? (
        <>
          <p className="text-[17px] font-bold text-[#1a1919]">장바구니가 자동 정리되었어요</p>
          <p className="text-[13px] leading-[1.6] text-[#8a8585]">
            회원은 30일, 비회원은 7일 이상 담아둔 상품이
            <br />
            자동으로 정리돼요.
          </p>
        </>
      ) : (
        <>
          <p className="text-[17px] font-bold text-[#1a1919]">장바구니가 비어있습니다</p>
          <p className="text-[13px] text-[#8a8585]">상품을 담아보세요.</p>
        </>
      )}
    </div>
  );
}

function FailedState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-[12px] px-[24px] text-center">
      <span className="text-[32px]">⚠️</span>
      <div>
        <p className="text-[17px] font-bold text-[#1a1919]">금액을 불러오지 못했어요</p>
        <p className="mt-[4px] text-[13px] text-[#8a8585]">잠시 후 다시 시도해주세요.</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-[4px] h-[44px] rounded-full border border-[rgba(26,25,25,0.2)] bg-white px-[24px] text-[15px] font-bold text-[#1a1919]"
      >
        다시 시도
      </button>
    </div>
  );
}
