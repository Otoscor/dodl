"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { OptionSelector } from "@/components/commerce/OptionSelector";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import type { ProductDetail, Sku } from "@/types/product";

type SheetAction = "cart" | "buy";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { refresh } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetAction, setSheetAction] = useState<SheetAction>("cart");
  const [selectedSku, setSelectedSku] = useState<Sku | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  }, [productId]);

  const handleSkuSelected = useCallback((sku: Sku | null, qty: number) => {
    setSelectedSku(sku);
    setQuantity(qty);
  }, []);

  const openSheet = (action: SheetAction) => {
    setSheetAction(action);
    setSheetOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedSku || selectedSku.stock === 0) return;
    setConfirming(true);

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skuId: selectedSku.id, quantity }),
    });
    const data = await res.json();

    if (data.success) {
      // badge 갱신을 먼저 완료한 뒤 시트를 닫아 count가 즉시 반영되도록 보장
      await refresh();
      if (sheetAction === "cart") {
        showToast("장바구니에 담았습니다.");
        setSheetOpen(false);
      } else {
        router.push("/checkout");
      }
    } else {
      showToast(data.message, "error");
    }
    setConfirming(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!product)
    return (
      <div className="p-8 text-center text-text-tertiary">
        상품을 찾을 수 없습니다.
      </div>
    );

  const allSoldOut = product.skus.every((s) => s.stock === 0);
  const minPrice = Math.min(...product.skus.map((s) => s.price));
  const maxPrice = Math.max(...product.skus.map((s) => s.price));
  const hasRange = minPrice !== maxPrice;

  // 바텀시트 CTA 레이블
  const confirmLabel = () => {
    if (!selectedSku || selectedSku.stock === 0) return "옵션을 선택해주세요";
    const total = formatPrice(selectedSku.price * quantity);
    return sheetAction === "cart"
      ? `${total} 장바구니 담기`
      : `${total} 구매하기`;
  };

  return (
    <>
      {/* 본문 — CTA 바(56px) + 탭바(56px) 높이만큼 하단 여백 */}
      <div className="pb-36">
        <BackHeader title={product.category_name} />

        {/* 상품 이미지 */}
        <div className="aspect-square bg-surface-base relative flex items-center justify-center">
          <span className="text-7xl">💊</span>
          {allSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="red" className="text-[13px] px-4 py-1.5">
                품절
              </Badge>
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="px-4 py-5 space-y-3">
          <p className="text-[12px] text-text-tertiary">{product.category_name}</p>
          <h1 className="text-[18px] font-medium text-text-primary leading-snug">
            {product.name}
          </h1>

          {/* 가격 — 옵션 선택 전 범위 표시 */}
          <div className="flex items-baseline gap-1">
            {allSoldOut ? (
              <span className="text-[15px] text-text-quaternary">품절</span>
            ) : hasRange ? (
              <span className="font-mono text-[18px] font-medium text-text-primary">
                {formatPrice(minPrice)}{" "}
                <span className="text-text-tertiary text-[14px]">~</span>
              </span>
            ) : (
              <span className="font-mono text-[18px] font-medium text-text-primary">
                {formatPrice(minPrice)}
              </span>
            )}
          </div>

          <div className="border-t border-border-subtle pt-3">
            <p className="text-[14px] text-text-secondary leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* 옵션 안내 */}
          {!allSoldOut && product.option_groups.length > 0 && (
            <div className="flex items-center gap-2 text-[13px] text-text-tertiary pt-1">
              <span>옵션</span>
              <span className="text-text-quaternary">|</span>
              {product.option_groups.map((g) => g.name).join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* 고정 하단 CTA — 탭바 위 */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface-white border-t border-border-subtle px-4 py-3 z-30">
        {allSoldOut ? (
          <Button fullWidth disabled size="lg">
            품절
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => openSheet("cart")}
            >
              장바구니
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={() => openSheet("buy")}
            >
              구매하기
            </Button>
          </div>
        )}
      </div>

      {/* 옵션 선택 바텀시트 */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        {/* 시트 헤더 — 상품 미니 요약 */}
        <div className="flex items-center gap-3 px-4 pt-2 pb-4 border-b border-border-subtle">
          <div className="w-12 h-12 bg-surface-base rounded-xl flex items-center justify-center shrink-0">
            <span className="text-xl">💊</span>
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-text-primary truncate">
              {product.name}
            </p>
            <p className="font-mono text-[13px] text-text-secondary mt-0.5">
              {hasRange
                ? `${formatPrice(minPrice)} ~`
                : formatPrice(minPrice)}
            </p>
          </div>
        </div>

        {/* 옵션 선택 영역 — 높은 상품은 스크롤 */}
        <div className="px-4 py-4 overflow-y-auto max-h-[52vh]">
          <OptionSelector
            optionGroups={product.option_groups}
            skus={product.skus}
            onSkuSelected={handleSkuSelected}
          />
        </div>

        {/* 시트 하단 확정 버튼 */}
        <div className="px-4 pt-3 pb-6 border-t border-border-subtle">
          <Button
            fullWidth
            size="lg"
            disabled={!selectedSku || selectedSku.stock === 0 || confirming}
            onClick={handleConfirm}
          >
            {confirming ? "처리 중..." : confirmLabel()}
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}
