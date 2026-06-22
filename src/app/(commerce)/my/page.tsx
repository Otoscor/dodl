"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { TitleBar } from "@/components/layout/TitleBar";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { MOCK_ASSETS, MY_MENU, MyMenuItem } from "./mock";

export default function MyPage() {
  const { showToast } = useToast();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((walletData) => {
        setBalance(walletData.wallet?.balance || 0);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner />;

  const handleMockTap = () => showToast("준비 중입니다.", "info");

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
            <div className="flex items-center gap-2">
              <p className="text-[16px] font-bold text-text-primary">dodl 회원</p>
              <Badge variant="muted">{MOCK_ASSETS.grade}</Badge>
            </div>
            <p className="text-[14px] text-text-tertiary mt-0.5">건강한 쇼핑을 즐기세요</p>
          </div>
        </div>
      </div>

      {/* Shopping assets 3-up */}
      <div className="px-6 pb-5">
        <div className="grid grid-cols-3 bg-[#f5f5f5] rounded-[10px] py-5">
          <button onClick={handleMockTap} className="text-center border-r border-[#e0e0e0]">
            <p className="font-mono text-[18px] text-text-primary font-bold">{MOCK_ASSETS.couponCount}장</p>
            <p className="text-[12px] text-text-tertiary mt-1">쿠폰</p>
          </button>
          <button onClick={handleMockTap} className="text-center border-r border-[#e0e0e0]">
            <p className="font-mono text-[18px] text-text-primary font-bold">{MOCK_ASSETS.points.toLocaleString("ko-KR")}P</p>
            <p className="text-[12px] text-text-tertiary mt-1">포인트</p>
          </button>
          <Link href="/wallet" className="text-center">
            <p className="font-mono text-[18px] text-text-primary font-bold">{formatPrice(balance)}</p>
            <p className="text-[12px] text-text-tertiary mt-1">지갑 잔액</p>
          </Link>
        </div>
      </div>

      {/* 그룹별 메뉴 리스트 */}
      <div className="pt-1">
        {MY_MENU.map((group) => (
          <div key={group.title} className="px-6 pb-2 pt-4">
            <p className="text-[14px] font-bold text-text-primary mb-1">{group.title}</p>
            <div className="divide-y divide-border-subtle">
              {group.items.map((item) => (
                <MenuRow
                  key={item.label}
                  item={item}
                  onMockTap={handleMockTap}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuRow({
  item,
  onMockTap,
}: {
  item: MyMenuItem;
  onMockTap: () => void;
}) {
  const inner = (
    <>
      <span className="text-[16px] text-text-primary">{item.label}</span>
      <span className="flex items-center gap-2">
        {item.value && <span className="text-[14px] text-text-tertiary">{item.value}</span>}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-quaternary">
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </>
  );
  const className = "w-full flex items-center justify-between py-4 text-left";

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={onMockTap} className={className}>
      {inner}
    </button>
  );
}
