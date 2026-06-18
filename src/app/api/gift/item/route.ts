import { NextRequest, NextResponse } from "next/server";
import { getGiftItem } from "@/lib/queries/gift";

export async function GET(request: NextRequest) {
  const skuId = request.nextUrl.searchParams.get("skuId");
  if (!skuId) {
    return NextResponse.json({ item: null }, { status: 400 });
  }
  const item = getGiftItem(skuId);
  if (!item) {
    return NextResponse.json({ item: null }, { status: 404 });
  }
  return NextResponse.json({ item });
}
