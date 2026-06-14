"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { Button } from "@/components/ui/Button";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import type { CartSummary, CartItem } from "@/types/cart";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { refresh } = useCart();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchCart = async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setCart(data);
    setSelectedIds(new Set(data.items.map((item: CartItem) => item.id)));
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, []);

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    const res = await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    const data = await res.json();
    if (!data.success) {
      showToast(data.message, "error");
    }
    await fetchCart();
    refresh();
  };

  const handleRemove = async (itemId: string) => {
    await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    await fetchCart();
    refresh();
    showToast("삭제되었습니다.");
  };

  const handleRemoveSelected = async () => {
    for (const id of selectedIds) {
      await fetch(`/api/cart/${id}`, { method: "DELETE" });
    }
    await fetchCart();
    refresh();
    showToast("선택 항목이 삭제되었습니다.");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!cart) return;
    if (selectedIds.size === cart.items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cart.items.map((i) => i.id)));
    }
  };

  if (loading) return <><BackHeader title="장바구니" /><LoadingSpinner /></>;

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <BackHeader title="장바구니" />
        <EmptyState
          icon="🛒"
          title="장바구니가 비어있습니다"
          description="마음에 드는 상품을 담아보세요."
          action={<Link href="/products"><Button variant="secondary" size="sm">상품 보러가기</Button></Link>}
        />
      </>
    );
  }

  // Calculate based on selected items only
  const selectedItems = cart.items.filter((i) => selectedIds.has(i.id));
  const selectedTotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const selectedShipping = selectedTotal > 0 && selectedTotal < FREE_SHIPPING_THRESHOLD ? 3000 : 0;
  const selectedGrandTotal = selectedTotal + (selectedTotal > 0 ? selectedShipping : 0);

  return (
    <div className="pb-44">
      <BackHeader title="장바구니" />

      {/* Select all / delete */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedIds.size === cart.items.length}
            onChange={toggleAll}
            className="w-4 h-4 rounded accent-action-primary"
          />
          <span className="text-[13px] text-text-secondary">
            전체 선택 ({selectedIds.size}/{cart.items.length})
          </span>
        </label>
        {selectedIds.size > 0 && (
          <button
            onClick={handleRemoveSelected}
            className="text-[12px] text-text-tertiary hover:text-accent-red cursor-pointer"
          >
            선택 삭제
          </button>
        )}
      </div>

      {/* Cart items */}
      <div className="divide-y divide-border-subtle">
        {cart.items.map((item) => (
          <div key={item.id} className="px-4 py-4 flex gap-3">
            <input
              type="checkbox"
              checked={selectedIds.has(item.id)}
              onChange={() => toggleSelect(item.id)}
              className="w-4 h-4 rounded accent-action-primary mt-1 shrink-0"
            />
            <div className="w-16 h-16 bg-surface-elevated rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl">💊</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] text-text-primary font-medium truncate">{item.product_name}</h3>
              {item.option_summary && (
                <p className="text-[12px] text-text-tertiary mt-0.5">{item.option_summary}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-[14px] text-text-primary font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
                <div className="flex items-center gap-2">
                  <QuantitySelector
                    quantity={item.quantity}
                    max={item.stock}
                    onChange={(q) => handleQuantityChange(item.id, q)}
                    size="sm"
                  />
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-text-quaternary hover:text-accent-red text-[12px] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price breakdown - fixed bottom */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface-elevated/95 backdrop-blur-md border-t border-border-subtle px-4 py-4 pb-[max(16px,env(safe-area-inset-bottom))] z-30">
        <div className="space-y-2 text-[13px]">
          <div className="flex justify-between text-text-secondary">
            <span>상품금액</span>
            <span className="font-mono">{formatPrice(selectedTotal)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>배송비</span>
            <span className="font-mono">
              {selectedTotal === 0 ? "-" : selectedShipping === 0 ? "무료" : formatPrice(selectedShipping)}
            </span>
          </div>
          <div className="flex justify-between text-text-primary font-medium text-[15px] pt-2 border-t border-border-subtle">
            <span>총 결제금액</span>
            <span className="font-mono">{formatPrice(selectedGrandTotal)}</span>
          </div>
        </div>
        <Button
          fullWidth
          size="lg"
          className="mt-3"
          disabled={selectedIds.size === 0}
          onClick={() => router.push("/checkout")}
        >
          {selectedIds.size > 0 ? `${formatPrice(selectedGrandTotal)} 주문하기` : "상품을 선택하세요"}
        </Button>
      </div>
    </div>
  );
}
