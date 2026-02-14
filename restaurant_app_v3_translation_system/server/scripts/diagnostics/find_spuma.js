
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Searching INGREDIENTS for 'lapte' or 'spuma'...");
    db.all("SELECT * FROM ingredients", [], (err, rows) => {
        if (err) return console.error(err);
        rows.forEach(r => {
            const name = (r.name || "").toLowerCase();
            // simple check, ignoring accents for a moment by just printing everything close
            if (name.includes("lapte") || name.includes("spuma") || name.includes("spumã") || name.includes("lapt")) {
                console.log(`[INGREDIENT] ID: ${r.id}, Name: "${r.name}"`);
            }
        });
    });

    console.log("\nSearching PRODUCTS for 'lapte' or 'spuma'...");
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return console.error(err);
        rows.forEach(r => {
            const name = (r.name || "").toLowerCase();
            if (name.includes("lapte") || name.includes("spuma") || name.includes("spumã") || name.includes("lapt")) {
                console.log(`[PRODUCT] ID: ${r.id}, Name: "${r.name}"`);
            }
        });
    });
});

setTimeout(() => db.close(), 2000);
