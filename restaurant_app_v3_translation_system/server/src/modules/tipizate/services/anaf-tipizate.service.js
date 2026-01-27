/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TIPIZATE ANAF SERVICE - Enterprise-Grade Implementation
 * Conform OMFP 2634/2015 și specificațiilor ANAF
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { dbPromise } = require('../../../../database');
const { createStockMove } = require('../../../../stock/stockMoveService');

// ═══════════════════════════════════════════════════════════════════════════
// UTILITARE
// ═══════════════════════════════════════════════════════════════════════════

async function getNextDocumentNumber(documentType, series = null) {
  const db = await dbPromise;
  const year = new Date().getFullYear();
  const defaultSeries = {
    'AVIZ_INSOTIRE': 'AVZ',
    'BON_CONSUM': 'BC',
    'BON_PIERDERI': 'BP',
    'PROCES_VERBAL': 'PV'
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
              `SELECT current_number FROM document_sequences 
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

async function logJurnalTipizate(documentType, documentId, serie, numar, data, operatiune, userId, metadata = {}) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO jurnal_tipizate (
        document_type, document_id, serie, numar, data, operatiune,
        user_id, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      documentType,
      documentId,
      serie,
      numar,
      data,
      operatiune,
      userId,
      JSON.stringify(metadata)
    ], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. AVIZ DE ÎNSOȚIRE A MĂRFII (Cod ANAF 14-3-6A)
// ═══════════════════════════════════════════════════════════════════════════

const avizInsotireService = {
  async create(data) {
    const db = await dbPromise;
    const { formatted: numar, series } = await getNextDocumentNumber('AVIZ_INSOTIRE', data.serie);
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO avize_insotire (
          company_id, serie, numar, data_emitere,
          expeditor_denumire, expeditor_cif, expeditor_adresa,
          destinatar_denumire, destinatar_cif, destinatar_adresa,
          delegat_nume, delegat_ci, mijloc_transport, ora_plecare,
          tip_operatiune, observatii, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)
      `, [
        data.company_id || 1,
        series,
        numar,
        data.data_emitere || new Date().toISOString().split('T')[0],
        data.expeditor_denumire,
        data.expeditor_cif,
        data.expeditor_adresa,
        data.destinatar_denumire,
        data.destinatar_cif,
        data.destinatar_adresa,
        data.delegat_nume,
        data.delegat_ci,
        data.mijloc_transport,
        data.ora_plecare,
        data.tip_operatiune || 'fara_factura',
        data.observatii,
        data.created_by
      ], function(err) {
        if (err) return reject(err);
        
        const avizId = this.lastID;
        
        // Inserează linii
        if (data.items && data.items.length > 0) {
          let completed = 0;
          data.items.forEach((item, index) => {
            db.run(`
              INSERT INTO avize_insotire_items (aviz_id, product_id, denumire, um, cantitate)
              VALUES (?, ?, ?, ?, ?)
            `, [
              avizId,
              item.product_id,
              item.denumire,
              item.um || 'buc',
              item.cantitate
            ], (err) => {
              if (err) console.error('Error inserting aviz item:', err);
              completed++;
              if (completed === data.items.length) {
                logJurnalTipizate('AVIZ_INSOTIRE', avizId, series, numar, data.data_emitere, 'creare', data.created_by);
                resolve({ id: avizId, serie: series, numar, ...data });
              }
            });
          });
        } else {
          logJurnalTipizate('AVIZ_INSOTIRE', avizId, series, numar, data.data_emitere, 'creare', data.created_by);
          resolve({ id: avizId, serie: series, numar, ...data });
        }
      });
    });
  },
  
  async getById(id) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM avize_insotire WHERE id = ?', [id], (err, aviz) => {
        if (err) return reject(err);
        if (!aviz) return resolve(null);
        
        db.all('SELECT * FROM avize_insotire_items WHERE aviz_id = ?', [id], (err, items) => {
          if (err) return reject(err);
          resolve({ ...aviz, items });
        });
      });
    });
  },
  
  async list(filters = {}) {
    const db = await dbPromise;
    let query = 'SELECT * FROM avize_insotire WHERE 1=1';
    const params = [];
    
    if (filters.from) {
      query += ' AND data_emitere >= ?';
      params.push(filters.from);
    }
    if (filters.to) {
      query += ' AND data_emitere <= ?';
      params.push(filters.to);
    }
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    query += ' ORDER BY data_emitere DESC, id DESC';
    
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },
  
  async emit(id, userId) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE avize_insotire 
        SET status = 'emis', updated_at = datetime('now')
        WHERE id = ?
      `, [id], function(err) {
        if (err) return reject(err);
        
        db.get('SELECT * FROM avize_insotire WHERE id = ?', [id], (err, aviz) => {
          if (err) return reject(err);
          logJurnalTipizate('AVIZ_INSOTIRE', id, aviz.serie, aviz.numar, aviz.data_emitere, 'emitere', userId);
          resolve(aviz);
        });
      });
    });
  },
  
  async storno(id, userId, motiv) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE avize_insotire 
        SET status = 'anulat', observatii = COALESCE(observatii || '\n', '') || 'ANULAT: ' || ?,
        updated_at = datetime('now')
        WHERE id = ?
      `, [motiv || 'Storno', id], function(err) {
        if (err) return reject(err);
        
        db.get('SELECT * FROM avize_insotire WHERE id = ?', [id], (err, aviz) => {
          if (err) return reject(err);
          logJurnalTipizate('AVIZ_INSOTIRE', id, aviz.serie, aviz.numar, aviz.data_emitere, 'storno', userId, { motiv });
          resolve(aviz);
        });
      });
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. BON DE CONSUM (Cod ANAF 14-3-4A) - Integrat cu consumeStockForOrder
// ═══════════════════════════════════════════════════════════════════════════

