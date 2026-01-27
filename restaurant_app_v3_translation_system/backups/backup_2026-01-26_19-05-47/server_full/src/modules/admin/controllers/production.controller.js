// src/modules/admin/controllers/production.controller.js
// Controller pentru Production Batches

/**
 * GET /api/admin/production/batches
 * Listează toate batch-urile de producție
 */
async function listProductionBatches(req, res) {
  try {
    // Try to import database with correct relative path
    const { dbPromise } = require('../../../../database');
    const db = await dbPromise;

    // Helper function
    function dbAll(query, params = []) {
      return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    }

    const batches = await dbAll('SELECT * FROM production_documents ORDER BY production_date DESC', []);

    res.json({
      success: true,
      data: batches,
      message: 'Database accessed successfully'
    });
  } catch (error) {
    console.error('❌ Eroare la listarea batch-urilor de producție:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la încărcarea batch-urilor de producție: ' + error.message
    });
  }
}

/**
 * GET /api/admin/production/batches/:id
 * Obține un batch de producție specific
 */
async function getProductionBatch(req, res) {
  try {
    const { id } = req.params;
    const { dbPromise } = require('../../../../database');
    const db = await dbPromise;

    // Obține documentul principal
    const batch = await db.get(`
      SELECT pd.*, g.name as location_name
      FROM production_documents pd
      LEFT JOIN gestiuni g ON pd.location_id = g.id
      WHERE pd.id = ?
    `, [id]);

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch-ul de producție nu a fost găsit'
      });
    }

    // Obține input-urile (ingrediente consumate)
    const inputs = await dbAll(db, `
      SELECT pi.*, i.name as ingredient_name, i.unit
      FROM production_inputs pi
      JOIN ingredients i ON pi.ingredient_id = i.id
      WHERE pi.production_id = ?
      ORDER BY pi.id
    `, [id]);

    // Obține output-urile (produse create)
    const outputs = await dbAll(db, `
      SELECT po.*, p.name as product_name, p.unit
      FROM production_outputs po
      JOIN products p ON po.product_id = p.id
      WHERE po.production_id = ?
      ORDER BY po.id
    `, [id]);

    res.json({
      success: true,
      data: {
        ...batch,
        inputs,
        outputs
      }
    });
  } catch (error) {
    console.error('❌ Eroare la obținerea batch-ului de producție:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la încărcarea batch-ului de producție'
    });
  }
}

/**
 * POST /api/admin/production/batches
 * Creează un nou batch de producție
 */
