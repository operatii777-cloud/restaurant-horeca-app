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
const { dbPromise } = require('../../../database');
// PHASE S8.4 - TVA System v2
const TVAService = require('../../tva/tva.service');
// PHASE S8.6 - Fiscal Codes (NCM/CN)
const FiscalCodesService = require('../../fiscal-codes/fiscalCodes.service');
// PHASE S8.7 - ANAF Submit v2
const AnafSubmitService = require('../../anaf-submit/anafSubmit.service');

class UBLGeneratorService {
  /**
   * PHASE S8.2 - Create UBL 2.1 invoice for an order
   * 
   * @param {number} orderId - Order ID
   * @param {Object} client - Client information
   * @returns {Promise<string>} UBL 2.1 XML string
   */
  async createInvoice(orderId, client) {
    const db = await dbPromise;
    
    // Get order with items
    const order = await this.getOrder(db, orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Get company info
    const company = await this.getCompanyInfo();

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
            const fiscalCode = await FiscalCodesService.getFiscalCodeForProduct(item.product_id, orderDate);
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
                   'vat_rate', COALESCE(p.vat_rate, 19)
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
   */
  async getCompanyInfo() {
    return {
      name: process.env.COMPANY_NAME || 'Restaurant Name',
      cui: process.env.COMPANY_CUI || '',
      address: process.env.COMPANY_ADDRESS || '',
      phone: process.env.COMPANY_PHONE || '',
      email: process.env.COMPANY_EMAIL || ''
    };
  }
}

module.exports = new UBLGeneratorService();
