#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
console.log('🔧 Opening database:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ DB Error:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Database connected');
  
  // First, let's check what tables exist
  db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
    if (err) {
      console.error('❌ Error listing tables:', err);
      db.close();
      return;
    }
    
    console.log('📊 Tables found:');
    tables.forEach(t => console.log('  - ' + t.name));
    
    // Now try to update delivery_fee
    console.log('\n🔄 Setting delivery_fee = 15 for delivery ID 1...');
    
    db.run('UPDATE delivery_assignments SET delivery_fee = 15, tip = 0 WHERE id = 1', function(err) {
      if (err) {
        console.log('⚠️  delivery_assignments update failed:', err.message);
        console.log('   This table might not exist or be empty.');
      } else {
        console.log('✅ Updated delivery_assignments: ' + this.changes + ' row(s) changed');
      }
      
      // Also try updating orders table (fallback)
      console.log('\n🔄 Also updating orders table...');
      db.run('UPDATE orders SET delivery_fee_charged = 15 WHERE id = 459', function(err) {
        if (err) {
          console.log('⚠️  orders update failed:', err.message);
        } else {
          console.log('✅ Updated orders: ' + this.changes + ' row(s) changed');
        }
        
        // Verify the update
        console.log('\n✓ Final verification:');
        db.get('SELECT id, delivery_fee, tip FROM delivery_assignments WHERE id = 1', (err, row) => {
          if (row) {
            console.log('  📦 delivery_assignments ID 1: fee=' + row.delivery_fee + ' RON, tip=' + row.tip + ' RON');
          } else {
            console.log('  ℹ️  delivery_assignments ID 1: not found');
          }
          
          db.get('SELECT id, delivery_fee_charged FROM orders WHERE id = 459', (err, row) => {
            if (row) {
              console.log('  📦 orders ID 459: delivery_fee_charged=' + row.delivery_fee_charged + ' RON');
            } else {
              console.log('  ℹ️  orders ID 459: not found');
            }
            
            db.close();
            console.log('\n✅ Done!');
          });
        });
      });
    });
  });
});
