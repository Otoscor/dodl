import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { requestReturn } from "@/lib/queries/orders";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const sessionId = await getSessionId();
  const body = await request.json();

  if (!body.reason) {
    return NextResponse.json({ success: false, message: "사유를 선택해주세요." }, { status: 400 });
  }

  const result = requestReturn(orderId, sessionId, body.reason, body.note || "");

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
