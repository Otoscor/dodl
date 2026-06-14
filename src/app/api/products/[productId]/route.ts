import { NextRequest, NextResponse } from "next/server";
import { getProductDetail } from "@/lib/queries/products";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const product = getProductDetail(productId);

  if (!product) {
    return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(product);
}
