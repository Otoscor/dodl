"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MOCK_FRIENDS } from "../my/mock";

export default function GiftRecipientPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GiftRecipientContent />
    </Suspense>
  );
}

function GiftRecipientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const skuId = searchParams.get("skuId") || "";
  const qty = searchParams.get("qty") || "1";

  const [query, setQuery] = useState("");
  const [manual, setManual] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return MOCK_FRIENDS;
    return MOCK_FRIENDS.filter(
      (f) => f.name.includes(q) || f.phone.replace(/-/g, "").includes(q.replace(/-/g, ""))
    );
  }, [query]);

  const recipient = manual
    ? { name: manualName.trim(), phone: manualPhone.trim(), id: "" }
    : (() => {
        const f = MOCK_FRIENDS.find((x) => x.id === selectedId);
        return f ? { name: f.name, phone: f.phone, id: f.id } : null;
      })();

  const canProceed = !!recipient && !!recipient.name && !!recipient.phone;

  const handleNext = () => {
    if (!canProceed || !recipient) return;
    const params = new URLSearchParams({
      skuId,
      qty,
      recipientName: recipient.name,
      recipientPhone: recipient.phone,
    });
    if (recipient.id) params.set("recipientId", recipient.id);
    router.push(`/gift/checkout?${params.toString()}`);
  };

  if (!skuId) {
    return (
      <div className="min-h-screen bg-white">
        <BackHeader title="받는 분 선택" />
        <p className="p-8 text-center text-[14px] text-[#aaa]">선물할 상품 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      <BackHeader title="받는 분 선택" />

      {/* 검색 */}
      <div className="px-6 pt-4 pb-3">
        <input
          type="text"
          placeholder="이름·연락처로 검색해보세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={manual}
          className="w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-4 py-3 text-[15px] text-black placeholder:text-[#cccccc] outline-none focus:border-black transition-colors disabled:opacity-50"
        />
      </div>

      {/* 모드 토글 */}
      <div className="px-6 flex items-center gap-2 mb-2">
        <button
          onClick={() => setManual(false)}
          className={`flex-1 h-10 rounded-[10px] text-[14px] transition-colors ${
            !manual ? "bg-black text-white" : "bg-[#f5f5f5] text-[#888]"
          }`}
        >
          친구 목록
        </button>
        <button
          onClick={() => setManual(true)}
          className={`flex-1 h-10 rounded-[10px] text-[14px] transition-colors ${
            manual ? "bg-black text-white" : "bg-[#f5f5f5] text-[#888]"
          }`}
        >
          직접 입력
        </button>
      </div>

      {manual ? (
        /* 직접 입력 */
        <div className="px-6 pt-3 space-y-3">
          <input
            type="text"
            placeholder="받는 분 이름"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            className="w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-4 py-3 text-[15px] text-black placeholder:text-[#cccccc] outline-none focus:border-black transition-colors"
          />
          <input
            type="tel"
            placeholder="연락처 (010-0000-0000)"
            value={manualPhone}
            onChange={(e) => setManualPhone(e.target.value)}
            className="w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-4 py-3 text-[15px] text-black placeholder:text-[#cccccc] outline-none focus:border-black transition-colors"
          />
        </div>
      ) : (
        /* 친구 목록 */
        <div className="px-6">
          <p className="text-[13px] text-[#aaa] py-2">전체 {filtered.length}</p>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-[14px] text-[#aaa]">검색 결과가 없습니다.</p>
          ) : (
            <ul>
              {filtered.map((f) => {
                const active = selectedId === f.id;
                return (
                  <li key={f.id}>
                    <button
                      onClick={() => setSelectedId(f.id)}
                      className="w-full flex items-center gap-3 py-3 border-b border-[#f0f0f0] text-left"
                    >
                      <span className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
                        <span className="material-icons-outlined text-[20px] text-[#bbb]">person</span>
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[15px] text-black">
                          {f.name}
                          {f.relation && <span className="text-[12px] text-[#aaa] ml-1.5">{f.relation}</span>}
                        </span>
                        <span className="block text-[13px] text-[#aaa]">{f.phone}</span>
                      </span>
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          active ? "border-black bg-black" : "border-[#d0d0d0]"
                        }`}
                      >
                        {active && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* 하단 CTA */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-md px-6 py-4 z-30">
        <Button fullWidth size="lg" disabled={!canProceed} onClick={handleNext}>
          다음
        </Button>
      </div>
    </div>
  );
}
