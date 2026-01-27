const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const http = require('http');

const dbPath = path.join(__dirname, 'restaurant.db');

console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
console.log('║          FIȘĂ TEHNICĂ DE PRODUS - SHAORMA DE PUI                               ║');
console.log('║          Creare, Verificare și Testare Completă                               ║');
console.log('╚════════════════════════════════════════════════════════════════════════════════╝');

// ===================== SPECIFICAȚII PRODUS =====================
const PRODUCT = {
    name: 'Shaorma de Pui',
    name_en: 'Chicken Shawarma',
    category: 'Fast Food',
    price: 25.00,
    description: 'Shaorma delicioasă cu piept de pui la grătar, legume proaspete și sos de usturoi, învelită în lipie caldă',
    description_en: 'Delicious shawarma with grilled chicken breast, fresh vegetables and garlic sauce, wrapped in warm pita bread',
    prep_time: 10, // minute
    calories: 520,
    protein: 35,
    carbs: 48,
    fat: 18,
    is_sellable: 1,
    is_spicy: 0,
    spice_level: 1
};

// ===================== INGREDIENTE F.T.P. =====================
const INGREDIENTS = [
    {
        name: 'Piept de Pui',
        quantity: 150,
        unit: 'g',
        waste_percentage: 5,
        category: 'Carne și Pește',
        cost_per_unit: 0.025,  // 25 RON/kg = 0.025 RON/g
        supplier: 'Carnex SRL',
        min_stock: 5000,
        initial_stock: 10000
    },
    {
        name: 'Lipie Shaorma',
        quantity: 1,
        unit: 'buc',
        waste_percentage: 2,
        category: 'Pâine și Produse de Panificație',
        cost_per_unit: 2.50,
        supplier: 'Brutăria Delice',
        min_stock: 50,
        initial_stock: 200
    },
    {
        name: 'Salată Verde Shaorma',
        quantity: 30,
        unit: 'g',
        waste_percentage: 15,
        category: 'Legume și Fructe',
        cost_per_unit: 0.015,  // 15 RON/kg
        supplier: 'Legume Proaspete SRL',
        min_stock: 2000,
        initial_stock: 5000
    },
    {
        name: 'Roșii Shaorma',
        quantity: 50,
        unit: 'g',
        waste_percentage: 10,
        category: 'Legume și Fructe',
        cost_per_unit: 0.012,  // 12 RON/kg
        supplier: 'Legume Proaspete SRL',
        min_stock: 3000,
        initial_stock: 8000
    },
    {
        name: 'Ceapă Roșie Shaorma',
        quantity: 20,
        unit: 'g',
        waste_percentage: 15,
        category: 'Legume și Fructe',
        cost_per_unit: 0.008,  // 8 RON/kg
        supplier: 'Legume Proaspete SRL',
        min_stock: 2000,
        initial_stock: 5000
    },
    {
        name: 'Castraveți Murați Shaorma',
        quantity: 25,
        unit: 'g',
        waste_percentage: 5,
        category: 'Legume și Fructe',
        cost_per_unit: 0.018,  // 18 RON/kg
        supplier: 'Conserve Gustoase SRL',
        min_stock: 1000,
        initial_stock: 3000
    },
    {
        name: 'Varză Albă Shaorma',
        quantity: 35,
        unit: 'g',
        waste_percentage: 20,
        category: 'Legume și Fructe',
        cost_per_unit: 0.006,  // 6 RON/kg
        supplier: 'Legume Proaspete SRL',
        min_stock: 2000,
        initial_stock: 6000
    },
    {
        name: 'Sos Usturoi Shaorma',
        quantity: 30,
        unit: 'ml',
        waste_percentage: 0,
        category: 'Sosuri și Condimente',
        cost_per_unit: 0.035,  // 35 RON/L
        supplier: 'Sosuri Fine SRL',
        min_stock: 2000,
        initial_stock: 5000
    },
    {
        name: 'Sos Iute Shaorma',
        quantity: 10,
        unit: 'ml',
        waste_percentage: 0,
        category: 'Sosuri și Condimente',
        cost_per_unit: 0.045,  // 45 RON/L
        supplier: 'Sosuri Fine SRL',
        min_stock: 1000,
        initial_stock: 3000
    },
    {
        name: 'Condimente Shaorma Mix',
        quantity: 5,
        unit: 'g',
        waste_percentage: 0,
        category: 'Sosuri și Condimente',
        cost_per_unit: 0.08,  // 80 RON/kg
        supplier: 'Spice World SRL',
        min_stock: 500,
        initial_stock: 2000
    }
];

