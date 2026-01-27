export type Ingredient = {
  id: number;
  name: string;
  name_en?: string | null;
  official_name?: string | null;
  unit?: string;
  category?: string;
  category_en?: string | null;
  current_stock?: number;
  min_stock?: number;
  max_stock?: number;  // ✅ SĂPTĂMÂNA 1 - ZIUA 4
  safety_stock?: number;  // ✅ SĂPTĂMÂNA 1 - ZIUA 4
  reorder_quantity?: number;  // ✅ SĂPTĂMÂNA 1 - ZIUA 4
  purchase_unit?: string | null;  // ✅ SĂPTĂMÂNA 2 - ZIUA 4
  recipe_unit?: string | null;  // ✅ SĂPTĂMÂNA 2 - ZIUA 4
  inventory_unit?: string | null;  // ✅ SĂPTĂMÂNA 2 - ZIUA 4
  purchase_to_inventory_factor?: number | null;  // ✅ SĂPTĂMÂNA 2 - ZIUA 4
  inventory_to_recipe_factor?: number | null;  // ✅ SĂPTĂMÂNA 2 - ZIUA 4
  cost_per_unit?: number;
  supplier?: string;
  is_hidden?: number | boolean;
  location_id?: number;
  origin_country?: string | null;
  default_supplier_id?: number | null;
  description?: string | null;
  haccp_notes?: string | null;
  traceability_code?: string | null;
  storage_temp_min?: number | null;
  storage_temp_max?: number | null;
  energy_kcal?: number | null;
  fat?: number | null;
  saturated_fat?: number | null;
  carbs?: number | null;
  sugars?: number | null;
  protein?: number | null;
  salt?: number | null;
  fiber?: number | null;
  additives?: string | null;
  allergens?: string | null;
  potential_allergens?: string | null;
  notes?: string | null;
  last_updated?: string | null;
};
