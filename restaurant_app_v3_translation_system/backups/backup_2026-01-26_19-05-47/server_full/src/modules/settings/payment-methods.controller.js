/**
 * Payment Methods Controller
 * 
 * CRUD operations pentru gestionarea metodelor de plată
 */

const { dbPromise } = require('../../../database');

/**
 * GET /api/settings/payment-methods
 * Obține toate metodele de plată
 */
async function getPaymentMethods(req, res, next) {
  try {
    const db = await dbPromise;

    // Verifică dacă tabela există
    const tableExists = await new Promise((resolve) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='payment_methods'",
        (err, row) => {
          resolve(!!row);
        }
      );
    });

    if (!tableExists) {
      // Returnează metode default dacă tabela nu există
      return res.json([
        {
          id: 1,
          name: 'cash',
          code: 'cash',
          display_name: 'Numerar',
          display_name_en: 'Cash',
          icon: '💵',
          is_active: true,
          fee_percentage: 0,
          fee_fixed: 0,
          requires_change: true,
          requires_receipt: false,
          sort_order: 1,
        },
        {
          id: 2,
          name: 'card',
          code: 'card',
          display_name: 'Card',
          display_name_en: 'Card',
          icon: '💳',
          is_active: true,
          fee_percentage: 2.5,
          fee_fixed: 0,
          requires_change: false,
          requires_receipt: true,
          sort_order: 2,
        },
      ]);
    }

    const methods = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM payment_methods ORDER BY sort_order, name',
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    // Formatează pentru frontend
    const formattedMethods = methods.map(method => ({
      id: method.id,
      name: method.name,
      code: method.code,
      display_name: method.display_name,
      display_name_en: method.display_name_en,
      icon: method.icon || '💳',
      is_active: method.is_active === 1 || method.is_active === true,
      fee_percentage: method.fee_percentage || 0,
      fee_fixed: method.fee_fixed || 0,
      requires_change: method.requires_change === 1 || method.requires_change === true,
      requires_receipt: method.requires_receipt === 1 || method.requires_receipt === true,
      sort_order: method.sort_order || 0,
      location_id: method.location_id,
    }));

    res.json(formattedMethods);
  } catch (error) {
    console.error('❌ Error in getPaymentMethods:', error);
    res.status(500).json({ error: error.message || 'Eroare la încărcarea metodelor de plată' });
  }
}

/**
 * GET /api/settings/payment-methods/:id
 * Obține o metodă de plată după ID
 */
async function getPaymentMethodById(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const method = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM payment_methods WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });

    if (!method) {
      return res.status(404).json({ error: 'Metoda de plată nu există' });
    }

    res.json({
      id: method.id,
      name: method.name,
      code: method.code,
      display_name: method.display_name,
      display_name_en: method.display_name_en,
      icon: method.icon || '💳',
      is_active: method.is_active === 1 || method.is_active === true,
      fee_percentage: method.fee_percentage || 0,
      fee_fixed: method.fee_fixed || 0,
      requires_change: method.requires_change === 1 || method.requires_change === true,
      requires_receipt: method.requires_receipt === 1 || method.requires_receipt === true,
      sort_order: method.sort_order || 0,
      location_id: method.location_id,
    });
  } catch (error) {
    console.error('❌ Error in getPaymentMethodById:', error);
    res.status(500).json({ error: error.message || 'Eroare la încărcarea metodei de plată' });
  }
}

/**
 * POST /api/settings/payment-methods
 * Creează o metodă de plată nouă
 */
