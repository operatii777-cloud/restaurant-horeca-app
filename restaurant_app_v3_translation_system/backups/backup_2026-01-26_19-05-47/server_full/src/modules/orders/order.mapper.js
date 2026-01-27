/**
 * PHASE S9.1 - Canonical Order Mapper
 * 
 * Transforms database order rows into a unified, canonical order structure.
 * Does NOT modify the database - only transforms data for consistent API responses.
 * 
 * This ensures:
 * - Legacy HTML continues to work (unchanged)
 * - React modules receive consistent structure
 * - POS/KDS/Bar receive same structure
 * - Eliminates historical inconsistencies
 */

/**
 * Parse order items from JSON string or array
 * 
 * @param {string|Array} itemsRaw - Items as JSON string or array
 * @returns {Array} Parsed items array
 */
function parseOrderItems(itemsRaw) {
  if (!itemsRaw) return [];
  
  if (Array.isArray(itemsRaw)) {
    return itemsRaw;
  }
  
  if (typeof itemsRaw === 'string') {
    try {
      const parsed = JSON.parse(itemsRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('[OrderMapper] Failed to parse items JSON:', e.message);
      return [];
    }
  }
  
  return [];
}

/**
 * Parse item options from various formats
 * 
 * @param {any} raw - Options as JSON string, array, or string
 * @returns {Array} Parsed options array
 */
function parseItemOptions(raw) {
  if (!raw) return [];
  
  if (Array.isArray(raw)) {
    return raw;
  }
  
  if (typeof raw === 'string') {
    // Try JSON first
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // Not JSON, try comma/semicolon separated
      return raw
        .split(/[;,]/)
        .map(x => x.trim())
        .filter(Boolean);
    }
  }
  
  return [];
}

/**
 * Normalize order type to canonical values
 * 
 * @param {string|null} raw - Raw order type
 * @returns {string|null} Normalized order type
 */
function normalizeOrderType(raw) {
  if (!raw) return null;
  
  const val = String(raw).toLowerCase().trim();
  
  // Dine-in / Restaurant
  if (['restaurant', 'dine_in', 'dine-in', 'dinein', 'masa', 'table'].includes(val)) {
    return 'dine_in';
  }
  
  // Takeout
  if (['takeout', 'take-away', 'take_away', 'pickup', 'to-go'].includes(val)) {
    return 'takeout';
  }
  
  // Delivery
  if (['delivery', 'courier', 'livrare', 'deliver'].includes(val)) {
    return 'delivery';
  }
  
  // Drive-thru
  if (['drive_thru', 'drive-thru', 'drive', 'drivethru'].includes(val)) {
    return 'drive_thru';
  }
  
  // Return as-is if not recognized
  return val;
}

/**
 * Normalize order status to canonical values
 * 
 * @param {string|null} raw - Raw order status
 * @returns {string} Normalized order status (default: 'pending')
 */
function normalizeOrderStatus(raw) {
  if (!raw) return 'pending';
  
  const v = String(raw).toLowerCase().trim();
  
  // Map old statuses to new simple ones
  if (['pending', 'new', 'created', 'open'].includes(v)) {
    return 'pending';
  }
  
  if (['preparing', 'in_progress', 'in-prep', 'in_preparation', 'cooking'].includes(v)) {
    return 'preparing';
  }
  
  if (['ready', 'done', 'prepared', 'completed', 'finished'].includes(v)) {
    return 'ready';
  }
  
  if (['delivered', 'served', 'out'].includes(v)) {
    return 'delivered';
  }
  
  if (['paid', 'closed', 'settled'].includes(v)) {
    return 'paid';
  }
  
  if (['cancelled', 'canceled', 'void', 'voided'].includes(v)) {
    return 'cancelled';
  }
  
  // Return as-is if not recognized
  return v;
}

/**
 * Map database order row to canonical order structure
 * 
 * @param {Object} row - Database row from orders table
 * @param {Array} items - Pre-parsed order items (optional, will parse from row.items if not provided)
 * @returns {Object|null} Canonical order object or null if row is invalid
 */
