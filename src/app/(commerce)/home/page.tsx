import Link from "next/link";
import { getProducts, getCategories, getBanners } from "@/lib/queries/products";
import { BannerCarousel } from "@/components/commerce/BannerCarousel";
import { CategoryGrid } from "@/components/commerce/CategoryGrid";
import { ProductCard } from "@/components/commerce/ProductCard";
import { HomeCartIcon } from "@/components/layout/HomeCartIcon";

export default function HomePage() {
  const categories = getCategories();
  const banners = getBanners();
  const products = getProducts();

  // Pick up to 6 featured products (those with stock)
  const featured = products.filter((p) => !p.all_sold_out).slice(0, 6);

  return (
    <div className="space-y-8 pb-6">
      {/* Header */}
      <header className="px-4 pt-6 flex items-center justify-between">
        <div>
          <Link href="/" className="text-[22px] font-semibold text-text-primary tracking-tight">dodl</Link>
          <p className="text-[13px] text-text-tertiary mt-0.5">건강을 더하다</p>
        </div>
        <HomeCartIcon />
      </header>

      {/* Banner */}
      <BannerCarousel banners={banners} />

      {/* Categories */}
      <section>
        <h2 className="text-[15px] font-medium text-text-primary px-4 mb-3">카테고리</h2>
        <CategoryGrid categories={categories} />
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="text-[15px] font-medium text-text-primary px-4 mb-3">추천 상품</h2>
        <div className="grid grid-cols-2 gap-3 px-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
