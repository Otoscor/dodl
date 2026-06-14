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
    <div>
      <BackHeader title="주문 내역" />

      {orders.length === 0 ? (
        <EmptyState
          icon="📋"
          title="주문 내역이 없습니다"
          description="첫 주문을 해보세요!"
          action={<Link href="/products"><Button variant="secondary" size="sm">상품 보러가기</Button></Link>}
        />
      ) : (
        <div className="divide-y divide-border-subtle">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block px-4 py-4 hover:bg-surface-elevated/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-mono text-[12px] text-text-tertiary">{order.order_number}</p>
                  <p className="text-[11px] text-text-quaternary mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <Badge variant={STATUS_BADGE[order.status] || "muted"}>
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">{order.recipient_name}</span>
                <span className="font-mono text-[14px] text-text-primary font-medium">
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
