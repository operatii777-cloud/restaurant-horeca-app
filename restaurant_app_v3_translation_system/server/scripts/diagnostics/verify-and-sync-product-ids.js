/**
 * Script de verificare și sincronizare ID-uri produse
 * 
 * Verifică ID-urile produselor din restaurant_app_v3 (menu + catalog_products)
 * și compară cu cele trimise către restorapp prin /api/kiosk/menu
 * 
 * Usage: node verify-and-sync-product-ids.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Calea către baza de date
const dbPath = path.join(__dirname, 'database.db');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Baza de date nu există la:', dbPath);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Eroare la deschiderea bazei de date:', err.message);
    process.exit(1);
  }
  console.log('✅ Baza de date deschisă:', dbPath);
});

/**
 * Verifică produsele din menu
 */
async function getMenuProducts() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        id,
        name,
        category,
        price,
        is_active,
        is_sellable
      FROM menu
      WHERE is_sellable = 1 AND (is_active = 1 OR is_active IS NULL)
      ORDER BY id ASC
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Verifică produsele din catalog_products (folosite în Daily Menu)
 */
async function getCatalogProducts() {
  const today = new Date().toISOString().split('T')[0];
  return new Promise((resolve, reject) => {
    // Verifică dacă tabela catalog_products există
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='catalog_products'", [], (err, table) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!table) {
        // Tabela nu există, returnează array gol
        console.log('   ⚠️  Tabela catalog_products nu există - se folosesc doar produsele din menu');
        resolve([]);
        return;
      }
      
      // Tabela există, execută query-ul
      db.all(`
        SELECT DISTINCT
          cp.id,
          cp.name,
          cc.name as category,
          cp.price,
          cp.is_active,
          1 as is_sellable
        FROM catalog_products cp
        LEFT JOIN catalog_categories cc ON cp.category_id = cc.id
        INNER JOIN daily_menu dm ON (cp.id = dm.soup_id OR cp.id = dm.main_course_id)
        WHERE cp.is_active = 1
          AND dm.is_active = 1
          AND dm.date = ?
          AND cp.id NOT IN (SELECT id FROM menu WHERE is_sellable = 1 AND (is_active = 1 OR is_active IS NULL))
      `, [today], (err2, rows) => {
        if (err2) {
          // Dacă query-ul eșuează (ex: tabela daily_menu nu există), returnează array gol
          console.log('   ⚠️  Eroare la interogarea catalog_products:', err2.message);
          resolve([]);
        } else {
          resolve(rows || []);
        }
      });
    });
  });
}

/**
 * Simulează răspunsul /api/kiosk/menu pentru a vedea ce ID-uri sunt trimise către restorapp
 */
async function getProductsSentToRestorapp() {
  const menuProducts = await getMenuProducts();
  const catalogProducts = await getCatalogProducts();
  
  // Combină produsele (similar cu server.js)
  const allProducts = [...menuProducts, ...catalogProducts];
  
  // Elimină duplicate-urile (după ID) - păstrează doar primul
  const uniqueProducts = [];
  const seenIds = new Set();
  for (const product of allProducts) {
    if (!seenIds.has(product.id)) {
      seenIds.add(product.id);
      uniqueProducts.push(product);
    }
  }
  
  // Sortează după categorie și nume
  uniqueProducts.sort((a, b) => {
    const categoryCompare = (a.category || '').localeCompare(b.category || '');
    if (categoryCompare !== 0) return categoryCompare;
    return (a.name || '').localeCompare(b.name || '');
  });
  
  return uniqueProducts;
}

/**
 * Verifică dacă există duplicate-uri de ID-uri între menu și catalog_products
 */
async function checkDuplicateIds() {
  const menuProducts = await getMenuProducts();
  const catalogProducts = await getCatalogProducts();
  
  const menuIds = new Set(menuProducts.map(p => p.id));
  const catalogIds = new Set(catalogProducts.map(p => p.id));
  
  const duplicates = [];
  for (const catalogId of catalogIds) {
    if (menuIds.has(catalogId)) {
      const menuProduct = menuProducts.find(p => p.id === catalogId);
      const catalogProduct = catalogProducts.find(p => p.id === catalogId);
      duplicates.push({
        id: catalogId,
        menu: menuProduct,
        catalog: catalogProduct
      });
    }
  }
  
  return duplicates;
}

/**
 * Verifică dacă există produse cu același nume dar ID-uri diferite
 */
