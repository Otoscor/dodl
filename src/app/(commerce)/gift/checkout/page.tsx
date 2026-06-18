"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatPrice, calculateShippingFee } from "@/lib/utils";
import { MOCK_ADDRESSES, MOCK_POINT_SUMMARY, MOCK_COUPONS, MOCK_PAYMENTS } from "../../my/mock";
import type { GiftItem, GiftAddressMode } from "@/lib/queries/gift";

// 보내는 사람(나) 기본 정보 — 데모용 프리필
const ME = { name: "홍길동", phone: "010-1234-5678" };

export default function GiftCheckoutPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GiftCheckoutContent />
    </Suspense>
  );
}

function GiftCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const skuId = searchParams.get("skuId") || "";
  const qty = Math.max(1, parseInt(searchParams.get("qty") || "1", 10));

  const [item, setItem] = useState<GiftItem | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // 받는 분
  const [recipientName, setRecipientName] = useState(searchParams.get("recipientName") || "");
  const [recipientPhone, setRecipientPhone] = useState(searchParams.get("recipientPhone") || "");

  // 배송지 모드 + 주소
  const [addressMode, setAddressMode] = useState<GiftAddressMode>("sender");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");

  // 보내는 사람 + 메시지
  const [senderName, setSenderName] = useState(ME.name);
  const [senderPhone, setSenderPhone] = useState(ME.phone);
  const [giftMessage, setGiftMessage] = useState("");

  useEffect(() => {
    if (!skuId) return;
    Promise.all([
      fetch(`/api/gift/item?skuId=${skuId}`).then((r) => r.json()),
      fetch("/api/wallet").then((r) => r.json()),
    ]).then(([itemData, walletData]) => {
      setItem(itemData.item);
      setWalletBalance(walletData.wallet.balance);
      setLoading(false);
    });
  }, [skuId]);

  if (!skuId) {
    return (
      <div className="min-h-screen bg-white">
        <BackHeader title="선물 정보 입력" />
        <p className="p-8 text-center text-[14px] text-[#aaa]">선물할 상품 정보가 없습니다.</p>
      </div>
    );
  }
  if (loading) return (<><BackHeader title="선물 정보 입력" /><LoadingSpinner /></>);
  if (!item) {
    return (
      <div className="min-h-screen bg-white">
        <BackHeader title="선물 정보 입력" />
        <p className="p-8 text-center text-[14px] text-[#aaa]">선물할 상품 정보가 없습니다.</p>
      </div>
    );
  }

  const productTotal = item.price * qty;
  const shippingFee = calculateShippingFee(productTotal);
  const totalAmount = productTotal + shippingFee;
  const isBalanceSufficient = walletBalance >= totalAmount;

  const addressRequiredOk = addressMode === "recipient" || !!addressLine1.trim();
  const canSubmit =
    !!recipientName.trim() &&
    !!recipientPhone.trim() &&
    !!senderName.trim() &&
    addressRequiredOk &&
    isBalanceSufficient &&
    !submitting;

  const handleSubmit = async () => {
    if (!recipientName.trim() || !recipientPhone.trim()) {
      setErrorModal("받는 분 정보를 입력해주세요.");
      return;
    }
    if (addressMode === "sender" && !addressLine1.trim()) {
      setErrorModal("선물 배송지를 입력해주세요.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/gift/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skuId,
        quantity: qty,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        addressMode,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        giftMessage: giftMessage.trim(),
      }),
    });
    const data = await res.json();
    if (data.success) {
      const params = new URLSearchParams({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        mode: addressMode,
      });
      router.push(`/gift/complete?${params.toString()}`);
    } else {
      setErrorModal(data.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-44">
      <BackHeader title="선물 정보 입력" />

      {/* 받는 분 정보 */}
      <section className="px-6 py-5 border-b border-[#e0e0e0]">
        <h2 className="text-[13px] uppercase tracking-[0.08em] text-black mb-3">선물 받는 분 정보</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="받는 분 이름"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className={inputCls}
          />
          <input
            type="tel"
            placeholder="연락처 (010-0000-0000)"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            className={inputCls}
          />
        </div>
      </section>

      {/* 선물 배송지 정보 */}
      <section className="px-6 py-5 border-b border-[#e0e0e0]">
        <h2 className="text-[13px] uppercase tracking-[0.08em] text-black mb-3">선물 배송지 정보</h2>
        <div className="flex items-center gap-2 mb-4">
          {([
            ["sender", "직접 입력"],
            ["recipient", "받는 분이 입력"],
          ] as const).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setAddressMode(mode)}
              className={`flex-1 h-10 rounded-[10px] text-[14px] transition-colors ${
                addressMode === mode ? "bg-black text-white" : "bg-[#f5f5f5] text-[#888]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {addressMode === "sender" ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="주소"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className={inputCls}
            />
            <input
              type="text"
              placeholder="상세주소 (선택)"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className={inputCls}
            />
            {/* 내 배송지에서 선택 */}
            <div className="pt-1">
              <p className="text-[12px] text-[#aaa] mb-2">내 배송지에서 선택</p>
              <div className="flex flex-col gap-2">
                {MOCK_ADDRESSES.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { setAddressLine1(a.address); setAddressLine2(""); }}
                    className="text-left rounded-[10px] border border-[#e0e0e0] px-3 py-2.5 active:bg-[#f5f5f5]"
                  >
                    <span className="block text-[14px] text-black">{a.name}</span>
                    <span className="block text-[13px] text-[#aaa] truncate">{a.address}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[10px] bg-[#f5f5f5] px-4 py-3.5">
            <p className="text-[14px] text-[#555] leading-relaxed">
              결제 후 생성되는 <span className="text-black">선물 링크</span>를 통해 받는 분이 직접 배송지를
              입력합니다. 주소가 입력되면 발송돼요.
            </p>
          </div>
        )}
      </section>

      {/* 보내는 사람 + 메시지 */}
      <section className="px-6 py-5 border-b border-[#e0e0e0]">
        <h2 className="text-[13px] uppercase tracking-[0.08em] text-black mb-3">보내는 사람 정보</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="성명"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className={inputCls}
          />
          <input
            type="tel"
            placeholder="휴대폰 번호"
            value={senderPhone}
            onChange={(e) => setSenderPhone(e.target.value)}
            className={inputCls}
          />
          <div>
            <textarea
              placeholder="받는 분께 보낼 메시지를 입력해보세요"
              value={giftMessage}
              maxLength={100}
              onChange={(e) => setGiftMessage(e.target.value)}
              rows={3}
              className="w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-4 py-3 text-[15px] text-black placeholder:text-[#cccccc] outline-none focus:border-black transition-colors resize-none"
            />
            <p className="text-right text-[12px] text-[#bbb] mt-1">{giftMessage.length}/100</p>
          </div>
        </div>
      </section>

      {/* 주문 상품 */}
      <section className="px-6 py-5 border-b border-[#e0e0e0]">
        <h2 className="text-[13px] uppercase tracking-[0.08em] text-black mb-3">주문 상품</h2>
        <div className="flex gap-3">
          <div className="w-14 h-14 bg-[#f5f5f5] rounded-[10px] overflow-hidden flex items-center justify-center shrink-0">
            {item.image_url?.startsWith("http") ? (
              <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
            ) : (
              <span className="material-icons-outlined text-[22px] text-[#cccccc]">medication</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] text-black truncate">{item.product_name}</p>
            {item.option_summary && (
              <p className="text-[13px] text-[#aaa]">{item.option_summary}</p>
            )}
            <p className="text-[14px] text-[#888] mt-0.5">{formatPrice(item.price)} × {qty}개</p>
          </div>
          <span className="font-mono text-[15px] text-black shrink-0">{formatPrice(productTotal)}</span>
        </div>
      </section>

      {/* 포인트 / 쿠폰 / 결제 수단 — 표시용 목 */}
      <section className="px-6 py-5 border-b border-[#e0e0e0] space-y-4">
        <MockRow label="포인트" value={`보유 ${formatPrice(MOCK_POINT_SUMMARY.balance)}`} />
        <MockRow label="쿠폰" value={`${MOCK_COUPONS.filter((c) => !c.expired).length}장 사용 가능`} />
        <div>
          <p className="text-[13px] uppercase tracking-[0.08em] text-black mb-2">결제 수단</p>
          <div className="flex flex-wrap gap-2">
            {MOCK_PAYMENTS.map((p, i) => (
              <span
                key={p.id}
                className={`rounded-[8px] border px-3 py-2 text-[13px] ${
                  i === 0 ? "border-black text-black" : "border-[#e0e0e0] text-[#aaa]"
                }`}
              >
                {p.label}
              </span>
            ))}
          </div>
          <p className="text-[12px] text-[#bbb] mt-2">데모 결제는 가상 지갑에서 차감됩니다.</p>
        </div>
      </section>

      {/* 최종 결제 금액 */}
      <section className="px-6 py-4 border-b border-[#e0e0e0] space-y-2 text-[14px]">
        <h2 className="text-[13px] uppercase tracking-[0.08em] text-black mb-3">최종 결제 금액</h2>
        <div className="flex justify-between text-[#888]">
          <span>상품금액</span>
          <span className="font-mono">{formatPrice(productTotal)}</span>
        </div>
        <div className="flex justify-between text-[#888]">
          <span>배송비</span>
          <span className="font-mono">{shippingFee === 0 ? "무료" : formatPrice(shippingFee)}</span>
        </div>
        <div className="flex justify-between text-black text-[18px] pt-2 border-t border-[#e0e0e0]">
          <span>결제 예상 금액</span>
          <span className="font-mono">{formatPrice(totalAmount)}</span>
        </div>
      </section>

      {/* 지갑 잔액 */}
      <section className="px-6 py-5">
        <div className="flex justify-between items-center">
          <span className="text-[14px] text-[#888]">가상 지갑 잔액</span>
          <span className={`font-mono text-[16px] ${isBalanceSufficient ? "text-black" : "text-[#888]"}`}>
            {formatPrice(walletBalance)}
          </span>
        </div>
        {!isBalanceSufficient && (
          <p className="text-[14px] text-[#888] mt-1">
            잔액이 부족합니다. ({formatPrice(totalAmount - walletBalance)} 부족)
          </p>
        )}
      </section>

      {/* 결제 버튼 */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-md px-6 py-5 z-30">
        <Button fullWidth size="lg" disabled={!canSubmit} onClick={handleSubmit}>
          {submitting ? "결제 중..." : `${formatPrice(totalAmount)} 선물 결제하기`}
        </Button>
      </div>

      <Modal open={!!errorModal} onClose={() => setErrorModal(null)} title="결제 실패">
        {errorModal}
      </Modal>
    </div>
  );
}

const inputCls =
  "w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-4 py-3 text-[15px] text-black placeholder:text-[#cccccc] outline-none focus:border-black transition-colors";

function MockRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] uppercase tracking-[0.08em] text-black">{label}</span>
      <span className="text-[14px] text-[#aaa]">{value}</span>
    </div>
  );
}
