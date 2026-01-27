/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TIPIZATE LEGALE SERVICE - Conform OMFP 2634/2015 și Cod Fiscal Art. 319
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { dbPromise } = require('../../../../database');

// Utilitar pentru conversie suma în litere (română)
function numberToWords(amount) {
  const units = ['', 'unu', 'doi', 'trei', 'patru', 'cinci', 'șase', 'șapte', 'opt', 'nouă'];
  const teens = ['zece', 'unsprezece', 'doisprezece', 'treisprezece', 'paisprezece', 'cincisprezece', 
                 'șaisprezece', 'șaptesprezece', 'optsprezece', 'nouăsprezece'];
  const tens = ['', '', 'douăzeci', 'treizeci', 'patruzeci', 'cincizeci', 
                'șaizeci', 'șaptezeci', 'optzeci', 'nouăzeci'];
  const hundreds = ['', 'o sută', 'două sute', 'trei sute', 'patru sute', 'cinci sute',
                    'șase sute', 'șapte sute', 'opt sute', 'nouă sute'];
  
  if (amount === 0) return 'zero';
  
  const lei = Math.floor(amount);
  const bani = Math.round((amount - lei) * 100);
  
  let result = '';
  
  // Mii
  if (lei >= 1000) {
    const thousands = Math.floor(lei / 1000);
    if (thousands === 1) {
      result += 'o mie ';
    } else if (thousands < 20) {
      result += units[thousands] + ' mii ';
    } else {
      result += tens[Math.floor(thousands / 10)] + (thousands % 10 ? ' și ' + units[thousands % 10] : '') + ' mii ';
    }
  }
  
  // Sute
  const remainder = lei % 1000;
  if (remainder >= 100) {
    result += hundreds[Math.floor(remainder / 100)] + ' ';
  }
  
  // Zeci și unități
  const lastTwo = remainder % 100;
  if (lastTwo >= 10 && lastTwo < 20) {
    result += teens[lastTwo - 10] + ' ';
  } else {
    if (lastTwo >= 20) {
      result += tens[Math.floor(lastTwo / 10)];
      if (lastTwo % 10) {
        result += ' și ' + units[lastTwo % 10];
      }
      result += ' ';
    } else if (lastTwo > 0) {
      result += units[lastTwo] + ' ';
    }
  }
  
  result = result.trim() + ' lei';
  
  if (bani > 0) {
    result += ' și ' + bani + ' bani';
  }
  
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Generare număr document
async function getNextDocumentNumber(documentType, series = null) {
  const db = await dbPromise;
  const year = new Date().getFullYear();
  const defaultSeries = {
    'NIR': 'NIR',
    'FACTURA': 'F',
    'CHITANTA': 'CH',
    'AVIZ': 'AVZ',
    'BON_CONSUM': 'BC'
  };
  
  const useSeries = series || defaultSeries[documentType] || documentType;
  
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO document_sequences (document_type, series, current_number, year) 
       VALUES (?, ?, 0, ?)
       ON CONFLICT(document_type, series, year) DO NOTHING`,
      [documentType, useSeries, year],
      function() {
        db.run(
          `UPDATE document_sequences SET current_number = current_number + 1, updated_at = datetime('now') 
           WHERE document_type = ? AND series = ? AND year = ?`,
          [documentType, useSeries, year],
          function() {
            db.get(
              `SELECT current_number, format FROM document_sequences 
               WHERE document_type = ? AND series = ? AND year = ?`,
              [documentType, useSeries, year],
              (err, row) => {
                if (err) reject(err);
                else {
                  const number = row.current_number;
                  const formatted = `${useSeries}-${year}-${String(number).padStart(6, '0')}`;
                  resolve({ number, formatted, series: useSeries, year });
                }
              }
            );
          }
        );
      }
    );
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// NIR SERVICE - Notă de Intrare-Recepție
// ═══════════════════════════════════════════════════════════════════════════
const nirService = {
  async create(data) {
    const db = await dbPromise;
    const { formatted: nirNumber } = await getNextDocumentNumber('NIR');
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO nir_documents (
          nir_number, supplier_name, supplier_cui, supplier_reg_com, supplier_address,
          supplier_bank, supplier_iban, document_date, reception_date,
          accompanying_doc_type, accompanying_doc_number, accompanying_doc_date,
          receiving_warehouse, receiving_warehouse_id,
          commission_president, commission_member1, commission_member2,
          company_name, company_cui, company_reg_com, company_address,
          total_value, total_vat, currency, observations, nir_status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        nirNumber,
        data.supplier.name,
        data.supplier.cui,
        data.supplier.regCom,
        data.supplier.address,
        data.supplier.bank,
        data.supplier.iban,
        data.documentDate,
        data.receptionDate,
        data.accompanyingDoc?.type,
        data.accompanyingDoc?.number,
        data.accompanyingDoc?.date,
        data.receivingWarehouse?.name,
        data.receivingWarehouse?.id,
        data.commission?.president,
        data.commission?.member1,
        data.commission?.member2,
        data.company?.name,
        data.company?.cui,
        data.company?.regCom,
        data.company?.address,
        data.totals?.value || 0,
        data.totals?.vat || 0,
        data.currency || 'RON',
        data.observations,
        'finalized',
        data.createdBy
      ], function(err) {
        if (err) return reject(err);
        
        const nirId = this.lastID;
        
        // Insert items
        if (data.items && data.items.length > 0) {
          const insertItem = db.prepare(`
            INSERT INTO nir_items (
              nir_id, product_type, product_id, product_code, product_name,
              quantity, quantity_invoiced, quantity_received, difference_quantity,
              purchase_price_unit, purchase_price_total, vat_rate, unit_of_measure,
              difference_value
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          data.items.forEach(item => {
            const diff = (item.quantityReceived || item.quantity) - (item.quantityInvoiced || item.quantity);
            insertItem.run([
              nirId,
              item.productType || 'ingredient',
              item.productId,
              item.code,
              item.name,
              item.quantityReceived || item.quantity,
              item.quantityInvoiced || item.quantity,
              item.quantityReceived || item.quantity,
              diff,
              item.unitPrice,
              item.totalPrice,
              item.vatRate || 21,
              item.unit,
              diff * (item.unitPrice || 0)
            ]);
          });
          
          insertItem.finalize();
        }
        
        resolve({ id: nirId, nirNumber });
      });
    });
  },
  
  async getById(id) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM nir_documents WHERE id = ?', [id], (err, nir) => {
        if (err) return reject(err);
        if (!nir) return resolve(null);
        
        db.all('SELECT * FROM nir_items WHERE nir_id = ?', [id], (err, items) => {
          if (err) return reject(err);
          resolve({ ...nir, items });
        });
      });
    });
  },
  
  async list(filters = {}) {
    const db = await dbPromise;
    let query = 'SELECT * FROM nir_documents WHERE 1=1';
    const params = [];
    
    if (filters.from) {
      query += ' AND document_date >= ?';
      params.push(filters.from);
    }
    if (filters.to) {
      query += ' AND document_date <= ?';
      params.push(filters.to);
    }
    if (filters.supplier) {
      query += ' AND supplier_name LIKE ?';
      params.push(`%${filters.supplier}%`);
    }
    
    query += ' ORDER BY document_date DESC, id DESC';
    
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FACTURA SERVICE - Conform Cod Fiscal Art. 319
// ═══════════════════════════════════════════════════════════════════════════
const facturaService = {
  async create(data) {
    const db = await dbPromise;
    const { formatted: invoiceNumber, series } = await getNextDocumentNumber('FACTURA', data.series);
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO invoices (
          invoice_series, invoice_number, order_id,
          supplier_name, supplier_cui, supplier_reg_com, supplier_address,
          supplier_city, supplier_county, supplier_country,
          supplier_bank, supplier_iban, supplier_capital, supplier_phone, supplier_email,
          client_name, client_cui, client_reg_com, client_address,
          client_city, client_county, client_country,
          client_bank, client_iban, client_phone, client_email,
          issue_date, due_date, delivery_date,
          payment_method, currency, exchange_rate,
          total_amount, vat_amount,
          delegate_name, delegate_id_series, delegate_id_number, transport_means,
          notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        series,
        invoiceNumber,
        data.orderId,
        data.supplier?.name,
        data.supplier?.cui,
        data.supplier?.regCom,
        data.supplier?.address,
        data.supplier?.city,
        data.supplier?.county,
        data.supplier?.country || 'RO',
        data.supplier?.bank,
        data.supplier?.iban,
        data.supplier?.capital,
        data.supplier?.phone,
        data.supplier?.email,
        data.client?.name,
        data.client?.cui,
        data.client?.regCom,
        data.client?.address,
        data.client?.city,
        data.client?.county,
        data.client?.country || 'RO',
        data.client?.bank,
        data.client?.iban,
        data.client?.phone,
        data.client?.email,
        data.issueDate || new Date().toISOString().split('T')[0],
        data.dueDate,
        data.deliveryDate,
        data.paymentMethod || 'Transfer bancar',
        data.currency || 'RON',
        data.exchangeRate || 1,
        data.totalAmount,
        data.vatAmount,
        data.delegate?.name,
        data.delegate?.idSeries,
        data.delegate?.idNumber,
        data.transportMeans,
        data.notes,
        'generated'
      ], function(err) {
        if (err) return reject(err);
        
        const invoiceId = this.lastID;
        
        // Insert lines
        if (data.lines && data.lines.length > 0) {
          const insertLine = db.prepare(`
            INSERT INTO invoice_lines (
              invoice_id, line_number, product_code, product_name, description,
              unit_of_measure, quantity, unit_price,
              discount_percent, discount_amount,
              vat_rate, vat_amount, line_total_without_vat, line_total_with_vat
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          data.lines.forEach((line, index) => {
            const lineTotal = line.quantity * line.unitPrice;
            const discount = line.discountPercent ? lineTotal * line.discountPercent / 100 : (line.discountAmount || 0);
            const totalWithoutVat = lineTotal - discount;
            const vatAmount = totalWithoutVat * (line.vatRate || 21) / 100;
            const totalWithVat = totalWithoutVat + vatAmount;
            
            insertLine.run([
              invoiceId,
              index + 1,
              line.code,
              line.name,
              line.description,
              line.unit || 'buc',
              line.quantity,
              line.unitPrice,
              line.discountPercent || 0,
              discount,
              line.vatRate || 21,
              vatAmount,
              totalWithoutVat,
              totalWithVat
            ]);
          });
          
          insertLine.finalize();
        }
        
        resolve({ id: invoiceId, invoiceNumber, series });
      });
    });
  },
  
  async getById(id) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM invoices WHERE id = ?', [id], (err, invoice) => {
        if (err) return reject(err);
        if (!invoice) return resolve(null);
        
        db.all('SELECT * FROM invoice_lines WHERE invoice_id = ? ORDER BY line_number', [id], (err, lines) => {
          if (err) return reject(err);
          resolve({ ...invoice, lines });
        });
      });
    });
  },
  
  async list(filters = {}) {
    const db = await dbPromise;
    let query = 'SELECT * FROM invoices WHERE 1=1';
    const params = [];
    
    if (filters.from) {
      query += ' AND DATE(issue_date) >= DATE(?)';
      params.push(filters.from);
    }
    if (filters.to) {
      query += ' AND DATE(issue_date) <= DATE(?)';
      params.push(filters.to);
    }
    if (filters.client) {
      query += ' AND client_name LIKE ?';
      params.push(`%${filters.client}%`);
    }
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    query += ' ORDER BY issue_date DESC, id DESC';
    
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CHITANTA SERVICE - Conform OMFP 2634/2015
// ═══════════════════════════════════════════════════════════════════════════
const chitantaService = {
  async create(data) {
    const db = await dbPromise;
    const { formatted: receiptNumber, series } = await getNextDocumentNumber('CHITANTA', data.series);
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO receipts_legal (
          receipt_series, receipt_number, receipt_date,
          company_name, company_cui, company_reg_com, company_address,
          payer_name, payer_cui, payer_address,
          amount, amount_in_words, currency,
          purpose, payment_method,
          reference_doc_type, reference_doc_number, reference_doc_date,
          cashier_name, order_id, invoice_id, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        series,
        receiptNumber,
        data.date || new Date().toISOString().split('T')[0],
        data.company?.name,
        data.company?.cui,
        data.company?.regCom,
        data.company?.address,
        data.payer?.name,
        data.payer?.cui,
        data.payer?.address,
        data.amount,
        numberToWords(data.amount),
        data.currency || 'RON',
        data.purpose,
        data.paymentMethod || 'Numerar',
        data.referenceDoc?.type,
        data.referenceDoc?.number,
        data.referenceDoc?.date,
        data.cashierName,
        data.orderId,
        data.invoiceId,
        data.createdBy
      ], function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, receiptNumber, series });
      });
    });
  },
  
  async getById(id) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM receipts_legal WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  
  async list(filters = {}) {
    const db = await dbPromise;
    let query = 'SELECT * FROM receipts_legal WHERE 1=1';
    const params = [];
    
    if (filters.from) {
      query += ' AND receipt_date >= ?';
      params.push(filters.from);
    }
    if (filters.to) {
      query += ' AND receipt_date <= ?';
      params.push(filters.to);
    }
    
    query += ' ORDER BY receipt_date DESC, id DESC';
    
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// AVIZ SERVICE - Conform OMFP 2634/2015
// ═══════════════════════════════════════════════════════════════════════════
const avizService = {
  async create(data) {
    const db = await dbPromise;
    const { formatted: avizNumber, series } = await getNextDocumentNumber('AVIZ', data.series);
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO delivery_notes (
          series, number, issue_date,
          sender_name, sender_cui, sender_reg_com, sender_address, sender_city, sender_county,
          sender_bank, sender_iban,
          recipient_name, recipient_cui, recipient_reg_com, recipient_address, recipient_city, recipient_county,
          delivery_address, delivery_city, delivery_county,
          transport_means, vehicle_number, driver_name,
          delegate_name, delegate_id_type, delegate_id_series, delegate_id_number, delegate_issued_by,
          invoice_series, invoice_number, invoice_date,
          total_quantity, total_value, currency,
          observations, sender_signature_name, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        series,
        avizNumber,
        data.issueDate || new Date().toISOString().split('T')[0],
        data.sender?.name,
        data.sender?.cui,
        data.sender?.regCom,
        data.sender?.address,
        data.sender?.city,
        data.sender?.county,
        data.sender?.bank,
        data.sender?.iban,
        data.recipient?.name,
        data.recipient?.cui,
        data.recipient?.regCom,
        data.recipient?.address,
        data.recipient?.city,
        data.recipient?.county,
        data.delivery?.address,
        data.delivery?.city,
        data.delivery?.county,
        data.transport?.means,
        data.transport?.vehicleNumber,
        data.transport?.driverName,
        data.delegate?.name,
        data.delegate?.idType,
        data.delegate?.idSeries,
        data.delegate?.idNumber,
        data.delegate?.issuedBy,
        data.invoice?.series,
        data.invoice?.number,
        data.invoice?.date,
        data.totals?.quantity || 0,
        data.totals?.value || 0,
        data.currency || 'RON',
        data.observations,
        data.senderSignature,
        'emis',
        data.createdBy
      ], function(err) {
        if (err) return reject(err);
        
        const avizId = this.lastID;
        
        // Insert lines
        if (data.lines && data.lines.length > 0) {
          const insertLine = db.prepare(`
            INSERT INTO delivery_note_lines (
              delivery_note_id, line_number, product_code, product_name, description,
              unit_of_measure, quantity, unit_price, line_value
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          data.lines.forEach((line, index) => {
            insertLine.run([
              avizId,
              index + 1,
              line.code,
              line.name,
              line.description,
              line.unit || 'buc',
              line.quantity,
              line.unitPrice,
              line.quantity * (line.unitPrice || 0)
            ]);
          });
          
          insertLine.finalize();
        }
        
        resolve({ id: avizId, avizNumber, series });
      });
    });
  },
  
  async getById(id) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM delivery_notes WHERE id = ?', [id], (err, aviz) => {
        if (err) return reject(err);
        if (!aviz) return resolve(null);
        
        db.all('SELECT * FROM delivery_note_lines WHERE delivery_note_id = ? ORDER BY line_number', [id], (err, lines) => {
          if (err) return reject(err);
          resolve({ ...aviz, lines });
        });
      });
    });
  },
  
  async list(filters = {}) {
    const db = await dbPromise;
    let query = 'SELECT * FROM delivery_notes WHERE 1=1';
    const params = [];
    
    if (filters.from) {
      query += ' AND issue_date >= ?';
      params.push(filters.from);
    }
    if (filters.to) {
      query += ' AND issue_date <= ?';
      params.push(filters.to);
    }
    
    query += ' ORDER BY issue_date DESC, id DESC';
    
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// BON CONSUM SERVICE
// ═══════════════════════════════════════════════════════════════════════════
const bonConsumService = {
  async create(data) {
    const db = await dbPromise;
    const { formatted: voucherNumber, series } = await getNextDocumentNumber('BON_CONSUM', data.series);
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO consumption_vouchers (
          series, number, issue_date,
          company_name, company_cui,
          source_warehouse, source_warehouse_id,
          destination, destination_id,
          total_value,
          requested_by, approved_by, issued_by, received_by,
          observations, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        series,
        voucherNumber,
        data.issueDate || new Date().toISOString().split('T')[0],
        data.company?.name,
        data.company?.cui,
        data.sourceWarehouse?.name,
        data.sourceWarehouse?.id,
        data.destination?.name,
        data.destination?.id,
        data.totalValue || 0,
        data.requestedBy,
        data.approvedBy,
        data.issuedBy,
        data.receivedBy,
        data.observations,
        'emis',
        data.createdBy
      ], function(err) {
        if (err) return reject(err);
        
        const voucherId = this.lastID;
        
        // Insert lines
        if (data.lines && data.lines.length > 0) {
          const insertLine = db.prepare(`
            INSERT INTO consumption_voucher_lines (
              voucher_id, line_number, product_code, product_name,
              unit_of_measure, quantity, unit_price, line_value
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          data.lines.forEach((line, index) => {
            insertLine.run([
              voucherId,
              index + 1,
              line.code,
              line.name,
              line.unit || 'buc',
              line.quantity,
              line.unitPrice,
              line.quantity * line.unitPrice
            ]);
          });
          
          insertLine.finalize();
        }
        
        resolve({ id: voucherId, voucherNumber, series });
      });
    });
  },
  
  async getById(id) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM consumption_vouchers WHERE id = ?', [id], (err, voucher) => {
        if (err) return reject(err);
        if (!voucher) return resolve(null);
        
        db.all('SELECT * FROM consumption_voucher_lines WHERE voucher_id = ? ORDER BY line_number', [id], (err, lines) => {
          if (err) return reject(err);
          resolve({ ...voucher, lines });
        });
      });
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRU CASA SERVICE
// ═══════════════════════════════════════════════════════════════════════════
const registruCasaService = {
  async openDay(data) {
    const db = await dbPromise;
    const today = new Date().toISOString().split('T')[0];
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO cash_register_legal (
          register_date, company_name, company_cui,
          opening_balance, closing_balance, cashier_name, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'deschis')
      `, [
        today,
        data.company?.name,
        data.company?.cui,
        data.openingBalance || 0,
        data.openingBalance || 0,
        data.cashierName
      ], function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, date: today });
      });
    });
  },
  
  async addEntry(registerId, data) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      // Get next entry number
      db.get(
        'SELECT COALESCE(MAX(entry_number), 0) + 1 as next_number FROM cash_register_entries WHERE register_id = ?',
        [registerId],
        (err, row) => {
          if (err) return reject(err);
          
          const entryNumber = row.next_number;
          
          db.run(`
            INSERT INTO cash_register_entries (
              register_id, entry_number, document_type, document_series, document_number,
              document_date, description, partner_name, amount, entry_type,
              reference_type, reference_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            registerId,
            entryNumber,
            data.documentType,
            data.documentSeries,
            data.documentNumber,
            data.documentDate,
            data.description,
            data.partnerName,
            data.amount,
            data.entryType,
            data.referenceType,
            data.referenceId
          ], function(err) {
            if (err) return reject(err);
            
            // Update register totals
            const updateField = data.entryType === 'receipt' ? 'total_receipts' : 'total_payments';
            db.run(`
              UPDATE cash_register_legal 
              SET ${updateField} = ${updateField} + ?,
                  closing_balance = opening_balance + total_receipts - total_payments + ?
              WHERE id = ?
            `, [data.amount, data.entryType === 'receipt' ? data.amount : -data.amount, registerId]);
            
            resolve({ id: this.lastID, entryNumber });
          });
        }
      );
    });
  },
  
  async closeDay(registerId, verifiedBy) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE cash_register_legal 
        SET status = 'închis', verified_by = ?
        WHERE id = ?
      `, [verifiedBy, registerId], function(err) {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  },
  
  async getByDate(date) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM cash_register_legal WHERE register_date = ?', [date], (err, register) => {
        if (err) return reject(err);
        if (!register) return resolve(null);
        
        db.all('SELECT * FROM cash_register_entries WHERE register_id = ? ORDER BY entry_number', [register.id], (err, entries) => {
          if (err) return reject(err);
          resolve({ ...register, entries });
        });
      });
    });
  }
};

module.exports = {
  nirService,
  facturaService,
  chitantaService,
  avizService,
  bonConsumService,
  registruCasaService,
  getNextDocumentNumber,
  numberToWords
};

