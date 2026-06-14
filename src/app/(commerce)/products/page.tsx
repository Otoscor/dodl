"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/commerce/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { ProductListItem, Category } from "@/types/product";

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(categorySlug);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveCategory(categorySlug);
  }, [categorySlug]);

  useEffect(() => {
    const url = activeCategory
      ? `/api/products?category=${activeCategory}&include=meta`
      : `/api/products?include=meta`;

    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        if (data.categories) setCategories(data.categories);
        setLoading(false);
      });
  }, [activeCategory]);

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface-base/80 backdrop-blur-md border-b border-border-subtle">
        <div className="px-4 py-3">
          <h1 className="text-[17px] font-medium text-text-primary">상품</h1>
        </div>
        {/* Category filter */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-3 py-1.5 text-[12px] font-medium rounded-pill border transition-colors cursor-pointer ${
              !activeCategory
                ? "border-action-primary bg-action-primary/10 text-action-primary"
                : "border-border-subtle text-text-tertiary hover:text-text-secondary"
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`shrink-0 px-3 py-1.5 text-[12px] font-medium rounded-pill border transition-colors cursor-pointer ${
                activeCategory === cat.slug
                  ? "border-action-primary bg-action-primary/10 text-action-primary"
                  : "border-border-subtle text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Products grid */}
      <div className="px-4 py-4">
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="상품이 없습니다"
            description="다른 카테고리를 선택해보세요."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
