"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { BackHeader } from "@/components/layout/BackHeader";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/order";

const STATUS_BADGE: Record<string, "indigo" | "amber" | "green" | "red" | "muted"> = {
  "결제완료": "indigo",
  "배송준비": "amber",
  "배송중": "amber",
  "배송완료": "green",
  "취소완료": "red",
  "반품완료": "red",
  "교환완료": "amber",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data.orders); setLoading(false); });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white">
      <BackHeader title="주문 내역" />

      {orders.length === 0 ? (
        <EmptyState
          icon="receipt_long"
          title="주문 내역이 없습니다"
          description="첫 주문을 해보세요!"
          action={<Link href="/products"><Button variant="secondary" size="sm">상품 보러가기</Button></Link>}
        />
      ) : (
        <div className="divide-y divide-[#e0e0e0]">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block px-6 py-6 hover:bg-[#f5f5f5] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-[13px] text-[#aaa]">{order.order_number}</p>
                  <p className="text-[12px] text-[#cccccc] mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <Badge variant={STATUS_BADGE[order.status] || "muted"}>
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[15px] text-[#888]">{order.recipient_name}</span>
                <span className="font-mono text-[16px] text-black">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
