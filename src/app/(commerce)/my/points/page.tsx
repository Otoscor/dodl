"use client";

import { useState } from "react";
import { BackHeader } from "@/components/layout/BackHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { MOCK_POINT_SUMMARY, MOCK_POINTS } from "../mock";

type Filter = "전체" | "적립" | "사용";

export default function MyPointsPage() {
  const [filter, setFilter] = useState<Filter>("전체");
  const { balance, pendingAmount, expiringAmount, expiringDate, earnRate } = MOCK_POINT_SUMMARY;

  const filtered = MOCK_POINTS.filter((pt) => filter === "전체" || pt.type === filter);

  return (
    <div className="min-h-screen bg-white pb-10">
      <BackHeader title="포인트 내역" />

      {/* 보유 포인트 카드 */}
      <div className="px-6 pt-5 pb-4">
        <div className="bg-[#f5f5f5] rounded-[10px] px-6 py-6">
          <p className="text-[13px] text-text-tertiary mb-1">보유 포인트</p>
          <p className="font-mono text-[36px] text-text-primary font-bold mb-4">
            {balance.toLocaleString("ko-KR")}P
          </p>

          {/* 요약 3-up */}
          <div className="grid grid-cols-3 border-t border-[#e0e0e0] pt-4 gap-2">
            <div>
              <p className="text-[12px] text-text-tertiary mb-0.5">적립 예정</p>
              <p className="font-mono text-[15px] text-text-primary font-semibold">
                +{pendingAmount.toLocaleString("ko-KR")}P
              </p>
            </div>
            <div>
              <p className="text-[12px] text-text-tertiary mb-0.5">소멸 예정</p>
              <p className="font-mono text-[15px] text-black font-semibold">
                {expiringAmount.toLocaleString("ko-KR")}P
              </p>
              <p className="text-[11px] text-[#aaa] mt-0.5">{expiringDate}까지</p>
            </div>
            <div>
              <p className="text-[12px] text-text-tertiary mb-0.5">구매 적립률</p>
              <p className="font-mono text-[15px] text-text-primary font-semibold">{earnRate}%</p>
            </div>
          </div>
        </div>

        {/* 소멸 예정 경고 배너 */}
        {expiringAmount > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-[#f5f5f5] rounded-[10px] px-4 py-3">
            <span className="material-icons-outlined text-[18px] text-[#888] shrink-0">warning_amber</span>
            <p className="text-[13px] text-[#888] leading-snug">
              <span className="text-black font-medium">{expiringAmount.toLocaleString("ko-KR")}P</span>가{" "}
              <span className="text-black font-medium">{expiringDate}</span>에 소멸 예정입니다.
            </p>
          </div>
        )}
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 px-6 pb-3">
        {(["전체", "적립", "사용"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[12px] uppercase tracking-[0.08em] border rounded-[10px] transition-colors ${
              filter === f
                ? "border-black bg-black text-white"
                : "border-[#e0e0e0] bg-[#f5f5f5] text-[#888] hover:text-black"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 내역 리스트 */}
      {filtered.length === 0 ? (
        <EmptyState icon="paid" title="내역이 없습니다" description="다른 필터를 선택해보세요." />
      ) : (
        <div className="divide-y divide-border-subtle">
          {filtered.map((pt) => (
            <div key={pt.id} className="px-6 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge variant={pt.type === "적립" ? "green" : "red"}>{pt.type}</Badge>
                  <span className="text-[15px] text-text-primary truncate">{pt.description}</span>
                </div>
                <p className="text-[12px] text-text-quaternary">{pt.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-mono text-[16px] font-semibold ${
                  pt.type === "사용" ? "text-accent-red" : "text-accent-green"
                }`}>
                  {pt.type === "사용" ? "-" : "+"}{pt.amount.toLocaleString("ko-KR")}P
                </p>
                <p className="font-mono text-[12px] text-text-quaternary mt-0.5">
                  잔액 {pt.balanceAfter.toLocaleString("ko-KR")}P
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
