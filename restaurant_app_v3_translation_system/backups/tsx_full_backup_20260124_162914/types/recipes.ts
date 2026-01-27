export type Recipe = {
  id: number;
  name: string;
  code?: string;
  category?: string;
  cost_per_serving?: number;
  allergens?: string[];
  updated_at?: string;
};

export type RecipeProductSummary = {
  product_id: number;
  product_name: string;
  product_category: string;
  recipe_count: number;
  servings?: number; // Number of servings/portions this recipe produces
};

export type RecipeIngredient = {
  id?: number;
  ingredient_id?: number;
  ingredient_name: string;
  quantity_needed: number;
  unit?: string | null;
  waste_percentage?: number | null;
  variable_consumption?: string | null;
  item_type?: string;
};

export type RecipeDetailsResponse = {
  success?: boolean;
  productName?: string;
  recipes: RecipeIngredient[];
};

