/**
 * Script pentru ștergerea completă a tuturor comenzilor de delivery din Restaurant App v3
 * 
 * Acest script șterge comenzile cu type='delivery' din tabela orders
 * 
 * ATENȚIE: Operație IREVERSIBILĂ!
 * 
 * Utilizare:
 * node cleanup_all_delivery_orders.js
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

// Funcție pentru a șterge toate comenzile de delivery
function cleanupAllDeliveryOrders() {
  console.log('\n🔍 Căutare comenzi de delivery...\n');
  
  // Găsește TOATE comenzile cu type='delivery'
  const query = `
    SELECT id, status, timestamp, total, friendsride_order_id
    FROM orders
    WHERE type = 'delivery'
    ORDER BY timestamp ASC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('❌ Eroare la căutarea comenzilor:', err.message);
      db.close();
      return;
    }
    
    if (rows.length === 0) {
      console.log('✅ Nu există comenzi de delivery!');
      db.close();
      return;
    }
    
    console.log(`📋 Găsite ${rows.length} comenzi de delivery:\n`);
    rows.forEach((order, index) => {
      const date = new Date(order.timestamp);
      console.log(`${index + 1}. Comanda #${order.id} - Status: ${order.status} - Data: ${date.toLocaleString('ro-RO')} - Total: ${order.total || 0} RON`);
      if (order.friendsride_order_id) {
        console.log(`   FriendsRide Order ID: ${order.friendsride_order_id}`);
      }
    });
    
    console.log('\n⚠️  ATENȚIE: Vei șterge PERMANENT TOATE aceste comenzi!');
    console.log('🔄 Ștergerea comenzilor...\n');
    
    // Șterge fiecare comandă
    let deletedCount = 0;
    let errorCount = 0;
    
    rows.forEach((order) => {
      const deleteQuery = `DELETE FROM orders WHERE id = ? AND type = 'delivery'`;
      
      db.run(deleteQuery, [order.id], function(deleteErr) {
        if (deleteErr) {
          console.error(`❌ Eroare la ștergerea comenzii #${order.id}:`, deleteErr.message);
          errorCount++;
        } else {
          console.log(`✅ Comanda #${order.id} ștearsă`);
          deletedCount++;
        }
        
        // Când toate comenzile au fost procesate
        if (deletedCount + errorCount === rows.length) {
          console.log(`\n📊 Rezumat:`);
          console.log(`   ✅ Comenzi șterse: ${deletedCount}`);
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
cleanupAllDeliveryOrders();

