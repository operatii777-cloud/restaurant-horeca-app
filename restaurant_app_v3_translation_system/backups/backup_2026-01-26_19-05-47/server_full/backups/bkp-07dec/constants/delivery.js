// =====================================================================
// DELIVERY & DRIVE-THRU CONSTANTS
// Date: 2025-12-05
// =====================================================================

/**
 * Motive de anulare pentru comenzi delivery și drive-thru
 */
const CANCELLATION_REASONS = {
  CUSTOMER_REQUEST: 'Cerere client',
  CUSTOMER_UNREACHABLE: 'Client indisponibil',
  WRONG_ORDER: 'Comandă greșită',
  WRONG_ADDRESS: 'Adresă greșită',
  PRODUCT_UNAVAILABLE: 'Produs indisponibil',
  PAYMENT_ISSUE: 'Problemă plată',
  DELIVERY_FAILED: 'Livrare eșuată',
  COURIER_UNAVAILABLE: 'Curier indisponibil',
  DUPLICATE_ORDER: 'Comandă duplicată',
  FRAUD_SUSPECTED: 'Suspiciune fraudă',
  WEATHER_CONDITIONS: 'Condiții meteo',
  TRAFFIC_DELAY: 'Întârziere trafic',
  RESTAURANT_CLOSED: 'Restaurant închis',
  OUTSIDE_DELIVERY_ZONE: 'În afara zonei de livrare',
  OTHER: 'Altul'
};

/**
 * Status-uri curier
 */
const COURIER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
  BREAK: 'break'
};

/**
 * Status-uri livrare (delivery_assignments)
 */
const DELIVERY_STATUS = {
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REASSIGNED: 'reassigned'
};

/**
 * Platforme de delivery
 */
const PLATFORMS = {
  GLOVO: 'glovo',
  WOLT: 'wolt',
  BOLT_FOOD: 'bolt_food',
  FRIENDSRIDE: 'friendsride',
  TAZZ: 'tazz',
  PHONE: 'phone',
  ONLINE: 'online',
  POS: 'pos'
};

/**
 * Icoane platforme pentru UI
 */
const PLATFORM_ICONS = {
  glovo: '🛵',
  wolt: '🔵',
  bolt_food: '🍏',
  friendsride: '🟣',
  tazz: '⚡',
  phone: '📞',
  online: '🌐',
  pos: '💵'
};

/**
 * Tipuri de vehicule pentru curieri
 */
const VEHICLE_TYPES = {
  SCOOTER: 'scooter',
  CAR: 'car',
  BICYCLE: 'bicycle',
  MOTORCYCLE: 'motorcycle',
  WALK: 'walk'
};

/**
 * Tipuri de ridicare/livrare
 */
const PICKUP_TYPES = {
  CUSTOMER_PICKUP: 'customer_pickup',      // Client ridică personal
  OWN_COURIER: 'own_courier',              // Curier propriu
  PLATFORM_COURIER: 'platform_courier'     // Curier platformă (Glovo/Wolt)
};

/**
 * Tipuri zone de livrare
 */
const ZONE_TYPES = {
  POLYGON: 'polygon',
  RADIUS: 'radius',
  ZIP_CODES: 'zip_codes'
};

/**
 * Metode de refund
 */
const REFUND_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  VOUCHER: 'voucher',
  PLATFORM_HANDLED: 'platform_handled'
};

/**
 * Tipuri de plată curier
 */
const COURIER_PAYMENT_TYPES = {
  SALARY: 'salary',
  COMMISSION: 'commission',
  HYBRID: 'hybrid'
};

/**
 * Status-uri settlement comisioane
 */
const SETTLEMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  DISPUTED: 'disputed'
};

module.exports = {
  CANCELLATION_REASONS,
  COURIER_STATUS,
  DELIVERY_STATUS,
  PLATFORMS,
  PLATFORM_ICONS,
  VEHICLE_TYPES,
  PICKUP_TYPES,
  ZONE_TYPES,
  REFUND_METHODS,
  COURIER_PAYMENT_TYPES,
  SETTLEMENT_STATUS
};

