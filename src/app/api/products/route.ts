import { NextRequest, NextResponse } from "next/server";
import { getProducts, getCategories, getBanners } from "@/lib/queries/products";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const include = searchParams.get("include");

  const products = getProducts(category);

  if (include === "meta") {
    const categories = getCategories();
    const banners = getBanners();
    return NextResponse.json({ products, categories, banners });
  }

  return NextResponse.json({ products });
}
