/**
 * ===================================================================
 * 🌐 NUTRITION API - Integrare cu Open Food Facts și USDA
 * ===================================================================
 * 
 * Modulul pentru căutarea automată a datelor nutriționale din surse externe:
 * - Open Food Facts (prioritate, gratuit, multilingual)
 * - USDA FoodData Central (fallback, gratuit cu API key)
 * 
 * @module nutritionApi
 * @author Restaurant App Team
 * @date 28-Oct-2025
 */

const axios = require('axios');

/**
 * Mapare alergeni de la tag-uri Open Food Facts la română
 */
const ALLERGEN_MAP = {
    'en:eggs': 'ouă',
    'en:milk': 'lactate',
    'en:gluten': 'gluten',
    'en:nuts': 'nuci',
    'en:peanuts': 'arahide',
    'en:soybeans': 'soia',
    'en:fish': 'pește',
    'en:crustaceans': 'crustacee',
    'en:molluscs': 'moluste',
    'en:celery': 'țelină',
    'en:mustard': 'muștar',
    'en:sesame-seeds': 'susan',
    'en:sulphur-dioxide-and-sulphites': 'dioxid de sulf',
    'en:lupin': 'lupin'
};

/**
 * Cuvinte cheie pentru detectare automată alergeni din nume produs
 */
const ALLERGEN_KEYWORDS = {
    'ouă': ['ou', 'oua', 'egg', 'omleta', 'omletă'],
    'lactate': ['lapte', 'branza', 'brânză', 'smântână', 'unt', 'cheese', 'milk', 'cream', 'cascaval', 'cașcaval'],
    'gluten': ['faina', 'făină', 'paine', 'pâine', 'paste', 'wheat', 'flour', 'bread', 'gluten'],
    'nuci': ['nuci', 'nuca', 'nucă', 'nuts', 'almond', 'migdale'],
    'pește': ['peste', 'pește', 'fish', 'ton', 'somon', 'salmon'],
    'soia': ['soia', 'soy', 'tofu'],
    'crustacee': ['creveti', 'creveți', 'shrimp', 'crab', 'lobster'],
    'țelină': ['telina', 'țelină', 'celery'],
    'muștar': ['mustar', 'muștar', 'mustard'],
    'susan': ['susan', 'sesame']
};

/**
 * Detectare categorie ingredient pe baza numelui
 */
const CATEGORY_KEYWORDS = {
    'Lactate': ['lapte', 'branza', 'brânză', 'iaurt', 'smântână', 'unt', 'cascaval', 'cașcaval', 'cheese', 'milk', 'yogurt', 'cream', 'mozzarella', 'parmezan'],
    'Carne': ['carne', 'vita', 'vită', 'porc', 'pui', 'beef', 'pork', 'chicken', 'miel', 'curcan', 'carnati', 'cârnați', 'salam', 'bacon'],
    'Peste': ['peste', 'pește', 'ton', 'somon', 'salmon', 'fish', 'hering', 'sardine'],
    'Legume': ['legume', 'tomate', 'castravete', 'ardei', 'ceapa', 'ceapă', 'salata', 'salată', 'morcov', 'cartofi', 'vegetables', 'tomato', 'cucumber', 'pepper', 'onion'],
    'Fructe': ['mere', 'pere', 'banane', 'portocale', 'lamai', 'lămâi', 'capsuni', 'căpșuni', 'fruit', 'apple', 'pear', 'banana', 'orange'],
    'Condimente': ['sare', 'piper', 'boia', 'chimen', 'cimbru', 'cimbru', 'oregano', 'busuioc', 'salt', 'pepper', 'spices', 'condiment'],
    'Ulei': ['ulei', 'oil', 'olive', 'masline', 'măsline'],
    'Cereale': ['orez', 'rice', 'paste', 'pasta', 'faina', 'făină', 'flour', 'gris', 'griș']
};

/**
 * Caută informații nutriționale pentru un ingredient
 * @param {string} ingredientName - Numele ingredientului (ex: "ou", "cârnați")
 * @param {string} language - Limba (ro, en)
 * @returns {Promise<Object|null>} - Date nutriționale și alergeni sau null
 */
