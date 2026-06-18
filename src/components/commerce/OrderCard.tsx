"use client";

import { useRouter } from "next/navigation";
import { formatPrice, getOrderActions } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import type { OrderListItem } from "@/types/order";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 배송중/배송완료/구매확정에 한해 도착(예정)일 문구 반환
function arrivalText(order: OrderListItem): string | null {
  const d = order.expected_delivery_date;
  if (!d) return null;
  const [y, m, day] = d.split("-").map(Number);
  if (!y || !m || !day) return null;
  const wd = WEEKDAYS[new Date(y, m - 1, day).getDay()];
  const base = `${m}.${day}(${wd})`;
  if (order.status === ORDER_STATUS.DELIVERED || order.status === ORDER_STATUS.CONFIRMED) {
    return `${base} 도착`;
  }
  if (order.status === ORDER_STATUS.SHIPPING) return `${base} 도착 예정`;
  return null;
}

export function OrderCard({ order }: { order: OrderListItem }) {
  const router = useRouter();
  const first = order.items[0];
  const extra = order.items.length - 1;
  const arrival = arrivalText(order);
  const actions = getOrderActions(order.status);

  return (
    <div className="px-6 py-5">
      {/* 상태 + 도착일 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[15px] font-bold text-black">{order.status}</span>
        {arrival && (
          <span className="text-[14px] font-medium text-[#3b82f6]">{arrival}</span>
        )}
      </div>

      {/* 상품 (탭 → 상세) */}
      <button
        type="button"
        onClick={() => router.push(`/orders/${order.id}`)}
        className="w-full flex gap-3 text-left active:opacity-70"
      >
        <div className="w-[72px] h-[72px] rounded-[12px] bg-[#f5f5f5] overflow-hidden shrink-0 flex items-center justify-center">
          {first?.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={first.image_url} alt={first.product_name} className="w-full h-full object-cover" />
          ) : (
            <span className="material-icons-outlined text-[26px] text-[#cccccc]">medication</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] text-black leading-snug truncate">
            {first?.product_name ?? "상품"}
            {extra > 0 && <span className="text-[#aaa]"> 외 {extra}개</span>}
          </p>
          {first && (
            <p className="text-[13px] text-[#aaa] mt-0.5 truncate">
              {first.option_summary ? `[옵션] ${first.option_summary} · ` : ""}
              {first.quantity}개
            </p>
          )}
          <p className="text-[16px] font-bold text-black mt-1">
            {formatPrice(order.total_amount)}
          </p>
        </div>
      </button>

      {/* 상태별 액션 버튼 (UI만 — 동작 추후 연결) */}
      {actions.length > 0 && (
        <div className="flex gap-2 mt-4">
          {actions.map((label) => (
            <button
              key={label}
              type="button"
              className="flex-1 rounded-[10px] border border-[#e0e0e0] bg-white py-2.5 text-[13px] text-[#555] active:bg-[#f5f5f5]"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
