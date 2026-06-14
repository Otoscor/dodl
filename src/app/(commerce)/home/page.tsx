import Link from "next/link";
import { getProducts, getCategories, getBanners } from "@/lib/queries/products";
import { BannerCarousel } from "@/components/commerce/BannerCarousel";
import { CategoryGrid } from "@/components/commerce/CategoryGrid";
import { ProductCard } from "@/components/commerce/ProductCard";
import { HomeCartIcon } from "@/components/layout/HomeCartIcon";
import { TitleBar } from "@/components/layout/TitleBar";

export default function HomePage() {
  const categories = getCategories();
  const banners = getBanners();
  const products = getProducts();

  // Pick up to 6 featured products (those with stock)
  const featured = products.filter((p) => !p.all_sold_out).slice(0, 6);

  return (
    <div className="min-h-screen bg-white space-y-14 pb-10">
      <TitleBar title="prototype" titleHref="/" rightAction={<HomeCartIcon />} />
      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Banner */}
      <BannerCarousel banners={banners} />

      {/* Categories */}
      <section>
        <h2 className="text-[16px] text-black px-6 mb-6 uppercase tracking-[0.12em]">카테고리</h2>
        <CategoryGrid categories={categories} />
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="text-[16px] text-black px-6 mb-6 uppercase tracking-[0.12em]">추천 상품</h2>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 px-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
