"use client";

import type { ReactNode } from "react";
import { OptionSelector } from "@/components/commerce/OptionSelector";
import { ListRow } from "@/components/ui/ListRow";
import { ListSection } from "@/components/ui/ListSection";
import { useState as useLocalState } from "react";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { SelectedItemCard } from "@/components/commerce/SelectedItemCard";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { PointInput } from "@/components/commerce/PointInput";
import { AddressItem } from "@/components/commerce/AddressItem";
import { ProductRow } from "@/components/commerce/ProductRow";
import { Accordion } from "@/components/ui/Accordion";
import { Input } from "@/components/ui/Input";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import type { OptionGroup, Sku } from "@/types/product";

/* ── ProductRow cart wrapper (checked state) ── */
function ProductRowCartStory({
  initialChecked,
  onSelect,
}: {
  initialChecked: boolean;
  onSelect: (text: string | null) => void;
}) {
  const [checked, setChecked] = useLocalState(initialChecked);
  return (
    <ProductRow
      variant="cart"
      brand="덱스콤"
      name="[25%할인] 루티니 14개입 1BOX"
      optionSummary="옵션명 01"
      quantity={1}
      price={31000}
      checked={checked}
      onCheck={(v) => { setChecked(v); onSelect(v ? "선택됨" : "선택 해제"); }}
      onRemove={() => onSelect("삭제됨")}
    />
  );
}

/* ── Input 내부 state wrapper ── */
function InputStory({
  required,
  error,
  disabled,
  onSelect,
}: {
  required: boolean;
  error: boolean;
  disabled: boolean;
  onSelect: (text: string | null) => void;
}) {
  const [val, setVal] = useLocalState("");
  return (
    <Input
      label="받는 분"
      required={required}
      disabled={disabled}
      error={error ? "올바른 값을 입력해 주세요." : undefined}
      value={val}
      onChange={(v) => { setVal(v); onSelect(v || null); }}
      placeholder="오브리"
    />
  );
}

/* ── PointInput 내부 state wrapper ── */
function PointInputStory({
  balance,
  onSelect,
}: {
  balance: number;
  onSelect: (text: string | null) => void;
}) {
  const [applied, setApplied] = useLocalState(0);
  return (
    <PointInput
      balance={balance}
      applied={applied}
      onChange={(amount) => {
        setApplied(amount);
        onSelect(amount > 0 ? `${amount.toLocaleString()}P 적용` : "포인트 미적용");
      }}
    />
  );
}

/* ── SelectedItemCard 내부 state wrapper ── */
function SelectedItemStory({
  optionName,
  unitPrice,
  max,
  onSelect,
}: {
  optionName: string;
  unitPrice: number;
  max: number;
  onSelect: (text: string | null) => void;
}) {
  const [qty, setQty] = useLocalState(1);
  const [removed, setRemoved] = useLocalState(false);
  if (removed) {
    return (
      <div className="text-center py-6">
        <p className="text-[13px] text-[#aaa] mb-3">선택 해제됨</p>
        <button
          className="px-4 py-2 text-[13px] border border-[#e0e0e0] rounded-[10px] text-[#888] hover:bg-[#f5f5f5]"
          onClick={() => { setRemoved(false); setQty(1); onSelect(null); }}
        >
          다시 선택
        </button>
      </div>
    );
  }
  return (
    <SelectedItemCard
      optionName={optionName}
      quantity={qty}
      max={max}
      unitPrice={unitPrice}
      onQuantityChange={(q) => { setQty(q); onSelect(`${optionName} · ${q}개 · ${(unitPrice * q).toLocaleString()}원`); }}
      onRemove={() => { setRemoved(true); onSelect("선택 해제"); }}
    />
  );
}

/* ── QuantitySelector 내부 state wrapper ── */
function QtyStory({
  size,
  max,
  onSelect,
}: {
  size: "sm" | "md" | "lg";
  max: number;
  onSelect: (text: string | null) => void;
}) {
  const [qty, setQty] = useLocalState(1);
  return (
    <QuantitySelector
      quantity={qty}
      max={max}
      size={size}
      onChange={(q) => {
        setQty(q);
        onSelect(`수량: ${q} / 최대: ${max}`);
      }}
    />
  );
}

/* ── Knob 정의 ── */
export type KnobValue = string | number | boolean;

