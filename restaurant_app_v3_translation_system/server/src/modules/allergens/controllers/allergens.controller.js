/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/allergens.routes.js
 */

const { dbPromise } = require('../../../../database');

// GET /api/allergens
async function getAllergens(req, res, next) {
  try {
    const db = await dbPromise;
    const activeOnly = req.query.active_only === 'true';
    
    const tableExists = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='allergens'"
    );
    
    if (!tableExists) {
      console.log('⚠️ Tabela allergens nu există, o creez...');
      
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
    
    let query = `
      SELECT 
        a.*,
        (
          SELECT COUNT(DISTINCT ia.ingredient_id)
          FROM ingredient_allergens ia
          WHERE ia.allergen_id = a.id
        ) as ingredients_count
      FROM allergens a
    `;
    
    if (activeOnly) {
      query += ' WHERE a.is_active = 1';
    }
    
    query += ' ORDER BY a.id ASC';
    
    const allergens = await db.all(query);
    
    console.log(`✅ Returnat ${allergens.length} alergeni${activeOnly ? ' (doar active)' : ''}`);
    
    // Return format compatible with client interface
    res.json({
      success: true,
      data: allergens
    });
  } catch (error) {
    console.error('❌ Error in getAllergens:', error);
    next(error);
  }
}

// GET /api/allergens/:id
async function getAllergenById(req, res, next) {
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
    next(error);
  }
}

// POST /api/allergens
async function createAllergen(req, res, next) {
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
    next(error);
  }
}

// PUT /api/allergens/:id
async function updateAllergen(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const db = await dbPromise;
    
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
    next(error);
  }
}

// DELETE /api/allergens/:id
async function deleteAllergen(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    await db.run('DELETE FROM ingredient_allergens WHERE allergen_id = ?', [id]);
    
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
    next(error);
  }
}

/**
 * GET /api/allergens/products
 * Obține toate produsele cu alergenii declarați și calculați
 */
