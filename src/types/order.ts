export interface Order {
  id: string;
  order_number: string;
  session_id: string;
  status: string;
  recipient_name: string;
  recipient_phone: string;
  address_line1: string;
  address_line2: string;
  product_total: number;
  shipping_fee: number;
  total_amount: number;
  payment_method: string;
  expected_delivery_date: string | null;
  created_at: string;
  cancelled_at: string | null;
  return_reason: string | null;
  return_note: string;
  returned_at: string | null;
  is_gift: number;
  sender_name: string;
  sender_phone: string;
  gift_message: string;
  gift_address_mode: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  sku_id: string;
  product_name: string;
  option_summary: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
}