export type KnobDef =
  | {
      key: string;
      label: string;
      type: "radio";
      options: { value: KnobValue; label: string }[];
      /** 이 knob이 보일 조건 (현재 값들 기준) */
      visible?: (values: KnobValues) => boolean;
    }
  | {
      key: string;
      label: string;
      type: "toggle";
      visible?: (values: KnobValues) => boolean;
    }
  | {
      key: string;
      label: string;
      type: "stepper";
      min: number;
      max: number;
      visible?: (values: KnobValues) => boolean;
    };

export type KnobValues = Record<string, KnobValue>;

export interface PropDoc {
  name: string;
  type: string;
  desc: string;
}

export interface Story {
  id: string;
  name: string;
  /** 이 컴포넌트가 표현하는 상태 목록 (배지로 노출) */
  states: string[];
  knobs: KnobDef[];
  defaults: KnobValues;
  /**
   * knob 구조가 바뀔 때 remount 시키기 위한 서명.
   * 같은 서명이면 내부 state 유지, 달라지면 컴포넌트 재생성.
   */
  signature: (values: KnobValues) => string;
  /** 실제 컴포넌트 렌더 (onSelect는 콜백 출력 readout용) */
  render: (values: KnobValues, onSelect: (text: string | null) => void) => ReactNode;
  propsDoc: PropDoc[];
}

/* ── OptionSelector fixture 빌더 ── */
const FLAVORS = ["매운맛", "순한맛", "신맛", "짠맛", "단짠맛", "매콤한맛"];

function buildOptionFixture(values: KnobValues): { optionGroups: OptionGroup[]; skus: Sku[] } {
  const mode = values.mode as string;
  const includeSoldOut = values.includeSoldOut as boolean;
  const lowStock = values.lowStock as boolean;

  const base = {
    product_id: "demo",
    is_active: 1,
    created_at: "2026-01-01T00:00:00.000Z",
  };

  /* 단일 SKU */
  if (mode === "single") {
    const stock = includeSoldOut ? 0 : lowStock ? Math.min(3, LOW_STOCK_THRESHOLD) : 50;
    return {
      optionGroups: [],
      skus: [
        {
          ...base,
          id: "sku-single",
          sku_code: "DEMO-SINGLE",
          price: 31000,
          stock,
        },
      ],
    };
  }

  /* 다중 SKU (맛 그룹) */
  const count = Math.max(2, Math.min(FLAVORS.length, values.optionCount as number));
  const names = FLAVORS.slice(0, count);

  const group: OptionGroup = {
    id: "grp-flavor",
    product_id: "demo",
    name: "맛",
    sort_order: 0,
    values: names.map((name, i) => ({
      id: `val-${i}`,
      option_group_id: "grp-flavor",
      name,
      sort_order: i,
    })),
  };

  const skus: Sku[] = names.map((name, i) => {
    let stock = 50;
    if (includeSoldOut && i === count - 1) stock = 0;
    else if (lowStock && i === 0) stock = Math.min(3, LOW_STOCK_THRESHOLD);
    return {
      ...base,
      id: `sku-${i}`,
      sku_code: `DEMO-${i}`,
      price: 31000 + i * 31000,
      stock,
      option_values: [{ group_name: "맛", value_name: name }],
    };
  });

  return { optionGroups: [group], skus };
}

