"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import type { OptionGroup, Sku } from "@/types/product";

interface OptionSelectorProps {
  optionGroups: OptionGroup[];
  skus: Sku[];
  onSkuSelected: (sku: Sku | null, quantity: number) => void;
}

export function OptionSelector({
  optionGroups,
  skus,
  onSkuSelected,
}: OptionSelectorProps) {
  const callbackRef = useRef(onSkuSelected);
  callbackRef.current = onSkuSelected;

  const isSingleSku = optionGroups.length === 0 && skus.length === 1;
  const singleSku = isSingleSku ? skus[0] : null;

  const [selections, setSelections] = useState<Record<string, string>>({});
  // 첫 번째 그룹을 기본으로 펼침
  const [openGroupId, setOpenGroupId] = useState<string | null>(
    optionGroups[0]?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);

  /* ── 단일 SKU(옵션 없음) ── */
  useEffect(() => {
    if (singleSku) callbackRef.current(singleSku, quantity);
  }, [singleSku, quantity]);

  /* ── 선택된 SKU 계산 ── */
  const selectedSku = useMemo<Sku | null>(() => {
    if (isSingleSku) return null;
    if (Object.keys(selections).length < optionGroups.length) return null;
    return (
      skus.find((sku) =>
        sku.option_values?.every(
          (ov) => selections[ov.group_name] === ov.value_name
        )
      ) ?? null
    );
  }, [selections, skus, optionGroups.length, isSingleSku]);

  useEffect(() => {
    if (!isSingleSku) callbackRef.current(selectedSku, quantity);
  }, [selectedSku, quantity, isSingleSku]);

  /* ── 품절 옵션 값 판별 ── */
  const disabledKeys = useMemo(() => {
    const set = new Set<string>();
    for (const g of optionGroups) {
      for (const v of g.values) {
        const related = skus.filter((s) =>
          s.option_values?.some(
            (ov) => ov.group_name === g.name && ov.value_name === v.name
          )
        );
        if (related.length > 0 && related.every((s) => s.stock === 0)) {
          set.add(`${g.name}:${v.name}`);
        }
      }
    }
    return set;
  }, [optionGroups, skus]);

  /* ── 옵션 선택 핸들러 ── */
  const handleSelect = (group: OptionGroup, valueName: string) => {
    const next = { ...selections, [group.name]: valueName };
    setSelections(next);
    setQuantity(1);

    // 다음 미선택 그룹 자동 오픈, 없으면 모두 닫음
    const nextGroup = optionGroups.find((g) => g.id !== group.id && !next[g.name]);
    setOpenGroupId(nextGroup?.id ?? null);
  };

  /* ── 단일 SKU 렌더 ── */
  if (singleSku) {
    return (
      <div className="space-y-4 py-1">
        <div className="flex items-center justify-between">
          <PriceDisplay price={singleSku.price} size="lg" />
          {singleSku.stock === 0 ? (
            <Badge variant="red">품절</Badge>
          ) : singleSku.stock <= LOW_STOCK_THRESHOLD ? (
            <Badge variant="amber">{singleSku.stock}개 남음</Badge>
          ) : null}
        </div>
        {singleSku.stock > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-text-secondary">수량</span>
            <QuantitySelector quantity={quantity} max={singleSku.stock} onChange={setQuantity} />
          </div>
        )}
      </div>
    );
  }

  /* ── 아코디언 드롭다운 렌더 ── */
  return (
    <div className="space-y-2">
      {optionGroups.map((group) => {
        const isOpen = openGroupId === group.id;
        const selected = selections[group.name];

        return (
          <div
            key={group.id}
            className="border border-border-subtle rounded-xl overflow-hidden"
          >
            {/* 그룹 헤더 행 */}
            <button
              onClick={() => setOpenGroupId(isOpen ? null : group.id)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-surface-white hover:bg-surface-base transition-colors cursor-pointer"
            >
              <span className="text-[12px] font-medium text-text-tertiary tracking-wide uppercase">
                {group.name}
              </span>

              <div className="flex items-center gap-1.5">
                {selected ? (
                  <span className="text-[14px] text-text-primary font-medium">
                    {selected}
                  </span>
                ) : (
                  <span className="text-[13px] text-text-quaternary">
                    선택하세요
                  </span>
                )}
                <ChevronIcon open={isOpen} />
              </div>
            </button>

            {/* 옵션 리스트 — 아코디언 */}
            <div
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                isOpen ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="border-t border-border-subtle">
                {group.values.map((value) => {
                  const key = `${group.name}:${value.name}`;
                  const isDisabled = disabledKeys.has(key);
                  const isSelected = selected === value.name;

                  return (
                    <button
                      key={value.id}
                      disabled={isDisabled}
                      onClick={() => !isDisabled && handleSelect(group, value.name)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3.5
                        border-b border-border-subtle/50 last:border-b-0
                        transition-colors cursor-pointer
                        ${isSelected
                          ? "bg-action-primary/5"
                          : isDisabled
                          ? "bg-surface-base cursor-not-allowed"
                          : "bg-surface-white hover:bg-surface-base"
                        }
                      `}
                    >
                      <span
                        className={`text-[14px] ${
                          isSelected
                            ? "text-action-primary font-medium"
                            : isDisabled
                            ? "text-text-quaternary line-through"
                            : "text-text-primary"
                        }`}
                      >
                        {value.name}
                      </span>

                      {isDisabled ? (
                        <Badge variant="muted">품절</Badge>
                      ) : isSelected ? (
                        <CheckIcon />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {/* 옵션 확정 후: 가격 + 재고 임박 + 수량 */}
      {selectedSku && (
        <div className="pt-2 space-y-3 border-t border-border-subtle mt-3">
          <div className="flex items-center justify-between">
            <PriceDisplay price={selectedSku.price} size="lg" />
            {selectedSku.stock === 0 ? (
              <Badge variant="red">품절</Badge>
            ) : selectedSku.stock <= LOW_STOCK_THRESHOLD ? (
              <Badge variant="amber">{selectedSku.stock}개 남음</Badge>
            ) : null}
          </div>

          {selectedSku.stock > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-text-secondary">수량</span>
              <QuantitySelector
                quantity={quantity}
                max={selectedSku.stock}
                onChange={setQuantity}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── 아이콘 서브컴포넌트 ── */
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`text-text-tertiary shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8l4 4 6-6"
        stroke="#5e6ad2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
