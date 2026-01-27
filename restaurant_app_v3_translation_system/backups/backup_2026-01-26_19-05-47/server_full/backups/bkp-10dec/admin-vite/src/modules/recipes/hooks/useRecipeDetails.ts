import { useMemo } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { RecipeDetailsResponse, RecipeIngredient } from '@/types/recipes';

export function useRecipeDetails(productId: number | null | undefined, isOpen: boolean) {
  const endpoint = useMemo(() => {
    if (!productId || !isOpen) {
      return null;
    }
    return `/api/recipes/product/${productId}`;
  }, [productId, isOpen]);

  const { data, loading, error, refetch } = useApiQuery<RecipeDetailsResponse>(endpoint);

  const ingredients: RecipeIngredient[] = useMemo(() => {
    if (!data || !Array.isArray(data.recipes)) {
      return [];
    }

    return data.recipes.map((recipe) => ({
      id: recipe.id,
      ingredient_id: recipe.ingredient_id,
      ingredient_name: recipe.ingredient_name,
      quantity_needed: recipe.quantity_needed,
      unit: recipe.unit ?? (recipe as { ingredient_unit?: string }).ingredient_unit ?? null,
      waste_percentage: recipe.waste_percentage ?? 0,
      variable_consumption: recipe.variable_consumption ?? null,
      item_type: recipe.item_type ?? 'ingredient',
    }));
  }, [data]);

  return {
    productName: data?.productName ?? '',
    ingredients,
    loading,
    error,
    refetch,
  };
}