async function fetchNutritionalData(ingredientName, language = 'ro') {
    try {
        console.log(`🔍 Căutare date nutriționale pentru: "${ingredientName}"`);

        // 1. Încearcă Open Food Facts (prima opțiune)
        const offResult = await searchOpenFoodFacts(ingredientName, language);
        if (offResult) {
            console.log(`✅ Date găsite de pe Open Food Facts pentru "${ingredientName}"`);
            return offResult;
        }

        // 2. Dacă nu găsește, încearcă cu termenul tradus în engleză
        if (language === 'ro') {
            const translatedTerm = await translateToEnglish(ingredientName);
            if (translatedTerm !== ingredientName) {
                console.log(`🔄 Încerc cu termenul tradus: "${translatedTerm}"`);
                const offResultEn = await searchOpenFoodFacts(translatedTerm, 'en');
                if (offResultEn) {
                    console.log(`✅ Date găsite de pe Open Food Facts (EN) pentru "${ingredientName}"`);
                    return offResultEn;
                }
            }
        }

        // 3. Fallback: detectare pe baza numelui
        console.log(`⚠️ Nu s-au găsit date online pentru "${ingredientName}". Folosesc detectare automată.`);
        return detectFromName(ingredientName);

    } catch (error) {
        console.error(`❌ Eroare la căutarea datelor nutriționale pentru "${ingredientName}":`, error.message);
        return null;
    }
}

/**
 * Caută pe Open Food Facts
 * @param {string} query - Termenul de căutare
 * @param {string} language - Limba
 * @returns {Promise<Object|null>}
 */
