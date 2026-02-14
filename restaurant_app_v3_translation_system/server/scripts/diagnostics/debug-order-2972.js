const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

const BAR_CATEGORIES = [
    'Cafea/Ciocolată/Ceai', 'Cafea/Ciocolata/Ceai',
    'Răcoritoare', 'Racoritoare',
    'Băuturi și Coctailuri', 'Bauturi si Coctailuri',
    'Vinuri', 'Bere',
    'Băuturi Spirtoase', 'Bauturi Spirtoase',
    'Coctailuri Non-Alcoolice', 'Cocktailuri Non-Alcoolice'
];

async function debugOrder() {
    console.log('--- Debugging Order 2972 ---');
    console.log('Current Date (Local):', new Date().toLocaleDateString());

    db.get("SELECT DATE('now') as dbDate", [], (err, row) => {
        console.log('Database DATE("now"):', row.dbDate);
    });

    db.get("SELECT * FROM orders WHERE id = 2972", [], async (err, order) => {
        if (err) {
            console.error('Error fetching order:', err);
            return;
        }
        if (!order) {
            console.log('Order 2972 not found.');
            return;
        }

        console.log('Order Found:');
        console.log('- Status:', order.status);
        console.log('- Timestamp:', order.timestamp);
        console.log('- DATE(timestamp):', order.timestamp.split(' ')[0]);

        const items = JSON.parse(order.items || '[]');
        console.log('- Items count:', items.length);

        const kitchenItems = items.filter(item => {
            if (!item) return false;
            const category = item.category || item.category_name || '';
            const isBar = BAR_CATEGORIES.some(bc => category.toLowerCase().includes(bc.toLowerCase()));
            console.log(`  - Item: ${item.name}, Category: ${category}, Is Bar: ${isBar}`);
            return !isBar;
        });

        console.log('- Kitchen Items count:', kitchenItems.length);

        if (kitchenItems.length > 0) {
            console.log('✅ Order 2972 SHOULD be shown in KDS based on items.');
        } else {
            console.log('❌ Order 2972 EXCLUDED: No kitchen items found.');
        }

        // Check SQL criteria
        const statusMatch = ['pending', 'preparing', 'confirmed', 'paid', 'Pending:'].includes(order.status);
        console.log('- Status Match:', statusMatch);

        db.get("SELECT id FROM orders WHERE id = 2972 AND DATE(timestamp) = DATE('now')", [], (err, row) => {
            console.log('- SQL Date Match:', !!row);
            db.close();
        });
    });
}

debugOrder();
