"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { BackHeader } from "@/components/layout/BackHeader";
import { OrderCard } from "@/components/commerce/OrderCard";
import type { OrderListItem } from "@/types/order";

// created_at → "YYYY.MM.DD"
function dateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data.orders); setLoading(false); });
  }, []);

  if (loading) return <><BackHeader title="주문 내역" /><LoadingSpinner /></>;

  // 날짜별 그룹 (API가 created_at DESC로 정렬해 반환 → 순서 유지)
  const groups: { date: string; items: OrderListItem[] }[] = [];
  for (const order of orders) {
    const date = dateKey(order.created_at);
    const last = groups[groups.length - 1];
    if (last && last.date === date) last.items.push(order);
    else groups.push({ date, items: [order] });
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      <BackHeader title="주문 내역" />

      {orders.length === 0 ? (
        <EmptyState
          icon="receipt_long"
          title="주문 내역이 없습니다"
          description="첫 주문을 해보세요!"
          action={<Link href="/products"><Button variant="secondary" size="sm">상품 보러가기</Button></Link>}
        />
      ) : (
        groups.map((group) => (
          <div key={group.date} className="border-t-8 border-[#f5f5f5] first:border-t-0">
            <h2 className="px-6 pt-6 pb-1 text-[17px] font-bold text-black">{group.date}</h2>
            <div className="divide-y divide-[#f0f0f0]">
              {group.items.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
