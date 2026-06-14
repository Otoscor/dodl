export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  image_url: string;
  base_price: number;
  is_active: number;
  created_at: string;
}

export interface ProductListItem extends Product {
  min_price: number;
  max_price: number;
  all_sold_out: boolean;
  category_name: string;
}

export interface OptionGroup {
  id: string;
  product_id: string;
  name: string;
  sort_order: number;
  values: OptionValue[];
}

export interface OptionValue {
  id: string;
  option_group_id: string;
  name: string;
  sort_order: number;
}

export interface Sku {
  id: string;
  product_id: string;
  sku_code: string;
  price: number;
  stock: number;
  is_active: number;
  created_at: string;
  option_values?: { group_name: string; value_name: string }[];
}

export interface ProductDetail extends Product {
  category_name: string;
  option_groups: OptionGroup[];
  skus: Sku[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  sort_order: number;
  is_active: number;
}
