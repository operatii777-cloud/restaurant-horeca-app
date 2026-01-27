/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/delivery-cancellations.js
 */

const { dbPromise } = require('../../../../database');
const { CANCELLATION_REASONS } = require('../../../constants/delivery');
const PDFDocument = require('pdfkit');
const { computeEtaWithFallback } = require('../../delivery/delivery.eta');
const orderQueueService = require('../order-queue.service');

function checkAdminAuth(req, res, next) {
  req.user = { id: 1, username: 'admin', role_name: 'Super Admin' };
  next();
}

async function checkCancellationEligibility(order) {
  const status = order.status;
  const isPlatformOrder = order.platform && order.platform !== 'phone' && order.platform !== 'pos';
  
  if (status === 'pending') {
    return { 
      allowed: true, 
      requiresApproval: false, 
      refundPercent: 100,
      reason: null 
    };
  }
  
  if (status === 'preparing') {
    return { 
      allowed: true, 
      requiresApproval: true, 
      refundPercent: 100,
      reason: 'Comanda este în preparare. Necesită aprobare admin.' 
    };
  }
  
  if (status === 'completed' || status === 'ready') {
    return { 
      allowed: true, 
      requiresApproval: true, 
      refundPercent: 75,
      reason: 'Comanda este gata. Necesită aprobare admin.' 
    };
  }
  
  if (status === 'assigned' || status === 'picked_up') {
    return { 
      allowed: true, 
      requiresApproval: true, 
      refundPercent: 50,
      reason: 'Comanda a fost alocată/preluată de curier. Necesită aprobare admin + motiv detaliat.' 
    };
  }
  
  if (status === 'in_transit' || status === 'delivered') {
    return { 
      allowed: false, 
      requiresApproval: false, 
      refundPercent: 0,
      reason: 'Comanda este în livrare sau a fost deja livrată. Nu poate fi anulată.' 
    };
  }
  
  return { allowed: false, reason: 'Status necunoscut' };
}

function calculateRefund(order, refundPercent) {
  const total = order.total || 0;
  const refund = (total * refundPercent) / 100;
  return Math.round(refund * 100) / 100;
}

