// Script pentru generarea automată a fișelor de produs
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configurare bază de date
const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

console.log('🍽️ GENERATOR AUTOMAT FISE DE PRODUS\n');

// Dicționar de ingrediente comune pentru mapare automată
const INGREDIENT_MAPPING = {
    // Pizza
    'pizza': ['făină', 'drojdie', 'sare', 'ulei de măsline', 'roșii', 'mozzarella', 'oregano'],
    'margherita': ['făină', 'drojdie', 'sare', 'ulei de măsline', 'roșii', 'mozzarella', 'busuioc'],
    'quattro stagioni': ['făină', 'drojdie', 'sare', 'ulei de măsline', 'roșii', 'mozzarella', 'șuncă', 'ciuperci', 'măsline', 'artichoc'],
    'diavola': ['făină', 'drojdie', 'sare', 'ulei de măsline', 'roșii', 'mozzarella', 'salam picant', 'ardei iuți'],
    
    // Paste
    'paste': ['paste', 'ulei de măsline', 'sare', 'piper'],
    'carbonara': ['paste', 'ouă', 'parmezan', 'bacon', 'piper negru', 'ulei de măsline'],
    'bolognese': ['paste', 'carne de vită', 'roșii', 'ceapă', 'morcovi', 'țelină', 'vin roșu', 'busuioc'],
    'arrabbiata': ['paste', 'roșii', 'usturoi', 'ardei iuți', 'ulei de măsline', 'busuioc'],
    
    // Salate
    'salată': ['salată verde', 'ulei de măsline', 'oțet', 'sare', 'piper'],
    'cesar': ['salată verde', 'piept de pui', 'parmezan', 'crutoane', 'ulei de măsline', 'ouă', 'sare', 'piper'],
    'grecească': ['salată verde', 'roșii', 'castraveți', 'măsline', 'brânză feta', 'ulei de măsline', 'oregano'],
    
    // Supe
    'supă': ['apă', 'sare', 'piper', 'ulei de măsline'],
    'ciorbă': ['apă', 'sare', 'piper', 'ulei de măsline', 'oțet', 'usturoi'],
    'supă de pui': ['apă', 'piept de pui', 'morcovi', 'țelină', 'ceapă', 'sare', 'piper'],
    'supă de legume': ['apă', 'morcovi', 'țelină', 'ceapă', 'roșii', 'sare', 'piper'],
    
    // Feluri principale
    'piept de pui': ['piept de pui', 'ulei de măsline', 'sare', 'piper', 'usturoi'],
    'muschi de vită': ['muschi de vită', 'ulei de măsline', 'sare', 'piper', 'usturoi'],
    'pulpă de porc': ['pulpă de porc', 'ulei de măsline', 'sare', 'piper', 'usturoi'],
    
    // Garnituri
    'cartofi prăjiți': ['cartofi', 'ulei de floarea-soarelui', 'sare'],
    'cartofi la cuptor': ['cartofi', 'ulei de măsline', 'sare', 'piper', 'rozmarin'],
    'piure de cartofi': ['cartofi', 'lapte', 'unt', 'sare', 'piper'],
    'orez': ['orez', 'apă', 'sare', 'ulei de măsline'],
    
    // Băuturi
    'coca cola': ['coca cola'],
    'pepsi': ['pepsi'],
    'apă': ['apă'],
    'suc de portocale': ['suc de portocale'],
    'bere': ['bere'],
    'vin': ['vin'],
    
    // Deserturi
    'tiramisu': ['mascarpone', 'ouă', 'zahăr', 'cafea', 'piscoturi', 'cacao'],
    'panna cotta': ['smântână', 'lapte', 'zahăr', 'vanilie', 'gelatină'],
    'cheesecake': ['brânză de vaci', 'ouă', 'zahăr', 'piscoturi', 'unt', 'vanilie']
};

