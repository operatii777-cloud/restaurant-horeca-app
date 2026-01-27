/**
 * PHASE S4.2 - Tipizate Repository
 * Database access layer for tipizate documents
 */

const { dbPromise } = require('../../../../database');
// Type imports - TypeScript types are erased at runtime, so we use type-only import
import type { TipizatType, TipizatStatus } from '../models/tipizate.types';

exports.tipizateRepository = {
  /**
   * List documents by type with filters
   */
  async listByType(
    type: TipizatType,
    filters: {
      from?: string;
      to?: string;
      locationId?: number;
      warehouseId?: number;
      status?: TipizatStatus;
      supplierName?: string;
    } = {}
  ) {
    const db = await dbPromise;
    let sql = `
      SELECT * FROM tipizate_documents
      WHERE type = ?
    `;
    const params: any[] = [type];

    if (filters.from) {
      sql += ` AND date >= ?`;
      params.push(filters.from);
    }
    if (filters.to) {
      sql += ` AND date <= ?`;
      params.push(filters.to);
    }
    if (filters.locationId) {
      sql += ` AND location_id = ?`;
      params.push(filters.locationId);
    }
    if (filters.warehouseId) {
      sql += ` AND warehouse_id = ?`;
      params.push(filters.warehouseId);
    }
    if (filters.status) {
      sql += ` AND status = ?`;
      params.push(filters.status);
    }
    if (filters.supplierName && type === 'NIR') {
      sql += ` AND (supplier_name LIKE ? OR json_extract(header_json, '$.supplierName') LIKE ?)`;
      const supplierPattern = `%${filters.supplierName}%`;
      params.push(supplierPattern, supplierPattern);
    }

    sql += ` ORDER BY date DESC, number DESC`;

    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  /**
   * Get document by ID
   */
  async getById(id: number) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM tipizate_documents WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });
  },

  /**
   * Get NIR by ID (legacy, use getById)
   */
  async getNirById(id: number) {
    return this.getById(id);
  },

  /**
   * Insert NIR document (legacy, use insertDocument)
   */
  async insertNir(doc: any, userId: number) {
    return this.insertDocument('NIR', doc, userId);
  },

  /**
   * Update NIR document (legacy, use updateDocument)
   */
  async updateNir(id: number, doc: any, userId: number) {
    return this.updateDocument('NIR', id, doc, userId);
  },

  /**
   * Insert document (generic, works for all types)
   */
  async insertDocument(docType: string, doc: any, userId: number) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO tipizate_documents (
          type, series, number, location_id, location_name, warehouse_id,
          date, status, created_by_user_id, created_at, updated_at,
          fiscal_header, lines, totals, document_data, version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          docType,
          doc.series,
          doc.number,
          doc.locationId,
          doc.locationName,
          doc.warehouseId || null,
          doc.date,
          'DRAFT',
          userId,
          now,
          now,
          JSON.stringify(doc.fiscalHeader || {}),
          JSON.stringify(doc.lines || []),
          JSON.stringify(doc.totals || {}),
          JSON.stringify(doc.documentData || {}),
          1,
        ],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...doc });
        }
      );
    });
  },

  /**
   * Update document (generic, works for all types)
   */
  async updateDocument(docType: string, id: number, doc: any, userId: number) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE tipizate_documents SET
          series = ?, number = ?, date = ?,
          location_id = ?, location_name = ?, warehouse_id = ?,
          fiscal_header = ?, lines = ?, totals = ?, document_data = ?,
          updated_at = ?, version = version + 1
        WHERE id = ? AND status = 'DRAFT'`,
        [
          doc.series,
          doc.number,
          doc.date,
          doc.locationId,
          doc.locationName,
          doc.warehouseId || null,
          JSON.stringify(doc.fiscalHeader || {}),
          JSON.stringify(doc.lines || []),
          JSON.stringify(doc.totals || {}),
          JSON.stringify(doc.documentData || {}),
          now,
          id,
        ],
        function (err) {
          if (err) reject(err);
          else if (this.changes === 0) reject(new Error('Document not found or cannot be modified'));
          else resolve({ id, ...doc });
        }
      );
    });
  },

  /**
   * Sign document
   */
  async signDocument(type: TipizatType, id: number, userId: number, userName?: string) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE tipizate_documents SET
          status = 'SIGNED',
          signed_by_user_id = ?,
          signed_by_name = ?,
          signed_at = ?,
          updated_at = ?
        WHERE id = ? AND status IN ('DRAFT', 'VALIDATED')`,
        [userId, userName || null, now, now, id],
        function (err) {
          if (err) reject(err);
          else if (this.changes === 0) reject(new Error('Document cannot be signed'));
          else resolve({ id, status: 'SIGNED' });
        }
      );
    });
  },

  /**
   * Lock document
   * CRITIC: Pentru NIR, creează ingredient_batches și actualizează stocuri
   */
  async lockDocument(type: TipizatType, id: number, userId: number, userName?: string) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    
    return new Promise(async (resolve, reject) => {
      // 1. Lock document
      db.run(
        `UPDATE tipizate_documents SET
          status = 'LOCKED',
          locked_by_user_id = ?,
          locked_by_name = ?,
          locked_at = ?,
          updated_at = ?
        WHERE id = ? AND status = 'SIGNED'`,
        [userId, userName || null, now, now, id],
        async (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          // 2. Dacă e NIR, creează loturi și actualizează stocuri
          if (type === 'NIR') {
            try {
              const doc = await this.getById(id);
              if (!doc) {
                reject(new Error('Document not found'));
                return;
              }
              
              // Parsează fiscal_header pentru a obține supplier_id
              const fiscalHeader = typeof doc.fiscal_header === 'string' 
                ? JSON.parse(doc.fiscal_header) 
                : doc.fiscal_header || {};
              
              // Parsează document_data pentru supplier_id (dacă e acolo)
              const documentData = typeof doc.document_data === 'string'
                ? JSON.parse(doc.document_data)
                : doc.document_data || {};
              
              const supplierId = documentData.supplier_id || documentData.supplierId || fiscalHeader.supplier_id || fiscalHeader.supplierId || null;
              const supplierName = documentData.supplier_name || documentData.supplierName || fiscalHeader.supplier_name || fiscalHeader.supplierName || null;
              const locationId = doc.location_id || 1;
              
              // Parsează lines (JSON array)
              const lines = typeof doc.lines === 'string' 
                ? JSON.parse(doc.lines) 
                : doc.lines || [];
              
              // Pentru fiecare linie, creează lot
              for (const line of lines) {
                // Verifică dacă e ingredient (nu produs finit)
                const ingredientId = line.ingredient_id || line.ingredientId || line.product_id || line.productId;
                if (!ingredientId) continue; // Skip dacă nu e ingredient
                
                const quantity = parseFloat(line.quantity || line.quantity_received || line.qty || 0);
                const unitPrice = parseFloat(line.unit_price || line.unitPrice || line.price || line.price_ex_vat || 0);
                
                if (quantity <= 0) continue; // Skip dacă cantitatea e 0
                
                // Creează batch_number
                const batchNumber = `NIR-${doc.number || doc.id}-${ingredientId}`;
                
                // Inserează în ingredient_batches
                await new Promise((resolveBatch, rejectBatch) => {
                  db.run(
                    `INSERT INTO ingredient_batches (
                      ingredient_id, batch_number, barcode, quantity, remaining_quantity,
                      purchase_date, expiry_date, supplier, invoice_number, unit_cost,
                      location_id, supplier_id, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                      ingredientId,
                      batchNumber,
                      null, // barcode
                      quantity,
                      quantity, // remaining_quantity inițial = quantity
                      doc.date || now.split('T')[0],
                      line.expiry_date || line.expiryDate || null,
                      supplierName,
                      doc.number || `NIR-${id}`,
                      unitPrice,
                      locationId,
                      supplierId,
                      now
                    ],
                    function (batchErr) {
                      if (batchErr) {
                        console.error(`❌ Eroare creare lot pentru ingredient ${ingredientId}:`, batchErr);
                        rejectBatch(batchErr);
                      } else {
                        console.log(`✅ Lot creat: ${batchNumber}, ingredient ${ingredientId}, qty: ${quantity}, cost: ${unitPrice} RON`);
                        resolveBatch({ batchId: this.lastID });
                      }
                    }
                  );
                });
                
                // Actualizează current_stock în ingredients (CRITIC!)
                await new Promise((resolveStock, rejectStock) => {
                  db.run(
                    `UPDATE ingredients 
                     SET current_stock = current_stock + ?,
                         last_updated = ?
                     WHERE id = ?`,
                    [quantity, now, ingredientId],
                    function (stockErr) {
                      if (stockErr) {
                        console.error(`❌ Eroare actualizare stoc pentru ingredient ${ingredientId}:`, stockErr);
                        rejectStock(stockErr);
                      } else {
                        console.log(`✅ Stoc actualizat pentru ingredient ${ingredientId}: +${quantity}`);
                        resolveStock();
                      }
                    }
                  );
                });
                
                // Înregistrează în stock_moves (structură corectă: quantity_in, type, reference_type, reference_id)
                const totalValue = quantity * unitPrice;
                await new Promise((resolveMove, rejectMove) => {
                  db.run(
                    `INSERT INTO stock_moves (
                      ingredient_id, quantity_in, type, reference_type, reference_id, unit_price, value_in, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                      ingredientId,
                      quantity, // quantity_in (pozitiv pentru intrare)
                      'NIR',
                      'NIR',
                      id,
                      unitPrice,
                      totalValue,
                      now
                    ],
                    function (moveErr) {
                      if (moveErr) {
                        console.error(`❌ Eroare înregistrare stock_move pentru ingredient ${ingredientId}:`, moveErr);
                        rejectMove(moveErr);
                      } else {
                        console.log(`✅ Stock move înregistrat pentru ingredient ${ingredientId}: qty: ${quantity}, valoare: ${totalValue} RON`);
                        resolveMove({ moveId: this.lastID });
                      }
                    }
                  );
                });
              }
              
              // Trigger-ul `update_average_cost_on_nir` va actualiza automat:
              // - ingredients.cost_per_unit (cost mediu ponderat)
              // - ingredients.last_updated
              
              console.log(`✅ NIR #${id}: Lock complet! ${lines.length} loturi create și stocuri actualizate.`);
              
              resolve({ id, status: 'LOCKED' });
            } catch (processErr) {
              console.error(`❌ Eroare procesare NIR #${id}:`, processErr);
              reject(processErr);
            }
          } else if (type === 'BON_CONSUM') {
            // 🔥 FAZA 1: Fix Bon Consum - Consumă din loturi folosind FIFO
            try {
              const doc = await this.getById(id);
              if (!doc) {
                reject(new Error('Bon Consum document not found'));
                return;
              }
              
              const locationId = doc.location_id || 1;
              const lines = typeof doc.lines === 'string' 
                ? JSON.parse(doc.lines) 
                : doc.lines || [];
              
              // Importă StockConsumptionEngine
              const StockConsumptionEngine = require('../../../../utils/stock-consumption-engine');
              
              // Pentru fiecare linie, consumă din loturi (FIFO)
              for (const line of lines) {
                const ingredientId = line.ingredient_id || line.ingredientId || line.itemId;
                if (!ingredientId) continue; // Skip dacă nu e ingredient
                
                const quantityNeeded = parseFloat(line.quantity || line.qty || 0);
                if (quantityNeeded <= 0) continue; // Skip dacă cantitatea e 0
                
                try {
                  // Folosește StockConsumptionEngine pentru consum FIFO
                  const consumeResult = await StockConsumptionEngine.consumeStock(
                    ingredientId,
                    quantityNeeded,
                    null, // orderId (nu e comandă)
                    locationId,
                    null  // auto-detect FIFO/FEFO
                  );
                  
                  // Calculează valoare totală din loturi consumate
                  const totalValue = consumeResult.batches.reduce((sum, batch) => 
                    sum + (batch.quantity_consumed * batch.unit_cost), 0
                  );
                  
                  // Înregistrează în stock_moves (structură corectă: quantity_out, type, reference_type, reference_id)
                  await new Promise((resolveMove, rejectMove) => {
                    db.run(
                      `INSERT INTO stock_moves (
                        ingredient_id, quantity_out, type, reference_type, reference_id, unit_price, value_out, created_at
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                      [
                        ingredientId,
                        quantityNeeded, // quantity_out (pozitiv pentru consum)
                        'CONSUME',
                        'BON_CONSUM',
                        id,
                        totalValue / quantityNeeded, // Cost mediu din loturi
                        totalValue,
                        now
                      ],
                      function (moveErr) {
                        if (moveErr) {
                          console.error(`❌ Eroare înregistrare stock_move pentru ingredient ${ingredientId}:`, moveErr);
                          rejectMove(moveErr);
                        } else {
                          console.log(`✅ Consum FIFO pentru ingredient ${ingredientId}: ${quantityNeeded}, valoare: ${totalValue} RON`);
                          // Salvează meta în document_data pentru trasabilitate
                          const meta = {
                            batches_used: consumeResult.batches,
                            method: consumeResult.method,
                            stock_move_id: this.lastID
                          };
                          // Actualizează document_data cu meta
                          const documentData = typeof doc.document_data === 'string'
                            ? JSON.parse(doc.document_data || '{}')
                            : doc.document_data || {};
                          documentData.stock_consumption_meta = meta;
                          db.run(
                            `UPDATE tipizate_documents SET document_data = ? WHERE id = ?`,
                            [JSON.stringify(documentData), id],
                            (updateErr) => {
                              if (updateErr) console.error(`⚠️ Eroare actualizare document_data cu meta:`, updateErr);
                            }
                          );
                          resolveMove({ moveId: this.lastID });
                        }
                      }
                    );
                  });
                } catch (consumeErr) {
                  console.error(`❌ Eroare consum ingredient ${ingredientId} din Bon Consum:`, consumeErr);
                  // Continuă cu următoarele ingrediente chiar dacă unul eșuează
                  // Dar loghează eroarea pentru debugging
                }
              }
              
              console.log(`✅ Bon Consum #${id}: Lock complet! ${lines.length} ingrediente consumate folosind FIFO.`);
              
              resolve({ id, status: 'LOCKED' });
            } catch (processErr) {
              console.error(`❌ Eroare procesare Bon Consum #${id}:`, processErr);
              reject(processErr);
            }
          } else if (type === 'INVENTAR') {
            // 🔥 FAZA 1: Fix Inventar - Ajustează loturi bazat pe diferențe
            try {
              const doc = await this.getById(id);
              if (!doc) {
                reject(new Error('Inventar document not found'));
                return;
              }
              
              const locationId = doc.location_id || 1;
              const lines = typeof doc.lines === 'string' 
                ? JSON.parse(doc.lines) 
                : doc.lines || [];
              
              // Pentru fiecare linie, ajustează loturi
              for (const line of lines) {
                const ingredientId = line.ingredient_id || line.ingredientId || line.itemId;
                if (!ingredientId) continue; // Skip dacă nu e ingredient
                
                const stockSystem = parseFloat(line.stock_system || line.stockSystem || 0);
                const stockCounted = parseFloat(line.stock_counted || line.stockCounted || 0);
                const diff = stockCounted - stockSystem;
                
                if (Math.abs(diff) < 0.001) continue; // Skip dacă diferența e neglijabilă
                
                // Obține loturile existente
                const batches = await new Promise((resolveBatches, rejectBatches) => {
                  db.all(`
                    SELECT * FROM ingredient_batches 
                    WHERE ingredient_id = ? AND location_id = ? AND remaining_quantity > 0
                    ORDER BY purchase_date ASC, id ASC
                  `, [ingredientId, locationId], (err, rows) => {
                    if (err) rejectBatches(err);
                    else resolveBatches(rows || []);
                  });
                });
                
                const totalInBatches = batches.reduce((sum, b) => sum + parseFloat(b.remaining_quantity || 0), 0);
                
                if (diff > 0) {
                  // 🔥 PLUS - Crește stocul (găsit mai mult decât era în sistem)
                  // Adaugă un lot nou cu diferența
                  const batchNumber = `INV-ADJUST-${doc.number || id}-${ingredientId}`;
                  const costUnit = parseFloat(line.cost_unit || line.costUnit || line.unitPrice || 0);
                  
                  await new Promise((resolveBatch, rejectBatch) => {
                    db.run(`
                      INSERT INTO ingredient_batches (
                        ingredient_id, batch_number, quantity, remaining_quantity,
                        purchase_date, supplier, invoice_number, unit_cost, location_id, created_at
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                      ingredientId,
                      batchNumber,
                      diff,
                      diff,
                      doc.date || now.split('T')[0],
                      'Ajustare Inventar +',
                      doc.number || `INV-${id}`,
                      costUnit,
                      locationId,
                      now
                    ], function (batchErr) {
                      if (batchErr) {
                        console.error(`❌ Eroare creare lot pentru ingredient ${ingredientId}:`, batchErr);
                        rejectBatch(batchErr);
                      } else {
                        console.log(`✅ Inventar PLUS: Creat lot ${batchNumber} cu +${diff}`);
                        resolveBatch({ batchId: this.lastID });
                      }
                    });
                  });
                  
                  // Înregistrează în stock_moves
                  await new Promise((resolveMove, rejectMove) => {
                    db.run(`
                      INSERT INTO stock_moves (
                        ingredient_id, quantity_in, type, reference_type, reference_id, unit_price, value_in, created_at
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                      ingredientId,
                      diff, // quantity_in (pozitiv pentru plus)
                      'ADJUST',
                      'INVENTAR',
                      id,
                      costUnit,
                      diff * costUnit,
                      now
                    ], function (moveErr) {
                      if (moveErr) {
                        console.error(`❌ Eroare înregistrare stock_move pentru ingredient ${ingredientId}:`, moveErr);
                        rejectMove(moveErr);
                      } else {
                        resolveMove({ moveId: this.lastID });
                      }
                    });
                  });
                  
                } else if (diff < 0) {
                  // 🔥 MINUS - Scade stocul (lipsă în inventar)
                  // Scade din loturi existente (FIFO)
                  let remainingToDeduct = Math.abs(diff);
                  
                  for (const batch of batches) {
                    if (remainingToDeduct <= 0) break;
                    
                    const batchQty = parseFloat(batch.remaining_quantity) || 0;
                    const deductFromThisBatch = Math.min(remainingToDeduct, batchQty);
                    
                    await new Promise((resolveDeduct, rejectDeduct) => {
                      db.run(`
                        UPDATE ingredient_batches 
                        SET remaining_quantity = remaining_quantity - ?
                        WHERE id = ?
                      `, [deductFromThisBatch, batch.id], (err) => {
                        if (err) rejectDeduct(err);
                        else resolveDeduct();
                      });
                    });
                    
                    remainingToDeduct -= deductFromThisBatch;
                    
                    console.log(`✅ Inventar MINUS: Scăzut ${deductFromThisBatch} din lot ${batch.batch_number}`);
                  }
                  
                  if (remainingToDeduct > 0) {
                    console.warn(`⚠️ ATENȚIE: Nu s-au putut scădea ${remainingToDeduct} - stoc insuficient în loturi!`);
                  }
                  
                  // Calculează valoare totală scăzută
                  const totalValue = batches.slice(0, batches.findIndex(b => 
                    batches.slice(0, batches.indexOf(b) + 1).reduce((sum, batch) => 
                      sum + Math.min(remainingToDeduct, parseFloat(batch.remaining_quantity || 0)), 0
                    ) >= Math.abs(diff)
                  )).reduce((sum, batch) => sum + (parseFloat(batch.remaining_quantity || 0) * parseFloat(batch.unit_cost || 0)), 0);
                  
                  // Înregistrează în stock_moves
                  await new Promise((resolveMove, rejectMove) => {
                    db.run(`
                      INSERT INTO stock_moves (
                        ingredient_id, quantity_out, type, reference_type, reference_id, unit_price, value_out, created_at
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                      ingredientId,
                      Math.abs(diff), // quantity_out (pozitiv pentru minus)
                      'ADJUST',
                      'INVENTAR',
                      id,
                      totalValue / Math.abs(diff), // Cost mediu din loturi
                      totalValue,
                      now
                    ], function (moveErr) {
                      if (moveErr) {
                        console.error(`❌ Eroare înregistrare stock_move pentru ingredient ${ingredientId}:`, moveErr);
                        rejectMove(moveErr);
                      } else {
                        resolveMove({ moveId: this.lastID });
                      }
                    });
                  });
                }
              }
              
              console.log(`✅ Inventar #${id}: Lock complet! ${lines.length} ingrediente ajustate.`);
              
              resolve({ id, status: 'LOCKED' });
            } catch (processErr) {
              console.error(`❌ Eroare procesare Inventar #${id}:`, processErr);
              reject(processErr);
            }
          } else if (type === 'TRANSFER') {
            // 🔥 FAZA 1: Fix Transferuri - Mută loturi între gestiuni folosind FIFO
            try {
              const doc = await this.getById(id);
              if (!doc) {
                reject(new Error('Transfer document not found'));
                return;
              }
              
              // Parsează document_data pentru locații
              const documentData = typeof doc.document_data === 'string'
                ? JSON.parse(doc.document_data || '{}')
                : doc.document_data || {};
              
              const sourceLocationId = documentData.source_location_id || documentData.sourceLocationId || doc.location_id || 1;
              const targetLocationId = documentData.target_location_id || documentData.targetLocationId || 1;
              
              if (sourceLocationId === targetLocationId) {
                reject(new Error('Source și target location trebuie să fie diferite'));
                return;
              }
              
              const lines = typeof doc.lines === 'string' 
                ? JSON.parse(doc.lines) 
                : doc.lines || [];
              
              // Pentru fiecare linie, mută loturi (FIFO)
              for (const line of lines) {
                const ingredientId = line.ingredient_id || line.ingredientId || line.itemId;
                if (!ingredientId) continue; // Skip dacă nu e ingredient
                
                const quantityToTransfer = parseFloat(line.quantity || line.qty || 0);
                if (quantityToTransfer <= 0) continue; // Skip dacă cantitatea e 0
                
                // Obține loturile din locația sursă (FIFO)
                const sourceBatches = await new Promise((resolveBatches, rejectBatches) => {
                  db.all(`
                    SELECT * FROM ingredient_batches 
                    WHERE ingredient_id = ? AND location_id = ? AND remaining_quantity > 0
                    ORDER BY purchase_date ASC, id ASC
                  `, [ingredientId, sourceLocationId], (err, rows) => {
                    if (err) rejectBatches(err);
                    else resolveBatches(rows || []);
                  });
                });
                
                if (!sourceBatches || sourceBatches.length === 0) {
                  console.warn(`⚠️ Nu există stoc disponibil pentru ingredient ${ingredientId} în locația sursă ${sourceLocationId}`);
                  continue;
                }
                
                let remainingToTransfer = quantityToTransfer;
                const transferredBatches = [];
                
                // Scade din loturile sursă (FIFO)
                for (const batch of sourceBatches) {
                  if (remainingToTransfer <= 0) break;
                  
                  const batchQty = parseFloat(batch.remaining_quantity) || 0;
                  const transferFromThisBatch = Math.min(remainingToTransfer, batchQty);
                  
                  // Scade din lotul sursă
                  await new Promise((resolveDeduct, rejectDeduct) => {
                    db.run(`
                      UPDATE ingredient_batches 
                      SET remaining_quantity = remaining_quantity - ?
                      WHERE id = ?
                    `, [transferFromThisBatch, batch.id], (err) => {
                      if (err) rejectDeduct(err);
                      else resolveDeduct();
                    });
                  });
                  
                  // Creează lot nou în locația țintă
                  const newBatchNumber = `TRF-${doc.number || id}-${ingredientId}-${batch.id}`;
                  
                  await new Promise((resolveCreate, rejectCreate) => {
                    db.run(`
                      INSERT INTO ingredient_batches (
                        ingredient_id, batch_number, quantity, remaining_quantity,
                        purchase_date, expiry_date, supplier, invoice_number, unit_cost,
                        location_id, supplier_id, created_at
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                      ingredientId,
                      newBatchNumber,
                      transferFromThisBatch,
                      transferFromThisBatch,
                      batch.purchase_date,
                      batch.expiry_date,
                      batch.supplier,
                      `TRF-${doc.number || id}`,
                      batch.unit_cost, // Păstrează costul original
                      targetLocationId,
                      batch.supplier_id,
                      now
                    ], function (createErr) {
                      if (createErr) {
                        console.error(`❌ Eroare creare lot în locația țintă:`, createErr);
                        rejectCreate(createErr);
                      } else {
                        console.log(`✅ Transfer: Mutat ${transferFromThisBatch} din lot ${batch.batch_number} → ${newBatchNumber}`);
                        resolveCreate({ batchId: this.lastID });
                      }
                    });
                  });
                  
                  transferredBatches.push({
                    source_batch_id: batch.id,
                    source_batch_number: batch.batch_number,
                    target_batch_id: newBatchNumber,
                    quantity_transferred: transferFromThisBatch,
                    unit_cost: batch.unit_cost
                  });
                  
                  remainingToTransfer -= transferFromThisBatch;
                }
                
                if (remainingToTransfer > 0) {
                  console.warn(`⚠️ ATENȚIE: Nu s-au putut transfera ${remainingToTransfer} - stoc insuficient în locația sursă!`);
                }
                
                // Calculează valoare totală transferată
                const totalValue = transferredBatches.reduce((sum, b) => 
                  sum + (b.quantity_transferred * b.unit_cost), 0
                );
                
                // Înregistrează în stock_moves (OUT din sursă)
                await new Promise((resolveMoveOut, rejectMoveOut) => {
                  db.run(`
                    INSERT INTO stock_moves (
                      ingredient_id, quantity_out, type, reference_type, reference_id, unit_price, value_out, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  `, [
                    ingredientId,
                    quantityToTransfer,
                    'TRANSFER',
                    'TRANSFER',
                    id,
                    totalValue / quantityToTransfer,
                    totalValue,
                    now
                  ], function (moveErr) {
                    if (moveErr) {
                      console.error(`❌ Eroare înregistrare stock_move OUT:`, moveErr);
                      rejectMoveOut(moveErr);
                    } else {
                      resolveMoveOut({ moveId: this.lastID });
                    }
                  });
                });
                
                // Înregistrează în stock_moves (IN în țintă)
                await new Promise((resolveMoveIn, rejectMoveIn) => {
                  db.run(`
                    INSERT INTO stock_moves (
                      ingredient_id, quantity_in, type, reference_type, reference_id, unit_price, value_in, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  `, [
                    ingredientId,
                    quantityToTransfer,
                    'TRANSFER',
                    'TRANSFER',
                    id,
                    totalValue / quantityToTransfer,
                    totalValue,
                    now
                  ], function (moveErr) {
                    if (moveErr) {
                      console.error(`❌ Eroare înregistrare stock_move IN:`, moveErr);
                      rejectMoveIn(moveErr);
                    } else {
                      resolveMoveIn({ moveId: this.lastID });
                    }
                  });
                });
              }
              
              console.log(`✅ Transfer #${id}: Lock complet! ${lines.length} ingrediente transferate între gestiuni.`);
              
              resolve({ id, status: 'LOCKED' });
            } catch (processErr) {
              console.error(`❌ Eroare procesare Transfer #${id}:`, processErr);
              reject(processErr);
            }
          } else if (type === 'WASTE') {
            // 🔥 FAZA 1: Fix Waste - Consumă din loturi folosind FIFO (pentru pierderi/deteriorări)
            try {
              const doc = await this.getById(id);
              if (!doc) {
                reject(new Error('Waste document not found'));
                return;
              }
              
              const locationId = doc.location_id || 1;
              const lines = typeof doc.lines === 'string' 
                ? JSON.parse(doc.lines) 
                : doc.lines || [];
              
              // Importă StockConsumptionEngine
              const StockConsumptionEngine = require('../../../../utils/stock-consumption-engine');
              
              // Pentru fiecare linie, consumă din loturi (FIFO) - similar cu Bon Consum
              for (const line of lines) {
                const ingredientId = line.ingredient_id || line.ingredientId || line.itemId;
                if (!ingredientId) continue; // Skip dacă nu e ingredient
                
                const quantityNeeded = parseFloat(line.quantity || line.qty || 0);
                if (quantityNeeded <= 0) continue; // Skip dacă cantitatea e 0
                
                try {
                  // Folosește StockConsumptionEngine pentru consum FIFO
                  const consumeResult = await StockConsumptionEngine.consumeStock(
                    ingredientId,
                    quantityNeeded,
                    null, // orderId (nu e comandă)
                    locationId,
                    null  // auto-detect FIFO/FEFO
                  );
                  
                  // Calculează valoare totală din loturi consumate
                  const totalValue = consumeResult.batches.reduce((sum, batch) => 
                    sum + (batch.quantity_consumed * batch.unit_cost), 0
                  );
                  
                  // Înregistrează în stock_moves (WASTE)
                  await new Promise((resolveMove, rejectMove) => {
                    db.run(`
                      INSERT INTO stock_moves (
                        ingredient_id, quantity_out, type, reference_type, reference_id, unit_price, value_out, created_at
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                      ingredientId,
                      quantityNeeded, // quantity_out (pozitiv pentru consum)
                      'WASTE',
                      'WASTE',
                      id,
                      totalValue / quantityNeeded, // Cost mediu din loturi
                      totalValue,
                      now
                    ], function (moveErr) {
                      if (moveErr) {
                        console.error(`❌ Eroare înregistrare stock_move pentru ingredient ${ingredientId}:`, moveErr);
                        rejectMove(moveErr);
                      } else {
                        console.log(`✅ Waste FIFO pentru ingredient ${ingredientId}: ${quantityNeeded}, valoare: ${totalValue} RON`);
                        // Salvează meta în document_data pentru trasabilitate
                        const meta = {
                          batches_used: consumeResult.batches,
                          method: consumeResult.method,
                          stock_move_id: this.lastID,
                          waste_reason: line.reason || line.waste_reason || 'Pierdere/Deteriorare'
                        };
                        // Actualizează document_data cu meta
                        const documentData = typeof doc.document_data === 'string'
                          ? JSON.parse(doc.document_data || '{}')
                          : doc.document_data || {};
                        if (!documentData.waste_meta) documentData.waste_meta = [];
                        documentData.waste_meta.push(meta);
                        db.run(
                          `UPDATE tipizate_documents SET document_data = ? WHERE id = ?`,
                          [JSON.stringify(documentData), id],
                          (updateErr) => {
                            if (updateErr) console.error(`⚠️ Eroare actualizare document_data cu meta:`, updateErr);
                          }
                        );
                        resolveMove({ moveId: this.lastID });
                      }
                    });
                  });
                } catch (consumeErr) {
                  console.error(`❌ Eroare consum ingredient ${ingredientId} din Waste:`, consumeErr);
                  // Continuă cu următoarele ingrediente chiar dacă unul eșuează
                }
              }
              
              console.log(`✅ Waste #${id}: Lock complet! ${lines.length} ingrediente marcate ca pierderi folosind FIFO.`);
              
              resolve({ id, status: 'LOCKED' });
            } catch (processErr) {
              console.error(`❌ Eroare procesare Waste #${id}:`, processErr);
              reject(processErr);
            }
          } else if (type === 'AVIZ') {
            // 🔥 AVIZ - Însoțire marfă (fără mișcare de stoc, doar trasabilitate)
            try {
              const doc = await this.getById(id);
              if (!doc) {
                reject(new Error('Aviz document not found'));
                return;
              }
              
              const lines = typeof doc.lines === 'string' 
                ? JSON.parse(doc.lines) 
                : doc.lines || [];
              
              // Avizul NU mișcă stocuri (doar însoțește marfa)
              // Dar înregistrăm în stock_moves pentru trasabilitate
              for (const line of lines) {
                const ingredientId = line.ingredient_id || line.ingredientId || line.itemId;
                if (!ingredientId) continue;
                
                const quantity = parseFloat(line.quantity || line.qty || 0);
                if (quantity <= 0) continue;
                
                // Înregistrează în stock_moves (doar pentru trasabilitate, fără mișcare reală)
                await new Promise((resolveMove, rejectMove) => {
                  db.run(`
                    INSERT INTO stock_moves (
                      ingredient_id, quantity_out, type, reference_type, reference_id, 
                      move_reason, created_at
                    ) VALUES (?, 0, 'AVIZ', 'AVIZ', ?, ?, ?)
                  `, [
                    ingredientId,
                    id,
                    `Aviz însoțire marfă - cantitate: ${quantity}`,
                    now
                  ], function (moveErr) {
                    if (moveErr) {
                      console.error(`❌ Eroare înregistrare stock_move pentru aviz:`, moveErr);
                      rejectMove(moveErr);
                    } else {
                      console.log(`✅ Aviz: Înregistrat trasabilitate pentru ingredient ${ingredientId}`);
                      resolveMove({ moveId: this.lastID });
                    }
                  });
                });
              }
              
              console.log(`✅ Aviz #${id}: Lock complet! ${lines.length} linii înregistrate pentru trasabilitate.`);
              resolve({ id, status: 'LOCKED' });
            } catch (processErr) {
              console.error(`❌ Eroare procesare Aviz #${id}:`, processErr);
              reject(processErr);
            }
          } else if (type === 'PROCES_VERBAL') {
            // 🔥 PROCES VERBAL - Ajustare stocuri pe baza constatărilor
            try {
              const doc = await this.getById(id);
              if (!doc) {
                reject(new Error('Proces Verbal document not found'));
                return;
              }
              
              const locationId = doc.location_id || 1;
              const lines = typeof doc.lines === 'string' 
                ? JSON.parse(doc.lines) 
                : doc.lines || [];
              
              const documentData = typeof doc.document_data === 'string'
                ? JSON.parse(doc.document_data || '{}')
                : doc.document_data || {};
              
              const decision = documentData.decision || 'Scoatere din gestiune fără imputare';
              
              // Importă StockConsumptionEngine pentru scădere din loturi
              const StockConsumptionEngine = require('../../../../utils/stock-consumption-engine');
              
              for (const line of lines) {
                const ingredientId = line.ingredient_id || line.ingredientId || line.itemId;
                if (!ingredientId) continue;
                
                // Calculăm diferența (negativ = lipsă, trebuie scăzut din stoc)
                const qtyScriptic = parseFloat(line.quantityScriptic || line.quantity_scriptic || 0);
                const qtyFaptic = parseFloat(line.quantityFaptic || line.quantity_faptic || 0);
                const diff = qtyFaptic - qtyScriptic;
                
                if (Math.abs(diff) < 0.001) continue; // Skip dacă diferența e neglijabilă
                
                if (diff < 0) {
                  // MINUS - Scade din stoc (lipsă constatată)
                  const quantityToDeduct = Math.abs(diff);
                  
                  try {
                    const consumeResult = await StockConsumptionEngine.consumeStock(
                      ingredientId,
                      quantityToDeduct,
                      null,
                      locationId,
                      null
                    );
                    
                    const totalValue = consumeResult.batches.reduce((sum, batch) => 
                      sum + (batch.quantity_consumed * batch.unit_cost), 0
                    );
                    
                    await new Promise((resolveMove, rejectMove) => {
                      db.run(`
                        INSERT INTO stock_moves (
                          ingredient_id, quantity_out, type, reference_type, reference_id, 
                          unit_price, value_out, move_reason, created_at
                        ) VALUES (?, ?, 'PROCES_VERBAL', 'PROCES_VERBAL', ?, ?, ?, ?, ?)
                      `, [
                        ingredientId,
                        quantityToDeduct,
                        id,
                        totalValue / quantityToDeduct,
                        totalValue,
                        `Proces Verbal - ${decision}: lipsă ${quantityToDeduct}`,
                        now
                      ], function (moveErr) {
                        if (moveErr) rejectMove(moveErr);
                        else resolveMove({ moveId: this.lastID });
                      });
                    });
                    
                    console.log(`✅ PV MINUS: Scăzut ${quantityToDeduct} din ingredient ${ingredientId}`);
                  } catch (consumeErr) {
                    console.error(`❌ Eroare consum PV pentru ingredient ${ingredientId}:`, consumeErr);
                  }
                } else if (diff > 0) {
                  // PLUS - Adaugă în stoc (surplus constatat)
                  const batchNumber = `PV-${doc.number || id}-${ingredientId}`;
                  const costUnit = parseFloat(line.unitPrice || line.unit_price || 0);
                  
                  await new Promise((resolveBatch, rejectBatch) => {
                    db.run(`
                      INSERT INTO ingredient_batches (
                        ingredient_id, batch_number, quantity, remaining_quantity,
                        purchase_date, supplier, invoice_number, unit_cost, location_id, created_at
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                      ingredientId,
                      batchNumber,
                      diff,
                      diff,
                      doc.date || now.split('T')[0],
                      'Proces Verbal - Surplus',
                      doc.number || `PV-${id}`,
                      costUnit,
                      locationId,
                      now
                    ], function (batchErr) {
                      if (batchErr) rejectBatch(batchErr);
                      else resolveBatch({ batchId: this.lastID });
                    });
                  });
                  
                  await new Promise((resolveMove, rejectMove) => {
                    db.run(`
                      INSERT INTO stock_moves (
                        ingredient_id, quantity_in, type, reference_type, reference_id, 
                        unit_price, value_in, move_reason, created_at
                      ) VALUES (?, ?, 'PROCES_VERBAL', 'PROCES_VERBAL', ?, ?, ?, ?, ?)
                    `, [
                      ingredientId,
                      diff,
                      id,
                      costUnit,
                      diff * costUnit,
                      `Proces Verbal - ${decision}: surplus ${diff}`,
                      now
                    ], function (moveErr) {
                      if (moveErr) rejectMove(moveErr);
                      else resolveMove({ moveId: this.lastID });
                    });
                  });
                  
                  console.log(`✅ PV PLUS: Adăugat ${diff} la ingredient ${ingredientId}`);
                }
              }
              
              console.log(`✅ Proces Verbal #${id}: Lock complet! ${lines.length} linii procesate.`);
              resolve({ id, status: 'LOCKED' });
            } catch (processErr) {
              console.error(`❌ Eroare procesare Proces Verbal #${id}:`, processErr);
              reject(processErr);
            }
          } else if (type === 'RETUR') {
            // 🔥 RETUR - Intrare sau ieșire stoc în funcție de tipul returului
            try {
              const doc = await this.getById(id);
              if (!doc) {
                reject(new Error('Retur document not found'));
                return;
              }
              
              const locationId = doc.location_id || 1;
              const lines = typeof doc.lines === 'string' 
                ? JSON.parse(doc.lines) 
                : doc.lines || [];
              
              const documentData = typeof doc.document_data === 'string'
                ? JSON.parse(doc.document_data || '{}')
                : doc.document_data || {};
              
              const fiscalHeader = typeof doc.fiscal_header === 'string'
                ? JSON.parse(doc.fiscal_header || '{}')
                : doc.fiscal_header || {};
              
              const returType = documentData.returType || fiscalHeader.returType || 'Retur către furnizor';
              const isReturToSupplier = returType.toLowerCase().includes('furnizor') || returType === 'SUPPLIER';
              const isReturFromClient = returType.toLowerCase().includes('client') || returType === 'CUSTOMER';
              
              const StockConsumptionEngine = require('../../../../utils/stock-consumption-engine');
              
              for (const line of lines) {
                const ingredientId = line.ingredient_id || line.ingredientId || line.itemId;
                if (!ingredientId) continue;
                
                const quantity = parseFloat(line.quantity || line.qty || 0);
                if (quantity <= 0) continue;
                
                const unitPrice = parseFloat(line.unitPrice || line.unit_price || 0);
                const totalValue = quantity * unitPrice;
                
                if (isReturToSupplier) {
                  // RETUR CĂTRE FURNIZOR = IEȘIRE din stoc
                  try {
                    const consumeResult = await StockConsumptionEngine.consumeStock(
                      ingredientId,
                      quantity,
                      null,
                      locationId,
                      null
                    );
                    
                    const actualValue = consumeResult.batches.reduce((sum, batch) => 
                      sum + (batch.quantity_consumed * batch.unit_cost), 0
                    );
                    
                    await new Promise((resolveMove, rejectMove) => {
                      db.run(`
                        INSERT INTO stock_moves (
                          ingredient_id, quantity_out, type, reference_type, reference_id, 
                          unit_price, value_out, move_reason, created_at
                        ) VALUES (?, ?, 'RETUR', 'RETUR', ?, ?, ?, ?, ?)
                      `, [
                        ingredientId,
                        quantity,
                        id,
                        actualValue / quantity,
                        actualValue,
                        `Retur către furnizor: ${quantity}`,
                        now
                      ], function (moveErr) {
                        if (moveErr) rejectMove(moveErr);
                        else resolveMove({ moveId: this.lastID });
                      });
                    });
                    
                    console.log(`✅ Retur FURNIZOR: Scăzut ${quantity} din ingredient ${ingredientId}`);
                  } catch (consumeErr) {
                    console.error(`❌ Eroare retur furnizor pentru ingredient ${ingredientId}:`, consumeErr);
                  }
                } else if (isReturFromClient) {
                  // RETUR DE LA CLIENT = INTRARE în stoc
                  const batchNumber = `RETUR-${doc.number || id}-${ingredientId}`;
                  
                  await new Promise((resolveBatch, rejectBatch) => {
                    db.run(`
                      INSERT INTO ingredient_batches (
                        ingredient_id, batch_number, quantity, remaining_quantity,
                        purchase_date, supplier, invoice_number, unit_cost, location_id, created_at
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                      ingredientId,
                      batchNumber,
                      quantity,
                      quantity,
                      doc.date || now.split('T')[0],
                      'Retur de la client',
                      doc.number || `RETUR-${id}`,
                      unitPrice,
                      locationId,
                      now
                    ], function (batchErr) {
                      if (batchErr) rejectBatch(batchErr);
                      else resolveBatch({ batchId: this.lastID });
                    });
                  });
                  
                  // Actualizează current_stock
                  await new Promise((resolveStock, rejectStock) => {
                    db.run(`
                      UPDATE ingredients 
                      SET current_stock = current_stock + ?, last_updated = ?
                      WHERE id = ?
                    `, [quantity, now, ingredientId], function (stockErr) {
                      if (stockErr) rejectStock(stockErr);
                      else resolveStock();
                    });
                  });
                  
                  await new Promise((resolveMove, rejectMove) => {
                    db.run(`
                      INSERT INTO stock_moves (
                        ingredient_id, quantity_in, type, reference_type, reference_id, 
                        unit_price, value_in, move_reason, created_at
                      ) VALUES (?, ?, 'RETUR', 'RETUR', ?, ?, ?, ?, ?)
                    `, [
                      ingredientId,
                      quantity,
                      id,
                      unitPrice,
                      totalValue,
                      `Retur de la client: ${quantity}`,
                      now
                    ], function (moveErr) {
                      if (moveErr) rejectMove(moveErr);
                      else resolveMove({ moveId: this.lastID });
                    });
                  });
                  
                  console.log(`✅ Retur CLIENT: Adăugat ${quantity} la ingredient ${ingredientId}`);
                } else {
                  // RETUR INTERN - doar trasabilitate
                  await new Promise((resolveMove, rejectMove) => {
                    db.run(`
                      INSERT INTO stock_moves (
                        ingredient_id, quantity_out, type, reference_type, reference_id, 
                        move_reason, created_at
                      ) VALUES (?, 0, 'RETUR', 'RETUR', ?, ?, ?)
                    `, [
                      ingredientId,
                      id,
                      `Retur intern - cantitate: ${quantity}`,
                      now
                    ], function (moveErr) {
                      if (moveErr) rejectMove(moveErr);
                      else resolveMove({ moveId: this.lastID });
                    });
                  });
                  
                  console.log(`✅ Retur INTERN: Înregistrat pentru ingredient ${ingredientId}`);
                }
              }
              
              console.log(`✅ Retur #${id}: Lock complet! ${lines.length} linii procesate (${returType}).`);
              resolve({ id, status: 'LOCKED' });
            } catch (processErr) {
              console.error(`❌ Eroare procesare Retur #${id}:`, processErr);
              reject(processErr);
            }
          } else if (type === 'RAPORT_GESTIUNE') {
            // 🔥 RAPORT GESTIUNE - Doar generare, fără mișcare de stoc
            // Raportul este calculat automat din mișcările existente
            console.log(`✅ Raport Gestiune #${id}: Lock complet! (document de raportare, fără mișcări de stoc)`);
            resolve({ id, status: 'LOCKED' });
          } else {
            // Pentru alte tipuri de documente, doar lock
            resolve({ id, status: 'LOCKED' });
          }
        }
      );
    });
  },

  /**
   * Archive document
   */
  async archiveDocument(id: number, userId: number, reason?: string) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE tipizate_documents SET
          status = 'ARCHIVED',
          archived_at = ?,
          updated_at = ?
        WHERE id = ? AND status = 'LOCKED'`,
        [now, now, id],
        async function (err) {
          if (err) {
            reject(err);
            return;
          }
          if (this.changes === 0) {
            reject(new Error('Document cannot be archived'));
            return;
          }
          
          // Insert into archive table
          try {
            await new Promise((resolveArchive, rejectArchive) => {
              db.run(
                `INSERT INTO tipizate_archive (
                  document_id, archived_at, archived_by, archive_reason
                ) VALUES (?, ?, ?, ?)`,
                [id, now, userId, reason || null],
                function (archiveErr) {
                  if (archiveErr) rejectArchive(archiveErr);
                  else resolveArchive({ archiveId: this.lastID });
                }
              );
            });
            resolve({ id, status: 'ARCHIVED' });
          } catch (archiveErr) {
            reject(archiveErr);
          }
        }
      );
    });
  },

  /**
   * PHASE S8.3 - Get document with lines
   */
  async getWithLines(id: number) {
    const db = await dbPromise;
    const document = await this.getById(id);
    if (!document) {
      return null;
    }

    // Get lines
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM tipizate_lines WHERE document_id = ? ORDER BY line_number`,
        [id],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const lines = (rows || []).map(row => {
              if (row.line_data && typeof row.line_data === 'string') {
                row.line_data = JSON.parse(row.line_data);
              }
              return row;
            });
            resolve({ ...document, lines });
          }
        }
      );
    });
  },

  /**
   * PHASE S8.3 - Save UBL XML to document
   */
  async saveUBLXml(id: number, xml: string) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE tipizate_documents SET ubl_xml = ?, updated_at = datetime('now', 'localtime') WHERE id = ?`,
        [xml, id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ubl_xml: xml });
        }
      );
    });
  },
};

