"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import { AddressPickerOverlay } from "@/components/commerce/AddressPickerOverlay";
import { useAddresses, formatAddress, type SavedAddress } from "@/hooks/useAddresses";
import { RETURN_REASONS, EXCHANGE_REASONS } from "@/lib/constants";
import { formatPrice, isReturnable, returnShippingFee, exchangeShippingFee } from "@/lib/utils";
import type { OrderDetail, OrderItem } from "@/types/order";
import type { ProductDetail } from "@/types/product";

const DELIVERY_NOTES = ["문 앞에 놓아주세요", "경비실에 맡겨주세요", "택배함에 넣어주세요", "수령 전 연락주세요"];
const RETURN_CENTER = "경기도 이천시 덕평로 1234, dodl 물류센터 반품팀 (06236)";

type ClaimMode = "return" | "exchange";

const CONFIG = {
  return: {
    title: "반품 요청",
    reasons: RETURN_REASONS,
    feeFn: returnShippingFee,
    endpoint: "return",
    cta: "반품 신청",
    success: "반품이 접수되었습니다.",
    reasonTitle: "반품 사유",
    methodTitle: "반품 방식",
    faultNote: "단순 변심·기타 사유는 반품 배송비가 부과됩니다.",
  },
  exchange: {
    title: "교환 요청",
    reasons: EXCHANGE_REASONS,
    feeFn: exchangeShippingFee,
    endpoint: "exchange",
    cta: "교환 신청",
    success: "교환이 접수되었습니다.",
    reasonTitle: "교환 사유",
    methodTitle: "교환 방식",
    faultNote: "기타 사유는 왕복 교환 배송비가 부과됩니다.",
  },
} as const;

