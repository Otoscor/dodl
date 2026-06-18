import { getDb } from "../db";
import { v4 as uuidv4 } from "uuid";
import { generateOrderNumber, calculateShippingFee } from "../utils";
import { WALLET_TX_TYPE } from "../constants";
import { getOrCreateWallet } from "./wallet";

interface CheckoutInput {
  sessionId: string;
  recipientName: string;
  recipientPhone: string;
  addressLine1: string;
  addressLine2: string;
  pointsApplied?: number;
}

interface CheckoutResult {
  success: boolean;
  message: string;
  orderId?: string;
  orderNumber?: string;
}

export function processCheckout(input: CheckoutInput): CheckoutResult {
  const db = getDb();

  const checkout = db.transaction(() => {
    // 1. Get cart items with current SKU data
    const cartItems = db.prepare(`
      SELECT ci.id as cart_item_id, ci.quantity,
        s.id as sku_id, s.price, s.stock, s.sku_code,
        p.name as product_name, p.id as product_id, p.image_url as image_url,
        COALESCE(GROUP_CONCAT(ov.name, ' / '), '') as option_summary
      FROM cart_items ci
      JOIN skus s ON s.id = ci.sku_id
      JOIN products p ON p.id = s.product_id
      LEFT JOIN sku_option_values sov ON sov.sku_id = s.id
      LEFT JOIN option_values ov ON ov.id = sov.option_value_id
      WHERE ci.session_id = ?
      GROUP BY ci.id
    `).all(input.sessionId) as {
      cart_item_id: string;
      quantity: number;
      sku_id: string;
      price: number;
      stock: number;
      sku_code: string;
      product_name: string;
      product_id: string;
      image_url: string;
      option_summary: string;
    }[];

    if (cartItems.length === 0) {
      throw new Error("장바구니가 비어있습니다.");
    }

    // 2. Verify stock
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        throw new Error(`"${item.product_name}" 재고가 부족합니다. (재고: ${item.stock}개, 주문: ${item.quantity}개)`);
      }
    }

    // 3. Calculate totals
    const productTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = calculateShippingFee(productTotal);
    const totalAmount = productTotal + shippingFee;
    const chargedAmount = Math.max(0, totalAmount - (input.pointsApplied ?? 0));

    // 4. Check wallet balance
    const wallet = getOrCreateWallet(input.sessionId);
    if (wallet.balance < chargedAmount) {
      throw new Error(`잔액이 부족합니다. (잔액: ${wallet.balance.toLocaleString()}원, 결제금액: ${chargedAmount.toLocaleString()}원)`);
    }

    // 5. Atomic processing
    // 5a. Deduct wallet balance
    const newBalance = wallet.balance - chargedAmount;
    db.prepare("UPDATE wallets SET balance = ? WHERE id = ?").run(newBalance, wallet.id);

    // 5b. Deduct stock (double safety with WHERE clause)
    for (const item of cartItems) {
      const result = db.prepare(
        "UPDATE skus SET stock = stock - ? WHERE id = ? AND stock >= ?"
      ).run(item.quantity, item.sku_id, item.quantity);

      if (result.changes === 0) {
        throw new Error(`"${item.product_name}" 재고 차감에 실패했습니다.`);
      }
    }

    // 5c. Create order
    const orderId = uuidv4();
    const orderNumber = generateOrderNumber();
    db.prepare(`
      INSERT INTO orders (id, order_number, session_id, status, recipient_name, recipient_phone, address_line1, address_line2, product_total, shipping_fee, total_amount)
      VALUES (?, ?, ?, '결제완료', ?, ?, ?, ?, ?, ?, ?)
    `).run(orderId, orderNumber, input.sessionId, input.recipientName, input.recipientPhone, input.addressLine1, input.addressLine2, productTotal, shippingFee, totalAmount);

    // 5d. Create order items (snapshot)
    const insertOrderItem = db.prepare(
      "INSERT INTO order_items (id, order_id, sku_id, product_name, option_summary, image_url, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const item of cartItems) {
      insertOrderItem.run(uuidv4(), orderId, item.sku_id, item.product_name, item.option_summary, item.image_url ?? "", item.price, item.quantity, item.price * item.quantity);
    }

    // 5e. Record wallet transaction
    db.prepare(
      "INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(uuidv4(), wallet.id, WALLET_TX_TYPE.PAYMENT, chargedAmount, newBalance, "주문 결제", orderId);

    // 5f. Clear cart
    db.prepare("DELETE FROM cart_items WHERE session_id = ?").run(input.sessionId);

    return { orderId, orderNumber };
  });

  try {
    const result = checkout();
    return { success: true, message: "결제가 완료되었습니다.", ...result };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}
