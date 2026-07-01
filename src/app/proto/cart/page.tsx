"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SCENARIOS, type Scenario, type ScenarioId } from "./data";
import { MIN_QTY, ctaMode, type CartItem, type SimState } from "./policy";
import ProductDetailScreen from "./components/ProductDetailScreen";
import AddedSheet from "./components/AddedSheet";
import CartScreen from "./components/CartScreen";
import ScenarioSwitcher from "./components/ScenarioSwitcher";
import ConfirmModal from "./components/ConfirmModal";

/**
 * 장바구니 프로토타입 — Figma 시각 + 정책서 정책.
 * 상품상세 → 담김 시트 → 장바구니. 장바구니는 정책 검증 시나리오 스위처로
 * 모든 상태/엣지케이스(정상·가격변동·수량부족·품절·판매중단·로딩·실패·빈·자동정리·100개)를 재현한다.
 */
export default function CartProtoPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<"detail" | "cart">("detail");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scenarioId, setScenarioId] = useState<ScenarioId>("mixed");
  const [items, setItems] = useState<CartItem[]>(SCENARIOS.mixed.items);
  const [simState, setSimState] = useState<SimState>("READY");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const simTimer = useRef<number | undefined>(undefined);

  // 시뮬레이션 실행(진입 자동 1회 / 다시 계산 / 시나리오 전환).
  function runSim(scenario: Scenario) {
    window.clearTimeout(simTimer.current);
    if (scenario.forceSim === "SIMULATING") {
      setSimState("SIMULATING");
      return;
    }
    setSimState("SIMULATING");
    simTimer.current = window.setTimeout(() => {
      setSimState(scenario.forceSim === "FAILED" ? "FAILED" : "READY");
    }, 750);
  }

  function loadScenario(id: ScenarioId) {
    const s = SCENARIOS[id];
    setScenarioId(id);
    setItems(s.items.map((x) => ({ ...x }))); // 클론 → 이전 편집 초기화
    setLoadingId(null);
    setConfirmOpen(false);
    runSim(s);
  }

  // 딥링크: ?scenario=<id> / ?start=cart (마운트 1회 URL 기반 초기화)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const scen = sp.get("scenario") as ScenarioId | null;
    const validScen = scen && SCENARIOS[scen] ? scen : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (validScen || sp.get("start") === "cart") setScreen("cart");
    loadScenario(validScen ?? scenarioId);
    return () => window.clearTimeout(simTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 수량 변경 — 서버 확정 흉내(스피너). 수량 부족은 재고 이하로 내리면 정상화.
  function changeQty(id: string, delta: number) {
    if (loadingId) return;
    setLoadingId(id);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((it) => {
          if (it.id !== id) return it;
          const q = Math.max(MIN_QTY, it.quantity + delta);
          const status =
            it.status === "INSUFFICIENT_STOCK" && q <= it.stock ? "NORMAL" : it.status;
          return { ...it, quantity: q, status };
        }),
      );
      setLoadingId(null);
    }, 400);
  }

  function withLoading(id: string, mutate: (it: CartItem) => CartItem) {
    if (loadingId) return;
    setLoadingId(id);
    setTimeout(() => {
      setItems((prev) => prev.map((it) => (it.id === id ? mutate(it) : it)));
      setLoadingId(null);
    }, 400);
  }

  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));
  const adjustStock = (id: string) =>
    withLoading(id, (it) => ({ ...it, quantity: it.stock, status: "NORMAL" }));
  const acceptPrice = (id: string) =>
    withLoading(id, (it) => ({ ...it, status: "NORMAL", prevPrice: undefined }));

  function recalculate() {
    window.clearTimeout(simTimer.current);
    setSimState("SIMULATING");
    simTimer.current = window.setTimeout(() => setSimState("READY"), 750);
  }

  function onCheckout() {
    if (ctaMode(items) === "confirm") setConfirmOpen(true);
    // "checkout" 모드: 결제 플로우는 프로토타입 범위 밖
  }

  function confirmPriceChanges() {
    setItems((prev) =>
      prev.map((it) =>
        it.status === "PRICE_CHANGED" ? { ...it, status: "NORMAL", prevPrice: undefined } : it,
      ),
    );
    setConfirmOpen(false);
    recalculate();
  }

  const priceChanged = items.filter((i) => i.status === "PRICE_CHANGED");

  return (
    <>
      {screen === "detail" && (
        <ProductDetailScreen onAdd={() => setSheetOpen(true)} onBack={() => router.push("/proto")} />
      )}

      {screen === "cart" && (
        <>
          <CartScreen
            items={items}
            simState={simState}
            loadingId={loadingId}
            emptyKind={SCENARIOS[scenarioId].emptyKind}
            onBack={() => setScreen("detail")}
            onDec={(id) => changeQty(id, -1)}
            onInc={(id) => changeQty(id, +1)}
            onRemove={removeItem}
            onAdjustStock={adjustStock}
            onAcceptPrice={acceptPrice}
            onRecalculate={recalculate}
            onCheckout={onCheckout}
          />
          <ScenarioSwitcher current={scenarioId} onSelect={loadScenario} />
          {confirmOpen && (
            <ConfirmModal
              items={priceChanged}
              onConfirm={confirmPriceChanges}
              onCancel={() => setConfirmOpen(false)}
            />
          )}
        </>
      )}

      {sheetOpen && (
        <AddedSheet
          onGoCart={() => {
            setSheetOpen(false);
            setScreen("cart");
          }}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}
