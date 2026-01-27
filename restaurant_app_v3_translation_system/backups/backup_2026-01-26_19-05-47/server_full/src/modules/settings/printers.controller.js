/**
 * Printers Controller
 * 
 * CRUD operations pentru gestionarea imprimantelor
 */

const { dbPromise } = require('../../../database');

/**
 * GET /api/settings/printers
 * Obține toate imprimantele
 */
async function getPrinters(req, res, next) {
  try {
    const db = await dbPromise;

    // Verifică dacă tabela există
    const tableExists = await new Promise((resolve) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='printers'",
        (err, row) => {
          resolve(!!row);
        }
      );
    });

    if (!tableExists) {
      // Returnează array gol dacă tabela nu există
      return res.json([]);
    }

    const printers = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM printers ORDER BY name',
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    // Parsează JSON fields dacă există
    const formattedPrinters = printers.map(printer => ({
      ...printer,
      print_categories: printer.print_categories 
        ? (typeof printer.print_categories === 'string' 
          ? JSON.parse(printer.print_categories) 
          : printer.print_categories)
        : [],
    }));

    res.json(formattedPrinters);
  } catch (error) {
    console.error('❌ Error in getPrinters:', error);
    res.status(500).json({ error: error.message || 'Eroare la încărcarea imprimantelor' });
  }
}

/**
 * GET /api/settings/printers/:id
 * Obține o imprimantă după ID
 */
async function getPrinterById(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const printer = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM printers WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });

    if (!printer) {
      return res.status(404).json({ error: 'Imprimanta nu există' });
    }

    // Parsează JSON fields
    printer.print_categories = printer.print_categories 
      ? (typeof printer.print_categories === 'string' 
        ? JSON.parse(printer.print_categories) 
        : printer.print_categories)
      : [];

    res.json(printer);
  } catch (error) {
    console.error('❌ Error in getPrinterById:', error);
    res.status(500).json({ error: error.message || 'Eroare la încărcarea imprimantei' });
  }
}

/**
 * POST /api/settings/printers
 * Creează o imprimantă nouă
 */
async function createPrinter(req, res, next) {
  try {
    const {
      name,
      type,
      location_id,
      ip_address,
      port,
      connection_type,
      is_active,
      auto_print,
      print_categories,
      paper_width,
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Nume și tip sunt obligatorii' });
    }

    const db = await dbPromise;

    // Verifică dacă tabela există, dacă nu o creează
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS printers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          location_id INTEGER,
          ip_address TEXT,
          port INTEGER DEFAULT 9100,
          connection_type TEXT DEFAULT 'network',
          is_active INTEGER DEFAULT 1,
          auto_print INTEGER DEFAULT 1,
          print_categories TEXT,
          paper_width INTEGER DEFAULT 80,
          test_print_count INTEGER DEFAULT 0,
          last_test_print TEXT,
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

    const printCategoriesJson = print_categories 
      ? (Array.isArray(print_categories) ? JSON.stringify(print_categories) : print_categories)
      : null;

    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO printers (
          name, type, location_id, ip_address, port, connection_type,
          is_active, auto_print, print_categories, paper_width
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          type,
          location_id || null,
          ip_address || null,
          port || 9100,
          connection_type || 'network',
          is_active !== undefined ? (is_active ? 1 : 0) : 1,
          auto_print !== undefined ? (auto_print ? 1 : 0) : 1,
          printCategoriesJson,
          paper_width || 80,
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Obține imprimanta creată
    const printer = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM printers WHERE id = ?',
        [result.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.status(201).json(printer);
  } catch (error) {
    console.error('❌ Error in createPrinter:', error);
    res.status(400).json({ error: error.message || 'Eroare la crearea imprimantei' });
  }
}

/**
 * PUT /api/settings/printers/:id
 * Actualizează o imprimantă
 */
async function updatePrinter(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      location_id,
      ip_address,
      port,
      connection_type,
      is_active,
      auto_print,
      print_categories,
      paper_width,
    } = req.body;

    const db = await dbPromise;

    // Verifică dacă imprimanta există
    const existing = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM printers WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!existing) {
      return res.status(404).json({ error: 'Imprimanta nu există' });
    }

    const printCategoriesJson = print_categories 
      ? (Array.isArray(print_categories) ? JSON.stringify(print_categories) : print_categories)
      : existing.print_categories;

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE printers SET
          name = COALESCE(?, name),
          type = COALESCE(?, type),
          location_id = ?,
          ip_address = ?,
          port = COALESCE(?, port),
          connection_type = COALESCE(?, connection_type),
          is_active = ?,
          auto_print = ?,
          print_categories = ?,
          paper_width = COALESCE(?, paper_width),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          name || existing.name,
          type || existing.type,
          location_id !== undefined ? location_id : existing.location_id,
          ip_address !== undefined ? ip_address : existing.ip_address,
          port || existing.port,
          connection_type || existing.connection_type,
          is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
          auto_print !== undefined ? (auto_print ? 1 : 0) : existing.auto_print,
          printCategoriesJson,
          paper_width || existing.paper_width,
          id,
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Obține imprimanta actualizată
    const printer = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM printers WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json(printer);
  } catch (error) {
    console.error('❌ Error in updatePrinter:', error);
    res.status(400).json({ error: error.message || 'Eroare la actualizarea imprimantei' });
  }
}

/**
 * DELETE /api/settings/printers/:id
 * Șterge o imprimantă
 */
async function deletePrinter(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    // Verifică dacă imprimanta există
    const existing = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM printers WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!existing) {
      return res.status(404).json({ error: 'Imprimanta nu există' });
    }

    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM printers WHERE id = ?',
        [id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ success: true, message: 'Imprimanta a fost ștearsă' });
  } catch (error) {
    console.error('❌ Error in deletePrinter:', error);
    res.status(500).json({ error: error.message || 'Eroare la ștergerea imprimantei' });
  }
}

/**
 * POST /api/settings/printers/:id/test
 * Trimite un test print către imprimantă
 */
async function testPrint(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    // Verifică dacă imprimanta există
    const printer = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM printers WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!printer) {
      return res.status(404).json({ error: 'Imprimanta nu există' });
    }

    // Actualizează test_print_count și last_test_print
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE printers SET
          test_print_count = test_print_count + 1,
          last_test_print = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // TODO: Aici ar trebui să se trimită efectiv comanda de print către imprimantă
    // Pentru moment, doar logăm și returnăm success
    console.log(`🖨️ Test print trimis către imprimanta ${printer.name} (${printer.ip_address}:${printer.port})`);

    res.json({
      success: true,
      message: 'Test print trimis',
      printer: {
        ...printer,
        test_print_count: (printer.test_print_count || 0) + 1,
        last_test_print: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error in testPrint:', error);
    res.status(500).json({ error: error.message || 'Eroare la trimiterea test print' });
  }
}

module.exports = {
  getPrinters,
  getPrinterById,
  createPrinter,
  updatePrinter,
  deletePrinter,
  testPrint,
};

