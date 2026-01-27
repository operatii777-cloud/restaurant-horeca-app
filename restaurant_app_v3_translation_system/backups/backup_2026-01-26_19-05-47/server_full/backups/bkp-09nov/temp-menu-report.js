const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('restaurant.db');

db.all('SELECT id, name, category FROM menu ORDER BY category, name', (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(JSON.stringify(rows, null, 2));
});
