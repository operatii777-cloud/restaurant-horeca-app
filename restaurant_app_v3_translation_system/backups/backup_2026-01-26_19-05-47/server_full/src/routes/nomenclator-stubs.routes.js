/**
 * NOMENCLATOR STUB ROUTES
 * Endpoint-uri pentru Attribute Groups, Portion Control, Variance Reporting
 * Returnează date goale sau mock pentru a preveni erori 404
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../database');

// ═══════════════════════════════════════════════════════════════════════════
// ATTRIBUTE GROUPS
// ═══════════════════════════════════════════════════════════════════════════

// Create table if not exists
const initAttributeTables = async () => {
  const db = await dbPromise;
  
  return new Promise((resolve) => {
    // Tabel grupuri atribute - model boogiT
    db.run(`
      CREATE TABLE IF NOT EXISTS attribute_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        titlu TEXT NOT NULL,
        minim INTEGER NOT NULL DEFAULT 0,
        maxim INTEGER NOT NULL DEFAULT 1,
        type TEXT NOT NULL DEFAULT 'select',
        description TEXT,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, () => {
      // Tabel atribute - produse din catalog (model boogiT)
      db.run(`
        CREATE TABLE IF NOT EXISTS attributes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          group_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          product_name TEXT NOT NULL,
          disponibilitate INTEGER DEFAULT 1,
          pret1 REAL DEFAULT 0,
          pret2 REAL DEFAULT 0,
          pret3 REAL DEFAULT 0,
          pret4 REAL DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          sort_order INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (group_id) REFERENCES attribute_groups(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES menu(id) ON DELETE CASCADE,
          UNIQUE(group_id, product_id)
        )
      `, () => {
        // Tabel asociere produse - grupuri atribute
        db.run(`
          CREATE TABLE IF NOT EXISTS product_attribute_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            group_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES menu(id) ON DELETE CASCADE,
            FOREIGN KEY (group_id) REFERENCES attribute_groups(id) ON DELETE CASCADE,
            UNIQUE(product_id, group_id)
          )
        `, () => {
          // Indexuri pentru performanță
          db.run(`CREATE INDEX IF NOT EXISTS idx_attributes_group ON attributes(group_id)`, () => {
            db.run(`CREATE INDEX IF NOT EXISTS idx_attributes_product ON attributes(product_id)`, () => {
              db.run(`CREATE INDEX IF NOT EXISTS idx_product_groups_product ON product_attribute_groups(product_id)`, () => {
                db.run(`CREATE INDEX IF NOT EXISTS idx_product_groups_group ON product_attribute_groups(group_id)`, resolve);
              });
            });
          });
        });
      });
    });
  });
};

// Initialize on first import
initAttributeTables().catch(console.error);

// GET all attribute groups
router.get('/attribute-groups', async (req, res) => {
  try {
    const db = await dbPromise;
    const groups = await new Promise((resolve, reject) => {
      db.all(`
        SELECT ag.*, 
          (SELECT COUNT(*) FROM attributes WHERE group_id = ag.id) as attributes_count
        FROM attribute_groups ag
        ORDER BY ag.sort_order, ag.name
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    res.json({ success: true, data: groups });
  } catch (error) {
    console.error('❌ [attribute-groups]:', error);
    res.json({ success: true, data: [] });
  }
});

// GET - Caută produse pentru atribute
router.get('/attribute-groups/search/products', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.json({ success: true, data: [] });
    }
    
    const db = await dbPromise;
    const products = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, name, name_en, price, category, description
        FROM menu 
        WHERE (name LIKE ? OR name_en LIKE ?)
        AND is_sellable = 1
        ORDER BY name
        LIMIT 20
      `, [`%${query}%`, `%${query}%`], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('❌ [search/products]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single attribute group with attributes
router.get('/attribute-groups/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    const group = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM attribute_groups WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!group) {
      return res.status(404).json({ success: false, error: 'Grup negăsit' });
    }
    
    const attributes = await new Promise((resolve, reject) => {
      db.all(`
        SELECT a.*, m.name as product_name_full, m.price as product_base_price
        FROM attributes a
        LEFT JOIN menu m ON a.product_id = m.id
        WHERE a.group_id = ?
        ORDER BY a.sort_order, a.product_name
      `, [req.params.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, data: { ...group, attributes } });
  } catch (error) {
    console.error('❌ [attribute-groups/:id]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create attribute group
router.post('/attribute-groups', async (req, res) => {
  try {
    const db = await dbPromise;
    const { name, titlu, minim, maxim, type, description, is_active, sort_order } = req.body;
    
    if (!name || !titlu) {
      return res.status(400).json({ success: false, error: 'Nume și titlu sunt obligatorii' });
    }
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO attribute_groups (name, titlu, minim, maxim, type, description, is_active, sort_order) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, 
          titlu, 
          minim ?? 0, 
          maxim ?? 1, 
          type || 'select', 
          description, 
          is_active ?? 1, 
          sort_order ?? 0
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, name, titlu, minim, maxim });
        }
      );
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ [POST attribute-groups]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update attribute group
router.put('/attribute-groups/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    const { name, titlu, minim, maxim, type, description, is_active, sort_order } = req.body;
    
    if (!name || !titlu) {
      return res.status(400).json({ success: false, error: 'Nume și titlu sunt obligatorii' });
    }
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE attribute_groups 
         SET name = ?, titlu = ?, minim = ?, maxim = ?, type = ?, description = ?, is_active = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [name, titlu, minim ?? 0, maxim ?? 1, type, description, is_active, sort_order, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [PUT attribute-groups]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE attribute group
router.delete('/attribute-groups/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM attribute_groups WHERE id = ?', [req.params.id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [DELETE attribute-groups]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - Adaugă atribut (produs) în grup
router.post('/attribute-groups/:id/atribute', async (req, res) => {
  try {
    const db = await dbPromise;
    const { productId, disponibilitate, pret1, pret2, pret3, pret4 } = req.body;
    const groupId = req.params.id;
    
    if (!productId) {
      return res.status(400).json({ success: false, error: 'ID produs este obligatoriu' });
    }
    
    // Verifică dacă produsul există
    const product = await new Promise((resolve, reject) => {
      db.get('SELECT id, name FROM menu WHERE id = ?', [productId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produs negăsit' });
    }
    
    // Verifică dacă atributul există deja în grup
    const existing = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM attributes WHERE group_id = ? AND product_id = ?', [groupId, productId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (existing) {
      return res.status(400).json({ success: false, error: 'Produsul este deja în acest grup' });
    }
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO attributes (group_id, product_id, product_name, name, disponibilitate, pret1, pret2, pret3, pret4, is_active, sort_order) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
        [
          groupId, 
          productId, 
          product.name,
          product.name, // name pentru compatibilitate cu schema veche
          disponibilitate ? 1 : 0, 
          pret1 || 0, 
          pret2 || 0, 
          pret3 || 0, 
          pret4 || 0
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, productId, productName: product.name });
        }
      );
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ [POST attribute-groups/:id/atribute]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE - Șterge atribut din grup
router.delete('/attribute-groups/:groupId/atribute/:atributId', async (req, res) => {
  try {
    const db = await dbPromise;
    const { groupId, atributId } = req.params;
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM attributes WHERE id = ? AND group_id = ?', [atributId, groupId], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [DELETE attribute-groups/:groupId/atribute/:atributId]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Legacy endpoint pentru compatibilitate
router.post('/attributes', async (req, res) => {
  try {
    const db = await dbPromise;
    const { group_id, productId, disponibilitate, pret1, pret2, pret3, pret4 } = req.body;
    
    if (!group_id || !productId) {
      return res.status(400).json({ success: false, error: 'group_id și productId sunt obligatorii' });
    }
    
    const product = await new Promise((resolve, reject) => {
      db.get('SELECT id, name FROM menu WHERE id = ?', [productId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produs negăsit' });
    }
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO attributes (group_id, product_id, product_name, name, disponibilitate, pret1, pret2, pret3, pret4, is_active, sort_order) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
        [group_id, productId, product.name, product.name, disponibilitate ? 1 : 0, pret1 || 0, pret2 || 0, pret3 || 0, pret4 || 0],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ [POST attributes]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/attributes/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    const { disponibilitate, pret1, pret2, pret3, pret4, is_active, sort_order } = req.body;
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE attributes 
         SET disponibilitate = ?, pret1 = ?, pret2 = ?, pret3 = ?, pret4 = ?, is_active = ?, sort_order = ? 
         WHERE id = ?`,
        [disponibilitate ? 1 : 0, pret1 || 0, pret2 || 0, pret3 || 0, pret4 || 0, is_active, sort_order, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [PUT attributes]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/attributes/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM attributes WHERE id = ?', [req.params.id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [DELETE attributes]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PRODUSE - Asociere grupuri atribute
// ═══════════════════════════════════════════════════════════════════════════

// POST - Adaugă grup la produs
router.post('/products/:productId/grupuri-atribute', async (req, res) => {
  try {
    const db = await dbPromise;
    const { productId } = req.params;
    const { grupId } = req.body;
    
    if (!grupId) {
      return res.status(400).json({ success: false, error: 'grupId este obligatoriu' });
    }
    
    // Verifică dacă produsul există
    const product = await new Promise((resolve, reject) => {
      db.get('SELECT id, name FROM menu WHERE id = ?', [productId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produs negăsit' });
    }
    
    // Verifică dacă grupul există
    const group = await new Promise((resolve, reject) => {
      db.get('SELECT id, name FROM attribute_groups WHERE id = ?', [grupId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!group) {
      return res.status(404).json({ success: false, error: 'Grup negăsit' });
    }
    
    // Adaugă asocierea
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO product_attribute_groups (product_id, group_id) VALUES (?, ?)',
        [productId, grupId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
    
    // Returnează toate grupurile asociate produsului
    const grupuri = await new Promise((resolve, reject) => {
      db.all(`
        SELECT ag.* 
        FROM attribute_groups ag
        INNER JOIN product_attribute_groups pag ON ag.id = pag.group_id
        WHERE pag.product_id = ?
        ORDER BY ag.sort_order, ag.name
      `, [productId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, data: grupuri });
  } catch (error) {
    console.error('❌ [POST products/:productId/grupuri-atribute]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Obține grupuri pentru un produs
router.get('/products/:productId/grupuri-atribute', async (req, res) => {
  try {
    const db = await dbPromise;
    const { productId } = req.params;
    
    const grupuri = await new Promise((resolve, reject) => {
      db.all(`
        SELECT ag.* 
        FROM attribute_groups ag
        INNER JOIN product_attribute_groups pag ON ag.id = pag.group_id
        WHERE pag.product_id = ?
        ORDER BY ag.sort_order, ag.name
      `, [productId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, data: grupuri });
  } catch (error) {
    console.error('❌ [GET products/:productId/grupuri-atribute]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE - Șterge grup de la produs
router.delete('/products/:productId/grupuri-atribute/:grupId', async (req, res) => {
  try {
    const db = await dbPromise;
    const { productId, grupId } = req.params;
    
    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM product_attribute_groups WHERE product_id = ? AND group_id = ?',
        [productId, grupId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [DELETE products/:productId/grupuri-atribute/:grupId]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PORTION CONTROL - Stub endpoints
// ═══════════════════════════════════════════════════════════════════════════

router.get('/portion-control/stats', (req, res) => {
  res.json({
    success: true,
    compliant_count: 0,
    warning_count: 0,
    critical_count: 0,
    total_count: 0,
    message: 'Portion Control este disponibil în Admin Advanced → Portion Control'
  });
});

router.get('/portion-control/standards', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Funcționalitate disponibilă în Admin Advanced'
  });
});

router.get('/portion-control/reports', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Funcționalitate disponibilă în Admin Advanced'
  });
});

router.get('/portion-control/top-deviations', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Funcționalitate disponibilă în Admin Advanced'
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// VARIANCE REPORTING - Stub endpoints
// ═══════════════════════════════════════════════════════════════════════════

router.get('/variance/stats', (req, res) => {
  res.json({
    success: true,
    total_reports: 0,
    total_ingredients: 0,
    critical_count: 0,
    total_value: 0,
    message: 'Variance Reporting este disponibil în Admin Advanced → Variance Reporting'
  });
});

router.get('/variance/reports', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Funcționalitate disponibilă în Admin Advanced'
  });
});

router.post('/variance/generate', (req, res) => {
  res.json({
    success: false,
    error: 'Funcționalitate disponibilă în Admin Advanced → Variance Reporting',
    redirect: '/admin-advanced.html#variance-reporting'
  });
});

module.exports = router;

