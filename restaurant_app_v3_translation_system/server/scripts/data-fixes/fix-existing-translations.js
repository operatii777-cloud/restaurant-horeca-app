/**
 * Script pentru corectarea traducerilor existente
 * Verifică și corectează descrierile și alergenii care au fost traduși parțial sau incorect
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'restaurant.db');

// Dicționar complet pentru traduceri
const FOOD_TRANSLATIONS = {
  // Băuturi și descrieri
  'vin alb sec': 'dry white wine',
  'vin roșu sec': 'dry red wine',
  'vin roze sec': 'dry rosé wine',
  'vin roze demisec': 'semi-dry rosé wine',
  'spumant italian': 'italian sparkling wine',
  'cognac francez premium': 'premium french cognac',
  'whisky scoțian': 'scottish whisky',
  'whisky scoțian premium': 'premium scottish whisky',
  'whisky bourbon american': 'american bourbon whisky',
  'whisky irlandez': 'irish whisky',
  'whisky tennessee': 'tennessee whisky',
  'vodka premium': 'premium vodka',
  'vodka premium franceză': 'french premium vodka',
  'vodka premium olandeză': 'dutch premium vodka',
  'gin premium': 'premium gin',
  'gin premium englez': 'english premium gin',
  'gin roz premium': 'premium pink gin',
  'rom alb': 'white rum',
  'rom premium venezuelan': 'venezuelan premium rum',
  'tequila albă mexicană': 'mexican white tequila',
  'tequila gold mexicană': 'mexican gold tequila',
  'tequila fumată mexicană': 'mexican smoked tequila',
  'bitter italian': 'italian bitter',
  'vermut italian': 'italian vermouth',
  'amaretto italian': 'italian amaretto',
  'pălincă românească': 'romanian pălincă',
  
  // Bere
  'bere blondă': 'blonde beer',
  'bere nefiltrată': 'unfiltered beer',
  'bere draught': 'draught beer',
  'la robinet': 'on tap',
  
  // Cocktailuri
  'coctail clasic': 'classic cocktail',
  'coctail': 'cocktail',
  
  // Cafea
  'cafea cu lapte': 'coffee with milk',
  'cafea fără cofeină': 'decaffeinated coffee',
  'latte fără cofeină': 'decaffeinated latte',
  'cappuccino fără cofeină': 'decaffeinated cappuccino',
  'cappuccino clasic': 'classic cappuccino',
  'espresso dublu': 'double espresso',
  'flat white': 'flat white',
  'cafea ristretto': 'ristretto coffee',
  'latte macchiato': 'latte macchiato',
  
  // Băuturi răcoritoare
  'băutură carbogazoasă': 'carbonated drink',
  'băutură carbogazoasă fără zahăr': 'sugar-free carbonated drink',
  'băutură energizantă': 'energy drink',
  'băutură premium': 'premium drink',
  'apă minerală': 'mineral water',
  'limonadă proaspătă naturală': 'fresh natural lemonade',
  
  // Ingrediente de bază
  'ouă poșate': 'poached eggs',
  'somon fume': 'smoked salmon',
  'somon fumé': 'smoked salmon',
  'pâine prăjită': 'toasted bread',
  'baghetă': 'baguette',
  'ton': 'tuna',
  'maioneză': 'mayonnaise',
  'măsline kalamata': 'kalamata olives',
  'capere': 'capers',
  'măsline': 'olives',
  'măsline panate și prăjite': 'breaded and fried olives',
  'cașcaval': 'yellow cheese',
  'cașcaval panat și prăjit': 'breaded and fried yellow cheese',
  'broccoli sote în unt': 'broccoli sautéed in butter',
  'broccoli sote': 'sautéed broccoli',
  'legume sote': 'sautéed vegetables',
  'orez sălbatic aromat': 'aromatic wild rice',
  'mămăligă': 'polenta',
  'varză': 'cabbage',
  'morcov': 'carrot',
  'mărar': 'dill',
  'murături asortate': 'assorted pickles',
  
  // Paste
  'paste fresh': 'fresh pasta',
  'cremă vegetală': 'vegetable cream',
  'brânză gorgonzola': 'gorgonzola cheese',
  'mozzarella': 'mozzarella',
  'brânză dură': 'hard cheese',
  'ceddar': 'cheddar',
  'pancetta': 'pancetta',
  'ou': 'egg',
  'spaghetti carbonara clasic': 'classic spaghetti carbonara',
  'cheesecake clasic': 'classic cheesecake',
  'tort krantz': 'krantz cake',
  
  // Dulciuri
  'mascarpone': 'mascarpone',
  'dulceață vișine': 'cherry jam',
  'nutella': 'nutella',
  'banană': 'banana',
  'biscuiți': 'biscuits',
  'tiramisu': 'tiramisu',
  
  // Diverse
  'vanilie': 'vanilla',
  'caramel': 'caramel',
  'ciocolată': 'chocolate',
  'suc de ananas': 'pineapple juice',
  'piure de cocos': 'coconut puree',
  'frișcă lichidă': 'liquid cream',
  'frișcă': 'whipped cream',
  'lapte': 'milk',
  'zahăr brun': 'brown sugar',
  'apă carbogazoasă': 'sparkling water',
  'mentă fresh': 'fresh mint',
  'lime': 'lime',
  'triplu sec': 'triple sec',
  'gin clasic': 'classic gin',
  'pepsi': 'pepsi',
  
  // Referințe la locații
  'crama sarica niculițel': 'sarica niculițel winery',
  'crama rașova': 'rașova winery',
  'crama liliac': 'liliac winery',
  'crama negrini': 'negrini winery',
  'crama purcari': 'purcari winery',
  'crama recaș': 'recaș winery',
  'cramele recaș': 'recaș wineries',
  'crama otella-italia': 'otella-italia winery',
  
  // Porții
  'porție': 'portion',
  'felie': 'slice',
};

const ALLERGEN_TRANSLATIONS = {
  'Gluten': 'Gluten',
  'Lactate': 'Dairy',
  'Ouă': 'Eggs',
  'Pește': 'Fish',
  'Crustacee': 'Crustaceans',
  'Moluște': 'Molluscs',
  'Soia': 'Soy',
  'Susan': 'Sesame',
  'Nuci': 'Nuts',
  'Alune': 'Peanuts',
  'Țelină': 'Celery',
  'Muștar': 'Mustard',
  'Sulfați': 'Sulphites',
  'Lupin': 'Lupin',
  'Fructe de scoică': 'Shellfish',
  'Semințe de susan': 'Sesame seeds',
  'Dioxid de sulf': 'Sulphur dioxide',
  'Arahide': 'Peanuts',
};

/**
 * Traduce text folosind dicționarul
 */
