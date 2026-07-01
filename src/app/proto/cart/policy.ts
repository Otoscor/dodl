// ────────────────────────────────────────────────────────────────
// 장바구니 정책 (Cart UI 정책서 Draft 반영)
//
// SoT 분리:
//  · 시각(색·폰트·radius·레이아웃) = Figma node 872:8697
//  · 정책(상태 taxonomy·라벨·시뮬레이션·CTA·해결 플로우) = 정책서 Draft
//
// 이 파일이 곧 "정책 문서"다. ⚠️ = 정책서상 "결정 필요"(오픈 퀘스천) 항목의 1차 가정.
// ────────────────────────────────────────────────────────────────

/** 상품당 최소 주문 수량. */
export const MIN_QTY = 1;

/** 장바구니 최대 항목 수(정책서 1: 최대 100 항목). */
export const MAX_ITEMS = 100;

/** 기본 배송비. ⚠️ 정책서 오픈#2: 장바구니에선 "예상"으로 표기. */
export const SHIPPING_FEE = 3000;
export const FREE_SHIPPING_THRESHOLD = 30000;
/** ⚠️ 무료배송 적용 여부(1차 false = Figma 정액). 정책 확정 시 전환. */
export const FREE_SHIPPING_ENABLED = false;

// ── 아이템 상태 taxonomy (정책서 2.1) ──
export type ItemStatus =
  | "NORMAL" // 정상 구매 가능
  | "PRICE_CHANGED" // 가격 변동(담을 때 대비)
  | "INSUFFICIENT_STOCK" // 요청 수량 > 가용 재고
  | "SOLD_OUT" // 가용 재고 0
  | "DISCONTINUED"; // 판매중단/단종 → 결제 차단

export const STATUS_LABEL: Record<ItemStatus, string> = {
  NORMAL: "",
  PRICE_CHANGED: "가격 변동",
  INSUFFICIENT_STOCK: "수량 부족",
  SOLD_OUT: "품절",
  DISCONTINUED: "판매 중단",
};

/** 이미지 위 뱃지로 딤 처리되는 상태(구매 불가·재고0). */
export const BADGE_STATUS: Partial<Record<ItemStatus, string>> = {
  SOLD_OUT: "품절",
  DISCONTINUED: "판매 중단",
};

export interface CartItem {
  id: string;
  name: string;
  option: string;
  image: string;
  originalPrice: number; // 정상가(단가)
  salePrice: number; // 현재 판매가(단가)
  prevPrice?: number; // PRICE_CHANGED: 담을 때의 판매가
  quantity: number;
  stock: number; // 가용 재고
  status: ItemStatus;
}

// ── 상태 판정 ──

/** 결제 차단 유발(비-NORMAL은 모두 재확인 필요). 정책서 3.1. */
export function isBlocking(i: CartItem): boolean {
  return i.status !== "NORMAL";
}

/** 재고 0/판매중단은 이미지 뱃지·가격 제외·삭제 유도. */
export function isUnavailable(i: CartItem): boolean {
  return i.status === "SOLD_OUT" || i.status === "DISCONTINUED";
}

/** 가격 시뮬레이션에 포함되는 항목(구매 불가 제외). */
export function isPriceable(i: CartItem): boolean {
  return !isUnavailable(i);
}

/** 수량 스텝퍼 노출 여부(구매 불가 항목은 미노출). */
export function hasStepper(i: CartItem): boolean {
  return !isUnavailable(i);
}

export function canDecrement(i: CartItem): boolean {
  return hasStepper(i) && i.quantity > MIN_QTY;
}

/** + 는 가용 재고 상한까지. INSUFFICIENT_STOCK(qty>stock)이면 이미 상한 초과 → 비활성. */
export function canIncrement(i: CartItem): boolean {
  return hasStepper(i) && i.quantity < i.stock;
}

/** "남은 재고: N" 힌트(재고 임박 or 부족 시). */
export const LOW_STOCK_HINT = 5;
export function showStockHint(i: CartItem): boolean {
  return i.status === "NORMAL" && i.stock > 0 && i.stock <= LOW_STOCK_HINT;
}

// ── 페이지(시뮬레이션) 상태 (정책서 2.2) ──
export type SimState = "SIMULATING" | "READY" | "FAILED";

// ── 장바구니 전체 판정 ──

export function problemItems(items: CartItem[]): CartItem[] {
  return items.filter(isBlocking);
}

export function allNormal(items: CartItem[]): boolean {
  return items.length > 0 && items.every((i) => i.status === "NORMAL");
}

/** 문제 항목이 전부 PRICE_CHANGED뿐인지(→ 확인 모달 후 진행 허용, 정책서 3.1 예외). */
export function onlyPriceChanged(items: CartItem[]): boolean {
  const p = problemItems(items);
  return p.length > 0 && p.every((i) => i.status === "PRICE_CHANGED");
}

export type CtaMode = "checkout" | "confirm" | "blocked";

/**
 * CTA 정책(정책서 3.1).
 *  · 전부 NORMAL → checkout(결제)
 *  · 문제가 PRICE_CHANGED뿐 → confirm(⚠️ 1차 가정: 변경 확인 모달 후 진행 허용)
 *  · 그 외(품절/판매중단/수량부족 포함) → blocked(사유 노출)
 */
export function ctaMode(items: CartItem[]): CtaMode {
  if (items.length === 0) return "blocked";
  if (allNormal(items)) return "checkout";
  if (onlyPriceChanged(items)) return "confirm";
  return "blocked";
}

/** 차단 사유 문구(배너·CTA 근처 노출). */
export function blockReason(items: CartItem[]): string {
  const p = problemItems(items);
  if (p.some((i) => i.status === "SOLD_OUT" || i.status === "DISCONTINUED"))
    return "구매할 수 없는 상품을 삭제해주세요.";
  if (p.some((i) => i.status === "INSUFFICIENT_STOCK"))
    return "재고가 부족한 상품의 수량을 조정해주세요.";
  if (p.some((i) => i.status === "PRICE_CHANGED"))
    return "변경된 금액을 확인해주세요.";
  return "";
}

export interface PriceSummary {
  total: number; // 총 금액 = Σ 시뮬대상(정상가 × 수량)
  discount: number; // 예상 할인 금액 = Σ (정상가 − 판매가) × 수량
  shipping: number; // 배송비(예상)
  payable: number; // 결제 예상 금액
  count: number; // 시뮬대상 수량 합
}

/** 예상 결제 금액 시뮬레이션(Pricing·Promotion·Inventory 합산, 정책서 1). */
export function priceSummary(items: CartItem[]): PriceSummary {
  const priceable = items.filter(isPriceable);
  const total = priceable.reduce((s, i) => s + i.originalPrice * i.quantity, 0);
  const discount = priceable.reduce(
    (s, i) => s + (i.originalPrice - i.salePrice) * i.quantity,
    0,
  );
  const subtotal = total - discount;
  const shipping =
    subtotal === 0
      ? 0
      : FREE_SHIPPING_ENABLED && subtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : SHIPPING_FEE;
  return {
    total,
    discount,
    shipping,
    payable: subtotal + shipping,
    count: priceable.reduce((s, i) => s + i.quantity, 0),
  };
}

/** 가격 표기 — ko-KR + "원". */
export function formatWon(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}
