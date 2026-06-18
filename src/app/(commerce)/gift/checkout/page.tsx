"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Input } from "@/components/ui/Input";
import { PointInput } from "@/components/commerce/PointInput";
import { AddressPickerOverlay } from "@/components/commerce/AddressPickerOverlay";
import type { SavedAddress } from "@/hooks/useAddresses";
import { formatPrice, calculateShippingFee } from "@/lib/utils";
import { MOCK_POINT_SUMMARY, MOCK_COUPONS } from "../../my/mock";
import type { GiftItem, GiftAddressMode } from "@/lib/queries/gift";

const ME = { name: "홍길동", phone: "010-1234-5678" };

type PaymentMethod = "card" | "naver" | "toss" | "kakao";

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "card", label: "신용 체크카드" },
  { id: "naver", label: "네이버페이" },
  { id: "toss", label: "토스페이" },
  { id: "kakao", label: "카카오페이" },
];

const CARD_OPTIONS = ["신한카드", "국민카드", "하나카드", "우리카드", "토스뱅크"];

const AVAILABLE_COUPONS = MOCK_COUPONS.filter((c) => !c.expired).length;

type SectionKey = "recipient" | "address" | "order" | "coupon" | "payment";

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

  // 배송지
  const [addressMode, setAddressMode] = useState<GiftAddressMode>("sender");
  const [addressLine1, setAddressLine1] = useState(""); // 도로명주소
  const [addressLine2, setAddressLine2] = useState(""); // 상세주소
  const [addressZip, setAddressZip] = useState("");
  const [addrSheetOpen, setAddrSheetOpen] = useState(false);

  const handleAddressSelect = (addr: SavedAddress) => {
    setAddressZip(addr.zipcode);
    setAddressLine1(addr.road);
    setAddressLine2(addr.detail);
  };

  // 보내는 사람
  const [senderName, setSenderName] = useState(ME.name);
  const [senderPhone, setSenderPhone] = useState(ME.phone);

  // 포인트 + 결제수단
  const [pointsApplied, setPointsApplied] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [selectedCard, setSelectedCard] = useState("");

  // 아코디언 섹션 열림 상태
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    recipient: true,
    address: true,
    order: false,
    coupon: true,
    payment: true,
  });
  const toggle = (key: SectionKey) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

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
        <BackHeader title="결제 정보 입력" />
        <p className="p-8 text-center text-[14px] text-[#aaa]">선물할 상품 정보가 없습니다.</p>
      </div>
    );
  }
  if (loading) return (<><BackHeader title="결제 정보 입력" /><LoadingSpinner /></>);
  if (!item) {
    return (
      <div className="min-h-screen bg-white">
        <BackHeader title="결제 정보 입력" />
        <p className="p-8 text-center text-[14px] text-[#aaa]">선물할 상품 정보가 없습니다.</p>
      </div>
    );
  }

  const productTotal = item.price * qty;
  const shippingFee = calculateShippingFee(productTotal);
  const payAmount = Math.max(0, productTotal + shippingFee - pointsApplied);
  const earnPoints = Math.floor(payAmount * MOCK_POINT_SUMMARY.earnRate / 100);
  const isBalanceSufficient = walletBalance >= payAmount;

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
        giftMessage: "",
        pointsApplied,
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
      <BackHeader title="결제 정보 입력" />

      {/* ① 선물 받는 분 정보 */}
      <SectionHeader
        title="선물 받는 분 정보"
        open={openSections.recipient}
        onToggle={() => toggle("recipient")}
      />
      {openSections.recipient && (
        <div className="px-6 pb-6 space-y-3">
          <Input
            label="실명"
            required
            value={recipientName}
            onChange={setRecipientName}
            placeholder="오브리"
          />
          <Input
            label="휴대폰번호"
            required
            type="tel"
            inputMode="tel"
            value={recipientPhone}
            onChange={setRecipientPhone}
            placeholder="000-0000-0000"
          />
        </div>
      )}

      {/* ② 보내는 사람 정보 (아코디언 없음 — 레퍼런스에 토글 미포함) */}
      <div className="border-t border-[#f0f0f0] px-6 py-5">
        <h2 className="text-[16px] font-medium text-black mb-4">보내는 사람 정보</h2>
        <div className="space-y-3">
          <Input
            label="실명"
            required
            value={senderName}
            onChange={setSenderName}
            placeholder="오브리"
          />
          <Input
            label="휴대폰번호"
            required
            type="tel"
            inputMode="tel"
            value={senderPhone}
            onChange={setSenderPhone}
            placeholder="000-0000-0000"
          />
        </div>
      </div>

      {/* ③ 선물 배송지 정보 */}
      <SectionHeader
        title="선물 배송지 정보"
        open={openSections.address}
        onToggle={() => toggle("address")}
      />
      {openSections.address && (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-1 bg-[#f0f0f0] rounded-[12px] p-1 mb-5">
            {([
              ["sender", "직접 입력"],
              ["recipient", "친구가 입력"],
            ] as const).map(([mode, label]) => {
              const active = addressMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setAddressMode(mode)}
                  className={`flex-1 h-10 rounded-[9px] text-[14px] transition-colors ${
                    active ? "bg-white text-black font-medium shadow-sm" : "text-[#888]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {addressMode === "sender" ? (
            addressLine1.trim() ? (
              <div className="rounded-[14px] border border-[#e0e0e0] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {addressZip && (
                      <span className="inline-block rounded-[6px] bg-[#f0f0f0] px-2 py-0.5 text-[12px] text-[#777] mb-1.5">
                        {addressZip}
                      </span>
                    )}
                    <p className="text-[15px] text-black leading-snug">{addressLine1}</p>
                    {addressLine2 && <p className="text-[14px] text-[#888] mt-0.5">{addressLine2}</p>}
                  </div>
                  <button
                    onClick={() => setAddrSheetOpen(true)}
                    className="shrink-0 rounded-full border border-[#d0d0d0] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#333] active:bg-[#f0f0f0]"
                  >
                    변경
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-[14px] bg-[#f7f7f7] flex flex-col items-center gap-3.5 px-5 py-7">
                <p className="text-[15px] text-[#888]">직접 입력할게요</p>
                <Button onClick={() => setAddrSheetOpen(true)}>배송지 추가하기</Button>
              </div>
            )
          ) : (
            <div className="rounded-[14px] bg-[#f7f7f7] flex flex-col items-center text-center gap-2 px-5 py-8">
              <span className="w-[52px] h-[52px] rounded-full bg-white flex items-center justify-center mb-1">
                <span className="material-icons-outlined text-[24px] text-[#888]">link</span>
              </span>
              <p className="text-[15px] font-medium text-black">선물 받는 친구가 입력할게요</p>
              <p className="text-[13px] text-[#999] leading-relaxed">
                결제 후 생성되는 선물 링크를 친구에게 보내면<br />
                친구가 직접 배송지를 입력해요.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ④ 주문상품 */}
      <SectionHeader
        title="주문상품"
        open={openSections.order}
        onToggle={() => toggle("order")}
        preview={!openSections.order ? `${item.product_name} · ${formatPrice(productTotal)}` : undefined}
      />
      {openSections.order && (
        <div className="px-6 pb-6">
          <div className="flex gap-3">
            <div className="w-14 h-14 bg-[#f5f5f5] rounded-[10px] overflow-hidden flex items-center justify-center shrink-0">
              {item.image_url?.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-icons-outlined text-[22px] text-[#cccccc]">medication</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] text-black truncate">{item.product_name}</p>
              {item.option_summary && (
                <p className="text-[13px] text-[#aaa]">{item.option_summary} {qty}개</p>
              )}
              <p className="text-[14px] font-bold text-black mt-0.5">{formatPrice(productTotal)}</p>
            </div>
          </div>
        </div>
      )}

      {/* ⑤ 쿠폰 (포인트 + 쿠폰) */}
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

      {/* ⑥ 결제수단 */}
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

      {/* ⑦ 최종 결제 금액 */}
      <div className="border-t border-[#f0f0f0] px-6 py-6 space-y-2.5 text-[14px]">
        <h2 className="text-[16px] font-medium text-black mb-4">최종 결제 금액</h2>
        <div className="flex justify-between">
          <span className="text-[#888]">총 금액</span>
          <span className="font-mono text-black">{formatPrice(productTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#888]">배송비</span>
          <span className="font-mono text-black">{shippingFee === 0 ? "무료" : formatPrice(shippingFee)}</span>
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

      {/* ⑧ 고정 하단 CTA */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white px-6 py-5 z-30">
        <Button fullWidth size="lg" disabled={!canSubmit} onClick={handleSubmit}>
          {submitting ? "결제 중..." : `${formatPrice(payAmount)} 구매하기`}
        </Button>
      </div>

      <Modal open={!!errorModal} onClose={() => setErrorModal(null)} title="결제 실패">
        {errorModal}
      </Modal>

      {/* 선물 배송지 선택/추가 (받는 분 정보는 상단에서 별도 수집하므로 숨김) */}
      <AddressPickerOverlay
        open={addrSheetOpen}
        onClose={() => setAddrSheetOpen(false)}
        mode="select"
        showRecipient={false}
        onSelect={handleAddressSelect}
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
