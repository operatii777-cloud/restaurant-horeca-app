const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'restaurant.db');

const db = new sqlite3.Database(dbPath);

console.log('🔄 Activating all products in PDF menu configuration...');

db.serialize(() => {
    // 1. Găsește produsele care NU au intrare deloc în menu_pdf_products
    db.all(`
        SELECT id, name, category 
        FROM menu 
        WHERE is_active = 1 
        AND id NOT IN (SELECT product_id FROM menu_pdf_products)
    `, [], (err, rows) => {
        if (err) {
            console.error('❌ Error finding missing PDF configs:', err);
            return;
        }

        console.log(`📋 Found ${rows.length} active products without PDF config.`);
        if (rows.length > 0) {
            const stmt = db.prepare("INSERT INTO menu_pdf_products (product_id, display_in_pdf) VALUES (?, 1)");
            rows.forEach(row => {
                stmt.run(row.id);
            });
            stmt.finalize();
            console.log(`✅ Defaulted ${rows.length} products to display_in_pdf = 1`);
        }
    });

    // 2. Actualizează produsele existente care au display_in_pdf = 0
    db.run(`
        UPDATE menu_pdf_products 
        SET display_in_pdf = 1 
        WHERE display_in_pdf = 0
    `, function (err) {
        if (err) {
            console.error('❌ Error updating existing PDF configs:', err);
            return;
        }
        console.log(`✅ Updated ${this.changes} existing products to display_in_pdf = 1`);
    });

    // 3. Verifică rezultatul final pentru Băuturi și Coctailuri
    setTimeout(() => {
        db.get(`
            SELECT 
                (SELECT COUNT(*) FROM menu WHERE category = 'Băuturi și Coctailuri' AND is_active = 1) as total_products,
                (SELECT COUNT(*) FROM menu m 
                 JOIN menu_pdf_products pdfp ON m.id = pdfp.product_id 
                 WHERE m.category = 'Băuturi și Coctailuri' AND pdfp.display_in_pdf = 1) as active_in_pdf
        `, (err, row) => {
            if (err) console.error(err);
            else {
                console.log(`\n📊 STATUS BĂUTURI: ${row.active_in_pdf}/${row.total_products} produse activate.`);
            }
            db.close();
        });
    }, 1000);
});
