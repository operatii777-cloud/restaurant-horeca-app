/**
 * Create tables for printing and scheduling modules
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'restaurant.db');
const db = new sqlite3.Database(dbPath);

console.log('Creating tables in:', dbPath);

const tables = [
  // Printers table
  `CREATE TABLE IF NOT EXISTS printers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    connection_type VARCHAR(50) NOT NULL,
    address VARCHAR(255),
    model VARCHAR(100),
    driver VARCHAR(50) DEFAULT 'escpos',
    paper_width INTEGER DEFAULT 80,
    is_default INTEGER DEFAULT 0,
    is_kitchen INTEGER DEFAULT 0,
    categories TEXT,
    options TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  
  // Print queue table
  `CREATE TABLE IF NOT EXISTS print_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    printer_id INTEGER,
    document_type VARCHAR(50),
    content TEXT NOT NULL,
    order_id INTEGER,
    priority INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    printed_at DATETIME,
    FOREIGN KEY (printer_id) REFERENCES printers(id)
  )`,
  
  // Shifts table
  `CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    role VARCHAR(50),
    position VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    location_id INTEGER,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES waiters(id)
  )`,
  
  // Receipt templates table
  `CREATE TABLE IF NOT EXISTS receipt_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    paper_width INTEGER DEFAULT 80,
    template_data TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`
];

let created = 0;

tables.forEach((sql, i) => {
  db.run(sql, (err) => {
    if (err) {
      console.log('Error table ' + (i+1) + ':', err.message);
    } else {
      created++;
      console.log('Created table ' + (i+1));
    }
  });
});

// Insert default printer
setTimeout(() => {
  db.run(`
    INSERT OR IGNORE INTO printers (id, name, type, connection_type, address, is_default, is_active)
    VALUES (1, 'Imprimanta Default', 'thermal', 'network', '192.168.1.100:9100', 1, 1)
  `, (err) => {
    if (!err) console.log('Default printer inserted');
    db.close();
    console.log('Done! Created ' + created + ' tables');
  });
}, 1000);

