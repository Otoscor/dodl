"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { BackHeader } from "@/components/layout/BackHeader";
import { formatPrice } from "@/lib/utils";
import type { Wallet, WalletTransaction } from "@/types/wallet";

const TX_BADGE: Record<string, "green" | "red" | "indigo"> = {
  "적립": "green",
  "사용": "red",
  "환불": "indigo",
};

type FilterType = "전체" | "적립" | "사용";

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("전체");

  useEffect(() => {
    const typeParam = filter === "전체" ? "" : `?type=${filter}`;
    fetch(`/api/wallet${typeParam}`)
      .then((r) => r.json())
      .then((data) => {
        setWallet(data.wallet);
        setTransactions(data.transactions);
        setLoading(false);
      });
  }, [filter]);

  if (loading) return <LoadingSpinner />;
  if (!wallet) return <div className="p-8 text-center text-text-tertiary">지갑을 불러올 수 없습니다.</div>;

  return (
    <div>
      <BackHeader title="가상 지갑" />

      {/* Balance card */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-surface-elevated border border-border-subtle rounded-2xl p-6 text-center">
          <p className="text-[12px] text-text-tertiary mb-2">잔액</p>
          <p className="font-mono text-[28px] text-text-primary font-semibold">
            {formatPrice(wallet.balance)}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 py-3">
        {(["전체", "적립", "사용"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setLoading(true); }}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-pill border transition-colors cursor-pointer ${
              filter === f
                ? "border-action-primary bg-action-primary/10 text-action-primary"
                : "border-border-subtle text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      {transactions.length === 0 ? (
        <EmptyState
          icon="💰"
          title="거래 내역이 없습니다"
          description={filter !== "전체" ? "다른 필터를 선택해보세요." : undefined}
        />
      ) : (
        <div className="divide-y divide-border-subtle">
          {transactions.map((tx) => (
            <div key={tx.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge variant={TX_BADGE[tx.type] || "muted"}>{tx.type}</Badge>
                  <span className="text-[13px] text-text-primary">{tx.description}</span>
                </div>
                <p className="text-[11px] text-text-quaternary">
                  {new Date(tx.created_at).toLocaleString("ko-KR")}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-mono text-[14px] font-medium ${
                  tx.type === "사용" ? "text-accent-red" : "text-accent-green"
                }`}>
                  {tx.type === "사용" ? "-" : "+"}{formatPrice(tx.amount)}
                </p>
                <p className="font-mono text-[11px] text-text-quaternary">
                  잔액 {formatPrice(tx.balance_after)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