export function OrderClaimForm({ orderId, mode }: { orderId: string; mode: ClaimMode }) {
  const cfg = CONFIG[mode];
  const router = useRouter();
  const { showToast } = useToast();
  const { defaultAddress } = useAddresses();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [open, setOpen] = useState({ product: true, reason: true, method: true });
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"pickup" | "self">("pickup");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [pickup, setPickup] = useState<SavedAddress | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // 교환 전용 — 상품별 옵션 그룹 + 선택값(오버라이드)
  const [productMap, setProductMap] = useState<Record<string, ProductDetail>>({});
  const [optionSel, setOptionSel] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data: OrderDetail) => { setOrder(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [orderId]);

  // 교환 모드: 주문 품목의 상품 옵션 조회
  useEffect(() => {
    if (mode !== "exchange" || !order) return;
    const ids = [...new Set(order.items.map((i) => i.product_id).filter(Boolean))];
    Promise.all(
      ids.map((id) => fetch(`/api/products/${id}`).then((r) => r.json()).then((d: ProductDetail) => [id, d] as const).catch(() => null))
    ).then((pairs) => {
      const map: Record<string, ProductDetail> = {};
      for (const p of pairs) if (p) map[p[0]] = p[1];
      setProductMap(map);
    });
  }, [mode, order]);

  if (loading) return <><BackHeader title={cfg.title} /><LoadingSpinner /></>;
  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <BackHeader title={cfg.title} />
        <p className="p-8 text-center text-[14px] text-[#aaa]">주문 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }
  if (!isReturnable(order.status)) {
    return (
      <div className="min-h-screen bg-white">
        <BackHeader title={cfg.title} />
        <div className="flex flex-col items-center text-center gap-3 px-8 py-20">
          <span className="material-icons-outlined text-[40px] text-[#ccc]">block</span>
          <p className="text-[15px] text-[#888]">현재 상태(<span className="text-black">{order.status}</span>)에서는<br />{mode === "return" ? "반품" : "교환"}을 신청할 수 없습니다.</p>
          <Button variant="secondary" onClick={() => router.back()}>돌아가기</Button>
        </div>
      </div>
    );
  }

  const pickupAddr = pickup ?? defaultAddress;
  const fee = reason ? cfg.feeFn(reason) : 0;
  const refund = Math.max(0, order.product_total - fee);
  const isFeeReason = fee > 0;

  const toggle = (k: keyof typeof open) => setOpen((s) => ({ ...s, [k]: !s[k] }));

  // 현재 옵션 요약("오렌지 / 30정")에서 특정 그룹의 기본 선택값을 추정
  const defaultValueFor = (item: OrderItem, groupValues: string[]): string => {
    const tokens = item.option_summary.split("/").map((t) => t.trim());
    return tokens.find((t) => groupValues.includes(t)) ?? groupValues[0] ?? "";
  };
  const selectedValue = (itemId: string, groupName: string, fallback: string): string =>
    optionSel[itemId]?.[groupName] ?? fallback;
  const setOption = (itemId: string, groupName: string, value: string) =>
    setOptionSel((s) => ({ ...s, [itemId]: { ...s[itemId], [groupName]: value } }));

  // 교환 희망 옵션을 note 앞단에 합성
  const buildNote = (): string => {
    if (mode !== "exchange") return note;
    const lines: string[] = [];
    for (const item of order.items) {
      const pd = productMap[item.product_id];
      if (!pd?.option_groups?.length) continue;
      const chosen = pd.option_groups
        .map((g) => selectedValue(item.id, g.name, defaultValueFor(item, g.values.map((v) => v.name))))
        .filter(Boolean)
        .join(" / ");
      if (chosen) lines.push(`교환 희망: ${item.product_name} → ${chosen}`);
    }
    const head = lines.join("\n");
    return [head, note].filter(Boolean).join("\n");
  };

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    const res = await fetch(`/api/orders/${orderId}/${cfg.endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, note: buildNote() }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(cfg.success);
      router.push(`/orders/${orderId}`);
    } else {
      showToast(data.message, "error");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-10">
      <BackHeader title={cfg.title} />

      {/* 상품 선택 */}
      <Section title="상품 선택" open={open.product} onToggle={() => toggle("product")}>
        <div className="space-y-4">
          {order.items.map((item) => {
            const pd = mode === "exchange" ? productMap[item.product_id] : undefined;
            return (
              <div key={item.id}>
                <div className="flex items-center gap-3">
                  <span className="material-icons-outlined text-[22px] text-black shrink-0">check_box</span>
                  <div className="w-[64px] h-[64px] rounded-[10px] bg-[#f5f5f5] overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-icons-outlined text-[22px] text-[#cccccc]">medication</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] text-black truncate">{item.product_name}</p>
                    <p className="text-[13px] text-[#aaa] truncate">
                      {item.option_summary ? `[옵션] ${item.option_summary} · ` : ""}{item.quantity}개
                    </p>
                    <p className="text-[15px] font-bold text-black mt-0.5">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>

                {/* 교환 희망 옵션 (exchange + 옵션 있는 상품) */}
                {pd?.option_groups?.length ? (
                  <div className="mt-3 ml-8 rounded-[12px] bg-[#f9f9f9] px-4 py-3.5 space-y-3">
                    <p className="text-[13px] font-medium text-[#555]">교환 희망 옵션</p>
                    {pd.option_groups.map((g) => {
                      const values = g.values.map((v) => v.name);
                      const sel = selectedValue(item.id, g.name, defaultValueFor(item, values));
                      return (
                        <div key={g.id}>
                          <p className="text-[12px] text-[#aaa] mb-1.5">{g.name}</p>
                          <div className="flex flex-wrap gap-2">
                            {g.values.map((v) => (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => setOption(item.id, g.name, v.name)}
                                className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${
                                  sel === v.name ? "border-black bg-black text-white" : "border-[#e0e0e0] text-[#555] active:bg-[#f0f0f0]"
                                }`}
                              >
                                {v.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Section>

      {/* 사유 */}
      <Section title={cfg.reasonTitle} open={open.reason} onToggle={() => toggle("reason")}>
        <div className="space-y-1">
          {cfg.reasons.map((r) => (
            <button key={r} type="button" onClick={() => setReason(r)} className="flex items-center gap-3 w-full py-2.5 text-left">
              <RadioDot active={reason === r} />
              <span className={`text-[15px] ${reason === r ? "text-black" : "text-[#888]"}`}>{r}</span>
            </button>
          ))}
        </div>
        {isFeeReason && <p className="mt-2 text-[13px] text-[#ff5b35]">{cfg.faultNote}</p>}
        <textarea
          placeholder="상세 사유를 입력해주세요 (선택)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full mt-3 rounded-[12px] bg-[#f5f5f5] border border-[#e0e0e0] px-4 py-3 text-[15px] text-black placeholder:text-[#bbb] outline-none focus:border-black resize-none transition-colors"
        />
      </Section>

      {/* 방식 */}
      <Section title={cfg.methodTitle} open={open.method} onToggle={() => toggle("method")}>
        <button type="button" onClick={() => setMethod("pickup")} className="flex items-center gap-3 w-full py-2 text-left">
          <RadioDot active={method === "pickup"} />
          <span className={`text-[15px] ${method === "pickup" ? "text-black" : "text-[#888]"}`}>지정 택배사 자동 수거</span>
        </button>
        {method === "pickup" && (
          <div className="mt-2 ml-8 space-y-3">
            <div className="rounded-[12px] bg-[#f5f5f5] px-4 py-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium text-[#555]">수거지 주소</span>
                <button type="button" onClick={() => setPickerOpen(true)} className="rounded-full bg-white border border-[#d0d0d0] px-3 py-1 text-[12px] font-medium text-[#333] active:bg-[#f0f0f0]">변경</button>
              </div>
              {pickupAddr ? (
                <>
                  <p className="text-[14px] text-black">{pickupAddr.recipientName} · {pickupAddr.recipientPhone}</p>
                  <p className="text-[14px] text-[#888] mt-0.5 leading-relaxed">{formatAddress(pickupAddr)}</p>
                </>
              ) : (
                <p className="text-[14px] text-[#bbb]">수거지를 선택해주세요</p>
              )}
            </div>
            <select
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              className="w-full rounded-[12px] bg-[#f5f5f5] border border-[#e0e0e0] px-4 py-3 text-[15px] text-[#555] outline-none focus:border-black transition-colors"
            >
              <option value="">배송 요청 사항을 선택해주세요</option>
              {DELIVERY_NOTES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}

        <button type="button" onClick={() => setMethod("self")} className="flex items-center gap-3 w-full py-2 mt-1 text-left">
          <RadioDot active={method === "self"} />
          <span className={`text-[15px] ${method === "self" ? "text-black" : "text-[#888]"}`}>직접 발송</span>
        </button>
        {method === "self" && (
          <div className="mt-2 ml-8 rounded-[12px] bg-[#f5f5f5] px-4 py-3.5">
            <p className="text-[13px] font-medium text-[#555] mb-1.5">{mode === "return" ? "반송지 주소" : "발송지 주소"}</p>
            <p className="text-[14px] text-[#888] leading-relaxed">{RETURN_CENTER}</p>
            <p className="text-[12px] text-[#aaa] mt-2">택배 발송 후 송장번호를 1:1 문의로 알려주시면 처리됩니다.</p>
          </div>
        )}
      </Section>

      {/* 하단 요약 */}
      {mode === "return" ? (
        <div className="border-t-8 border-[#f5f5f5] px-6 py-6 space-y-2.5 text-[14px]">
          <h2 className="text-[16px] font-medium text-black mb-4">환불 정보</h2>
          <Row label="반품 상품 금액" value={formatPrice(order.product_total)} />
          <Row label="반품 배송비" value={fee > 0 ? `− ${formatPrice(fee)}` : "무료"} />
          <div className="flex justify-between items-baseline pt-3 border-t border-[#e0e0e0]">
            <span className="text-[16px] font-medium text-black">환불 예정 금액</span>
            <span className="font-mono text-[20px] font-bold text-black">{formatPrice(refund)}</span>
          </div>
          <p className="text-[12px] text-[#aaa] pt-1">환불금은 가상 지갑으로 입금됩니다.</p>
        </div>
      ) : (
        <div className="border-t-8 border-[#f5f5f5] px-6 py-6 space-y-2.5 text-[14px]">
          <h2 className="text-[16px] font-medium text-black mb-4">교환 정보</h2>
          <Row label="교환 상품 금액" value={formatPrice(order.product_total)} />
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-[16px] font-medium text-black">교환 배송비</span>
            <span className="font-mono text-[18px] font-bold text-black">{fee > 0 ? formatPrice(fee) : "무료"}</span>
          </div>
          <p className="text-[12px] text-[#aaa] pt-1">
            {fee > 0 ? "교환 배송비(왕복)는 회수 시 결제됩니다." : "판매자 부담 무료 교환입니다."}
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="px-6 pt-2">
        <Button fullWidth size="lg" disabled={!reason || submitting} onClick={handleSubmit}>
          {submitting ? "처리 중..." : cfg.cta}
        </Button>
      </div>

      <AddressPickerOverlay
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        mode="select"
        selectedId={pickupAddr?.id ?? null}
        onSelect={(a) => setPickup(a)}
      />
    </div>
  );
}

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div className="border-t border-[#f0f0f0] first:border-t-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-6 py-5">
        <span className="text-[16px] font-medium text-black">{title}</span>
        <span className="material-icons-outlined text-[20px] text-[#888]">{open ? "keyboard_arrow_up" : "keyboard_arrow_down"}</span>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#888]">{label}</span>
      <span className="font-mono text-black">{value}</span>
    </div>
  );
}

function RadioDot({ active }: { active: boolean }) {
  return (
    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${active ? "border-black" : "border-[#ccc]"}`}>
      {active && <span className="w-2.5 h-2.5 rounded-full bg-black" />}
    </span>
  );
}
