import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getCart, addToCart } from "@/lib/queries/cart";

export async function GET() {
  const sessionId = await getSessionId();
  const cart = getCart(sessionId);
  return NextResponse.json(cart);
}

export async function POST(request: NextRequest) {
  const sessionId = await getSessionId();
  const body = await request.json();
  const { skuId, quantity = 1 } = body;

  if (!skuId) {
    return NextResponse.json({ success: false, message: "SKU ID가 필요합니다." }, { status: 400 });
  }

  const result = addToCart(sessionId, skuId, quantity);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
