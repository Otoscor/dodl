import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { cancelOrder } from "@/lib/queries/orders";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const sessionId = await getSessionId();
  const result = cancelOrder(orderId, sessionId);

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
