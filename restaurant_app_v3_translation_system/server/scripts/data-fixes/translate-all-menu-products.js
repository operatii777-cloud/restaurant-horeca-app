/**
 * SCRIPT PENTRU TRADUCEREA COMPLETĂ A TUTUROR PRODUSELOR DIN MENIU
 * 
 * Acest script traduce:
 * - Numele produselor (exceptând brand names)
 * - Descrierile (100% obligatoriu)
 * - Alergenii (100% obligatoriu)
 * - Categoriile (100% obligatoriu)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

// ===== DICȚIONARE DE TRADUCERI =====

// Categorii
const CATEGORY_TRANSLATIONS = {
  'Mic Dejun': 'Breakfast',
  'Gustări': 'Appetizers',
  'Supe și Ciorbe': 'Soups',
  'Paste': 'Pasta',
  'Pizza': 'Pizza',
  'Mâncare Tradițională': 'Traditional Food',
  'Grătar': 'Grill',
  'Burgeri': 'Burgers',
  'Salate': 'Salads',
  'Deserturi': 'Desserts',
  'Băuturi Calde': 'Hot Beverages',
  'Băuturi Reci': 'Cold Beverages',
  'Băuturi și Coctailuri': 'Drinks & Cocktails',
  'Coctailuri Non-Alcoolice': 'Non-Alcoholic Cocktails',
  'Băuturi Spirtoase': 'Spirits',
  'Vinuri': 'Wines',
  'Vinuri Albe': 'White Wines',
  'Vinuri Roșii': 'Red Wines',
  'Vinuri Rose': 'Rosé Wines',
  'Șampanii': 'Champagnes',
  'Bere': 'Beer',
  'Cafea': 'Coffee',
  'Ceaiuri': 'Teas',
  'Sucuri': 'Juices',
  'Apă': 'Water',
  'Limonade': 'Lemonades',
  'Smoothie': 'Smoothies',
  'Milkshake': 'Milkshakes'
};

// Alergeni comuni
const ALLERGEN_TRANSLATIONS = {
  'Gluten': 'Gluten',
  'Lactate': 'Dairy',
  'Ouă': 'Eggs',
  'Pește': 'Fish',
  'Crustacee': 'Crustaceans',
  'Soia': 'Soy',
  'Arahide': 'Peanuts',
  'Nuci': 'Nuts',
  'Țelină': 'Celery',
  'Muștar': 'Mustard',
  'Susan': 'Sesame',
  'Sulfiti': 'Sulphites',
  'Lupin': 'Lupin',
  'Moluște': 'Molluscs',
  'Lapte': 'Milk',
  'Brânză': 'Cheese',
  'Smântână': 'Cream',
  'Unt': 'Butter'
};

// Dicționar complet de ingrediente și preparate culinare
const FOOD_TRANSLATIONS = {
  // Produse de bază
  'ouă': 'eggs',
  'ou': 'egg',
  'ouă poșate': 'poached eggs',
  'ouă ochiuri': 'fried eggs',
  'ouă fierte': 'boiled eggs',
  'omletă': 'omelette',
  'bacon': 'bacon',
  'șuncă': 'ham',
  'salam': 'salami',
  'cremvurști': 'frankfurters',
  'cârnaț': 'sausage',
  'cârnați': 'sausages',
  
  // Lactate
  'brânză': 'cheese',
  'brânză telemea': 'feta cheese',
  'cașcaval': 'yellow cheese',
  'parmezan': 'parmesan',
  'mozzarella': 'mozzarella',
  'gorgonzola': 'gorgonzola',
  'ricotta': 'ricotta',
  'mascarpone': 'mascarpone',
  'smântână': 'sour cream',
  'frișcă': 'whipped cream',
  'unt': 'butter',
  'lapte': 'milk',
  'iaurt': 'yogurt',
  
  // Carne
  'pui': 'chicken',
  'piept de pui': 'chicken breast',
  'pulpă de pui': 'chicken thigh',
  'aripioare de pui': 'chicken wings',
  'porc': 'pork',
  'mușchi de porc': 'pork tenderloin',
  'cotlet de porc': 'pork chop',
  'vită': 'beef',
  'mușchi de vită': 'beef tenderloin',
  'antricot': 'ribeye steak',
  'file de vită': 'beef fillet',
  'miel': 'lamb',
  'costiță de miel': 'lamb chop',
  'rață': 'duck',
  'curcan': 'turkey',
  
  // Pește și fructe de mare
  'somon': 'salmon',
  'somon fume': 'smoked salmon',
  'ton': 'tuna',
  'păstrăv': 'trout',
  'cod': 'cod',
  'crevete': 'shrimp',
  'creveți': 'prawns',
  'calmar': 'squid',
  'calamar': 'squid',
  'caracatiță': 'octopus',
  'midii': 'mussels',
  'scoici': 'clams',
  
  // Legume
  'roșii': 'tomatoes',
  'roșie': 'tomato',
  'roșii cherry': 'cherry tomatoes',
  'castraveți': 'cucumbers',
  'castravete': 'cucumber',
  'ardei': 'peppers',
  'ardei gras': 'bell pepper',
  'ardei iute': 'hot pepper',
  'ceapă': 'onion',
  'ceapă roșie': 'red onion',
  'usturoi': 'garlic',
  'cartofi': 'potatoes',
  'cartofi prăjiți': 'french fries',
  'cartofi pai': 'shoestring fries',
  'piure de cartofi': 'mashed potatoes',
  'cartof copt': 'baked potato',
  'vinete': 'eggplants',
  'dovlecei': 'zucchini',
  'ciuperci': 'mushrooms',
  'spanac': 'spinach',
  'rucola': 'arugula',
  'salată verde': 'lettuce',
  'salată iceberg': 'iceberg lettuce',
  'varză': 'cabbage',
  'varză roșie': 'red cabbage',
  'conopidă': 'cauliflower',
  'broccoli': 'broccoli',
  'morcovi': 'carrots',
  'sfeclă': 'beetroot',
  'porumb': 'corn',
  'mazăre': 'peas',
  'fasole': 'beans',
  'linte': 'lentils',
  'năut': 'chickpeas',
  
  // Verdeață
  'pătrunjel': 'parsley',
  'mărar': 'dill',
  'busuioc': 'basil',
  'oregano': 'oregano',
  'rozmarin': 'rosemary',
  'cimbru': 'thyme',
  'mentă': 'mint',
  'coriandru': 'cilantro',
  
  // Sosuri și condimente
  'sos': 'sauce',
  'sos de roșii': 'tomato sauce',
  'sos alb': 'white sauce',
  'sos de usturoi': 'garlic sauce',
  'maioneză': 'mayonnaise',
  'ketchup': 'ketchup',
  'muștar': 'mustard',
  'pesto': 'pesto',
  'tzatziki': 'tzatziki',
  'guacamole': 'guacamole',
  'hummus': 'hummus',
  'salsa': 'salsa',
  'sos BBQ': 'BBQ sauce',
  'sos teriyaki': 'teriyaki sauce',
  'sos de soia': 'soy sauce',
  'ulei de măsline': 'olive oil',
  'oțet': 'vinegar',
  'oțet balsamic': 'balsamic vinegar',
  'sare': 'salt',
  'piper': 'pepper',
  'boia': 'paprika',
  'chili': 'chili',
  
  // Pâine și patiserie
  'pâine': 'bread',
  'pâine prăjită': 'toasted bread',
  'toast': 'toast',
  'lipie': 'pita bread',
  'baghetă': 'baguette',
  'croissant': 'croissant',
  'chifle': 'buns',
  'chiflă': 'bun',
  'turtă': 'flatbread',
  
  // Paste și cereale
  'paste': 'pasta',
  'spaghete': 'spaghetti',
  'penne': 'penne',
  'tagliatelle': 'tagliatelle',
  'fusilli': 'fusilli',
  'lasagna': 'lasagna',
  'ravioli': 'ravioli',
  'gnocchi': 'gnocchi',
  'orez': 'rice',
  'orez pilaf': 'pilaf rice',
  'risotto': 'risotto',
  
  // Fructe
  'mere': 'apples',
  'portocale': 'oranges',
  'lămâi': 'lemons',
  'lime': 'lime',
  'banane': 'bananas',
  'căpșuni': 'strawberries',
  'zmeură': 'raspberries',
  'afine': 'blueberries',
  'mure': 'blackberries',
  'cireșe': 'cherries',
  'piersici': 'peaches',
  'kiwi': 'kiwi',
  'mango': 'mango',
  'ananas': 'pineapple',
  'pepene': 'watermelon',
  'pepene galben': 'melon',
  'avocado': 'avocado',
  
  // Nuci și semințe
  'nuci': 'walnuts',
  'migdale': 'almonds',
  'alune': 'hazelnuts',
  'caju': 'cashews',
  'fistic': 'pistachios',
  'semințe de floarea soarelui': 'sunflower seeds',
  'semințe de dovleac': 'pumpkin seeds',
  'susan': 'sesame seeds',
  
  // Deserturi
  'înghețată': 'ice cream',
  'tort': 'cake',
  'prăjitură': 'cake',
  'cheesecake': 'cheesecake',
  'tiramisu': 'tiramisu',
  'brownies': 'brownies',
  'pancake': 'pancake',
  'clătite': 'pancakes',
  'gogoși': 'donuts',
  'cremă': 'cream',
  'ciocolată': 'chocolate',
  'caramel': 'caramel',
  'gem': 'jam',
  'miere': 'honey',
  'zahăr': 'sugar',
  'vanilie': 'vanilla',
  
  // Băuturi
  'cafea': 'coffee',
  'espresso': 'espresso',
  'cappuccino': 'cappuccino',
  'latte': 'latte',
  'ceai': 'tea',
  'ceai negru': 'black tea',
  'ceai verde': 'green tea',
  'suc': 'juice',
  'suc de portocale': 'orange juice',
  'suc de mere': 'apple juice',
  'limonadă': 'lemonade',
  'apă': 'water',
  'apă minerală': 'mineral water',
  'apă plată': 'still water',
  'apă carbogazoasă': 'sparkling water',
  'bere': 'beer',
  'vin': 'wine',
  'vin alb': 'white wine',
  'vin roșu': 'red wine',
  'vin rose': 'rosé wine',
  'șampanie': 'champagne',
  'prosecco': 'prosecco',
  
  // Adjective și preparări
  'prăjit': 'fried',
  'prăjită': 'fried',
  'prăjiți': 'fried',
  'prăjite': 'fried',
  'copt': 'baked',
  'coapte': 'baked',
  'fiert': 'boiled',
  'fiartă': 'boiled',
  'fripte': 'roasted',
  'la grătar': 'grilled',
  'grătar': 'grill',
  'rumenit': 'browned',
  'crocant': 'crispy',
  'proaspăt': 'fresh',
  'proaspătă': 'fresh',
  'proaspeți': 'fresh',
  'proaspete': 'fresh',
  'fume': 'smoked',
  'afumat': 'smoked',
  'afumată': 'smoked',
  'marinat': 'marinated',
  'marinată': 'marinated',
  'condimentat': 'seasoned',
  'picant': 'spicy',
  'dulce': 'sweet',
  'sărat': 'salty',
  'acru': 'sour',
  'amar': 'bitter',
  'cald': 'hot',
  'rece': 'cold',
  'călduț': 'warm',
  
  // Alte cuvinte comune
  'mic dejun': 'breakfast',
  'dejun': 'lunch',
  'cină': 'dinner',
  'gustare': 'snack',
  'aperitiv': 'appetizer',
  'supă': 'soup',
  'ciorbă': 'sour soup',
  'salată': 'salad',
  'desert': 'dessert',
  'fel principal': 'main course',
  'garnitură': 'side dish',
  'porție': 'portion',
  'porții': 'portions',
  'jumătate': 'half',
  'întreg': 'whole',
  'mare': 'large',
  'mic': 'small',
  'mediu': 'medium',
  'special': 'special',
  'tradițional': 'traditional',
  'casnic': 'homemade',
  'de casă': 'homemade',
  'vegetarian': 'vegetarian',
  'vegan': 'vegan',
  'fără': 'without',
  'cu': 'with',
  'și': 'and',
  'sau': 'or',
  'în': 'in',
  'pe': 'on',
  'la': 'at',
  'de': 'of',
  'servit cu': 'served with',
  'servită cu': 'served with',
  'servite cu': 'served with',
  'asortate': 'assorted',
  'mixte': 'mixed',
  'amestec': 'mix'
};

// Brand names cunoscute care NU trebuie traduse
const BRAND_NAMES = [
  'Amaretto', 'Disaronno', 'Aperol', 'Spritz', 'Bailey', 'Martini',
  'Asti', 'Brâncoveanu', 'Bucur', 'Bulgarini', 'Lugana',
  'Jack Daniel', 'Johnnie Walker', 'Jim Beam', 'Jameson',
  'Ballantine', 'Chivas', 'Hennessy', 'Rémy Martin',
  'Coca-Cola', 'Pepsi', 'Fanta', 'Sprite', 'Red Bull',
  'Lipton', 'Nestea', 'Schweppes', 'Perrier', 'San Pellegrino',
  'Jägermeister', 'Campari', 'Cointreau', 'Kahlúa', 'Malibu',
  'Absolut', 'Smirnoff', 'Grey Goose', 'Belvedere',
  'Bacardi', 'Captain Morgan', 'Havana Club',
  'Tequila', 'Jose Cuervo', 'Olmeca', 'Sierra',
  'Gin', 'Gordons', 'Tanqueray', 'Bombay Sapphire',
  'Vodka', 'Whisky', 'Whiskey', 'Rum', 'Cognac', 'Brandy',
  'B52', 'Cosmopolitan', 'Mojito', 'Margarita', 'Piña Colada',
  'Negroni', 'Manhattan', 'Old Fashioned', 'Daiquiri',
  'Blue Hawaii', 'Blow Job', 'Tequila Sunrise',
  'Long Island', 'Cuba Libre', 'Caipirinha', 'Caipiroska',
  'Sex on the Beach', 'Bloody Mary', 'White Russian', 'Black Russian',
  'Irish Coffee', 'Caffè Latte', 'Cappuccino', 'Espresso', 'Macchiato',
  'Frappuccino', 'Affogato', 'Ristretto'
];

/**
 * Verifică dacă un nume este brand name
 */
