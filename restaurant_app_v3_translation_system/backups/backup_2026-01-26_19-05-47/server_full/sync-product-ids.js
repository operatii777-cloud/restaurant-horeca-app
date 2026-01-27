/**
 * Script de sincronizare ID-uri produse
 * 
 * Rezolvă conflictele de ID-uri și asigură sincronizarea între restaurant_app_v3 și restorapp
 * 
 * Usage: node sync-product-ids.js [--fix-duplicates] [--fix-conflicts]
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
 * Găsește produse duplicate (același nume, ID-uri diferite)
 */
async function findDuplicateNames() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        name,
        GROUP_CONCAT(id) as ids,
        GROUP_CONCAT(category) as categories,
        COUNT(*) as count
      FROM menu
      WHERE is_sellable = 1 AND (is_active = 1 OR is_active IS NULL)
      GROUP BY LOWER(TRIM(name))
      HAVING COUNT(*) > 1
      ORDER BY name
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Obține detalii despre un produs
 */
async function getProductDetails(productId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM menu WHERE id = ?', [productId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Verifică dacă un ID este folosit în order_items sau orders
 */
async function isProductUsedInOrders(productId) {
  return new Promise((resolve, reject) => {
    // Verifică dacă tabela order_items există
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='order_items'", [], (err, table) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!table) {
        // Tabela nu există, verifică în orders.items (JSON)
        db.all(`
          SELECT items
          FROM orders
          WHERE items IS NOT NULL
          LIMIT 100
        `, [], (err2, orders) => {
          if (err2) {
            resolve(false); // Dacă nu poate verifica, presupune că nu e folosit
            return;
          }
          
          let found = false;
          for (const order of orders) {
            try {
              const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
              if (Array.isArray(items)) {
                for (const item of items) {
                  const itemId = item.product_id || item.id || item.productId;
                  if (itemId === productId) {
                    found = true;
                    break;
                  }
                }
              }
              if (found) break;
            } catch (e) {
              // Ignoră erorile de parsing
            }
          }
          resolve(found);
        });
      } else {
        // Tabela există, verifică în order_items
        db.get(`
          SELECT COUNT(*) as count
          FROM order_items
          WHERE product_id = ?
          LIMIT 1
        `, [productId], (err3, row) => {
          if (err3) resolve(false);
          else resolve((row?.count || 0) > 0);
        });
      }
    });
  });
}

/**
 * Rezolvă conflictele de nume (păstrează cel mai vechi ID, marchează celelalte ca inactive)
 */
async function fixNameConflicts(dryRun = true) {
  console.log('\n🔧 REZOLVARE CONFLICTE NUME:');
  console.log('='.repeat(80));
  
  const duplicates = await findDuplicateNames();
  
  if (duplicates.length === 0) {
    console.log('✅ Nu există conflicte de nume');
    return;
  }
  
  console.log(`\n📋 Găsite ${duplicates.length} conflicte de nume:\n`);
  
  for (const dup of duplicates) {
    const ids = dup.ids.split(',').map(id => parseInt(id.trim()));
    const categories = dup.categories.split(',');
    
    console.log(`\n🔍 "${dup.name}":`);
    console.log(`   ID-uri: ${ids.join(', ')}`);
    console.log(`   Categorii: ${categories.join(', ')}`);
    
    // Obține detalii pentru fiecare ID
    const products = [];
    for (const id of ids) {
      const product = await getProductDetails(id);
      const usedInOrders = await isProductUsedInOrders(id);
      products.push({
        id,
        product,
        usedInOrders
      });
    }
    
    // Sortează: preferă produsul activ și sellable, apoi cel mai vechi ID
    products.sort((a, b) => {
      const aActive = (a.product?.is_active === 1 || a.product?.is_active === null) && a.product?.is_sellable === 1;
      const bActive = (b.product?.is_active === 1 || b.product?.is_active === null) && b.product?.is_sellable === 1;
      
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      
      // Dacă ambele sunt active sau inactive, preferă cel mai mic ID
      return a.id - b.id;
    });
    
    const keepProduct = products[0];
    const removeProducts = products.slice(1);
    
    console.log(`   ✅ Păstrează: ID ${keepProduct.id} (active: ${keepProduct.product?.is_active}, sellable: ${keepProduct.product?.is_sellable}, folosit în comenzi: ${keepProduct.usedInOrders})`);
    
    for (const remove of removeProducts) {
      console.log(`   ❌ Marchează ca inactiv: ID ${remove.id} (active: ${remove.product?.is_active}, sellable: ${remove.product?.is_sellable}, folosit în comenzi: ${remove.usedInOrders})`);
      
      if (!dryRun) {
        // Marchează produsul ca inactiv
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE menu
            SET is_active = 0,
                is_sellable = 0
            WHERE id = ?
          `, [remove.id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log(`      ✅ ID ${remove.id} marcat ca inactiv`);
      } else {
        console.log(`      ⚠️  DRY RUN - nu s-a făcut modificare`);
      }
    }
  }
  
  if (dryRun) {
    console.log('\n⚠️  DRY RUN - nu s-au făcut modificări');
    console.log('   Rulează cu --fix-conflicts pentru a aplica modificările');
  } else {
    console.log('\n✅ Conflictele au fost rezolvate!');
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const fixConflicts = args.includes('--fix-conflicts');
  const dryRun = !fixConflicts;
  
  console.log('\n🔧 SINCRONIZARE ID-URI PRODUSE - Restaurant App v3\n');
  console.log('='.repeat(80));
  
  if (dryRun) {
    console.log('⚠️  MOD DRY RUN - nu se vor face modificări');
    console.log('   Adaugă --fix-conflicts pentru a aplica modificările\n');
  } else {
    console.log('⚠️  MOD FIX - se vor aplica modificări în baza de date!\n');
  }
  
  try {
    // Rezolvă conflictele de nume
    await fixNameConflicts(dryRun);
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Sincronizare completă!\n');
    
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
