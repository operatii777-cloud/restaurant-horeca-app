/**
 * Kiosk API v1 - STABLE CONTRACT
 * 
 * ⚠️ CRITICAL: Acest contract este folosit de:
 * - Kiosk (Self-service) - runtime critical
 * - QR Ordering (mobile)
 * 
 * ❌ NU MODIFICA acest contract!
 * ✅ Dacă trebuie să adaugi funcționalități noi, folosește v2
 */

import { OrderStatus, OrderSource, OrderType } from '../../enums';

/**
 * Kiosk API v1 - Endpoints
 */
export const KIOSK_API_V1_ENDPOINTS = {
  // Orders
  CREATE_ORDER: '/api/kiosk/order',
  GET_ORDER: '/api/kiosk/order/:id',
  GET_ORDER_STATUS: '/api/kiosk/order/:id/status',
  
  // Menu
  GET_MENU: '/api/kiosk/menu',
  GET_PRODUCT: '/api/kiosk/product/:id',
  
  // Checkout
  CHECKOUT: '/api/kiosk/checkout',
  
  // Payment
  CREATE_PAYMENT: '/api/kiosk/payment',
} as const;

/**
 * Kiosk API v1 - Request/Response Types
 */

// POST /api/kiosk/order
export interface CreateKioskOrderRequest {
  type: OrderType;
  items: Array<{
    product_id: number;
    qty: number;
    customizations?: any[];
  }>;
  customer?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
  notes?: string | null;
}

export interface CreateKioskOrderResponse {
  id: number;
  code?: string | null;
  status: OrderStatus;
  type: OrderType;
  source: OrderSource;
  items: Array<{
    id: number;
    product_id: number;
    name: string;
    qty: number;
    unit_price: number;
    total: number;
  }>;
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
  created_at: string;
}

// GET /api/kiosk/order/:id/status
export interface GetKioskOrderStatusRequest {
  id: number | string;
}

export interface GetKioskOrderStatusResponse {
  id: number;
  status: OrderStatus;
  is_paid: boolean;
  is_cancelled: boolean;
  estimated_ready_time?: string | null;
}

// POST /api/kiosk/checkout
export interface KioskCheckoutRequest {
  order_id: number;
  payment_method: 'cash' | 'card' | 'qr';
}

export interface KioskCheckoutResponse {
  success: boolean;
  payment_id?: number | null;
  fiscal_receipt?: string | null;
  error?: string | null;
}

// GET /api/kiosk/menu
export interface GetKioskMenuResponse {
  categories: Array<{
    id: number;
    name: string;
    products: Array<{
      id: number;
      name: string;
      description?: string | null;
      price: number;
      image?: string | null;
      available: boolean;
    }>;
  }>;
}