function isBrandName(name) {
  const nameLower = name.toLowerCase();
  return BRAND_NAMES.some(brand => nameLower.includes(brand.toLowerCase()));
}

/**
 * Traduce un text folosind dicționarul
 */
function translateText(text, dictionary) {
  if (!text) return text;
  
  let translated = text;
  
  // Sortează cheile după lungime (descrescător) pentru a match-ui phrase-uri mai lungi întâi
  const sortedKeys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  
  for (const roText of sortedKeys) {
    const enText = dictionary[roText];
    // Case-insensitive replace, păstrând case-ul original
    const regex = new RegExp(roText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    translated = translated.replace(regex, (match) => {
      // Păstrează capitalization-ul original
      if (match[0] === match[0].toUpperCase()) {
        return enText.charAt(0).toUpperCase() + enText.slice(1);
      }
      return enText;
    });
  }
  
  return translated;
}

/**
 * Traduce numele unui produs
 */
function translateProductName(name) {
  if (!name) return name;
  
  // Dacă e brand name, păstrează-l
  if (isBrandName(name)) {
    return name;
  }
  
  // Altfel traduce
  return translateText(name, FOOD_TRANSLATIONS);
}

/**
 * Traduce descrierea unui produs
 */
function translateDescription(description) {
  if (!description) return '';
  return translateText(description, FOOD_TRANSLATIONS);
}

/**
 * Traduce alergenii
 */
function translateAllergens(allergens) {
  if (!allergens) return '';
  
  let translated = allergens;
  for (const [ro, en] of Object.entries(ALLERGEN_TRANSLATIONS)) {
    const regex = new RegExp(ro, 'gi');
    translated = translated.replace(regex, en);
  }
  
  return translated;
}

/**
 * Traduce categoria
 */
function translateCategory(category) {
  if (!category) return category;
  return CATEGORY_TRANSLATIONS[category] || category;
}

/**
 * Procesează traducerile pentru toate produsele
 */
async function translateAllProducts() {
  return new Promise((resolve, reject) => {
    // Obține toate produsele active
    db.all('SELECT * FROM menu WHERE is_sellable = 1', [], async (err, products) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log(`\n📊 Total produse de tradus: ${products.length}\n`);
      
      let translated = 0;
      let skipped = 0;
      let errors = 0;
      
      for (const product of products) {
        try {
          const updates = {};
          let needsUpdate = false;
          
          // Traduce numele dacă nu e brand
          if (!product.name_en || product.name_en === '' || product.name_en === product.name) {
            updates.name_en = translateProductName(product.name);
            if (updates.name_en !== product.name) {
              needsUpdate = true;
            }
          }
          
          // Traduce descrierea (obligatoriu)
          if (!product.description_en || product.description_en === '' || product.description_en === product.description) {
            if (product.description) {
              updates.description_en = translateDescription(product.description);
              needsUpdate = true;
            }
          }
          
          // Traduce categoria (obligatoriu)
          if (!product.category_en || product.category_en === '') {
            updates.category_en = translateCategory(product.category);
            if (updates.category_en) {
              needsUpdate = true;
            }
          }
          
          // Traduce alergenii (obligatoriu)
          if (product.allergens && (!product.allergens_en || product.allergens_en === '')) {
            updates.allergens_en = translateAllergens(product.allergens);
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            // Construiește query UPDATE
            const setClause = [];
            const values = [];
            
            if (updates.name_en !== undefined) {
              setClause.push('name_en = ?');
              values.push(updates.name_en);
            }
            if (updates.description_en !== undefined) {
              setClause.push('description_en = ?');
              values.push(updates.description_en);
            }
            if (updates.category_en !== undefined) {
              setClause.push('category_en = ?');
              values.push(updates.category_en);
            }
            if (updates.allergens_en !== undefined) {
              setClause.push('allergens_en = ?');
              values.push(updates.allergens_en);
            }
            
            values.push(product.id);
            
            const query = `UPDATE menu SET ${setClause.join(', ')} WHERE id = ?`;
            
            await new Promise((resolveUpdate, rejectUpdate) => {
              db.run(query, values, function(err) {
                if (err) {
                  console.error(`❌ Eroare la #${product.id} (${product.name}):`, err.message);
                  errors++;
                  rejectUpdate(err);
                } else {
                  console.log(`✅ ${product.id}. ${product.name} → ${updates.name_en || product.name_en || product.name}`);
                  if (updates.description_en) {
                    console.log(`   📝 ${product.description} → ${updates.description_en}`);
                  }
                  translated++;
                  resolveUpdate();
                }
              });
            });
          } else {
            console.log(`⏭️  ${product.id}. ${product.name} (deja tradus)`);
            skipped++;
          }
          
        } catch (error) {
          console.error(`❌ Eroare la procesarea #${product.id}:`, error);
          errors++;
        }
      }
      
      console.log(`\n📈 REZULTATE FINALE:`);
      console.log(`✅ Produse traduse: ${translated}`);
      console.log(`⏭️  Produse sărite (deja traduse): ${skipped}`);
      console.log(`❌ Erori: ${errors}`);
      console.log(`📊 Total procesate: ${products.length}\n`);
      
      resolve({ translated, skipped, errors, total: products.length });
    });
  });
}

