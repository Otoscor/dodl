import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getOrders } from "@/lib/queries/orders";

export async function GET() {
  const sessionId = await getSessionId();
  const orders = getOrders(sessionId);
  return NextResponse.json({ orders });
}
