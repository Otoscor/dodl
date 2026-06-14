"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { TitleBar } from "@/components/layout/TitleBar";
import type { Order } from "@/types/order";

interface WalletData {
  balance: number;
}

const ORDER_STATUSES = ["결제완료", "배송준비", "배송중", "배송완료"] as const;
const AFTER_STATUSES = ["취소완료", "반품완료", "교환완료"] as const;

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

  const inactiveStatuses = ["취소완료", "반품완료", "교환완료"];
  const activeOrderCount = orders.filter((o) => !inactiveStatuses.includes(o.status)).length;

  const afterCounts = AFTER_STATUSES.reduce((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-white pb-6">
      <TitleBar title="마이" />
      {/* Spacer for fixed title bar */}
      <div className="h-16" />

      {/* Profile */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#f5f5f5] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 21v-1a6 6 0 00-8-5.7A6 6 0 004 20v1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-[16px] font-bold text-text-primary">dodl 회원</p>
            <p className="text-[14px] text-text-tertiary mt-0.5">건강한 쇼핑을 즐기세요</p>
          </div>
        </div>
      </div>

      {/* Asset summary */}
      <div className="px-6 pb-5">
        <div className="grid grid-cols-2 gap-4">
          <Link href="/wallet" className="bg-[#f5f5f5] rounded-[10px] p-6 text-center">
            <p className="text-[12px] text-text-tertiary mb-1">잔액</p>
            <p className="font-mono text-[20px] text-text-primary font-bold">{formatPrice(balance)}</p>
          </Link>
          <Link href="/orders" className="bg-[#f5f5f5] rounded-[10px] p-6 text-center">
            <p className="text-[12px] text-text-tertiary mb-1">주문</p>
            <p className="font-mono text-[20px] text-text-primary font-bold">{activeOrderCount}건</p>
          </Link>
        </div>
      </div>

      {/* Order status flow */}
      <div className="px-6 pb-5">
        <div className="bg-[#f5f5f5] rounded-[10px] p-6">
          <p className="text-[14px] font-bold text-text-primary mb-3">주문 현황</p>
          <div className="flex items-center justify-between">
            {ORDER_STATUSES.map((status, i) => (
              <div key={status} className="flex items-center">
                <div className="text-center">
                  <p className="text-[16px] font-bold text-text-primary">{statusCounts[status]}</p>
                  <p className="text-[12px] text-text-tertiary mt-0.5">{status}</p>
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

      {/* 취소/반품/교환 */}
      <div className="px-6 pb-5">
        <div className="bg-[#f5f5f5] rounded-[10px] p-6">
          <p className="text-[14px] font-bold text-text-primary mb-3">취소/반품/교환</p>
          <div className="flex items-center justify-around">
            {AFTER_STATUSES.map((status) => (
              <div key={status} className="text-center">
                <p className="text-[16px] font-bold text-text-primary">{afterCounts[status]}</p>
                <p className="text-[12px] text-text-tertiary mt-0.5">{status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <div className="px-6">
        <div className="overflow-hidden divide-y divide-border-subtle">
          <Link href="/orders" className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="material-icons-outlined text-[20px] text-[#888]">receipt_long</span>
              <span className="text-[16px] text-text-primary">주문 내역</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-quaternary">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="/wallet" className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="material-icons-outlined text-[20px] text-[#888]">account_balance_wallet</span>
              <span className="text-[16px] text-text-primary">가상 지갑</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-quaternary">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="/cart" className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="material-icons-outlined text-[20px] text-[#888]">shopping_cart</span>
              <span className="text-[16px] text-text-primary">장바구니</span>
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
