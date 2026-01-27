/**
 * Database Indexes Optimization Script
 * Adaugă indexuri pentru tabele frecvent queried care nu au indexuri
 * 
 * Rulează: node database-indexes-optimization.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'restaurant.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Eroare la conectarea la baza de date:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectat la baza de date');
});

// Lista de indexuri de adăugat pentru tabele frecvent queried
const indexesToCreate = [
  // Audit Log - foarte frecvent queried
  { name: 'idx_audit_log_user_id', table: 'audit_log', columns: 'user_id' },
  { name: 'idx_audit_log_action', table: 'audit_log', columns: 'action' },
  { name: 'idx_audit_log_timestamp', table: 'audit_log', columns: 'timestamp' },
  { name: 'idx_audit_log_user_action', table: 'audit_log', columns: 'user_id, action' },
  
  // Payments - frecvent queried pentru rapoarte
  { name: 'idx_payments_order_id', table: 'payments', columns: 'order_id' },
  { name: 'idx_payments_payment_method', table: 'payments', columns: 'payment_method' },
  { name: 'idx_payments_timestamp', table: 'payments', columns: 'timestamp' },
  { name: 'idx_payments_status', table: 'payments', columns: 'status' },
  
  // Points History - pentru loyalty programs
  { name: 'idx_points_history_customer_id', table: 'points_history', columns: 'customer_id' },
  { name: 'idx_points_history_timestamp', table: 'points_history', columns: 'timestamp' },
  { name: 'idx_points_history_type', table: 'points_history', columns: 'type' },
  
  // Waiters - pentru rapoarte staff
  { name: 'idx_waiters_is_active', table: 'waiters', columns: 'is_active' },
  { name: 'idx_waiters_role', table: 'waiters', columns: 'role' },
  
  // Customers - pentru căutări rapide
  { name: 'idx_customers_phone', table: 'customers', columns: 'phone' },
  { name: 'idx_customers_email', table: 'customers', columns: 'email' },
  { name: 'idx_customers_loyalty_points', table: 'customers', columns: 'loyalty_points' },
  
  // Ingredients - pentru căutări și filtre
  { name: 'idx_ingredients_category', table: 'ingredients', columns: 'category' },
  { name: 'idx_ingredients_is_hidden', table: 'ingredients', columns: 'is_hidden' },
  { name: 'idx_ingredients_supplier_id', table: 'ingredients', columns: 'default_supplier_id' },
  
  // Stock Moves - pentru istoric stoc
  { name: 'idx_stock_moves_date', table: 'stock_moves', columns: 'date' },
  { name: 'idx_stock_moves_move_type', table: 'stock_moves', columns: 'move_type' },
  { name: 'idx_stock_moves_ingredient_date', table: 'stock_moves', columns: 'ingredient_id, date' },
  
  // Waste Logs - pentru rapoarte
  { name: 'idx_waste_logs_waste_date', table: 'waste_logs', columns: 'waste_date' },
  { name: 'idx_waste_logs_waste_type', table: 'waste_logs', columns: 'waste_type' },
  { name: 'idx_waste_logs_location_id', table: 'waste_logs', columns: 'location_id' },
  
  // Supplier Orders - pentru gestionare furnizori
  { name: 'idx_supplier_orders_supplier_id', table: 'supplier_orders', columns: 'supplier_id' },
  { name: 'idx_supplier_orders_status', table: 'supplier_orders', columns: 'status' },
  { name: 'idx_supplier_orders_order_date', table: 'supplier_orders', columns: 'order_date' },
  
  // Reservations - pentru gestionare rezervări
  { name: 'idx_reservations_date', table: 'reservations', columns: 'reservation_date' },
  { name: 'idx_reservations_status', table: 'reservations', columns: 'status' },
  { name: 'idx_reservations_customer_id', table: 'reservations', columns: 'customer_id' },
  
  // Fiscal Documents - pentru rapoarte fiscale
  { name: 'idx_fiscal_documents_document_type', table: 'fiscal_documents', columns: 'document_type' },
  { name: 'idx_fiscal_documents_created_at', table: 'fiscal_documents', columns: 'created_at' },
  { name: 'idx_fiscal_documents_status', table: 'fiscal_documents', columns: 'status' },
  
  // Cash Register Sessions - pentru rapoarte cash
  { name: 'idx_cash_register_sessions_status', table: 'cash_register_sessions', columns: 'status' },
  { name: 'idx_cash_register_sessions_opened_at', table: 'cash_register_sessions', columns: 'opened_at' },
  { name: 'idx_cash_register_sessions_operator_name', table: 'cash_register_sessions', columns: 'operator_name' },
  
  // Kiosk Users - pentru autentificare rapidă
  { name: 'idx_kiosk_users_username', table: 'kiosk_users', columns: 'username' },
  { name: 'idx_kiosk_users_role', table: 'kiosk_users', columns: 'role' },
  { name: 'idx_kiosk_users_is_active', table: 'kiosk_users', columns: 'is_active' },
  
  // Table Sessions - pentru gestionare mese
  { name: 'idx_table_sessions_table_number', table: 'table_sessions', columns: 'table_number' },
  { name: 'idx_table_sessions_status', table: 'table_sessions', columns: 'status' },
  { name: 'idx_table_sessions_started_at', table: 'table_sessions', columns: 'started_at' },
];

console.log(`📊 Adăugare ${indexesToCreate.length} indexuri pentru optimizare performanță...\n`);

let created = 0;
let skipped = 0;
let errors = 0;

db.serialize(() => {
  indexesToCreate.forEach((index, idx) => {
    const sql = `CREATE INDEX IF NOT EXISTS ${index.name} ON ${index.table} (${index.columns})`;
    
    db.run(sql, (err) => {
      if (err) {
        console.error(`❌ Eroare la crearea indexului ${index.name}:`, err.message);
        errors++;
      } else {
        // Verifică dacă indexul există deja
        db.get(`SELECT name FROM sqlite_master WHERE type='index' AND name=?`, [index.name], (err, row) => {
          if (row) {
            if (row.name === index.name) {
              console.log(`✅ Index ${index.name} creat/verificat`);
              created++;
            } else {
              skipped++;
            }
          } else {
            created++;
          }
        });
      }
      
      // Când am terminat cu toate indexurile
      if (idx === indexesToCreate.length - 1) {
        setTimeout(() => {
          console.log(`\n📊 Rezumat:`);
          console.log(`   ✅ Creat/Verificat: ${created}`);
          console.log(`   ⏭️  Sărit: ${skipped}`);
          console.log(`   ❌ Erori: ${errors}`);
          console.log(`\n🎯 Optimizare completă!`);
          db.close((err) => {
            if (err) {
              console.error('❌ Eroare la închiderea bazei de date:', err.message);
            } else {
              console.log('✅ Baza de date închisă cu succes');
            }
            process.exit(0);
          });
        }, 1000);
      }
    });
  });
});

