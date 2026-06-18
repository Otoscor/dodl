"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, isCancellable, isReturnable } from "@/lib/utils";
import type { OrderDetail } from "@/types/order";

const STATUS_BADGE: Record<string, "indigo" | "amber" | "green" | "red" | "muted"> = {
  "결제완료": "indigo",
  "배송준비": "amber",
  "배송중": "amber",
  "배송완료": "green",
  "취소완료": "red",
  "반품완료": "red",
  "교환완료": "amber",
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
      const updated = await fetch(`/api/orders/${orderId}`).then((r) => r.json());
      setOrder(updated);
    } else {
      showToast(data.message, "error");
    }
  };

  if (loading) return <><BackHeader title="주문 상세" /><LoadingSpinner /></>;
  if (!order) return <><BackHeader title="주문 상세" /><div className="p-8 text-center text-[#aaa]">주문을 찾을 수 없습니다.</div></>;

  return (
    <div className="min-h-screen bg-white pb-8">
      <BackHeader title="주문 상세" />

      {/* Order status header */}
      <div className="px-6 py-6 border-b border-[#e0e0e0]">
        <div className="flex items-center justify-between mb-2">
          <Badge variant={STATUS_BADGE[order.status] || "muted"} className="text-[12px] px-3 py-1">
            {order.status}
          </Badge>
          <span className="font-mono text-[13px] text-[#cccccc]">{order.order_number}</span>
        </div>
        <p className="text-[14px] text-[#aaa]">
          주문일: {new Date(order.created_at).toLocaleString("ko-KR")}
        </p>
        {order.expected_delivery_date && !["취소완료", "반품완료"].includes(order.status) && (
          <p className="text-[14px] text-[#888] mt-0.5">
            배송 예정일: {order.expected_delivery_date}
          </p>
        )}
        {order.cancelled_at && (
          <p className="text-[14px] text-[#888] mt-0.5">
            취소일: {new Date(order.cancelled_at).toLocaleString("ko-KR")}
          </p>
        )}
      </div>

      {/* Delivery tracking timeline */}
      {!["취소완료", "반품완료", "교환완료"].includes(order.status) && (
        <DeliveryTimeline status={order.status} />
      )}

      {/* Order items */}
      <section className="px-6 py-5 border-b border-[#e0e0e0]">
        <h2 className="text-[13px] uppercase tracking-[0.08em] text-black mb-3">주문 상품</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-12 h-12 bg-[#f5f5f5] rounded-[10px] flex items-center justify-center shrink-0">
                <span className="material-icons-outlined text-[20px] text-[#cccccc]">medication</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] text-black">{item.product_name}</p>
                {item.option_summary && (
                  <p className="text-[13px] text-[#aaa]">{item.option_summary}</p>
                )}
                <p className="text-[14px] text-[#888] mt-0.5">
                  {formatPrice(item.unit_price)} × {item.quantity}개
                </p>
              </div>
              <span className="font-mono text-[15px] text-black shrink-0">
                {formatPrice(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Gift info */}
      {order.is_gift === 1 && (
        <section className="px-6 py-5 border-b border-[#e0e0e0]">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="material-icons-outlined text-[18px] text-black">redeem</span>
            <h2 className="text-[13px] uppercase tracking-[0.08em] text-black">선물 정보</h2>
          </div>
          <dl className="space-y-2 text-[15px]">
            <div className="flex">
              <dt className="text-[#aaa] w-20 shrink-0">보내는 분</dt>
              <dd className="text-black">{order.sender_name || "-"}</dd>
            </div>
            {order.gift_message && (
              <div className="flex">
                <dt className="text-[#aaa] w-20 shrink-0">메시지</dt>
                <dd className="text-black leading-relaxed">{order.gift_message}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* Delivery info */}
      <section className="px-6 py-5 border-b border-[#e0e0e0]">
        <h2 className="text-[13px] uppercase tracking-[0.08em] text-black mb-3">
          {order.is_gift === 1 ? "선물 받는 분" : "배송 정보"}
        </h2>
        <dl className="space-y-2 text-[15px]">
          <div className="flex">
            <dt className="text-[#aaa] w-16 shrink-0">수령인</dt>
            <dd className="text-black">{order.recipient_name}</dd>
          </div>
          <div className="flex">
            <dt className="text-[#aaa] w-16 shrink-0">연락처</dt>
            <dd className="text-black">{order.recipient_phone}</dd>
          </div>
          <div className="flex">
            <dt className="text-[#aaa] w-16 shrink-0">주소</dt>
            <dd className="text-black">
              {order.address_line1 ? (
                <>
                  {order.address_line1}
                  {order.address_line2 && ` ${order.address_line2}`}
                </>
              ) : (
                <span className="text-[#aaa]">받는 분 주소 입력 대기</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      {/* Return/Exchange info */}
      {order.returned_at && (
        <section className="px-6 py-5 border-b border-[#e0e0e0]">
          <h2 className="text-[13px] uppercase tracking-[0.08em] text-black mb-3">
            {order.status === "반품완료" ? "반품" : "교환"} 정보
          </h2>
          <dl className="space-y-2 text-[15px]">
            <div className="flex">
              <dt className="text-[#aaa] w-16 shrink-0">사유</dt>
              <dd className="text-black">{order.return_reason}</dd>
            </div>
            {order.return_note && (
              <div className="flex">
                <dt className="text-[#aaa] w-16 shrink-0">메모</dt>
                <dd className="text-black">{order.return_note}</dd>
              </div>
            )}
            <div className="flex">
              <dt className="text-[#aaa] w-16 shrink-0">처리일</dt>
              <dd className="text-black">
                {new Date(order.returned_at).toLocaleString("ko-KR")}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {/* Price breakdown */}
      <section className="px-6 py-4 border-b border-[#e0e0e0] space-y-2 text-[14px]">
        <h2 className="text-[13px] uppercase tracking-[0.08em] text-black mb-3">결제 정보</h2>
        <div className="flex justify-between text-[#888]">
          <span>상품금액</span>
          <span className="font-mono">{formatPrice(order.product_total)}</span>
        </div>
        <div className="flex justify-between text-[#888]">
          <span>배송비</span>
          <span className="font-mono">{order.shipping_fee === 0 ? "무료" : formatPrice(order.shipping_fee)}</span>
        </div>
        <div className="flex justify-between text-[#888]">
          <span>결제수단</span>
          <span>{order.payment_method}</span>
        </div>
        <div className="flex justify-between text-black text-[18px] pt-2 border-t border-[#e0e0e0]">
          <span>총 결제금액</span>
          <span className="font-mono">{formatPrice(order.total_amount)}</span>
        </div>
      </section>

      {/* Cancel button */}
      {isCancellable(order.status) && (
        <div className="px-6 pt-5">
          <Button
            variant="danger"
            fullWidth
            onClick={() => setCancelModal(true)}
          >
            주문 취소
          </Button>
        </div>
      )}

      {/* Return/Exchange buttons */}
      {isReturnable(order.status) && (
        <div className="px-6 pt-5 space-y-3">
          <Button
            variant="danger"
            fullWidth
            onClick={() => router.push(`/orders/${orderId}/return`)}
          >
            반품 신청
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push(`/orders/${orderId}/exchange`)}
          >
            교환 신청
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

const TIMELINE_STEPS = [
  { key: "결제완료", label: "결제완료", icon: "payment" },
  { key: "배송준비", label: "배송준비", icon: "inventory_2" },
  { key: "배송중", label: "배송중", icon: "local_shipping" },
  { key: "배송완료", label: "배송완료", icon: "check_circle" },
] as const;

function DeliveryTimeline({ status }: { status: string }) {
  const statusOrder = TIMELINE_STEPS.map((s) => s.key);
  const currentIdx = statusOrder.indexOf(status as typeof statusOrder[number]);
  const activeIdx = currentIdx === -1 ? 0 : currentIdx;

  return (
    <div className="px-6 py-5 border-b border-[#e0e0e0]">
      <h2 className="text-[13px] uppercase tracking-[0.08em] text-black mb-4">배송 추적</h2>
      <div className="flex items-start justify-between relative">
        {/* progress bar — 첫 번째 원 중심(12.5%)부터 마지막 원 중심(87.5%)까지 */}
        <div className="absolute top-[13px] left-[12.5%] right-[12.5%] h-[2px]">
          <div className="absolute inset-0 bg-[#e0e0e0]" />
          <div
            className="absolute left-0 top-0 h-full bg-black transition-all"
            style={{ width: activeIdx === 0 ? "0%" : `${(activeIdx / (TIMELINE_STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {TIMELINE_STEPS.map((step, i) => {
          const isActive = i <= activeIdx;
          return (
            <div key={step.key} className="flex flex-col items-center relative z-10" style={{ width: `${100 / TIMELINE_STEPS.length}%` }}>
              <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center ${isActive ? "bg-black" : "bg-[#e0e0e0]"}`}>
                <span className={`material-icons-outlined text-[16px] ${isActive ? "text-white" : "text-[#aaa]"}`}>{step.icon}</span>
              </div>
              <span className={`text-[12px] mt-1.5 ${isActive ? "text-black" : "text-[#aaa]"}`}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
