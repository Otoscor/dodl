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

export interface Nutrition {
  calories: number; // kcal
  protein: number; // g
  sugar: number; // g
  fat: number; // g
}

export interface ProductListItem extends Product {
  min_price: number;
  max_price: number;
  all_sold_out: boolean;
  category_name: string;
  review_count: number;
  average_rating: number;
  key_specs: string[];
  brand: string;
  nutrition: Nutrition | null;
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

export interface Review {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  body: string;
  photo_urls: string[];
  created_at: string;
}

export interface ReviewSummary {
  average_rating: number;
  review_count: number;
  rating_distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

export interface ProductDetailInfo {
  shipping: string;
  keySpecs: string[];
  dosage: string;
  caution: string;
  manufacturer: string;
  brand?: string;
  nutrition?: Nutrition;
}

export interface ProductDetail extends Product {
  category_name: string;
  option_groups: OptionGroup[];
  skus: Sku[];
  review_summary: ReviewSummary;
  detail_info: ProductDetailInfo;
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
