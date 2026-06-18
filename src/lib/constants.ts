export const SHIPPING_FEE = 3000;
export const FREE_SHIPPING_THRESHOLD = 30000;
export const INITIAL_WALLET_BALANCE = 100000000;
export const LOW_STOCK_THRESHOLD = 5;

// 상세 페이지 정상가 표시용 고정 할인율 (데모용 — 실제 정상가 데이터 없음)
export const DISPLAY_DISCOUNT_RATE = 0.2;

export const ORDER_STATUS = {
  PAID: "결제완료",
  PREPARING: "배송준비",
  SHIPPING: "배송중",
  DELIVERED: "배송완료",
  CANCELLED: "취소완료",
  RETURN_REQUESTED: "반품요청",
  RETURN_COMPLETED: "반품완료",
  EXCHANGE_REQUESTED: "교환요청",
  EXCHANGE_COMPLETED: "교환완료",
} as const;

export const CANCELLABLE_STATUSES = [ORDER_STATUS.PAID, ORDER_STATUS.PREPARING];

export const RETURNABLE_STATUSES = [ORDER_STATUS.DELIVERED];

export const RETURN_REASONS = [
  "단순 변심", "상품 불량", "상품이 설명과 다름", "배송 중 파손", "기타",
] as const;

export const EXCHANGE_REASONS = [
  "상품 불량", "오배송 (다른 상품 수령)", "상품이 설명과 다름", "배송 중 파손", "기타",
] as const;

export const WALLET_TX_TYPE = {
  GRANT: "적립",
  PAYMENT: "사용",
  REFUND: "환불",
} as const;
