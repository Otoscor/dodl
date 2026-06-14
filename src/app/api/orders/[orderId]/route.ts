import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getOrderDetail } from "@/lib/queries/orders";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const sessionId = await getSessionId();
  const order = getOrderDetail(orderId, sessionId);

  if (!order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(order);
}