// POST /api/orders/:id/cancel-delivery
async function cancelDelivery(req, res, next) {
  try {
    const { id } = req.params;
    const { reason_code, reason_details, refund_method, cancelled_by } = req.body;
    
    if (!reason_code) {
      return res.status(400).json({ error: 'Motivul anulării este obligatoriu' });
    }
    
    const db = await dbPromise;
    
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }
    
    const canCancel = await checkCancellationEligibility(order);
    if (!canCancel.allowed) {
      return res.status(403).json({ 
        error: canCancel.reason,
        requires_approval: canCancel.requiresApproval
      });
    }
    
    const refundAmount = calculateRefund(order, canCancel.refundPercent);
    
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO delivery_cancellations 
        (order_id, cancelled_by, cancelled_by_id, reason_code, reason_details, 
         refund_amount, refund_method, order_status_at_cancellation, 
         courier_id_at_cancellation, requires_approval)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, cancelled_by || 'admin', req.user.id, reason_code, reason_details || null,
        refundAmount, refund_method || 'cash', order.status, order.courier_id,
        canCancel.requiresApproval ? 1 : 0
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    if (!canCancel.requiresApproval) {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE orders 
          SET status = 'cancelled', 
              cancelled_timestamp = datetime('now'),
              cancelled_reason = ?
          WHERE id = ?
        `, [reason_code, id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      if (order.courier_id && global.io) {
        global.io.to(`courier_${order.courier_id}`).emit('delivery:cancelled', {
          orderId: id, reason: reason_details
        });
      }
    }
    
    if (global.io) {
      global.io.emit('delivery:cancelled', {
        orderId: id,
        reason: reason_code,
        cancelledBy: cancelled_by || 'admin',
        refundAmount
      });
    }
    
    // Emit alert for order cancellation
    const AlertsService = require('../../alerts/alerts.service');
    AlertsService.alertOrderCancelled(order, reason_code, order.platform);
    
    res.json({ 
      success: true,
      refundAmount,
      requiresApproval: canCancel.requiresApproval,
      message: canCancel.requiresApproval 
        ? 'Cerere anulare trimisă spre aprobare'
        : 'Comandă anulată cu succes'
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/cancellations
async function getCancellations(req, res, next) {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const db = await dbPromise;
    
    const cancellations = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          dc.*,
          o.id as order_number, o.customer_name, o.total, o.platform
        FROM delivery_cancellations dc
        LEFT JOIN orders o ON dc.order_id = o.id
        ORDER BY dc.cancelled_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, cancellations: cancellations || [] });
  } catch (error) {
    next(error);
  }
}

// PUT /api/orders/cancellations/:id/approve
async function approveCancellation(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const cancellation = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM delivery_cancellations WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!cancellation) {
      return res.status(404).json({ error: 'Cerere anulare negăsită' });
    }
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE orders 
        SET status = 'cancelled', 
            cancelled_timestamp = datetime('now'),
            cancelled_reason = ?
        WHERE id = ?
      `, [cancellation.reason_code, cancellation.order_id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE delivery_cancellations 
        SET approved_by = ?, approved_at = datetime('now')
        WHERE id = ?
      `, [req.user.id, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, message: 'Anulare aprobată' });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/:id/receipt - Generate PDF receipt
async function getReceipt(req, res, next) {
  try {
    const { id } = req.params;
    const lang = (req.query.lang || 'ro').toLowerCase();
    const db = await dbPromise;
    
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Comanda nu a fost găsită.' });
    }
    
    // 🔴 FIX 5 - Obține setările restaurantului pentru TVA (direct din DB, fără tenant middleware)
    let vatFood = 11;
    let vatDrinks = 21;
    try {
      // Verifică dacă tabela restaurant_settings există
      const tableExists = await new Promise((resolve, reject) => {
        db.get(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='restaurant_settings'",
          (err, row) => {
            if (err) reject(err);
            else resolve(!!row);
          }
        );
      });
      
      if (tableExists) {
        // Verifică dacă are structura key-value sau structura simplă
        const hasSettingKey = await new Promise((resolve, reject) => {
          db.get(
            "SELECT * FROM pragma_table_info('restaurant_settings') WHERE name='setting_key'",
            (err, row) => {
              if (err) reject(err);
              else resolve(!!row);
            }
          );
        });
        
        if (hasSettingKey) {
          // Structura key-value - citește direct
          const settings = await new Promise((resolve, reject) => {
            db.all(
              'SELECT setting_key, setting_value FROM restaurant_settings WHERE tenant_id = 1 OR tenant_id IS NULL',
              [],
              (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
              }
            );
          });
          
          const restaurantData = {};
          settings.forEach(setting => {
            restaurantData[setting.setting_key] = setting.setting_value;
          });
          
          if (restaurantData.vat_food) {
            vatFood = parseFloat(restaurantData.vat_food) || 11;
          }
          if (restaurantData.vat_drinks) {
            vatDrinks = parseFloat(restaurantData.vat_drinks) || 21;
          }
        } else {
          // Structura simplă - citește prima linie
          const singleRow = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM restaurant_settings LIMIT 1', [], (err, row) => {
              if (err) reject(err);
              else resolve(row || null);
            });
          });
          
          if (singleRow) {
            if (singleRow.vat_food) {
              vatFood = parseFloat(singleRow.vat_food) || 11;
            }
            if (singleRow.vat_drinks) {
              vatDrinks = parseFloat(singleRow.vat_drinks) || 21;
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ [Receipt] Error loading restaurant settings, using defaults:', error.message);
    }
    
    // Helper function to sanitize Romanian text
    function sanitizeRomanianText(text) {
      if (!text) return '';
      return text.toString()
        .replace(/ă/g, 'a').replace(/Ă/g, 'A')
        .replace(/â/g, 'a').replace(/Â/g, 'A')
        .replace(/î/g, 'i').replace(/Î/g, 'I')
        .replace(/ș/g, 's').replace(/Ș/g, 'S')
        .replace(/ț/g, 't').replace(/Ț/g, 'T');
    }
    
    // Parse items
    let items = [];
    try {
      items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      if (!Array.isArray(items)) items = [];
    } catch (e) {
      items = [];
    }
    
    // PDF Document
    const doc = new PDFDocument({ 
      size: [226, 841.89], 
      margins: { top: 10, bottom: 10, left: 10, right: 10 } 
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    const filename = order.type === 'delivery' 
      ? `Comanda-${id}-Livrare.pdf`
      : `Comanda-${id}-Masa-${order.table_number || 'Acasa'}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(16).text('Restaurant App', { align: 'center' });
    const receiptTitle = lang === 'en' ? 'Order Receipt' : 'Dovada Comandă';
    doc.fontSize(10).text(sanitizeRomanianText(receiptTitle), { align: 'center' });
    doc.moveDown();
    
    // Order info
    const orderTypeText = order.type === 'delivery'
      ? (lang === 'en' ? 'Delivery Order' : 'Comandă pentru Livrare')
      : order.type === 'here'
        ? (lang === 'en' ? (order.isTogether ? 'Order together' : 'Order separately') : (order.isTogether ? 'Comandă împreună' : 'Comandă separat'))
        : (lang === 'en' ? 'Takeout order' : 'Comandă pentru acasă');
    
    doc.fontSize(9);
    const labels = lang === 'en' 
      ? { 
          orderNo: 'Order No:', 
          table: order.type === 'delivery' ? 'Delivery' : 'Table:', 
          home: 'Home', 
          type: 'Type:', 
          date: 'Date:', 
          total: 'TOTAL:', 
          thanks: 'Thank you!',
          payment: 'Payment:',
          paymentMethod: 'Payment Method:',
          paid: 'Paid',
          paidAt: 'Paid at:',
          toPay: 'To pay on delivery',
          cash: 'Cash',
          card: 'Card',
          online: 'Online'
        }
      : { 
          orderNo: 'Comanda Nr:', 
          table: order.type === 'delivery' ? 'Livrare' : 'Masa:', 
          home: 'Acasă', 
          type: 'Tip:', 
          date: 'Data:', 
          total: 'TOTAL:', 
          thanks: 'Vă mulțumim!',
          payment: 'Plată:',
          paymentMethod: 'Metodă de plată:',
          paid: 'Achitată',
          paidAt: 'Achitată la:',
          toPay: 'Se achită la livrare',
          cash: 'Numerar',
          card: 'Card',
          online: 'Online'
        };
    
    doc.text(sanitizeRomanianText(`${labels.orderNo} ${id}`));
    if (order.type === 'delivery') {
      if (order.customer_name) {
        doc.text(sanitizeRomanianText(`${lang === 'en' ? 'Customer' : 'Client'}: ${order.customer_name}`));
      }
      if (order.delivery_address) {
        doc.text(sanitizeRomanianText(`${lang === 'en' ? 'Address' : 'Adresă'}: ${order.delivery_address}`));
      }
    } else {
      doc.text(sanitizeRomanianText(`${labels.table} ${order.table_number || labels.home}`));
    }
    doc.text(sanitizeRomanianText(`${labels.type} ${orderTypeText}`));
    
    // Format date
    const formatToLocalTime = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleString(lang === 'en' ? 'en-GB' : 'ro-RO', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    doc.text(`${labels.date} ${formatToLocalTime(new Date(order.timestamp))}`);
    doc.moveDown();
    
    doc.text('------------------------');
    doc.moveDown(0.5);
    
    // Items
    let total = 0;
    
    const itemPromises = items.map(item => {
      return new Promise((resolve, reject) => {
        if (item.name && item.name !== 'Produs' && item.name.trim() !== '') {
          resolve({ ...item, basePrice: 0 });
          return;
        }
        
        // 🔴 FIX 5 - Include category pentru calculul TVA-ului
        const sel = lang === 'en' 
          ? 'SELECT name_en, name, price, category FROM menu WHERE id = ?' 
          : 'SELECT name, price, category FROM menu WHERE id = ?';
        db.get(sel, [item.productId || item.product_id], (itemErr, product) => {
          if (itemErr) return reject(itemErr);
          resolve({
            ...item,
            name: (lang === 'en') 
              ? ((product && product.name_en && String(product.name_en).trim()) ? product.name_en : (product && product.name ? product.name : 'Product deleted'))
              : (product && product.name ? product.name : 'Produs șters'),
            basePrice: product ? product.price : 0,
            category: product ? (product.category || '') : (item.category || item.category_name || '')
          });
        });
      });
    });
    
    Promise.all(itemPromises).then(enrichedItems => {
      enrichedItems.forEach(item => {
        const itemTotal = item.finalPrice * item.quantity;
        const isFree = item.isFree || false;
        const displayTotal = isFree ? 0 : itemTotal;
        total += displayTotal;
        
        const startY = doc.y;
        const priceStr = isFree ? '0.00 RON' : `${displayTotal.toFixed(2)} RON`;
        const priceWidth = doc.widthOfString(priceStr, { size: 9 });
        const gap = 8;
        const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const nameBlockWidth = Math.max(40, contentWidth - priceWidth - gap);
        
        const nameText = isFree 
          ? `${item.quantity} x ${item.name} [GRATUIT]`
          : `${item.quantity} x ${item.name}`;
        
        // Calculate how many lines the name will take
        const nameHeight = doc.heightOfString(nameText, {
          width: nameBlockWidth
        });
        const numLines = Math.ceil(nameHeight / doc.currentLineHeight());
        
        // Render the item name
        doc.text(sanitizeRomanianText(nameText), {
          width: nameBlockWidth,
          continued: false
        });
        const afterNameY = doc.y;
        
        // Position price on the FIRST line (top-aligned with name)
        const priceX = doc.page.width - doc.page.margins.right - priceWidth;
        if (isFree) {
          const originalPriceStr = `${itemTotal.toFixed(2)} RON`;
          const originalPriceWidth = doc.widthOfString(originalPriceStr, { size: 9 });
          doc.text(originalPriceStr, priceX, startY, { strike: true });
          doc.text('0.00 RON', priceX + originalPriceWidth + 5, startY, { color: 'green' });
        } else {
          doc.text(priceStr, priceX, startY);
        }
        
        // Move cursor down to the maximum Y position (after name OR after price)
        doc.y = Math.max(afterNameY, startY + doc.currentLineHeight());
        doc.x = doc.page.margins.left;
        
        if (item.customizations && item.customizations.length > 0) {
          item.customizations.forEach(custom => {
            doc.fontSize(8).text(sanitizeRomanianText(`  - ${custom.name}`), {
              width: contentWidth,
            });
            doc.fontSize(9);
          });
        }
        doc.moveDown(0.3);
      });
      
      doc.moveDown();
      doc.x = doc.page.margins.left;
      doc.text('------------------------');
      
      // 🔴 FIX 5 - Calculează și afișează breakdown-ul TVA-ului
      const vatCalculator = require('../../../utils/vat-calculator');
      // Normalizează item-urile pentru calculul TVA-ului (adaugă price/final_price dacă există finalPrice)
      const normalizedItems = enrichedItems.map(item => ({
        ...item,
        price: item.price || item.finalPrice || item.final_price || 0,
        final_price: item.final_price || item.finalPrice || item.price || 0
      }));
      const vatBreakdown = vatCalculator.calculateVatBreakdown(normalizedItems, vatFood, vatDrinks);
      
      // 🔴 FIX 5 - Total consistency check (guard) - verifică că total-ul calculat este consistent
      const calculatedTotal = vatBreakdown.subtotal + vatBreakdown.vatAmount;
      const difference = Math.abs(vatBreakdown.total - calculatedTotal);
      if (difference > 0.01) {
        console.warn(`⚠️ [Receipt] Total consistency check failed for order #${id}: subtotal (${vatBreakdown.subtotal}) + VAT (${vatBreakdown.vatAmount}) = ${calculatedTotal}, but total is ${vatBreakdown.total}. Difference: ${difference}`);
        // Ajustează total-ul pentru a fi consistent (nu blochează flow-ul)
        vatBreakdown.total = Math.round(calculatedTotal * 100) / 100;
      }
      
      // Afișează subtotal (fără TVA)
      const subtotalLabel = lang === 'en' ? 'Subtotal (excl. VAT):' : 'Subtotal (fără TVA):';
      doc.fontSize(9).text(sanitizeRomanianText(subtotalLabel), { align: 'right' });
      doc.text(sanitizeRomanianText(`${vatBreakdown.subtotal.toFixed(2)} RON`), { align: 'right' });
      
      // Afișează TVA pe rate
      if (vatBreakdown.vatBreakdown && vatBreakdown.vatBreakdown.length > 0) {
        vatBreakdown.vatBreakdown.forEach(vat => {
          const vatLabel = lang === 'en' 
            ? `VAT ${vat.rate}%:`
            : `TVA ${vat.rate}%:`;
          doc.fontSize(9).text(sanitizeRomanianText(vatLabel), { align: 'right' });
          doc.text(sanitizeRomanianText(`${vat.amount.toFixed(2)} RON`), { align: 'right' });
        });
      }
      
      // Afișează total (cu TVA inclus)
      const totalLabel = lang === 'en' ? 'TOTAL (VAT incl.):' : 'TOTAL (TVA inclus):';
      doc.fontSize(12).font('Helvetica-Bold').text(sanitizeRomanianText(totalLabel), { align: 'right' });
      doc.text(sanitizeRomanianText(`${vatBreakdown.total.toFixed(2)} RON`), { align: 'right' });
      doc.font('Helvetica');
      
      // 🚚 PAYMENT INFORMATION SECTION
      doc.moveDown();
      doc.x = doc.page.margins.left;
      doc.text('------------------------');
      doc.moveDown(0.5);
      
      doc.fontSize(9).text(sanitizeRomanianText(labels.paymentMethod), { continued: false });
      
      // Determine payment method and status
      const paymentMethod = order.payment_method || 'cash';
      const isPaid = order.is_paid === 1 || order.is_paid === true;
      const paidTimestamp = order.paid_timestamp;
      
      let paymentStatusText = '';
      if (order.type === 'delivery') {
        // For delivery orders
        if (isPaid && paidTimestamp) {
          paymentStatusText = `${labels.paid} - ${labels.paidAt} ${formatToLocalTime(new Date(paidTimestamp))}`;
        } else {
          paymentStatusText = labels.toPay;
        }
      } else {
        // For dine-in orders
        if (isPaid && paidTimestamp) {
          paymentStatusText = `${labels.paid} - ${labels.paidAt} ${formatToLocalTime(new Date(paidTimestamp))}`;
        } else {
          paymentStatusText = lang === 'en' ? 'Not paid' : 'Neachitată';
        }
      }
      
    // Payment method label
    let paymentMethodLabel = '';
    if (paymentMethod === 'cash') {
      paymentMethodLabel = labels.cash;
    } else if (paymentMethod === 'card') {
      paymentMethodLabel = labels.card;
    } else if (paymentMethod === 'online') {
      paymentMethodLabel = labels.online;
    } else {
      paymentMethodLabel = paymentMethod;
    }
    
    doc.fontSize(9).text(sanitizeRomanianText(`${paymentMethodLabel} (${paymentStatusText})`), { indent: 10 });
    
    // FAZA 1.4 - Add pickup code for delivery orders
    if (order.type === 'delivery' && order.delivery_pickup_code) {
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica-Bold').text(
        sanitizeRomanianText(`${lang === 'en' ? 'Pickup Code' : 'Cod Ridicare'}: ${order.delivery_pickup_code}`),
        { align: 'center' }
      );
    }
    
    // FAZA 1.4 - Add fiscal code if available
    if (order.fiscal_code) {
      doc.moveDown(0.5);
      doc.fontSize(9).text(
        sanitizeRomanianText(`${lang === 'en' ? 'Fiscal Code' : 'Cod Fiscal'}: ${order.fiscal_code}`),
        { align: 'center' }
      );
    }
      
      // FAZA 1.4 - Add pickup code for delivery orders
      if (order.type === 'delivery' && order.pickup_code) {
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text(sanitizeRomanianText(`Cod Pickup: ${order.pickup_code}`), { align: 'center' });
        doc.font('Helvetica');
      }
      
      // FAZA 1.4 - Add fiscal code if fiscalized
      if (order.fiscal_code) {
        doc.moveDown(0.3);
        doc.fontSize(8);
        doc.text(sanitizeRomanianText(`Cod Fiscal: ${order.fiscal_code}`), { align: 'center' });
      }
      
      // Notes section
      if (order.food_notes || order.drink_notes || order.general_notes) {
        doc.moveDown();
        doc.x = doc.page.margins.left;
        doc.text('------------------------');
        doc.moveDown(0.5);
        
        const notesLabels = lang === 'en' 
          ? { food: 'Food notes:', drinks: 'Drink notes:', general: 'General notes:' }
          : { food: 'Mentiuni mâncare:', drinks: 'Mentiuni băuturi:', general: 'Mentiuni generale:' };
        
        if (order.food_notes) {
          doc.fontSize(8).text(sanitizeRomanianText(`${notesLabels.food}`), { continued: false });
          doc.fontSize(8).text(sanitizeRomanianText(order.food_notes), { indent: 10 });
          doc.moveDown(0.3);
        }
        
        if (order.drink_notes) {
          doc.fontSize(8).text(sanitizeRomanianText(`${notesLabels.drinks}`), { continued: false });
          doc.fontSize(8).text(sanitizeRomanianText(order.drink_notes), { indent: 10 });
          doc.moveDown(0.3);
        }
        
        if (order.general_notes) {
          doc.fontSize(8).text(sanitizeRomanianText(`${notesLabels.general}`), { continued: false });
          doc.fontSize(8).text(sanitizeRomanianText(order.general_notes), { indent: 10 });
          doc.moveDown(0.3);
        }
      }
      
      doc.moveDown();
      doc.fontSize(9).text(sanitizeRomanianText(labels.thanks), { align: 'center' });
      
      doc.end();
    }).catch(error => {
      console.error('Eroare la generarea PDF:', error);
      res.status(500).json({ error: 'Eroare la generarea PDF-ului.' });
    });
  } catch (error) {
    next(error);
  }
}

// S17.D - GET /api/orders/:id/tracking (Extended with OSRM, map coordinates, route)
async function getOrderTracking(req, res, next) {
  try {
    const { id } = req.params;
    const { lang = 'ro' } = req.query;
    const db = await dbPromise;
    const { computeEtaWithFallback } = require('../../delivery/delivery.eta');
    
    // Load order
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Only support delivery orders for now
    if (order.type !== 'delivery') {
      return res.status(400).json({ 
        success: false, 
        message: 'Tracking is only available for delivery orders' 
      });
    }
    
    // Get restaurant coordinates from config
    const restaurantLat = parseFloat(process.env.RESTAURANT_LAT) || 44.4268; // Default Bucharest
    const restaurantLng = parseFloat(process.env.RESTAURANT_LNG) || 26.1025;
    
    // Get customer coordinates (TODO: implement geocoding if not stored)
    // For now, check if order has customer_lat/customer_lng fields
    let customerLat = order.customer_lat || null;
    let customerLng = order.customer_lng || null;
    
    // TODO: If customer coordinates are null, implement geocoding here
    // For now, we'll use null and frontend can handle it
    
    // Load assignment
    const assignment = await new Promise((resolve, reject) => {
      db.get(`
        SELECT da.*, c.name as courier_name, c.phone as courier_phone, c.status as courier_status, c.code as courier_code
        FROM delivery_assignments da
        LEFT JOIN couriers c ON da.courier_id = c.id
        WHERE da.order_id = ? AND da.status NOT IN ('cancelled')
        ORDER BY da.assigned_at DESC LIMIT 1
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Load courier last location
    let courierLastLocation = null;
    if (assignment && assignment.courier_id) {
      const courier = await new Promise((resolve, reject) => {
        db.get('SELECT current_lat, current_lng, last_location_update FROM couriers WHERE id = ?', 
          [assignment.courier_id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (courier && courier.current_lat && courier.current_lng) {
        courierLastLocation = {
          lat: courier.current_lat,
          lng: courier.current_lng,
          updatedAt: courier.last_location_update
        };
      }
    }
    
    // Build status timeline
    const statusTimeline = {
      createdAt: order.timestamp,
      preparingAt: order.preparing_at || null,
      readyAt: order.ready_at || null,
      assignedAt: assignment?.assigned_at || null,
      acceptedAt: assignment?.accepted_at || null,
      pickedUpAt: assignment?.picked_up_at || null,
      deliveredAt: assignment?.delivered_at || order.delivered_timestamp || null
    };
    
    // Calculate ETA and route using OSRM
    let etaMinutes = null;
    let distanceKm = null;
    let routeGeometry = null;
    
    if (courierLastLocation && customerLat && customerLng) {
      // Courier is in transit - calculate route from courier to customer
      const routeResult = await computeEtaWithFallback(
        courierLastLocation.lat,
        courierLastLocation.lng,
        customerLat,
        customerLng
      );
      
      if (routeResult) {
        etaMinutes = Math.round(routeResult.duration_seconds / 60);
        distanceKm = (routeResult.distance_meters / 1000).toFixed(2);
        if (routeResult.route) {
          routeGeometry = routeResult.route;
        }
      }
    } else if (customerLat && customerLng && (order.status === 'ready' || order.status === 'assigned')) {
      // Order is ready but not picked up - calculate route from restaurant to customer
      const routeResult = await computeEtaWithFallback(
        restaurantLat,
        restaurantLng,
        customerLat,
        customerLng
      );
      
      if (routeResult) {
        etaMinutes = Math.round(routeResult.duration_seconds / 60);
        distanceKm = (routeResult.distance_meters / 1000).toFixed(2);
        if (routeResult.route) {
          routeGeometry = routeResult.route;
        }
      }
    } else {
      // Fallback ETA based on status
      if (order.status === 'preparing') {
        etaMinutes = 20;
      } else if (order.status === 'ready') {
        etaMinutes = 15;
      } else if (order.status === 'assigned' || order.status === 'picked_up' || order.status === 'in_transit') {
        etaMinutes = 10;
      }
    }
    
    // Build map data
    const mapData = {
      restaurant: {
        lat: restaurantLat,
        lng: restaurantLng
      },
      customer: customerLat && customerLng ? {
        lat: customerLat,
        lng: customerLng
      } : null,
      courier: courierLastLocation,
      route: routeGeometry ? {
        distance: distanceKm ? parseFloat(distanceKm) : null,
        duration: etaMinutes ? etaMinutes * 60 : null,
        geometry: routeGeometry
      } : null
    };
    
    const tracking = {
      orderId: order.id,
      status: order.status,
      platform: order.platform,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      deliveryAddress: order.delivery_address,
      payment: {
        method: order.payment_method || 'cash',
        isPaid: order.is_paid === 1,
        paidAt: order.paid_timestamp || null
      },
      createdAt: order.timestamp,
      updatedAt: order.updated_at || order.timestamp,
      courier: assignment ? {
        id: assignment.courier_id,
        name: assignment.courier_name,
        phone: assignment.courier_phone,
        status: assignment.courier_status,
        code: assignment.courier_code,
        lastLocation: courierLastLocation
      } : null,
      statusTimeline,
      etaMinutes,
      distanceKm: distanceKm ? parseFloat(distanceKm) : null,
      map: mapData
    };
    
    res.json({ success: true, data: tracking });
  } catch (error) {
    next(error);
  }
}

// ✅ DAILY OFFER AUTO-APPLICATION: Validates if order qualifies and adds benefits with isFree=true
async function applyDailyOfferBenefits(items, db) {
  try {
    console.log('🎁 [DAILY_OFFER] Checking if order qualifies for daily offer benefits...');
    
    // Get active daily offer from database (if tables exist)
    let activeOffer = null;
    try {
      activeOffer = await new Promise((resolve, reject) => {
        db.get(`
          SELECT * FROM daily_offers 
          WHERE is_active = 1 
          ORDER BY created_at DESC 
          LIMIT 1
        `, [], (err, row) => {
          if (err && err.message.includes('no such table')) {
            resolve(null); // Table doesn't exist
          } else if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    } catch (e) {
      console.warn('⚠️ [DAILY_OFFER] Error checking daily offers table:', e.message);
    }
    
    if (!activeOffer) {
      console.log('ℹ️ [DAILY_OFFER] No active offer in database, skipping auto-application');
      return items; // Return items unchanged
    }
    
    console.log(`✅ [DAILY_OFFER] Found active offer: ${activeOffer.title || activeOffer.id}`);
    
    // Get offer conditions
    const conditions = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM daily_offer_conditions 
        WHERE offer_id = ?
      `, [activeOffer.id], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
    
    console.log(`📋 [DAILY_OFFER] Offer has ${conditions.length} condition(s)`);
    
    // Validate each condition
    let offersQualifies = true;
    for (const condition of conditions) {
      const itemsForCategory = items.filter(item => 
        item.category === condition.category || item.category_name === condition.category
      );
      
      const requiredQty = condition.required_quantity || condition.quantity || 1;
      const actualQty = itemsForCategory.reduce((sum, item) => sum + (item.quantity || 1), 0);
      
      console.log(`📊 [DAILY_OFFER] Category "${condition.category}": need ${requiredQty}, have ${actualQty}`);
      
      if (actualQty < requiredQty) {
        offersQualifies = false;
        console.log(`❌ [DAILY_OFFER] Condition NOT met: insufficient ${condition.category}`);
        break;
      }
    }
    
    if (!offersQualifies) {
      console.log('❌ [DAILY_OFFER] Order does NOT qualify for offer');
      return items; // Return items unchanged
    }
    
    console.log('✅ [DAILY_OFFER] Order qualifies! Getting benefit products...');
    
    // Get benefit products
    let benefitProductIds = [];
    try {
      benefitProductIds = await new Promise((resolve, reject) => {
        db.all(`
          SELECT product_id FROM daily_offer_benefit_products 
          WHERE offer_id = ?
        `, [activeOffer.id], (err, rows) => {
          if (err && err.message.includes('no such table')) {
            resolve([]); // Table doesn't exist
          } else if (err) {
            reject(err);
          } else {
            resolve((rows || []).map(r => r.product_id));
          }
        });
      });
    } catch (e) {
      console.warn('⚠️ [DAILY_OFFER] Error getting benefit products:', e.message);
    }
    
    console.log(`🎁 [DAILY_OFFER] Benefit product IDs: ${benefitProductIds.join(', ') || 'none'}`);
    
    // Get actual benefit products from menu or catalog_products
    let benefitProducts = [];
    if (benefitProductIds.length > 0) {
      // 🔴 FIX: Prioritize 'menu' table (used by Kiosk/Web) to avoid ID conflicts with 'catalog_products'
      benefitProducts = await new Promise((resolve, reject) => {
        const placeholders = benefitProductIds.map(() => '?').join(',');
        db.all(`
          SELECT id, name, price, category
          FROM menu
          WHERE id IN (${placeholders}) AND (is_active = 1 OR is_active IS NULL)
        `, benefitProductIds, (err, rows) => {
          if (err) {
            resolve([]);
          } else {
            resolve(rows || []);
          }
        });
      });
      
      // If not found in menu, try catalog_products as fallback
      if (benefitProducts.length === 0) {
        benefitProducts = await new Promise((resolve, reject) => {
          const placeholders = benefitProductIds.map(() => '?').join(',');
          db.all(`
            SELECT p.id, p.name, p.price, c.name as category
            FROM catalog_products p
            LEFT JOIN catalog_categories c ON p.category_id = c.id
            WHERE p.id IN (${placeholders}) AND p.is_active = 1
          `, benefitProductIds, (err, rows) => {
            if (err) {
              resolve([]);
            } else {
              resolve(rows || []);
            }
          });
        });
      }
    } else if (activeOffer.benefit_type === 'category' && activeOffer.benefit_category) {
      // If no specific benefits, use category benefits
      // 🔴 FIX: Again, prioritize 'menu' table
      benefitProducts = await new Promise((resolve, reject) => {
        db.all(`
          SELECT id, name, price, category
          FROM menu
          WHERE category = ? AND (is_active = 1 OR is_active IS NULL)
          LIMIT ${activeOffer.benefit_quantity || 1}
        `, [activeOffer.benefit_category], (err, rows) => {
          if (err) {
            resolve([]);
          } else {
            resolve(rows || []);
          }
        });
      });
      
      // Fallback to catalog_products
      if (benefitProducts.length === 0) {
        benefitProducts = await new Promise((resolve, reject) => {
          db.all(`
            SELECT p.id, p.name, p.price, c.name as category
            FROM catalog_products p
            LEFT JOIN catalog_categories c ON p.category_id = c.id
            WHERE c.name = ? AND p.is_active = 1
            LIMIT ${activeOffer.benefit_quantity || 1}
          `, [activeOffer.benefit_category], (err, rows) => {
            if (err) {
              resolve([]);
            } else {
              resolve(rows || []);
            }
          });
        });
      }
    }
    
    console.log(`✅ [DAILY_OFFER] Found ${benefitProducts.length} benefit products: ${benefitProducts.map(p => `${p.name} (${p.price} RON)`).join(', ')}`);
    
    // Add benefit products to items with isFree=true and proper product_id
    const benefitQuantity = activeOffer.benefit_quantity || 1;
    const itemsToAdd = [];
    
    for (let i = 0; i < benefitQuantity && i < benefitProducts.length; i++) {
      const benefitProduct = benefitProducts[i];
      
      itemsToAdd.push({
        product_id: benefitProduct.id,
        id: benefitProduct.id,
        name: benefitProduct.name,
        price: parseFloat(benefitProduct.price) || 0,
        category: benefitProduct.category,
        category_name: benefitProduct.category,
        quantity: 1,
        isFree: true, // ✅ CRITICAL: Mark as free
        is_benefit_product: true, // Mark so we know it's from benefit
        status: 'pending',
        station: benefitProduct.category && 
          ['Cafea/Ciocolată/Ceai', 'Răcoritoare', 'Băuturi și Coctailuri'].includes(benefitProduct.category) 
          ? 'bar' 
          : 'kitchen',
        itemId: `benefit_${benefitProduct.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }
    
    console.log(`🎁 [DAILY_OFFER] Adding ${itemsToAdd.length} benefit items with isFree=true`);
    
    return [...items, ...itemsToAdd];
    
  } catch (error) {
    console.error('❌ [DAILY_OFFER] Error applying daily offer benefits:', error.message);
    // Return items unchanged if error
    return items;
  }
}

// POST /api/orders/create
async function createOrder(req, res, next) {
  try {
    // ✅ Folosește normalizedOrder din middleware dacă există, altfel folosește body
    const orderData = req.normalizedOrder || req.body;
    
    // Extrage datele din normalizedOrder sau body
    let type = orderData.type || req.body.type || 'dine_in';
    // FIX COMPAT: Mapare tipuri legacy ("here" -> "dine_in")
    if (type === 'here') type = 'dine_in';

    // FIX COMPAT: Normalizează items pentru a asigura folosirea product_id (underscore)
    const items = (orderData.items || req.body.items || []).map(item => {
      if (item.productId && !item.product_id) {
        return { ...item, product_id: item.productId };
      }
      return item;
    });

    const table = orderData.table || req.body.table || orderData.table_number || req.body.table_number || orderData.tableNumber || req.body.tableNumber;
    const customer_name = orderData.customer_name || req.body.customer_name || (orderData.customer?.name || req.body.customer?.name);
    const customer_phone = orderData.customer_phone || req.body.customer_phone || (orderData.customer?.phone || req.body.customer?.phone);
    const customer = orderData.customer || req.body.customer || {
      name: customer_name,
      phone: customer_phone
    };
    const delivery_address = orderData.delivery_address || req.body.delivery_address || (orderData.delivery?.address || req.body.delivery?.address);
    const delivery = orderData.delivery || req.body.delivery || {
      address: delivery_address
    };
    const drive_thru = req.body.drive_thru;
    const notes = orderData.notes || req.body.notes;
    // FIX: Extrage mențiunile separate (food_notes, drink_notes, general_notes) din POS
    const food_notes = orderData.food_notes || req.body.food_notes || null;
    const drink_notes = orderData.drink_notes || req.body.drink_notes || null;
    const general_notes = orderData.general_notes || req.body.general_notes || notes?.general || notes || null;
    const total = orderData.total || req.body.total;
    const payment_method = orderData.payment_method || req.body.payment_method;
    const payment_timing = orderData.payment_timing || req.body.payment_timing;
    const is_paid = orderData.is_paid !== undefined ? orderData.is_paid : req.body.is_paid;

    // PHASE PRODUCTION-READY: Use centralized validators (dacă middleware nu a validat deja)
    // Dacă normalizedOrder există, middleware-ul a validat deja
    // ✅ FIX: Import validateStockAvailability în afara blocului if pentru a fi disponibilă mai jos
    const { validateStockAvailability } = require('../../../utils/validators');
    const { AppError } = require('../../../utils/error-handler');
    
    if (!req.normalizedOrder) {
      const { validateOrder } = require('../../../utils/validators');

      // Validate order structure
      const validationData = {
        type,
        items,
        table_number: table,
        customer_name: customer_name || customer?.name,
        customer_phone: customer_phone || customer?.phone,
        delivery_address: delivery_address || delivery?.address,
        total,
        payment_method
      };

      const validation = validateOrder(validationData);
      if (!validation.valid) {
        console.error('❌ [OrderController] Validation failed:', validation.errors);
        console.error('📦 Payload received (normalized):', JSON.stringify(validationData, null, 2));
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed: ' + validation.errors.join(', '),
            code: 'VALIDATION_ERROR',
            details: validation.errors
          }
        });
      }
    }

    // Calculează totalul dacă nu este furnizat
    let calculatedTotal = total;
    if (!calculatedTotal || calculatedTotal <= 0) {
      calculatedTotal = items.reduce((sum, item) => {
        // Folosește finalPrice dacă există (pentru Happy Hour discount), altfel price * quantity
        const itemPrice = parseFloat(item.finalPrice) || parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        // Dacă produsul este gratuit (isFree), nu adăuga la total
        if (item.isFree === true) {
          return sum;
        }
        return sum + (itemPrice * quantity);
      }, 0);
    }

    if (!calculatedTotal || calculatedTotal <= 0) {
      return res.status(400).json({ error: 'Totalul comenzii este obligatoriu și trebuie să fie pozitiv' });
    }

    // Așteaptă DB să fie gata (cu timeout)
    let db;
    try {
      db = await Promise.race([
        dbPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
      ]);
    } catch (dbError) {
      console.error('❌ Database not ready for createOrder:', dbError.message);
      return res.status(503).json({ error: 'Database not ready' });
    }
    
    // FIX: Verifică și adaugă coloanele food_notes și drink_notes dacă nu există
    try {
      const columns = await new Promise((resolve, reject) => {
        db.all('PRAGMA table_info(orders)', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      const hasFoodNotes = columns.some(col => col.name === 'food_notes');
      const hasDrinkNotes = columns.some(col => col.name === 'drink_notes');
      
      if (!hasFoodNotes) {
        await new Promise((resolve, reject) => {
          db.run('ALTER TABLE orders ADD COLUMN food_notes TEXT', (err) => {
            if (err && !err.message.includes('duplicate column')) reject(err);
            else resolve();
          });
        });
        console.log('✅ Added food_notes column to orders table');
      }
      
      if (!hasDrinkNotes) {
        await new Promise((resolve, reject) => {
          db.run('ALTER TABLE orders ADD COLUMN drink_notes TEXT', (err) => {
            if (err && !err.message.includes('duplicate column')) reject(err);
            else resolve();
          });
        });
        console.log('✅ Added drink_notes column to orders table');
      }
    } catch (alterErr) {
      console.warn('⚠️ Error checking/adding notes columns:', alterErr.message);
      // Continuă oricum, poate coloanele există deja
    }

    // Detect platform from request (MOBILE_APP, KIOSK, POS, etc.) - MUST be BEFORE stock validation
    // Platform is needed in error messages and alerts
    const platform = req.body.platform || (req.body.order_source === 'DELIVERY' && req.body.pickup_type === 'PLATFORM_COURIER' ? 'MOBILE_APP' : 'POS');

    // 🔴 FIX 1 - Protecție comenzi duplicate: idempotency_key (doar pentru MOBILE_APP)
    // ✅ FIX: Generează automat idempotency_key dacă nu este furnizat (pentru RestorApp)
    let idempotencyKey = req.body.idempotency_key;
    if (platform === 'MOBILE_APP' && !idempotencyKey) {
      // Generează automat un idempotency_key bazat pe timestamp + random
      idempotencyKey = `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`🔑 [OrderController] Generated idempotency_key for MOBILE_APP order: ${idempotencyKey}`);
    }

    // Verifică dacă există deja o comandă cu același idempotency_key (doar pentru MOBILE_APP)
    if (platform === 'MOBILE_APP' && idempotencyKey) {
      try {
        const existingOrder = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM orders WHERE idempotency_key = ?', [idempotencyKey], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });

        if (existingOrder) {
          // Comandă existentă - returnează comanda existentă (IDEMPOTENT)
          console.log(`🔄 [IDEMPOTENCY] Returning existing order ${existingOrder.id} for idempotency_key ${idempotencyKey}`);
          
          // Parse items dacă este string
          if (existingOrder.items && typeof existingOrder.items === 'string') {
            try {
              existingOrder.items = JSON.parse(existingOrder.items);
            } catch (e) {
              existingOrder.items = [];
            }
          }

          return res.status(200).json({
            success: true,
            order_id: existingOrder.id,
            order: existingOrder,
            idempotent: true // Flag pentru frontend că e comandă duplicată
          });
        }
      } catch (idempotencyError) {
        // Dacă coloana nu există încă (migrare în curs), continuă normal
        if (!idempotencyError.message.includes('no such column')) {
          console.warn('⚠️ Error checking idempotency_key:', idempotencyError.message);
        }
        // Continuă cu crearea comenzii
      }
    }

    // PHASE PRODUCTION-READY: Validate stock availability (STRICT MODE)
    // Works for ALL platforms (MOBILE_APP, GLOVO, WOLT, FRIENDSRIDE, POS, KIOSK, etc.)
    const allowStockOverride = req.body.allow_stock_override === true || req.body.allow_stock_override === 'true';
    const isAdmin = req.user?.role_name === 'Super Admin' || req.user?.role_name === 'Admin';
    
    try {
      const stockValidation = await validateStockAvailability(items, db);
      if (!stockValidation.valid) {
        // Allow override only for admins
        if (allowStockOverride && isAdmin) {
          console.warn(`⚠️ [STOCK OVERRIDE] Admin ${req.user?.username || 'unknown'} overriding stock validation for order`);
          // Emit alert about stock override
          if (global.io) {
            global.io.emit('alert:stock-override', {
              type: 'STOCK_OVERRIDE',
              severity: 'warning',
              message: `Admin ${req.user?.username || 'unknown'} a acceptat o comandă cu stoc insuficient`,
              orderItems: items,
              stockChecks: stockValidation.stockChecks,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          // Block order if no override or not admin
          console.warn(`❌ [STOCK VALIDATION] Order blocked due to insufficient stock`);
          
          // Emit alert about blocked order
          if (global.io) {
            global.io.emit('alert:order-blocked-stock', {
              type: 'ORDER_BLOCKED_STOCK',
              severity: 'error',
              message: 'Comandă blocată - stoc insuficient',
              orderItems: items,
              stockChecks: stockValidation.stockChecks,
              platform: platform || 'UNKNOWN',
              timestamp: new Date().toISOString()
            });
          }
          
          return res.status(422).json({
            success: false,
            error: {
              message: 'Insufficient stock for order',
              code: 'INSUFFICIENT_STOCK',
              details: stockValidation.errors,
              stockChecks: stockValidation.stockChecks,
              allow_override: isAdmin ? true : false
            }
          });
        }
      }
    } catch (stockError) {
      // If validation fails due to error, block order (strict mode)
      console.error('❌ [STOCK VALIDATION] Error during stock validation:', stockError.message);
      
      // Emit alert about validation error
      if (global.io) {
        global.io.emit('alert:stock-validation-error', {
          type: 'STOCK_VALIDATION_ERROR',
          severity: 'error',
          message: 'Eroare la validarea stocului',
          error: stockError.message,
          platform: platform || 'UNKNOWN',
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(500).json({
        success: false,
        error: {
          message: 'Error validating stock availability',
          code: 'STOCK_VALIDATION_ERROR',
          details: stockError.message
        }
      });
    }

    // Determine order_source based on type and platform
    // Key distinction:
    // - QR table order from mobile: type='dine_in', table_number set, order_source='DINE_IN'
    // - Online order from mobile: type='delivery'/'pickup', no table_number, order_source='DELIVERY'/'PICKUP'
    let order_source = req.body.order_source || 'pos';
    if (!req.body.order_source) {
      if (type === 'delivery') order_source = 'delivery';
      else if (type === 'drive_thru') order_source = 'drive_thru';
      else if (type === 'takeout') order_source = 'takeout';
      else if (type === 'dine_in' && platform === 'MOBILE_APP' && table != null) {
        // Comandă de la masă prin aplicația mobilă (QR scan)
        order_source = 'DINE_IN';
      }
    }

    // Parse split_bill from request if present
    let splitBillData = null;
    if (req.body.split_bill) {
      try {
        splitBillData = typeof req.body.split_bill === 'string' 
          ? JSON.parse(req.body.split_bill) 
          : req.body.split_bill;
      } catch (e) {
        console.warn('⚠️ Error parsing split_bill in createOrder:', e.message);
      }
    }
    const clientIdentifier = orderData.clientIdentifier || req.body.clientIdentifier || orderData.client_identifier || req.body.client_identifier || req.body.customer_email || customer?.email || customer?.phone || null;
    
    // Detect if this is a table order from mobile app (QR scan) vs online order from mobile app
    // Key distinction:
    // - QR table order: type='dine_in', table_number is set, platform='MOBILE_APP'
    // - Online order: type='delivery' or 'pickup', no table_number, platform='MOBILE_APP'
    const isMobileTableOrder = platform === 'MOBILE_APP' && type === 'dine_in' && table != null;
    const isMobileOnlineOrder = platform === 'MOBILE_APP' && (type === 'delivery' || type === 'pickup') && table == null;
    
    // Verifică dacă comanda trebuie pusă în coadă (pentru comenzi care nu pot fi procesate instant)
    const orderDataForQueue = {
      type,
      items,
      table_number: table,
      customer_name: customer?.name,
      customer_phone: customer?.phone,
      delivery_address: delivery?.address,
      total: calculatedTotal,
      payment_method,
      platform,
      client_identifier: clientIdentifier,
      order_source,
      notes: notes?.general || notes,
      split_bill: splitBillData,
    };
    
    const shouldQueue = orderQueueService.shouldQueueOrder(orderDataForQueue);
    
    if (shouldQueue) {
      // Adaugă comanda în coadă
      try {
        const jobId = await orderQueueService.queueOrder(orderDataForQueue, {
          priority: orderQueueService.calculatePriority(orderDataForQueue),
          requestData: {
            user: req.user,
            headers: req.headers,
          },
        });
        
        return res.status(202).json({
          success: true,
          message: 'Comanda a fost adăugată în coadă pentru procesare',
          queued: true,
          job_id: jobId,
          estimated_processing_time: '30-60 secunde',
        });
      } catch (queueError) {
        console.error('❌ Error queueing order:', queueError);
        // Continuă cu procesarea normală dacă queue-ul eșuează
      }
    }
    
    // 🔴 FIX: Populează name și category pentru toate items-urile înainte de salvare și Socket.io
    // Această funcție helper populează name-ul și categoria din baza de date dacă lipsesc
    // CRITICAL: Category este necesar pentru filtrarea corectă între kitchen și bar
    const enrichItemsWithNames = async (itemsArray) => {
      return await Promise.all(itemsArray.map(async (item) => {
        let productName = item.name || item.product_name || '';
        let productCategory = item.category || item.category_name || '';
        const productId = item.product_id || item.id || item.productId;
        
        // Dacă name sau category lipsește dar avem product_id, obține-le din baza de date
        // ✅ FIX: Caută în ambele tabele (menu și catalog_products) pentru sincronizare corectă
        if (productId && ((!productName || productName.trim() === '') || (!productCategory || productCategory.trim() === ''))) {
          try {
            // Mai întâi caută în menu (prioritar)
            let product = await new Promise((resolve, reject) => {
              db.get('SELECT name, category FROM menu WHERE id = ?', [productId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            });
            
            // Dacă nu găsește în menu, caută în catalog_products
            if (!product) {
              product = await new Promise((resolve, reject) => {
                db.get(`
                  SELECT cp.name, cc.name as category
                  FROM catalog_products cp
                  LEFT JOIN catalog_categories cc ON cp.category_id = cc.id
                  WHERE cp.id = ?
                `, [productId], (err, row) => {
                  if (err) reject(err);
                  else resolve(row);
                });
              });
            }
            
            if (product) {
              if ((!productName || productName.trim() === '') && product.name) {
                productName = product.name;
                console.log(`✅ [ENRICH_ITEMS] Populated name for product_id ${productId}: "${productName}"`);
              }
              if ((!productCategory || productCategory.trim() === '') && product.category) {
                productCategory = product.category;
                console.log(`✅ [ENRICH_ITEMS] Populated category for product_id ${productId}: "${productCategory}"`);
              }
            } else {
              console.warn(`⚠️ [ENRICH_ITEMS] Product not found in menu or catalog_products for product_id ${productId}`);
            }
          } catch (productErr) {
            console.warn(`⚠️ [ENRICH_ITEMS] Error fetching product info for product_id ${productId}:`, productErr.message);
          }
        }
        
        // Dacă tot nu avem name, folosește un fallback
        if (!productName || productName.trim() === '') {
          productName = `Produs ${productId || 'N/A'}`;
          console.warn(`⚠️ [ENRICH_ITEMS] Missing name for item, using fallback: "${productName}"`);
        }
        
        // Setează station pe baza categoriei (pentru filtrarea Bar/Kitchen)
        // BAR_CATEGORIES: ['Cafea/Ciocolată/Ceai', 'Răcoritoare', 'Băuturi și Coctailuri']
        const BAR_CATEGORIES = ['Cafea/Ciocolată/Ceai', 'Răcoritoare', 'Băuturi și Coctailuri'];
        let station = item.station; // Păstrează station dacă există deja
        if (!station && productCategory) {
          station = BAR_CATEGORIES.includes(productCategory) ? 'bar' : 'kitchen';
        } else if (!station) {
          station = 'kitchen'; // Default la kitchen dacă nu avem categorie
        }
        
        // Setează status implicit 'pending' dacă nu există (pentru ca bar-ul să poată marca items ca gata)
        const itemStatus = item.status || item.item_status || 'pending';
        
        // ✅ FIX: Setează itemId pentru ca bar-ul să poată marca items ca gata
        // itemId este necesar pentru identificarea unică a fiecărui item în comandă
        const itemId = item.itemId || item.item_id || item.id || item.line_id || 
                       `${productId || 'item'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          ...item,
          name: productName,
          category: productCategory,
          category_name: productCategory, // Păstrăm ambele pentru compatibilitate
          station: station, // CRITICAL: Setează station pentru filtrarea Bar/Kitchen
          product_id: productId || item.product_id || item.id || item.productId,
          itemId: itemId, // ✅ CRITICAL: Setează itemId pentru identificare unică
          status: itemStatus // CRITICAL: Setează status implicit 'pending' pentru procesare în bar
        };
      }));
    };

    // Populează name-urile pentru items înainte de a le folosi
    const enrichedItems = await enrichItemsWithNames(items);

    // ✅ AUTO-APPLY DAILY OFFER BENEFITS: Detectează și adaugă beneficiile cu isFree=true
    // Aceasta e soluția pentru daily offer - asigură că beneficiile corecte se adaugă la comenzi
    const itemsWithBenefits = await applyDailyOfferBenefits(enrichedItems, db);

    // Insert order (procesare instant)
    const orderId = await new Promise((resolve, reject) => {
      // Verifică dacă există coloana platform în tabela orders
      db.all(`PRAGMA table_info(orders)`, [], async (err, columns) => {
        if (err || !Array.isArray(columns)) {
          // Dacă nu poate verifica, încercă direct INSERT cu platform și idempotency_key
          // Construiește query-ul dinamic pentru a include mențiunile dacă coloanele există
          let insertCols = 'type, order_source, platform, table_number, items, total, payment_method, status, timestamp, is_paid, customer_name, customer_phone, delivery_address, car_plate, lane_number, split_bill, client_identifier, idempotency_key';
          let insertVals = '?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), ?, ?, ?, ?, ?, ?, ?, ?, ?';
          let insertParams = [type, order_source, platform, table || null, JSON.stringify(itemsWithBenefits), calculatedTotal, payment_method || null, 'pending', req.body.is_paid !== undefined ? (req.body.is_paid ? 1 : 0) : (payment_method && (payment_method === 'card' || payment_method === 'online') ? 1 : 0), customer?.name || null, customer?.phone || null, delivery?.address || null, drive_thru?.car_plate || null, drive_thru?.lane_number || null, splitBillData ? JSON.stringify(splitBillData) : null, clientIdentifier, idempotencyKey || null];
          
          // Adaugă mențiunile (coloanele au fost deja create mai sus dacă nu existau)
          insertCols += ', food_notes, drink_notes, general_notes';
          insertVals += ', ?, ?, ?';
          insertParams.splice(insertParams.length - 2, 0, food_notes || null, drink_notes || null, general_notes || null);
          
          db.run(`
            INSERT INTO orders (${insertCols})
            VALUES (${insertVals})
          `, insertParams, function(err) {
            // 🔴 FIX 1: Protecție race condition
            if (err && err.code === 'SQLITE_CONSTRAINT' && err.message.includes('idempotency_key') && idempotencyKey) {
              db.get('SELECT * FROM orders WHERE idempotency_key = ?', [idempotencyKey], (selectErr, existingOrder) => {
                if (selectErr) {
                  // Dacă select eșuează, încercă fallback fără idempotency_key
                  let insertCols = 'type, order_source, table_number, items, total, payment_method, status, timestamp, is_paid, customer_name, customer_phone, delivery_address, car_plate, lane_number, split_bill, client_identifier';
                  let insertVals = '?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), ?, ?, ?, ?, ?, ?, ?, ?';
                  let insertParams = [type, order_source, table || null, JSON.stringify(itemsWithBenefits), calculatedTotal, payment_method || null, 'pending', req.body.is_paid !== undefined ? (req.body.is_paid ? 1 : 0) : (payment_method && (payment_method === 'card' || payment_method === 'online') ? 1 : 0), customer?.name || null, customer?.phone || null, delivery?.address || null, drive_thru?.car_plate || null, drive_thru?.lane_number || null, splitBillData ? JSON.stringify(splitBillData) : null, clientIdentifier];
                  
                  // Adaugă mențiunile
                  try {
                    const colNames = (columns || []).map(c => c.name);
                    if (colNames.includes('food_notes')) {
                      insertCols += ', food_notes';
                      insertVals += ', ?';
                      insertParams.splice(insertParams.length - 1, 0, food_notes || null);
                    }
                    if (colNames.includes('drink_notes')) {
                      insertCols += ', drink_notes';
                      insertVals += ', ?';
                      insertParams.splice(insertParams.length - 1, 0, drink_notes || null);
                    }
                    if (colNames.includes('general_notes')) {
                      insertCols += ', general_notes';
                      insertVals += ', ?';
                      insertParams.splice(insertParams.length - 1, 0, general_notes || null);
                    } else {
                      insertCols += ', general_notes';
                      insertVals += ', ?';
                      insertParams.splice(insertParams.length - 1, 0, general_notes || null);
                    }
                  } catch (e) {
                    insertCols += ', general_notes';
                    insertVals += ', ?';
                    insertParams.splice(insertParams.length - 1, 0, general_notes || null);
                  }
                  
                  db.run(`
                    INSERT INTO orders (${insertCols})
                    VALUES (${insertVals})
                  `, insertParams, function(err2) {
                    if (err2) reject(err2);
                    else resolve(this.lastID);
                  });
                } else if (existingOrder) {
                  resolve(existingOrder.id);
                } else {
                  reject(err);
                }
              });
            } else if (err) {
              // Dacă platform nu există, încercă fără platform
              db.run(`
                INSERT INTO orders (
                  type, order_source, table_number, items, total, payment_method,
                  status, general_notes, timestamp, is_paid,
                  customer_name, customer_phone, delivery_address,
                  car_plate, lane_number, split_bill, client_identifier
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                type,
                order_source,
                table || null,
                JSON.stringify(itemsWithBenefits), // Folosește itemsWithBenefits cu name + benefit products
                calculatedTotal,
                payment_method || null,
                'pending',
                notes?.general || notes || null,
                req.body.is_paid !== undefined ? (req.body.is_paid ? 1 : 0) : (payment_method && (payment_method === 'card' || payment_method === 'online') ? 1 : 0), // is_paid: folosește din payload sau calculează
                customer?.name || null,
                customer?.phone || null,
                delivery?.address || null,
                drive_thru?.car_plate || null,
                drive_thru?.lane_number || null,
                splitBillData ? JSON.stringify(splitBillData) : null,
                clientIdentifier
              ], function(err2) {
                if (err2) reject(err2);
                else resolve(this.lastID);
              });
            } else {
              resolve(this.lastID);
            }
          });
        } else {
          // Verifică dacă există coloana platform
          const hasPlatform = Array.isArray(columns) && columns.some(col => col.name === 'platform');
          const hasClientIdentifier = Array.isArray(columns) && columns.some(col => col.name === 'client_identifier');
          const hasIdempotencyKey = Array.isArray(columns) && columns.some(col => col.name === 'idempotency_key');
          const hasFoodNotes = Array.isArray(columns) && columns.some(col => col.name === 'food_notes');
          const hasDrinkNotes = Array.isArray(columns) && columns.some(col => col.name === 'drink_notes');
          
          if (hasPlatform && hasClientIdentifier && hasIdempotencyKey) {
            // Construiește query-ul dinamic în funcție de coloanele disponibile
            let insertCols = 'type, order_source, platform, table_number, items, total, payment_method, status, timestamp, is_paid, customer_name, customer_phone, delivery_address, car_plate, lane_number, split_bill, client_identifier, idempotency_key';
            let insertVals = '?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), ?, ?, ?, ?, ?, ?, ?, ?, ?';
            let insertParams = [type, order_source, platform, table || null, JSON.stringify(itemsWithBenefits), calculatedTotal, payment_method || null, 'pending', payment_method ? 1 : 0, customer?.name || null, customer?.phone || null, delivery?.address || null, drive_thru?.car_plate || null, drive_thru?.lane_number || null, splitBillData ? JSON.stringify(splitBillData) : null, clientIdentifier, idempotencyKey || null];
            
            // Adaugă coloanele pentru mențiuni dacă există
            if (hasFoodNotes) {
              insertCols += ', food_notes';
              insertVals += ', ?';
              insertParams.splice(insertParams.length - 2, 0, food_notes || null); // Inserează înainte de clientIdentifier
            }
            if (hasDrinkNotes) {
              insertCols += ', drink_notes';
              insertVals += ', ?';
              insertParams.splice(insertParams.length - 2, 0, drink_notes || null); // Inserează înainte de clientIdentifier
            }
            if (hasFoodNotes || hasDrinkNotes) {
              insertCols += ', general_notes';
              insertVals += ', ?';
              insertParams.splice(insertParams.length - 2, 0, general_notes || null); // Inserează înainte de clientIdentifier
            } else {
              insertCols += ', general_notes';
              insertVals += ', ?';
              insertParams.splice(insertParams.length - 2, 0, general_notes || null);
            }
            
            db.run(`
              INSERT INTO orders (${insertCols})
              VALUES (${insertVals})
            `, insertParams, function(err) {
              // 🔴 FIX 1: Protecție race condition - dacă idempotency_key există deja, returnează comanda existentă
              if (err && err.code === 'SQLITE_CONSTRAINT' && err.message.includes('idempotency_key')) {
                // Race condition: alt request a creat deja comanda cu același idempotency_key
                console.log(`🔄 [IDEMPOTENCY RACE] Constraint violation for idempotency_key ${idempotencyKey}, fetching existing order`);
                db.get('SELECT * FROM orders WHERE idempotency_key = ?', [idempotencyKey], (selectErr, existingOrder) => {
                  if (selectErr) reject(selectErr);
                  else if (existingOrder) {
                    // Returnează ID-ul comenzii existente
                    resolve(existingOrder.id);
                  } else {
                    reject(err); // Dacă nu găsește comanda, reject cu eroarea originală
                  }
                });
              } else if (err) reject(err);
              else resolve(this.lastID);
            });
          } else if (hasPlatform) {
            // Construiește query-ul dinamic în funcție de coloanele disponibile
            let insertCols = 'type, order_source, platform, table_number, items, total, payment_method, status, timestamp, is_paid, customer_name, customer_phone, delivery_address, car_plate, lane_number, split_bill';
            let insertVals = '?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), ?, ?, ?, ?, ?, ?, ?';
            let insertParams = [type, order_source, platform, table || null, JSON.stringify(itemsWithBenefits), calculatedTotal, payment_method || null, 'pending', payment_method ? 1 : 0, customer?.name || null, customer?.phone || null, delivery?.address || null, drive_thru?.car_plate || null, drive_thru?.lane_number || null, splitBillData ? JSON.stringify(splitBillData) : null];
            
            // Adaugă coloanele pentru mențiuni dacă există
            if (hasFoodNotes) {
              insertCols += ', food_notes';
              insertVals += ', ?';
              insertParams.splice(insertParams.length - 1, 0, food_notes || null);
            }
            if (hasDrinkNotes) {
              insertCols += ', drink_notes';
              insertVals += ', ?';
              insertParams.splice(insertParams.length - 1, 0, drink_notes || null);
            }
            if (hasFoodNotes || hasDrinkNotes) {
              insertCols += ', general_notes';
              insertVals += ', ?';
              insertParams.splice(insertParams.length - 1, 0, general_notes || null);
            } else {
              insertCols += ', general_notes';
              insertVals += ', ?';
              insertParams.splice(insertParams.length - 1, 0, general_notes || null);
            }
            
            db.run(`
              INSERT INTO orders (${insertCols})
              VALUES (${insertVals})
            `, insertParams, function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            });
          } else {
            // Fallback: fără platform
            let insertCols = 'type, order_source, table_number, items, total, payment_method, status, timestamp, is_paid, customer_name, customer_phone, delivery_address, car_plate, lane_number, split_bill';
            let insertVals = '?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), ?, ?, ?, ?, ?, ?, ?';
            let insertParams = [type, order_source, table || null, JSON.stringify(itemsWithBenefits), calculatedTotal, payment_method || null, 'pending', payment_method ? 1 : 0, customer?.name || null, customer?.phone || null, delivery?.address || null, drive_thru?.car_plate || null, drive_thru?.lane_number || null, splitBillData ? JSON.stringify(splitBillData) : null];
            
            // Adaugă coloanele pentru mențiuni dacă există
            if (hasFoodNotes) {
              insertCols += ', food_notes';
              insertVals += ', ?';
              insertParams.splice(insertParams.length - 1, 0, food_notes || null);
            }
            if (hasDrinkNotes) {
              insertCols += ', drink_notes';
              insertVals += ', ?';
              insertParams.splice(insertParams.length - 1, 0, drink_notes || null);
            }
            if (hasFoodNotes || hasDrinkNotes) {
              insertCols += ', general_notes';
              insertVals += ', ?';
              insertParams.splice(insertParams.length - 1, 0, general_notes || null);
            } else {
              insertCols += ', general_notes';
              insertVals += ', ?';
              insertParams.splice(insertParams.length - 1, 0, general_notes || null);
            }
            
            db.run(`
              INSERT INTO orders (${insertCols})
              VALUES (${insertVals})
            `, insertParams, function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            });
          }
        }
      });
    });

    // Insert order_items if table exists (folosește enrichedItems deja populat mai sus)
    try {
      const orderItemsExists = await db.get(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='order_items'
      `);

      if (orderItemsExists) {
        for (const item of itemsWithBenefits) {
          await new Promise((resolve, reject) => {
            db.run(`
              INSERT INTO order_items (
                order_id, product_id, name, quantity, price, total,
                notes, customizations, station, category_id
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              orderId,
              item.product_id || item.id || null,
              item.name || '',
              item.quantity || 1,
              item.price || 0,
              (item.price || 0) * (item.quantity || 1),
              item.notes || null,
              item.customizations ? JSON.stringify(item.customizations) : null,
              item.station || null,
              item.category_id || null
            ], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Error inserting order_items:', error.message);
      // Continue even if order_items fails
    }

    // ✅ Emite evenimente complete prin orderEventBus (uniformitate)
    const { orderEventBus } = require('../order.events');
    const orderForEvents = {
      id: orderId,
      type: type,
      platform: platform || 'POS',
      order_source: req.body.order_source || 'POS',
      items: itemsWithBenefits,
      table_number: table,
      total: calculatedTotal,
      customer_name: customer?.name,
      customer_phone: customer?.phone,
      delivery_address: delivery?.address,
      payment_method: payment_method,
      is_paid: is_paid || 0,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    // Folosește metoda centralizată pentru emitere evenimente
    orderEventBus.emitOrderCreated(orderForEvents, global.io);
    
    // Emit Socket.io events (păstrăm pentru backward compatibility)
    if (global.io) {
      // Event general pentru KDS - folosește enrichedItems cu name populat
      global.io.emit('order:new', {
        orderId,
        type,
        items: enrichedItems, // Folosește enrichedItems în loc de items
        table,
        total,
        platform: platform || 'POS',
        customer_name: customer?.name,
        customer_phone: customer?.phone,
        delivery_address: delivery?.address,
      });
      
      // Event specific pentru comenzile din aplicația mobilă
      if (platform === 'MOBILE_APP') {
        if (isMobileTableOrder) {
          // Comandă de la masă prin aplicația mobilă (scanare QR)
          // Tratează ca o comandă normală la masă, dar cu platform='MOBILE_APP'
          console.log(`📱 [Mobile Table Order] Comandă #${orderId} de la masa ${table} prin aplicația mobilă (QR scan)`);
          
          // Emite event pentru KDS și ospătari (ca o comandă normală la masă)
          global.io.emit('order:table', {
            orderId,
            tableNumber: table,
            type: 'dine_in',
            items,
            total: calculatedTotal,
            platform: 'MOBILE_APP',
            customer_name: customer?.name || 'Client',
            customer_phone: customer?.phone || '',
            customer_email: customer?.email || clientIdentifier,
            timestamp: new Date().toISOString(),
            status: 'pending',
            notes: notes?.general || notes || null,
          });
        } else if (isMobileOnlineOrder) {
          // Comandă online din aplicația mobilă (de acasă)
          if (type === 'pickup' || type === 'takeout') {
            // Comandă pickup - notifică ospătarii în livrare1-10.html
            console.log(`📱 [Mobile Online Order] Comandă pickup #${orderId} din aplicația mobilă (online)`);
            global.io.emit('mobile:pickup-order', {
              orderId,
              type: 'pickup',
              customer_name: customer?.name || 'Client',
              customer_phone: customer?.phone || '',
              customer_email: customer?.email || clientIdentifier,
              items,
              total: calculatedTotal,
              payment_method: payment_method || 'cash',
              timestamp: new Date().toISOString(),
              status: 'pending',
              notes: notes?.general || notes || null,
            });
          } else if (type === 'delivery') {
            // Comandă delivery - notifică ospătarii și sistemul de delivery
            console.log(`📱 [Mobile Online Order] Comandă delivery #${orderId} din aplicația mobilă (online)`);
            global.io.emit('mobile:delivery-order', {
              orderId,
              type: 'delivery',
              customer_name: customer?.name || 'Client',
              customer_phone: customer?.phone || '',
              customer_email: customer?.email || clientIdentifier,
              delivery_address: delivery?.address || '',
              items,
              total: calculatedTotal,
              payment_method: payment_method || 'cash',
              pickup_type: req.body.pickup_type || 'PLATFORM_COURIER',
              timestamp: new Date().toISOString(),
              status: 'pending',
              notes: notes?.general || notes || null,
            });
            
            // Event pentru sistemul de delivery
            global.io.emit('delivery:new-order', {
              orderId,
              platform: 'MOBILE_APP',
              customerName: customer?.name || 'Client',
              deliveryAddress: delivery?.address || '',
              total: calculatedTotal,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    }

    // 🔴 FIX 3 - Trimite notificare email pentru comandă nouă
    // NOTĂ: Dacă ajungem aici, comanda este NOUĂ (comenzile idempotente se întorc mai devreme, la linia ~869)
    // Fail-safe: dacă email eșuează, NU blochează comanda (folosim setImmediate pentru a nu bloca răspunsul HTTP)
    setImmediate(async () => {
      try {
        const emailService = require('../../../services/email.service');
        
        // Obține comanda completă pentru email
        const fullOrder = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
        
        if (fullOrder) {
          // Parse items dacă este string
          if (fullOrder.items && typeof fullOrder.items === 'string') {
            try {
              fullOrder.items = JSON.parse(fullOrder.items);
            } catch (e) {
              fullOrder.items = [];
            }
          }
          
          // Trimite email (fail-safe: nu blochează dacă eșuează)
          await emailService.sendOrderNotificationEmail(fullOrder);
        }
      } catch (emailError) {
        // ⚠️ IMPORTANT: NU logăm ca eroare critică, doar warning
        // Email-ul nu trebuie să blocheze comanda
        console.warn('⚠️ [Order Controller] Failed to send order notification email:', emailError.message);
      }
    });

    // ✅ CRITICAL: Process order through unified pipeline (automatic stock consumption)
    // This ensures ALL orders consume stock automatically, regardless of source
    // Works for ALL platforms: Tazz, Wolt, Glovo, Bolt, Uber Eats, Friends Ride, RestorApp, POS, Kiosk, QR, Site propriu, etc.
    const orderProcessingPipeline = require('../services/order-processing-pipeline.service');
    orderProcessingPipeline.processOrderAfterCreation(orderId, {
      id: orderId,
      platform: platform,
      order_source: orderData.order_source || req.body.order_source,
      items: JSON.stringify(items),
      total: calculatedTotal,
      payment_method: payment_method,
      is_paid: is_paid || 0,
      status: 'pending'
    }).catch(error => {
      // Log but don't fail the request if pipeline processing fails
      console.warn(`⚠️ [OrderPipeline] Failed to process order ${orderId}:`, error.message);
    });

    res.json({
      success: true,
      order_id: orderId, // Pentru compatibilitate cu RestorApp
      orderId: orderId, // Pentru compatibilitate cu alte clienti
      order: {
        id: orderId,
        status: 'pending',
        total: calculatedTotal,
        type: type,
        platform: platform || 'MOBILE_APP'
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    next(error);
  }
}

// GET /api/orders/table/:tableId
async function getOrderByTable(req, res, next) {
  try {
    const { tableId } = req.params;
    
    // Așteaptă DB să fie gata (cu timeout)
    let db;
    try {
      db = await Promise.race([
        dbPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
      ]);
    } catch (dbError) {
      console.warn('⚠️ Database not ready for getOrderByTable:', dbError.message);
      return res.json({
        success: true,
        order: null
      });
    }
    
    let orders = [];
    try {
      orders = await new Promise((resolve, reject) => {
        db.all(`
          SELECT * FROM orders 
          WHERE table_number = ? AND status != 'cancelled' AND status != 'paid'
          ORDER BY timestamp DESC
          LIMIT 1
        `, [tableId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } catch (error) {
      console.warn('⚠️ Error fetching order by table:', error.message);
      orders = [];
    }
    
    // Returnează primul order sau null pentru compatibilitate cu frontend
    const order = orders.length > 0 ? orders[0] : null;
    
    // Parse items dacă este string
    if (order && order.items && typeof order.items === 'string') {
      try {
        order.items = JSON.parse(order.items);
      } catch (e) {
        order.items = [];
      }
    }
    
    res.json(order || null);
  } catch (error) {
    console.error('❌ Error in getOrderByTable:', error.message);
    // Returnează null în loc de 500 pentru a preveni crash-ul paginii
    res.json(null);
  }
}

// POST /api/orders/:id/cancel
async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const db = await dbPromise;
    
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }
    
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Comanda este deja anulată' });
    }
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE orders 
        SET status = 'cancelled', 
            cancelled_timestamp = datetime('now'),
            cancelled_reason = ?
        WHERE id = ?
      `, [reason || 'Anulată de utilizator', id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    if (global.io) {
      global.io.emit('order:cancelled', { orderId: id, reason });
    }
    
    // Emit alert for order cancellation
    const AlertsService = require('../../alerts/alerts.service');
    AlertsService.alertOrderCancelled(order, reason || 'Anulată de utilizator', order.platform);
    
    res.json({ success: true, message: 'Comandă anulată cu succes' });
  } catch (error) {
    next(error);
  }
}

// 🔴 FIX 4 - POST /api/orders/:id/accept - Acceptă comandă
async function acceptOrder(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    // Obține comanda
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Comandă negăsită' 
      });
    }
    
    // Verifică dacă comanda poate fi acceptată
    if (order.status === 'cancelled' || order.status === 'completed') {
      return res.status(400).json({ 
        success: false,
        error: `Comanda nu poate fi acceptată (status: ${order.status})` 
      });
    }
    
    // Actualizează status-ul la 'pending' (dacă era 'awaiting_acceptance') sau păstrează 'pending'
    const newStatus = order.status === 'awaiting_acceptance' ? 'pending' : order.status;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE orders 
        SET status = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [newStatus, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Emit Socket.io event pentru client
    if (global.io) {
      global.io.emit('order:accepted', { 
        orderId: id,
        status: newStatus,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ Order #${id} accepted (status: ${newStatus})`);
    
    res.json({ 
      success: true, 
      message: 'Comandă acceptată',
      order_id: id,
      status: newStatus
    });
  } catch (error) {
    console.error('❌ Error in acceptOrder:', error);
    next(error);
  }
}

// 🔴 FIX 4 - POST /api/orders/:id/reject - Refuză comandă
async function rejectOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const db = await dbPromise;
    
    // Obține comanda
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Comandă negăsită' 
      });
    }
    
    // Verifică dacă comanda poate fi refuzată
    if (order.status === 'cancelled' || order.status === 'completed') {
      return res.status(400).json({ 
        success: false,
        error: `Comanda nu poate fi refuzată (status: ${order.status})` 
      });
    }
    
    // Actualizează status-ul la 'cancelled'
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE orders 
        SET status = 'cancelled', 
            general_notes = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `, [reason || 'Refuzată de restaurant', id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Emit Socket.io event pentru client
    if (global.io) {
      global.io.emit('order:rejected', { 
        orderId: id,
        status: 'cancelled',
        reason: reason || 'Refuzată de restaurant',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`❌ Order #${id} rejected (reason: ${reason || 'N/A'})`);
    
    res.json({ 
      success: true, 
      message: 'Comandă refuzată',
      order_id: id,
      status: 'cancelled'
    });
  } catch (error) {
    console.error('❌ Error in rejectOrder:', error);
    next(error);
  }
}

// PUT /api/orders/:id/complete-items
async function completeOrderItems(req, res, next) {
  try {
    const { id } = req.params;
    const { itemIds } = req.body; // Array of item IDs to complete
    const db = await dbPromise;
    
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }
    
    let items = [];
    if (order.items) {
      if (typeof order.items === 'string') {
        try {
          items = JSON.parse(order.items);
        } catch (e) {
          items = [];
        }
      } else if (Array.isArray(order.items)) {
        items = order.items;
      }
    }
    
    // If no items, return success (nothing to complete)
    if (!items || items.length === 0) {
      return res.json({ success: true, message: 'Nu există item-uri de finalizat' });
    }
    
    // ✅ FIX: Mark specified items as completed (setează status: 'completed' pentru items)
    if (itemIds && Array.isArray(itemIds) && itemIds.length > 0) {
      items = items.map(item => {
        // Verifică dacă itemId se potrivește (poate fi itemId, id, item_id, etc.)
        const matchesItemId = itemIds.some(id => 
          id === item.itemId || 
          id === item.item_id || 
          id === item.id || 
          id === item.line_id ||
          String(id) === String(item.itemId) ||
          String(id) === String(item.item_id) ||
          String(id) === String(item.id) ||
          String(id) === String(item.line_id)
        );
        
        if (matchesItemId) {
          return { 
            ...item, 
            completed: true, 
            completed_at: new Date().toISOString(),
            status: 'completed', // ✅ Setează status: 'completed' pentru item
            item_status: 'completed' // ✅ Setează și item_status pentru compatibilitate
          };
        }
        return item;
      });
    } else {
      // Mark all items as completed
      items = items.map(item => ({
        ...item,
        completed: true,
        completed_at: new Date().toISOString(),
        status: 'completed', // ✅ Setează status: 'completed' pentru item
        item_status: 'completed' // ✅ Setează și item_status pentru compatibilitate
      }));
    }
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE orders 
        SET items = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `, [JSON.stringify(items), id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // ✅ EMIT order:item_ready event so livrare1.html receives notifications
    if (global.io) {
      const updatedOrder = {
        ...order,
        items: items  // Include the updated items array
      };
      global.io.emit('order:item_ready', { 
        order: updatedOrder,
        itemIds: itemIds,
        station: req.body.station || 'Bucătărie',
        station_name: req.body.station_name || 'Bucătărie',
        station_type: req.body.station_type || 'kitchen'
      });
      
      // Also emit for legacy compatibility
      global.io.emit('order:items-completed', { orderId: id, itemIds });
    }
    
    res.json({ success: true, message: 'Item-uri marcate ca finalizate' });
  } catch (error) {
    console.error('❌ Error in completeOrderItems:', error);
    // Return safe default instead of crashing
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Eroare la finalizarea item-urilor' 
    });
  }
}

// PUT /api/orders/:id/complete
async function completeOrder(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE orders 
        SET status = 'completed',
            completed_timestamp = datetime('now'),
            updated_at = datetime('now')
        WHERE id = ?
      `, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // PHASE PRODUCTION-READY: Consume stock automatically when order is completed
    // Works for ALL platforms (MOBILE_APP, GLOVO, WOLT, FRIENDSRIDE, POS, KIOSK, etc.)
    try {
      const stockService = require('../../stocks/services/stockConsumption.service');
      
      // Get order to determine platform
      const order = await new Promise((resolve, reject) => {
        db.get('SELECT platform FROM orders WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      // Determine source based on platform
      const platform = order?.platform || 'POS';
      const sourceMap = {
        'MOBILE_APP': 'MOBILE_APP',
        'FRIENDSRIDE': 'FRIENDSRIDE',
        'GLOVO': 'GLOVO',
        'WOLT': 'WOLT',
        'UBER_EATS': 'UBER_EATS',
        'BOLT_FOOD': 'BOLT_FOOD',
        'KIOSK': 'KIOSK',
        'PHONE': 'PHONE',
        'POS': 'POS'
      };
      const source = sourceMap[platform] || 'POS';
      
      await stockService.consumeStockForOrder(parseInt(id), {
        reason: 'ORDER_COMPLETED',
        source: source
      });
      
      console.log(`✅ Stock consumed for order ${id} from platform ${platform}`);
    } catch (stockError) {
      // Log but don't fail the request if stock consumption fails
      console.warn(`⚠️ Stock consumption failed for order ${id}:`, stockError.message);
    }
    
    if (global.io) {
      global.io.emit('order:completed', { orderId: id });
    }
    
    res.json({ success: true, message: 'Comandă finalizată cu succes' });
  } catch (error) {
    console.error('❌ Error in completeOrder:', error);
    // Return safe default instead of crashing
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Eroare la finalizarea comenzii' 
    });
  }
}

// POST /api/orders/:id/ready
// Marchează o comandă ca "ready" (gata) - pentru Bar/KDS
// După marcare, comenzile takeaway sunt trimise către livrare1.html (waiter room)
async function markOrderReady(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    // Obține comanda completă
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }
    
    // Actualizează statusul la 'ready' (NU 'completed' - asta se face doar când este livrată)
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE orders 
        SET status = 'ready',
            updated_at = datetime('now')
        WHERE id = ?
      `, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Parse items pentru a trimite evenimentul complet
    let items = [];
    if (order.items) {
      if (typeof order.items === 'string') {
        try {
          items = JSON.parse(order.items);
        } catch (e) {
          items = [];
        }
      } else if (Array.isArray(order.items)) {
        items = order.items;
      }
    }
    
    // Construiește obiectul order pentru evenimente
    const orderForEvents = {
      id: parseInt(id),
      type: order.type,
      status: 'ready',
      items: items,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      delivery_address: order.delivery_address,
      table: order.table_number,
      total: order.total,
      platform: order.platform || 'POS',
      timestamp: new Date().toISOString()
    };
    
    // 🔴 FIX: Pentru comenzile cu livrare la adresă, atribuie automat un curier disponibil când comanda devine "ready"
    if ((order.type === 'delivery' || order.type === 'DELIVERY') && order.delivery_address) {
      try {
        const { getAvailableCouriers } = require('../../couriers/couriers.service');
        const availableCouriers = await getAvailableCouriers();
        
        if (availableCouriers && availableCouriers.length > 0) {
          // Alege curierul cu cel mai mic load (sau primul disponibil)
          const selectedCourier = availableCouriers[0];
          const deliveryFee = 15; // RON per delivery
          
          const db = await dbPromise;
          
          // Verifică dacă există deja assignment
          const existing = await new Promise((resolve, reject) => {
            db.get(
              'SELECT * FROM delivery_assignments WHERE order_id = ? AND status != "cancelled"',
              [id],
              (err, row) => {
                if (err) reject(err);
                else resolve(row);
              }
            );
          });
          
          // Dacă nu există assignment, creează unul nou
          if (!existing) {
            await new Promise((resolve, reject) => {
              db.run(`
                INSERT INTO delivery_assignments (order_id, courier_id, status, delivery_fee, assigned_at)
                VALUES (?, ?, 'assigned', ?, datetime('now'))
              `, [id, selectedCourier.id, deliveryFee], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
              });
            });
            
            console.log(`✅ Comandă #${id} (delivery) atribuită automat curierului ${selectedCourier.name} (ID: ${selectedCourier.id})`);
          }
        }
      } catch (err) {
        console.error(`❌ Eroare la atribuirea automată a curierului pentru comanda #${id}:`, err);
        // Nu oprește procesarea comenzii dacă atribuirea automată eșuează
      }
    }
    
    // Emite evenimentul order:ready prin event bus
    const { orderEventBus } = require('../order.events');
    orderEventBus.emitOrderReady(orderForEvents, global.io);
    
    // Emite și prin Socket.IO direct pentru backward compatibility
    if (global.io) {
      // Emite eveniment global pentru toți clienții
      global.io.emit('order:ready', { order: orderForEvents });
      global.io.emit('orderUpdated', { orderId: parseInt(id), status: 'ready' });
      
      // Pentru comenzile takeaway/pickup/delivery, trimite către waiter room (livrare1.html)
      const isTakeawayOrDelivery = order.type === 'takeaway' || order.type === 'pickup' || 
                                    order.type === 'TAKEAWAY' || order.type === 'PICKUP' ||
                                    order.type === 'delivery' || order.type === 'DELIVERY';
      
      if (isTakeawayOrDelivery) {
        // Trimite către waiter room
        global.io.to('waiter').emit('order:ready', { order: orderForEvents });
        global.io.to('waiter').emit('orderUpdated', { orderId: parseInt(id), status: 'ready' });
        
        // Determinați tipul comenzii pentru mesaj
        let orderTypeLabel = 'Takeaway';
        if (order.type === 'delivery' || order.type === 'DELIVERY') {
          orderTypeLabel = 'Delivery';
        } else if (order.type === 'pickup' || order.type === 'PICKUP') {
          orderTypeLabel = 'Pickup';
        }
        
        // Trimite notificare specifică pentru ospătari (cu audio și vizual)
        global.io.to('waiter').emit('notification:new', {
          id: `notif_${id}_${Date.now()}`,
          title: `🍽️ Comandă gata`,
          title_en: `🍽️ Order ready`,
          message: `Comanda #${id} (${orderTypeLabel}) este gata.`,
          message_en: `Order #${id} (${orderTypeLabel}) is ready.`,
          type: 'orderReady',
          order_id: parseInt(id),
          table_number: order.table_number || null,
          status: 'unread',
          created_at: new Date().toISOString(),
          timestamp: Date.now(),
          playSound: true, // Activează sunetul
          showVisual: true // Activează notificarea vizuală
        });
        
        console.log(`✅ [MarkOrderReady] Comandă #${id} (${orderTypeLabel}) marcată ca ready și trimisă către waiter room (livrare1.html)`);
        console.log(`✅ [MarkOrderReady] Socket.IO events emitted: order:ready, orderUpdated, notification:new`);
      }
    }
    
    res.json({ success: true, message: 'Comandă marcată ca gata' });
  } catch (error) {
    console.error('❌ Error in markOrderReady:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Eroare la marcarea comenzii ca gata' 
    });
  }
}

// PUT /api/orders/:id/reset-items-to-pending
async function resetItemsToPending(req, res, next) {
  try {
    const { id } = req.params;
    const { itemIds } = req.body; // Array of item IDs to reset
    const db = await dbPromise;
    
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }
    
    let items = [];
    if (order.items) {
      if (typeof order.items === 'string') {
        try {
          items = JSON.parse(order.items);
        } catch (e) {
          items = [];
        }
      } else if (Array.isArray(order.items)) {
        items = order.items;
      }
    }
    
    // If no items, return success (nothing to reset)
    if (!items || items.length === 0) {
      return res.json({ success: true, message: 'Nu există item-uri de resetat' });
    }
    
    // Reset specified items to pending
    if (itemIds && Array.isArray(itemIds) && itemIds.length > 0) {
      items = items.map(item => {
        if (itemIds.includes(item.id || item.name)) {
          const { completed, completed_at, ...rest } = item;
          return rest;
        }
        return item;
      });
    } else {
      // Reset all items to pending
      items = items.map(item => {
        const { completed, completed_at, ...rest } = item;
        return rest;
      });
    }
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE orders 
        SET items = ?,
            status = 'pending',
            updated_at = datetime('now')
        WHERE id = ?
      `, [JSON.stringify(items), id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    if (global.io) {
      global.io.emit('order:items-reset', { orderId: id, itemIds });
    }
    
    res.json({ success: true, message: 'Item-uri resetate la pending' });
  } catch (error) {
    console.error('❌ Error in resetItemsToPending:', error);
    // Return safe default instead of crashing
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Eroare la resetarea item-urilor' 
    });
  }
}

// POST /api/orders/:id/feedback
async function submitOrderFeedback(req, res, next) {
  try {
    const { id } = req.params;
    const { rating, comment, customerName } = req.body;
    const db = await dbPromise;
    
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }
    
    // Insert feedback into order_feedback table (create if not exists)
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS order_feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          rating INTEGER,
          comment TEXT,
          customer_name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id)
        )
      `, [], (err) => {
        if (err && !err.message.includes('already exists')) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO order_feedback (order_id, rating, comment, customer_name)
        VALUES (?, ?, ?, ?)
      `, [id, rating, comment, customerName], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, message: 'Feedback trimis cu succes' });
  } catch (error) {
    console.error('❌ Error in submitOrderFeedback:', error);
    next(error);
  }
}

module.exports = {
  cancelDelivery,
  getCancellations,
  approveCancellation,
  getReceipt,
  getOrderTracking,
  createOrder,
  getOrderByTable,
  cancelOrder,
  acceptOrder,
  rejectOrder,
  checkAdminAuth,
  completeOrderItems,
  completeOrder,
  markOrderReady,
  resetItemsToPending,
  submitOrderFeedback,
};

