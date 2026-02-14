const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'restaurant.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('Connected to database.');
});

db.serialize(() => {
    // Check duplicates before cleanup
    db.all(`
        SELECT product_id, COUNT(*) as count 
        FROM menu_pdf_products 
        GROUP BY product_id 
        HAVING count > 1
    `, [], (err, rows) => {
        if (err) {
            console.error('Error checking duplicates:', err);
            return;
        }

        if (rows.length === 0) {
            console.log('No duplicates found in menu_pdf_products.');
            db.close();
            return;
        }

        console.log(`Found ${rows.length} products with duplicate entries:`);

        let processed = 0;

        rows.forEach(row => {
            const productId = row.product_id;
            // Delete all entries EXCEPT the one with the maximum ID for this product_id
            db.run(`
                DELETE FROM menu_pdf_products 
                WHERE product_id = ? 
                AND id NOT IN (
                    SELECT MAX(id) 
                    FROM menu_pdf_products 
                    WHERE product_id = ?
                )
            `, [productId, productId], function (err) {
                processed++;
                if (err) {
                    console.error(`Error deleting for product ${productId}:`, err);
                } else {
                    console.log(`Deleted ${this.changes} duplicates for product ID ${productId}`);
                }

                if (processed === rows.length) {
                    console.log('Cleanup complete.');
                    db.close();
                }
            });
        });
    });
});
