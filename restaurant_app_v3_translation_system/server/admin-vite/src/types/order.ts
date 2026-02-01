// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Order Types (Canonical)
 * 
 * Unified order types matching S9 Order Engine V2 canonical structure.
 * Used by ALL React modules (KDS, Bar, Delivery, Drive-Thru, Waiter, POS, Kiosk).
 */

export type OrderStatus =
  | "Pending:"
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'paid'
  | 'cancelled'
  | 'ready_for_pickup'
  | 'served';

export type OrderMode = 'dine_in' | 'takeout' | "Delivery" | 'drive_thru';

export type OrderSource = 'POS' | 'KIOSK' | 'QR' | 'DELIVERY' | 'DRIVE_THRU' | 'SUPERVISOR';

export interface OrderItemOption {
  label: string;
  value?: string;
}

export interface OrderItem {
  id: number | string;
  line_id?: number | string | null;
  product_id: number | string;
  name: string;
  qty: number;
  unit_price: number;
  total: number;
  category_id?: number | null;
  station?: 'kitchen' | 'bar' | null;
  notes?: string | null;
  options?: OrderItemOption[];
  customizations?: any[];
}

export interface OrderCustomer {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  identifier?: string | null;
}

export interface OrderDelivery {
  address?: string | null;
  zone_id?: number | null;
  notes?: string | null;
  pickup_code?: string | null;
  pickup_code_verified?: boolean;
}

export interface OrderDriveThru {
  lane_number?: string | null;
  car_plate?: string | null;
}

export interface OrderNotes {
  general?: string | null;
  kitchen?: string | null;
  bar?: string | null;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  currency: string;
}

export interface OrderTimestamps {
  created_at?: string | null;
  updated_at?: string | null;
  ready_at?: string | null;
  delivered_at?: string | null;
  paid_at?: string | null;
  cancelled_at?: string | null;
}

export interface OrderPayment {
  method?: string | null;
  split_bill?: any | null;
}

export interface OrderExternal {
  friendsride_order_id?: string | null;
  friendsride_restaurant_id?: string | null;
  friendsride_webhook_url?: string | null;
}

/**
 * Canonical Order - matches S9 Order Engine V2 structure
 */
export interface CanonicalOrder {
  id: number | string;
  code?: string | null;
  status: OrderStatus;
  type: OrderMode | null;
  source?: OrderSource | null;

  // Table/waiter info
  table?: string | number | null;
  waiter_id?: number | null;
  courier_id?: number | null;

  // Customer
  customer: OrderCustomer;

  // Delivery
  delivery: OrderDelivery;

  // Drive-thru
  drive_thru: OrderDriveThru;

  // Notes
  notes: OrderNotes;

  // Totals
  totals: OrderTotals;

  // Timestamps
  timestamps: OrderTimestamps;

  // Flags
  is_paid: boolean;
  is_cancelled: boolean;
  is_together: boolean;

  // Payment
  payment: OrderPayment;

  // External integrations
  external: OrderExternal;

  // Location
  location_id: number;

  // Items
  items: OrderItem[];

  // PHASE S11 - e-Factura integration
  efacturaStatus?: import('./invoice').EFacturaStatus | null;
  efacturaInvoiceId?: number | null;
}

/**
 * Order Event Payload (from Socket.IO)
 */
export interface OrderEventPayload {
  order: CanonicalOrder;
  [key: string]: any; // Extra metadata
}

/**
 * Order Event Type
 */
export type OrderEventType =
  | 'order:created'
  | 'order:updated'
  | 'order:item_ready'
  | 'order:ready'
  | 'order:delivered'
  | 'order:paid'
  | 'order:cancelled';

