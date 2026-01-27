/**
 * PHASE S10 - Order API Client
 * 
 * HTTP API client for order operations (menu, cart, order creation).
 */

import axios from 'axios';
import type { MenuItem } from '../orderStore';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Get all menu items
 */
export async function getMenuItems(lang: string = 'ro'): Promise<MenuItem[]> {
  const response = await axios.get(`${API_BASE}/menu/all?lang=${lang}`);
  return response.data.menu || response.data || [];
}

/**
 * Get categories
 */
export async function getCategories(lang: string = 'ro'): Promise<Array<{ id: number; name: string; name_en?: string }>> {
  const response = await axios.get(`${API_BASE}/menu/categories?lang=${lang}`);
  return response.data.categories || response.data || [];
}

/**
 * Create order
 */
export async function createOrder(payload: {
  items: Array<{
    product_id: number;
    quantity: number;
    customizations?: Array<{ id: number }>;
    isFree?: boolean;
  }>;
  table?: string | number;
  type?: 'dine_in' | 'takeout' | 'delivery';
  notes?: string;
  total: number;
}): Promise<{ success: boolean; orderId: number }> {
  const response = await axios.post(`${API_BASE}/orders/create`, payload);
  return response.data;
}

/**
 * Get tables
 */
export async function getTables(): Promise<Array<{ id: number; number: string; status?: string }>> {
  const response = await axios.get(`${API_BASE}/tables`);
  return response.data.tables || response.data || [];
}

