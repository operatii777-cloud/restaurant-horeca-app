export type IngredientBatch = {
  id: number;
  ingredient_id: number;
  batch_number?: string;
  quantity?: number;
  remaining_quantity?: number;
  purchase_date?: string;
  expiry_date?: string;
  supplier?: string;
  invoice_number?: string;
  unit_cost?: number;
  origin_country?: string | null;
  document_path?: string | null;
};
