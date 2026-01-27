/**
 * Script pentru crearea a 10 comenzi de test
 * Marchează comenzile ca gata, livrate și achitate
 * Data: 04 Ianuarie 2026
 */

const { dbPromise } = require('../database');

// Produse de test
const testProducts = [
  { name: 'Pizza Margherita', price: 35.00, category: 'Pizza' },
  { name: 'Paste Carbonara', price: 28.00, category: 'Paste' },
  { name: 'Salată Cezar', price: 22.00, category: 'Salate' },
  { name: 'Burger Clasic', price: 32.00, category: 'Burgeri' },
  { name: 'Tiramisu', price: 18.00, category: 'Deserturi' },
  { name: 'Coca Cola', price: 8.00, category: 'Băuturi' },
  { name: 'Apa Minerală', price: 5.00, category: 'Băuturi' },
  { name: 'Cafea Espresso', price: 12.00, category: 'Băuturi' },
];

// Tipuri de comenzi
const orderTypes = ['dinein', 'delivery', 'takeout'];

async function createTestOrders() {
  try {
    const db = await dbPromise;
    
    console.log('📦 Creare 10 comenzi de test...\n');
    
    // Obține produsele din meniu pentru a folosi ID-uri reale
    const menuItems = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, price, category FROM menu LIMIT 20', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    if (menuItems.length === 0) {
      console.log('⚠️  Nu există produse în meniu. Se creează produse de test...');
      // Creează produse de test
      for (const product of testProducts) {
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO menu (name, price, category, is_sellable)
            VALUES (?, ?, ?, 1)
          `, [product.name, product.price, product.category], (err) => {
            if (err && !err.message.includes('UNIQUE')) reject(err);
            else resolve();
          });
        });
      }
      
      // Re-încarcă produsele
      const newMenuItems = await new Promise((resolve, reject) => {
        db.all('SELECT id, name, price, category FROM menu LIMIT 20', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      menuItems.push(...newMenuItems);
    }
    
    if (menuItems.length === 0) {
      throw new Error('Nu s-au putut obține produse din meniu');
    }
    
    const orders = [];
    const now = new Date();
    
    // Creează 10 comenzi
    for (let i = 1; i <= 10; i++) {
      const orderType = orderTypes[i % orderTypes.length];
      const numItems = Math.floor(Math.random() * 3) + 2; // 2-4 produse per comandă
      
      // Selectează produse aleatorii
      const selectedItems = [];
      for (let j = 0; j < numItems; j++) {
        const randomProduct = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 bucăți
        selectedItems.push({
          product_id: randomProduct.id,
          name: randomProduct.name,
          quantity: quantity,
          price: randomProduct.price,
          total: randomProduct.price * quantity
        });
      }
      
      // Calculează totalul
      const total = selectedItems.reduce((sum, item) => sum + item.total, 0);
      
      // Creează comanda
      const orderId = await new Promise((resolve, reject) => {
        const timestamp = new Date(now.getTime() - (i * 60000)).toISOString(); // Comenzi cu 1 min diferență
        const itemsJson = JSON.stringify(selectedItems);
        
        db.run(`
          INSERT INTO orders (
            type, items, status, total, timestamp,
            table_number, customer_name, customer_phone,
            delivery_address, payment_method, is_paid
          ) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, 0)
        `, [
          orderType,
          itemsJson,
          total,
          timestamp,
          orderType === 'dinein' ? `Masa ${i}` : null,
          `Client Test ${i}`,
          `071234567${i}`,
          orderType === 'delivery' ? `Strada Test ${i}, București` : null,
          'cash'
        ], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
      
      orders.push({ id: orderId, items: selectedItems, total, type: orderType });
      console.log(`✅ Comandă ${i}/10 creată: #${orderId} - ${total.toFixed(2)} RON (${orderType})`);
    }
    
    console.log('\n🔄 Marcare comenzi ca gata...');
    
    // Marchează toate comenzile ca gata (ready)
    for (const order of orders) {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE orders
          SET status = 'ready',
              completed_timestamp = datetime('now')
          WHERE id = ?
        `, [order.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    console.log('✅ Toate comenzile marcate ca gata\n');
    console.log('🔄 Marcare comenzi ca livrate/completate...');
    
    // Marchează toate comenzile ca livrate/completate
    for (const order of orders) {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE orders
          SET status = 'completed',
              delivered_timestamp = datetime('now')
          WHERE id = ?
        `, [order.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    console.log('✅ Toate comenzile marcate ca completate\n');
    console.log('💳 Marcare comenzi ca achitate...');
    
    // Marchează toate comenzile ca achitate
    for (const order of orders) {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE orders
          SET is_paid = 1,
              paid_timestamp = datetime('now')
          WHERE id = ?
        `, [order.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    console.log('✅ Toate comenzile marcate ca achitate\n');
    
    // Verifică rezultatele
    console.log('📊 Verificare rezultate...\n');
    
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
    console.log('📊 REZUMAT COMENZI DE TEST');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Comenzi create: ${orders.length}`);
    console.log(`📦 Total comenzi astăzi: ${todayStats.total_orders || 0}`);
    console.log(`💰 Venituri totale astăzi: ${(todayStats.total_revenue || 0).toFixed(2)} RON`);
    console.log(`💳 Venituri achitate: ${(todayStats.paid_revenue || 0).toFixed(2)} RON`);
    console.log('═══════════════════════════════════════\n');
    
    // Afișează detalii despre fiecare comandă
    console.log('📋 Detalii comenzi:');
    for (const order of orders) {
      console.log(`  #${order.id} - ${order.total.toFixed(2)} RON (${order.type}) - ${order.items.length} produse`);
    }
    
    console.log('\n✅ Script finalizat cu succes!');
    console.log('🔍 Verifică dashboard-ul pentru a vedea metricile actualizate.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Eroare la crearea comenzilor de test:', error);
    process.exit(1);
  }
}

// Rulează scriptul
createTestOrders();

