export const SHIPPING_FEE = 3000;
export const FREE_SHIPPING_THRESHOLD = 30000;
export const INITIAL_WALLET_BALANCE = 100000;
export const LOW_STOCK_THRESHOLD = 5;

export const ORDER_STATUS = {
  PAID: "결제완료",
  PREPARING: "배송준비",
  SHIPPING: "배송중",
  DELIVERED: "배송완료",
  CANCELLED: "취소완료",
} as const;

export const CANCELLABLE_STATUSES = [ORDER_STATUS.PAID, ORDER_STATUS.PREPARING];

export const WALLET_TX_TYPE = {
  GRANT: "적립",
  PAYMENT: "사용",
  REFUND: "환불",
} as const;
