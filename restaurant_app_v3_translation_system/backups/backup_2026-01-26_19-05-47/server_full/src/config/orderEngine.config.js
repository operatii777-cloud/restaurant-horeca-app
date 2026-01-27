/**
 * PHASE S9.6 - Order Engine V2 Feature Flags
 * 
 * Central configuration for enabling/disabling Order Engine V2 modules.
 * Allows gradual rollout without breaking existing functionality.
 * 
 * IMPORTANT: All flags default to false for safety.
 * Enable them one by one after testing.
 */

module.exports = {
  // Order Events V2 - Event bus for order lifecycle
  // When true: emits order:* events through event bus
  // When false: no events emitted (legacy continues to work)
  ENABLE_ORDER_EVENTS_V2: process.env.ENABLE_ORDER_EVENTS_V2 === 'true' || false,
  
  // Stock Engine V2 - Recursive recipe expansion for stock consumption
  // When true: uses recipe.expander.js for recursive recipes
  // When false: uses legacy consumptionService.js
  ENABLE_STOCK_ENGINE_V2: process.env.ENABLE_STOCK_ENGINE_V2 === 'true' || false,
  
  // Delivery Engine V2 - Unified delivery order management
  // When true: uses delivery.engine.js for status management
  // When false: uses legacy delivery controllers
  ENABLE_DELIVERY_ENGINE_V2: process.env.ENABLE_DELIVERY_ENGINE_V2 === 'true' || false,
  
  // Drive-Thru Engine V2 - Drive-thru order management
  // When true: uses driveThru.engine.js for status management
  // When false: uses legacy drive-thru controllers
  ENABLE_DRIVETHRU_ENGINE_V2: process.env.ENABLE_DRIVETHRU_ENGINE_V2 === 'true' || false,
  
  // Dispatch Engine V2 - Courier assignment and tracking
  // When true: enables auto-assignment and tracking
  // When false: no dispatch features (legacy continues)
  ENABLE_DISPATCH_ENGINE_V2: process.env.ENABLE_DISPATCH_ENGINE_V2 === 'true' || false,
  
  // Socket.IO Bridge - Forward order events to Socket.IO
  // When true: order:* events are forwarded to Socket.IO clients
  // When false: events only in event bus (no Socket.IO forwarding)
  ENABLE_SOCKET_BRIDGE: process.env.ENABLE_SOCKET_BRIDGE === 'true' || false,
};

