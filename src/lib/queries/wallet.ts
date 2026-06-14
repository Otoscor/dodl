import { getDb } from "../db";
import { v4 as uuidv4 } from "uuid";
import { INITIAL_WALLET_BALANCE, WALLET_TX_TYPE } from "../constants";
import type { Wallet, WalletTransaction } from "@/types/wallet";

export function getOrCreateWallet(sessionId: string): Wallet {
  const db = getDb();
  let wallet = db.prepare("SELECT * FROM wallets WHERE session_id = ?").get(sessionId) as Wallet | undefined;

  if (!wallet) {
    const id = uuidv4();
    db.prepare("INSERT INTO wallets (id, session_id, balance) VALUES (?, ?, ?)").run(id, sessionId, INITIAL_WALLET_BALANCE);

    const txId = uuidv4();
    db.prepare(
      "INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(txId, id, WALLET_TX_TYPE.GRANT, INITIAL_WALLET_BALANCE, INITIAL_WALLET_BALANCE, "가상 지갑 초기 부여");

    wallet = db.prepare("SELECT * FROM wallets WHERE id = ?").get(id) as Wallet;
  }

  return wallet;
}

export function getWalletTransactions(walletId: string, type?: string): WalletTransaction[] {
  const db = getDb();
  if (type) {
    return db.prepare(
      "SELECT * FROM wallet_transactions WHERE wallet_id = ? AND type = ? ORDER BY created_at DESC"
    ).all(walletId, type) as WalletTransaction[];
  }
  return db.prepare(
    "SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC"
  ).all(walletId) as WalletTransaction[];
}
