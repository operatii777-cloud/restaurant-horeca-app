/**
 * FAZA 2 - Public Ordering Delivery Module
 * Types for delivery ordering system
 */

export interface DeliveryProduct {
  id: number;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  price: number;
  category: string;
  image_url?: string;
  customizations?: ProductCustomization[];
}

export interface ProductCustomization {
  id: number;
  option_name: string;
  option_name_ro?: string;
  option_name_en?: string;
  extra_price: number;
}

export interface DeliveryCartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  customizations: ProductCustomization[];
  isFree?: boolean;
}

export interface DeliveryCartState {
  items: DeliveryCartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface DeliveryAddressData {
  customerName: string;
  customerPhone: string;
  street: string;
  number: string;
  block?: string;
  stairs?: string;
  floor?: string;
  apartment?: string;
  intercom?: string;
  notes?: string;
}

export interface DeliveryOrderPayload {
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: Array<{
    productId: number;
    quantity: number;
    finalPrice: number;
    isFree: boolean;
    customizations: Array<{
      id: number;
      name: string;
      name_ro?: string;
      name_en?: string;
      price_change: number;
    }>;
  }>;
  total: number;
  payment_method: 'cash' | 'card';
  platform: 'PUBLIC_QR';
  pickup_type: 'PLATFORM_COURIER' | 'OWN_COURIER';
  notes?: string | null;
  type: "Delivery";
  order_source: 'DELIVERY';
}

export interface DeliveryOrderResponse {
  success: boolean;
  order_id: number;
  delivery_fee?: number;
  message?: string;
  error?: string;
}

export type PaymentMethod = 'cash' | 'card';

export type WizardStep = 1 | 2 | 3;

