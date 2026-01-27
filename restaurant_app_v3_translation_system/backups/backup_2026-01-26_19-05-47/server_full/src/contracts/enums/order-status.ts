/**
 * OrderStatus Enum - STABLE CONTRACT
 * 
 * ⚠️ CRITICAL: Acest enum este folosit de:
 * - POS (Point of Sale)
 * - Kiosk (Self-service)
 * - QR Ordering
 * - Admin-Vite
 * - Backend (database, business logic)
 * 
 * ❌ NU MODIFICA valorile existente!
 * ✅ Dacă trebuie să adaugi status nou, folosește Compatibility Layer
 */

export type OrderStatus =
  | 'pending'      // Comandă creată, în așteptare
  | 'preparing'    // În pregătire (kitchen/bar)
  | 'ready'        // Gata pentru livrare/servire
  | 'delivered'    // Livrată/servită
  | 'paid'         // Plătită
  | 'cancelled';   // Anulată

/**
 * OrderStatus Values (pentru validare)
 */
export const ORDER_STATUS_VALUES: readonly OrderStatus[] = [
  'pending',
  'preparing',
  'ready',
  'delivered',
  'paid',
  'cancelled',
] as const;

/**
 * Validare OrderStatus
 */
export function isValidOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUS_VALUES.includes(value as OrderStatus);
}

/**
 * OrderStatus Transitions (validări business logic)
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivered: ['paid'],
  paid: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * Verifică dacă tranziția de status este validă
 */
export function canTransitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus
): boolean {
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

