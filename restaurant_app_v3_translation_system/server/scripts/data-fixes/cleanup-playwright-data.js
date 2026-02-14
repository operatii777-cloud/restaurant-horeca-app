const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'restaurant.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('Connected to database for Playwright cleanup.');
});

db.serialize(() => {
    // 1. Delete Playwright Categories from menu_pdf_categories
    db.run(`DELETE FROM menu_pdf_categories WHERE category_name LIKE '%Playwright%'`, function (err) {
        if (err) console.error('Error deleting categories:', err);
        else console.log(`Deleted ${this.changes} Playwright categories.`);
    });

    // 2. Identify Playwright Products in menu table
    db.all(`SELECT id FROM menu WHERE name LIKE '%Playwright%' OR category LIKE '%Playwright%'`, [], (err, rows) => {
        if (err) {
            console.error('Error finding Playwright products:', err);
            return;
        }

        const productIds = rows.map(r => r.id);
        console.log(`Found ${productIds.length} Playwright products.`);

        if (productIds.length > 0) {
            const placeholders = productIds.map(() => '?').join(',');

            // 3. Delete from menu_pdf_products
            db.run(`DELETE FROM menu_pdf_products WHERE product_id IN (${placeholders})`, productIds, function (err) {
                if (err) console.error('Error deleting from menu_pdf_products:', err);
                else console.log(`Deleted ${this.changes} entries from menu_pdf_products linked to Playwright products.`);
            });

            // 4. Delete from menu table
            db.run(`DELETE FROM menu WHERE id IN (${placeholders})`, productIds, function (err) {
                if (err) console.error('Error deleting products from menu:', err);
                else console.log(`Deleted ${this.changes} products from menu table.`);
            });
        }

        // Final cleanup of any orphaned menu_pdf_products (just in case)
        db.run(`DELETE FROM menu_pdf_products WHERE product_id NOT IN (SELECT id FROM menu)`, function (err) {
            if (err) console.error('Error cleaning orphans:', err);
            else console.log(`Deleted ${this.changes} orphaned entries from menu_pdf_products.`);

            db.close();
        });
    });
});