async function getProductsWithAllergens(req, res, next) {
  try {
    const db = await dbPromise;
    
    // Verifică dacă tabelele există
    const menuExists = await new Promise((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='menu'", (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
    
    if (!menuExists) {
      return res.json({ products: [] });
    }
    
    // Obține toate produsele din meniu
    const products = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          m.id,
          m.name,
          m.category,
          m.allergens as current_allergens,
          m.allergens_en as current_allergens_en,
          COUNT(DISTINCT r.id) as ingredient_count
        FROM menu m
        LEFT JOIN recipes r ON m.id = r.product_id
        WHERE m.is_sellable = 1
        GROUP BY m.id, m.name, m.category, m.allergens, m.allergens_en
        ORDER BY m.name
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Calculează alergenii pentru fiecare produs
    const productsWithAllergens = await Promise.all(products.map(async (product) => {
      let calculatedAllergens = [];
      
      // Obține ingredientele din rețetă
      const ingredients = await new Promise((resolve, reject) => {
        db.all(`
          SELECT DISTINCT r.ingredient_id, i.allergens, i.potential_allergens
          FROM recipes r
          LEFT JOIN ingredients i ON r.ingredient_id = i.id
          WHERE r.product_id = ?
        `, [product.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      // Extrage alergenii unici din ingrediente
      const allergenSet = new Set();
      for (const ing of ingredients) {
        if (ing.allergens) {
          const allergens = ing.allergens.split(',').map(a => a.trim()).filter(a => a);
          allergens.forEach(a => allergenSet.add(a.toLowerCase()));
        }
        if (ing.potential_allergens) {
          const potential = ing.potential_allergens.split(',').map(a => a.trim()).filter(a => a);
          potential.forEach(a => allergenSet.add(a.toLowerCase()));
        }
      }
      
      calculatedAllergens = Array.from(allergenSet);
      
      // Compară alergenii declarați cu cei calculați
      const currentAllergensList = product.current_allergens 
        ? product.current_allergens.split(',').map(a => a.trim().toLowerCase()).filter(a => a)
        : [];
      
      const hasDifference = JSON.stringify(currentAllergensList.sort()) !== 
                           JSON.stringify(calculatedAllergens.sort());
      
      return {
        id: product.id,
        name: product.name,
        category: product.category || 'Fără categorie',
        ingredient_count: product.ingredient_count || 0,
        current_allergens: product.current_allergens || null,
        calculated_allergens: calculatedAllergens.length > 0 ? calculatedAllergens.join(', ') : null,
        has_difference: hasDifference
      };
    }));
    
    console.log(`✅ Returnat ${productsWithAllergens.length} produse cu alergeni`);
    res.json({ products: productsWithAllergens });
  } catch (error) {
    console.error('❌ Error in getProductsWithAllergens:', error);
    next(error);
  }
}

/**
 * POST /api/allergens/recalculate/:productId
 * Recalculează alergenii pentru un produs specific
 */
async function recalculateProductAllergens(req, res, next) {
  try {
    const { productId } = req.params;
    const db = await dbPromise;
    
    // Obține produsul
    const product = await new Promise((resolve, reject) => {
      db.get('SELECT id, name FROM menu WHERE id = ?', [productId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produs nu a fost găsit' 
      });
    }
    
    // Obține ingredientele din rețetă
    const ingredients = await new Promise((resolve, reject) => {
      db.all(`
        SELECT DISTINCT r.ingredient_id, i.allergens, i.potential_allergens
        FROM recipes r
        LEFT JOIN ingredients i ON r.ingredient_id = i.id
        WHERE r.product_id = ?
      `, [productId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Extrage alergenii unici
    const allergenSet = new Set();
    for (const ing of ingredients) {
      if (ing.allergens) {
        const allergens = ing.allergens.split(',').map(a => a.trim()).filter(a => a);
        allergens.forEach(a => allergenSet.add(a));
      }
      if (ing.potential_allergens) {
        const potential = ing.potential_allergens.split(',').map(a => a.trim()).filter(a => a);
        potential.forEach(a => allergenSet.add(a));
      }
    }
    
    const calculatedAllergens = Array.from(allergenSet).join(', ');
    
    // Actualizează alergenii în meniu
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE menu 
        SET allergens = ?, allergens_en = ?
        WHERE id = ?
      `, [calculatedAllergens, calculatedAllergens, productId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log(`✅ Alergeni recalculați pentru produs ${productId}: ${calculatedAllergens || 'niciunul'}`);
    
    res.json({
      success: true,
      message: 'Alergeni recalculați cu succes',
      calculated_allergens: calculatedAllergens || null
    });
  } catch (error) {
    console.error('❌ Error in recalculateProductAllergens:', error);
    next(error);
  }
}

/**
 * POST /api/allergens/recalculate-all
 * Recalculează alergenii pentru toate produsele
 */
async function recalculateAllProductsAllergens(req, res, next) {
  try {
    const db = await dbPromise;
    
    // Obține toate produsele
    const products = await new Promise((resolve, reject) => {
      db.all('SELECT id, name FROM menu WHERE is_sellable = 1', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    // Recalculează pentru fiecare produs
    for (const product of products) {
      try {
        // Obține ingredientele din rețetă
        const ingredients = await new Promise((resolve, reject) => {
          db.all(`
            SELECT DISTINCT r.ingredient_id, i.allergens, i.potential_allergens
            FROM recipes r
            LEFT JOIN ingredients i ON r.ingredient_id = i.id
            WHERE r.product_id = ?
          `, [product.id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });
        
        // Extrage alergenii unici
        const allergenSet = new Set();
        for (const ing of ingredients) {
          if (ing.allergens) {
            const allergens = ing.allergens.split(',').map(a => a.trim()).filter(a => a);
            allergens.forEach(a => allergenSet.add(a));
          }
          if (ing.potential_allergens) {
            const potential = ing.potential_allergens.split(',').map(a => a.trim()).filter(a => a);
            potential.forEach(a => allergenSet.add(a));
          }
        }
        
        const calculatedAllergens = Array.from(allergenSet).join(', ');
        
        // Actualizează alergenii în meniu
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE menu 
            SET allergens = ?, allergens_en = ?
            WHERE id = ?
          `, [calculatedAllergens, calculatedAllergens, product.id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        
        successCount++;
      } catch (error) {
        console.error(`❌ Eroare la recalculare produs ${product.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`✅ Recalculare completă: ${successCount} succes, ${errorCount} erori din ${products.length} produse`);
    
    res.json({
      success: true,
      message: `Recalculare completă: ${successCount} produse actualizate`,
      success_count: successCount,
      error_count: errorCount,
      total_products: products.length
    });
  } catch (error) {
    console.error('❌ Error in recalculateAllProductsAllergens:', error);
    next(error);
  }
}

module.exports = {
    getAllergens,
    getAllergenById,
    createAllergen,
    updateAllergen,
    deleteAllergen,
    getProductsWithAllergens,
    recalculateProductAllergens,
    recalculateAllProductsAllergens,
};

