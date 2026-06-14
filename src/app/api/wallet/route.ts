import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getOrCreateWallet, getWalletTransactions } from "@/lib/queries/wallet";

export async function GET(request: NextRequest) {
  const sessionId = await getSessionId();
  const wallet = getOrCreateWallet(sessionId);
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || undefined;
  const transactions = getWalletTransactions(wallet.id, type);

  return NextResponse.json({ wallet, transactions });
}
