/**
 * Delivery Constants
 * Constants for delivery orders, platforms, pickup types, and cancellation reasons
 */

const PLATFORMS = {
  PHONE: 'phone',
  UBER_EATS: 'uber_eats',
  BOLT_FOOD: 'bolt_food',
  GLOVO: 'glovo',
  TAZZ: 'tazz',
  FOODPANDA: 'foodpanda',
  POS: 'pos',
  KIOSK: 'kiosk',
  QR: 'qr',
  WEBSITE: 'website',
  OTHER: 'other',
};

const PICKUP_TYPES = {
  CUSTOMER_PICKUP: 'customer_pickup',
  OWN_COURIER: 'own_courier',
  PLATFORM_COURIER: 'platform_courier',
};

const CANCELLATION_REASONS = {
  CUSTOMER_REQUEST: 'customer_request',
  OUT_OF_STOCK: 'out_of_stock',
  RESTAURANT_CLOSED: 'restaurant_closed',
  DELIVERY_UNAVAILABLE: 'delivery_unavailable',
  PAYMENT_FAILED: 'payment_failed',
  DUPLICATE_ORDER: 'duplicate_order',
  WRONG_ADDRESS: 'wrong_address',
  CUSTOMER_NOT_AVAILABLE: 'customer_not_available',
  OTHER: 'other',
};

const COURIER_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFFLINE: 'offline',
  ON_DELIVERY: 'on_delivery',
};

const VEHICLE_TYPES = {
  BIKE: 'bike',
  SCOOTER: 'scooter',
  CAR: 'car',
  WALKING: 'walking',
};

module.exports = {
  PLATFORMS,
  PICKUP_TYPES,
  CANCELLATION_REASONS,
  COURIER_STATUS,
  VEHICLE_TYPES,
};

