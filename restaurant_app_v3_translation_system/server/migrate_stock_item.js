
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

async function migrate() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 1. Add is_stock_item column if it doesn't exist
            db.run(`ALTER TABLE ingredients ADD COLUMN is_stock_item BOOLEAN DEFAULT 1`, (err) => {
                if (err) {
                    if (err.message.includes('duplicate column')) {
                        console.log('✅ Column is_stock_item already exists.');
                    } else {
                        console.error('❌ Error adding column:', err.message);
                        // Don't reject, maybe column exists but error message is different
                    }
                } else {
                    console.log('✅ Added is_stock_item column to ingredients.');
                }
            });

            // 2. Update ID 88 (Apă fierbinte)
            const targetId = 88;
            db.run(`
                UPDATE ingredients 
                SET is_stock_item = 0, 
                    cost_per_unit = 0, 
                    min_stock = 0 
                WHERE id = ?
            `, [targetId], function (err) {
                if (err) {
                    console.error('❌ Error updating ID 88:', err.message);
                } else {
                    if (this.changes > 0) {
                        console.log(`✅ Updated ID ${targetId} (Apă fierbinte): is_stock_item=0, cost=0, min_stock=0.`);
                    } else {
                        console.warn(`⚠️ ID ${targetId} not found or no changes made.`);
                    }
                }
            });

            // 3. Update any other potential non-stock items if name matches 'Apă', 'Gheață', 'Sare' (conservative check)
            // For now, only ID 88 is explicitly requested. 

            // Verify
            db.get(`SELECT * FROM ingredients WHERE id = ?`, [targetId], (err, row) => {
                if (err) {
                    console.error(err);
                } else {
                    if (row) {
                        console.log(`🔍 Verification for ID ${targetId}:`, {
                            name: row.name,
                            is_stock_item: row.is_stock_item,
                            cost_per_unit: row.cost_per_unit,
                            min_stock: row.min_stock
                        });
                    }
                }
                resolve();
            });
        });
    });
}

migrate().then(() => {
    console.log('Migration finished.');
    db.close();
}).catch(err => {
    console.error('Migration failed:', err);
    db.close();
});
