// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect, useCallback } from 'react';

interface HappyHourSettings {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  days_of_week: string | string[];
  discount_percentage: number;
  discount_fixed: number;
  applicable_categories?: string;
  applicable_products?: string;
}

interface ActiveHappyHour {
  active: boolean;
  settings: HappyHourSettings[];
}

interface CartItem {
  productId: number;
  finalPrice: number;
  quantity: number;
  isFree?: boolean;
}

interface DiscountItem {
  productId: number;
  finalPrice: number;
  quantity: number;
  isFree?: boolean;
  originalPrice: number;
  discount: number;
}

interface DiscountResult {
  hasDiscount: boolean;
  totalDiscount: number;
  items: DiscountItem[];
  happyHourSettings: HappyHourSettings | null;
}

export const useHappyHour = () => {
  const [activeHappyHour, setActiveHappyHour] = useState<ActiveHappyHour | null>(null);
  const [discounts, setDiscounts] = useState<DiscountResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for active Happy Hour
  const checkActiveHappyHour = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/happyhour/active');
      if (response.ok) {
        const data: ActiveHappyHour = await response.json();
        setActiveHappyHour(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error checking active Happy Hour:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate discounts for cart items
  const calculateDiscounts = useCallback(async (cartItems: CartItem[]) => {
    if (!cartItems || cartItems.length === 0) {
      setDiscounts({
        hasDiscount: false,
        totalDiscount: 0,
        items: [],
        happyHourSettings: null
      });
      return null;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/happyhour/calculate-discounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cartItems })
      });

      if (response.ok) {
        const data: DiscountResult = await response.json();
        setDiscounts(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error calculating Happy Hour discounts:', error);
      setDiscounts({
        hasDiscount: false,
        totalDiscount: 0,
        items: [],
        happyHourSettings: null
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check on mount
  useEffect(() => {
    checkActiveHappyHour();
    // Refresh every minute
    const interval = setInterval(checkActiveHappyHour, 60000);
    return () => clearInterval(interval);
  }, [checkActiveHappyHour]);

  return {
    activeHappyHour,
    discounts,
    loading,
    checkActiveHappyHour,
    calculateDiscounts
  };
};


