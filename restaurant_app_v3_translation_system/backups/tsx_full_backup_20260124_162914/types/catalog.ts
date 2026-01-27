export type CatalogProduct = {
  id: number;
  name: string;
  name_en?: string;
  category?: string;
  price?: number;
  cost_price?: number | null;
  vat_rate?: number;
  unit?: string;
  preparation_section?: string;
  for_sale?: number | boolean;
  is_active?: number | boolean;
  has_recipe?: number | boolean;
  stock_management?: string;
  image_url?: string | null;
  display_order?: number | null;
  description?: string | null;
  description_en?: string | null;
  allergens?: string | null;
  allergens_computed?: string | null;
  ingredients?: string | null;
};

export type CatalogCategory = {
  id: number;
  name: string;
  name_en?: string | null;
  parent_id?: number | null;
  icon?: string | null;
  display_order?: number | null;
  is_active?: number | boolean;
  is_expanded?: number | boolean;
  product_count?: number;
  children?: CatalogCategory[];
};
