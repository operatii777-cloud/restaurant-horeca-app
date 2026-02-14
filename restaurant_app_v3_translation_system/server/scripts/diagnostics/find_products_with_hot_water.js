
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

const INGREDIENT_ID = 88; // Apă fierbinte

db.serialize(() => {
    const query = `
        SELECT p.id, p.name 
        FROM products p
        JOIN recipes r ON p.id = r.product_id
        WHERE r.ingredient_id = ?
    `;

    db.all(query, [INGREDIENT_ID], (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        if (rows.length === 0) {
            console.log("No products found containing ingredient ID 88.");
        } else {
            console.log(`Found ${rows.length} products containing 'Apă fierbinte' (ID 88):`);
            rows.forEach(row => {
                console.log(`- [ID: ${row.id}] ${row.name}`);
            });
        }
    });
});

setTimeout(() => db.close(), 2000);