function translateText(text, dictionary) {
  if (!text || text.trim() === '') return text;
  
  let translated = text.toLowerCase();
  
  // Sortează cheile după lungime (cele mai lungi primele)
  const sortedKeys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    const value = dictionary[key];
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    translated = translated.replace(regex, value);
  }
  
  return translated;
}

/**
 * Traduce descrierea completă
 */
function translateDescription(description) {
  if (!description || description.trim() === '') return '';
  
  let translated = translateText(description, FOOD_TRANSLATIONS);
  
  // Capitalizează prima literă
  if (translated) {
    translated = translated.charAt(0).toUpperCase() + translated.slice(1);
  }
  
  return translated;
}

/**
 * Traduce alergenii
 */
function translateAllergens(allergens) {
  if (!allergens || allergens.trim() === '') return '';
  
  // Desparte alergenii după virgulă
  const allergenList = allergens.split(',').map(a => a.trim());
  const translatedList = allergenList.map(allergen => {
    return ALLERGEN_TRANSLATIONS[allergen] || allergen;
  });
  
  return translatedList.join(', ');
}

/**
 * Verifică dacă o traducere este incompletă sau incorectă
 */
function needsRetranslation(originalText, translatedText, isAllergen = false) {
  if (!translatedText || translatedText.trim() === '') return true;
  if (translatedText === originalText) return true;
  
  const lowerTranslated = translatedText.toLowerCase();
  
  // Verifică dacă conține cuvinte românești netradu se
  const romanianWords = [
    'sec', 'vin', 'alc', 'crama', 'cafea', 'fără', 'cofeină', 'cu', 'lapte',
    'băutură', 'suc', 'de', 'piure', 'frișcă', 'lichidă', 'clasic',
    'premium', 'proaspătă', 'naturală', 'prăjită', 'panate', 'prăjite',
    'sote', 'în', 'unt', 'aromat', 'sălbatic', 'asortate', 'ouă', 'somon',
    'fume', 'pâine', 'ton', 'maioneză', 'măsline', 'capere', 'cașcaval',
    'broccoli', 'legume', 'orez', 'mămăligă', 'varză', 'morcov', 'mărar',
    'murături', 'paste', 'fresh', 'cremă', 'vegetală', 'brânză', 'ou',
    'mascarpone', 'dulceață', 'vișine', 'nutella', 'banană', 'biscuiți',
    'vanilie', 'caramel', 'ciocolată', 'zahăr', 'brun', 'apă', 'carbogazoasă',
    'mentă', 'triplu', 'gin', 'rom', 'porție', 'felie', 'draught', 'robinet'
  ];
  
  // Verifică cuvinte greșite generate de traducere automată
  const badTranslations = [
    'witheggt', 'of/from', 'at/to', 'attte', 'ofcofeinizată', 'coatda',
    'batnc', 'orvignon', 'withvee', 'tequiat', 'seggr', 'bitteretto',
    'whipond', 'niwithlițel', 'kaatmata', 'caonre', 'otelat', 'ofmisec',
    'ceggr', 'atva', 'attrge', 'catssic', 'catsic', 'onpsi', 'chocoatte',
    'vanilat', 'frapon', 'lemonaof', 'bpineapple', 'beneoftto', 'patge',
    'fatt', 'franwithzesc', 'cakeellini', 'gorgonzoat', 'mozzarelat',
    'atsagna', 'onnne', 'halleggmi', 'tunano'
  ];
  
  // Verifică dacă conține cuvinte românești necorecte (exceptând brand names)
  for (const word of romanianWords) {
    if (lowerTranslated.includes(word) && !isAllergen) {
      // Verifică dacă nu este parte dintr-un brand name sau expresie validă
      const validExpressions = ['sec', 'premium', 'classic', 'fresh'];
      if (!validExpressions.includes(word)) {
        return true;
      }
    }
  }
  
  // Verifică traduceri greșite
  for (const bad of badTranslations) {
    if (lowerTranslated.includes(bad)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Procesează toate produsele și corectează traducerile
 */
async function fixExistingTranslations() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Eroare la conectarea la baza de date:', err);
        reject(err);
        return;
      }
      console.log('✅ Conectat la baza de date\n');
    });

    db.all(
      `SELECT id, name, name_en, description, description_en, allergens, allergens_en, category, category_en 
       FROM menu 
       WHERE is_sellable = 1 
       ORDER BY id`,
      [],
      async (err, products) => {
        if (err) {
          console.error('❌ Eroare la citirea produselor:', err);
          reject(err);
          return;
        }

        console.log(`📊 Găsite ${products.length} produse active\n`);
        console.log(`🔍 Verificare și corectare traduceri...\n`);

        let fixed = 0;
        let alreadyCorrect = 0;
        let errors = 0;

        for (const product of products) {
          try {
            const updates = {};
            let needsUpdate = false;

            // Verifică și corectează descrierea
            if (product.description) {
              const shouldRetranslate = needsRetranslation(
                product.description,
                product.description_en,
                false
              );

              if (shouldRetranslate) {
                updates.description_en = translateDescription(product.description);
                needsUpdate = true;
                console.log(`🔧 ${product.id}. ${product.name}`);
                console.log(`   ❌ Vechi: ${product.description_en || 'NULL'}`);
                console.log(`   ✅ Nou: ${updates.description_en}`);
              }
            }

            // Verifică și corectează alergenii
            if (product.allergens) {
              const shouldRetranslate = needsRetranslation(
                product.allergens,
                product.allergens_en,
                true
              );

              if (shouldRetranslate || !product.allergens_en) {
                updates.allergens_en = translateAllergens(product.allergens);
                needsUpdate = true;
                if (!updates.description_en) {
                  console.log(`🔧 ${product.id}. ${product.name}`);
                }
                console.log(`   🔧 Alergeni: ${product.allergens} → ${updates.allergens_en}`);
              }
            }

            if (needsUpdate) {
              // Actualizează baza de date
              const setClause = [];
              const values = [];

              if (updates.description_en !== undefined) {
                setClause.push('description_en = ?');
                values.push(updates.description_en);
              }
              if (updates.allergens_en !== undefined) {
                setClause.push('allergens_en = ?');
                values.push(updates.allergens_en);
              }

              values.push(product.id);

              const query = `UPDATE menu SET ${setClause.join(', ')} WHERE id = ?`;

              await new Promise((resolveUpdate, rejectUpdate) => {
                db.run(query, values, function (updateErr) {
                  if (updateErr) {
                    console.error(`   ❌ Eroare la actualizare:`, updateErr.message);
                    errors++;
                    rejectUpdate(updateErr);
                  } else {
                    fixed++;
                    console.log(`   ✅ Actualizat\n`);
                    resolveUpdate();
                  }
                });
              });
            } else {
              alreadyCorrect++;
            }
          } catch (error) {
            console.error(`❌ Eroare la procesarea #${product.id}:`, error);
            errors++;
          }
        }

        console.log(`\n📈 REZULTATE FINALE:`);
        console.log(`✅ Produse corectate: ${fixed}`);
        console.log(`✓  Produse deja corecte: ${alreadyCorrect}`);
        console.log(`❌ Erori: ${errors}`);
        console.log(`📊 Total procesate: ${products.length}\n`);

        db.close();
        resolve({ fixed, alreadyCorrect, errors, total: products.length });
      }
    );
  });
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 VERIFICARE ȘI CORECTARE TRADUCERI EXISTENTE\n');
  console.log('Acest script va:');
  console.log('- Verifica toate descrierile traduse');
  console.log('- Verifica toți alergenii traduși');
  console.log('- Corecta traducerile incomplete sau incorecte\n');

  try {
    const result = await fixExistingTranslations();

    console.log('✅ VERIFICARE COMPLETATĂ CU SUCCES!\n');

    // Verificare finală
    console.log('📊 VERIFICARE FINALĂ...\n');
    const db = new sqlite3.Database(DB_PATH);
    
    db.get(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN description_en IS NOT NULL AND description_en != '' THEN 1 END) as with_desc_en,
        COUNT(CASE WHEN allergens IS NOT NULL AND allergens != '' AND (allergens_en IS NULL OR allergens_en = '') THEN 1 END) as missing_allergen_translation
       FROM menu 
       WHERE is_sellable = 1`,
      [],
      (err, stats) => {
        if (err) {
          console.error('Eroare la verificare:', err);
        } else {
          console.log(`Total produse: ${stats.total}`);
          console.log(`Cu description_en: ${stats.with_desc_en} (${((stats.with_desc_en / stats.total) * 100).toFixed(1)}%)`);
          console.log(`Lipsă traducere alergeni: ${stats.missing_allergen_translation}`);
        }
        db.close();
      }
    );
  } catch (error) {
    console.error('❌ EROARE:', error);
    process.exit(1);
  }
}

// Rulează scriptul
main();
