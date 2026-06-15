import { getProducts } from "@/lib/queries/products";
import { MetabolicChips } from "@/components/commerce/MetabolicChips";
import { MagazineCard } from "@/components/commerce/MagazineCard";
import { HomeCartIcon } from "@/components/layout/HomeCartIcon";
import { TitleBar } from "@/components/layout/TitleBar";

export default function HomePage() {
  const products = getProducts();

  return (
    <div className="min-h-screen bg-white pb-10">
      <TitleBar title="prototype" titleHref="/" rightAction={<HomeCartIcon />} />
      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* 대사 상태 진단 (UI 전용) */}
      <section className="mt-2">
        <h2 className="text-[20px] leading-snug text-black px-6 mb-5">
          오늘 당신의 대사 상태는 어떤가요?
        </h2>
        <MetabolicChips />
      </section>

      {/* 1열 매거진 피드 */}
      <section className="mt-12 flex flex-col gap-12 px-6">
        {products.map((product) => (
          <MagazineCard key={product.id} product={product} />
        ))}
      </section>
    </div>
  );
}