async function checkSameNameDifferentIds() {
  const menuProducts = await getMenuProducts();
  const catalogProducts = await getCatalogProducts();
  const allProducts = [...menuProducts, ...catalogProducts];
  
  const nameMap = new Map();
  const conflicts = [];
  
  for (const product of allProducts) {
    const name = (product.name || '').toLowerCase().trim();
    if (!name) continue;
    
    if (!nameMap.has(name)) {
      nameMap.set(name, []);
    }
    nameMap.get(name).push(product);
  }
  
  for (const [name, products] of nameMap.entries()) {
    if (products.length > 1) {
      const ids = products.map(p => p.id);
      const uniqueIds = [...new Set(ids)];
      if (uniqueIds.length > 1) {
        conflicts.push({
          name: products[0].name,
          products: products
        });
      }
    }
  }
  
  return conflicts;
}

/**
 * Verifică comenzile recente pentru a identifica produse cu ID-uri care nu există
 */
async function checkRecentOrdersForInvalidIds() {
  return new Promise((resolve, reject) => {
    // Verifică dacă coloana platform există
    db.all("PRAGMA table_info(orders)", [], async (err, columns) => {
      if (err) {
        reject(err);
        return;
      }
      
      const hasPlatform = columns.some(col => col.name === 'platform');
      const platformFilter = hasPlatform ? "o.platform = 'MOBILE_APP' AND" : "";
      
      db.all(`
        SELECT 
          o.id as order_id,
          o.timestamp,
          o.items
          ${hasPlatform ? ', o.platform' : ''}
        FROM orders o
        WHERE ${platformFilter || '1=1 AND'}
          datetime(o.timestamp) >= datetime('now', '-7 days')
        ORDER BY o.timestamp DESC
        LIMIT 50
      `, [], async (err2, orders) => {
      if (err) {
        reject(err);
        return;
      }
      
      const menuProducts = await getMenuProducts();
      const catalogProducts = await getCatalogProducts();
      const validIds = new Set([
        ...menuProducts.map(p => p.id),
        ...catalogProducts.map(p => p.id)
      ]);
      
      const invalidOrders = [];
      
      for (const order of orders) {
        let items = [];
        try {
          if (typeof order.items === 'string') {
            items = JSON.parse(order.items);
          } else {
            items = order.items || [];
          }
        } catch (e) {
          continue;
        }
        
        const invalidItems = [];
        for (const item of items) {
          const productId = item.product_id || item.id || item.productId;
          if (productId && !validIds.has(productId)) {
            invalidItems.push({
              product_id: productId,
              name: item.name || 'N/A',
              quantity: item.quantity || 1
            });
          }
        }
        
        if (invalidItems.length > 0) {
          invalidOrders.push({
            order_id: order.order_id,
            timestamp: order.timestamp,
            invalid_items: invalidItems
          });
        }
      }
      
        resolve(invalidOrders);
      });
    });
  });
}

/**
 * Main function
 */
