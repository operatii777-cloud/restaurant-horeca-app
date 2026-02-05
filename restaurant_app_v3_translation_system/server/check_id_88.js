
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

const info = [88];

db.serialize(() => {
    db.get("SELECT * FROM ingredients WHERE id = ?", [88], (err, row) => {
        if (err) return console.error(err);
        if (row) {
            console.log(`Found ID 88 in DB: "${row.name}"`);
        } else {
            console.log("ID 88 NOT found in ingredients table.");
        }
    });

    db.all("SELECT * FROM ingredients WHERE name LIKE '%spuma%' OR name LIKE '%fierbinte%'", [], (err, rows) => {
        if (err) return console.error(err);
        if (rows.length > 0) {
            console.log("\nFound matches via SQL LIKE check:");
            rows.forEach(r => console.log(`${r.id}: ${r.name}`));
        } else {
            console.log("\nNo SQL matches for %spuma% or %fierbinte%.");
        }
    });
});

setTimeout(() => db.close(), 2000);
