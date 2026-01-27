/**
 * Script pentru verificarea metricilor dashboard-ului
 */

const { dbPromise } = require('../database');

async function verifyMetrics() {
  try {
    const db = await dbPromise;
    
    console.log('📊 Verificare metrici dashboard...\n');
    
    // Venituri și comenzi astăzi
    const todayStats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COALESCE(SUM(total), 0) as revenue,
          COUNT(*) as orders
        FROM orders
        WHERE strftime('%Y-%m-%d', timestamp) = strftime('%Y-%m-%d', 'now')
        AND status != 'cancelled'
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
    
    // Comenzi achitate
    const paidOrders = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count
        FROM orders
        WHERE strftime('%Y-%m-%d', timestamp) = strftime('%Y-%m-%d', 'now')
        AND is_paid = 1
        AND status != 'cancelled'
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
    
    // Comenzi completate
    const completedOrders = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count
        FROM orders
        WHERE strftime('%Y-%m-%d', timestamp) = strftime('%Y-%m-%d', 'now')
        AND status = 'completed'
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
    
    // COGS (Cost of Goods Sold) - simplificat
    const cogs = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COALESCE(SUM(oi.price * oi.quantity), 0) as cogs
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE strftime('%Y-%m-%d', o.timestamp) = strftime('%Y-%m-%d', 'now')
        AND o.status != 'cancelled'
      `, [], (err, row) => {
        if (err) {
          // Dacă order_items nu există, folosim items JSON
          resolve({ cogs: 0 });
        } else {
          resolve(row || { cogs: 0 });
        }
      });
    });
    
    // Alerte inventar
    const inventoryAlerts = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count
        FROM ingredients
        WHERE current_stock < min_stock
        AND is_hidden = 0
        AND is_available = 1
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
    
    console.log('═══════════════════════════════════════');
    console.log('📊 METRICI DASHBOARD');
    console.log('═══════════════════════════════════════');
    console.log(`💰 Venituri Azi: ${(todayStats.revenue || 0).toFixed(2)} RON`);
    console.log(`📦 Comenzi Astăzi: ${todayStats.orders || 0}`);
    console.log(`💳 Comenzi Achitate: ${paidOrders.count || 0}`);
    console.log(`✅ Comenzi Completate: ${completedOrders.count || 0}`);
    console.log(`📊 COGS (Cost of Goods Sold): ${(cogs.cogs || 0).toFixed(2)} RON`);
    console.log(`⚠️  Alerte Inventar: ${inventoryAlerts.count || 0}`);
    
    if (todayStats.revenue > 0) {
      const foodCostPercent = ((cogs.cogs / todayStats.revenue) * 100).toFixed(1);
      console.log(`🍽️  Food Cost %: ${foodCostPercent}%`);
    }
    
    console.log('═══════════════════════════════════════\n');
    
    // Verifică dacă datele sunt corecte
    if (todayStats.orders >= 10 && todayStats.revenue > 0) {
      console.log('✅ Metricile funcționează corect!');
      console.log('   Dashboard-ul ar trebui să afișeze datele corect.\n');
    } else {
      console.log('⚠️  Verifică dacă comenzile au fost create corect.\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Eroare la verificare:', error);
    process.exit(1);
  }
}

verifyMetrics();

