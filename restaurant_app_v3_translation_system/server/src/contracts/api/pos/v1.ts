/**
 * POS API v1 - STABLE CONTRACT
 * 
 * ⚠️ CRITICAL: Acest contract este folosit de:
 * - POS (Point of Sale) - runtime critical
 * - Fiscal printers
 * - Payment gateways
 * 
 * ❌ NU MODIFICA acest contract!
 * ✅ Dacă trebuie să adaugi funcționalități noi, folosește v2
 */

import { OrderStatus, OrderSource, OrderType } from '../../enums';

/**
 * POS API v1 - Endpoints
 */
export const POS_API_V1_ENDPOINTS = {
  // Orders
  GET_ORDER: '/api/pos/order/:id',
  CREATE_ORDER: '/api/pos/order',
  UPDATE_ORDER: '/api/pos/order/:id',
  CANCEL_ORDER: '/api/pos/order/:id/cancel',
  
  // Payments
  CREATE_PAYMENT: '/api/pos/payment',
  GET_PAYMENT: '/api/pos/payment/:id',
  
  // Tables
  GET_TABLES: '/api/pos/tables',
  GET_TABLE_STATUS: '/api/pos/table/:id/status',
  UPDATE_TABLE_STATUS: '/api/pos/table/:id/status',
  
  // Menu
  GET_MENU: '/api/pos/menu',
  GET_PRODUCT: '/api/pos/product/:id',
  
  // Fiscal
  FISCALIZE_ORDER: '/api/pos/order/:id/fiscalize',
} as const;

/**
 * POS API v1 - Request/Response Types
 */

// GET /api/pos/order/:id
export interface GetOrderRequest {
  id: number | string;
}

export interface GetOrderResponse {
  id: number;
  code?: string | null;
  status: OrderStatus;
  type: OrderType | null;
  source: OrderSource;
  table?: string | number | null;
  waiter_id?: number | null;
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
  is_paid: boolean;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
}

// POST /api/pos/order
export interface CreateOrderRequest {
  type: OrderType;
  table?: string | number | null;
  waiter_id?: number | null;
  items: Array<{
    product_id: number;
    qty: number;
    unit_price: number;
    notes?: string | null;
  }>;
  notes?: string | null;
}

export interface CreateOrderResponse {
  id: number;
  code?: string | null;
  status: OrderStatus;
  // ... rest of order fields
}

// POST /api/pos/payment
export interface CreatePaymentRequest {
  order_id: number;
  amount: number;
  method: 'cash' | 'card' | 'voucher' | 'split';
  reference?: string | null;
}

export interface CreatePaymentResponse {
  id: number;
  order_id: number;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed';
  fiscal_receipt?: string | null;
  created_at: string;
}

// GET /api/pos/tables
export interface GetTablesResponse {
  tables: Array<{
    id: number;
    name: string;
    status: 'free' | 'occupied' | 'reserved';
    order_id?: number | null;
    waiter_id?: number | null;
  }>;
}

// POST /api/pos/order/:id/fiscalize
export interface FiscalizeOrderRequest {
  id: number;
}

export interface FiscalizeOrderResponse {
  success: boolean;
  fiscal_receipt?: string | null;
  error?: string | null;
}

/**
 * POS API v1 - Validators
 * (folosește zod sau ajv pentru validare)
 */

export const POS_API_V1_VALIDATORS = {
  // Validators vor fi implementate cu zod/ajv
  // Exemplu:
  // GetOrderRequest: z.object({ id: z.union([z.number(), z.string()]) }),
} as const;

