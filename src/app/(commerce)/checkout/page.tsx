"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import type { CartSummary } from "@/types/cart";

export default function CheckoutPage() {
  const router = useRouter();
  const { refresh } = useCart();

  const [cart, setCart] = useState<CartSummary | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const [form, setForm] = useState({
    recipientName: "",
    recipientPhone: "",
    addressLine1: "",
    addressLine2: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/cart").then((r) => r.json()),
      fetch("/api/wallet").then((r) => r.json()),
    ]).then(([cartData, walletData]) => {
      setCart(cartData);
      setWalletBalance(walletData.wallet.balance);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async () => {
    if (!form.recipientName || !form.recipientPhone || !form.addressLine1) {
      setErrorModal("배송 정보를 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (data.success) {
      refresh();
      router.push(`/order-complete?orderId=${data.orderId}&orderNumber=${data.orderNumber}`);
    } else {
      setErrorModal(data.message);
      setSubmitting(false);
    }
  };

  if (loading) return <><BackHeader title="주문/결제" /><LoadingSpinner /></>;
  if (!cart || cart.items.length === 0) {
    router.push("/cart");
    return null;
  }

  const isBalanceSufficient = walletBalance >= cart.total_amount;

  return (
    <div className="min-h-screen bg-white pb-44">
      <BackHeader title="주문/결제" />

      {/* Order items summary */}
      <section className="px-6 py-5 border-b border-[#e0e0e0]">
        <h2 className="text-[13px] uppercase tracking-[0.08em] text-black mb-3">주문 상품</h2>
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-12 h-12 bg-[#f5f5f5] rounded-[10px] flex items-center justify-center shrink-0">
                <span className="material-icons-outlined text-[20px] text-[#cccccc]">medication</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] text-black truncate">{item.product_name}</p>
                {item.option_summary && (
                  <p className="text-[13px] text-[#aaa]">{item.option_summary}</p>
                )}
                <p className="text-[14px] text-[#888] mt-0.5">
                  {formatPrice(item.price)} × {item.quantity}개
                </p>
              </div>
              <span className="font-mono text-[15px] text-black shrink-0">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Shipping info form */}
      <section className="px-6 py-5 border-b border-[#e0e0e0]">
        <h2 className="text-[13px] uppercase tracking-[0.08em] text-black mb-3">배송 정보</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="수령인 이름"
            value={form.recipientName}
            onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
            className="w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-4 py-3 text-[15px] text-black placeholder:text-[#cccccc] outline-none focus:border-black transition-colors"
          />
          <input
            type="tel"
            placeholder="연락처 (010-0000-0000)"
            value={form.recipientPhone}
            onChange={(e) => setForm({ ...form, recipientPhone: e.target.value })}
            className="w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-4 py-3 text-[15px] text-black placeholder:text-[#cccccc] outline-none focus:border-black transition-colors"
          />
          <input
            type="text"
            placeholder="주소"
            value={form.addressLine1}
            onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
            className="w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-4 py-3 text-[15px] text-black placeholder:text-[#cccccc] outline-none focus:border-black transition-colors"
          />
          <input
            type="text"
            placeholder="상세주소 (선택)"
            value={form.addressLine2}
            onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
            className="w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-4 py-3 text-[15px] text-black placeholder:text-[#cccccc] outline-none focus:border-black transition-colors"
          />
        </div>
      </section>

      {/* Price breakdown */}
      <section className="px-6 py-4 border-b border-[#e0e0e0] space-y-2 text-[14px]">
        <h2 className="text-[13px] uppercase tracking-[0.08em] text-black mb-3">결제 금액</h2>
        <div className="flex justify-between text-[#888]">
          <span>상품금액</span>
          <span className="font-mono">{formatPrice(cart.product_total)}</span>
        </div>
        <div className="flex justify-between text-[#888]">
          <span>배송비</span>
          <span className="font-mono">{cart.shipping_fee === 0 ? "무료" : formatPrice(cart.shipping_fee)}</span>
        </div>
        <div className="flex justify-between text-black text-[18px] pt-2 border-t border-[#e0e0e0]">
          <span>총 결제금액</span>
          <span className="font-mono">{formatPrice(cart.total_amount)}</span>
        </div>
      </section>

      {/* Wallet balance */}
      <section className="px-6 py-5">
        <div className="flex justify-between items-center">
          <span className="text-[14px] text-[#888]">가상 지갑 잔액</span>
          <span className={`font-mono text-[16px] ${isBalanceSufficient ? "text-black" : "text-[#888]"}`}>
            {formatPrice(walletBalance)}
          </span>
        </div>
        {!isBalanceSufficient && (
          <p className="text-[14px] text-[#888] mt-1">
            잔액이 부족합니다. ({formatPrice(cart.total_amount - walletBalance)} 부족)
          </p>
        )}
      </section>

      {/* Submit button */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-md px-6 py-5 z-30">
        <Button
          fullWidth
          size="lg"
          disabled={submitting || !isBalanceSufficient}
          onClick={handleSubmit}
        >
          {submitting ? "결제 중..." : `${formatPrice(cart.total_amount)} 결제하기`}
        </Button>
      </div>

      {/* Error modal */}
      <Modal
        open={!!errorModal}
        onClose={() => setErrorModal(null)}
        title="결제 실패"
      >
        {errorModal}
      </Modal>
    </div>
  );
}
