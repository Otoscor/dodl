"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";

export default function GiftCompletePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GiftCompleteContent />
    </Suspense>
  );
}

function GiftCompleteContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const orderNumber = searchParams.get("orderNumber") || "";
  const orderId = searchParams.get("orderId") || "";
  const mode = searchParams.get("mode") || "sender";

  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((data) => setWalletBalance(data.wallet.balance));
  }, []);

  const giftLink = orderId ? `https://dodl.app/gift/${orderId}` : "";

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard && giftLink) {
      navigator.clipboard.writeText(giftLink).then(
        () => showToast("선물 링크가 복사되었습니다."),
        () => showToast("선물 링크가 복사되었습니다.")
      );
    } else {
      showToast("선물 링크가 복사되었습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-[#f5f5f5] rounded-full flex items-center justify-center mb-6">
        <span className="material-icons-outlined text-[32px] text-black">redeem</span>
      </div>

      <h1 className="text-[22px] font-black uppercase tracking-[0.04em] text-text-primary mb-2">
        선물을 보냈습니다
      </h1>
      <p className="text-[15px] text-text-secondary mb-6">
        주문번호: <span className="font-mono text-text-primary">{orderNumber}</span>
      </p>

      {walletBalance !== null && (
        <div className="bg-[#f5f5f5] rounded-[10px] px-6 py-4 mb-6 w-full max-w-[280px]">
          <p className="text-[14px] text-text-tertiary mb-1">잔여 지갑 잔액</p>
          <p className="font-mono text-[22px] text-text-primary font-bold">
            {formatPrice(walletBalance)}
          </p>
        </div>
      )}

      {/* 받는 분이 주소 입력 모드 — 선물 링크 (플레이스홀더) */}
      {mode === "recipient" && (
        <div className="w-full max-w-[280px] mb-8">
          <p className="text-[13px] text-[#888] mb-2">
            받는 분이 주소를 입력하면 발송됩니다. 아래 링크를 공유하세요.
          </p>
          <div className="flex items-center gap-2">
            <span className="flex-1 truncate rounded-[10px] bg-[#f5f5f5] px-3 py-2.5 text-[13px] text-[#888] text-left">
              {giftLink}
            </span>
            <button
              onClick={handleCopy}
              className="rounded-[10px] bg-black text-white px-4 py-2.5 text-[13px] shrink-0 active:opacity-80"
            >
              복사
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 w-full max-w-[280px]">
        <Link href={`/orders/${orderId}`}>
          <Button fullWidth variant="primary">주문 상세 보기</Button>
        </Link>
        <Link href="/home">
          <Button fullWidth variant="secondary">홈으로</Button>
        </Link>
      </div>
    </div>
  );
}