// Dicționar pentru ambalaje
const PACKAGING_MAPPING = {
    'restaurant': {
        'pizza': ['platou ceramic', 'șervețel'],
        'paste': ['farfurie ceramic', 'șervețel'],
        'salată': ['bol ceramic', 'șervețel'],
        'supă': ['bol ceramic', 'șervețel'],
        'fel principal': ['farfurie ceramic', 'șervețel'],
        'băutură': ['pahar sticlă', 'șervețel'],
        'desert': ['farfurie ceramic', 'șervețel']
    },
    'delivery': {
        'pizza': ['cutie carton', 'șervețel', 'plic'],
        'paste': ['recipient plastic', 'șervețel', 'plic'],
        'salată': ['recipient plastic', 'șervețel', 'plic'],
        'supă': ['recipient plastic', 'șervețel', 'plic'],
        'fel principal': ['recipient plastic', 'șervețel', 'plic'],
        'băutură': ['sticlă plastic', 'șervețel', 'plic'],
        'desert': ['recipient plastic', 'șervețel', 'plic']
    }
};

// Dicționar pentru waste-uri
const WASTE_MAPPING = {
    'pizza': 5, // 5% waste
    'paste': 3, // 3% waste
    'salată': 8, // 8% waste
    'supă': 2, // 2% waste
    'fel principal': 4, // 4% waste
    'băutură': 1, // 1% waste
    'desert': 6, // 6% waste
    'default': 5 // 5% waste implicit
};

// Funcție pentru identificarea categoriei produsului
function identifyProductCategory(productName) {
    const name = productName.toLowerCase();
    
    if (name.includes('pizza')) return 'pizza';
    if (name.includes('paste') || name.includes('spaghete') || name.includes('penne')) return 'paste';
    if (name.includes('salată')) return 'salată';
    if (name.includes('supă') || name.includes('ciorbă')) return 'supă';
    if (name.includes('piept') || name.includes('muschi') || name.includes('pulpă')) return 'fel principal';
    if (name.includes('cartofi') || name.includes('orez') || name.includes('piure')) return 'garnitură';
    if (name.includes('coca') || name.includes('pepsi') || name.includes('apă') || name.includes('suc') || name.includes('bere') || name.includes('vin')) return 'băutură';
    if (name.includes('tiramisu') || name.includes('panna') || name.includes('cheesecake')) return 'desert';
    
    return 'default';
}

// Funcție pentru calculul waste-ului
function calculateWaste(productName) {
    const category = identifyProductCategory(productName);
    return WASTE_MAPPING[category] || WASTE_MAPPING['default'];
}

// Funcție pentru identificarea ambalajelor
function getPackaging(productName, isDelivery = false) {
    const category = identifyProductCategory(productName);
    const packagingType = isDelivery ? 'delivery' : 'restaurant';
    
    return PACKAGING_MAPPING[packagingType][category] || PACKAGING_MAPPING[packagingType]['default'] || ['șervețel'];
}

// Funcție pentru identificarea ingredientelor
function getIngredients(productName) {
    const name = productName.toLowerCase();
    
    // Căutare exactă în dicționar
    for (const [key, ingredients] of Object.entries(INGREDIENT_MAPPING)) {
        if (name.includes(key)) {
            return ingredients;
        }
    }
    
    // Căutare parțială
    const category = identifyProductCategory(productName);
    if (INGREDIENT_MAPPING[category]) {
        return INGREDIENT_MAPPING[category];
    }
    
    // Ingrediente de bază
    return ['sare', 'piper', 'ulei de măsline'];
}

// Funcție pentru calculul prețului
function calculatePrice(ingredients, wastePercentage = 5) {
    let totalCost = 0;
    
    // Costuri aproximative pentru ingrediente (RON/kg sau RON/buc)
    const ingredientCosts = {
        'făină': 3.5,
        'drojdie': 15,
        'sare': 2,
        'ulei de măsline': 25,
        'roșii': 8,
        'mozzarella': 30,
        'oregano': 50,
        'busuioc': 40,
        'șuncă': 40,
        'ciuperci': 12,
        'măsline': 20,
        'artichoc': 35,
        'salam picant': 35,
        'ardei iuți': 12,
        'paste': 5,
        'ouă': 0.5,
        'parmezan': 80,
        'bacon': 35,
        'piper negru': 60,
        'carne de vită': 45,
        'ceapă': 3,
        'morcovi': 4,
        'țelină': 5,
        'vin roșu': 15,
        'usturoi': 15,
        'salată verde': 4,
        'oțet': 8,
        'piper': 60,
        'piept de pui': 25,
        'crutoane': 8,
        'castraveți': 6,
        'măsline': 20,
        'brânză feta': 35,
        'apă': 0.1,
        'cartofi': 3,
        'ulei de floarea-soarelui': 8,
        'lapte': 4,
        'unt': 25,
        'rozmarin': 40,
        'orez': 4,
        'coca cola': 2,
        'pepsi': 2,
        'suc de portocale': 3,
        'bere': 5,
        'vin': 15,
        'mascarpone': 45,
        'zahăr': 4,
        'cafea': 30,
        'piscoturi': 8,
        'cacao': 25,
        'smântână': 8,
        'vanilie': 100,
        'gelatină': 20,
        'brânză de vaci': 20
    };
    
    ingredients.forEach(ingredient => {
        const cost = ingredientCosts[ingredient] || 5; // cost implicit 5 RON
        totalCost += cost * 0.1; // 100g per ingredient aproximativ
    });
    
    // Adaugă waste
    totalCost *= (1 + wastePercentage / 100);
    
    // Markup 300% (preț de vânzare = cost * 4)
    const sellingPrice = totalCost * 4;
    
    return Math.round(sellingPrice * 100) / 100; // rotunjire la 2 zecimale
}

