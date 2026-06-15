"use client";

import { useEffect, useState } from "react";
import { BackHeader } from "@/components/layout/BackHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MyProductRow } from "@/components/commerce/MyProductRow";
import type { ProductListItem } from "@/types/product";

export default function MyLikesPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        // 가상 관계: 실제 상품 일부를 찜한 상품으로 표시
        setProducts((data.products || []).slice(0, 6));
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white">
      <BackHeader title="찜한 상품" />

      {products.length === 0 ? (
        <EmptyState icon="favorite_border" title="찜한 상품이 없습니다" description="마음에 드는 상품을 찜해보세요." />
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
