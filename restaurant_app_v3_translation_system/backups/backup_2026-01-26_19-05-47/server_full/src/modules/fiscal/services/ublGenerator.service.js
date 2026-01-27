/**
 * PHASE E10.2 - UBL Generator Service
 * PHASE S8.1 - Refactored to use UBL Core
 * PHASE S8.2 - Enterprise e-Factura for Orders
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Generates UBL 2.1 compliant XML invoices for orders.
 */

const { buildUblInvoice } = require('../../ubl');
const { dbPromise } = require('../../../../database');
// PHASE S8.4 - TVA System v2
// TVA Service is TypeScript - try to load, fallback to null if fails
let TVAService = null;
try {
  TVAService = require('../../tva/tva.service');
} catch (err) {
  // TVA Service (TypeScript) not available - using fallback VAT rates
  // This is expected if TypeScript modules are not compiled
  TVAService = {
    getVatRateForProduct: async () => 21, // Default 21% VAT (România 2024)
    getVatRateAt: async () => 21
  };
}
// PHASE S8.6 - Fiscal Codes (NCM/CN)
// Fiscal Codes Service is TypeScript - try to load, fallback to null if fails
let FiscalCodesService = null;
try {
  FiscalCodesService = require('../../fiscal-codes/fiscalCodes.service');
} catch (error) {
  // Fiscal Codes Service (TypeScript) not available - continuing without it
  // This is expected if TypeScript modules are not compiled
}
// PHASE S8.7 - ANAF Submit v2
// ANAF Submit Service is TypeScript - try to load, fallback to null if fails
let AnafSubmitService = null;
try {
  AnafSubmitService = require('../../anaf-submit/anafSubmit.service');
} catch (error) {
  // ANAF Submit Service (TypeScript) not available - continuing without it
  // This is expected if TypeScript modules are not compiled
}

