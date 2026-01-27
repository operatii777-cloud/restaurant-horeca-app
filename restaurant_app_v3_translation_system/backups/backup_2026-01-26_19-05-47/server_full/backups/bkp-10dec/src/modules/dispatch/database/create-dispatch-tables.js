/**
 * PHASE S9.5 - Dispatch Tables Migration
 * 
 * Creates tables for courier management and delivery tracking.
 * Run this once to set up the dispatch system.
 */

const { dbPromise } = require('../../../../database');

async function createDispatchTables() {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Table 1: couriers
      db.run(`
        CREATE TABLE IF NOT EXISTS couriers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT,
          vehicle_type TEXT,
          status TEXT DEFAULT 'idle' CHECK(status IN ('idle', 'assigned', 'en_route_to_restaurant', 'picked_up', 'en_route_to_customer', 'delivered', 'returning', 'offline')),
          last_lat REAL,
          last_lng REAL,
          last_updated_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('Error creating couriers table:', err);
        }
      });
      
      // Table 2: delivery_tracking
      db.run(`
        CREATE TABLE IF NOT EXISTS delivery_tracking (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          courier_id INTEGER,
          status TEXT CHECK(status IN ('assigned', 'picked_up', 'en_route', 'delivered', 'location_update')),
          lat REAL,
          lng REAL,
          eta_seconds INTEGER,
          distance_meters INTEGER,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (courier_id) REFERENCES couriers (id)
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('Error creating delivery_tracking table:', err);
        }
      });
      
      // Table 3: courier_assignments
      db.run(`
        CREATE TABLE IF NOT EXISTS courier_assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          courier_id INTEGER NOT NULL,
          status TEXT DEFAULT 'assigned' CHECK(status IN ('assigned', 'picked_up', 'en_route', 'delivered', 'cancelled')),
          assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          picked_up_at DATETIME,
          delivered_at DATETIME,
          cancelled_at DATETIME,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (courier_id) REFERENCES couriers (id)
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('Error creating courier_assignments table:', err);
        }
      });
      
      // Indexes
      db.run(`CREATE INDEX IF NOT EXISTS idx_couriers_status ON couriers(status)`, () => {});
      db.run(`CREATE INDEX IF NOT EXISTS idx_delivery_tracking_order ON delivery_tracking(order_id)`, () => {});
      db.run(`CREATE INDEX IF NOT EXISTS idx_delivery_tracking_courier ON delivery_tracking(courier_id)`, () => {});
      db.run(`CREATE INDEX IF NOT EXISTS idx_courier_assignments_order ON courier_assignments(order_id)`, () => {});
      db.run(`CREATE INDEX IF NOT EXISTS idx_courier_assignments_courier ON courier_assignments(courier_id)`, () => {});
      
      console.log('✅ Dispatch tables created successfully');
      resolve();
    });
  });
}

// Run if called directly
if (require.main === module) {
  createDispatchTables()
    .then(() => {
      console.log('Dispatch tables setup complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error setting up dispatch tables:', err);
      process.exit(1);
    });
}

module.exports = { createDispatchTables };

