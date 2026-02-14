/**
 * Script pentru crearea tabelelor lipsă
 * 
 * Rulează acest script pentru a crea tabelele necesare pentru:
 * - Hostess Tables
 * - Lost & Found
 * - Coatroom
 * - Webhooks
 */

const { dbPromise } = require('../../database');
const fs = require('fs');
const path = require('path');

async function createMissingTables() {
  console.log('🔧 Creating missing database tables...\n');
  
  try {
    const db = await dbPromise;
    
    // 1. Hostess Tables
    console.log('📋 Creating hostess_tables...');
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS hostess_tables (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_number VARCHAR(10) NOT NULL UNIQUE,
          capacity INTEGER NOT NULL DEFAULT 2,
          location_zone VARCHAR(50),
          is_active INTEGER DEFAULT 1,
          x_position INTEGER,
          y_position INTEGER,
          shape VARCHAR(20) DEFAULT 'square',
          rotation INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ hostess_tables created');
          resolve();
        }
      });
    });
    
    // Create index for hostess_tables
    await new Promise((resolve, reject) => {
      db.run(`CREATE INDEX IF NOT EXISTS idx_hostess_tables_active ON hostess_tables(is_active)`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // 2. Lost & Found Items
    console.log('📋 Creating lostfound_items...');
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS lostfound_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_type VARCHAR(50) NOT NULL,
          description TEXT,
          found_location VARCHAR(100),
          found_date DATE NOT NULL,
          found_by VARCHAR(100),
          status VARCHAR(20) DEFAULT 'unclaimed',
          claimed_by VARCHAR(100),
          claimed_date DATE,
          storage_location VARCHAR(100),
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ lostfound_items created');
          resolve();
        }
      });
    });
    
    // Create index for lostfound_items
    await new Promise((resolve, reject) => {
      db.run(`CREATE INDEX IF NOT EXISTS idx_lostfound_status ON lostfound_items(status)`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // 3. Coatroom Tickets
    console.log('📋 Creating coatroom_tickets...');
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS coatroom_tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ticket_number VARCHAR(20) NOT NULL UNIQUE,
          customer_name VARCHAR(100),
          items_count INTEGER DEFAULT 1,
          items_description TEXT,
          check_in_time DATETIME NOT NULL,
          check_out_time DATETIME,
          status VARCHAR(20) DEFAULT 'checked_in',
          attendant_name VARCHAR(100),
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ coatroom_tickets created');
          resolve();
        }
      });
    });
    
    // Create index for coatroom_tickets
    await new Promise((resolve, reject) => {
      db.run(`CREATE INDEX IF NOT EXISTS idx_coatroom_status ON coatroom_tickets(status)`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // 4. Webhooks
    console.log('📋 Creating webhooks...');
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS webhooks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          url TEXT NOT NULL,
          events TEXT NOT NULL,
          secret TEXT NOT NULL,
          user_id INTEGER,
          active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ webhooks created');
          resolve();
        }
      });
    });
    
    // Create indexes for webhooks
    await new Promise((resolve, reject) => {
      db.run(`CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id)`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run(`CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(active)`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // 5. Webhook Deliveries
    console.log('📋 Creating webhook_deliveries...');
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS webhook_deliveries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          webhook_id INTEGER NOT NULL,
          event_type TEXT NOT NULL,
          payload TEXT,
          success INTEGER DEFAULT 0,
          error_message TEXT,
          status_code INTEGER,
          delivered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ webhook_deliveries created');
          resolve();
        }
      });
    });
    
    // Create indexes for webhook_deliveries
    await new Promise((resolve, reject) => {
      db.run(`CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id)`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run(`CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_success ON webhook_deliveries(success)`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('\n✅ All missing tables created successfully!');
    console.log('\nTables created:');
    console.log('  1. hostess_tables');
    console.log('  2. lostfound_items');
    console.log('  3. coatroom_tickets');
    console.log('  4. webhooks');
    console.log('  5. webhook_deliveries');
    console.log('\n🎉 Database is now ready for testing!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating tables:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createMissingTables();
}

module.exports = { createMissingTables };

