import { useCallback, useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import { httpClient } from '@/shared/api/httpClient';
import type { CatalogProduct } from '@/types/catalog';
import type { DailyMenuCurrent, DailyMenuException, DailyMenuSchedule } from '@/types/dailyMenu';

type LoadingState = {
  products: boolean;
  current: boolean;
  schedules: boolean;
  exceptions: boolean;
};

type ErrorState = {
  products: string | null;
  current: string | null;
  schedules: string | null;
  exceptions: string | null;
};

export type UseDailyMenuDataResult = {
  products: CatalogProduct[];
  currentMenu: DailyMenuCurrent | null;
  schedules: DailyMenuSchedule[];
  exceptions: DailyMenuException[];
  loading: LoadingState;
  errors: ErrorState;
  refreshProducts: () => Promise<void>;
  refreshCurrentMenu: () => Promise<void>;
  refreshSchedules: () => Promise<void>;
  refreshExceptions: () => Promise<void>;
};

const initialLoading: LoadingState = {
  products: false,
  current: false,
  schedules: false,
  exceptions: false,
};

const initialErrors: ErrorState = {
  products: null,
  current: null,
  schedules: null,
  exceptions: null,
};

export const useDailyMenuData = (): UseDailyMenuDataResult => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [currentMenu, setCurrentMenu] = useState<DailyMenuCurrent | null>(null);
  const [schedules, setSchedules] = useState<DailyMenuSchedule[]>([]);
  const [exceptions, setExceptions] = useState<DailyMenuException[]>([]);
  const [loading, setLoading] = useState<LoadingState>(initialLoading);
  const [errors, setErrors] = useState<ErrorState>(initialErrors);

  const fetchProducts = useCallback(async () => {
    setLoading((prev) => ({ ...prev, products: true }));
    try {
      const response = await httpClient.get('/api/admin/menu');
      const payload = response.data;
      const parsed: CatalogProduct[] = Array.isArray(payload?.products)
        ? payload.products
        : Array.isArray(payload)
          ? payload
          : [];
      setProducts(parsed);
      setErrors((prev) => ({ ...prev, products: null }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nu am putut încărca produsele disponibile.';
      setErrors((prev) => ({ ...prev, products: message }));
      setProducts([]);
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  }, []);

  const fetchCurrentMenu = useCallback(async () => {
    setLoading((prev) => ({ ...prev, current: true }));
    try {
      const response = await httpClient.get<DailyMenuCurrent>('/api/daily-menu');
      setCurrentMenu(response.data);
      setErrors((prev) => ({ ...prev, current: null }));
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError?.response?.status === 404) {
        setCurrentMenu(null);
        setErrors((prev) => ({ ...prev, current: null }));
      } else {
        const message = axiosError?.message ?? 'Nu am putut încărca meniul zilei.';
        setErrors((prev) => ({ ...prev, current: message }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, current: false }));
    }
  }, []);

  const fetchSchedules = useCallback(async () => {
    setLoading((prev) => ({ ...prev, schedules: true }));
    try {
      const response = await httpClient.get<{ schedules?: DailyMenuSchedule[] } | DailyMenuSchedule[]>(
        '/api/admin/daily-menu/schedule',
      );
      const payload = Array.isArray(response.data) ? response.data : response.data?.schedules ?? [];
      setSchedules(payload);
      setErrors((prev) => ({ ...prev, schedules: null }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nu am putut încărca programările.';
      setErrors((prev) => ({ ...prev, schedules: message }));
      setSchedules([]);
    } finally {
      setLoading((prev) => ({ ...prev, schedules: false }));
    }
  }, []);

  const fetchExceptions = useCallback(async () => {
    setLoading((prev) => ({ ...prev, exceptions: true }));
    try {
      const response = await httpClient.get<{ exceptions?: DailyMenuException[] } | DailyMenuException[]>(
        '/api/admin/daily-menu/exceptions',
      );
      const payload = Array.isArray(response.data) ? response.data : response.data?.exceptions ?? [];
      setExceptions(payload);
      setErrors((prev) => ({ ...prev, exceptions: null }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nu am putut încărca excepțiile.';
      setErrors((prev) => ({ ...prev, exceptions: message }));
      setExceptions([]);
    } finally {
      setLoading((prev) => ({ ...prev, exceptions: false }));
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
    void fetchCurrentMenu();
    void fetchSchedules();
    void fetchExceptions();
  }, [fetchProducts, fetchCurrentMenu, fetchSchedules, fetchExceptions]);

  return {
    products,
    currentMenu,
    schedules,
    exceptions,
    loading,
    errors,
    refreshProducts: fetchProducts,
    refreshCurrentMenu: fetchCurrentMenu,
    refreshSchedules: fetchSchedules,
    refreshExceptions: fetchExceptions,
  };
};

