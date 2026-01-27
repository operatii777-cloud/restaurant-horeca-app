/**
 * PHASE S10 - Orders API Client
 * 
 * HTTP API client for order operations.
 * Uses S9 Order Engine V2 endpoints.
 */

import axios from 'axios';
import type { CanonicalOrder } from '../../types/order';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Create a new order
 */
export async function createOrder(payload: {
  type?: 'dine_in' | 'takeout' | 'delivery' | 'drive_thru';
  items: any[];
  table?: string | number;
  customer?: {
    name?: string;
    phone?: string;
  };
  delivery?: {
    address?: string;
    zone_id?: number;
  };
  drive_thru?: {
    lane_number?: string;
    car_plate?: string;
  };
  notes?: {
    general?: string;
    kitchen?: string;
    bar?: string;
  };
  total: number;
  payment_method?: string;
}): Promise<{ success: boolean; orderId: number }> {
  const response = await axios.post(`${API_BASE}/orders/create`, payload);
  return response.data;
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: number | string): Promise<CanonicalOrder> {
  const response = await axios.get(`${API_BASE}/orders/${orderId}`);
  return response.data;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: number | string,
  status: CanonicalOrder['status']
): Promise<{ success: boolean }> {
  const response = await axios.put(`${API_BASE}/orders/${orderId}/status`, { status });
  return response.data;
}

/**
 * Mark order as ready
 */
export async function markOrderReady(orderId: number | string): Promise<{ success: boolean }> {
  const response = await axios.post(`${API_BASE}/orders/${orderId}/ready`);
  return response.data;
}

/**
 * Mark order as delivered
 */
export async function markOrderDelivered(orderId: number | string): Promise<{ success: boolean }> {
  const response = await axios.post(`${API_BASE}/orders/${orderId}/deliver`);
  return response.data;
}

/**
 * Mark order as paid
 */
export async function markOrderPaid(orderId: number | string): Promise<{ success: boolean }> {
  const response = await axios.post(`${API_BASE}/orders/${orderId}/mark-paid`);
  return response.data;
}

/**
 * Cancel order
 */
export async function cancelOrder(
  orderId: number | string,
  reason?: string
): Promise<{ success: boolean }> {
  const response = await axios.post(`${API_BASE}/orders/${orderId}/cancel`, { reason });
  return response.data;
}

/**
 * Get active orders
 */
export async function getActiveOrders(): Promise<CanonicalOrder[]> {
  const response = await axios.get(`${API_BASE}/orders/active`);
  return response.data.orders || [];
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(
  status: CanonicalOrder['status']
): Promise<CanonicalOrder[]> {
  const response = await axios.get(`${API_BASE}/orders?status=${status}`);
  return response.data.orders || [];
}

