export interface CartItem {
  id: string;
  session_id: string;
  sku_id: string;
  quantity: number;
  added_at: string;
  product_id: string;
  product_name: string;
  product_image: string;
  sku_code: string;
  price: number;
  stock: number;
  option_summary: string;
}

export interface CartSummary {
  items: CartItem[];
  product_total: number;
  shipping_fee: number;
  total_amount: number;
  item_count: number;
}
