import { getDb } from "../db";
import { v4 as uuidv4 } from "uuid";
import { calculateShippingFee } from "../utils";
import type { CartItem, CartSummary } from "@/types/cart";

export function getCart(sessionId: string): CartSummary {
  const db = getDb();
  const items = db.prepare(`
    SELECT ci.*,
      p.id as product_id,
      p.name as product_name,
      p.image_url as product_image,
      s.sku_code,
      s.price,
      s.stock,
      COALESCE(GROUP_CONCAT(ov.name, ' / '), '') as option_summary
    FROM cart_items ci
    JOIN skus s ON s.id = ci.sku_id
    JOIN products p ON p.id = s.product_id
    LEFT JOIN sku_option_values sov ON sov.sku_id = s.id
    LEFT JOIN option_values ov ON ov.id = sov.option_value_id
    LEFT JOIN option_groups og ON og.id = ov.option_group_id
    WHERE ci.session_id = ?
    GROUP BY ci.id
    ORDER BY ci.added_at DESC
  `).all(sessionId) as CartItem[];

  const productTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = items.length > 0 ? calculateShippingFee(productTotal) : 0;

  return {
    items,
    product_total: productTotal,
    shipping_fee: shippingFee,
    total_amount: productTotal + shippingFee,
    item_count: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export function addToCart(sessionId: string, skuId: string, quantity: number): { success: boolean; message: string } {
  const db = getDb();

  const sku = db.prepare("SELECT * FROM skus WHERE id = ? AND is_active = 1").get(skuId) as { stock: number } | undefined;
  if (!sku) return { success: false, message: "상품을 찾을 수 없습니다." };
  if (sku.stock === 0) return { success: false, message: "품절된 상품입니다." };

  const existing = db.prepare(
    "SELECT * FROM cart_items WHERE session_id = ? AND sku_id = ?"
  ).get(sessionId, skuId) as { id: string; quantity: number } | undefined;

  if (existing) {
    const newQty = Math.min(existing.quantity + quantity, sku.stock);
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(newQty, existing.id);
  } else {
    const qty = Math.min(quantity, sku.stock);
    db.prepare(
      "INSERT INTO cart_items (id, session_id, sku_id, quantity) VALUES (?, ?, ?, ?)"
    ).run(uuidv4(), sessionId, skuId, qty);
  }

  return { success: true, message: "장바구니에 담았습니다." };
}

export function updateCartItemQuantity(cartItemId: string, sessionId: string, quantity: number): { success: boolean; message: string } {
  const db = getDb();

  const item = db.prepare(`
    SELECT ci.*, s.stock FROM cart_items ci
    JOIN skus s ON s.id = ci.sku_id
    WHERE ci.id = ? AND ci.session_id = ?
  `).get(cartItemId, sessionId) as { stock: number } | undefined;

  if (!item) return { success: false, message: "장바구니 항목을 찾을 수 없습니다." };
  if (quantity < 1) return { success: false, message: "최소 수량은 1개입니다." };
  if (quantity > item.stock) return { success: false, message: `재고가 부족합니다. (최대 ${item.stock}개)` };

  db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(quantity, cartItemId);
  return { success: true, message: "수량이 변경되었습니다." };
}

export function removeCartItem(cartItemId: string, sessionId: string): boolean {
  const result = getDb().prepare(
    "DELETE FROM cart_items WHERE id = ? AND session_id = ?"
  ).run(cartItemId, sessionId);
  return result.changes > 0;
}

export function clearCart(sessionId: string) {
  getDb().prepare("DELETE FROM cart_items WHERE session_id = ?").run(sessionId);
}
