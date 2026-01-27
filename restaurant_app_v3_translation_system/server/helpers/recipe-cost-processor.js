// server/helpers/recipe-cost-processor.js
// ✅ SĂPTĂMÂNA 1 - ZIUA 5: Procesor pentru recalculare automată cost rețete

const { dbPromise } = require('../database');
const { calculateRecipeCostRecursive } = require('./recipe-helpers');

let processingInterval = null;
let isProcessing = false;

/**
 * Procesează queue-ul de recalculare cost rețete
 * @param {number} batchSize - Număr maxim de iteme de procesat într-un batch
 * @returns {Promise<{processed: number, errors: number}>}
 */
async function processRecalculationQueue(batchSize = 100) {
  if (isProcessing) {
    console.log('⏳ Queue processor deja în execuție, skip...');
    return { processed: 0, errors: 0 };
  }
  
  isProcessing = true;
  let processed = 0;
  let errors = 0;
  
  try {
    const db = await dbPromise;
    
    // Obține iteme pending
    const pending = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM recipe_recalculation_queue 
        WHERE status = 'pending' 
        ORDER BY created_at ASC
        LIMIT ?
      `, [batchSize], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    if (pending.length === 0) {
      isProcessing = false;
      return { processed: 0, errors: 0 };
    }
    
    console.log(`📊 Procesare ${pending.length} iteme din queue recalculare cost...`);
    
    for (const item of pending) {
      try {
        // Recalculează cost folosind funcția recursivă
        const newCost = await calculateRecipeCostRecursive(item.product_id);
        
        // Actualizează cost_price în menu (dacă există coloană)
        // Alternativ, poate fi stocat într-un tabel separat recipe_costs
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE menu 
            SET cost_price = ? 
            WHERE id = ?
          `, [newCost, item.product_id], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
          });
        });
        
        // Marchează ca procesat
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE recipe_recalculation_queue 
            SET status = 'completed', 
                processed_at = datetime('now')
            WHERE id = ?
          `, [item.id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        
        processed++;
        console.log(`✅ Recalculat cost pentru produs ${item.product_id}: ${newCost.toFixed(2)} RON (reason: ${item.reason})`);
        
      } catch (error) {
        errors++;
        console.error(`❌ Eroare la recalcularea costului pentru produs ${item.product_id}:`, error.message);
        
        // Marchează ca eroare
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE recipe_recalculation_queue 
            SET status = 'error',
                error_message = ?,
                processed_at = datetime('now')
            WHERE id = ?
          `, [error.message.substring(0, 500), item.id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
    
    console.log(`✅ Procesare queue finalizată: ${processed} procesate, ${errors} erori`);
    
  } catch (error) {
    console.error('❌ Eroare critică în procesor queue:', error);
  } finally {
    isProcessing = false;
  }
  
  return { processed, errors };
}

/**
 * Pornește procesorul automat (rulează la fiecare interval)
 * @param {number} intervalMinutes - Interval în minute (default: 5)
 */
function startQueueProcessor(intervalMinutes = 5) {
  if (processingInterval) {
    console.log('⚠️ Queue processor deja pornit');
    return;
  }
  
  console.log(`🚀 Pornire queue processor (interval: ${intervalMinutes} minute)`);
  
  // Rulează imediat o dată
  processRecalculationQueue().catch(err => {
    console.error('❌ Eroare la prima rulare queue processor:', err);
  });
  
  // Apoi rulează la fiecare interval
  processingInterval = setInterval(() => {
    processRecalculationQueue().catch(err => {
      console.error('❌ Eroare în queue processor:', err);
    });
  }, intervalMinutes * 60 * 1000);
}

/**
 * Oprește procesorul automat
 */
function stopQueueProcessor() {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
    console.log('🛑 Queue processor oprit');
  }
}

/**
 * Recalculează manual toate costurile pentru produse cu rețete
 * @returns {Promise<{processed: number, errors: number}>}
 */
async function recalculateAllRecipeCosts() {
  try {
    const db = await dbPromise;
    
    // Obține toate produsele care au rețete
    const products = await new Promise((resolve, reject) => {
      db.all(`
        SELECT DISTINCT m.id, m.name
        FROM menu m
        INNER JOIN recipes r ON r.product_id = m.id
        WHERE m.is_sellable = 1
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    console.log(`📊 Recalculare manuală pentru ${products.length} produse...`);
    
    let processed = 0;
    let errors = 0;
    
    for (const product of products) {
      try {
        const newCost = await calculateRecipeCostRecursive(product.id);
        
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE menu 
            SET cost_price = ? 
            WHERE id = ?
          `, [newCost, product.id], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
          });
        });
        
        processed++;
        console.log(`✅ ${product.name} (ID: ${product.id}): ${newCost.toFixed(2)} RON`);
        
      } catch (error) {
        errors++;
        console.error(`❌ Eroare pentru ${product.name} (ID: ${product.id}):`, error.message);
      }
    }
    
    console.log(`✅ Recalculare manuală finalizată: ${processed} procesate, ${errors} erori`);
    
    return { processed, errors, total: products.length };
    
  } catch (error) {
    console.error('❌ Eroare la recalculare manuală:', error);
    throw error;
  }
}

module.exports = {
  processRecalculationQueue,
  startQueueProcessor,
  stopQueueProcessor,
  recalculateAllRecipeCosts
};