async function createProductionBatch(req, res) {
  const { dbPromise } = require('../../../../database');
  const db = await dbPromise;
  const transaction = await db.run('BEGIN TRANSACTION');

  try {
    const {
      batch_date,
      location_id,
      recipe_id,
      recipe_name,
      responsible,
      notes,
      inputs = [],
      outputs = []
    } = req.body;

    // Generează număr batch unic
    const batchNumber = `PB-${Date.now()}`;

    // Inserează documentul principal
    const result = await db.run(`
      INSERT INTO production_documents (
        production_number,
        production_date,
        location_id,
        quantity_produced,
        produced_by,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      batchNumber,
      batch_date || new Date().toISOString(),
      location_id,
      outputs.reduce((sum, output) => sum + (output.quantity || 0), 0),
      responsible,
      notes
    ]);

    const batchId = result.lastID;

    // Inserează input-urile (ingrediente consumate)
    for (const input of inputs) {
      await db.run(`
        INSERT INTO production_inputs (
          production_id,
          ingredient_id,
          quantity,
          unit_cost
        ) VALUES (?, ?, ?, ?)
      `, [
        batchId,
        input.ingredient_id,
        input.quantity,
        input.unit_cost || 0
      ]);

      // Creează mișcare de stoc pentru consum
      await db.run(`
        INSERT INTO inventory_movements (
          ingredient_id,
          quantity_change,
          movement_type,
          reference_type,
          reference_id,
          notes,
          created_by
        ) VALUES (?, ?, 'production', 'production', ?, ?, ?)
      `, [
        input.ingredient_id,
        -Math.abs(input.quantity), // Cantitate negativă (consum)
        batchId,
        `Producție batch ${batchNumber}`,
        req.user?.id || 1
      ]);
    }

    // Inserează output-urile (produse create)
    for (const output of outputs) {
      await db.run(`
        INSERT INTO production_outputs (
          production_id,
          product_id,
          quantity,
          unit_cost
        ) VALUES (?, ?, ?, ?)
      `, [
        batchId,
        output.product_id,
        output.quantity,
        output.unit_cost || 0
      ]);

      // Creează mișcare de stoc pentru producție
      await db.run(`
        INSERT INTO inventory_movements (
          product_id,
          quantity_change,
          movement_type,
          reference_type,
          reference_id,
          notes,
          created_by
        ) VALUES (?, ?, 'production', 'production', ?, ?, ?)
      `, [
        output.product_id,
        output.quantity, // Cantitate pozitivă (producție)
        batchId,
        `Producție batch ${batchNumber}`,
        req.user?.id || 1
      ]);
    }

    await db.run('COMMIT');

    res.json({
      success: true,
      data: {
        id: batchId,
        batch_number: batchNumber,
        message: 'Batch-ul de producție a fost creat cu succes'
      }
    });
  } catch (error) {
    await db.run('ROLLBACK');
    console.error('❌ Eroare la crearea batch-ului de producție:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la crearea batch-ului de producție'
    });
  }
}

/**
 * PUT /api/admin/production/batches/:id
 * Actualizează un batch de producție
 */
async function updateProductionBatch(req, res) {
  const { dbPromise } = require('../../../../database');
  const db = await dbPromise;
  const transaction = await db.run('BEGIN TRANSACTION');
  const { id } = req.params;

  try {
    const {
      batch_date,
      location_id,
      responsible,
      notes,
      inputs = [],
      outputs = []
    } = req.body;

    // Actualizează documentul principal
    await db.run(`
      UPDATE production_documents
      SET
        production_date = ?,
        location_id = ?,
        quantity_produced = ?,
        produced_by = ?,
        notes = ?
      WHERE id = ?
    `, [
      batch_date,
      location_id,
      outputs.reduce((sum, output) => sum + (output.quantity || 0), 0),
      responsible,
      notes,
      id
    ]);

    // Șterge input-urile și output-urile existente
    await db.run('DELETE FROM production_inputs WHERE production_id = ?', [id]);
    await db.run('DELETE FROM production_outputs WHERE production_id = ?', [id]);

    // Șterge mișcările de stoc existente pentru acest batch
    await db.run(`
      DELETE FROM inventory_movements
      WHERE reference_type = 'production' AND reference_id = ?
    `, [id]);

    // Re-inserează input-urile
    for (const input of inputs) {
      await db.run(`
        INSERT INTO production_inputs (
          production_id,
          ingredient_id,
          quantity,
          unit_cost
        ) VALUES (?, ?, ?, ?)
      `, [
        id,
        input.ingredient_id,
        input.quantity,
        input.unit_cost || 0
      ]);

      // Recreează mișcarea de stoc pentru consum
      await db.run(`
        INSERT INTO inventory_movements (
          ingredient_id,
          quantity_change,
          movement_type,
          reference_type,
          reference_id,
          notes,
          created_by
        ) VALUES (?, ?, 'production', 'production', ?, ?, ?)
      `, [
        input.ingredient_id,
        -Math.abs(input.quantity),
        id,
        `Producție batch actualizat`,
        req.user?.id || 1
      ]);
    }

    // Re-inserează output-urile
    for (const output of outputs) {
      await db.run(`
        INSERT INTO production_outputs (
          production_id,
          product_id,
          quantity,
          unit_cost
        ) VALUES (?, ?, ?, ?)
      `, [
        id,
        output.product_id,
        output.quantity,
        output.unit_cost || 0
      ]);

      // Recreează mișcarea de stoc pentru producție
      await db.run(`
        INSERT INTO inventory_movements (
          product_id,
          quantity_change,
          movement_type,
          reference_type,
          reference_id,
          notes,
          created_by
        ) VALUES (?, ?, 'production', 'production', ?, ?, ?)
      `, [
        output.product_id,
        output.quantity,
        id,
        `Producție batch actualizat`,
        req.user?.id || 1
      ]);
    }

    await db.run('COMMIT');

    res.json({
      success: true,
      message: 'Batch-ul de producție a fost actualizat cu succes'
    });
  } catch (error) {
    await db.run('ROLLBACK');
    console.error('❌ Eroare la actualizarea batch-ului de producție:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la actualizarea batch-ului de producție'
    });
  }
}

/**
 * DELETE /api/admin/production/batches/:id
 * Șterge un batch de producție
 */
async function deleteProductionBatch(req, res) {
  const { dbPromise } = require('../../../../database');
  const db = await dbPromise;
  const { id } = req.params;

  try {
    // Șterge mișcările de stoc asociate
    await db.run(`
      DELETE FROM inventory_movements
      WHERE reference_type = 'production' AND reference_id = ?
    `, [id]);

    // Șterge batch-ul (input-urile și output-urile se șterg automat prin CASCADE)
    const result = await db.run('DELETE FROM production_documents WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Batch-ul de producție nu a fost găsit'
      });
    }

    res.json({
      success: true,
      message: 'Batch-ul de producție a fost șters cu succes'
    });
  } catch (error) {
    console.error('❌ Eroare la ștergerea batch-ului de producție:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la ștergerea batch-ului de producție'
    });
  }
}

/**
 * POST /api/admin/production/batches/:id/finalize
 * Finalizează un batch de producție
 */
async function finalizeProductionBatch(req, res) {
  const { dbPromise } = require('../../../../database');
  const db = await dbPromise;
  const { id } = req.params;

  try {
    // Marchează batch-ul ca finalizat
    const result = await db.run(`
      UPDATE production_documents
      SET status = 'completed'
      WHERE id = ? AND status != 'completed'
    `, [id]);

    if (result.changes === 0) {
      return res.status(400).json({
        success: false,
        error: 'Batch-ul este deja finalizat sau nu există'
      });
    }

    res.json({
      success: true,
      message: 'Batch-ul de producție a fost finalizat cu succes'
    });
  } catch (error) {
    console.error('❌ Eroare la finalizarea batch-ului de producție:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la finalizarea batch-ului de producție'
    });
  }
}

module.exports = {
  listProductionBatches,
  getProductionBatch,
  createProductionBatch,
  updateProductionBatch,
  deleteProductionBatch,
  finalizeProductionBatch
};