async function main() {
  console.log('\n🔍 VERIFICARE ID-URI PRODUSE - Restaurant App v3 vs Restorapp\n');
  console.log('='.repeat(80));
  
  try {
    // 1. Verifică produsele din menu
    console.log('\n📋 1. PRODUSE DIN MENU:');
    const menuProducts = await getMenuProducts();
    console.log(`   Total produse în menu: ${menuProducts.length}`);
    if (menuProducts.length > 0) {
      console.log(`   ID-uri: ${menuProducts[0].id} - ${menuProducts[menuProducts.length - 1].id}`);
      console.log(`   Exemple: ${menuProducts.slice(0, 5).map(p => `${p.id}:${p.name}`).join(', ')}`);
    }
    
    // 2. Verifică produsele din catalog_products (Daily Menu)
    console.log('\n📋 2. PRODUSE DIN CATALOG_PRODUCTS (Daily Menu):');
    const catalogProducts = await getCatalogProducts();
    console.log(`   Total produse în catalog_products (folosite în Daily Menu): ${catalogProducts.length}`);
    if (catalogProducts.length > 0) {
      console.log(`   ID-uri: ${catalogProducts.map(p => p.id).join(', ')}`);
      console.log(`   Exemple: ${catalogProducts.map(p => `${p.id}:${p.name}`).join(', ')}`);
    }
    
    // 3. Verifică duplicate-uri de ID-uri
    console.log('\n⚠️  3. VERIFICARE DUPLICATE ID-URI:');
    const duplicates = await checkDuplicateIds();
    if (duplicates.length > 0) {
      console.log(`   ❌ GĂSITE ${duplicates.length} DUPLICATE ID-URI:`);
      duplicates.forEach(dup => {
        console.log(`      ID ${dup.id}:`);
        console.log(`        - Menu: "${dup.menu.name}" (${dup.menu.category})`);
        console.log(`        - Catalog: "${dup.catalog.name}" (${dup.catalog.category})`);
      });
    } else {
      console.log('   ✅ Nu există duplicate ID-uri între menu și catalog_products');
    }
    
    // 4. Verifică produse cu același nume dar ID-uri diferite
    console.log('\n⚠️  4. VERIFICARE CONFLICTE NUME (același nume, ID-uri diferite):');
    const conflicts = await checkSameNameDifferentIds();
    if (conflicts.length > 0) {
      console.log(`   ❌ GĂSITE ${conflicts.length} CONFLICTE:`);
      conflicts.slice(0, 10).forEach(conflict => {
        console.log(`      "${conflict.name}":`);
        conflict.products.forEach(p => {
          console.log(`        - ID ${p.id} (${p.category || 'N/A'})`);
        });
      });
      if (conflicts.length > 10) {
        console.log(`      ... și încă ${conflicts.length - 10} conflicte`);
      }
    } else {
      console.log('   ✅ Nu există conflicte (același nume, ID-uri diferite)');
    }
    
    // 5. Verifică ce produse sunt trimise către restorapp
    console.log('\n📤 5. PRODUSE TRIMISE CĂTRE RESTORAPP (/api/kiosk/menu):');
    const productsSentToRestorapp = await getProductsSentToRestorapp();
    console.log(`   Total produse unice trimise către restorapp: ${productsSentToRestorapp.length}`);
    console.log(`   ID-uri: ${productsSentToRestorapp.map(p => p.id).slice(0, 20).join(', ')}${productsSentToRestorapp.length > 20 ? '...' : ''}`);
    
    // 6. Verifică comenzile recente pentru ID-uri invalide
    console.log('\n🔍 6. VERIFICARE COMENZI RECENTE (MOBILE_APP, ultimele 7 zile):');
    const invalidOrders = await checkRecentOrdersForInvalidIds();
    if (invalidOrders.length > 0) {
      console.log(`   ❌ GĂSITE ${invalidOrders.length} COMENZI CU ID-URI INVALIDE:`);
      invalidOrders.slice(0, 10).forEach(order => {
        console.log(`      Comanda #${order.order_id} (${order.timestamp}):`);
        order.invalid_items.forEach(item => {
          console.log(`        - product_id ${item.product_id}: "${item.name}" (qty: ${item.quantity})`);
        });
      });
      if (invalidOrders.length > 10) {
        console.log(`      ... și încă ${invalidOrders.length - 10} comenzi cu probleme`);
      }
    } else {
      console.log('   ✅ Toate comenzile recente au ID-uri valide');
    }
    
    // 7. Rezumat și recomandări
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 REZUMAT:');
    console.log(`   - Produse în menu: ${menuProducts.length}`);
    console.log(`   - Produse în catalog_products (Daily Menu): ${catalogProducts.length}`);
    console.log(`   - Total produse unice trimise către restorapp: ${productsSentToRestorapp.length}`);
    console.log(`   - Duplicate ID-uri: ${duplicates.length}`);
    console.log(`   - Conflicte nume: ${conflicts.length}`);
    console.log(`   - Comenzi cu ID-uri invalide: ${invalidOrders.length}`);
    
    if (duplicates.length > 0 || conflicts.length > 0 || invalidOrders.length > 0) {
      console.log('\n⚠️  RECOMANDĂRI:');
      if (duplicates.length > 0) {
        console.log('   1. Rezolvă duplicate-urile de ID-uri între menu și catalog_products');
        console.log('      - Fie mută produsele din catalog_products în menu');
        console.log('      - Fie schimbă ID-urile din catalog_products pentru a evita conflictele');
      }
      if (conflicts.length > 0) {
        console.log('   2. Rezolvă conflictele de nume (același nume, ID-uri diferite)');
        console.log('      - Asigură-te că produsele cu același nume au același ID');
      }
      if (invalidOrders.length > 0) {
        console.log('   3. Verifică comenzile cu ID-uri invalide');
        console.log('      - Posibil că restorapp trimite ID-uri care nu mai există în baza de date');
        console.log('      - Sau există o problemă de sincronizare între restorapp și backend');
      }
    } else {
      console.log('\n✅ Toate ID-urile sunt sincronizate corect!');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Verificare completă!\n');
    
  } catch (error) {
    console.error('\n❌ EROARE:', error);
    process.exit(1);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ Eroare la închiderea bazei de date:', err.message);
      } else {
        console.log('✅ Baza de date închisă');
      }
    });
  }
}

// Rulează script-ul
main();
