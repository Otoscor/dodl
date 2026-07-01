// 장바구니 프로토타입 정적 시드 (DB 의존 없음 — 격리).
// 정책서 §2·§5의 상태/엣지케이스를 "정책 검증 시나리오"로 구성한다.

import type { CartItem, SimState } from "./policy";

const THUMB = "/proto/cart/cart-thumb.png";
const NAME = "[25%할인] 루티니 14개입 1BOX";
const OPTION = "[옵션] 옵션명 01";
const SALE = 31000;
const ORIGINAL = 41300;

// 항목 팩토리 — 상태별 오버라이드만 지정.
let seq = 0;
function item(over: Partial<CartItem>): CartItem {
  seq += 1;
  return {
    id: over.id ?? `it-${seq}`,
    name: NAME,
    option: OPTION,
    image: THUMB,
    originalPrice: ORIGINAL,
    salePrice: SALE,
    quantity: 1,
    stock: 20,
    status: "NORMAL",
    ...over,
  };
}

export type ScenarioId =
  | "normal"
  | "mixed"
  | "price_only"
  | "simulating"
  | "failed"
  | "empty"
  | "auto_cleanup"
  | "max_100";

export interface Scenario {
  id: ScenarioId;
  label: string;
  description: string;
  items: CartItem[];
  /** 진입 시 고정할 시뮬레이션 상태(미지정 시 자동 SIMULATING→READY). */
  forceSim?: Extract<SimState, "SIMULATING" | "FAILED">;
  /** 빈 상태 종류. */
  emptyKind?: "normal" | "cleanup";
}

// 혼합 시나리오 — 5개 상태를 한 화면에서 검증.
const MIXED: CartItem[] = [
  item({ id: "m-normal", quantity: 1, stock: 20, status: "NORMAL" }),
  item({
    id: "m-price",
    quantity: 2,
    stock: 20,
    status: "PRICE_CHANGED",
    prevPrice: 28000,
    salePrice: SALE, // 28,000 → 31,000 인상
  }),
  item({ id: "m-stock", quantity: 5, stock: 3, status: "INSUFFICIENT_STOCK" }),
  item({ id: "m-soldout", quantity: 1, stock: 0, status: "SOLD_OUT" }),
  item({ id: "m-discont", quantity: 1, stock: 8, status: "DISCONTINUED" }),
];

const NORMAL_ONLY: CartItem[] = [
  item({ id: "n-1", quantity: 2, stock: 20, status: "NORMAL" }),
  item({ id: "n-2", quantity: 1, stock: 4, status: "NORMAL" }), // 재고 힌트
  item({ id: "n-3", quantity: 3, stock: 20, status: "NORMAL" }),
];

const PRICE_ONLY: CartItem[] = [
  item({ id: "p-1", quantity: 1, stock: 20, status: "NORMAL" }),
  item({
    id: "p-2",
    quantity: 2,
    stock: 20,
    status: "PRICE_CHANGED",
    prevPrice: 33000,
    salePrice: SALE, // 33,000 → 31,000 인하
  }),
];

// 100개 제한 데모 — 실제 100개 렌더(정책서 1: 최대 100 항목).
const HUNDRED: CartItem[] = Array.from({ length: 100 }, (_, i) =>
  item({ id: `h-${i}`, quantity: 1, stock: 20, status: "NORMAL" }),
);

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  mixed: {
    id: "mixed",
    label: "변경 있음 (혼합)",
    description: "가격변동·수량부족·품절·판매중단 + 정상",
    items: MIXED,
  },
  normal: {
    id: "normal",
    label: "정상 (모두 NORMAL)",
    description: "결제 가능 상태",
    items: NORMAL_ONLY,
  },
  price_only: {
    id: "price_only",
    label: "가격 변동만",
    description: "확인 모달 후 결제 진행",
    items: PRICE_ONLY,
  },
  simulating: {
    id: "simulating",
    label: "시뮬레이션 로딩",
    description: "금액 계산 중 스켈레톤",
    items: NORMAL_ONLY,
    forceSim: "SIMULATING",
  },
  failed: {
    id: "failed",
    label: "시뮬레이션 실패",
    description: "재시도 CTA",
    items: NORMAL_ONLY,
    forceSim: "FAILED",
  },
  empty: {
    id: "empty",
    label: "빈 장바구니",
    description: "담긴 상품 없음",
    items: [],
    emptyKind: "normal",
  },
  auto_cleanup: {
    id: "auto_cleanup",
    label: "자동 정리 빈 상태",
    description: "MEMBER 30일 / GUEST 7일 경과",
    items: [],
    emptyKind: "cleanup",
  },
  max_100: {
    id: "max_100",
    label: "100개 제한 도달",
    description: "최대 100개",
    items: HUNDRED,
  },
};

export const SCENARIO_ORDER: ScenarioId[] = [
  "mixed",
  "normal",
  "price_only",
  "simulating",
  "failed",
  "empty",
  "auto_cleanup",
  "max_100",
];

// ── 진입 상품 상세(담기 전 화면) ──
export const DETAIL_PRODUCT = {
  name: "OLIVE LEMON SHOT Timeless Vitality, 라티브 올리브레몬샷",
  origin: "상세설명에 표시",
  price: 39900,
  hero: "/proto/cart/detail-hero.png",
  rating: 4,
  reviewCount: 2515,
  cleanScore: 98,
  scorePercent: 83,
  tags: [
    { label: "Non GMO", on: true },
    { label: "식품첨가물 무첨가", on: true },
    { label: "트랜스지방 경화유", on: false },
  ],
};

// ── 담김 시트: 두들 인기상품 ──
export interface PopularProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

export const POPULAR_PRODUCTS: PopularProduct[] = [
  { id: "pop-1", name: "퍼포먼스 G7 혈당측정기요구사항", price: 30000, image: "/proto/cart/pop-1.png" },
  { id: "pop-2", name: "퍼포먼스 G7 혈당측정기요구사항", price: 30000, image: "/proto/cart/pop-2.png" },
  { id: "pop-3", name: "퍼포먼스 G7 혈당측정기요구사항", price: 30000, image: "/proto/cart/pop-3.png" },
];