class UBLGeneratorService {
  /**
   * PHASE S8.2 - Create UBL 2.1 invoice for an order
   * 
   * @param {number} orderId - Order ID
   * @param {Object} client - Client information
   * @param {Object} companyInfo - Company/supplier info (optional, will be loaded if not provided)
   * @returns {Promise<string>} UBL 2.1 XML string
   */
  async createInvoice(orderId, client, companyInfo = null) {
    const db = await dbPromise;
    
    // Get order with items
    const order = await this.getOrder(db, orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Use provided company info or fetch from settings
    const company = companyInfo || await this.getCompanyInfo();

    // PHASE S8.2 - Map order to InvoiceDTO using UBL Core (PHASE S8.4 - async for TVA v2)
    const invoiceDTO = await this.mapOrderToInvoiceDTO(order, client, company);

    // Build UBL 2.1 XML using UBL Core
    const xml = buildUblInvoice(invoiceDTO);
    
    // PHASE S8.7 - Queue for ANAF submission (if auto-submit enabled)
    if (process.env.ANAF_AUTO_SUBMIT === 'true') {
      try {
        await AnafSubmitService.queueDocument('ORDER', orderId, xml, 'normal');
        console.log(`[UBL Generator] UBL queued for ANAF submission: order ${orderId}`);
      } catch (queueError) {
        console.warn('[UBL Generator] Failed to queue for ANAF submission:', queueError.message);
      }
    }
    
    return xml;
  }

  /**
   * PHASE S8.2 - Map order to InvoiceDTO
   * 
   * Central function for converting order data to UBL InvoiceDTO
   * 
   * @param {Object} order - Order object with items
   * @param {Object} client - Client information
   * @param {Object} companyInfo - Company information
   * @returns {Object} InvoiceDTO for UBL Core
   */
  async mapOrderToInvoiceDTO(order, client, companyInfo) {
    const orderDate = order.timestamp ? new Date(order.timestamp) : new Date();
    
    // Ensure items array exists
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    
    // Calculate invoice lines (PHASE S8.4 - uses TVA System v2, PHASE S8.6 - uses Fiscal Codes)
    const invoiceLines = await Promise.all(
      order.items.map(async (item, index) => {
        const lineExtensionAmount = item.price * item.quantity;
        
        // PHASE S8.4 - Use TVA System v2
        const vatRate = item.product_id 
          ? await TVAService.getVatRateForProduct(item.product_id, orderDate)
          : await TVAService.getVatRateAt(orderDate, 'standard');
        
        // PHASE S8.6 - Get NCM code for product
        let commodityCode = null;
        if (item.product_id) {
          try {
            let fiscalCode = null;
            if (FiscalCodesService) {
              try {
                fiscalCode = await FiscalCodesService.getFiscalCodeForProduct(item.product_id, orderDate);
              } catch (error) {
                console.warn('⚠️ Error getting fiscal code:', error.message);
              }
            }
            commodityCode = fiscalCode?.ncmCode || fiscalCode?.cnCode || null;
          } catch (err) {
            console.warn(`[UBL Generator] Failed to get fiscal code for product ${item.product_id}:`, err.message);
          }
        }
        
        return {
          name: item.product_name || `Product ${index + 1}`,
          quantity: item.quantity,
          unitPrice: item.price,
          lineExtensionAmount: lineExtensionAmount,
          vatRate: vatRate,
          taxCategoryCode: 'S',
          commodityCode: commodityCode
        };
      })
    );

    // Calculate totals
    const taxExclusiveAmount = invoiceLines.reduce((sum, line) => sum + line.lineExtensionAmount, 0);
    
    // Group tax subtotals by VAT rate
    const taxSubtotalsMap = new Map();
    invoiceLines.forEach(line => {
      const vatRate = line.vatRate;
      if (!taxSubtotalsMap.has(vatRate)) {
        taxSubtotalsMap.set(vatRate, {
          taxableAmount: 0,
          taxAmount: 0,
          percent: vatRate,
          categoryCode: 'S'
        });
      }
      const subtotal = taxSubtotalsMap.get(vatRate);
      subtotal.taxableAmount += line.lineExtensionAmount;
      subtotal.taxAmount += line.lineExtensionAmount * vatRate / 100;
    });
    const taxSubtotals = Array.from(taxSubtotalsMap.values());
    
    const totalVAT = taxSubtotals.reduce((sum, subtotal) => sum + subtotal.taxAmount, 0);
    const taxInclusiveAmount = taxExclusiveAmount + totalVAT;

    // Build InvoiceDTO
    return {
      invoiceNumber: `INV-${order.id}`,
      issueDate: new Date(),
      invoiceTypeCode: '380',
      documentCurrencyCode: 'RON',
      supplier: {
        name: companyInfo.name,
        cui: companyInfo.cui,
        address: {
          street: companyInfo.address,
          countryCode: 'RO'
        },
        contact: {
          telephone: companyInfo.phone,
          email: companyInfo.email
        }
      },
      customer: {
        name: client.name || 'Client',
        cui: client.cui || null,
        address: {
          street: client.address || '',
          countryCode: 'RO'
        }
      },
      invoiceLines: invoiceLines,
      taxExclusiveAmount: taxExclusiveAmount,
      taxInclusiveAmount: taxInclusiveAmount,
      payableAmount: taxInclusiveAmount,
      taxSubtotals: taxSubtotals,
      paymentMeans: {
        code: '30'
      },
      orderReference: String(order.id)
    };
  }

  // ========================================
  // PRIVATE HELPERS
  // ========================================

  /**
   * PHASE S8.2 - Get order with items from database
   * Exposed for use by eFactura.service.js
   */
  async getOrder(db, orderId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT o.*, 
               json_group_array(
                 json_object(
                   'id', oi.id,
                   'product_id', oi.product_id,
                   'product_name', p.name,
                   'quantity', oi.quantity,
                   'price', oi.price,
                   'vat_rate', COALESCE(p.vat_rate, 21)
                 )
               ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN menu p ON oi.product_id = p.id
        WHERE o.id = ?
        GROUP BY o.id
      `, [orderId], (err, row) => {
        if (err) reject(err);
        else {
          if (row) {
            // Parse items if stored as JSON string
            if (typeof row.items === 'string') {
              row.items = JSON.parse(row.items || '[]');
            }
            row.total = row.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          }
          resolve(row);
        }
      });
    });
  }

  /**
   * PHASE S8.2 - Get company information
   * Exposed for use by eFactura.service.js
   * 
   * Priority: 1) Supplier from request 2) Environment variables 3) restaurant_settings table 4) settings table 5) Defaults
   */
  async getCompanyInfo(supplierFromRequest = null) {
    // 1) If supplier data is provided in the request, use it
    if (supplierFromRequest && supplierFromRequest.name && supplierFromRequest.cui) {
      console.log('[UBL Generator] Using supplier data from request:', supplierFromRequest.name);
      return {
        name: supplierFromRequest.name,
        cui: supplierFromRequest.cui,
        regCom: supplierFromRequest.regCom || '',
        address: supplierFromRequest.address || '',
        phone: supplierFromRequest.phone || '',
        email: supplierFromRequest.email || '',
        bank: supplierFromRequest.bank || '',
        iban: supplierFromRequest.iban || ''
      };
    }
    
    // 2) Try to get from environment
    let companyName = process.env.COMPANY_NAME;
    let companyCui = process.env.COMPANY_CUI;
    let companyAddress = process.env.COMPANY_ADDRESS;
    let companyPhone = process.env.COMPANY_PHONE;
    let companyEmail = process.env.COMPANY_EMAIL;
    let companyRegCom = process.env.COMPANY_REG_COM || '';
    let companyBank = process.env.COMPANY_BANK || '';
    let companyIban = process.env.COMPANY_IBAN || '';
    
    // 3) If not in env, try to get from restaurant_settings table (key-value format)
    if (!companyName || !companyCui) {
      try {
        const db = await dbPromise;
        
        // Check if restaurant_settings table exists and has the key-value structure
        const restaurantSettings = await new Promise((resolve, reject) => {
          db.all(`
            SELECT setting_key, setting_value FROM restaurant_settings 
            WHERE setting_key IN ('restaurant_name', 'restaurant_cui', 'restaurant_address', 
                                  'restaurant_phone', 'restaurant_email', 'restaurant_reg_com',
                                  'restaurant_bank', 'restaurant_iban')
          `, (err, rows) => {
            if (err) resolve([]);
            else resolve(rows || []);
          });
        });
        
        if (restaurantSettings.length > 0) {
          console.log('[UBL Generator] Loading company info from restaurant_settings table');
          restaurantSettings.forEach(setting => {
            if (setting.setting_key === 'restaurant_name' && !companyName) companyName = setting.setting_value;
            if (setting.setting_key === 'restaurant_cui' && !companyCui) companyCui = setting.setting_value;
            if (setting.setting_key === 'restaurant_address' && !companyAddress) companyAddress = setting.setting_value;
            if (setting.setting_key === 'restaurant_phone' && !companyPhone) companyPhone = setting.setting_value;
            if (setting.setting_key === 'restaurant_email' && !companyEmail) companyEmail = setting.setting_value;
            if (setting.setting_key === 'restaurant_reg_com' && !companyRegCom) companyRegCom = setting.setting_value;
            if (setting.setting_key === 'restaurant_bank' && !companyBank) companyBank = setting.setting_value;
            if (setting.setting_key === 'restaurant_iban' && !companyIban) companyIban = setting.setting_value;
          });
        }
      } catch (e) {
        console.warn('[UBL Generator] Could not load from restaurant_settings:', e.message);
      }
    }
    
    // 4) Fallback to old settings table format
    if (!companyName || !companyCui) {
      try {
        const db = await dbPromise;
        const settings = await new Promise((resolve, reject) => {
          db.all(`
            SELECT name, value FROM settings 
            WHERE name IN ('company_name', 'company_cui', 'company_address', 'company_phone', 'company_email')
          `, (err, rows) => {
            if (err) resolve([]);
            else resolve(rows || []);
          });
        });
        
        settings.forEach(setting => {
          if (setting.name === 'company_name' && !companyName) companyName = setting.value;
          if (setting.name === 'company_cui' && !companyCui) companyCui = setting.value;
          if (setting.name === 'company_address' && !companyAddress) companyAddress = setting.value;
          if (setting.name === 'company_phone' && !companyPhone) companyPhone = setting.value;
          if (setting.name === 'company_email' && !companyEmail) companyEmail = setting.value;
        });
      } catch (e) {
        console.warn('[UBL Generator] Could not load company settings from settings table:', e.message);
      }
    }
    
    // Log what we found
    if (companyName && companyCui) {
      console.log('[UBL Generator] Company info loaded:', companyName, companyCui);
    } else {
      console.warn('[UBL Generator] Using default company info - please configure restaurant settings!');
    }
    
    // 5) Return with defaults
    return {
      name: companyName || 'Restaurant Trattoria SRL',
      cui: companyCui || 'RO12345678',
      regCom: companyRegCom || '',
      address: companyAddress || 'Strada Principală nr. 1',
      phone: companyPhone || '',
      email: companyEmail || '',
      bank: companyBank || '',
      iban: companyIban || ''
    };
  }
}

module.exports = new UBLGeneratorService();

