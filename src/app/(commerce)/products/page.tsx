"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/commerce/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { TitleBar } from "@/components/layout/TitleBar";
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
    <div className="min-h-screen bg-white">
      <TitleBar title="상품" />
      {/* Spacer for fixed title bar */}
      <div className="h-16" />

      {/* Category filter */}
      <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md">
        <div className="flex gap-3 px-6 py-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-3 py-1.5 text-[13px] uppercase tracking-[0.08em] border rounded-[10px] transition-colors cursor-pointer ${
              !activeCategory
                ? "border-black bg-black text-white"
                : "border-[#e0e0e0] bg-[#f5f5f5] text-[#888] hover:text-black"
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`shrink-0 px-3 py-1.5 text-[13px] uppercase tracking-[0.08em] border rounded-[10px] transition-colors cursor-pointer ${
                activeCategory === cat.slug
                  ? "border-black bg-black text-white"
                  : "border-[#e0e0e0] bg-[#f5f5f5] text-[#888] hover:text-black"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div className="px-6 pt-3 pb-24">
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <EmptyState
            icon="search"
            title="상품이 없습니다"
            description="다른 카테고리를 선택해보세요."
          />
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