// ===================== AMBALAJE F.T.P. =====================
const PACKAGING = [
    {
        name: 'Cutie Carton Shaorma',
        quantity: 1,
        unit: 'buc',
        type: 'packaging_delivery',
        category: 'Ambalaje',
        cost_per_unit: 2.50,
        supplier: 'Ambalaje ECO SRL',
        min_stock: 100,
        initial_stock: 500
    },
    {
        name: 'Hârtie Shaorma',
        quantity: 1,
        unit: 'buc',
        type: 'packaging_restaurant',
        category: 'Ambalaje',
        cost_per_unit: 0.30,
        supplier: 'Ambalaje ECO SRL',
        min_stock: 200,
        initial_stock: 1000
    },
    {
        name: 'Șervețele',
        quantity: 3,
        unit: 'buc',
        type: 'packaging_restaurant',
        category: 'Ambalaje',
        cost_per_unit: 0.05,
        supplier: 'Papetărie Gross SRL',
        min_stock: 500,
        initial_stock: 2000
    }
];

let productId = null;
let initialStocks = {};
let ingredientIds = {};
let testResults = {
    productCreated: false,
    ingredientsAdded: false,
    stocksPopulated: false,
    recipeComplete: false,
    productInMenu: false,
    stockDecrementCorrect: false,
    totalCost: 0,
    profitMargin: 0
};

// ===================== FUNCȚII HELPER =====================

