"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, isCancellable } from "@/lib/utils";
import type { OrderDetail } from "@/types/order";

const STATUS_BADGE: Record<string, "indigo" | "amber" | "green" | "red" | "muted"> = {
  "결제완료": "indigo",
  "배송준비": "amber",
  "배송중": "amber",
  "배송완료": "green",
  "취소완료": "red",
};

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => { setOrder(data); setLoading(false); });
  }, [orderId]);

  const handleCancel = async () => {
    setCancelling(true);
    const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
    const data = await res.json();
    setCancelModal(false);
    setCancelling(false);

    if (data.success) {
      showToast("주문이 취소되었습니다.");
      // Refresh order
      const updated = await fetch(`/api/orders/${orderId}`).then((r) => r.json());
      setOrder(updated);
    } else {
      showToast(data.message, "error");
    }
  };

  if (loading) return <><BackHeader title="주문 상세" /><LoadingSpinner /></>;
  if (!order) return <><BackHeader title="주문 상세" /><div className="p-8 text-center text-text-tertiary">주문을 찾을 수 없습니다.</div></>;

  return (
    <div className="pb-8">
      <BackHeader title="주문 상세" />

      {/* Order status header */}
      <div className="px-4 py-5 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-2">
          <Badge variant={STATUS_BADGE[order.status] || "muted"} className="text-[11px] px-3 py-1">
            {order.status}
          </Badge>
          <span className="font-mono text-[11px] text-text-quaternary">{order.order_number}</span>
        </div>
        <p className="text-[12px] text-text-tertiary">
          주문일: {new Date(order.created_at).toLocaleString("ko-KR")}
        </p>
        {order.cancelled_at && (
          <p className="text-[12px] text-accent-red mt-0.5">
            취소일: {new Date(order.cancelled_at).toLocaleString("ko-KR")}
          </p>
        )}
      </div>

      {/* Order items */}
      <section className="px-4 py-4 border-b border-border-subtle">
        <h2 className="text-[14px] font-medium text-text-primary mb-3">주문 상품</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-12 h-12 bg-surface-elevated rounded-lg flex items-center justify-center shrink-0">
                <span className="text-lg">💊</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-text-primary">{item.product_name}</p>
                {item.option_summary && (
                  <p className="text-[11px] text-text-tertiary">{item.option_summary}</p>
                )}
                <p className="text-[12px] text-text-secondary mt-0.5">
                  {formatPrice(item.unit_price)} × {item.quantity}개
                </p>
              </div>
              <span className="font-mono text-[13px] text-text-primary shrink-0">
                {formatPrice(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery info */}
      <section className="px-4 py-4 border-b border-border-subtle">
        <h2 className="text-[14px] font-medium text-text-primary mb-3">배송 정보</h2>
        <dl className="space-y-2 text-[13px]">
          <div className="flex">
            <dt className="text-text-tertiary w-16 shrink-0">수령인</dt>
            <dd className="text-text-primary">{order.recipient_name}</dd>
          </div>
          <div className="flex">
            <dt className="text-text-tertiary w-16 shrink-0">연락처</dt>
            <dd className="text-text-primary">{order.recipient_phone}</dd>
          </div>
          <div className="flex">
            <dt className="text-text-tertiary w-16 shrink-0">주소</dt>
            <dd className="text-text-primary">
              {order.address_line1}
              {order.address_line2 && ` ${order.address_line2}`}
            </dd>
          </div>
        </dl>
      </section>

      {/* Price breakdown */}
      <section className="px-4 py-4 border-b border-border-subtle space-y-2 text-[13px]">
        <h2 className="text-[14px] font-medium text-text-primary mb-3">결제 정보</h2>
        <div className="flex justify-between text-text-secondary">
          <span>상품금액</span>
          <span className="font-mono">{formatPrice(order.product_total)}</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>배송비</span>
          <span className="font-mono">{order.shipping_fee === 0 ? "무료" : formatPrice(order.shipping_fee)}</span>
        </div>
        <div className="flex justify-between text-text-primary font-medium text-[15px] pt-2 border-t border-border-subtle">
          <span>총 결제금액</span>
          <span className="font-mono">{formatPrice(order.total_amount)}</span>
        </div>
      </section>

      {/* Cancel button */}
      {isCancellable(order.status) && (
        <div className="px-4 pt-4">
          <Button
            variant="danger"
            fullWidth
            onClick={() => setCancelModal(true)}
          >
            주문 취소
          </Button>
        </div>
      )}

      {/* Cancel confirmation modal */}
      <Modal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        title="주문을 취소하시겠습니까?"
        actions={
          <>
            <Button variant="secondary" fullWidth onClick={() => setCancelModal(false)}>
              돌아가기
            </Button>
            <Button variant="danger" fullWidth onClick={handleCancel} disabled={cancelling}>
              {cancelling ? "취소 중..." : "주문 취소"}
            </Button>
          </>
        }
      >
        주문을 취소하면 결제 금액이 가상 지갑으로 환불됩니다.
        취소 후에는 되돌릴 수 없습니다.
      </Modal>
    </div>
  );
}
