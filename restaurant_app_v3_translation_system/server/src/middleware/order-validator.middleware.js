/**
 * ORDER VALIDATOR MIDDLEWARE
 * 
 * Middleware unificat pentru validare comenzi
 * Asigură că toate comenzile respectă structura standard
 */

const { dbPromise } = require('../../database');
// Notă: stockService nu este folosit direct în middleware
// Verificarea detaliată a stocului se face în orders.controller.js

/**
 * BAR Categories constant (pentru filtrare KDS/Bar)
 */
const BAR_CATEGORIES = ['Cafea/Ciocolată/Ceai', 'Răcoritoare', 'Băuturi și Coctailuri'];

/**
 * Normalizează payload-ul comenzii la format standard
 */
function normalizeOrderPayload(body) {
  const normalized = {
    type: body.type || 'dine_in',
    items: [],
    customer: {},
    delivery: {},
    notes: body.notes || body.general_notes || null,
    total: body.total || 0,
    payment_method: body.payment_method || body.paymentMethod || 'cash',
    payment_timing: body.payment_timing || body.paymentTiming || null,
    is_paid: body.is_paid !== undefined ? body.is_paid : (body.payment_method === 'card' || body.payment_method === 'online' ? 1 : ((body.payment_method === 'protocol' || body.payment_method === 'degustare') && /^pos$/i.test(String(body.order_source || body.orderSource || '')) ? 1 : 0)),
    platform: body.platform || 'POS',
    order_source: body.order_source || body.orderSource || 'POS'
  };
  
  // Normalizează items
  if (Array.isArray(body.items)) {
    normalized.items = body.items.map(item => ({
      id: item.id || item.product_id || item.productId,
      product_id: item.product_id || item.productId || item.id,
      name: item.name || item.product_name || item.productName || '',
      quantity: parseInt(item.quantity) || 1,
      price: parseFloat(item.price) || parseFloat(item.unitPrice) || 0,
      finalPrice: parseFloat(item.finalPrice) || parseFloat(item.totalPrice) || (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
      category: item.category || item.category_name || null,
      customizations: item.customizations || item.modifications || []
    }));
  }
  
  // Normalizează customer
  if (body.customer) {
    normalized.customer = {
      name: body.customer.name || body.customer_name || '',
      phone: body.customer.phone || body.customer_phone || ''
    };
  } else {
    normalized.customer = {
      name: body.customer_name || '',
      phone: body.customer_phone || ''
    };
  }
  
  // Normalizează delivery
  if (body.delivery) {
    normalized.delivery = {
      address: body.delivery.address || body.delivery_address || '',
      city: body.delivery.city || '',
      zip: body.delivery.zip || ''
    };
  } else {
    normalized.delivery = {
      address: body.delivery_address || '',
      city: body.delivery_city || '',
      zip: body.delivery_zip || ''
    };
  }
  
  // Normalizează table
  if (body.table !== undefined) {
    normalized.table = body.table;
  } else if (body.table_number !== undefined) {
    normalized.table = body.table_number;
  }
  
  return normalized;
}

/**
 * Verifică stoc disponibil pentru toate items-urile
 */
async function validateStockAvailability(items) {
  const db = await dbPromise;
  const stockIssues = [];
  
  for (const item of items) {
    if (!item.product_id && !item.id) {
      stockIssues.push({
        item: item.name || 'Unknown',
        error: 'Missing product_id'
      });
      continue;
    }
    
    const productId = item.product_id || item.id;
    const quantity = parseInt(item.quantity) || 1;
    
    // Verifică dacă produsul are rețetă (necesită verificare stoc)
    const recipe = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM recipes WHERE product_id = ? LIMIT 1', [productId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (recipe) {
      // Produsul are rețetă - verifică stoc pentru ingrediente
      // Notă: Verificarea detaliată a stocului se face în orders.controller.js
      // Aici doar verificăm dacă produsul există
      try {
        const product = await new Promise((resolve, reject) => {
          db.get('SELECT id, name FROM menu WHERE id = ?', [productId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
        
        if (!product) {
          stockIssues.push({
            item: item.name || `Product ${productId}`,
            error: 'Product not found'
          });
        }
      } catch (stockError) {
        // Dacă verificarea eșuează, logăm dar continuăm
        console.warn(`⚠️ Product check failed for product ${productId}:`, stockError.message);
      }
    }
    // Dacă produsul nu are rețetă, nu verificăm stoc (produse simple fără ingrediente)
  }
  
  return {
    valid: stockIssues.length === 0,
    issues: stockIssues
  };
}

/**
 * Middleware pentru validare comenzi
 */
async function validateOrder(req, res, next) {
  try {
    // 1. Validează structura de bază
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Request body is required',
          code: 'MISSING_BODY'
        }
      });
    }
    
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Items array is required and must not be empty',
          code: 'INVALID_ITEMS'
        }
      });
    }
    
    // 2. Normalizează payload-ul
    req.normalizedOrder = normalizeOrderPayload(req.body);
    
    // 3. Verifică stoc ÎNAINTE de creare (doar pentru produse cu rețete)
    const stockValidation = await validateStockAvailability(req.normalizedOrder.items);
    if (!stockValidation.valid) {
      return res.status(422).json({
        success: false,
        error: {
          message: 'Insufficient stock for order',
          code: 'INSUFFICIENT_STOCK',
          details: stockValidation.issues
        }
      });
    }
    
    // 4. Validează tipul comenzii
    const validTypes = ['dine_in', 'takeaway', 'delivery', 'here', 'TAKEAWAY', 'DELIVERY'];
    if (!validTypes.includes(req.normalizedOrder.type)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid order type: ${req.normalizedOrder.type}`,
          code: 'INVALID_ORDER_TYPE',
          validTypes: validTypes
        }
      });
    }
    
    // 5. Validează adresa pentru delivery
    if (req.normalizedOrder.type === 'delivery' || req.normalizedOrder.type === 'DELIVERY') {
      if (!req.normalizedOrder.delivery.address || req.normalizedOrder.delivery.address.trim() === '') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Delivery address is required for delivery orders',
            code: 'MISSING_DELIVERY_ADDRESS'
          }
        });
      }
    }
    
    // 6. Calculează totalul dacă nu este furnizat
    if (!req.normalizedOrder.total || req.normalizedOrder.total <= 0) {
      req.normalizedOrder.total = req.normalizedOrder.items.reduce((sum, item) => {
        return sum + (item.finalPrice || (item.price * item.quantity));
      }, 0);
    }
    
    // Payload-ul este valid - continuă
    next();
  } catch (error) {
    console.error('❌ [OrderValidator] Error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Order validation failed',
        code: 'VALIDATION_ERROR',
        details: error.message
      }
    });
  }
}

module.exports = {
  validateOrder,
  normalizeOrderPayload,
  validateStockAvailability,
  BAR_CATEGORIES
};