/* ── Story 레지스트리 ── */
export const STORIES: Story[] = [
  {
    id: "option-selector",
    name: "OptionSelector",
    states: ["Collapsed", "Expanded", "선택됨", "품절(disabled)", "단일 SKU", "재고 임박"],
    knobs: [
      {
        key: "mode",
        label: "모드",
        type: "radio",
        options: [
          { value: "multi", label: "다중 SKU" },
          { value: "single", label: "단일 SKU" },
        ],
      },
      {
        key: "optionCount",
        label: "옵션 개수",
        type: "stepper",
        min: 2,
        max: 6,
        visible: (v) => v.mode === "multi",
      },
      { key: "includeSoldOut", label: "품절 옵션 포함", type: "toggle" },
      { key: "lowStock", label: "재고 임박 표시", type: "toggle" },
    ],
    defaults: {
      mode: "multi",
      optionCount: 4,
      includeSoldOut: false,
      lowStock: false,
    },
    signature: (v) =>
      [v.mode, v.optionCount, v.includeSoldOut, v.lowStock].join("|"),
    render: (values, onSelect) => {
      const { optionGroups, skus } = buildOptionFixture(values);
      return (
        <OptionSelector
          optionGroups={optionGroups}
          skus={skus}
          onSkuSelected={(sku, qty) =>
            onSelect(
              sku ? `${sku.sku_code} · ${sku.price.toLocaleString()}원 · ${qty}개` : null
            )
          }
        />
      );
    },
    propsDoc: [
      {
        name: "optionGroups",
        type: "OptionGroup[]",
        desc: "옵션 그룹 목록. 비어 있으면 단일 SKU 모드로 렌더.",
      },
      {
        name: "skus",
        type: "Sku[]",
        desc: "옵션값 조합별 SKU. price·stock 보유, option_values로 그룹·값 매칭.",
      },
      {
        name: "onSkuSelected",
        type: "(sku: Sku | null, quantity: number) => void",
        desc: "옵션이 모두 선택되면 해당 SKU와 수량을 전달. 미완성 시 null.",
      },
    ],
  },
  {
    id: "list-row",
    name: "ListRow",
    states: ["Default", "Pressed", "With Value"],
    knobs: [
      {
        key: "pressed",
        label: "Pressed 상태",
        type: "toggle",
      },
      {
        key: "showValue",
        label: "우측 값 표시",
        type: "toggle",
      },
      {
        key: "label",
        label: "레이블",
        type: "radio",
        options: [
          { value: "주문내역", label: "주문내역" },
          { value: "쿠폰함", label: "쿠폰함" },
          { value: "1:1 문의", label: "1:1 문의" },
        ],
      },
    ],
    defaults: {
      pressed: false,
      showValue: false,
      label: "주문내역",
    },
    signature: (v) => [v.label, v.showValue].join("|"),
    render: (values, onSelect) => (
      <ListRow
        label={values.label as string}
        value={values.showValue ? "3" : undefined}
        pressed={values.pressed as boolean}
        onClick={() => onSelect(`"${values.label}" 탭됨`)}
      />
    ),
    propsDoc: [
      {
        name: "label",
        type: "string",
        desc: "행에 표시할 메뉴 이름.",
      },
      {
        name: "value",
        type: "string?",
        desc: "레이블 오른쪽에 표시할 보조 값 (예: 쿠폰 개수). 생략 시 미표시.",
      },
      {
        name: "pressed",
        type: "boolean",
        desc: "탭 중인 상태. true이면 배경이 #f5f5f5로 전환.",
      },
      {
        name: "onClick",
        type: "() => void",
        desc: "행 탭 핸들러.",
      },
    ],
  },
  {
    id: "list-section",
    name: "ListSection",
    states: ["Default"],
    knobs: [
      {
        key: "title",
        label: "섹션 제목",
        type: "radio",
        options: [
          { value: "고객 서비스", label: "고객 서비스" },
          { value: "쇼핑 활동", label: "쇼핑 활동" },
          { value: "혜택·자산", label: "혜택·자산" },
        ],
      },
      {
        key: "itemCount",
        label: "항목 개수",
        type: "stepper",
        min: 1,
        max: 6,
      },
      {
        key: "showValues",
        label: "우측 값 표시",
        type: "toggle",
      },
    ],
    defaults: {
      title: "고객 서비스",
      itemCount: 5,
      showValues: false,
    },
    signature: (v) => String(v.itemCount),
    render: (values, onSelect) => {
      const LABELS = ["주문내역", "취소/반품/교환", "1:1 문의", "공지사항", "자주 묻는 질문", "이벤트"];
      const VALUES = ["3건", "1건", "2건", "NEW", "—", "진행 중"];
      const count = values.itemCount as number;
      return (
        <ListSection
          title={values.title as string}
          items={Array.from({ length: count }, (_, i) => ({
            label: LABELS[i % LABELS.length],
            value: values.showValues ? VALUES[i % VALUES.length] : undefined,
            onClick: () => onSelect(`"${LABELS[i % LABELS.length]}" 탭됨`),
          }))}
        />
      );
    },
    propsDoc: [
      {
        name: "title",
        type: "string",
        desc: "섹션 상단에 표시할 헤더 텍스트 (SectionHeader).",
      },
      {
        name: "items",
        type: "ListSectionItem[]",
        desc: "{ label, value?, onClick? } 배열. 각 항목이 ListRow 한 행으로 렌더됨.",
      },
    ],
  },
  {
    id: "quantity-selector",
    name: "QuantitySelector",
    states: ["sm", "md", "lg", "Min Boundary", "Max Boundary"],
    knobs: [
      {
        key: "size",
        label: "Size",
        type: "radio",
        options: [
          { value: "sm", label: "sm" },
          { value: "md", label: "md" },
          { value: "lg", label: "lg" },
        ],
      },
      {
        key: "max",
        label: "최대 수량",
        type: "stepper",
        min: 1,
        max: 20,
      },
    ],
    defaults: { size: "md", max: 10 },
    signature: (v) => String(v.size),
    render: (values, onSelect) => (
      <QtyStory
        size={values.size as "sm" | "md" | "lg"}
        max={values.max as number}
        onSelect={onSelect}
      />
    ),
    propsDoc: [
      {
        name: "quantity",
        type: "number",
        desc: "현재 수량 값.",
      },
      {
        name: "max",
        type: "number",
        desc: "최대 수량. 도달하면 증가 버튼이 비활성화됨.",
      },
      {
        name: "onChange",
        type: "(qty: number) => void",
        desc: "수량 변경 시 호출되는 콜백.",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        desc: "컴포넌트 크기. sm(28px) / md(32px, 기본) / lg(44px) 버튼 기준.",
      },
    ],
  },
  {
    id: "selected-item-card",
    name: "SelectedItemCard",
    states: ["Default", "Quantity Added"],
    knobs: [
      {
        key: "optionName",
        label: "옵션명",
        type: "radio",
        options: [
          { value: "매운맛", label: "매운맛" },
          { value: "순한맛", label: "순한맛" },
          { value: "신맛", label: "신맛" },
        ],
      },
      {
        key: "unitPrice",
        label: "단가",
        type: "radio",
        options: [
          { value: 31000, label: "31,000원" },
          { value: 62000, label: "62,000원" },
          { value: 96000, label: "96,000원" },
        ],
      },
      {
        key: "max",
        label: "최대 수량",
        type: "stepper",
        min: 1,
        max: 10,
      },
    ],
    defaults: { optionName: "매운맛", unitPrice: 31000, max: 5 },
    signature: (v) => String(v.optionName),
    render: (values, onSelect) => (
      <SelectedItemStory
        optionName={values.optionName as string}
        unitPrice={values.unitPrice as number}
        max={values.max as number}
        onSelect={onSelect}
      />
    ),
    propsDoc: [
      { name: "optionName", type: "string", desc: "선택된 옵션명. 카드 상단에 표시." },
      { name: "quantity", type: "number", desc: "현재 수량." },
      { name: "max", type: "number", desc: "최대 수량. 도달하면 + 버튼 비활성화." },
      { name: "unitPrice", type: "number", desc: "단가(원). 총 가격 = unitPrice × quantity." },
      { name: "onQuantityChange", type: "(qty: number) => void", desc: "수량 변경 콜백." },
      { name: "onRemove", type: "() => void", desc: "× 버튼 탭 시 선택 해제 콜백." },
    ],
  },
  {
    id: "selection-card",
    name: "SelectionCard",
    states: ["Default", "Selected", "Disabled"],
    knobs: [
      {
        key: "selected",
        label: "Selected 상태",
        type: "toggle",
      },
      {
        key: "disabled",
        label: "Disabled 상태",
        type: "toggle",
      },
      {
        key: "showDescription",
        label: "설명 텍스트 표시",
        type: "toggle",
      },
      {
        key: "icon",
        label: "아이콘",
        type: "radio",
        options: [
          { value: "🫐", label: "🫐" },
          { value: "🥛", label: "🥛" },
          { value: "💊", label: "💊" },
        ],
      },
    ],
    defaults: {
      selected: false,
      disabled: false,
      showDescription: true,
      icon: "🫐",
    },
    signature: (v) => String(v.showDescription),
    render: (values, onSelect) => (
      <div className="w-[180px]">
        <SelectionCard
          icon={values.icon as string}
          title="식후 스파이크형"
          description={values.showDescription ? "밥먹고 나면\n혈당이 너무 튀어요" : undefined}
          selected={values.selected as boolean}
          disabled={values.disabled as boolean}
          onClick={() => onSelect(`"식후 스파이크형" 선택됨`)}
        />
      </div>
    ),
    propsDoc: [
      { name: "icon", type: "string", desc: "카드 상단에 표시할 이모지 또는 텍스트 아이콘." },
      { name: "title", type: "string", desc: "굵게 표시되는 카드 제목." },
      { name: "description", type: "string?", desc: "제목 아래 보조 설명. 생략 시 미표시." },
      { name: "selected", type: "boolean", desc: "선택 상태. true이면 테두리 진하게(2px black)." },
      { name: "disabled", type: "boolean", desc: "비활성화. true이면 opacity 45% + 클릭 불가." },
      { name: "onClick", type: "() => void", desc: "카드 탭 핸들러." },
    ],
  },
  {
    id: "point-input",
    name: "PointInput",
    states: ["Default", "Typing (직접 입력)", "Applied", "Empty Balance"],
    knobs: [
      {
        key: "balance",
        label: "보유 포인트",
        type: "radio",
        options: [
          { value: 134, label: "134P" },
          { value: 3500, label: "3,500P" },
          { value: 0, label: "0P (없음)" },
        ],
      },
    ],
    defaults: { balance: 134 },
    signature: (v) => String(v.balance),
    render: (values, onSelect) => (
      <PointInputStory
        balance={values.balance as number}
        onSelect={onSelect}
      />
    ),
    propsDoc: [
      { name: "balance", type: "number", desc: "보유 포인트 총액. 하단 '보유 NP' 표시에 사용." },
      { name: "applied", type: "number", desc: "현재 적용된 포인트. 0이면 Default, >0이면 Applied 상태." },
      { name: "onChange", type: "(amount: number) => void", desc: "직접 입력·모두사용·취소 모든 경우에 최종 금액을 전달. 부모에서 applied를 업데이트." },
    ],
  },
  {
    id: "address-item",
    name: "AddressItem",
    states: ["Selected", "Default (Unselected)"],
    knobs: [
      { key: "selected", label: "Selected 상태", type: "toggle" },
      { key: "isDefault", label: "기본 배송지 뱃지", type: "toggle" },
    ],
    defaults: { selected: true, isDefault: true },
    signature: (v) => String(v.selected),
    render: (values, onSelect) => (
      <AddressItem
        name="홍길동"
        phone="010-0000-0000"
        address="A다시 B다시 주소를 입력하는 플레이스 홀더 입니다. ABC다시 6다시 삼사"
        isDefault={values.isDefault as boolean}
        selected={values.selected as boolean}
        onSelect={() => onSelect("배송지 선택됨")}
        onEdit={() => onSelect("변경 버튼 탭됨")}
      />
    ),
    propsDoc: [
      { name: "name", type: "string", desc: "수령인 이름." },
      { name: "phone", type: "string", desc: "연락처. Selected 시 밑줄 표시." },
      { name: "address", type: "string", desc: "배송지 주소." },
      { name: "isDefault", type: "boolean", desc: "기본 배송지 여부. true이면 '기본 배송지' 뱃지 표시." },
      { name: "selected", type: "boolean", desc: "선택 상태. 라디오 채워짐 + 전화번호 강조." },
      { name: "onSelect", type: "() => void", desc: "행 탭 시 이 배송지 선택." },
      { name: "onEdit", type: "() => void", desc: "'변경' 버튼 탭 핸들러." },
    ],
  },
  {
    id: "product-row",
    name: "ProductRow",
    states: ["cart (checked)", "cart (unchecked)", "order", "compact"],
    knobs: [
      {
        key: "variant",
        label: "Variant",
        type: "radio",
        options: [
          { value: "cart", label: "cart" },
          { value: "order", label: "order" },
          { value: "compact", label: "compact" },
        ],
      },
      {
        key: "checked",
        label: "Checked",
        type: "toggle",
        visible: (v) => v.variant === "cart",
      },
      {
        key: "showImage",
        label: "이미지 표시",
        type: "toggle",
      },
    ],
    defaults: { variant: "cart", checked: true, showImage: false },
    signature: (v) => v.variant as string,
    render: (values, onSelect) => {
      const imageUrl = values.showImage
        ? "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=160"
        : undefined;
      if (values.variant === "cart") {
        return (
          <ProductRowCartStory
            initialChecked={values.checked as boolean}
            onSelect={onSelect}
          />
        );
      }
      if (values.variant === "order") {
        return (
          <ProductRow
            variant="order"
            brand="덱스콤"
            name="[25%할인] 루티니 14개입 1BOX"
            optionSummary="옵션명 01"
            quantity={1}
            price={31000}
            imageUrl={imageUrl}
            onClick={() => onSelect("주문 상세 이동")}
          />
        );
      }
      return (
        <ProductRow
          variant="compact"
          brand="덱스콤"
          name="[25%할인] 루티니 14개입 1BOX"
          optionSummary="옵션명 01"
          quantity={1}
          imageUrl={imageUrl}
        />
      );
    },
    propsDoc: [
      { name: "variant", type: '"cart" | "order" | "compact"', desc: "렌더 모드. 체크박스·× 버튼·가격 표시 여부와 이미지 크기를 제어." },
      { name: "brand", type: "string", desc: "브랜드명." },
      { name: "name", type: "string", desc: "상품명." },
      { name: "optionSummary", type: "string?", desc: "선택된 옵션 요약 텍스트." },
      { name: "quantity", type: "number?", desc: "수량." },
      { name: "price", type: "number", desc: "가격 (cart·order 전용). formatPrice로 표시." },
      { name: "checked", type: "boolean", desc: "체크 상태 (cart 전용)." },
      { name: "onCheck", type: "(v: boolean) => void", desc: "체크박스 토글 콜백 (cart 전용)." },
      { name: "onRemove", type: "() => void", desc: "× 버튼 콜백 (cart 전용)." },
      { name: "onClick", type: "() => void", desc: "행 클릭 콜백 (order 전용)." },
    ],
  },
  {
    id: "accordion",
    name: "Accordion",
    states: ["Collapsed", "Expanded"],
    knobs: [
      { key: "defaultOpen", label: "기본 펼침", type: "toggle" },
      {
        key: "title",
        label: "제목",
        type: "radio",
        options: [
          { value: "상품 번호", label: "상품 번호" },
          { value: "유통기한 안내", label: "유통기한 안내" },
          { value: "배송 정책", label: "배송 정책" },
        ],
      },
    ],
    defaults: { defaultOpen: false, title: "상품 번호" },
    signature: (v) => String(v.defaultOpen),
    render: (values, onSelect) => (
      <Accordion
        key={String(values.defaultOpen)}
        title={values.title as string}
        defaultOpen={values.defaultOpen as boolean}
      >
        데일리 멀티비타민 상품의 유통기한이 어떻게 되나요? 선물용으로 구매하려고 합니다.
      </Accordion>
    ),
    propsDoc: [
      { name: "title", type: "string", desc: "헤더에 표시되는 제목 텍스트." },
      { name: "children", type: "ReactNode", desc: "펼쳐졌을 때 보여줄 내용. 회색 박스 안에 렌더됨." },
      { name: "defaultOpen", type: "boolean", desc: "초기 열림 상태. 기본값 false." },
    ],
  },
  {
    id: "input",
    name: "Input",
    states: ["Default", "Filled", "Error", "Disabled"],
    knobs: [
      { key: "required", label: "필수(*)", type: "toggle" },
      { key: "error", label: "에러", type: "toggle" },
      { key: "disabled", label: "비활성", type: "toggle" },
    ],
    defaults: { required: true, error: false, disabled: false },
    signature: (v) => `${v.error}|${v.disabled}`,
    render: (values, onSelect) => (
      <InputStory
        required={values.required as boolean}
        error={values.error as boolean}
        disabled={values.disabled as boolean}
        onSelect={onSelect}
      />
    ),
    propsDoc: [
      { name: "label", type: "string", desc: "컨테이너 상단 라벨." },
      { name: "required", type: "boolean", desc: "라벨 옆 빨강 * 표시." },
      { name: "value / onChange", type: "string / (v: string) => void", desc: "제어 입력 값과 변경 콜백." },
      { name: "error", type: "string", desc: "있으면 빨강 테두리 + ⚠ 메시지 노출." },
      { name: "type", type: '"text" | "tel" | "password" | ...', desc: "input 타입. 기본 text." },
    ],
  },
];
