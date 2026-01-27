/**
 * OrderType Enum - STABLE CONTRACT
 * 
 * ⚠️ CRITICAL: Acest enum este folosit de:
 * - POS (Point of Sale)
 * - Kiosk (Self-service)
 * - QR Ordering
 * - Delivery platforms
 * - Admin-Vite
 * - Backend (pricing, taxes, delivery fees)
 * 
 * ❌ NU MODIFICA valorile existente!
 * ✅ Dacă trebuie să adaugi type nou, folosește Compatibility Layer
 */

export type OrderType =
  | 'dine_in'      // Mâncare în restaurant
  | 'takeout'       // Takeaway (ridicare)
  | 'delivery'     // Livrare
  | 'drive_thru';  // Drive-thru

/**
 * OrderType Values (pentru validare)
 */
export const ORDER_TYPE_VALUES: readonly OrderType[] = [
  'dine_in',
  'takeout',
  'delivery',
  'drive_thru',
] as const;

/**
 * Validare OrderType
 */
export function isValidOrderType(value: string): value is OrderType {
  return ORDER_TYPE_VALUES.includes(value as OrderType);
}

/**
 * OrderType Display Names (pentru UI)
 */
export const ORDER_TYPE_DISPLAY: Record<OrderType, string> = {
  dine_in: 'În restaurant',
  takeout: 'Takeaway',
  delivery: 'Livrare',
  drive_thru: 'Drive-Thru',
};

/**
 * OrderType Features (pentru business logic)
 */
export const ORDER_TYPE_FEATURES: Record<OrderType, {
  requiresTable: boolean;
  requiresDelivery: boolean;
  requiresPayment: boolean;
  allowsSplitBill: boolean;
}> = {
  dine_in: {
    requiresTable: true,
    requiresDelivery: false,
    requiresPayment: true,
    allowsSplitBill: true,
  },
  takeout: {
    requiresTable: false,
    requiresDelivery: false,
    requiresPayment: true,
    allowsSplitBill: false,
  },
  delivery: {
    requiresTable: false,
    requiresDelivery: true,
    requiresPayment: true,
    allowsSplitBill: false,
  },
  drive_thru: {
    requiresTable: false,
    requiresDelivery: false,
    requiresPayment: true,
    allowsSplitBill: false,
  },
};

