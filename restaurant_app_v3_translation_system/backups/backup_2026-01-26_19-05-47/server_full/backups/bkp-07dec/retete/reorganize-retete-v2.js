const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '..', 'restaurant.db');
const RETETE_DIR = __dirname;
const RETETE_VECHI_DIR = path.join(RETETE_DIR, 'retete-vechi');
const RETETE_ACTUALE_DIR = path.join(RETETE_DIR, 'retete-actuale');

console.log('🔄 REORGANIZARE REȚETE - Vechi vs. Actuale (v2)\n');
console.log('='.repeat(70) + '\n');

// Helper function to copy directory
function copyDirectorySync(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    let fileCount = 0;
    
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            fileCount += copyDirectorySync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            fileCount++;
        }
    }
    
    return fileCount;
}

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

// Step 2: Copy retete-raw to retete-vechi
console.log('\n' + '='.repeat(70) + '\n');
console.log('[STEP 2] Copiere rețete vechi...\n');

const reteteRawDir = path.join(RETETE_DIR, 'retete-raw');

if (fs.existsSync(reteteRawDir)) {
    const newPath = path.join(RETETE_VECHI_DIR, 'retete-raw');
    
    if (!fs.existsSync(newPath)) {
        const copiedCount = copyDirectorySync(reteteRawDir, newPath);
        console.log(`✅ Copiate ${copiedCount} fișiere: retete-raw/ → retete-vechi/retete-raw/`);
        console.log('ℹ️  Directorul original retete-raw/ va rămâne (șterge manual dacă dorești)\n');
    } else {
        const existingFiles = fs.readdirSync(newPath).filter(f => f.endsWith('.json')).length;
        console.log(`ℹ️  Destinația deja există: retete-vechi/retete-raw/ (${existingFiles} fișiere)\n`);
    }
} else {
    console.log('⚠️  Nu există director retete-raw/\n');
}