async function createPaymentMethod(req, res, next) {
  try {
    const {
      name,
      code,
      display_name,
      display_name_en,
      icon,
      is_active,
      fee_percentage,
      fee_fixed,
      requires_change,
      requires_receipt,
      sort_order,
      location_id,
    } = req.body;

    if (!name || !code || !display_name) {
      return res.status(400).json({ error: 'Nume, cod și nume afișare sunt obligatorii' });
    }

    const db = await dbPromise;

    // Verifică dacă tabela există, dacă nu o creează
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS payment_methods (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          code TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          display_name_en TEXT,
          icon TEXT,
          is_active INTEGER DEFAULT 1,
          fee_percentage REAL DEFAULT 0,
          fee_fixed REAL DEFAULT 0,
          requires_change INTEGER DEFAULT 0,
          requires_receipt INTEGER DEFAULT 1,
          sort_order INTEGER DEFAULT 0,
          location_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (location_id) REFERENCES locations(id)
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO payment_methods (
          name, code, display_name, display_name_en, icon,
          is_active, fee_percentage, fee_fixed,
          requires_change, requires_receipt, sort_order, location_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          code,
          display_name,
          display_name_en || null,
          icon || '💳',
          is_active !== undefined ? (is_active ? 1 : 0) : 1,
          fee_percentage || 0,
          fee_fixed || 0,
          requires_change !== undefined ? (requires_change ? 1 : 0) : 0,
          requires_receipt !== undefined ? (requires_receipt ? 1 : 0) : 1,
          sort_order || 0,
          location_id || null,
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Obține metoda creată
    const method = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM payment_methods WHERE id = ?',
        [result.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.status(201).json({
      id: method.id,
      name: method.name,
      code: method.code,
      display_name: method.display_name,
      display_name_en: method.display_name_en,
      icon: method.icon || '💳',
      is_active: method.is_active === 1,
      fee_percentage: method.fee_percentage || 0,
      fee_fixed: method.fee_fixed || 0,
      requires_change: method.requires_change === 1,
      requires_receipt: method.requires_receipt === 1,
      sort_order: method.sort_order || 0,
      location_id: method.location_id,
    });
  } catch (error) {
    console.error('❌ Error in createPaymentMethod:', error);
    if (error.message && error.message.includes('UNIQUE constraint')) {
      res.status(400).json({ error: 'Metoda de plată există deja' });
    } else {
      res.status(400).json({ error: error.message || 'Eroare la crearea metodei de plată' });
    }
  }
}

/**
 * PUT /api/settings/payment-methods/:id
 * Actualizează o metodă de plată
 */
async function updatePaymentMethod(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      display_name,
      display_name_en,
      icon,
      is_active,
      fee_percentage,
      fee_fixed,
      requires_change,
      requires_receipt,
      sort_order,
      location_id,
    } = req.body;

    const db = await dbPromise;

    // Verifică dacă metoda există
    const existing = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM payment_methods WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!existing) {
      return res.status(404).json({ error: 'Metoda de plată nu există' });
    }

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE payment_methods SET
          name = COALESCE(?, name),
          code = COALESCE(?, code),
          display_name = COALESCE(?, display_name),
          display_name_en = ?,
          icon = COALESCE(?, icon),
          is_active = ?,
          fee_percentage = COALESCE(?, fee_percentage),
          fee_fixed = COALESCE(?, fee_fixed),
          requires_change = ?,
          requires_receipt = ?,
          sort_order = COALESCE(?, sort_order),
          location_id = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          name || existing.name,
          code || existing.code,
          display_name || existing.display_name,
          display_name_en !== undefined ? display_name_en : existing.display_name_en,
          icon || existing.icon,
          is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
          fee_percentage !== undefined ? fee_percentage : existing.fee_percentage,
          fee_fixed !== undefined ? fee_fixed : existing.fee_fixed,
          requires_change !== undefined ? (requires_change ? 1 : 0) : existing.requires_change,
          requires_receipt !== undefined ? (requires_receipt ? 1 : 0) : existing.requires_receipt,
          sort_order !== undefined ? sort_order : existing.sort_order,
          location_id !== undefined ? location_id : existing.location_id,
          id,
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Obține metoda actualizată
    const method = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM payment_methods WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json({
      id: method.id,
      name: method.name,
      code: method.code,
      display_name: method.display_name,
      display_name_en: method.display_name_en,
      icon: method.icon || '💳',
      is_active: method.is_active === 1,
      fee_percentage: method.fee_percentage || 0,
      fee_fixed: method.fee_fixed || 0,
      requires_change: method.requires_change === 1,
      requires_receipt: method.requires_receipt === 1,
      sort_order: method.sort_order || 0,
      location_id: method.location_id,
    });
  } catch (error) {
    console.error('❌ Error in updatePaymentMethod:', error);
    res.status(400).json({ error: error.message || 'Eroare la actualizarea metodei de plată' });
  }
}

/**
 * DELETE /api/settings/payment-methods/:id
 * Șterge o metodă de plată
 */
async function deletePaymentMethod(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    // Verifică dacă metoda există
    const existing = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM payment_methods WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!existing) {
      return res.status(404).json({ error: 'Metoda de plată nu există' });
    }

    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM payment_methods WHERE id = ?',
        [id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ success: true, message: 'Metoda de plată a fost ștearsă' });
  } catch (error) {
    console.error('❌ Error in deletePaymentMethod:', error);
    res.status(500).json({ error: error.message || 'Eroare la ștergerea metodei de plată' });
  }
}

module.exports = {
  getPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
};

