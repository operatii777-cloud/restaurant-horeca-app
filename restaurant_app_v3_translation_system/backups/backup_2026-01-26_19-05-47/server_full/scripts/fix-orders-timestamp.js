/**
 * Script pentru a actualiza timestamp-urile comenzilor la ziua curentă
 * și a verifica metricile
 */

const { dbPromise } = require('../database');

async function fixOrdersTimestamp() {
  try {
    const db = await dbPromise;
    
    console.log('🔧 Actualizare timestamp-uri comenzi la ziua curentă...\n');
    
    // Obține toate comenzile din ultimele 24 ore
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, timestamp, status, total, is_paid
        FROM orders
        WHERE id >= 450 AND id <= 459
        ORDER BY id
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    console.log(`📦 Găsite ${orders.length} comenzi de actualizat\n`);
    
    // Actualizează timestamp-urile la ziua curentă cu ore diferite
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      // Creează timestamp-uri cu ore diferite în ziua curentă (10:00 - 19:00)
      const hour = 10 + (i % 10);
      const minute = i * 6;
      const newTimestamp = `${today} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
      
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE orders
          SET timestamp = ?
          WHERE id = ?
        `, [newTimestamp, order.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      console.log(`✅ Comandă #${order.id} actualizată: ${newTimestamp}`);
    }
    
    console.log('\n📊 Verificare metrici după actualizare...\n');
    
    // Verifică metricile
    const todayStats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_orders,
          COALESCE(SUM(total), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN is_paid = 1 THEN total ELSE 0 END), 0) as paid_revenue
        FROM orders
        WHERE strftime('%Y-%m-%d', timestamp) = strftime('%Y-%m-%d', 'now')
        AND status != 'cancelled'
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
    
    console.log('═══════════════════════════════════════');
    console.log('📊 METRICI DUPĂ ACTUALIZARE');
    console.log('═══════════════════════════════════════');
    console.log(`📦 Total comenzi astăzi: ${todayStats.total_orders || 0}`);
    console.log(`💰 Venituri totale astăzi: ${(todayStats.total_revenue || 0).toFixed(2)} RON`);
    console.log(`💳 Venituri achitate: ${(todayStats.paid_revenue || 0).toFixed(2)} RON`);
    console.log('═══════════════════════════════════════\n');
    
    // Verifică timestamp-urile actualizate
    const updatedOrders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, timestamp, strftime('%Y-%m-%d', timestamp) as date, strftime('%Y-%m-%d', 'now') as today
        FROM orders
        WHERE id >= 450 AND id <= 459
        ORDER BY id
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    console.log('📅 Verificare timestamp-uri:');
    updatedOrders.forEach(o => {
      const match = o.date === o.today ? '✅' : '❌';
      console.log(`  ${match} #${o.id}: ${o.date} (today: ${o.today})`);
    });
    
    console.log('\n✅ Actualizare finalizată!');
    console.log('🔍 Reîncarcă dashboard-ul pentru a vedea metricile actualizate.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Eroare:', error);
    process.exit(1);
  }
}

fixOrdersTimestamp();

