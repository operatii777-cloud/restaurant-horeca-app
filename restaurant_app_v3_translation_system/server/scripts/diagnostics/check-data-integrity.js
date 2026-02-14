const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

console.log('--- VERIFICARE INTEGRITATE DATE ---\n');

db.serialize(() => {
    // 1. Verificare INGREDIENTS
    db.get(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN code IS NULL OR code = '' THEN 1 ELSE 0 END) as missing_codes,
            COUNT(DISTINCT code) as unique_codes
        FROM ingredients
    `, (err, row) => {
        if (err) {
            console.error('❌ Eroare la ingredients:', err.message);
        } else {
            console.log('📦 INGREDIENTS (Stoc):');
            console.log(`   Total rânduri: ${row.total}`);
            console.log(`   Fără cod:      ${row.missing_codes}`);
            console.log(`   Coduri unice:  ${row.unique_codes}`);

            if (row.missing_codes === 0 && row.total === row.unique_codes) {
                console.log('   ✅ STATUS: PERFECT (Toate au cod unic)');
            } else if (row.missing_codes > 0) {
                console.log('   ⚠️ STATUS: ATENȚIE (Există ingrediente fără cod)');
            } else {
                console.log('   ⚠️ STATUS: DUPLICATE (Există coduri dublate)');
            }
        }
    });

    // 2. Verificare PRODUCTS (tabelul 'products' folosit la search)
    db.get(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN code IS NULL OR code = '' THEN 1 ELSE 0 END) as missing_codes,
            COUNT(DISTINCT code) as unique_codes
        FROM products
    `, (err, row) => {
        if (err) {
            // E posibil ca tabela products să nu existe în unele variante, dar am confirmat-o anterior
            console.error('❌ Eroare la products:', err.message);
        } else {
            console.log('\n🍔 PRODUCTS (Meniu/Vânzare - tabelul "products"):');
            console.log(`   Total rânduri: ${row.total}`);
            console.log(`   Fără cod:      ${row.missing_codes}`);
            console.log(`   Coduri unice:  ${row.unique_codes}`);

            if (row.missing_codes === 0 && row.total === row.unique_codes) {
                console.log('   ✅ STATUS: PERFECT (Toate au cod unic)');
            } else {
                console.log('   ⚠️ STATUS: PROBLEME (Lipsă coduri sau duplicate)');
            }
        }
    });

    // 3. Verificare MENU (verificăm și tabelul principal de meniu, just in case)
    db.get(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN barcode IS NULL OR barcode = '' THEN 1 ELSE 0 END) as missing_barcodes
        FROM menu
    `, (err, row) => {
        if (!err) {
            console.log('\n📜 MENU (Tabelul principal de meniu):');
            console.log(`   Total rânduri: ${row.total}`);
            console.log(`   Fără barcode:  ${row.missing_barcodes} (Acesta este normal să aibă lipsuri dacă nu s-au scanat toate)`);
        }
        console.log('\n--- VERIFICARE FINALIZATĂ ---');
    });
});
