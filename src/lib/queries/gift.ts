import { getDb } from "../db";
import { v4 as uuidv4 } from "uuid";
import { generateOrderNumber, calculateShippingFee } from "../utils";
import { WALLET_TX_TYPE } from "../constants";
import { getOrCreateWallet } from "./wallet";

export type GiftAddressMode = "sender" | "recipient";

export interface GiftItem {
  sku_id: string;
  product_id: string;
  product_name: string;
  option_summary: string;
  price: number;
  stock: number;
  image_url: string;
}

// 선물 플로우 화면에서 상품 요약을 표시하기 위한 SKU 단건 조회
export function getGiftItem(skuId: string): GiftItem | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT s.id as sku_id, s.price, s.stock,
      p.id as product_id, p.name as product_name, p.image_url,
      COALESCE(GROUP_CONCAT(ov.name, ' / '), '') as option_summary
    FROM skus s
    JOIN products p ON p.id = s.product_id
    LEFT JOIN sku_option_values sov ON sov.sku_id = s.id
    LEFT JOIN option_values ov ON ov.id = sov.option_value_id
    WHERE s.id = ?
    GROUP BY s.id
  `).get(skuId) as GiftItem | undefined;
  return row ?? null;
}

interface GiftCheckoutInput {
  sessionId: string;
  skuId: string;
  quantity: number;
  recipientName: string;
  recipientPhone: string;
  addressMode: GiftAddressMode;
  addressLine1: string;
  addressLine2: string;
  senderName: string;
  senderPhone: string;
  giftMessage: string;
  pointsApplied?: number;
}

interface GiftCheckoutResult {
  success: boolean;
  message: string;
  orderId?: string;
  orderNumber?: string;
}

// 선물하기 결제 — processCheckout 미러. 단일 SKU를 직접 받아 주문 생성(장바구니 비경유).
export function processGiftCheckout(input: GiftCheckoutInput): GiftCheckoutResult {
  const db = getDb();

  const checkout = db.transaction(() => {
    // 1. SKU + 상품 + 옵션 조회 (장바구니와 동일한 조인으로 스냅샷 확보)
    const sku = db.prepare(`
      SELECT s.id as sku_id, s.price, s.stock, s.sku_code,
        p.name as product_name, p.id as product_id, p.image_url as image_url,
        COALESCE(GROUP_CONCAT(ov.name, ' / '), '') as option_summary
      FROM skus s
      JOIN products p ON p.id = s.product_id
      LEFT JOIN sku_option_values sov ON sov.sku_id = s.id
      LEFT JOIN option_values ov ON ov.id = sov.option_value_id
      WHERE s.id = ?
      GROUP BY s.id
    `).get(input.skuId) as {
      sku_id: string;
      price: number;
      stock: number;
      sku_code: string;
      product_name: string;
      product_id: string;
      image_url: string;
      option_summary: string;
    } | undefined;

    if (!sku) {
      throw new Error("상품을 찾을 수 없습니다.");
    }

    const quantity = Math.max(1, Math.floor(input.quantity));

    // 2. 재고 검증
    if (sku.stock < quantity) {
      throw new Error(`"${sku.product_name}" 재고가 부족합니다. (재고: ${sku.stock}개, 주문: ${quantity}개)`);
    }

    // 3. 금액 계산
    const productTotal = sku.price * quantity;
    const shippingFee = calculateShippingFee(productTotal);
    const totalAmount = productTotal + shippingFee;
    const chargedAmount = Math.max(0, totalAmount - (input.pointsApplied ?? 0));

    // 4. 지갑 잔액 확인
    const wallet = getOrCreateWallet(input.sessionId);
    if (wallet.balance < chargedAmount) {
      throw new Error(`잔액이 부족합니다. (잔액: ${wallet.balance.toLocaleString()}원, 결제금액: ${chargedAmount.toLocaleString()}원)`);
    }

    // 5. 원자적 처리
    // 5a. 지갑 차감
    const newBalance = wallet.balance - chargedAmount;
    db.prepare("UPDATE wallets SET balance = ? WHERE id = ?").run(newBalance, wallet.id);

    // 5b. 재고 차감 (WHERE 가드)
    const result = db.prepare(
      "UPDATE skus SET stock = stock - ? WHERE id = ? AND stock >= ?"
    ).run(quantity, sku.sku_id, quantity);
    if (result.changes === 0) {
      throw new Error(`"${sku.product_name}" 재고 차감에 실패했습니다.`);
    }

    // 5c. 주문 생성 (선물 필드 포함)
    const orderId = uuidv4();
    const orderNumber = generateOrderNumber();
    db.prepare(`
      INSERT INTO orders (
        id, order_number, session_id, status,
        recipient_name, recipient_phone, address_line1, address_line2,
        product_total, shipping_fee, total_amount,
        is_gift, sender_name, sender_phone, gift_message, gift_address_mode
      )
      VALUES (?, ?, ?, '결제완료', ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
    `).run(
      orderId, orderNumber, input.sessionId,
      input.recipientName, input.recipientPhone, input.addressLine1, input.addressLine2,
      productTotal, shippingFee, totalAmount,
      input.senderName, input.senderPhone, input.giftMessage, input.addressMode
    );

    // 5d. 주문 상품 스냅샷 (1건)
    db.prepare(
      "INSERT INTO order_items (id, order_id, sku_id, product_id, product_name, option_summary, image_url, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(uuidv4(), orderId, sku.sku_id, sku.product_id, sku.product_name, sku.option_summary, sku.image_url ?? "", sku.price, quantity, productTotal);

    // 5e. 지갑 거래 기록
    db.prepare(
      "INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(uuidv4(), wallet.id, WALLET_TX_TYPE.PAYMENT, chargedAmount, newBalance, "선물 결제", orderId);

    // 선물하기는 장바구니를 비우지 않음 (카트 비경유)
    return { orderId, orderNumber };
  });

  try {
    const result = checkout();
    return { success: true, message: "선물 결제가 완료되었습니다.", ...result };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}
