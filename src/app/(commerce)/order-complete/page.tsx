"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatPrice } from "@/lib/utils";

export default function OrderCompletePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrderCompleteContent />
    </Suspense>
  );
}

function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "";
  const orderId = searchParams.get("orderId") || "";

  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((data) => setWalletBalance(data.wallet.balance));
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-[#f5f5f5] rounded-full flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="text-[22px] font-black uppercase tracking-[0.04em] text-text-primary mb-2">
        주문이 완료되었습니다
      </h1>
      <p className="text-[15px] text-text-secondary mb-6">
        주문번호: <span className="font-mono text-text-primary">{orderNumber}</span>
      </p>

      {walletBalance !== null && (
        <div className="bg-[#f5f5f5] rounded-[10px] px-6 py-4 mb-8 w-full max-w-[280px]">
          <p className="text-[14px] text-text-tertiary mb-1">잔여 지갑 잔액</p>
          <p className="font-mono text-[22px] text-text-primary font-bold">
            {formatPrice(walletBalance)}
          </p>
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
