export type IngredientTraceRecord = {
  order_id: number;
  order_timestamp?: string;
  batch_id?: number;
  batch_number?: string;
  quantity_used?: number;
  supplier?: string | null;
  order_status?: string | null;
  is_paid?: number | boolean;
};
