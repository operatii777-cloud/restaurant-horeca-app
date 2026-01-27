/**
 * PaymentStatus Enum - STABLE CONTRACT
 * 
 * ⚠️ CRITICAL: Acest enum este folosit de:
 * - POS (Point of Sale)
 * - Kiosk (Self-service)
 * - Payment gateways
 * - Fiscal printers
 * - Admin-Vite
 * - Backend (accounting, reports)
 * 
 * ❌ NU MODIFICA valorile existente!
 * ✅ Dacă trebuie să adaugi status nou, folosește Compatibility Layer
 */

export type PaymentStatus =
  | 'pending'      // Plată în așteptare
  | 'processing'   // În procesare (gateway)
  | 'completed'    // Completată cu succes
  | 'failed'       // Eșuată
  | 'refunded'     // Rambursată
  | 'cancelled';   // Anulată

/**
 * PaymentStatus Values (pentru validare)
 */
export const PAYMENT_STATUS_VALUES: readonly PaymentStatus[] = [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'cancelled',
] as const;

/**
 * Validare PaymentStatus
 */
export function isValidPaymentStatus(value: string): value is PaymentStatus {
  return PAYMENT_STATUS_VALUES.includes(value as PaymentStatus);
}

/**
 * PaymentStatus Transitions (validări business logic)
 */
export const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['completed', 'failed'],
  completed: ['refunded'],
  failed: ['pending'], // Retry
  refunded: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * Verifică dacă tranziția de status este validă
 */
export function canTransitionPaymentStatus(
  from: PaymentStatus,
  to: PaymentStatus
): boolean {
  return PAYMENT_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

