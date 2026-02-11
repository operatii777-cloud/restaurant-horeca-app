/**
 * INVESTIGARE COMANDA #2909
 * Verifică de ce comanda #2909 nu are stock_movements
 */

const { dbPromise } = require('./database');

async function investigateOrder2909() {
  try {
    const db = await dbPromise;
    
    console.log('🔍 INVESTIGARE COMANDA #2909\n');
    
    // 1. Verifică comanda în tabelul orders
    const order = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          id, platform, order_source, type, status, is_paid,
          items, total, payment_method, timestamp
        FROM orders
        WHERE id = ?
      `, [2909], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      console.log('❌ Comanda #2909 nu există în baza de date');
      return;
    }
    
    console.log('📋 DETALII COMANDA:');
    console.log(`   ID: ${order.id}`);
    console.log(`   Platform: ${order.platform || 'N/A'}`);
    console.log(`   Order Source: ${order.order_source || 'N/A'}`);
    console.log(`   Type: ${order.type || 'N/A'}`);
    console.log(`   Status: ${order.status || 'N/A'}`);
    console.log(`   Is Paid: ${order.is_paid || 0}`);
    console.log(`   Total: ${order.total || 0} RON`);
    console.log(`   Payment Method: ${order.payment_method || 'N/A'}`);
    console.log(`   Timestamp: ${order.timestamp || 'N/A'}`);
    
    // 2. Parsează items
    let items = [];
    try {
      items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      if (!Array.isArray(items)) {
        items = [];
      }
    } catch (e) {
      console.log('   ⚠️  Eroare la parsarea items:', e.message);
    }
    
    console.log(`\n📦 ITEMS (${items.length}):`);
    items.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.name || item.product_name || 'N/A'} (ID: ${item.product_id || item.id || 'N/A'})`);
      console.log(`      Quantity: ${item.quantity || 1}`);
      console.log(`      Price: ${item.price || item.finalPrice || 0} RON`);
    });
    
    // 3. Verifică stock_movements
    console.log('\n📊 VERIFICARE STOCK_MOVEMENTS:');
    
    // Verifică structura tabelei mai întâi
    let stockMoves = [];
    try {
      // Încearcă stock_moves
      stockMoves = await new Promise((resolve, reject) => {
        db.all(`
          SELECT *
          FROM stock_moves
          WHERE reference_id = ? AND reference_type = 'ORDER'
          ORDER BY timestamp DESC
        `, [2909], (err, rows) => {
          if (err) {
            // Încearcă stock_movements
            db.all(`
              SELECT *
              FROM stock_movements
              WHERE reference_id = ? AND reference_type = 'ORDER'
              ORDER BY timestamp DESC
            `, [2909], (err2, rows2) => {
              if (err2) {
                // Dacă niciuna nu există, returnează array gol
                if (err2.message.includes('no such table')) {
                  resolve([]);
                } else {
                  reject(err2);
                }
              } else {
                resolve(rows2 || []);
              }
            });
          } else {
            resolve(rows || []);
          }
        });
      });
    } catch (error) {
      console.log(`   ⚠️  Eroare la verificarea stock_movements: ${error.message}`);
      stockMoves = [];
    }
    
    if (stockMoves.length === 0) {
      console.log('   ❌ NU EXISTĂ stock_movements pentru comanda #2909');
    } else {
      console.log(`   ✅ Există ${stockMoves.length} stock_movements:`);
      stockMoves.forEach((move, idx) => {
        console.log(`      ${idx + 1}. Ingredient ID: ${move.ingredient_id}, Quantity: ${move.quantity} ${move.unit || ''}, Type: ${move.type}`);
      });
    }
    
    // 4. Verifică dacă produsele au rețete
    console.log('\n🍳 VERIFICARE REȚETE:');
    for (const item of items) {
      const productId = item.product_id || item.id;
      if (!productId) {
        console.log(`   ⚠️  Item "${item.name || 'N/A'}" nu are product_id`);
        continue;
      }
      
      const recipe = await new Promise((resolve, reject) => {
        db.get(`
          SELECT id, product_id
          FROM recipes
          WHERE product_id = ?
          LIMIT 1
        `, [productId], (err, row) => {
          if (err) {
            // Dacă tabelul nu există sau are altă structură, returnează null
            if (err.message.includes('no such table') || err.message.includes('no such column')) {
              resolve(null);
            } else {
              reject(err);
            }
          } else {
            resolve(row);
          }
        });
      });
      
      if (recipe) {
        console.log(`   ✅ Produs "${item.name || 'N/A'}" (ID: ${productId}) ARE rețetă (Recipe ID: ${recipe.id})`);
        
        // Verifică ingredientele din rețetă
        const recipeLines = await new Promise((resolve, reject) => {
          db.all(`
            SELECT 
              rl.ingredient_id, rl.quantity, rl.unit,
              i.name as ingredient_name
            FROM recipe_lines rl
            LEFT JOIN ingredients i ON i.id = rl.ingredient_id
            WHERE rl.recipe_id = ?
          `, [recipe.id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });
        
        if (recipeLines.length > 0) {
          console.log(`      Ingrediente necesare: ${recipeLines.length}`);
          recipeLines.forEach(line => {
            console.log(`         - ${line.ingredient_name || 'N/A'} (ID: ${line.ingredient_id}): ${line.quantity} ${line.unit || ''}`);
          });
        } else {
          console.log(`      ⚠️  Rețeta nu are ingrediente definite`);
        }
      } else {
        console.log(`   ⚠️  Produs "${item.name || 'N/A'}" (ID: ${productId}) NU ARE rețetă`);
      }
    }
    
    // 5. Verifică dacă există alte comenzi similare care AU stock_movements
    console.log('\n🔍 COMPARAȚIE CU ALTE COMENZI:');
    const similarOrders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          o.id, o.platform, o.type, o.timestamp,
          COUNT(sm.id) as stock_moves_count
        FROM orders o
        LEFT JOIN stock_moves sm ON sm.reference_id = o.id AND sm.reference_type = 'ORDER'
        WHERE o.platform = ? 
          AND o.type = ?
          AND o.id != ?
          AND o.timestamp >= datetime('now', '-24 hours')
        GROUP BY o.id
        ORDER BY o.timestamp DESC
        LIMIT 5
      `, [order.platform || 'MOBILE_APP', order.type || 'takeaway', 2909], (err, rows) => {
        if (err) {
          // Încearcă cu stock_movements
          db.all(`
            SELECT 
              o.id, o.platform, o.type, o.timestamp,
              COUNT(sm.id) as stock_moves_count
            FROM orders o
            LEFT JOIN stock_movements sm ON sm.reference_id = o.id AND sm.reference_type = 'ORDER'
            WHERE o.platform = ? 
              AND o.type = ?
              AND o.id != ?
              AND o.timestamp >= datetime('now', '-24 hours')
            GROUP BY o.id
            ORDER BY o.timestamp DESC
            LIMIT 5
          `, [order.platform || 'MOBILE_APP', order.type || 'takeaway', 2909], (err2, rows2) => {
            if (err2) reject(err2);
            else resolve(rows2 || []);
          });
        } else {
          resolve(rows || []);
        }
      });
    });
    
    if (similarOrders.length > 0) {
      console.log(`   📊 Comenzi similare (${similarOrders.length}):`);
      similarOrders.forEach(ord => {
        console.log(`      Comanda #${ord.id}: ${ord.stock_moves_count || 0} stock_movements`);
      });
    } else {
      console.log('   ⚠️  Nu există comenzi similare în ultimele 24h');
    }
    
    // 6. Verifică dacă există erori în log-uri (verifică dacă stock consumption a fost apelat)
    console.log('\n🔍 ANALIZĂ CAUZĂ:');
    console.log('   Verificând posibile cauze...\n');
    
    if (stockMoves.length === 0) {
      console.log('   ❌ PROBLEMĂ IDENTIFICATĂ:');
      console.log('      Comanda #2909 nu are stock_movements.');
      console.log('\n   🔍 POSIBILE CAUZE:');
      
      // Verifică dacă produsele au rețete
      let hasRecipes = false;
      for (const item of items) {
        const productId = item.product_id || item.id;
        if (productId) {
          const recipe = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM recipes WHERE product_id = ?', [productId], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          if (recipe) {
            hasRecipes = true;
            break;
          }
        }
      }
      
      if (!hasRecipes) {
        console.log('      1. ✅ Produsele NU au rețete - normal să nu existe stock_movements');
        console.log('         (Stock consumption se face doar pentru produse cu rețete)');
      } else {
        console.log('      2. ⚠️  Produsele AU rețete, dar stock_movements lipsește!');
        console.log('         CAUZE POSIBILE:');
        console.log('         - Stock consumption service nu a fost apelat');
        console.log('         - Eroare la consumul stocului (nu a fost logată)');
        console.log('         - Comanda a fost creată înainte de implementarea stock consumption');
        console.log('         - Platforma MOBILE_APP nu consumă stoc (BUG!)');
      }
      
      // Verifică când a fost creată comanda
      const orderDate = new Date(order.timestamp);
      const now = new Date();
      const hoursAgo = (now - orderDate) / (1000 * 60 * 60);
      
      console.log(`\n   📅 Comanda creată: ${orderDate.toISOString()} (${hoursAgo.toFixed(1)} ore în urmă)`);
      
      if (hoursAgo > 24) {
        console.log('      ⚠️  Comanda este veche (>24h) - poate fi dinainte de implementarea stock consumption');
      }
    }
    
    console.log('\n✅ Investigare completă!');
    
  } catch (error) {
    console.error('❌ Eroare la investigare:', error);
  } finally {
    process.exit(0);
  }
}

// Rulează investigarea
investigateOrder2909();