function mapDbOrderToCanonical(row, items = null) {
  if (!row || !row.id) {
    return null;
  }
  
  // Parse items if not provided
  const parsedItems = items !== null ? items : parseOrderItems(row.items);
  
  // Normalize order type and source
  const orderType = normalizeOrderType(row.type);
  const orderSource = row.order_source || row.source || null;
  
  // Build canonical order
  const canonical = {
    id: row.id,
    code: row.code || row.order_number || null,
    status: normalizeOrderStatus(row.status),
    type: orderType,
    source: orderSource,
    
    // Table/waiter info
    table: row.table_number || row.table || null,
    waiter_id: row.waiter_id || null,
    courier_id: row.courier_id || null,
    
    // Customer info
    customer: {
      name: row.customer_name || null,
      phone: row.customer_phone || null,
      email: row.customer_email || null,
      identifier: row.client_identifier || null,
    },
    
    // Delivery info
    delivery: {
      address: row.delivery_address || null,
      zone_id: row.delivery_zone_id || null,
      notes: row.delivery_notes || null,
      pickup_code: row.delivery_pickup_code || null,
      pickup_code_verified: !!row.delivery_pickup_code_verified,
    },
    
    // Drive-thru info
    drive_thru: {
      lane_number: row.lane_number || null,
      car_plate: row.car_plate || null,
    },
    
    // Notes
    notes: {
      general: row.general_notes || row.notes || row.order_notes || null,
      kitchen: row.food_notes || row.kitchen_notes || null,
      bar: row.drink_notes || row.bar_notes || null,
    },
    
    // Totals
    totals: {
      subtotal: Number(row.subtotal || row.total_without_vat || row.total || 0),
      discount: Number(row.discount_total || row.discount || 0),
      vat: Number(row.vat_total || row.vat || 0),
      total: Number(row.total || 0),
      currency: row.currency || 'RON',
    },
    
    // Timestamps
    timestamps: {
      created_at: row.timestamp || row.created_at || row.createdAt || null,
      updated_at: row.updated_at || row.updatedAt || null,
      ready_at: row.ready_timestamp || row.ready_at || row.completed_timestamp || null,
      delivered_at: row.delivered_timestamp || row.delivered_at || null,
      paid_at: row.paid_timestamp || row.paid_at || null,
      cancelled_at: row.cancelled_timestamp || row.cancelled_at || null,
    },
    
    // Flags
    is_paid: !!row.is_paid,
    is_cancelled: !!row.is_cancelled,
    is_together: !!row.isTogether,
    
    // Payment
    payment: {
      method: row.payment_method || null,
      split_bill: row.split_bill ? (typeof row.split_bill === 'string' ? JSON.parse(row.split_bill) : row.split_bill) : null,
    },
    
    // External integrations
    external: {
      friendsride_order_id: row.friendsride_order_id || null,
      friendsride_restaurant_id: row.friendsride_restaurant_id || null,
      friendsride_webhook_url: row.friendsride_webhook_url || null,
    },
    
    // Location
    location_id: row.location_id || 1,
    
    // Items
    items: parsedItems.map((it, index) => {
      const productId = it.product_id || it.menu_item_id || it.id || null;
      const name = it.name || it.product_name || `Product ${index + 1}`;
      const qty = Number(it.quantity || it.qty || 1);
      const unitPrice = Number(it.price || it.unit_price || 0);
      const total = Number(it.total || it.line_total || unitPrice * qty);
      
      return {
        id: it.id || it.line_id || null,
        line_id: it.line_id || null,
        product_id: productId,
        name: name,
        qty: qty,
        unit_price: unitPrice,
        total: total,
        category_id: it.category_id || null,
        station: it.station || it.kitchen_station || null, // 'kitchen', 'bar', etc.
        notes: it.line_notes || it.notes || null,
        options: parseItemOptions(it.options_json || it.options || null),
        customizations: it.customizations || [],
      };
    }),
  };
  
  return canonical;
}

module.exports = {
  mapDbOrderToCanonical,
  normalizeOrderType,
  normalizeOrderStatus,
  parseOrderItems,
  parseItemOptions,
};

