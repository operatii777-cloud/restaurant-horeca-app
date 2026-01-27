const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'restaurant.db');

console.log('Testing DB connection...');
console.log('DB Path:', DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
    console.log('Connected to DB');
    
    // Test schema
    db.all('PRAGMA table_info(allergens)', [], (err, rows) => {
        if (err) {
            console.error('ERROR getting schema:', err.message);
        } else {
            console.log('\nSchema allergens:');
            rows.forEach(col => {
                console.log(`  - ${col.name}: ${col.type}`);
            });
            
            const hasCode = rows.some(r => r.name === 'code');
            const hasSortOrder = rows.some(r => r.name === 'sort_order');
            const hasSeverity = rows.some(r => r.name === 'severity');
            
            console.log('\nStatus:');
            console.log(`  - code: ${hasCode ? 'EXISTS' : 'MISSING'}`);
            console.log(`  - sort_order: ${hasSortOrder ? 'EXISTS' : 'MISSING'}`);
            console.log(`  - severity: ${hasSeverity ? 'EXISTS' : 'MISSING'}`);
        }
        
        // Test data
        db.all('SELECT COUNT(*) as count FROM allergens', [], (err, rows) => {
            if (err) {
                console.error('ERROR counting:', err.message);
            } else {
                console.log(`\nTotal allergens: ${rows[0].count}`);
            }
            
            db.close();
        });
    });
});

