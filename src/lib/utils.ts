import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD, CANCELLABLE_STATUSES } from "./constants";

export function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR") + "원";
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