/**
 * Main function
 */
async function main() {
  console.log('🌍 ÎNCEPUT TRADUCERE COMPLETĂ MENIU\n');
  console.log('Acest script va traduce:');
  console.log('- Numele produselor (exceptând brand names)');
  console.log('- Descrierile (100%)');
  console.log('- Alergenii (100%)');
  console.log('- Categoriile (100%)\n');
  
  try {
    const result = await translateAllProducts();
    
    console.log('✅ TRADUCERE COMPLETATĂ CU SUCCES!\n');
    
    // Verificare finală
    db.get(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN name_en IS NOT NULL AND name_en != '' THEN 1 END) as with_name_en,
        COUNT(CASE WHEN description_en IS NOT NULL AND description_en != '' THEN 1 END) as with_desc_en,
        COUNT(CASE WHEN category_en IS NOT NULL AND category_en != '' THEN 1 END) as with_cat_en
      FROM menu 
      WHERE is_sellable = 1
    `, [], (err, stats) => {
      if (err) {
        console.error('Eroare la verificare finală:', err);
      } else {
        console.log('📊 STATISTICI FINALE:');
        console.log(`Total produse: ${stats.total}`);
        console.log(`Cu name_en: ${stats.with_name_en} (${Math.round(stats.with_name_en/stats.total*100)}%)`);
        console.log(`Cu description_en: ${stats.with_desc_en} (${Math.round(stats.with_desc_en/stats.total*100)}%)`);
        console.log(`Cu category_en: ${stats.with_cat_en} (${Math.round(stats.with_cat_en/stats.total*100)}%)`);
      }
      
      db.close();
    });
    
  } catch (error) {
    console.error('❌ EROARE FATALĂ:', error);
    db.close();
    process.exit(1);
  }
}

// Rulează scriptul
main();
