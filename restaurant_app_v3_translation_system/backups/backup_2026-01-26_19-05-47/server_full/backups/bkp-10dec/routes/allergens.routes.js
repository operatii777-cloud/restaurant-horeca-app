/**
 * 🌾 ALLERGENS API ROUTES
 * 
 * Endpoints pentru gestionarea alergenilor (14 alergeni standard UE)
 * Conform Regulamentului (UE) Nr. 1169/2011
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');

// ========================================
// GET /api/allergens - Lista tuturor alergenilor
// ========================================
router.get('/', async (req, res) => {
  try {
    const db = await dbPromise;
    
    // Verifică dacă tabela allergens există
    const tableExists = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='allergens'"
    );
    
    if (!tableExists) {
      console.log('⚠️ Tabela allergens nu există, o creez...');
      
      // Creează tabela allergens
      await db.run(`
        CREATE TABLE IF NOT EXISTS allergens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          icon TEXT DEFAULT '🏷️',
          name_ro TEXT NOT NULL,
          name_en TEXT,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabela allergens creată cu succes');
    }
    
    // Fetch allergens cu număr de ingrediente asociate
    const allergens = await db.all(`
      SELECT 
        a.*,
        (
          SELECT COUNT(DISTINCT ia.ingredient_id)
          FROM ingredient_allergens ia
          WHERE ia.allergen_id = a.id
        ) as ingredients_count
      FROM allergens a
      ORDER BY a.id ASC
    `);
    
    console.log(`✅ Returnat ${allergens.length} alergeni`);
    res.json(allergens);
    
  } catch (error) {
    console.error('❌ Eroare la încărcarea alergenilor:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ========================================
// GET /api/allergens/:id - Detalii alergen
// ========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const allergen = await db.get(`
      SELECT 
        a.*,
        (
          SELECT COUNT(DISTINCT ia.ingredient_id)
          FROM ingredient_allergens ia
          WHERE ia.allergen_id = a.id
        ) as ingredients_count
      FROM allergens a
      WHERE a.id = ?
    `, [id]);
    
    if (!allergen) {
      return res.status(404).json({ 
        success: false, 
        message: 'Alergen nu a fost găsit' 
      });
    }
    
    res.json(allergen);
    
  } catch (error) {
    console.error('❌ Eroare la încărcarea alergenului:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ========================================
// POST /api/allergens - Creează alergen nou
// ========================================
router.post('/', async (req, res) => {
  try {
    const { icon, name_ro, name_en, is_active } = req.body;
    
    if (!name_ro) {
      return res.status(400).json({ 
        success: false, 
        message: 'Denumirea în română este obligatorie' 
      });
    }
    
    const db = await dbPromise;
    
    const result = await db.run(`
      INSERT INTO allergens (icon, name_ro, name_en, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [
      icon || '🏷️',
      name_ro,
      name_en || name_ro,
      is_active !== undefined ? is_active : 1
    ]);
    
    console.log(`✅ Alergen creat: ${name_ro} (ID: ${result.lastID})`);
    
    res.status(201).json({
      success: true,
      id: result.lastID,
      message: 'Alergen creat cu succes'
    });
    
  } catch (error) {
    console.error('❌ Eroare la crearea alergenului:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ========================================
// PUT /api/allergens/:id - Actualizează alergen
// ========================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const db = await dbPromise;
    
    // Construiește query dinamic
    const fields = [];
    const values = [];
    
    if (updates.icon !== undefined) {
      fields.push('icon = ?');
      values.push(updates.icon);
    }
    if (updates.name_ro !== undefined) {
      fields.push('name_ro = ?');
      values.push(updates.name_ro);
    }
    if (updates.name_en !== undefined) {
      fields.push('name_en = ?');
      values.push(updates.name_en);
    }
    if (updates.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(updates.is_active);
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Niciun câmp de actualizat' 
      });
    }
    
    fields.push('updated_at = datetime("now")');
    values.push(id);
    
    await db.run(`
      UPDATE allergens
      SET ${fields.join(', ')}
      WHERE id = ?
    `, values);
    
    console.log(`✅ Alergen ${id} actualizat`);
    
    res.json({
      success: true,
      message: 'Alergen actualizat cu succes'
    });
    
  } catch (error) {
    console.error('❌ Eroare la actualizarea alergenului:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ========================================
// DELETE /api/allergens/:id - Șterge alergen
// ========================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    // Șterge mai întâi asocierile cu ingredientele
    await db.run('DELETE FROM ingredient_allergens WHERE allergen_id = ?', [id]);
    
    // Șterge alergenul
    const result = await db.run('DELETE FROM allergens WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Alergen nu a fost găsit' 
      });
    }
    
    console.log(`✅ Alergen ${id} șters`);
    
    res.json({
      success: true,
      message: 'Alergen șters cu succes'
    });
    
  } catch (error) {
    console.error('❌ Eroare la ștergerea alergenului:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;

