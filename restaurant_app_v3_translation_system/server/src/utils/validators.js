/**
 * PHASE PRODUCTION-READY - Centralized Validators
 * 
 * Validări centralizate pentru toate modulele aplicației
 */

const { AppError } = require('./error-handler');

/**
 * Sanitize string input
 */
function sanitizeString(input, maxLength = 255) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

/**
 * Validate email format
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone number (Romanian format)
 */
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  // Romanian phone: 07XXXXXXXX or +407XXXXXXXX
  const phoneRegex = /^(\+40|0)?[2-9][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate positive number
 */
function validatePositiveNumber(value, min = 0, max = null) {
  const num = parseFloat(value);
  if (isNaN(num) || num < min) return false;
  if (max !== null && num > max) return false;
  return true;
}

/**
 * Validate integer
 */
function validateInteger(value, min = null, max = null) {
  const num = parseInt(value, 10);
  if (isNaN(num) || !Number.isInteger(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
}

/**
 * Validate order data
 */
function validateOrder(order) {
  const errors = [];

  if (!order || typeof order !== 'object') {
    return { valid: false, errors: ['Order data is required'] };
  }

  // Validate items
  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Order must have at least one item');
  } else {
    order.items.forEach((item, index) => {
      if (!item.product_id && !item.product_name) {
        errors.push(`Item ${index + 1}: product_id or product_name is required`);
      }
      if (!validatePositiveNumber(item.quantity, 0.01)) {
        errors.push(`Item ${index + 1}: quantity must be a positive number`);
      }
      if (item.price !== undefined && !validatePositiveNumber(item.price, 0)) {
        errors.push(`Item ${index + 1}: price must be a positive number`);
      }
    });
  }

  // Validate order type
  const validTypes = ['dine_in', 'takeaway', 'delivery', 'drive_thru'];
  if (order.type && !validTypes.includes(order.type)) {
    errors.push(`Invalid order type. Must be one of: ${validTypes.join(', ')}`);
  }

  // Validate delivery address if delivery
  if (order.type === 'delivery' && !order.delivery_address) {
    errors.push('Delivery address is required for delivery orders');
  }

  // Validate table number if dine-in
  if (order.type === 'dine_in' && !order.table_number) {
    errors.push('Table number is required for dine-in orders');
  }

  // Validate total
  if (order.total !== undefined && !validatePositiveNumber(order.total, 0)) {
    errors.push('Total must be a positive number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate stock data
 */
function validateStock(stock) {
  const errors = [];

  if (!stock || typeof stock !== 'object') {
    return { valid: false, errors: ['Stock data is required'] };
  }

  if (!stock.name || typeof stock.name !== 'string' || stock.name.trim().length === 0) {
    errors.push('Stock name is required');
  }

  if (!stock.unit || typeof stock.unit !== 'string' || stock.unit.trim().length === 0) {
    errors.push('Stock unit is required');
  }

  if (stock.current_stock !== undefined) {
    if (!validatePositiveNumber(stock.current_stock, 0)) {
      errors.push('Current stock must be a positive number');
    }
  }

  if (stock.min_stock !== undefined && stock.min_stock < 0) {
    errors.push('Min stock cannot be negative');
  }

  if (stock.max_stock !== undefined && stock.max_stock < 0) {
    errors.push('Max stock cannot be negative');
  }

  if (stock.min_stock !== undefined && stock.max_stock !== undefined && stock.min_stock > stock.max_stock) {
    errors.push('Min stock cannot be greater than max stock');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate recipe data
 */
function validateRecipe(recipe) {
  const errors = [];

  if (!recipe || typeof recipe !== 'object') {
    return { valid: false, errors: ['Recipe data is required'] };
  }

  if (!recipe.product_id || !validateInteger(recipe.product_id, 1)) {
    errors.push('Valid product_id is required');
  }

  if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    errors.push('Recipe must have at least one ingredient');
  } else {
    recipe.ingredients.forEach((ing, index) => {
      if (!ing.ingredient_id || !validateInteger(ing.ingredient_id, 1)) {
        errors.push(`Ingredient ${index + 1}: valid ingredient_id is required`);
      }
      if (!validatePositiveNumber(ing.quantity, 0.0001)) {
        errors.push(`Ingredient ${index + 1}: quantity must be a positive number`);
      }
      if (!ing.unit || typeof ing.unit !== 'string') {
        errors.push(`Ingredient ${index + 1}: unit is required`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate payment data
 */
function validatePayment(payment) {
  const errors = [];

  if (!payment || typeof payment !== 'object') {
    return { valid: false, errors: ['Payment data is required'] };
  }

  if (!payment.order_id || !validateInteger(payment.order_id, 1)) {
    errors.push('Valid order_id is required');
  }

  if (!payment.amount || !validatePositiveNumber(payment.amount, 0.01)) {
    errors.push('Payment amount must be a positive number');
  }

  const validMethods = ['cash', 'card', 'online', 'voucher', 'split'];
  if (!payment.method || !validMethods.includes(payment.method)) {
    errors.push(`Payment method must be one of: ${validMethods.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate reservation data
 */
function validateReservation(reservation) {
  const errors = [];

  if (!reservation || typeof reservation !== 'object') {
    return { valid: false, errors: ['Reservation data is required'] };
  }

  if (!reservation.table_id || !validateInteger(reservation.table_id, 1)) {
    errors.push('Valid table_id is required');
  }

  if (!reservation.reservation_date || !isValidDate(reservation.reservation_date)) {
    errors.push('Valid reservation_date is required');
  }

  if (!reservation.reservation_time || !isValidTime(reservation.reservation_time)) {
    errors.push('Valid reservation_time is required');
  }

  if (!reservation.guest_count || !validateInteger(reservation.guest_count, 1)) {
    errors.push('Valid guest_count is required (minimum 1)');
  }

  if (reservation.customer_name && reservation.customer_name.trim().length === 0) {
    errors.push('Customer name cannot be empty');
  }

  if (reservation.customer_phone && !validatePhone(reservation.customer_phone)) {
    errors.push('Invalid phone number format');
  }

  if (reservation.customer_email && !validateEmail(reservation.customer_email)) {
    errors.push('Invalid email format');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate Product (for catalog)
 */
function validateProduct(data, operation = 'create') {
  const errors = [];
  
  if (operation === 'create') {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Product name is required');
    }
    
    if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
      errors.push('Product category is required');
    }
    
    if (data.price === undefined || !validatePositiveNumber(data.price, 0)) {
      errors.push('Valid product price is required (>= 0)');
    }
    
    if (data.vat_rate === undefined || !validatePositiveNumber(data.vat_rate, 0, 100)) {
      errors.push('Valid VAT rate is required (0-100)');
    }
    
    if (!data.unit || typeof data.unit !== 'string') {
      errors.push('Product unit is required');
    }
  }
  
  if (operation === 'update') {
    if (data.price !== undefined && !validatePositiveNumber(data.price, 0)) {
      errors.push('Price must be >= 0');
    }
    
    if (data.vat_rate !== undefined && !validatePositiveNumber(data.vat_rate, 0, 100)) {
      errors.push('VAT rate must be between 0 and 100');
    }
    
    if (data.cost_price !== undefined && !validatePositiveNumber(data.cost_price, 0)) {
      errors.push('Cost price must be >= 0');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate Category
 */
function validateCategory(data, operation = 'create') {
  const errors = [];
  
  if (operation === 'create') {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Category name is required');
    }
  }
  
  if (operation === 'update') {
    if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim().length === 0)) {
      errors.push('Category name cannot be empty');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate date string
 */
function isValidDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validate time string (HH:MM format)
 */
function isValidTime(timeString) {
  if (!timeString || typeof timeString !== 'string') return false;
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

/**
 * Validate stock availability for order
 */
async function validateStockAvailability(orderItems, db) {
  const errors = [];
  const stockChecks = [];

  for (const item of orderItems) {
    if (!item.product_id) continue;

    // Get recipe for product
    const recipes = await new Promise((resolve, reject) => {
      // Check if quantity column exists in recipes table
      db.all(
        `SELECT r.id, r.product_id, r.ingredient_id, r.recipe_id, 
                COALESCE(r.quantity_needed, 0) as quantity_needed,
                i.current_stock, i.unit as ingredient_unit, i.name as ingredient_name,
                i.is_available
         FROM recipes r
         JOIN ingredients i ON i.id = r.ingredient_id
         WHERE r.product_id = ? AND (i.is_available = 1 OR i.is_available IS NULL)`,
        [item.product_id],
        (err, rows) => {
          if (err) {
            console.warn(`⚠️ [validateStockAvailability] Error fetching recipes for product ${item.product_id}:`, err.message);
            resolve([]); // Return empty array if query fails (product has no recipes)
          } else {
            resolve(rows || []);
          }
        }
      );
    });

    // Check stock for each ingredient
    for (const recipe of recipes) {
      // Use quantity_needed from query result (already selected as quantity_needed)
      const recipeQuantity = parseFloat(recipe.quantity_needed || 0);
      if (recipeQuantity <= 0) continue; // Skip if no quantity needed
      
      const requiredQuantity = recipeQuantity * parseFloat(item.quantity || 1);
      const availableStock = parseFloat(recipe.current_stock || 0);

      if (availableStock < requiredQuantity) {
        stockChecks.push({
          product_id: item.product_id,
          ingredient_id: recipe.ingredient_id,
          ingredient_name: recipe.ingredient_name,
          required: requiredQuantity,
          available: availableStock,
          unit: recipe.unit || recipe.ingredient_unit
        });
      }
    }
  }

  if (stockChecks.length > 0) {
    stockChecks.forEach(check => {
      errors.push(
        `Insufficient stock for ingredient "${check.ingredient_name}". ` +
        `Required: ${check.required} ${check.unit}, Available: ${check.available} ${check.unit}`
      );
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    stockChecks
  };
}

module.exports = {
  sanitizeString,
  validateEmail,
  validatePhone,
  validatePositiveNumber,
  validateInteger,
  validateOrder,
  validateStock,
  validateRecipe,
  validatePayment,
  validateReservation,
  validateProduct,
  validateCategory,
  isValidDate,
  isValidTime,
  validateStockAvailability
};

