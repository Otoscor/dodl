"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Order } from "@/types/order";

interface WalletData {
  balance: number;
}

const ORDER_STATUSES = ["결제완료", "배송준비", "배송중", "배송완료"] as const;

export default function MyPage() {
  const [balance, setBalance] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/wallet").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
    ]).then(([walletData, ordersData]) => {
      setBalance(walletData.wallet?.balance || 0);
      setOrders(ordersData.orders || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  const statusCounts = ORDER_STATUSES.reduce((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  const activeOrderCount = orders.filter((o) => o.status !== "취소완료").length;

  return (
    <div className="pb-6">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface-base/80 backdrop-blur-md border-b border-border-subtle">
        <div className="px-4 py-3">
          <h1 className="text-[17px] font-medium text-text-primary">마이</h1>
        </div>
      </header>

      {/* Profile */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a8f98" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 21v-1a6 6 0 00-8-5.7A6 6 0 004 20v1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-medium text-text-primary">dodl 회원</p>
            <p className="text-[12px] text-text-tertiary mt-0.5">건강한 쇼핑을 즐기세요</p>
          </div>
        </div>
      </div>

      {/* Asset summary */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/wallet" className="bg-surface-elevated border border-border-subtle rounded-2xl p-4 text-center">
            <p className="text-[11px] text-text-tertiary mb-1">잔액</p>
            <p className="font-mono text-[16px] text-text-primary font-semibold">{formatPrice(balance)}</p>
          </Link>
          <Link href="/orders" className="bg-surface-elevated border border-border-subtle rounded-2xl p-4 text-center">
            <p className="text-[11px] text-text-tertiary mb-1">주문</p>
            <p className="font-mono text-[16px] text-text-primary font-semibold">{activeOrderCount}건</p>
          </Link>
        </div>
      </div>

      {/* Order status flow */}
      <div className="px-4 pb-4">
        <div className="bg-surface-elevated border border-border-subtle rounded-2xl p-4">
          <p className="text-[13px] font-medium text-text-primary mb-3">주문 현황</p>
          <div className="flex items-center justify-between">
            {ORDER_STATUSES.map((status, i) => (
              <div key={status} className="flex items-center">
                <div className="text-center">
                  <p className="text-[14px] font-semibold text-text-primary">{statusCounts[status]}</p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">{status}</p>
                </div>
                {i < ORDER_STATUSES.length - 1 && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="mx-2 text-text-quaternary">
                    <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <div className="px-4">
        <div className="bg-surface-elevated border border-border-subtle rounded-2xl overflow-hidden divide-y divide-border-subtle">
          <Link href="/orders" className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="text-[16px]">📋</span>
              <span className="text-[14px] text-text-primary">주문 내역</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-quaternary">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="/wallet" className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="text-[16px]">💰</span>
              <span className="text-[14px] text-text-primary">가상 지갑</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-quaternary">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="/cart" className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="text-[16px]">🛒</span>
              <span className="text-[14px] text-text-primary">장바구니</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-quaternary">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
