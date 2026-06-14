import { getDb } from "../db";
import { v4 as uuidv4 } from "uuid";
import { isCancellable, isReturnable } from "../utils";
import { WALLET_TX_TYPE, ORDER_STATUS } from "../constants";
import type { Order, OrderDetail, OrderItem } from "@/types/order";

export function getOrders(sessionId: string): Order[] {
  const db = getDb();
  return db.prepare(
    "SELECT * FROM orders WHERE session_id = ? ORDER BY created_at DESC"
  ).all(sessionId) as Order[];
}

export function getOrderDetail(orderId: string, sessionId: string): OrderDetail | null {
  const db = getDb();
  const order = db.prepare(
    "SELECT * FROM orders WHERE id = ? AND session_id = ?"
  ).get(orderId, sessionId) as Order | undefined;

  if (!order) return null;

  const items = db.prepare(
    "SELECT * FROM order_items WHERE order_id = ?"
  ).all(orderId) as OrderItem[];

  return { ...order, items };
}

export function cancelOrder(orderId: string, sessionId: string): { success: boolean; message: string } {
  const db = getDb();

  const cancel = db.transaction(() => {
    const order = db.prepare(
      "SELECT * FROM orders WHERE id = ? AND session_id = ?"
    ).get(orderId, sessionId) as Order | undefined;

    if (!order) throw new Error("주문을 찾을 수 없습니다.");
    if (!isCancellable(order.status)) {
      throw new Error(`현재 상태(${order.status})에서는 취소할 수 없습니다.`);
    }

    // Restore stock
    const items = db.prepare(
      "SELECT * FROM order_items WHERE order_id = ?"
    ).all(orderId) as OrderItem[];

    for (const item of items) {
      db.prepare("UPDATE skus SET stock = stock + ? WHERE id = ?").run(item.quantity, item.sku_id);
    }

    // Refund wallet
    const wallet = db.prepare(
      "SELECT * FROM wallets WHERE session_id = ?"
    ).get(sessionId) as { id: string; balance: number };

    const newBalance = wallet.balance + order.total_amount;
    db.prepare("UPDATE wallets SET balance = ? WHERE id = ?").run(newBalance, wallet.id);

    db.prepare(
      "INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(uuidv4(), wallet.id, WALLET_TX_TYPE.REFUND, order.total_amount, newBalance, "주문 취소 환불", orderId);

    // Update order status
    db.prepare(
      "UPDATE orders SET status = ?, cancelled_at = datetime('now') WHERE id = ?"
    ).run(ORDER_STATUS.CANCELLED, orderId);
  });

  try {
    cancel();
    return { success: true, message: "주문이 취소되었습니다." };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export function requestReturn(
  orderId: string,
  sessionId: string,
  reason: string,
  note: string
): { success: boolean; message: string } {
  const db = getDb();

  const run = db.transaction(() => {
    const order = db.prepare(
      "SELECT * FROM orders WHERE id = ? AND session_id = ?"
    ).get(orderId, sessionId) as Order | undefined;

    if (!order) throw new Error("주문을 찾을 수 없습니다.");
    if (!isReturnable(order.status)) {
      throw new Error(`현재 상태(${order.status})에서는 반품할 수 없습니다.`);
    }

    // Restore stock
    const items = db.prepare(
      "SELECT * FROM order_items WHERE order_id = ?"
    ).all(orderId) as OrderItem[];

    for (const item of items) {
      db.prepare("UPDATE skus SET stock = stock + ? WHERE id = ?").run(item.quantity, item.sku_id);
    }

    // Refund wallet
    const wallet = db.prepare(
      "SELECT * FROM wallets WHERE session_id = ?"
    ).get(sessionId) as { id: string; balance: number };

    const newBalance = wallet.balance + order.total_amount;
    db.prepare("UPDATE wallets SET balance = ? WHERE id = ?").run(newBalance, wallet.id);

    db.prepare(
      "INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(uuidv4(), wallet.id, WALLET_TX_TYPE.REFUND, order.total_amount, newBalance, "반품 환불", orderId);

    // Update order status
    db.prepare(
      "UPDATE orders SET status = ?, return_reason = ?, return_note = ?, returned_at = datetime('now') WHERE id = ?"
    ).run(ORDER_STATUS.RETURN_COMPLETED, reason, note, orderId);
  });

  try {
    run();
    return { success: true, message: "반품이 완료되었습니다." };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export function requestExchange(
  orderId: string,
  sessionId: string,
  reason: string,
  note: string
): { success: boolean; message: string } {
  const db = getDb();

  const run = db.transaction(() => {
    const order = db.prepare(
      "SELECT * FROM orders WHERE id = ? AND session_id = ?"
    ).get(orderId, sessionId) as Order | undefined;

    if (!order) throw new Error("주문을 찾을 수 없습니다.");
    if (!isReturnable(order.status)) {
      throw new Error(`현재 상태(${order.status})에서는 교환할 수 없습니다.`);
    }

    // Update order status (no stock/wallet changes)
    db.prepare(
      "UPDATE orders SET status = ?, return_reason = ?, return_note = ?, returned_at = datetime('now') WHERE id = ?"
    ).run(ORDER_STATUS.EXCHANGE_COMPLETED, reason, note, orderId);
  });

  try {
    run();
    return { success: true, message: "교환이 완료되었습니다." };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}