async function searchOpenFoodFacts(query, language = 'ro') {
    try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl`;
        const params = {
            search_terms: query,
            search_simple: 1,
            action: 'process',
            json: 1,
            page_size: 10,
            fields: 'product_name,product_name_ro,nutriments,allergens_tags,additives_tags,categories_tags'
        };

        const response = await axios.get(url, { 
            params,
            timeout: 5000,
            headers: {
                'User-Agent': 'Restaurant-App/1.0 (https://restaurant-app.ro; contact@restaurant-app.ro)'
            }
        });

        const products = response.data.products;

        if (!products || products.length === 0) {
            return null;
        }

        // Găsește cel mai relevant produs (primul care se potrivește bine)
        const product = findBestMatch(products, query);
        if (!product) return null;

        const nutriments = product.nutriments || {};

        return {
            source: 'Open Food Facts',
            name: product.product_name || product.product_name_ro || query,
            description: `Date din Open Food Facts pentru "${product.product_name || query}"`,
            energy_kcal: Math.round(nutriments['energy-kcal_100g'] || 0),
            protein: parseFloat((nutriments.proteins_100g || 0).toFixed(1)),
            fat: parseFloat((nutriments.fat_100g || 0).toFixed(1)),
            saturated_fat: parseFloat((nutriments['saturated-fat_100g'] || 0).toFixed(1)),
            carbs: parseFloat((nutriments.carbohydrates_100g || 0).toFixed(1)),
            sugars: parseFloat((nutriments.sugars_100g || 0).toFixed(1)),
            fiber: parseFloat((nutriments.fiber_100g || 0).toFixed(1)),
            salt: parseFloat((nutriments.salt_100g || 0).toFixed(2)),
            allergens: parseAllergens(product.allergens_tags || []),
            potential_allergens: '',
            additives: parseAdditives(product.additives_tags || []),
            category: detectCategoryFromTags(product.categories_tags || [])
        };

    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.log('⏱️ Timeout la Open Food Facts');
        } else {
            console.error('❌ Eroare Open Food Facts:', error.message);
        }
        return null;
    }
}

/**
 * Găsește cel mai bun rezultat dintr-o listă
 * @param {Array} products - Lista de produse
 * @param {string} query - Termenul căutat
 * @returns {Object|null}
 */
function findBestMatch(products, query) {
    const queryLower = query.toLowerCase().trim();
    
    // Prioritate 1: Exact match pe nume
    let match = products.find(p => 
        (p.product_name || '').toLowerCase() === queryLower ||
        (p.product_name_ro || '').toLowerCase() === queryLower
    );
    if (match) return match;

    // Prioritate 2: Începe cu query
    match = products.find(p => 
        (p.product_name || '').toLowerCase().startsWith(queryLower) ||
        (p.product_name_ro || '').toLowerCase().startsWith(queryLower)
    );
    if (match) return match;

    // Prioritate 3: Conține query
    match = products.find(p => 
        (p.product_name || '').toLowerCase().includes(queryLower) ||
        (p.product_name_ro || '').toLowerCase().includes(queryLower)
    );
    if (match) return match;

    // Default: primul produs
    return products[0];
}

/**
 * Parse allergens tags
 */
function parseAllergens(allergensTags) {
    if (!allergensTags || allergensTags.length === 0) return '';
    
    const allergens = allergensTags
        .map(tag => ALLERGEN_MAP[tag] || tag.replace('en:', ''))
        .filter(a => a);
    
    return allergens.join(', ');
}

/**
 * Parse additives tags
 */
function parseAdditives(additivesTags) {
    if (!additivesTags || additivesTags.length === 0) return '';
    
    return additivesTags
        .map(tag => tag.replace('en:', '').toUpperCase())
        .join(', ');
}

/**
 * Detectare categorie din tag-uri Open Food Facts
 */
function detectCategoryFromTags(categoryTags) {
    const tagString = categoryTags.join(' ').toLowerCase();
    
    if (tagString.includes('dairy') || tagString.includes('cheese') || tagString.includes('milk')) return 'Lactate';
    if (tagString.includes('meat') || tagString.includes('poultry')) return 'Carne';
    if (tagString.includes('fish') || tagString.includes('seafood')) return 'Peste';
    if (tagString.includes('vegetable')) return 'Legume';
    if (tagString.includes('fruit')) return 'Fructe';
    if (tagString.includes('spice') || tagString.includes('condiment')) return 'Condimente';
    if (tagString.includes('oil')) return 'Ulei';
    if (tagString.includes('cereal') || tagString.includes('grain')) return 'Cereale';
    
    return 'Altele';
}

/**
 * Detectare date pe baza numelui (fallback când API-ul nu găsește)
 */
function detectFromName(ingredientName) {
    const nameLower = ingredientName.toLowerCase().trim();
    
    // Detectare categorie
    let category = 'Altele';
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(kw => nameLower.includes(kw))) {
            category = cat;
            break;
        }
    }
    
    // Detectare alergeni
    const allergens = [];
    for (const [allergen, keywords] of Object.entries(ALLERGEN_KEYWORDS)) {
        if (keywords.some(kw => nameLower.includes(kw))) {
            allergens.push(allergen);
        }
    }
    
    return {
        source: 'Detectare automată',
        name: ingredientName,
        description: `Date detectate automat din nume pentru "${ingredientName}"`,
        energy_kcal: 0,
        protein: 0,
        fat: 0,
        saturated_fat: 0,
        carbs: 0,
        sugars: 0,
        fiber: 0,
        salt: 0,
        allergens: allergens.join(', '),
        potential_allergens: '',
        additives: '',
        category: category
    };
}

/**
 * Traducere simplă română → engleză pentru ingrediente comune
 */
async function translateToEnglish(term) {
    const translations = {
        'ou': 'egg',
        'oua': 'eggs',
        'ouă': 'eggs',
        'lapte': 'milk',
        'branza': 'cheese',
        'brânză': 'cheese',
        'carne': 'meat',
        'vita': 'beef',
        'vită': 'beef',
        'porc': 'pork',
        'pui': 'chicken',
        'peste': 'fish',
        'pește': 'fish',
        'carnati': 'sausage',
        'cârnați': 'sausage',
        'salam': 'salami',
        'bacon': 'bacon',
        'unt': 'butter',
        'smantana': 'cream',
        'smântână': 'cream',
        'iaurt': 'yogurt',
        'faina': 'flour',
        'făină': 'flour',
        'paine': 'bread',
        'pâine': 'bread',
        'orez': 'rice',
        'paste': 'pasta',
        'ulei': 'oil',
        'sos': 'sauce',
        'salata': 'salad',
        'salată': 'salad',
        'rosii': 'tomatoes',
        'roșii': 'tomatoes',
        'castraveti': 'cucumber',
        'castraveți': 'cucumber',
        'ceapa': 'onion',
        'ceapă': 'onion',
        'usturoi': 'garlic',
        'cartofi': 'potatoes',
        'morcovi': 'carrots',
        'ardei': 'pepper'
    };
    
    const termLower = term.toLowerCase().trim();
    return translations[termLower] || term;
}

/**
 * Detectare categorie ingredient pe baza numelui
 * @param {string} name - Numele ingredientului
 * @returns {string} - Categoria detectată
 */
function detectCategory(name) {
    const nameLower = name.toLowerCase();
    
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(keyword => nameLower.includes(keyword))) {
            return category;
        }
    }
    
    return 'Altele';
}

/**
 * Detectare alergeni pe baza numelui
 * @param {string} name - Numele ingredientului
 * @returns {string} - Lista de alergeni separați prin virgulă
 */
function detectAllergens(name) {
    const nameLower = name.toLowerCase();
    const allergens = [];
    
    for (const [allergen, keywords] of Object.entries(ALLERGEN_KEYWORDS)) {
        if (keywords.some(keyword => nameLower.includes(keyword))) {
            allergens.push(allergen);
        }
    }
    
    return allergens.join(', ');
}

module.exports = {
    fetchNutritionalData,
    detectCategory,
    detectAllergens,
    CATEGORY_KEYWORDS,
    ALLERGEN_KEYWORDS
};