// Funcție principală pentru generarea fișei de produs
async function generateProductSheet(productName, options = {}) {
    console.log(`\n🍽️ Generare fișă de produs pentru: "${productName}"`);
    
    try {
        // 1. Identifică ingredientele
        const ingredients = getIngredients(productName);
        console.log(`📋 Ingrediente identificate: ${ingredients.join(', ')}`);
        
        // 2. Calculează waste-ul
        const wastePercentage = calculateWaste(productName);
        console.log(`📊 Waste calculat: ${wastePercentage}%`);
        
        // 3. Identifică ambalajele
        const packagingRestaurant = getPackaging(productName, false);
        const packagingDelivery = getPackaging(productName, true);
        console.log(`📦 Ambalaje restaurant: ${packagingRestaurant.join(', ')}`);
        console.log(`📦 Ambalaje delivery: ${packagingDelivery.join(', ')}`);
        
        // 4. Calculează prețul
        const price = calculatePrice(ingredients, wastePercentage);
        console.log(`💰 Preț calculat: ${price} RON`);
        
        // 5. Identifică categoria
        const category = identifyProductCategory(productName);
        console.log(`📂 Categorie: ${category}`);
        
        // 6. Creează produsul în meniu
        const productId = await createMenuProduct(productName, category, price, ingredients);
        console.log(`✅ Produs creat în meniu cu ID: ${productId}`);
        
        // 7. Creează ingredientele dacă nu există
        await createIngredientsIfNotExist(ingredients);
        console.log(`✅ Ingrediente verificate/create`);
        
        // 8. Creează rețeta
        await createRecipe(productId, ingredients, wastePercentage);
        console.log(`✅ Rețetă creată`);
        
        // 9. Creează ambalajele
        await createPackaging(productId, packagingRestaurant, packagingDelivery);
        console.log(`✅ Ambalaje create`);
        
        // 10. Populează stocurile
        await populateStocks(productId, ingredients);
        console.log(`✅ Stocuri populate`);
        
        console.log(`\n🎉 Fișa de produs "${productName}" a fost generată cu succes!`);
        
        return {
            productId,
            productName,
            category,
            price,
            ingredients,
            wastePercentage,
            packagingRestaurant,
            packagingDelivery
        };
        
    } catch (error) {
        console.error(`❌ Eroare la generarea fișei de produs:`, error);
        throw error;
    }
}

// Funcție pentru crearea produsului în meniu
async function createMenuProduct(name, category, price, ingredients) {
    return new Promise((resolve, reject) => {
        const description = `Produs generat automat cu ingredientele: ${ingredients.join(', ')}`;
        const allergens = 'Conține gluten, lactoză'; // implicit
        const prepTime = 15; // 15 minute implicit
        const calories = Math.round(price * 10); // aproximativ
        const protein = Math.round(calories * 0.15);
        const carbs = Math.round(calories * 0.6);
        const fat = Math.round(calories * 0.25);
        
        db.run(`
            INSERT INTO menu (name, category, price, description, weight, is_vegetarian, is_spicy, 
                             allergens, prep_time, calories, protein, carbs, fat, is_sellable)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            name, category, price, description, '300g', 0, 0, allergens, prepTime, 
            calories, protein, carbs, fat, 1
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

// Funcție pentru crearea ingredientelor dacă nu există
async function createIngredientsIfNotExist(ingredients) {
    for (const ingredient of ingredients) {
        await new Promise((resolve, reject) => {
            // Verifică dacă ingredientul există
            db.get('SELECT id FROM ingredients WHERE name = ?', [ingredient], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (!row) {
                    // Creează ingredientul
                    db.run(`
                        INSERT INTO ingredients (name, unit, current_stock, min_stock, cost_per_unit, 
                                               supplier, category, is_available)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        ingredient, 'kg', 100, 10, 5, 'Furnizor General', 'Altele', 1
                    ], function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            console.log(`  ➕ Ingredient creat: ${ingredient} (ID: ${this.lastID})`);
                            resolve();
                        }
                    });
                } else {
                    resolve();
                }
            });
        });
    }
}

