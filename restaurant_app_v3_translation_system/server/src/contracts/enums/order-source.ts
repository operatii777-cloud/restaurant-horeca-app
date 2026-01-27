/**
 * OrderSource Enum - STABLE CONTRACT
 * 
 * ⚠️ CRITICAL: Acest enum este folosit de:
 * - POS (Point of Sale)
 * - Kiosk (Self-service)
 * - QR Ordering
 * - Delivery platforms
 * - Admin-Vite
 * - Backend (analytics, reports)
 * 
 * ❌ NU MODIFICA valorile existente!
 * ✅ Dacă trebuie să adaugi source nou, folosește Compatibility Layer
 */

export type OrderSource =
  | 'POS'          // Point of Sale (casier)
  | 'KIOSK'        // Self-service kiosk
  | 'QR'           // QR code ordering (mobile)
  | 'DELIVERY'     // Delivery platform (Glovo, Uber Eats, etc.)
  | 'DRIVE_THRU'   // Drive-thru
  | 'SUPERVISOR';  // Supervisor override

/**
 * OrderSource Values (pentru validare)
 */
export const ORDER_SOURCE_VALUES: readonly OrderSource[] = [
  'POS',
  'KIOSK',
  'QR',
  'DELIVERY',
  'DRIVE_THRU',
  'SUPERVISOR',
] as const;

/**
 * Validare OrderSource
 */
export function isValidOrderSource(value: string): value is OrderSource {
  return ORDER_SOURCE_VALUES.includes(value as OrderSource);
}

/**
 * OrderSource Display Names (pentru UI)
 */
export const ORDER_SOURCE_DISPLAY: Record<OrderSource, string> = {
  POS: 'Casier',
  KIOSK: 'Kiosk',
  QR: 'QR Code',
  DELIVERY: 'Livrare',
  DRIVE_THRU: 'Drive-Thru',
  SUPERVISOR: 'Supervisor',
};

