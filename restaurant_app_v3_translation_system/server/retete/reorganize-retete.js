const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '..', 'restaurant.db');
const RETETE_DIR = __dirname;
const RETETE_VECHI_DIR = path.join(RETETE_DIR, 'retete-vechi');
const RETETE_ACTUALE_DIR = path.join(RETETE_DIR, 'retete-actuale');

console.log('🔄 REORGANIZARE REȚETE - Vechi vs. Actuale\n');
console.log('='.repeat(70) + '\n');

// Step 1: Create directories
console.log('[STEP 1] Creare directoare...\n');

if (!fs.existsSync(RETETE_VECHI_DIR)) {
    fs.mkdirSync(RETETE_VECHI_DIR, { recursive: true });
    console.log('✅ Creat director: retete-vechi/');
} else {
    console.log('ℹ️  Director deja există: retete-vechi/');
}

if (!fs.existsSync(RETETE_ACTUALE_DIR)) {
    fs.mkdirSync(RETETE_ACTUALE_DIR, { recursive: true });
    console.log('✅ Creat director: retete-actuale/');
} else {
    console.log('ℹ️  Director deja există: retete-actuale/');
}

// Step 2: Move retete-raw to retete-vechi
console.log('\n' + '='.repeat(70) + '\n');
console.log('[STEP 2] Mutare rețete vechi...\n');

const reteteRawDir = path.join(RETETE_DIR, 'retete-raw');

if (fs.existsSync(reteteRawDir)) {
    const newPath = path.join(RETETE_VECHI_DIR, 'retete-raw');
    
    if (!fs.existsSync(newPath)) {
        fs.renameSync(reteteRawDir, newPath);
        console.log('✅ Mutat: retete-raw/ → retete-vechi/retete-raw/');
    } else {
        console.log('⚠️  Destinația deja există: retete-vechi/retete-raw/');
    }
} else {
    console.log('⚠️  Nu există director retete-raw/');
}

// Step 3: Export current recipes from DB
console.log('\n' + '='.repeat(70) + '\n');
console.log('[STEP 3] Export rețete actuale din baza de date...\n');

const db = new sqlite3.Database(DB_PATH);

db.all(`
    SELECT 
        m.id as product_id,
        m.name as product_name,
        m.category as product_category,
        m.price,
        m.description,
        r.ingredient_id,
        i.name as ingredient_name,
        i.category as ingredient_category,
        i.unit,
        r.quantity_needed,
        r.waste_percentage
    FROM menu m
    INNER JOIN recipes r ON m.id = r.product_id
    INNER JOIN ingredients i ON r.ingredient_id = i.id
    WHERE m.is_sellable = 1
    ORDER BY m.id, r.id
`, (err, rows) => {
    if (err) {
        console.error('❌ Eroare:', err.message);
        db.close();
        return;
    }

    console.log(`📊 Găsite ${rows.length} linii de rețete în DB\n`);

    // Group by product
    const recipesByProduct = {};

    rows.forEach(row => {
        if (!recipesByProduct[row.product_id]) {
            recipesByProduct[row.product_id] = {
                productId: row.product_id,
                productName: row.product_name,
                productCategory: row.product_category,
                price: row.price,
                description: row.description,
                ingredients: []
            };
        }

        recipesByProduct[row.product_id].ingredients.push({
            ingredientId: row.ingredient_id,
            ingredientName: row.ingredient_name,
            ingredientCategory: row.ingredient_category,
            quantityNeeded: row.quantity_needed,
            unit: row.unit,
            wastePercentage: row.waste_percentage || 0
        });
    });

    const productIds = Object.keys(recipesByProduct);
    console.log(`📦 Total produse cu rețete: ${productIds.length}\n`);

    // Save each recipe to a file
    let saved = 0;
    
    productIds.forEach(productId => {
        const recipe = recipesByProduct[productId];
        const fileName = `produs-${productId}-${recipe.productName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')}.json`;
        
        const filePath = path.join(RETETE_ACTUALE_DIR, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(recipe, null, 2), 'utf8');
        saved++;
    });

    console.log(`✅ Salvate ${saved} rețete în retete-actuale/\n`);

    // Step 4: Create summary
    console.log('='.repeat(70) + '\n');
    console.log('[STEP 4] Creare rezumat...\n');

    const summary = {
        timestamp: new Date().toISOString(),
        reteteVechi: {
            directory: 'retete-vechi/retete-raw/',
            source: 'Baza de date veche (pre-rebuild)',
            totalFiles: fs.existsSync(path.join(RETETE_VECHI_DIR, 'retete-raw')) 
                ? fs.readdirSync(path.join(RETETE_VECHI_DIR, 'retete-raw')).filter(f => f.endsWith('.json')).length 
                : 0
        },
        reteteActuale: {
            directory: 'retete-actuale/',
            source: 'Baza de date actuală (post-rebuild)',
            totalFiles: saved,
            totalProducts: productIds.length
        },
        structura: {
            'retete-vechi/': 'Rețete din baza de date înainte de rebuild (335 fișiere)',
            'retete-actuale/': `Rețete din baza de date actuală (${saved} fișiere)`,
            'ingrediente/': 'Ingrediente grupate pe categorii',
            'produse/': 'Produse grupate pe categorii',
            'ambalaje/': 'Rețete ambalaje',
            'analiza/': 'Analize și rapoarte'
        }
    };

    const summaryPath = path.join(RETETE_DIR, 'STRUCTURA-RETETE.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');

    console.log('✅ Salvat rezumat: STRUCTURA-RETETE.json\n');

    // Final report
    console.log('='.repeat(70) + '\n');
    console.log('📋 RAPORT FINAL REORGANIZARE\n');
    console.log('='.repeat(70) + '\n');
    console.log('📁 STRUCTURĂ NOUĂ:\n');
    console.log(`   retete/`);
    console.log(`   ├── retete-vechi/`);
    console.log(`   │   └── retete-raw/ (${summary.reteteVechi.totalFiles} fișiere)`);
    console.log(`   │       └── produs-*.json`);
    console.log(`   ├── retete-actuale/ (${summary.reteteActuale.totalFiles} fișiere)`);
    console.log(`   │   └── produs-*.json`);
    console.log(`   ├── ingrediente/`);
    console.log(`   ├── produse/`);
    console.log(`   ├── ambalaje/`);
    console.log(`   └── analiza/\n`);
    
    console.log('📊 COMPARAȚIE:\n');
    console.log(`   Rețete vechi: ${summary.reteteVechi.totalFiles} fișiere`);
    console.log(`   Rețete actuale: ${summary.reteteActuale.totalFiles} fișiere`);
    console.log(`   Diferență: ${summary.reteteActuale.totalFiles - summary.reteteVechi.totalFiles} fișiere\n`);

    if (summary.reteteActuale.totalFiles < summary.reteteVechi.totalFiles) {
        console.log('⚠️  Atenție: Mai puține rețete în versiunea actuală!\n');
        console.log('   Posibile cauze:');
        console.log('   - Produse duplicate eliminate');
        console.log('   - Băuturi fără rețete (normal)');
        console.log('   - Produse șterse în timpul rebuild-ului\n');
    } else if (summary.reteteActuale.totalFiles > summary.reteteVechi.totalFiles) {
        console.log('✅ Mai multe rețete în versiunea actuală!\n');
    } else {
        console.log('ℹ️  Același număr de rețete în ambele versiuni\n');
    }

    console.log('='.repeat(70) + '\n');
    console.log('✅ REORGANIZARE COMPLETĂ!\n');
    console.log('='.repeat(70) + '\n');

    db.close();
});

