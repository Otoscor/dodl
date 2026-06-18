import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { processGiftCheckout, type GiftAddressMode } from "@/lib/queries/gift";

export async function POST(request: NextRequest) {
  const sessionId = await getSessionId();
  const body = await request.json();

  const {
    skuId,
    quantity = 1,
    recipientName,
    recipientPhone,
    addressMode = "sender",
    addressLine1 = "",
    addressLine2 = "",
    senderName,
    senderPhone,
    giftMessage = "",
    pointsApplied = 0,
  } = body;

  const mode: GiftAddressMode = addressMode === "recipient" ? "recipient" : "sender";

  if (!skuId || !recipientName || !recipientPhone || !senderName) {
    return NextResponse.json(
      { success: false, message: "선물 정보를 모두 입력해주세요." },
      { status: 400 }
    );
  }

  // 보내는 사람이 직접 입력하는 모드에서는 주소가 필수
  if (mode === "sender" && !addressLine1) {
    return NextResponse.json(
      { success: false, message: "선물 배송지를 입력해주세요." },
      { status: 400 }
    );
  }

  const result = processGiftCheckout({
    sessionId,
    skuId,
    quantity,
    recipientName,
    recipientPhone,
    addressMode: mode,
    addressLine1: mode === "recipient" ? "" : addressLine1,
    addressLine2: mode === "recipient" ? "" : addressLine2,
    senderName,
    senderPhone: senderPhone ?? "",
    giftMessage,
    pointsApplied: Math.max(0, Number(pointsApplied) || 0),
  });

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
