import { useMemo } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { RecipeProductSummary } from '@/types/recipes';

type RecipesSummaryResponse = {
  success?: boolean;
  products?: RecipeProductSummary[];
};

export function useRecipesSummary() {
  const { data, loading, error, refetch } = useApiQuery<RecipesSummaryResponse | RecipeProductSummary[]>('/api/recipes/all');

  const products = useMemo<RecipeProductSummary[]>(() => {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.products)) {
      return data.products;
    }
    return [];
  }, [data]);

  const withRecipe = useMemo(() => products.filter((product) => product.recipe_count > 0).length, [products]);
  const withoutRecipe = useMemo(() => products.length - withRecipe, [products, withRecipe]);

  return {
    products,
    loading,
    error,
    refetch,
    stats: {
      total: products.length,
      withRecipe,
      withoutRecipe,
    },
  };
}


