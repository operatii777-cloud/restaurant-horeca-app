const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

const query = process.argv[2] || 'SELECT id, category_name, category_type, order_index FROM menu_pdf_categories ORDER BY category_type, order_index;';

db.all(query, (err, rows) => {
  if (err) {
    console.error('Query error:', err.message);
    process.exit(1);
  }
  console.log(JSON.stringify(rows, null, 2));
  db.close();
});

