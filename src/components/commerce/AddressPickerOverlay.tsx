"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AddressItem } from "@/components/commerce/AddressItem";
import { useAddresses, formatAddress, type AddressDraft, type SavedAddress } from "@/hooks/useAddresses";
import { MOCK_POSTAL_RESULTS } from "@/app/(commerce)/my/mock";

interface AddressPickerOverlayProps {
  open: boolean;
  onClose: () => void;
  mode: "select" | "form"; // select=목록부터, form=폼 바로
  showRecipient?: boolean;
  editId?: string | null;
  selectedId?: string | null;
  onSelect?: (addr: SavedAddress) => void;
}

type Step = "list" | "form" | "search";
type Errors = Partial<Record<"road" | "detail" | "recipientName" | "recipientPhone", string>>;

const EMPTY: AddressDraft = {
  zipcode: "",
  road: "",
  detail: "",
  recipientName: "",
  recipientPhone: "",
  isDefault: false,
};

function isValidPhone(v: string): boolean {
  const digits = v.replace(/\D/g, "");
  return /^01[016789]\d{7,8}$/.test(digits);
}

export function AddressPickerOverlay({
  open,
  onClose,
  mode,
  showRecipient = true,
  editId = null,
  selectedId = null,
  onSelect,
}: AddressPickerOverlayProps) {
  const { addresses, addAddress, updateAddress, deleteAddress } = useAddresses();

  const [step, setStep] = useState<Step>(mode === "form" ? "form" : "list");
  const [formId, setFormId] = useState<string | null>(editId);
  const [draft, setDraft] = useState<AddressDraft>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  // 열릴 때마다 초기 상태로 리셋
  useEffect(() => {
    if (!open) return;
    if (mode === "form") {
      const editing = editId ? addresses.find((a) => a.id === editId) : null;
      setDraft(editing ? stripId(editing) : EMPTY);
      setFormId(editId);
      setStep("form");
    } else {
      setStep("list");
      setFormId(null);
    }
    setErrors({});
    setQuery("");
    setSearched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().replace(/\s+/g, "");
    if (!q) return [];
    return MOCK_POSTAL_RESULTS.filter(
      (r) =>
        r.road.replace(/\s+/g, "").includes(q) ||
        r.jibun.replace(/\s+/g, "").includes(q) ||
        r.zipcode.includes(q)
    );
  }, [query]);

  if (!open) return null;

  const patch = (p: Partial<AddressDraft>) => setDraft((d) => ({ ...d, ...p }));
  const clearError = (k: keyof Errors) =>
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));

  const openAddForm = () => {
    setDraft(EMPTY);
    setFormId(null);
    setErrors({});
    setStep("form");
  };

  const openEditForm = (id: string) => {
    const editing = addresses.find((a) => a.id === id);
    if (!editing) return;
    setDraft(stripId(editing));
    setFormId(id);
    setErrors({});
    setStep("form");
  };

  const handleBack = () => {
    if (step === "search") setStep("form");
    else if (step === "form") {
      if (mode === "select") setStep("list");
      else onClose();
    } else {
      onClose();
    }
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!draft.road.trim()) next.road = "주소를 검색해 주세요.";
    else if (!draft.detail.trim()) next.detail = "상세주소를 입력해 주세요.";
    if (showRecipient) {
      if (!draft.recipientName.trim()) next.recipientName = "받는 분을 입력해 주세요.";
      if (!isValidPhone(draft.recipientPhone)) next.recipientPhone = "올바른 휴대폰번호를 입력해 주세요.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const clean: AddressDraft = {
      ...draft,
      road: draft.road.trim(),
      detail: draft.detail.trim(),
      recipientName: draft.recipientName.trim(),
      recipientPhone: draft.recipientPhone.trim(),
    };
    if (formId) {
      updateAddress(formId, clean);
      if (mode === "select") setStep("list");
      else onClose();
    } else {
      const id = addAddress(clean);
      if (mode === "select") {
        // 방금 추가한 주소를 바로 선택
        onSelect?.({ id, ...clean });
        onClose();
      } else {
        onClose();
      }
    }
  };

  const headerTitle =
    step === "search" ? "우편번호 검색" : step === "list" ? "배송지 선택" : formId ? "배송지 수정" : "배송지 추가";

  return (
    <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center h-14 px-4 border-b border-[#f0f0f0] shrink-0">
        <button
          onClick={handleBack}
          aria-label="뒤로"
          className="w-8 h-8 -ml-1 flex items-center justify-center text-[#888] hover:text-black"
        >
          <span className="material-icons-outlined text-[22px]">arrow_back</span>
        </button>
        <h2 className="ml-1 text-[17px] text-black">{headerTitle}</h2>
        {step === "form" && formId && (
          <button
            onClick={() => {
              deleteAddress(formId);
              if (mode === "select") setStep("list");
              else onClose();
            }}
            className="ml-auto text-[14px] text-[#ff5b35]"
          >
            삭제
          </button>
        )}
      </header>

      {/* ───── 배송지 선택 ───── */}
      {step === "list" && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4">
            <button
              onClick={openAddForm}
              className="w-full rounded-full border border-[#d0d0d0] py-3.5 text-[15px] text-black active:bg-[#f5f5f5] transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-icons-outlined text-[18px]">add</span>
              배송지 추가하기
            </button>
          </div>
          {addresses.map((a) => (
            <AddressItem
              key={a.id}
              name={a.recipientName}
              phone={a.recipientPhone}
              address={formatAddress(a)}
              isDefault={a.isDefault}
              selected={a.id === selectedId}
              onSelect={() => {
                onSelect?.(a);
                onClose();
              }}
              onEdit={() => openEditForm(a.id)}
            />
          ))}
        </div>
      )}

      {/* ───── 배송지 추가/수정 폼 ───── */}
      {step === "form" && (
        <>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {/* 우편번호 */}
            <div className="rounded-[14px] bg-[#f5f5f5] border border-[#e0e0e0] px-4 py-3.5">
              <div className="flex items-center justify-between">
                <Label text="우편번호" />
                <button
                  onClick={() => { setStep("search"); setQuery(""); setSearched(false); }}
                  className="rounded-full bg-white border border-[#d0d0d0] px-3.5 py-1.5 text-[13px] font-medium text-[#333] active:bg-[#f0f0f0]"
                >
                  {draft.zipcode ? "재검색" : "주소 검색"}
                </button>
              </div>
              <p className={`mt-2 text-[15px] ${draft.zipcode ? "text-black font-medium" : "text-[#bbb]"}`}>
                {draft.zipcode || "주소를 검색해 주세요"}
              </p>
            </div>

            {/* 주소지 — 도로명(읽기전용) + 상세주소 */}
            <div>
              <div className={`rounded-[14px] bg-[#f5f5f5] border px-4 py-3.5 ${errors.road || errors.detail ? "border-[#ff5b35]" : draft.road ? "border-black" : "border-[#e0e0e0]"}`}>
                <Label text="주소지" />
                {draft.road ? (
                  <>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="rounded-[6px] bg-[#eee] px-2 py-0.5 text-[11px] font-medium text-[#777] shrink-0">도로명</span>
                      <span className="text-[15px] font-medium text-black">{draft.road}</span>
                    </div>
                    <div className="my-2.5 h-px bg-[#e3e3e3]" />
                    <input
                      type="text"
                      placeholder="상세주소를 입력해 주세요 (동·호수)"
                      value={draft.detail}
                      onChange={(e) => { patch({ detail: e.target.value }); clearError("detail"); }}
                      className="w-full bg-transparent text-[15px] text-black placeholder:text-[#bbb] outline-none"
                    />
                  </>
                ) : (
                  <p className="mt-2 text-[15px] text-[#bbb]">주소 검색 후 입력됩니다</p>
                )}
              </div>
              {(errors.road || errors.detail) && (
                <p className="mt-1.5 text-[12px] text-[#ff5b35]">⚠ {errors.road || errors.detail}</p>
              )}
            </div>

            {/* 받는 분 / 휴대폰 */}
            {showRecipient && (
              <>
                <Input
                  label="받는 분"
                  required
                  placeholder="이름을 입력해 주세요"
                  value={draft.recipientName}
                  onChange={(v) => { patch({ recipientName: v }); clearError("recipientName"); }}
                  error={errors.recipientName}
                />
                <Input
                  label="휴대폰번호"
                  required
                  type="tel"
                  inputMode="tel"
                  placeholder="000-0000-0000"
                  value={draft.recipientPhone}
                  onChange={(v) => { patch({ recipientPhone: v }); clearError("recipientPhone"); }}
                  error={errors.recipientPhone}
                />
              </>
            )}

            {/* 기본 배송지 */}
            <button
              onClick={() => patch({ isDefault: !draft.isDefault })}
              className="flex items-center gap-2 py-1"
            >
              <span className={`material-icons-outlined text-[22px] ${draft.isDefault ? "text-black" : "text-[#ccc]"}`}>
                {draft.isDefault ? "check_box" : "check_box_outline_blank"}
              </span>
              <span className="text-[14px] text-[#333]">기본 배송지로 설정</span>
            </button>
          </div>

          {/* CTA */}
          <div className="px-5 pt-3 pb-6 border-t border-[#f0f0f0] shrink-0">
            <Button fullWidth size="lg" onClick={handleSave}>
              {formId ? "수정 완료" : "추가하기"}
            </Button>
          </div>
        </>
      )}

      {/* ───── 우편번호 검색 ───── */}
      {step === "search" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-4 shrink-0">
            <div className="flex items-center gap-2 bg-[#f5f5f5] border border-black rounded-[12px] px-4 py-3">
              <input
                autoFocus
                type="text"
                placeholder="도로명 또는 지번 주소를 입력해 주세요."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearched(true); }}
                className="flex-1 bg-transparent text-[15px] text-black placeholder:text-[#bbb] outline-none"
              />
              <span className="material-icons-outlined text-[20px] text-[#333]">search</span>
            </div>
          </div>

          <div className="px-5 pb-8 overflow-y-auto">
            {!searched || query.trim() === "" ? (
              <div className="pt-2">
                <p className="text-[15px] font-bold text-black mb-3">이렇게 검색하세요!</p>
                <ul className="space-y-3">
                  {[
                    ["도로명 + 건물번호", "예) 테헤란로 152"],
                    ["지역명 + 건물번호", "예) 역삼동 737"],
                    ["도로명 + 건물이름", "예) 역삼동 센터필드"],
                  ].map(([t, ex]) => (
                    <li key={t}>
                      <p className="text-[14px] font-medium text-[#333]">· {t}</p>
                      <p className="text-[13px] text-[#aaa] ml-2.5">{ex}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12 gap-2">
                <span className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-1">
                  <span className="material-icons-outlined text-[30px] text-[#ccc]">search_off</span>
                </span>
                <p className="text-[16px] font-bold text-black">검색 결과가 없어요</p>
                <p className="text-[13px] text-[#999] leading-relaxed">
                  도로명·지번·건물명으로<br />다시 검색해 주세요.
                </p>
              </div>
            ) : (
              <ul>
                {results.map((r) => (
                  <li key={r.zipcode + r.road}>
                    <button
                      onClick={() => { patch({ zipcode: r.zipcode, road: r.road }); clearError("road"); setStep("form"); }}
                      className="w-full text-left py-4 border-b border-[#f0f0f0] active:bg-[#fafafa]"
                    >
                      <span className="inline-block rounded-[6px] bg-black px-2 py-0.5 text-[12px] font-medium text-white mb-1.5">
                        {r.zipcode}
                      </span>
                      <span className="block text-[15px] font-medium text-black">{r.road}</span>
                      <span className="block text-[13px] text-[#aaa]">[지번] {r.jibun}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function stripId(a: SavedAddress): AddressDraft {
  const { id: _id, ...rest } = a;
  void _id;
  return rest;
}

function Label({ text }: { text: string }) {
  return (
    <span className="text-[13px] font-medium text-[#555]">
      {text} <span className="text-[#ff5b35]">*</span>
    </span>
  );
}