const bonConsumService = {
  async create(data) {
    const db = await dbPromise;
    const { formatted: numar, series } = await getNextDocumentNumber('BON_CONSUM', data.serie);
    
    return new Promise((resolve, reject) => {
      // Calculează valoare totală
      const valoareTotala = (data.items || []).reduce((sum, item) => {
        return sum + (item.cantitate * (item.cost_unitar || 0));
      }, 0);
      
      db.run(`
        INSERT INTO consumption_vouchers (
          series, number, issue_date, company_name, company_cui,
          source_warehouse, source_warehouse_id, destination, destination_id,
          total_value, requested_by, approved_by, issued_by,
          scop_consum, departament, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)
      `, [
        series,
        numar,
        data.data || new Date().toISOString().split('T')[0],
        data.company_name,
        data.company_cui,
        data.source_warehouse,
        data.source_warehouse_id,
        data.destination,
        data.destination_id,
        valoareTotala,
        data.requested_by,
        data.approved_by,
        data.issued_by,
        data.scop_consum || 'productie',
        data.departament,
        data.created_by
      ], function(err) {
        if (err) return reject(err);
        
        const bonId = this.lastID;
        const stockMoves = [];
        
        // Inserează linii și generează stock moves
        if (data.items && data.items.length > 0) {
          let completed = 0;
          data.items.forEach((item) => {
            db.run(`
              INSERT INTO consumption_voucher_lines (
                voucher_id, line_number, product_code, product_name, unit_of_measure, quantity, unit_price, line_value
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              bonId,
              item.line_number || completed + 1,
              item.product_code,
              item.product_name,
              item.um || 'buc',
              item.cantitate,
              item.cost_unitar || 0,
              (item.cantitate * (item.cost_unitar || 0))
            ], async (err) => {
              if (err) {
                console.error('Error inserting bon consum item:', err);
              } else {
                // Generează stock move pentru consum (qty trebuie pozitiv, direction='OUT' face scăderea)
                try {
                  const stockMove = await createStockMove({
                    tenant_id: data.company_id || 1,
                    ingredient_id: item.ingredient_id,
                    qty: Math.abs(item.cantitate), // Pozitiv
                    direction: 'OUT', // OUT = scădere stoc
                    reason: 'CONSUMPTION',
                    source: 'BON_CONSUM',
                    reference_type: 'BON_CONSUM',
                    reference_id: bonId,
                    unit_price: item.cost_unitar || 0,
                    value: Math.abs(item.cantitate * (item.cost_unitar || 0)), // Pozitiv
                    meta: {
                      bon_consum_id: bonId,
                      bon_consum_serie: series,
                      bon_consum_numar: numar,
                      scop_consum: data.scop_consum,
                      departament: data.departament
                    }
                  });
                  stockMoves.push(stockMove);
                } catch (stockErr) {
                  console.error('Error creating stock move for bon consum:', stockErr);
                }
              }
              
              completed++;
              if (completed === data.items.length) {
                // Generează notă contabilă 371 → 601
                await bonConsumService.generateNotaContabila(bonId, 'BON_CONSUM', series, numar, valoareTotala, '371_601', data.created_by);
                
                logJurnalTipizate('BON_CONSUM', bonId, series, numar, data.data, 'creare', data.created_by);
                resolve({ id: bonId, serie: series, numar, stockMoves, ...data });
              }
            });
          });
        } else {
          logJurnalTipizate('BON_CONSUM', bonId, series, numar, data.data, 'creare', data.created_by);
          resolve({ id: bonId, serie: series, numar, ...data });
        }
      });
    });
  },
  
  async generateNotaContabila(documentId, documentType, serie, numar, suma, tip, userId) {
    const db = await dbPromise;
    const conturi = {
      '371_601': { debitor: '601', creditor: '371' }, // Materii prime
      '371_607': { debitor: '607', creditor: '371' }, // Mărfuri vândute
      '371_658': { debitor: '658', creditor: '371' }  // Alte cheltuieli
    };
    
    const cont = conturi[tip];
    if (!cont) return;
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO note_contabile (
          company_id, data, tip, document_type, document_id, document_serie, document_numar,
          cont_debitor, cont_creditor, suma, descriere, created_by
        ) VALUES (?, date('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        1, // company_id
        tip,
        documentType,
        documentId,
        serie,
        numar,
        cont.debitor,
        cont.creditor,
        suma,
        `${documentType} ${serie} ${numar}`,
        userId
      ], (err) => {
        if (err) {
          console.error('Error generating nota contabila:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },
  
  async getById(id) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM consumption_vouchers WHERE id = ?', [id], (err, bon) => {
        if (err) return reject(err);
        if (!bon) return resolve(null);
        
        db.all('SELECT * FROM consumption_voucher_lines WHERE voucher_id = ?', [id], (err, items) => {
          if (err) return reject(err);
          resolve({ ...bon, items });
        });
      });
    });
  },
  
  async list(filters = {}) {
    const db = await dbPromise;
    let query = 'SELECT * FROM consumption_vouchers WHERE 1=1';
    const params = [];
    
    if (filters.from) {
      query += ' AND issue_date >= ?';
      params.push(filters.from);
    }
    if (filters.to) {
      query += ' AND issue_date <= ?';
      params.push(filters.to);
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
// 3. PROCES-VERBAL DE SCOATERE DIN GESTIUNE
// ═══════════════════════════════════════════════════════════════════════════

const procesVerbalService = {
  async create(data) {
    const db = await dbPromise;
    const numar = `PV-${new Date().getFullYear()}-${Date.now()}`;
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO procese_verbale_scoatere (
          company_id, numar, data, 
          membru1_nume, membru1_functie,
          membru2_nume, membru2_functie,
          membru3_nume, membru3_functie,
          tip, descriere, masura, afecta_tva, ajustare_tva, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.company_id || 1,
        numar,
        data.data || new Date().toISOString().split('T')[0],
        data.membru1_nume,
        data.membru1_functie,
        data.membru2_nume,
        data.membru2_functie,
        data.membru3_nume,
        data.membru3_functie,
        data.tip,
        data.descriere,
        data.masura,
        data.afecta_tva ? 1 : 0,
        data.ajustare_tva || 0,
        data.created_by
      ], function(err) {
        if (err) return reject(err);
        
        const pvId = this.lastID;
        
        // Inserează linii
        if (data.items && data.items.length > 0) {
          let completed = 0;
          data.items.forEach((item) => {
            db.run(`
              INSERT INTO procese_verbale_items (proces_verbal_id, product_id, denumire, um, cantitate, valoare)
              VALUES (?, ?, ?, ?, ?, ?)
            `, [
              pvId,
              item.product_id,
              item.denumire,
              item.um || 'buc',
              item.cantitate,
              item.valoare
            ], (err) => {
              if (err) console.error('Error inserting PV item:', err);
              completed++;
              if (completed === data.items.length) {
                logJurnalTipizate('PROCES_VERBAL', pvId, 'PV', numar, data.data, 'creare', data.created_by);
                resolve({ id: pvId, numar, ...data });
              }
            });
          });
        } else {
          logJurnalTipizate('PROCES_VERBAL', pvId, 'PV', numar, data.data, 'creare', data.created_by);
          resolve({ id: pvId, numar, ...data });
        }
      });
    });
  },
  
  async getById(id) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM procese_verbale_scoatere WHERE id = ?', [id], (err, pv) => {
        if (err) return reject(err);
        if (!pv) return resolve(null);
        
        db.all('SELECT * FROM procese_verbale_items WHERE proces_verbal_id = ?', [id], (err, items) => {
          if (err) return reject(err);
          resolve({ ...pv, items });
        });
      });
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 4. BON PIERDERI / REBUTURI / CASARE
// ═══════════════════════════════════════════════════════════════════════════

const bonPierderiService = {
  async create(data) {
    const db = await dbPromise;
    const { formatted: numar, series } = await getNextDocumentNumber('BON_PIERDERI', data.serie);
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO bonuri_pierderi (
          company_id, serie, numar, data, gestiune_id, proces_verbal_id, emis_de
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        data.company_id || 1,
        series,
        numar,
        data.data || new Date().toISOString().split('T')[0],
        data.gestiune_id,
        data.proces_verbal_id,
        data.emis_de
      ], function(err) {
        if (err) return reject(err);
        
        const bonId = this.lastID;
        
        // Inserează linii și generează stock moves
        if (data.items && data.items.length > 0) {
          let completed = 0;
          data.items.forEach((item) => {
            db.run(`
              INSERT INTO bonuri_pierderi_items (bon_pierderi_id, product_id, denumire, um, cantitate, motiv)
              VALUES (?, ?, ?, ?, ?, ?)
            `, [
              bonId,
              item.product_id,
              item.denumire,
              item.um || 'buc',
              item.cantitate,
              item.motiv
            ], async (err) => {
              if (err) {
                console.error('Error inserting bon pierderi item:', err);
              } else {
                // Generează stock move pentru pierdere (qty pozitiv, direction='OUT' face scăderea)
                try {
                  await createStockMove({
                    tenant_id: data.company_id || 1,
                    ingredient_id: item.product_id,
                    qty: Math.abs(item.cantitate), // Pozitiv
                    direction: 'OUT', // OUT = scădere stoc
                    reason: 'WASTE',
                    source: 'BON_PIERDERI',
                    reference_type: 'BON_PIERDERI',
                    reference_id: bonId,
                    unit_price: item.cost_unitar || 0,
                    value: Math.abs(item.cantitate * (item.cost_unitar || 0)), // Pozitiv
                    meta: {
                      bon_pierderi_id: bonId,
                      bon_pierderi_serie: series,
                      bon_pierderi_numar: numar,
                      motiv: item.motiv,
                      proces_verbal_id: data.proces_verbal_id
                    }
                  });
                } catch (stockErr) {
                  console.error('Error creating stock move for bon pierderi:', stockErr);
                }
              }
              
              completed++;
              if (completed === data.items.length) {
                // Generează notă contabilă 371 → 658
                const totalValoare = data.items.reduce((sum, item) => sum + (item.cantitate * (item.cost_unitar || 0)), 0);
                await bonConsumService.generateNotaContabila(bonId, 'BON_PIERDERI', series, numar, totalValoare, '371_658', data.emis_de);
                
                logJurnalTipizate('BON_PIERDERI', bonId, series, numar, data.data, 'creare', data.emis_de);
                resolve({ id: bonId, serie: series, numar, ...data });
              }
            });
          });
        } else {
          logJurnalTipizate('BON_PIERDERI', bonId, series, numar, data.data, 'creare', data.emis_de);
          resolve({ id: bonId, serie: series, numar, ...data });
        }
      });
    });
  },
  
  async getById(id) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM bonuri_pierderi WHERE id = ?', [id], (err, bon) => {
        if (err) return reject(err);
        if (!bon) return resolve(null);
        
        db.all('SELECT * FROM bonuri_pierderi_items WHERE bon_pierderi_id = ?', [id], (err, items) => {
          if (err) return reject(err);
          resolve({ ...bon, items });
        });
      });
    });
  }
};

module.exports = {
  avizInsotireService,
  bonConsumService,
  procesVerbalService,
  bonPierderiService,
  logJurnalTipizate
};
