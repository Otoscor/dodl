"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PointInput } from "@/components/commerce/PointInput";
import { AddressPickerOverlay } from "@/components/commerce/AddressPickerOverlay";
import { useCart } from "@/hooks/useCart";
import { useAddresses, formatAddress } from "@/hooks/useAddresses";
import { formatPrice } from "@/lib/utils";
import { MOCK_POINT_SUMMARY, MOCK_COUPONS } from "../my/mock";
import type { CartSummary } from "@/types/cart";

type PaymentMethod = "card" | "naver" | "toss" | "kakao";

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "card", label: "신용 체크카드" },
  { id: "naver", label: "네이버페이" },
  { id: "toss", label: "토스페이" },
  { id: "kakao", label: "카카오페이" },
];

const CARD_OPTIONS = ["신한카드", "국민카드", "하나카드", "우리카드", "토스뱅크"];

const AVAILABLE_COUPONS = MOCK_COUPONS.filter((c) => !c.expired).length;

type SectionKey = "delivery" | "order" | "coupon" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { refresh } = useCart();
  const { addresses, defaultAddress } = useAddresses();

  const [cart, setCart] = useState<CartSummary | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // 배송지 — 주소록에서 선택
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addrOpen, setAddrOpen] = useState(false);

  // 포인트 + 결제수단
  const [pointsApplied, setPointsApplied] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [selectedCard, setSelectedCard] = useState("");

  // 아코디언 섹션 열림 상태
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    delivery: true,
    order: false,
    coupon: true,
    payment: true,
  });
  const toggle = (key: SectionKey) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

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

  if (loading) return <><BackHeader title="결제 정보 입력" /><LoadingSpinner /></>;
  if (!cart || cart.items.length === 0) {
    router.push("/cart");
    return null;
  }

  // 선택 주소: 명시 선택 우선, 없으면 기본 배송지
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? defaultAddress;

  const payAmount = Math.max(0, cart.total_amount - pointsApplied);
  const earnPoints = Math.floor(payAmount * MOCK_POINT_SUMMARY.earnRate / 100);
  const isBalanceSufficient = walletBalance >= payAmount;

  const canSubmit = !!selectedAddress && isBalanceSufficient && !submitting;

  const handleSubmit = async () => {
    if (!selectedAddress) {
      setErrorModal("배송지를 선택해주세요.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName: selectedAddress.recipientName,
        recipientPhone: selectedAddress.recipientPhone,
        addressLine1: `${selectedAddress.zipcode ? `[${selectedAddress.zipcode}] ` : ""}${selectedAddress.road}`,
        addressLine2: selectedAddress.detail,
        pointsApplied,
      }),
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

  const orderPreview = `${cart.items.length}개 상품 · ${formatPrice(cart.product_total)}`;

  return (
    <div className="min-h-screen bg-white pb-44">
      <BackHeader title="결제 정보 입력" />

      {/* ① 배송 정보 */}
      <SectionHeader
        title="배송 정보"
        open={openSections.delivery}
        onToggle={() => toggle("delivery")}
      />
      {openSections.delivery && (
        <div className="px-6 pb-6">
          {selectedAddress ? (
            <div className="rounded-[14px] border border-[#e0e0e0] px-4 py-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[15px] font-bold text-black">{selectedAddress.recipientName}</span>
                <button
                  onClick={() => setAddrOpen(true)}
                  className="px-3.5 py-1 text-[13px] border border-[#cccccc] rounded-full text-black bg-white hover:border-black transition-colors"
                >
                  변경
                </button>
              </div>
              <p className="text-[13px] text-[#888]">{selectedAddress.recipientPhone}</p>
              <p className="text-[13px] text-[#888] mt-1 leading-relaxed">{formatAddress(selectedAddress)}</p>
            </div>
          ) : (
            <div className="rounded-[14px] bg-[#f7f7f7] flex flex-col items-center gap-3.5 px-5 py-7">
              <p className="text-[15px] text-[#888]">배송지 정보를 입력해주세요</p>
              <Button onClick={() => setAddrOpen(true)}>배송지 추가하기</Button>
            </div>
          )}
        </div>
      )}

      {/* ② 주문상품 */}
      <SectionHeader
        title="주문상품"
        open={openSections.order}
        onToggle={() => toggle("order")}
        preview={!openSections.order ? orderPreview : undefined}
      />
      {openSections.order && (
        <div className="px-6 pb-6 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-14 h-14 bg-[#f5f5f5] rounded-[10px] flex items-center justify-center shrink-0">
                <span className="material-icons-outlined text-[22px] text-[#cccccc]">medication</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] text-black truncate">{item.product_name}</p>
                {item.option_summary && (
                  <p className="text-[13px] text-[#aaa]">{item.option_summary} {item.quantity}개</p>
                )}
                <p className="text-[14px] font-bold text-black mt-0.5">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ③ 쿠폰 (포인트 + 쿠폰) */}
      <SectionHeader
        title="쿠폰"
        open={openSections.coupon}
        onToggle={() => toggle("coupon")}
      />
      {openSections.coupon && (
        <div className="px-6 pb-6 space-y-4">
          <PointInput
            balance={MOCK_POINT_SUMMARY.balance}
            applied={pointsApplied}
            onChange={setPointsApplied}
          />
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-[#888]">쿠폰</span>
            <span className="text-[14px] text-[#aaa]">{AVAILABLE_COUPONS}장 사용 가능</span>
          </div>
        </div>
      )}

      {/* ④ 결제수단 */}
      <SectionHeader
        title="결제수단"
        open={openSections.payment}
        onToggle={() => toggle("payment")}
      />
      {openSections.payment && (
        <div className="px-6 pb-6 space-y-3">
          {PAYMENT_METHODS.map((pm) => (
            <div key={pm.id}>
              <button
                onClick={() => setPaymentMethod(pm.id)}
                className="flex items-center gap-3 w-full py-1"
              >
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                  paymentMethod === pm.id ? "border-black" : "border-[#ccc]"
                }`}>
                  {paymentMethod === pm.id && (
                    <span className="w-2.5 h-2.5 rounded-full bg-black" />
                  )}
                </span>
                <span className={`text-[15px] ${paymentMethod === pm.id ? "text-black" : "text-[#888]"}`}>
                  {pm.label}
                </span>
              </button>
              {pm.id === "card" && paymentMethod === "card" && (
                <div className="ml-8 mt-2">
                  <select
                    value={selectedCard}
                    onChange={(e) => setSelectedCard(e.target.value)}
                    className="w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-4 py-3 text-[15px] text-[#888] outline-none"
                  >
                    <option value="">카드사 선택</option>
                    {CARD_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
          <p className="text-[12px] text-[#aaa] pt-1">데모 결제는 가상 지갑에서 차감됩니다.</p>
        </div>
      )}

      {/* ⑤ 최종 결제 금액 */}
      <div className="border-t border-[#f0f0f0] px-6 py-6 space-y-2.5 text-[14px]">
        <h2 className="text-[16px] font-medium text-black mb-4">최종 결제 금액</h2>
        <div className="flex justify-between">
          <span className="text-[#888]">총 금액</span>
          <span className="font-mono text-black">{formatPrice(cart.product_total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#888]">배송비</span>
          <span className="font-mono text-black">
            {cart.shipping_fee === 0 ? "무료" : formatPrice(cart.shipping_fee)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#888]">총 할인금액</span>
          <span className="font-mono text-black">0원</span>
        </div>
        {pointsApplied > 0 && (
          <div className="flex justify-between">
            <span className="text-[#888]">포인트 사용</span>
            <span className="font-mono text-black">-{formatPrice(pointsApplied)}</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-3 border-t border-[#e0e0e0]">
          <span className="text-[16px] font-medium text-black">결제 금액</span>
          <span className="font-mono text-[20px] font-bold text-black">{formatPrice(payAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#888]">적립 예정 포인트</span>
          <span className="text-[#888]">+{earnPoints.toLocaleString()}P</span>
        </div>
        {!isBalanceSufficient && (
          <p className="text-[13px] text-[#e00] pt-1">
            잔액이 부족합니다. ({formatPrice(payAmount - walletBalance)} 부족)
          </p>
        )}
      </div>

      {/* 고정 하단 CTA */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white px-6 py-5 z-30">
        <Button fullWidth size="lg" disabled={!canSubmit} onClick={handleSubmit}>
          {submitting ? "결제 중..." : `${formatPrice(payAmount)} 구매하기`}
        </Button>
      </div>

      <Modal open={!!errorModal} onClose={() => setErrorModal(null)} title="결제 실패">
        {errorModal}
      </Modal>

      <AddressPickerOverlay
        open={addrOpen}
        onClose={() => setAddrOpen(false)}
        mode="select"
        selectedId={selectedAddress?.id ?? null}
        onSelect={(addr) => setSelectedAddressId(addr.id)}
      />
    </div>
  );
}

function SectionHeader({
  title,
  open,
  onToggle,
  preview,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  preview?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between border-t border-[#f0f0f0] px-6 py-5"
    >
      <span className="text-[16px] font-medium text-black">{title}</span>
      <div className="flex items-center gap-2">
        {preview && <span className="text-[13px] text-[#888] truncate max-w-[180px]">{preview}</span>}
        <span className="material-icons-outlined text-[20px] text-[#888] shrink-0">
          {open ? "keyboard_arrow_up" : "keyboard_arrow_down"}
        </span>
      </div>
    </button>
  );
}
