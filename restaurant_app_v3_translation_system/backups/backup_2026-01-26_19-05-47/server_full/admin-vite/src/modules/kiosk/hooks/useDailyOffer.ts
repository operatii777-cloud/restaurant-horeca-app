// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect, useCallback } from 'react';

interface DailyOffer {
  id: number;
  title: string;
  description: string;
  title_en?: string;
  description_en?: string;
  is_active: boolean;
  benefit_type: 'category' | 'specific';
  benefit_category?: string;
  benefit_quantity?: number;
  conditions: Array<{
    id: number;
    category: string;
    quantity: number;
    products: Array<{
      id: number;
      name: string;
      price: number;
      category: string;
      image_url?: string;
    }>;
  }>;
  benefit_products: Array<{
    id: number;
    name: string;
    price: number;
    category: string;
    image_url?: string;
  }>;
}

interface CartItem {
  id: number;
  category: string;
  quantity: number;
  price: number;
}

interface CheckResult {
  hasOffer: boolean;
  discountItem: {
    itemId: number;
    category: string;
    name: string;
  } | null;
}

export const useDailyOffer = () => {
  const [dailyOffer, setDailyOffer] = useState<DailyOffer | null>(null);
  const [loading, setLoading] = useState(false);

  // Get active daily offer
  const getDailyOffer = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/daily-offer');
      if (response.ok) {
        const data = await response.json();
        setDailyOffer(data.offer || null);
        return data.offer || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting daily offer:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if cart is eligible for daily offer
  const checkEligibility = useCallback(async (cartItems: CartItem[]) => {
    if (!cartItems || cartItems.length === 0) {
      return {
        hasOffer: false,
        discountItem: null
      };
    }

    try {
      const response = await fetch('/api/daily-offer/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cartItems })
      });

      if (response.ok) {
        const data: CheckResult = await response.json();
        return data;
      }
      return {
        hasOffer: false,
        discountItem: null
      };
    } catch (error) {
      console.error('Error checking daily offer eligibility:', error);
      return {
        hasOffer: false,
        discountItem: null
      };
    }
  }, []);

  // Load on mount
  useEffect(() => {
    getDailyOffer();
  }, [getDailyOffer]);

  return {
    dailyOffer,
    loading,
    getDailyOffer,
    checkEligibility
  };
};


