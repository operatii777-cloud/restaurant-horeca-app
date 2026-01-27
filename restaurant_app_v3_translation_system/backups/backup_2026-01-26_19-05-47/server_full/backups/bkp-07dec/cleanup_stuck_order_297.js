/**
 * Script pentru ștergerea comenzii #297 (sau orice comandă stuck cu băuturi în bucătărie)
 * 
 * Acest script marchează comanda #297 (sau toate comenzile pending/preparing) ca "completed"
 * pentru a le elimina din ecranele BAR/BUCĂTĂRIE
 * 
 * Utilizare:
 * node cleanup_stuck_order_297.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');

// Conectează-te la baza de date
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Eroare la conectarea la baza de date:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectat la baza de date SQLite');
});

// Funcție pentru a curăța comenzile stuck
function cleanupStuckOrders() {
  console.log('\n🔍 Căutare comenzi stuck (pending/preparing)...\n');
  
  // Găsește TOATE comenzile cu status "pending" sau "preparing"
  const query = `
    SELECT id, type, status, timestamp, friendsride_order_id, total
    FROM orders
    WHERE status IN ('pending', 'preparing')
    ORDER BY timestamp ASC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('❌ Eroare la căutarea comenzilor:', err.message);
      db.close();
      return;
    }
    
    if (rows.length === 0) {
      console.log('✅ Nu există comenzi stuck!');
      db.close();
      return;
    }
    
    console.log(`📋 Găsite ${rows.length} comenzi stuck:\n`);
    rows.forEach((order, index) => {
      const date = new Date(order.timestamp);
      console.log(`${index + 1}. Comanda #${order.id} - Status: ${order.status} - Data: ${date.toLocaleString('ro-RO')} - Total: ${order.total || 0} RON`);
      if (order.friendsride_order_id) {
        console.log(`   FriendsRide Order ID: ${order.friendsride_order_id}`);
      }
    });
    
    console.log('\n🔄 Marcarea comenzilor ca "completed"...\n');
    
    // Marchează fiecare comandă ca "completed"
    let completedCount = 0;
    let errorCount = 0;
    
    rows.forEach((order) => {
      const updateQuery = `
        UPDATE orders
        SET status = 'completed',
            completed_timestamp = datetime('now')
        WHERE id = ?
      `;
      
      db.run(updateQuery, [order.id], function(updateErr) {
        if (updateErr) {
          console.error(`❌ Eroare la actualizarea comenzii #${order.id}:`, updateErr.message);
          errorCount++;
        } else {
          console.log(`✅ Comanda #${order.id} marcată ca "completed"`);
          completedCount++;
        }
        
        // Când toate comenzile au fost procesate
        if (completedCount + errorCount === rows.length) {
          console.log(`\n📊 Rezumat:`);
          console.log(`   ✅ Comenzi finalizate: ${completedCount}`);
          console.log(`   ❌ Erori: ${errorCount}`);
          console.log(`\n✅ Curățare finalizată!`);
          console.log('🔄 Repornește serverul pentru a vedea modificările în interfață.');
          db.close();
        }
      });
    });
  });
}

// Rulează curățarea
cleanupStuckOrders();

