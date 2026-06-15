"use client";

import { useEffect, useState } from "react";
import { BackHeader } from "@/components/layout/BackHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MyProductRow } from "@/components/commerce/MyProductRow";
import type { ProductListItem } from "@/types/product";

export default function MyRecentPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const all: ProductListItem[] = data.products || [];
        // 가상 관계: 실제 상품 일부를 최근 본 상품으로 표시
        setProducts(all.length > 6 ? all.slice(6, 12) : all.slice(0, 6));
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white">
      <BackHeader title="최근 본 상품" />

      {products.length === 0 ? (
        <EmptyState icon="history" title="최근 본 상품이 없습니다" description="상품을 둘러보면 여기에 기록됩니다." />
      ) : (
        <>
          <p className="px-6 pt-4 pb-1 text-[14px] text-text-tertiary">총 {products.length}개</p>
          <div className="divide-y divide-border-subtle pb-10">
            {products.map((product) => (
              <MyProductRow key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
