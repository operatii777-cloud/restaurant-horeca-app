const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'restaurant.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ DB connection error:', err.message);
        process.exit(1);
    }
});

const type = 'food';
console.log(`📊 Testing for type: ${type}`);

db.all(`
    SELECT * FROM menu_pdf_categories
    WHERE category_type = ?
    ORDER BY order_index ASC
`, [type], (err, categories) => {
    if (err) {
        console.error('❌ Query error:', err.message);
        db.close();
        process.exit(1);
    }

    console.log(`📋 Found ${categories.length} categories for ${type}`);

    if (categories.length === 0) {
        console.log('⚠️ No categories found!');
        db.close();
        process.exit(0);
    }

    const categoriesWithProducts = [];
    let processed = 0;

    categories.forEach(category => {
        db.all(`
            SELECT 
                m.id,
                m.name,
                m.category,
                m.price,
                m.image_url,
                pdfp.display_in_pdf,
                pdfp.custom_image,
                pdfp.custom_order
            FROM menu m
            LEFT JOIN menu_pdf_products pdfp ON m.id = pdfp.product_id
            WHERE m.category = ? AND m.is_active = 1
            ORDER BY COALESCE(pdfp.custom_order, m.display_order, 0) ASC
        `, [category.category_name], (err, products) => {
            if (err) {
                console.error('Eroare produse:', err);
                products = [];
            }

            categoriesWithProducts.push({
                ...category,
                products_count: products.length
            });

            processed++;

            if (processed === categories.length) {
                console.log(`✅ Processed all ${processed} categories`);
                console.log(`Sample category: ${JSON.stringify(categoriesWithProducts[0])}`);
                db.close();
            }
        });
    });
});
