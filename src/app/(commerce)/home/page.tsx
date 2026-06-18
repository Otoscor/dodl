import { getProducts } from "@/lib/queries/products";
import { HomeFeed } from "./HomeFeed";
import { HomeHeaderActions } from "@/components/layout/HomeHeaderActions";
import { TitleBar } from "@/components/layout/TitleBar";

export default function HomePage() {
  const products = getProducts();

  return (
    <div className="min-h-screen bg-white pb-10">
      <TitleBar title="dodl" titleHref="/home" rightAction={<HomeHeaderActions />} />
      {/* Spacer for fixed header */}
      <div className="h-16" />

      <HomeFeed products={products} />
    </div>
  );
}
