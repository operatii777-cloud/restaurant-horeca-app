/**
 * Debug query-uri pentru timestamp
 */

const { dbPromise } = require('../database');

async function debugTimestamp() {
  try {
    const db = await dbPromise;
    
    console.log('🔍 Debug timestamp queries...\n');
    
    // Verifică timestamp-urile comenzilor
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id, 
          timestamp,
          typeof(timestamp) as timestamp_type,
          strftime('%Y-%m-%d', timestamp) as date_from_timestamp,
          strftime('%Y-%m-%d', 'now') as today,
          strftime('%Y-%m-%d', datetime('now')) as today_datetime,
          DATE(timestamp) as date_function,
          DATE('now') as today_date_function
        FROM orders
        WHERE id >= 450 AND id <= 459
        ORDER BY id
        LIMIT 5
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    console.log('📅 Verificare timestamp-uri:');
    orders.forEach(o => {
      console.log(`  #${o.id}:`);
      console.log(`    timestamp: ${o.timestamp}`);
      console.log(`    type: ${o.timestamp_type}`);
      console.log(`    strftime date: ${o.date_from_timestamp}`);
      console.log(`    strftime today: ${o.today}`);
      console.log(`    DATE function: ${o.date_function}`);
      console.log(`    DATE today: ${o.today_date_function}`);
      console.log(`    Match: ${o.date_from_timestamp === o.today ? '✅' : '❌'}`);
      console.log('');
    });
    
    // Test query pentru venituri
    const revenue = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total), 0) as revenue
        FROM orders
        WHERE strftime('%Y-%m-%d', timestamp) = strftime('%Y-%m-%d', 'now')
        AND status != 'cancelled'
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
    
    console.log('📊 Query rezultat:');
    console.log(`  Comenzi: ${revenue.count}`);
    console.log(`  Venituri: ${revenue.revenue}`);
    
    // Test alternativ cu DATE()
    const revenueAlt = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total), 0) as revenue
        FROM orders
        WHERE DATE(timestamp) = DATE('now')
        AND status != 'cancelled'
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
    
    console.log('\n📊 Query alternativ (DATE function):');
    console.log(`  Comenzi: ${revenueAlt.count}`);
    console.log(`  Venituri: ${revenueAlt.revenue}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Eroare:', error);
    process.exit(1);
  }
}

debugTimestamp();

