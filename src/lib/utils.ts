import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD, CANCELLABLE_STATUSES, RETURNABLE_STATUSES, DISPLAY_DISCOUNT_RATE, ORDER_STATUS, RETURN_SHIPPING_FEE, RETURN_FEE_REASONS, EXCHANGE_SHIPPING_FEE, EXCHANGE_FEE_REASONS } from "./constants";

export function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR") + "원";
}

// 최종가(판매가)에서 고정 할인율을 역산해 정상가를 구한다. 100원 단위로 반올림.
export function originalPrice(finalPrice: number): number {
  return Math.round(finalPrice / (1 - DISPLAY_DISCOUNT_RATE) / 100) * 100;
}

export function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString().slice(2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${dateStr}-${rand}`;
}

export function calculateShippingFee(productTotal: number): number {
  return productTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function isCancellable(status: string): boolean {
  return CANCELLABLE_STATUSES.includes(status as typeof CANCELLABLE_STATUSES[number]);
}

export function isReturnable(status: string): boolean {
  return RETURNABLE_STATUSES.includes(status as typeof RETURNABLE_STATUSES[number]);
}

// 반품 사유에 따른 반품 배송비 — 고객 귀책(단순 변심·기타)만 차감, 그 외 무료
export function returnShippingFee(reason: string): number {
  return RETURN_FEE_REASONS.includes(reason) ? RETURN_SHIPPING_FEE : 0;
}

// 교환 사유에 따른 교환 배송비(왕복) — 고객 귀책(기타)만 차감, 그 외 무료
export function exchangeShippingFee(reason: string): number {
  return EXCHANGE_FEE_REASONS.includes(reason) ? EXCHANGE_SHIPPING_FEE : 0;
}

// 주문 상태별 노출 액션 버튼 라벨 (목록 카드용 — 동작은 추후 연결).
// 정책: 취소=결제완료·배송준비, 반품/교환=배송완료. 구매확정은 반품/교환 불가.
export function getOrderActions(status: string): string[] {
  switch (status) {
    case ORDER_STATUS.PAID:
    case ORDER_STATUS.PREPARING:
      return ["주문취소"];
    case ORDER_STATUS.SHIPPING:
      return ["배송조회"];
    case ORDER_STATUS.DELIVERED:
      return ["배송조회", "반품접수", "교환접수"];
    case ORDER_STATUS.CONFIRMED:
      return ["배송조회", "재구매"];
    case ORDER_STATUS.CANCELLED:
      return ["취소상세", "재구매"];
    case ORDER_STATUS.RETURN_COMPLETED:
      return ["반품상세", "재구매"];
    case ORDER_STATUS.EXCHANGE_COMPLETED:
      return ["교환상세", "재구매"];
    default:
      return [];
  }
}
