/**
 * Script pentru atribuirea unei comenzi curierului Florin G (ID: 2)
 * Folosește: node assign-order-to-courier.js [order_id]
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Găsește baza de date (folosește aceeași logică ca în database.js)
// database.js folosește restaurant.db
let dbPath = path.join(__dirname, 'restaurant.db');
if (!require('fs').existsSync(dbPath)) {
  // Încearcă database.db
  dbPath = path.join(__dirname, 'database.db');
  if (!require('fs').existsSync(dbPath)) {
    // Încearcă în database/
    dbPath = path.join(__dirname, 'database', 'restaurant.db');
  }
}

console.log(`📁 Folosind baza de date: ${dbPath}`);
const db = new sqlite3.Database(dbPath);

const COURIER_ID = 2; // Florin G
const orderId = process.argv[2]; // Order ID din command line

async function assignOrder() {
  try {
    // 1. Verifică dacă curierul există
    const courier = await new Promise((resolve, reject) => {
      db.get('SELECT id, code, name FROM couriers WHERE id = ?', [COURIER_ID], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!courier) {
      console.error(`❌ Curier cu ID ${COURIER_ID} nu există!`);
      process.exit(1);
    }

    console.log(`✅ Curier găsit: ${courier.name} (${courier.code})`);

    // 2. Dacă nu s-a dat order_id, caută o comandă disponibilă
    let targetOrderId = orderId;
    
    if (!targetOrderId) {
      console.log('🔍 Caut comenzi de delivery disponibile...');
      const availableOrders = await new Promise((resolve, reject) => {
        db.all(`
          SELECT o.id, o.id as order_number, o.customer_name, o.delivery_address, o.total, o.status, o.type
          FROM orders o
          LEFT JOIN delivery_assignments da ON o.id = da.order_id AND da.status != 'cancelled'
          WHERE o.type = 'delivery' 
            AND o.status IN ('pending', 'preparing', 'ready', 'completed')
            AND da.id IS NULL
          ORDER BY o.id DESC
          LIMIT 5
        `, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      if (availableOrders.length === 0) {
        console.error('❌ Nu există comenzi disponibile pentru atribuire!');
        console.log('💡 Creează o comandă de delivery sau specifică un order_id:');
        console.log('   node assign-order-to-courier.js [order_id]');
        process.exit(1);
      }

      console.log('\n📋 Comenzi disponibile:');
      availableOrders.forEach((order, index) => {
        console.log(`   ${index + 1}. #${order.id} - ${order.customer_name || 'Fără nume'} - ${order.total || 0} RON - ${order.status}`);
      });

      // Folosește prima comandă disponibilă
      targetOrderId = availableOrders[0].id;
      console.log(`\n✅ Voi atribui comanda #${availableOrders[0].id} (${availableOrders[0].customer_name || 'Fără nume'})`);
    }

    // 3. Verifică dacă comanda există și este de tip delivery
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [targetOrderId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!order) {
      console.error(`❌ Comanda cu ID ${targetOrderId} nu există!`);
      process.exit(1);
    }

    if (order.type !== 'delivery') {
      console.error(`❌ Comanda #${order.id} nu este de tip delivery!`);
      process.exit(1);
    }

    console.log(`✅ Comandă găsită: #${order.id} - ${order.customer_name || 'Fără nume'}`);

    // 4. Verifică dacă comanda este deja atribuită
    const existing = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM delivery_assignments WHERE order_id = ? AND status != "cancelled"',
        [targetOrderId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existing) {
      console.error(`❌ Comanda este deja atribuită curierului cu ID ${existing.courier_id}!`);
      process.exit(1);
    }

    // 5. Creează assignment
    const assignmentId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO delivery_assignments (order_id, courier_id, status, delivery_fee, assigned_at)
        VALUES (?, ?, 'assigned', 15, datetime('now'))
      `, [targetOrderId, COURIER_ID], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    console.log(`✅ Assignment creat cu ID: ${assignmentId}`);

    // 6. Update order
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE orders SET courier_id = ?, status = ? WHERE id = ?',
        [COURIER_ID, 'assigned', targetOrderId],
        (err) => err ? reject(err) : resolve()
      );
    });

    console.log(`✅ Comandă actualizată cu courier_id = ${COURIER_ID}`);

    // 7. Update courier status
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE couriers SET status = ?, updated_at = datetime("now") WHERE id = ?',
        ['assigned', COURIER_ID],
        (err) => err ? reject(err) : resolve()
      );
    });

    console.log(`✅ Status curier actualizat la 'assigned'`);

    console.log('\n🎉 SUCCES! Comanda a fost atribuită cu succes!');
    console.log(`\n📱 Curierul poate vedea comanda la: http://localhost:5173/admin-vite/courier`);
    console.log(`   (Autentificare: DEL-B9FC39 / DEL-B9FC39)`);

    db.close();
  } catch (err) {
    console.error('❌ Eroare:', err.message);
    db.close();
    process.exit(1);
  }
}

assignOrder();

