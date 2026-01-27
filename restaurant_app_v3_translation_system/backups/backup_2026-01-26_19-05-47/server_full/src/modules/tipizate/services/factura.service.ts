/**
 * PHASE S4.3 - Factură Service
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateFactura } = require('../validators/factura.validators');
const { dbPromise } = require('../../../../database');

exports.facturaService = {
  async list(filters = {}) {
    // First, get facturi from tipizate_documents
    const tipizateDocs = await tipizateRepository.listByType('FACTURA', filters);
    
    // Also get e-Factura invoices from invoices table
    const db = await dbPromise;
    let invoicesQuery = `
      SELECT 
        id,
        order_id,
        invoice_number as number,
        invoice_series as series,
        COALESCE(created_at, datetime('now', 'localtime')) as date,
        status,
        client_name,
        client_cui,
        json_data,
        xml_content,
        spv_id,
        spv_response,
        'e-Factura' as source
      FROM invoices
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.from) {
      invoicesQuery += ` AND (DATE(created_at) >= DATE(?) OR created_at IS NULL)`;
      params.push(filters.from);
    }
    if (filters.to) {
      invoicesQuery += ` AND (DATE(created_at) <= DATE(?) OR created_at IS NULL)`;
      params.push(filters.to);
    }
    if (filters.status) {
      invoicesQuery += ` AND status = ?`;
      params.push(filters.status);
    }
    
    invoicesQuery += ` ORDER BY created_at DESC`;
    
    const eFacturaInvoices = await new Promise((resolve, reject) => {
      db.all(invoicesQuery, params, (err, rows) => {
        if (err) {
          console.error('❌ [factura.service] Error loading e-Factura invoices:', err);
          resolve([]);
        } else {
          // Transform e-Factura invoices to tipizate format
          const transformed = (rows || []).map(inv => {
            let total = 0;
            let taxAmount = 0;
            try {
              if (inv.json_data) {
                const jsonData = typeof inv.json_data === 'string' ? JSON.parse(inv.json_data) : inv.json_data;
                total = jsonData.taxInclusiveAmount || jsonData.total || 0;
                taxAmount = jsonData.taxSubtotals?.reduce((sum, t) => sum + t.taxAmount, 0) || 0;
              }
            } catch (e) {
              // Ignore parse errors
            }
            
            // Handle null dates - use current date as fallback
            const invoiceDate = inv.date || new Date().toISOString();
            const dateOnly = invoiceDate.includes(' ') ? invoiceDate.split(' ')[0] : invoiceDate.split('T')[0];
            
            return {
              id: inv.id,
              type: 'FACTURA',
              series: inv.series || 'F',
              number: inv.number || `INV-${inv.id}`,
              date: dateOnly,
              status: inv.status || 'generated',
              location_id: null,
              location_name: null,
              warehouse_id: null,
              created_by_user_id: 1,
              created_at: invoiceDate,
              updated_at: invoiceDate,
              fiscal_header: JSON.stringify({
                clientName: inv.client_name || 'Client',
                clientCui: inv.client_cui || null,
                invoiceNumber: inv.number || `INV-${inv.id}`,
                invoiceSeries: inv.series || 'F'
              }),
              lines: JSON.stringify([]),
              totals: JSON.stringify({
                total: total,
                taxAmount: taxAmount,
                subtotal: total - taxAmount
              }),
              document_data: JSON.stringify({
                orderId: inv.order_id,
                spvId: inv.spv_id,
                hasXml: !!inv.xml_content,
                source: 'e-Factura'
              }),
              version: 1,
              source: 'e-Factura'
            };
          });
          resolve(transformed);
        }
      });
    });
    
    // Combine both sources
    return [...tipizateDocs, ...eFacturaInvoices].sort((a, b) => {
      const dateA = new Date(a.date || a.created_at);
      const dateB = new Date(b.date || b.created_at);
      return dateB - dateA;
    });
  },

  async getById(id) {
    const doc = await tipizateRepository.getById(id);
    if (!doc || doc.type !== 'FACTURA') {
      throw new Error('Factură not found');
    }
    return doc;
  },

  async create(payload, userId) {
    const validated = validateFactura(payload);
    return tipizateRepository.insertDocument('FACTURA', validated, userId);
  },

  async update(id, payload, userId) {
    const existing = await this.getById(id);
    if (existing.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }
    const validated = validateFactura({ ...existing, ...payload });
    return tipizateRepository.updateDocument('FACTURA', id, validated, userId);
  },

  async sign(id, userId, userName) {
    return tipizateRepository.signDocument('FACTURA', id, userId, userName);
  },

  async lock(id, userId, userName) {
    return tipizateRepository.lockDocument('FACTURA', id, userId, userName);
  },
};