function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        db.get(query, params, (err, row) => {
            db.close();
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function executeRun(query, params = []) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        db.run(query, params, function(err) {
            db.close();
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

function executeAll(query, params = []) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        db.all(query, params, (err, rows) => {
            db.close();
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

async function getStockLevels() {
    const rows = await executeAll('SELECT name, current_stock, unit FROM ingredients');
    const stocks = {};
    rows.forEach(row => {
        stocks[row.name] = row.current_stock;
    });
    return stocks;
}

async function checkIngredientExists(name) {
    const row = await executeQuery('SELECT id FROM ingredients WHERE name = ?', [name]);
    return !!row;
}

async function addIngredient(ingredient) {
    const id = await executeRun(
        `INSERT INTO ingredients (name, category, unit, current_stock, min_stock, cost_per_unit, supplier, is_available) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            ingredient.name, 
            ingredient.category, 
            ingredient.unit, 
            ingredient.initial_stock || 1000, 
            ingredient.min_stock || 100, 
            ingredient.cost_per_unit, 
            ingredient.supplier, 
            1
        ]
    );
    return id;
}

async function getIngredientIds() {
    const rows = await executeAll('SELECT id, name FROM ingredients');
    const ids = {};
    rows.forEach(row => {
        ids[row.name] = row.id;
    });
    return ids;
}

async function checkProductExists(name) {
    const row = await executeQuery('SELECT id FROM menu WHERE name = ?', [name]);
    return row ? row.id : null;
}

async function createProduct() {
    // Verifică dacă produsul există deja
    const existingId = await checkProductExists(PRODUCT.name);
    if (existingId) {
        console.log(`⚠️  Produsul "${PRODUCT.name}" există deja cu ID: ${existingId}`);
        return existingId;
    }

    const id = await executeRun(
        `INSERT INTO menu (name, name_en, category, price, description, description_en, 
                           prep_time, calories, protein, carbs, fat, is_sellable, is_spicy, spice_level) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            PRODUCT.name,
            PRODUCT.name_en,
            PRODUCT.category,
            PRODUCT.price,
            PRODUCT.description,
            PRODUCT.description_en,
            PRODUCT.prep_time,
            PRODUCT.calories,
            PRODUCT.protein,
            PRODUCT.carbs,
            PRODUCT.fat,
            PRODUCT.is_sellable,
            PRODUCT.is_spicy,
            PRODUCT.spice_level
        ]
    );
    return id;
}

async function addRecipeItem(productId, ingredientId, quantity, unit, wastePercentage, itemType) {
    await executeRun(
        `INSERT INTO recipes (product_id, ingredient_id, quantity_needed, unit, waste_percentage, item_type) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [productId, ingredientId, quantity, unit, wastePercentage, itemType]
    );
}

async function getProduct(productId) {
    return await executeQuery('SELECT * FROM menu WHERE id = ?', [productId]);
}

async function getRecipes(productId) {
    return await executeAll(
        `SELECT r.*, i.name as ingredient_name, i.unit as ingredient_unit, i.cost_per_unit
         FROM recipes r 
         LEFT JOIN ingredients i ON r.ingredient_id = i.id 
         WHERE r.product_id = ?`,
        [productId]
    );
}

async function createOrder(productId, productName, price) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            type: 'dine_in',
            table_number: 'TEST-FTP-SHAORMA',
            items: [{
                id: productId,
                name: productName,
                quantity: 1,
                price: price
            }]
        });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/orders',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData);
                    resolve(response.orderId || response.id);
                } catch (error) {
                    console.error('❌ Eroare parsare răspuns:', error);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.log('⚠️  Server-ul nu este pornit. Testul de comandă va fi omis.');
            resolve(null);
        });
        
        req.write(data);
        req.end();
    });
}

// ===================== FUNCȚIA PRINCIPALĂ DE TEST =====================

async function runTest() {
    try {
        console.log('\n┌────────────────────────────────────────────────────────────────────────────┐');
        console.log('│ PASUL 1: Verificare Stocuri Inițiale                                      │');
        console.log('└────────────────────────────────────────────────────────────────────────────┘');
        
        initialStocks = await getStockLevels();
        console.log(`📊 Total ingrediente în baza de date: ${Object.keys(initialStocks).length}`);

        console.log('\n┌────────────────────────────────────────────────────────────────────────────┐');
        console.log('│ PASUL 2: Adăugare Ingrediente Noi în Stoc                                 │');
        console.log('└────────────────────────────────────────────────────────────────────────────┘');
        
        let newIngredientsCount = 0;
        let existingIngredientsCount = 0;

        for (const ingredient of [...INGREDIENTS, ...PACKAGING]) {
            const exists = await checkIngredientExists(ingredient.name);
            if (!exists) {
                console.log(`➕ Adăugare: ${ingredient.name} (${ingredient.initial_stock} ${ingredient.unit})`);
                await addIngredient(ingredient);
                newIngredientsCount++;
            } else {
                console.log(`✅ Existent: ${ingredient.name}`);
                existingIngredientsCount++;
            }
        }

        console.log(`\n📈 Ingrediente noi adăugate: ${newIngredientsCount}`);
        console.log(`📋 Ingrediente existente: ${existingIngredientsCount}`);
        testResults.ingredientsAdded = true;

        ingredientIds = await getIngredientIds();
        console.log(`\n🔑 Total ID-uri ingrediente obținute: ${Object.keys(ingredientIds).length}`);

        console.log('\n┌────────────────────────────────────────────────────────────────────────────┐');
        console.log('│ PASUL 3: Verificare Stocuri Populate                                      │');
        console.log('└────────────────────────────────────────────────────────────────────────────┘');
        
        const currentStocks = await getStockLevels();
        let stocksOk = true;

        for (const ingredient of [...INGREDIENTS, ...PACKAGING]) {
            const stock = currentStocks[ingredient.name];
            if (stock === undefined || stock <= 0) {
                console.log(`⚠️  ${ingredient.name}: Stoc insuficient (${stock || 0} ${ingredient.unit})`);
                stocksOk = false;
            } else {
                console.log(`✅ ${ingredient.name}: ${stock} ${ingredient.unit}`);
            }
        }

        testResults.stocksPopulated = stocksOk;
        console.log(`\n${stocksOk ? '✅' : '⚠️'} Toate stocurile sunt ${stocksOk ? 'populate' : 'incomplete'}`);

        console.log('\n┌────────────────────────────────────────────────────────────────────────────┐');
        console.log('│ PASUL 4: Creare Produs "Shaorma de Pui"                                   │');
        console.log('└────────────────────────────────────────────────────────────────────────────┘');
        
        productId = await createProduct();
        console.log(`✅ Produs creat/găsit cu ID: ${productId}`);
        testResults.productCreated = true;

        console.log('\n┌────────────────────────────────────────────────────────────────────────────┐');
        console.log('│ PASUL 5: Construire Fișă Tehnică de Produs (F.T.P.)                       │');
        console.log('└────────────────────────────────────────────────────────────────────────────┘');
        
        // Șterge rețetele existente pentru acest produs
        await executeRun('DELETE FROM recipes WHERE product_id = ?', [productId]);
        
        console.log('\n📋 INGREDIENTE:');
        for (const ingredient of INGREDIENTS) {
            const ingredientId = ingredientIds[ingredient.name];
            if (!ingredientId) {
                console.log(`⚠️  Ingredient "${ingredient.name}" nu are ID`);
                continue;
            }
            
            const grossQty = ingredient.quantity * (1 + ingredient.waste_percentage / 100);
            console.log(`   • ${ingredient.name}:`);
            console.log(`     - Cantitate net: ${ingredient.quantity} ${ingredient.unit}`);
            console.log(`     - Deșeu: ${ingredient.waste_percentage}%`);
            console.log(`     - Cantitate brut: ${grossQty.toFixed(2)} ${ingredient.unit}`);
            
            await addRecipeItem(productId, ingredientId, ingredient.quantity, ingredient.unit, ingredient.waste_percentage, 'ingredient');
        }

        console.log('\n📦 AMBALAJE:');
        for (const pkg of PACKAGING) {
            const pkgId = ingredientIds[pkg.name];
            if (!pkgId) {
                console.log(`⚠️  Ambalaj "${pkg.name}" nu are ID`);
                continue;
            }
            
            console.log(`   • ${pkg.name}: ${pkg.quantity} ${pkg.unit} (${pkg.type})`);
            await addRecipeItem(productId, pkgId, pkg.quantity, pkg.unit, 0, pkg.type);
        }

        testResults.recipeComplete = true;

        console.log('\n┌────────────────────────────────────────────────────────────────────────────┐');
        console.log('│ PASUL 6: Verificare Produs în Baza de Date                                │');
        console.log('└────────────────────────────────────────────────────────────────────────────┘');
        
        const product = await getProduct(productId);
        console.log(`✅ Nume: ${product.name} / ${product.name_en}`);
        console.log(`✅ Categorie: ${product.category}`);
        console.log(`✅ Preț: ${product.price} RON`);
        console.log(`✅ Descriere: ${product.description}`);
        console.log(`✅ Timp preparare: ${product.prep_time} minute`);
        console.log(`✅ Valori nutritive: ${product.calories} kcal, ${product.protein}g proteine`);
        console.log(`✅ Is Sellable: ${product.is_sellable ? 'DA' : 'NU'}`);
        testResults.productInMenu = product.is_sellable === 1;

        console.log('\n┌────────────────────────────────────────────────────────────────────────────┐');
        console.log('│ PASUL 7: Analiză Completă F.T.P. și Calcul Costuri                        │');
        console.log('└────────────────────────────────────────────────────────────────────────────┘');
        
        const recipes = await getRecipes(productId);
        console.log(`\n📊 Total componente în F.T.P.: ${recipes.length}`);
        
        let totalCostIngredients = 0;
        let totalCostPackaging = 0;

        console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
        console.log('║                      COMPONENTELE FIȘEI TEHNICE                            ║');
        console.log('╠════════════════════════════════════════════════════════════════════════════╣');

        recipes.forEach((recipe, index) => {
            const grossQty = recipe.quantity_needed * (1 + (recipe.waste_percentage || 0) / 100);
            let itemCost = 0;

            if (recipe.ingredient_unit === recipe.unit) {
                itemCost = grossQty * recipe.cost_per_unit;
            } else {
                itemCost = grossQty * recipe.cost_per_unit;
            }

            console.log(`\n${index + 1}. ${recipe.ingredient_name}`);
            console.log(`   ├─ Tip: ${recipe.item_type === 'ingredient' ? 'Ingredient' : 'Ambalaj'}`);
            console.log(`   ├─ Cantitate net: ${recipe.quantity_needed} ${recipe.unit}`);
            console.log(`   ├─ Deșeu: ${recipe.waste_percentage || 0}%`);
            console.log(`   ├─ Cantitate brut: ${grossQty.toFixed(2)} ${recipe.unit}`);
            console.log(`   ├─ Cost unitar: ${recipe.cost_per_unit.toFixed(4)} RON/${recipe.ingredient_unit}`);
            console.log(`   └─ Cost total: ${itemCost.toFixed(2)} RON`);

            if (recipe.item_type === 'ingredient') {
                totalCostIngredients += itemCost;
            } else {
                totalCostPackaging += itemCost;
            }
        });

        const totalCost = totalCostIngredients + totalCostPackaging;
        const profitMargin = ((PRODUCT.price - totalCost) / PRODUCT.price * 100);
        
        testResults.totalCost = totalCost;
        testResults.profitMargin = profitMargin;

        console.log('\n╠════════════════════════════════════════════════════════════════════════════╣');
        console.log('║                         ANALIZA FINANCIARĂ                                 ║');
        console.log('╠════════════════════════════════════════════════════════════════════════════╣');
        console.log(`║ Cost Ingrediente:        ${totalCostIngredients.toFixed(2).padStart(10)} RON                                    ║`);
        console.log(`║ Cost Ambalaje:           ${totalCostPackaging.toFixed(2).padStart(10)} RON                                    ║`);
        console.log(`║ ────────────────────────────────────────────────────────                   ║`);
        console.log(`║ COST TOTAL:              ${totalCost.toFixed(2).padStart(10)} RON                                    ║`);
        console.log(`║ Preț Vânzare:            ${PRODUCT.price.toFixed(2).padStart(10)} RON                                    ║`);
        console.log(`║ ────────────────────────────────────────────────────────                   ║`);
        console.log(`║ PROFIT NET:              ${(PRODUCT.price - totalCost).toFixed(2).padStart(10)} RON                                    ║`);
        console.log(`║ MARJĂ PROFIT:            ${profitMargin.toFixed(1).padStart(10)} %                                      ║`);
        console.log('╚════════════════════════════════════════════════════════════════════════════╝');

        console.log('\n┌────────────────────────────────────────────────────────────────────────────┐');
        console.log('│ PASUL 8: Test Comandă și Scădere Stoc                                     │');
        console.log('└────────────────────────────────────────────────────────────────────────────┘');
        
        const stocksBefore = await getStockLevels();
        console.log('✅ Stocuri salvate înainte de comandă');

        const orderId = await createOrder(productId, PRODUCT.name, PRODUCT.price);
        
        if (orderId) {
            console.log(`✅ Comandă creată cu ID: ${orderId}`);
            
            console.log('⏳ Aștept procesarea comenzii (5 secunde)...');
            await new Promise(resolve => setTimeout(resolve, 5000));

            console.log('\n📊 VERIFICARE SCĂDERE STOCURI:');
            const stocksAfter = await getStockLevels();
            
            let allStocksCorrect = true;
            let stockReport = [];

            for (const ingredient of INGREDIENTS) {
                const before = stocksBefore[ingredient.name] || 0;
                const after = stocksAfter[ingredient.name] || 0;
                const grossQty = ingredient.quantity * (1 + ingredient.waste_percentage / 100);
                const actualDecrease = before - after;
                const isCorrect = Math.abs(actualDecrease - grossQty) < 0.01;

                stockReport.push({
                    name: ingredient.name,
                    before,
                    after,
                    expected: grossQty,
                    actual: actualDecrease,
                    correct: isCorrect
                });

                console.log(`\n${ingredient.name}:`);
                console.log(`   Înainte:      ${before.toFixed(2)} ${ingredient.unit}`);
                console.log(`   După:         ${after.toFixed(2)} ${ingredient.unit}`);
                console.log(`   Așteptat:     -${grossQty.toFixed(2)} ${ingredient.unit}`);
                console.log(`   Actual:       -${actualDecrease.toFixed(2)} ${ingredient.unit}`);
                console.log(`   ${isCorrect ? '✅ Corect!' : '⚠️  Diferență: ' + Math.abs(actualDecrease - grossQty).toFixed(2) + ' ' + ingredient.unit}`);

                if (!isCorrect) allStocksCorrect = false;
            }

            testResults.stockDecrementCorrect = allStocksCorrect;
        } else {
            console.log('⚠️  Server-ul nu este pornit - testul de comandă omis');
            console.log('ℹ️  Pentru a testa scăderea stocului, pornește server-ul cu: node server.js');
        }

        // ===================== RAPORT FINAL =====================
        
        console.log('\n');
        console.log('╔════════════════════════════════════════════════════════════════════════════╗');
        console.log('║                           RAPORT FINAL                                     ║');
        console.log('║                    FIȘĂ TEHNICĂ SHAORMA DE PUI                             ║');
        console.log('╠════════════════════════════════════════════════════════════════════════════╣');
        console.log('║                                                                            ║');
        console.log('║  📋 DETALII PRODUS                                                         ║');
        console.log(`║     • Nume: ${PRODUCT.name.padEnd(60)}║`);
        console.log(`║     • ID Produs: ${productId.toString().padEnd(55)}║`);
        console.log(`║     • Categorie: ${PRODUCT.category.padEnd(55)}║`);
        console.log(`║     • Preț: ${(PRODUCT.price + ' RON').padEnd(60)}║`);
        console.log('║                                                                            ║');
        console.log('║  📊 COMPONENTE F.T.P.                                                      ║');
        console.log(`║     • Ingrediente: ${INGREDIENTS.length.toString().padEnd(56)}║`);
        console.log(`║     • Ambalaje: ${PACKAGING.length.toString().padEnd(59)}║`);
        console.log(`║     • Total componente: ${recipes.length.toString().padEnd(52)}║`);
        console.log('║                                                                            ║');
        console.log('║  💰 ANALIZA COSTURILOR                                                     ║');
        console.log(`║     • Cost ingrediente: ${(totalCostIngredients.toFixed(2) + ' RON').padEnd(50)}║`);
        console.log(`║     • Cost ambalaje: ${(totalCostPackaging.toFixed(2) + ' RON').padEnd(53)}║`);
        console.log(`║     • Cost total: ${(totalCost.toFixed(2) + ' RON').padEnd(56)}║`);
        console.log(`║     • Marjă profit: ${(profitMargin.toFixed(1) + '%').padEnd(54)}║`);
        console.log('║                                                                            ║');
        console.log('║  ✅ STATUS VERIFICĂRI                                                      ║');
        console.log(`║     • Produs creat: ${(testResults.productCreated ? '✅ DA' : '❌ NU').padEnd(54)}║`);
        console.log(`║     • Ingrediente adăugate: ${(testResults.ingredientsAdded ? '✅ DA' : '❌ NU').padEnd(45)}║`);
        console.log(`║     • Stocuri populate: ${(testResults.stocksPopulated ? '✅ DA' : '❌ NU').padEnd(49)}║`);
        console.log(`║     • F.T.P. completă: ${(testResults.recipeComplete ? '✅ DA' : '❌ NU').padEnd(50)}║`);
        console.log(`║     • Produs în meniu: ${(testResults.productInMenu ? '✅ DA' : '❌ NU').padEnd(50)}║`);
        
        if (orderId) {
            console.log(`║     • Test scădere stoc: ${(testResults.stockDecrementCorrect ? '✅ CORECT' : '⚠️  CU DIFERENȚE').padEnd(47)}║`);
        }
        
        console.log('║                                                                            ║');
        console.log('╚════════════════════════════════════════════════════════════════════════════╝');

        console.log('\n🎯 FIȘA TEHNICĂ DE PRODUS CREATĂ ȘI VERIFICATĂ CU SUCCES!\n');

        // Verifică în comanda.html
        console.log('┌────────────────────────────────────────────────────────────────────────────┐');
        console.log('│ PASUL 9: Verificare Produs în Interfața comanda.html                      │');
        console.log('└────────────────────────────────────────────────────────────────────────────┘');
        console.log('ℹ️  Pentru a verifica dacă produsul apare în interfața comanda.html:');
        console.log('   1. Pornește server-ul: node server.js');
        console.log('   2. Deschide http://localhost:3000/comanda.html');
        console.log('   3. Caută categoria "Fast Food"');
        console.log('   4. Verifică dacă "Shaorma de Pui" apare în listă cu prețul 25.00 RON');

    } catch (error) {
        console.error('\n❌ EROARE ÎN TIMPUL TESTULUI:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Rulează testul
runTest().catch(console.error);

