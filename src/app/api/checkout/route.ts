import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { processCheckout } from "@/lib/queries/checkout";

export async function POST(request: NextRequest) {
  const sessionId = await getSessionId();
  const body = await request.json();

  const { recipientName, recipientPhone, addressLine1, addressLine2 = "", pointsApplied = 0 } = body;

  if (!recipientName || !recipientPhone || !addressLine1) {
    return NextResponse.json(
      { success: false, message: "배송 정보를 모두 입력해주세요." },
      { status: 400 }
    );
  }

  const result = processCheckout({
    sessionId,
    recipientName,
    recipientPhone,
    addressLine1,
    addressLine2,
    pointsApplied: Math.max(0, Number(pointsApplied) || 0),
  });

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
