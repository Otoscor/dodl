"use client";

import Image from "next/image";
import type { CartItem } from "../policy";
import {
  BADGE_STATUS,
  canDecrement,
  canIncrement,
  formatWon,
  hasStepper,
  isUnavailable,
  showStockHint,
  STATUS_LABEL,
} from "../policy";
import QuantityStepper from "./QuantityStepper";

interface Props {
  item: CartItem;
  loading: boolean;
  onDec: () => void;
  onInc: () => void;
  onRemove: () => void;
  onAdjustStock: () => void; // INSUFFICIENT_STOCK → 수량을 재고로 조정
  onAcceptPrice: () => void; // PRICE_CHANGED → 새 금액 반영
}

// 상태 칩(가격 변동·수량 부족). 품절/판매중단은 이미지 뱃지가 라벨 역할.
function StatusChip({ status }: { status: CartItem["status"] }) {
  const label = STATUS_LABEL[status];
  if (!label || status === "SOLD_OUT" || status === "DISCONTINUED") return null;
  const tint =
    status === "PRICE_CHANGED"
      ? "bg-[rgba(240,150,0,0.12)] text-[#b26b00]"
      : "bg-[rgba(255,78,50,0.1)] text-[#ff4e32]";
  return (
    <span className={`inline-flex items-center rounded-full px-[8px] py-[2px] text-[11px] font-bold ${tint}`}>
      {label}
    </span>
  );
}

function ResolveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[32px] rounded-[8px] border border-[rgba(26,25,25,0.2)] bg-white px-[12px] text-[13px] font-bold text-[#1a1919]"
    >
      {label}
    </button>
  );
}

export default function CartItemRow({
  item,
  loading,
  onDec,
  onInc,
  onRemove,
  onAdjustStock,
  onAcceptPrice,
}: Props) {
  const badge = BADGE_STATUS[item.status];
  const unavailable = isUnavailable(item);

  return (
    <div className="relative flex w-full items-start justify-between">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <span className="size-[36px] animate-spin rounded-full border-[3px] border-[rgba(26,25,25,0.15)] border-t-[#1a1919]" />
        </div>
      )}
      <div className={`flex flex-1 flex-col ${loading ? "opacity-40" : ""}`}>
        <div className="flex w-full items-start gap-[16px]">
          {/* 이미지 (+ 품절/판매중단 뱃지) */}
          <div className="relative size-[72px] shrink-0 overflow-hidden rounded-[8px] bg-[#f5f5f5]">
            <Image src={item.image} alt="" fill sizes="72px" className="object-cover" />
            {badge && (
              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.6)]">
                <span className="px-1 text-center text-[13px] font-medium text-white">{badge}</span>
              </div>
            )}
          </div>

          {/* 상세 */}
          <div className="flex min-w-0 flex-1 flex-col gap-[12px]">
            <div className={`flex flex-col gap-[8px] ${unavailable ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-[8px]">
                <p className="min-w-0 flex-1 break-words text-[13px] text-[#1a1919]">{item.name}</p>
                <StatusChip status={item.status} />
              </div>
              <div className="flex items-center gap-[8px]">
                <p className="whitespace-nowrap text-[13px] text-[#8a8585]">{item.option}</p>
                <span className="h-[12px] w-px bg-[rgba(26,25,25,0.1)]" />
                <p className="whitespace-nowrap text-[13px] text-[#8a8585]">1개</p>
              </div>

              {/* 가격 행 */}
              {unavailable ? (
                <p className="text-[15px] font-bold text-[#1a1919]">{badge}</p>
              ) : item.status === "PRICE_CHANGED" ? (
                <div className="flex items-baseline gap-[6px]">
                  {item.prevPrice !== undefined && (
                    <span className="text-[13px] text-[#bebbbb] line-through">
                      {formatWon(item.prevPrice)}
                    </span>
                  )}
                  <span className="text-[15px] font-bold text-[#1a1919]">
                    {formatWon(item.salePrice)}
                  </span>
                </div>
              ) : (
                <p className="text-[15px] font-bold text-[#1a1919]">{formatWon(item.salePrice)}</p>
              )}
            </div>

            {/* 상태별 안내 문구 */}
            {showStockHint(item) && (
              <p className="text-[11px] font-bold text-[#8a8585]">남은 재고: {item.stock}</p>
            )}
            {item.status === "INSUFFICIENT_STOCK" && (
              <p className="text-[11px] text-[#ff4e32]">
                재고가 부족해요. 최대 {item.stock}개까지 담을 수 있어요.
              </p>
            )}
            {item.status === "PRICE_CHANGED" && (
              <p className="text-[11px] text-[#b26b00]">담은 이후 가격이 변경되었어요.</p>
            )}

            {/* 하단 컨트롤: 스텝퍼 + 해결 버튼 */}
            <div className="flex items-center gap-[8px]">
              {hasStepper(item) && (
                <QuantityStepper
                  value={item.quantity}
                  canDec={canDecrement(item)}
                  canInc={canIncrement(item)}
                  onDec={onDec}
                  onInc={onInc}
                />
              )}
              {item.status === "INSUFFICIENT_STOCK" && (
                <ResolveButton label={`${item.stock}개로 조정`} onClick={onAdjustStock} />
              )}
              {item.status === "PRICE_CHANGED" && (
                <ResolveButton label="새 금액 반영" onClick={onAcceptPrice} />
              )}
              {unavailable && <ResolveButton label="삭제하기" onClick={onRemove} />}
            </div>
          </div>
        </div>
      </div>

      {/* 우상단 X */}
      <button type="button" aria-label="삭제" onClick={onRemove} className="relative ml-[8px] size-[16px] shrink-0">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" stroke="#1a1919" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
