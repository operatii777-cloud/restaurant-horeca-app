import { useMemo } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useSearchFilter } from '@/shared/hooks/useSearchFilter';
import type { Ingredient } from '@/types/ingredients';
import type { IngredientTraceRecord } from '@/types/traceability';

export type TraceabilityIngredientsStats = {
  totalIngredients: number;
  trackedWithLots: number;
  belowSafetyStock: number;
};

export type TraceabilityRecordStats = {
  totalRecords: number;
  paid: number;
  unpaid: number;
  totalQuantityUsed: number;
  uniqueOrders: number;
  suppliers: number;
};

export const getTraceabilityRecordStats = (
  records: IngredientTraceRecord[] | null | undefined,
): TraceabilityRecordStats => {
  if (!records || records.length === 0) {
    return {
      totalRecords: 0,
      paid: 0,
      unpaid: 0,
      totalQuantityUsed: 0,
      uniqueOrders: 0,
      suppliers: 0,
    };
  }

  const paid = records.filter((item) => item.is_paid === true || item.is_paid === 1).length;
  const unpaid = records.length - paid;
  const totalQuantityUsed = records.reduce((sum, record) => sum + (record.quantity_used ?? 0), 0);
  const uniqueOrders = new Set(records.map((item) => item.order_id)).size;
  const suppliers = new Set(records.map((item) => item.supplier).filter(Boolean)).size;

  return {
    totalRecords: records.length,
    paid,
    unpaid,
    totalQuantityUsed,
    uniqueOrders,
    suppliers,
  };
};

export const useTraceabilityGridData = (searchTerm: string | undefined) => {
  const { data: ingredientsData, loading: ingredientsLoading, error: ingredientsError, refetch: refetchIngredients } =
    useApiQuery<Ingredient[]>('/api/ingredients');
  const ingredients = useMemo(() => ingredientsData ?? [], [ingredientsData]);

  const selectors = useMemo(
    () => [
      (item: Ingredient) => item.name ?? '',
      (item: Ingredient) => item.category ?? '',
      (item: Ingredient) => item.unit ?? '',
      (item: Ingredient) => item.supplier ?? '',
    ],
    [],
  );

  const filteredIngredients = useSearchFilter(ingredients, searchTerm, selectors);

  const stats = useMemo<TraceabilityIngredientsStats>(() => {
    const totalIngredients = ingredients.length;
    const trackedWithLots = ingredients.filter((ingredient) => Number(ingredient.current_stock ?? 0) > 0).length;
    const belowSafetyStock = ingredients.filter((ingredient) => {
      const current = Number(ingredient.current_stock ?? 0);
      const min = Number(ingredient.min_stock ?? 0);
      return min > 0 && current <= min;
    }).length;

    return {
      totalIngredients,
      trackedWithLots,
      belowSafetyStock,
    };
  }, [ingredients]);

  return {
    ingredients,
    filteredIngredients,
    ingredientsLoading,
    ingredientsError,
    refetchIngredients,
    stats,
  };
};