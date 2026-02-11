/**
 * CREARE NIR PENTRU 100 COMENZI
 * Completează stocurile pentru ingredientele din rețetele produselor existente
 * care au stoc zero sau foarte mic
 * 
 * NIR complet conform normelor legale:
 * - Coduri contabile (301, 401, 371)
 * - Coduri de produs
 * - Furnizor
 * - Prețuri cu TVA
 * - Stock moves
 */

const { dbPromise } = require('../../database');

// Configurare
const ORDERS_COUNT = 100; // Număr de comenzi pentru care calculăm stocul
const MIN_STOCK_THRESHOLD = 0.1; // Stoc minim pentru a considera că trebuie completat (0.1 unități)

// Date companie (configurabile)
const COMPANY_DATA = {
  name: 'RESTAURANT SRL',
  cif: 'RO12345678',
  address: 'Str. Exemplu, Nr. 1, București',
  cont_301: '301', // Mărfuri
  cont_401: '401', // Furnizori
  cont_371: '371', // Mărfuri în gestiune
  tva_percent: 21, // TVA 21% (modificat din august 2025, înainte era 19%)
  tva_reduced_percent: 11 // TVA redusă 11% (modificat din august 2025, înainte era 9%)
};

/**
 * Obține următorul număr de document
 */
async function getNextNIRNumber(db) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT MAX(CAST(numar AS INTEGER)) as max_num
      FROM avize_insotire
      WHERE serie = 'NIR'
    `, [], (err, row) => {
      if (err) {
        // Dacă tabelul nu există, începe de la 1
        resolve(1);
      } else {
        const nextNum = (row?.max_num || 0) + 1;
        resolve(nextNum);
      }
    });
  });
}

/**
 * Obține produsele existente în meniu (care sunt active și vandabile)
 */
async function getActiveProducts(db) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT id, name, category
      FROM menu
      WHERE is_sellable = 1 
        AND (is_active = 1 OR is_active IS NULL)
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Obține rețetele pentru produsele active
 */
async function getRecipesForProducts(db, productIds) {
  if (!productIds || productIds.length === 0) {
    return [];
  }
  
  const placeholders = productIds.map(() => '?').join(',');
  return new Promise((resolve, reject) => {
      db.all(`
      SELECT 
        r.id,
        r.product_id,
        r.ingredient_id,
        r.quantity_needed,
        r.unit,
        r.waste_percentage,
        i.name as ingredient_name,
        i.current_stock,
        i.unit as ingredient_unit,
        COALESCE(i.cost_per_unit, 0) as average_cost,
        i.default_supplier_id as supplier_id
      FROM recipes r
      INNER JOIN ingredients i ON i.id = r.ingredient_id
      WHERE r.product_id IN (${placeholders})
        AND r.ingredient_id IS NOT NULL
        AND r.item_type = 'ingredient'
    `, productIds, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Calculează cantitățile necesare pentru 100 de comenzi
 */
function calculateRequiredQuantities(recipes, ordersCount) {
  const ingredientQuantities = {};
  
  recipes.forEach(recipe => {
    const ingredientId = recipe.ingredient_id;
    if (!ingredientId) return;
    
    if (!ingredientQuantities[ingredientId]) {
      ingredientQuantities[ingredientId] = {
        ingredient_id: ingredientId,
        ingredient_name: recipe.ingredient_name,
        unit: recipe.ingredient_unit || recipe.unit || 'buc',
        current_stock: recipe.current_stock || 0,
        quantity_per_order: 0,
        waste_percentage: recipe.waste_percentage || 0,
        average_cost: recipe.average_cost || 0,
        supplier_id: recipe.supplier_id
      };
    }
    
    // Adaugă cantitatea pentru acest produs
    const quantity = parseFloat(recipe.quantity_needed) || 0;
    const waste = parseFloat(recipe.waste_percentage) || 0;
    const quantityWithWaste = quantity * (1 + waste / 100);
    
    ingredientQuantities[ingredientId].quantity_per_order += quantityWithWaste;
  });
  
  // Calculează cantitatea totală pentru 100 de comenzi
  Object.keys(ingredientQuantities).forEach(ingredientId => {
    const ing = ingredientQuantities[ingredientId];
    const totalNeeded = ing.quantity_per_order * ordersCount;
    const currentStock = parseFloat(ing.current_stock) || 0;
    
    // Cantitatea de comandat = ce trebuie - ce avem + 20% buffer
    const toOrder = Math.max(0, totalNeeded - currentStock);
    const withBuffer = toOrder * 1.2; // 20% buffer pentru siguranță
    
    ing.total_needed = totalNeeded;
    ing.to_order = Math.ceil(withBuffer * 100) / 100; // Rotunjire la 2 zecimale
    ing.has_low_stock = currentStock < MIN_STOCK_THRESHOLD;
  });
  
  return Object.values(ingredientQuantities).filter(ing => ing.to_order > 0);
}

/**
 * Obține furnizorul pentru ingredient (sau furnizorul default)
 */
async function getSupplierForIngredient(db, ingredientId, supplierId) {
  // Furnizor default
  const defaultSupplier = {
    id: null,
    name: 'FURNIZOR DEFAULT SRL',
    registration_number: 'RO99999999',
    vat_code: 'RO99999999',
    address: 'Adresă furnizor default',
    phone: '0712345678',
    email: 'furnizor@example.com'
  };
  
  // Verifică dacă tabelul suppliers există
  const suppliersExists = await new Promise((resolve) => {
    db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='suppliers'
    `, [], (err, row) => {
      resolve(!err && row);
    });
  });
  
  if (!suppliersExists) {
    return defaultSupplier;
  }
  
  if (supplierId) {
    return new Promise((resolve) => {
      db.get(`
        SELECT 
          id, 
          name,
          registration_number,
          vat_code,
          address,
          phone,
          email
        FROM suppliers
        WHERE id = ? AND (is_active = 1 OR is_active IS NULL)
      `, [supplierId], (err, row) => {
        if (err || !row) {
          resolve(defaultSupplier);
        } else {
          resolve({
            id: row.id,
            name: row.name || 'Furnizor Default',
            registration_number: row.registration_number || 'RO99999999',
            vat_code: row.vat_code || row.registration_number || 'RO99999999',
            address: row.address || 'Adresă furnizor',
            phone: row.phone || '0712345678',
            email: row.email || 'furnizor@example.com'
          });
        }
      });
    });
  }
  
  // Caută furnizorul principal pentru ingredient
  return new Promise((resolve) => {
    // Verifică dacă tabelul ingredient_suppliers există
    db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='ingredient_suppliers'
    `, [], (err, tableExists) => {
      if (err || !tableExists) {
        resolve(defaultSupplier);
        return;
      }
      
      db.get(`
        SELECT 
          s.id, 
          s.name,
          s.registration_number,
          s.vat_code,
          s.address,
          s.phone,
          s.email
        FROM ingredient_suppliers isup
        INNER JOIN suppliers s ON s.id = isup.supplier_id
        WHERE isup.ingredient_id = ? 
          AND isup.is_primary = 1
          AND (s.is_active = 1 OR s.is_active IS NULL)
        LIMIT 1
      `, [ingredientId], (err, row) => {
        if (err || !row) {
          resolve(defaultSupplier);
        } else {
          resolve({
            id: row.id,
            name: row.name || 'Furnizor Default',
            registration_number: row.registration_number || 'RO99999999',
            vat_code: row.vat_code || row.registration_number || 'RO99999999',
            address: row.address || 'Adresă furnizor',
            phone: row.phone || '0712345678',
            email: row.email || 'furnizor@example.com'
          });
        }
      });
    });
  });
}

/**
 * Creează NIR-ul complet
 */
async function createNIR() {
  try {
    const db = await dbPromise;
    
    console.log('📦 CREARE NIR PENTRU 100 COMENZI\n');
    console.log('='.repeat(60));
    
    // 1. Obține produsele active
    console.log('\n1️⃣ Obțin produsele active din meniu...');
    const products = await getActiveProducts(db);
    console.log(`   ✅ Găsite ${products.length} produse active`);
    
    if (products.length === 0) {
      console.log('   ⚠️  Nu există produse active în meniu!');
      return;
    }
    
    const productIds = products.map(p => p.id);
    
    // 2. Obține rețetele pentru produsele active
    console.log('\n2️⃣ Obțin rețetele pentru produsele active...');
    const recipes = await getRecipesForProducts(db, productIds);
    console.log(`   ✅ Găsite ${recipes.length} linii de rețetă`);
    
    if (recipes.length === 0) {
      console.log('   ⚠️  Nu există rețete pentru produsele active!');
      return;
    }
    
    // 3. Calculează cantitățile necesare
    console.log('\n3️⃣ Calculez cantitățile necesare pentru 100 de comenzi...');
    const requiredIngredients = calculateRequiredQuantities(recipes, ORDERS_COUNT);
    console.log(`   ✅ Identificate ${requiredIngredients.length} ingrediente cu stoc insuficient`);
    
    if (requiredIngredients.length === 0) {
      console.log('   ✅ Toate ingredientele au stoc suficient!');
      return;
    }
    
    // 4. Obține furnizorii pentru fiecare ingredient
    console.log('\n4️⃣ Obțin furnizorii pentru ingrediente...');
    const nirItems = [];
    let totalValue = 0;
    let totalValueWithVAT = 0;
    
    for (const ing of requiredIngredients) {
      const supplier = await getSupplierForIngredient(db, ing.ingredient_id, ing.supplier_id);
      
      const unitPrice = parseFloat(ing.average_cost) || 10; // Preț default dacă nu există
      const quantity = ing.to_order;
      const value = quantity * unitPrice;
      const vatAmount = value * (COMPANY_DATA.tva_percent / 100);
      const valueWithVAT = value + vatAmount;
      
      totalValue += value;
      totalValueWithVAT += valueWithVAT;
      
      nirItems.push({
        ingredient_id: ing.ingredient_id,
        ingredient_name: ing.ingredient_name,
        quantity: quantity,
        unit: ing.unit,
        unit_price: unitPrice,
        value: value,
        vat_percent: COMPANY_DATA.tva_percent,
        vat_amount: vatAmount,
        value_with_vat: valueWithVAT,
        supplier: supplier,
        current_stock: ing.current_stock,
        total_needed: ing.total_needed
      });
    }
    
    console.log(`   ✅ Pregătite ${nirItems.length} linii NIR`);
    console.log(`   💰 Valoare totală: ${totalValue.toFixed(2)} RON`);
    console.log(`   💰 Valoare cu TVA: ${totalValueWithVAT.toFixed(2)} RON`);
    
    // 5. Obține următorul număr NIR
    const nirNumber = await getNextNIRNumber(db);
    const nirSerie = 'NIR';
    const nirDate = new Date().toISOString().split('T')[0];
    
    // 6. Obține furnizorul principal (primul din listă sau default)
    const mainSupplier = nirItems[0]?.supplier || {
      name: 'FURNIZOR DEFAULT SRL',
      registration_number: 'RO99999999',
      vat_code: 'RO99999999',
      address: 'Adresă furnizor default'
    };
    
    // 7. Creează NIR-ul în baza de date
    console.log('\n5️⃣ Creează NIR-ul în baza de date...');
    
    // Verifică dacă tabelul avize_insotire există
    const avizId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO avize_insotire (
          company_id, serie, numar, data_emitere,
          expeditor_denumire, expeditor_cif, expeditor_adresa,
          destinatar_denumire, destinatar_cif, destinatar_adresa,
          delegat_nume, delegat_ci, mijloc_transport, ora_plecare,
          tip_operatiune, observatii, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'emis', ?)
      `, [
        1, // company_id
        nirSerie,
        nirNumber.toString(),
        nirDate,
        mainSupplier.name,
        mainSupplier.vat_code || mainSupplier.registration_number,
        mainSupplier.address || '',
        COMPANY_DATA.name,
        COMPANY_DATA.cif,
        COMPANY_DATA.address,
        'Delegat Transport', // delegat_nume
        'CI123456', // delegat_ci
        'Autoturism', // mijloc_transport
        new Date().toTimeString().substring(0, 5), // ora_plecare
        'fara_factura', // tip_operatiune
        `NIR pentru completare stocuri pentru ${ORDERS_COUNT} comenzi. Ingrediente din rețetele produselor active.`,
        1 // created_by
      ], function(err) {
        if (err) {
          // Dacă tabelul nu există, creează stock_moves direct
          if (err.message.includes('no such table')) {
            console.log('   ⚠️  Tabelul avize_insotire nu există - creez doar stock_moves');
            resolve(null);
          } else {
            reject(err);
          }
        } else {
          resolve(this.lastID);
        }
      });
    });
    
    // 8. Creează stock_moves pentru fiecare ingredient
    console.log('\n6️⃣ Creează stock_moves pentru ingrediente...');
    let stockMovesCreated = 0;
    
    for (const item of nirItems) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO stock_moves (
            tenant_id, date, type, reference_type, reference_id,
            ingredient_id, quantity_in, unit_price, value_in,
            tva_percent, move_reason, move_source
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          1, // tenant_id
          new Date().toISOString(),
          'NIR',
          'NIR',
          avizId || nirNumber,
          item.ingredient_id,
          item.quantity,
          item.unit_price,
          item.value,
          COMPANY_DATA.tva_percent,
          'STOCK_REPLENISHMENT',
          'NIR_AUTO'
        ], (err) => {
          if (err) {
            console.error(`   ❌ Eroare la crearea stock_move pentru ${item.ingredient_name}:`, err.message);
            reject(err);
          } else {
            stockMovesCreated++;
            resolve();
          }
        });
      });
      
      // Actualizează stocul ingredientului
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE ingredients
          SET current_stock = current_stock + ?,
              last_updated = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [item.quantity, item.ingredient_id], (err) => {
          if (err) {
            console.error(`   ⚠️  Eroare la actualizarea stocului pentru ${item.ingredient_name}:`, err.message);
          }
          resolve();
        });
      });
    }
    
    console.log(`   ✅ Create ${stockMovesCreated} stock_moves`);
    
    // 9. Creează notă contabilă (301 → 371)
    console.log('\n7️⃣ Creează notă contabilă (301 → 371)...');
    
    try {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO note_contabile (
            company_id, data, tip, document_type, document_id, document_serie, document_numar,
            cont_debitor, cont_creditor, suma, descriere, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          1, // company_id
          nirDate,
          '371_601', // Tip: 371 → 601 (Materii prime)
          'NIR',
          avizId || nirNumber,
          nirSerie,
          nirNumber.toString(),
          COMPANY_DATA.cont_371, // Cont debitor: 371 (Mărfuri în gestiune)
          COMPANY_DATA.cont_301, // Cont creditor: 301 (Mărfuri)
          totalValue, // Suma fără TVA
          `NIR ${nirSerie} ${nirNumber} - Completare stocuri pentru ${ORDERS_COUNT} comenzi`,
          1 // created_by
        ], (err) => {
          if (err) {
            if (err.message.includes('no such table')) {
              console.log('   ⚠️  Tabelul note_contabile nu există - se omite nota contabilă');
              resolve();
            } else {
              console.error('   ⚠️  Eroare la crearea notei contabile:', err.message);
              resolve(); // Nu oprește procesul
            }
          } else {
            console.log('   ✅ Notă contabilă creată');
            resolve();
          }
        });
      });
    } catch (error) {
      console.log('   ⚠️  Eroare la crearea notei contabile:', error.message);
    }
    
    // 10. Rezumat final
    console.log('\n' + '='.repeat(60));
    console.log('✅ NIR CREAT CU SUCCES!\n');
    console.log(`📄 NIR ${nirSerie} ${nirNumber}`);
    console.log(`📅 Data: ${nirDate}`);
    console.log(`🏢 Furnizor: ${mainSupplier.name}`);
    console.log(`📦 Linii: ${nirItems.length}`);
    console.log(`💰 Valoare fără TVA: ${totalValue.toFixed(2)} RON`);
    console.log(`💰 Valoare cu TVA (${COMPANY_DATA.tva_percent}%): ${totalValueWithVAT.toFixed(2)} RON`);
    console.log(`📊 Stock moves create: ${stockMovesCreated}`);
    console.log('\n📋 DETALII LINII NIR:');
    console.log('-'.repeat(60));
    
    nirItems.forEach((item, idx) => {
      console.log(`\n${idx + 1}. ${item.ingredient_name}`);
      console.log(`   Cantitate: ${item.quantity} ${item.unit}`);
      console.log(`   Preț unitar: ${item.unit_price.toFixed(2)} RON`);
      console.log(`   Valoare: ${item.value.toFixed(2)} RON`);
      console.log(`   TVA (${item.vat_percent}%): ${item.vat_amount.toFixed(2)} RON`);
      console.log(`   Valoare cu TVA: ${item.value_with_vat.toFixed(2)} RON`);
      console.log(`   Stoc anterior: ${item.current_stock} ${item.unit}`);
      console.log(`   Stoc nou: ${(parseFloat(item.current_stock) + item.quantity).toFixed(2)} ${item.unit}`);
      console.log(`   Furnizor: ${item.supplier.name}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ NIR completat cu succes!');
    
  } catch (error) {
    console.error('\n❌ EROARE:', error);
    throw error;
  }
}

// Rulează crearea NIR-ului
createNIR()
  .then(() => {
    console.log('\n✅ Proces finalizat!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Eroare fatală:', error);
    process.exit(1);
  });
