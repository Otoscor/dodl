import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { updateCartItemQuantity, removeCartItem } from "@/lib/queries/cart";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cartItemId: string }> }
) {
  const { cartItemId } = await params;
  const sessionId = await getSessionId();
  const body = await request.json();
  const { quantity } = body;

  const result = updateCartItemQuantity(cartItemId, sessionId, quantity);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ cartItemId: string }> }
) {
  const { cartItemId } = await params;
  const sessionId = await getSessionId();
  const removed = removeCartItem(cartItemId, sessionId);

  if (!removed) {
    return NextResponse.json({ success: false, message: "항목을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
