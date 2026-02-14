
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server/restaurant.db');
console.log('Connecting to:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the database.');
});

const searchTerms = ['apa fierbinte', 'spuma de lapte', 'hot water', 'milk foam'];

db.serialize(() => {
    db.all("SELECT * FROM ingredients", [], (err, rows) => {
        if (err) {
            // If table doesn't exist, maybe it's named differently?
            console.error('Error querying ingredients:', err.message);
            return;
        }

        const matches = rows.filter(i => {
            const name = (i.name || '').toLowerCase();
            return searchTerms.some(term => name.includes(term));
        });

        console.log(`Found ${matches.length} ingredients matching search terms:`);
        matches.forEach(match => {
            console.log(`\n[INGREDIENT] ID: ${match.id}, Name: ${match.name}`);
            console.log(`Stock: ${match.current_stock} ${match.unit}`);

            // Find recipes using this ingredient
            db.all("SELECT * FROM recipes WHERE ingredient_id = ?", [match.id], (err, recipes) => {
                if (err) {
                    console.error('Error querying recipes:', err.message);
                    return;
                }
                console.log(`  Used in ${recipes.length} recipes.`);
                recipes.forEach(r => {
                    console.log(`    - Recipe ID: ${r.id}, Product ID: ${r.product_id}, Qty: ${r.quantity}`);
                });
            });
        });
    });
});

// Create a timeout to allow async queries to finish
setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        }
        console.log('Database connection closed.');
    });
}, 3000);
