const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'haccp_%'", (err, rows) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        console.log('HACCP Tables found:', rows);
        if (rows.length === 0) {
            console.log('❌ NO HACCP TABLES FOUND');
        } else {
            console.log('✅ HACCP TABLES EXIST');
        }
    });
});

db.close();
