import { useMemo } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { MenuProduct } from '@/types/menu';

type TopCategoryEntry = {
  name: string;
  value: number;
  raw: number;
  color: string;
};

type TopProductEntry = {
  label: string;
  value: number;
};

export type MenuAnalytics = {
  totalProducts: number;
  vegetarianCount: number;
  spicyCount: number;
  takeoutOnlyCount: number;
  averagePrice: number;
  topCategories: TopCategoryEntry[];
  topPricedProducts: TopProductEntry[];
};

const palette = ['#2563eb', '#38bdf8', '#6366f1', '#f97316', '#22c55e', '#ec4899', '#facc15'];

const buildEndpoint = (category?: string) => {
  if (!category || category.trim() === '') {
    return '/api/admin/menu';
  }

  const searchParams = new URLSearchParams({ category: category.trim() });
  return `/api/admin/menu?${searchParams.toString()}`;
};

const sortProducts = (products: MenuProduct[]) => {
  return [...products].sort((a, b) => {
    const categoryCompare = (a.category ?? '').localeCompare(b.category ?? '', 'ro-RO', {
      sensitivity: 'base',
    });
    if (categoryCompare !== 0) {
      return categoryCompare;
    }

    const aDisplay = a.display_order ?? Number.MAX_SAFE_INTEGER;
    const bDisplay = b.display_order ?? Number.MAX_SAFE_INTEGER;
    if (aDisplay !== bDisplay) {
      return aDisplay - bDisplay;
    }

    return (a.name ?? '').localeCompare(b.name ?? '', 'ro-RO', { sensitivity: 'base' });
  });
};

const buildAnalytics = (products: MenuProduct[]): MenuAnalytics => {
  const totalProducts = products.length;

  if (totalProducts === 0) {
    return {
      totalProducts: 0,
      vegetarianCount: 0,
      spicyCount: 0,
      takeoutOnlyCount: 0,
      averagePrice: 0,
      topCategories: [],
      topPricedProducts: [],
    };
  }

  const vegetarianCount = products.filter((item) => item.is_vegetarian === 1 || item.is_vegetarian === true).length;
  const spicyCount = products.filter((item) => item.is_spicy === 1 || item.is_spicy === true).length;
  const takeoutOnlyCount = products.filter((item) => item.is_takeout_only === 1 || item.is_takeout_only === true).length;

  const averagePrice =
    products.reduce((sum, item) => {
      const price = Number(item.price ?? 0);
      return sum + (Number.isFinite(price) ? price : 0);
    }, 0) / totalProducts;

  const categoryMap = new Map<string, number>();
  products.forEach((product) => {
    const category = product.category?.trim();
    if (!category) return;
    categoryMap.set(category, (categoryMap.get(category) ?? 0) + 1);
  });

  const topCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count], index) => ({
      name,
      raw: count,
      value: Number(((count / totalProducts) * 100).toFixed(1)),
      color: palette[index % palette.length],
    }));

  const topPricedProducts = [...products]
    .filter((item) => Number.isFinite(item.price))
    .sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0))
    .slice(0, 6)
    .map((product) => ({
      label: product.name && product.name.length > 16 ? `${product.name.slice(0, 15)}…` : product.name ?? '',
      value: Number((product.price ?? 0).toFixed(2)),
    }));

  return {
    totalProducts,
    vegetarianCount,
    spicyCount,
    takeoutOnlyCount,
    averagePrice: Number(averagePrice.toFixed(2)),
    topCategories,
    topPricedProducts,
  };
};

export function useMenuProducts(category?: string) {
  const endpoint = useMemo(() => buildEndpoint(category), [category]);
  const { data, loading, error, refetch } = useApiQuery<MenuProduct[]>(endpoint);

  const products = useMemo<MenuProduct[]>(() => {
    if (!Array.isArray(data)) {
      return [];
    }
    return sortProducts(data);
  }, [data]);

  const analytics = useMemo<MenuAnalytics>(() => buildAnalytics(products), [products]);

  return {
    products,
    analytics,
    loading,
    error,
    refetch,
  };
}

