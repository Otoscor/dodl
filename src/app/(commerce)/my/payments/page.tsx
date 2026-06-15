"use client";

import { BackHeader } from "@/components/layout/BackHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { MOCK_PAYMENTS } from "../mock";

export default function MyPaymentsPage() {
  const { showToast } = useToast();
  const payments = MOCK_PAYMENTS;
  const notReady = () => showToast("준비 중입니다.", "info");

  return (
    <div className="min-h-screen bg-white pb-10">
      <BackHeader title="결제수단 관리" />

      {payments.length === 0 ? (
        <EmptyState
          icon="credit_card"
          title="등록된 결제수단이 없습니다"
          action={<Button variant="secondary" onClick={notReady}>결제수단 추가</Button>}
        />
      ) : (
        <>
          <div className="divide-y divide-border-subtle">
            {payments.map((pm) => (
              <div key={pm.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-text-tertiary">{pm.type}</span>
                  <span className="text-[15px] text-text-primary">{pm.label}</span>
                  {pm.isDefault && <Badge variant="red">기본</Badge>}
                </div>
                <button onClick={notReady} className="text-[13px] text-text-tertiary">삭제</button>
              </div>
            ))}
          </div>
          <div className="px-6 pt-5">
            <Button variant="secondary" fullWidth size="lg" onClick={notReady}>
              + 결제수단 추가
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
