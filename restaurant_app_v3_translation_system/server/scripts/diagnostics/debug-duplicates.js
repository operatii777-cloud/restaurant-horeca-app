const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'restaurant.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
});

const categoryName = 'Băuturi și Coctailuri';

console.log(`Checking products in category: ${categoryName}`);

db.all(`SELECT id, name, category, is_active FROM menu WHERE category = ? ORDER BY name`, [categoryName], (err, rows) => {
    if (err) {
        console.error('Error querying menu:', err);
        return;
    }
    console.log(`Total products in menu table for category: ${rows.length}`);

    const nameCounts = {};
    rows.forEach(r => {
        nameCounts[r.name] = (nameCounts[r.name] || 0) + 1;
    });

    const duplicates = Object.entries(nameCounts).filter(([name, count]) => count > 1);

    if (duplicates.length > 0) {
        console.log('Duplicates found in menu table (name based):');
        duplicates.forEach(([name, count]) => {
            console.log(`  "${name}": ${count} times`);
            // Show details for these duplicates
            const details = rows.filter(r => r.name === name);
            console.log('    Details:', JSON.stringify(details));
        });
    } else {
        console.log('No duplicates found in menu table based on name.');
    }

    // Now check menu_pdf_products for duplicates
    // Using left join as in the controller to diagnose the specific issue reported
    checkJoinQuery(rows.map(r => r.id));
});

function checkJoinQuery(productIds) {
    if (productIds.length === 0) return;

    db.all(`
        SELECT m.id, m.name, COUNT(pdfp.id) as pdf_entries_count
        FROM menu m
        LEFT JOIN menu_pdf_products pdfp ON m.id = pdfp.product_id
        WHERE m.category = ?
        GROUP BY m.id
        HAVING COUNT(pdfp.id) > 1
    `, [categoryName], (err, rows) => {
        if (err) {
            console.error('Error checking join duplicates:', err);
            return;
        }

        if (rows.length > 0) {
            console.log('\nDuplicates found via JOIN (multiple entries in menu_pdf_products for same product):');
            rows.forEach(row => {
                console.log(`  Product "${row.name}" (ID: ${row.id}) has ${row.pdf_entries_count} entries in menu_pdf_products`);
            });
        } else {
            console.log('\nNo duplicates caused by JOIN with menu_pdf_products.');
        }
        db.close();
    });
}