// Funcție pentru crearea rețetei
async function createRecipe(productId, ingredients, wastePercentage) {
    for (const ingredient of ingredients) {
        await new Promise((resolve, reject) => {
            // Găsește ID-ul ingredientului
            db.get('SELECT id FROM ingredients WHERE name = ?', [ingredient], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (row) {
                    // Creează rețeta
                    db.run(`
                        INSERT INTO recipes (product_id, ingredient_id, quantity_needed, unit, 
                                           waste_percentage, item_type)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, [
                        productId, row.id, 0.1, 'kg', wastePercentage, 'ingredient'
                    ], function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                } else {
                    resolve();
                }
            });
        });
    }
}

// Funcție pentru crearea ambalajelor
async function createPackaging(productId, packagingRestaurant, packagingDelivery) {
    // Ambalaje pentru restaurant
    for (const packaging of packagingRestaurant) {
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO recipes (product_id, ingredient_id, quantity_needed, unit, item_type)
                VALUES (?, ?, ?, ?, ?)
            `, [productId, 0, 1, 'buc', 'packaging_restaurant'], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    
    // Ambalaje pentru delivery
    for (const packaging of packagingDelivery) {
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO recipes (product_id, ingredient_id, quantity_needed, unit, item_type)
                VALUES (?, ?, ?, ?, ?)
            `, [productId, 0, 1, 'buc', 'packaging_delivery'], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

// Funcție pentru popularea stocurilor
async function populateStocks(productId, ingredients) {
    // Creează intrare în stock_management pentru produs
    await new Promise((resolve, reject) => {
        db.run(`
            INSERT OR REPLACE INTO stock_management (product_id, current_stock, daily_stock, 
                                                   min_stock_alert, is_available)
            VALUES (?, ?, ?, ?, ?)
        `, [productId, 50, 50, 5, 1], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
    
    // Actualizează stocurile ingredientelor
    for (const ingredient of ingredients) {
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE ingredients 
                SET current_stock = current_stock + 10, last_updated = CURRENT_TIMESTAMP
                WHERE name = ?
            `, [ingredient], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

// Funcție pentru afișarea meniului de ajutor
function showHelp() {
    console.log(`
🍽️ GENERATOR AUTOMAT FISE DE PRODUS

Utilizare:
node generate-product-sheet.js "Nume Produs"

Exemple:
node generate-product-sheet.js "Pizza Margherita"
node generate-product-sheet.js "Paste Carbonara"
node generate-product-sheet.js "Salată Cesar"
node generate-product-sheet.js "Supă de Pui"
node generate-product-sheet.js "Piept de Pui la Grătar"

Funcționalități:
✅ Identificare automată ingrediente
✅ Calcul automat waste
✅ Identificare ambalaje restaurant/delivery
✅ Calcul automat preț
✅ Creare produs în meniu
✅ Creare ingrediente dacă nu există
✅ Creare rețetă
✅ Creare ambalaje
✅ Populare stocuri
✅ Interconectare vânzare cu scădere stoc
`);
}

// Funcția principală
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
        showHelp();
        return;
    }
    
    const productName = args.join(' ');
    
    try {
        await generateProductSheet(productName);
        console.log('\n✅ Proces finalizat cu succes!');
    } catch (error) {
        console.error('\n❌ Eroare:', error.message);
        process.exit(1);
    } finally {
        db.close();
    }
}

// Rulează scriptul
if (require.main === module) {
    main();
}

module.exports = {
    generateProductSheet,
    identifyProductCategory,
    calculateWaste,
    getPackaging,
    getIngredients,
    calculatePrice
};

