// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect, useCallback } from 'react';

interface DailyMenu {
  soup: {
    id: number;
    name: string;
    name_en?: string;
    description?: string;
    description_en?: string;
    price: number;
    category: string;
    image_url?: string;
    allergens?: string;
    allergens_en?: string;
  };
  mainCourse: {
    id: number;
    name: string;
    name_en?: string;
    description?: string;
    description_en?: string;
    price: number;
    category: string;
    image_url?: string;
    allergens?: string;
    allergens_en?: string;
  };
  discount: number;
}

export const useDailyMenu = () => {
  const [dailyMenu, setDailyMenu] = useState<DailyMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get daily menu
  const getDailyMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/daily-menu');
      if (response.ok) {
        const data: DailyMenu = await response.json();
        setDailyMenu(data);
        return data;
      } else {
        setError('No daily menu available today');
        setDailyMenu(null);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading daily menu';
      setError(errorMessage);
      setDailyMenu(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    getDailyMenu();
  }, [getDailyMenu]);

  return {
    dailyMenu,
    loading,
    error,
    getDailyMenu
  };
};