// Step 3: Export current recipes from DB
console.log('='.repeat(70) + '\n');
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

    const vechiPath = path.join(RETETE_VECHI_DIR, 'retete-raw');
    const vechiCount = fs.existsSync(vechiPath) 
        ? fs.readdirSync(vechiPath).filter(f => f.endsWith('.json')).length 
        : 0;

    const summary = {
        timestamp: new Date().toISOString(),
        reteteVechi: {
            directory: 'retete-vechi/retete-raw/',
            source: 'Baza de date veche (pre-rebuild)',
            totalFiles: vechiCount,
            description: 'Rețete din baza de date înainte de rebuild (20 Oct 2025)'
        },
        reteteActuale: {
            directory: 'retete-actuale/',
            source: 'Baza de date actuală (post-rebuild)',
            totalFiles: saved,
            totalProducts: productIds.length,
            description: 'Rețete din baza de date după rebuild (20 Oct 2025)'
        },
        diferente: {
            totalDiferenta: saved - vechiCount,
            motivePosibile: [
                'Produse duplicate eliminate în rebuild',
                'Băuturi fără rețete (nu necesită)',
                'Produse șterse în timpul curățeniei',
                'Produse noi adăugate'
            ]
        },
        structura: {
            'retete-vechi/retete-raw/': `Rețete vechi (${vechiCount} fișiere)`,
            'retete-actuale/': `Rețete actuale (${saved} fișiere)`,
            'ingrediente/': 'Ingrediente grupate pe categorii',
            'produse/': 'Produse grupate pe categorii',
            'ambalaje/': 'Rețete ambalaje',
            'analiza/': 'Analize și rapoarte'
        }
    };

    const summaryPath = path.join(RETETE_DIR, 'STRUCTURA-RETETE.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');

    console.log('✅ Salvat rezumat: STRUCTURA-RETETE.json\n');

    // Create README
    const readme = `# 📁 STRUCTURĂ DIRECTOR REȚETE

## 📊 Organizare

\`\`\`
retete/
├── retete-vechi/
│   └── retete-raw/          (${vechiCount} fișiere)
│       └── produs-*.json
├── retete-actuale/          (${saved} fișiere)
│   └── produs-*.json
├── ingrediente/
├── produse/
├── ambalaje/
└── analiza/
\`\`\`

## 🔍 Diferențe

### Rețete Vechi
- **Locație:** \`retete-vechi/retete-raw/\`
- **Sursă:** Baza de date înainte de rebuild (20 Oct 2025)
- **Total:** ${vechiCount} fișiere
- **Descriere:** Rețete din versiunea anterioară, înainte de curățenie și rebuild

### Rețete Actuale
- **Locație:** \`retete-actuale/\`
- **Sursă:** Baza de date după rebuild (20 Oct 2025)
- **Total:** ${saved} fișiere (${productIds.length} produse)
- **Descriere:** Rețete curente, după eliminarea duplicatelor și curățenie

### Diferență
- **Total:** ${saved - vechiCount} fișiere ${saved - vechiCount >= 0 ? 'mai multe' : 'mai puține'}

### Motive Posibile pentru Diferențe
${summary.diferente.motivePosibile.map((m, i) => `${i + 1}. ${m}`).join('\n')}

## 📝 Format Fișier Rețetă

\`\`\`json
{
  "productId": 1,
  "productName": "Pizza Margherita",
  "productCategory": "Pizza",
  "price": 25,
  "description": "...",
  "ingredients": [
    {
      "ingredientId": 10,
      "ingredientName": "Mozzarella",
      "ingredientCategory": "Lactate",
      "quantityNeeded": 200,
      "unit": "g",
      "wastePercentage": 0
    }
  ]
}
\`\`\`

## 📅 Data Reorganizare

**${new Date().toLocaleDateString('ro-RO')} ${new Date().toLocaleTimeString('ro-RO')}**

---

Generat automat de \`reorganize-retete-v2.js\`
`;

    const readmePath = path.join(RETETE_DIR, 'README-STRUCTURA.md');
    fs.writeFileSync(readmePath, readme, 'utf8');

    console.log('✅ Salvat README: README-STRUCTURA.md\n');

    // Final report
    console.log('='.repeat(70) + '\n');
    console.log('📋 RAPORT FINAL REORGANIZARE\n');
    console.log('='.repeat(70) + '\n');
    console.log('📁 STRUCTURĂ NOUĂ:\n');
    console.log(`   retete/`);
    console.log(`   ├── retete-vechi/`);
    console.log(`   │   └── retete-raw/ (${vechiCount} fișiere)`);
    console.log(`   ├── retete-actuale/ (${saved} fișiere)`);
    console.log(`   ├── ingrediente/`);
    console.log(`   ├── produse/`);
    console.log(`   ├── ambalaje/`);
    console.log(`   ├── analiza/`);
    console.log(`   ├── STRUCTURA-RETETE.json`);
    console.log(`   └── README-STRUCTURA.md\n`);
    
    console.log('📊 COMPARAȚIE:\n');
    console.log(`   Rețete vechi: ${vechiCount} fișiere`);
    console.log(`   Rețete actuale: ${saved} fișiere`);
    console.log(`   Diferență: ${saved > vechiCount ? '+' : ''}${saved - vechiCount} fișiere\n`);

    if (saved < vechiCount) {
        console.log('ℹ️  Mai puține rețete în versiunea actuală\n');
        console.log('   Cauze normale:');
        console.log(`   - ${vechiCount - saved} produse eliminate (duplicate/fără rețete)\n`);
    } else if (saved > vechiCount) {
        console.log('✅ Mai multe rețete în versiunea actuală!\n');
        console.log(`   + ${saved - vechiCount} rețete noi\n`);
    } else {
        console.log('ℹ️  Același număr de rețete\n');
    }

    console.log('='.repeat(70) + '\n');
    console.log('✅ REORGANIZARE COMPLETĂ!\n');
    console.log('='.repeat(70) + '\n');
    console.log('📝 Note:');
    console.log('   - Directorul original "retete-raw/" poate fi șters manual');
    console.log('   - Vezi README-STRUCTURA.md pentru detalii complete\n');

    db.close();
});

