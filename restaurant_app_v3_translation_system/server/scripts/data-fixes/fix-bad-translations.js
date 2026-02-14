/**
 * Script pentru repararea traducerilor corupte de înlocuiri parțiale
 * Rezolvă probleme gen: "Franwithzesc", "Eggă", "Halleggmi", "Onnne", etc.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'restaurant.db');

// Dicționar de reparații (Text greșit -> Text corect)
const REPAIRS = {
  // Fix 'cu' -> 'with' replacements
  'Franwithzesc': 'French',
  'Withvee': 'Cuvee',
  'Biswithiți': 'Biscuits',
  'Niwithlițel': 'Niculițel',
  'Franwithzesc': 'French',
  'Mochia': 'Mochia',
  
  // Fix 'la' -> 'at' replacements
  'Atva': 'Lava',
  'At Patge': 'La Plage',
  'Patge': 'Plage',
  'Fatt': 'Flat',
  'Attte': 'Latte',
  'Coatda': 'Colada',
  'Batnc': 'Blanc',
  'Otelat': 'Otella',
  'Atte': 'Latte',
  'Kaatmata': 'Kalamata',
  'Salat': 'Salad',
  'Ciocoatte': 'Chocolate',
  'Chocoatte': 'Chocolate',
  
  // Fix 'ou' -> 'egg' replacements
  'Eggă': 'Eggs',
  'Halleggmi': 'Halloumi',
  'Seggr': 'Sour',
  'Ceggr': 'Cour',
  'Ceggrvoisier': 'Courvoisier',
  'Tequiat': 'Tequila',
  'Witheggt': 'Without',
  
  // Fix 'de' -> 'of' replacements
  'Beneoftto': 'Benedetto',
  'Ofcofeinizată': 'Decaffeinated',
  'Ofmisec': 'Demisec',
  'Lemonaof': 'Lemonade',
  'Măslin': 'Oliver',
  
  // Fix 'pe' -> 'on' replacements
  'Onpsi': 'Pepsi',
  'Onnne': 'Penne',
  'Caonre': 'Capers',
  'Frapon': 'Frappe',
  'Melon': 'Melon',
  
  // Fix 'sa' -> ???
  // Verificați logurile anterioare dacă există
  
  // Fix 'pa' -> ???
  'Pattegg': 'Plateau',
  
  // Alte corecții specifice
  'Amaretto Disaronno': 'Amaretto Disaronno',
  'Campari': 'Campari',
  'Campari Orange': 'Campari Orange',
  'Martini': 'Martini',
  'Aperol Spritz': 'Aperol Spritz',
  'Hugo': 'Hugo',
  'Cuba Libre': 'Cuba Libre',
  'Mojito': 'Mojito',
  'Pina Colada': 'Pina Colada',
  'Margarita': 'Margarita',
  'Tequila Sunrise': 'Tequila Sunrise',
  'Cosmopolitan': 'Cosmopolitan',
  'Kamikaze': 'Kamikaze',
  'B52': 'B52',
  'Jagerbomb': 'Jagerbomb',
  'Long Island': 'Long Island',
  'Mai Tai': 'Mai Tai',
  'Orgasm': 'Orgasm',
  'Godfather': 'Godfather',
  'White Russian': 'White Russian',
  'Black Russian': 'Black Russian',
  'Bloody Mary': 'Bloody Mary',
  'Gin Tonic': 'Gin Tonic',
  'Screwdriver': 'Screwdriver',
  'Caipiroska': 'Caipiroska',
  'Caipirinha': 'Caipirinha',
};

// Dicționar pentru traduceri corecte (cuvânt cu cuvânt)
// Se aplică DOAR dacă cuvântul este găsit exact (cu boundary check)
const WORD_TRANSLATIONS = {
  // Cuvinte de legătură
  'cu': 'with',
  'de': 'of',
  'la': 'at',
  'pe': 'on',
  'fără': 'without',
  
  // Ingrediente
  'ceapă': 'onion',
  'ardei': 'peppers',
  'kapia': 'kapia',
  'brânză': 'cheese',
  'telemea': 'telemea',
  'roșii': 'tomatoes',
  'castraveți': 'cucumbers',
  'salată': 'salad',
  'varză': 'cabbage',
  'morcov': 'carrot',
  'mărar': 'dill',
  'găină': 'hen',
  'pui': 'chicken',
  'vită': 'beef',
  'porc': 'pork',
  'oaie': 'mutton',
  'pește': 'fish',
  'cartofi': 'potatoes',
  'prăjiți': 'fries',
  'piure': 'mashed',
  'orez': 'rice',
  'ciuperci': 'mushrooms',
  'usturoi': 'garlic',
  'smântână': 'sour cream',
  'ouă': 'eggs',
  'ou': 'egg',
  'șuncă': 'ham',
  'bacon': 'bacon', // unchanged
  'kaizer': 'kaiser',
  'cârnați': 'sausages',
  'mici': 'grilled minced meat rolls',
  'muștar': 'mustard',
  'pâine': 'bread',
  'chiflă': 'bun',
  'sos': 'sauce',
  'fructe': 'fruits',
  'mare': 'sea', // fructe de mare -> seafood (handle phrase)
  
  // Expresii/Adjective
  'mic': 'small',
  'mare': 'large',
  'mediu': 'medium',
  'picant': 'spicy',
  'dulce': 'sweet',
  'sărat': 'salty',
  'acru': 'sour',
  'proaspăt': 'fresh',
  'cald': 'hot',
  'rece': 'cold',
  'alb': 'white',
  'roșu': 'red',
  'negru': 'black',
  'verde': 'green',
  'asortat': 'assorted',
  'vegetarian': 'vegetarian',
  'tradițional': 'traditional',
  'țărănească': 'peasant style', // sau traditional
  'țărănesc': 'peasant style',
  'franțuzesc': 'french', // Francuzesc already handled in repairs
  'italian': 'italian',
  'grecesc': 'greek',
  'mexican': 'mexican',
};

// Expresii complexe (prioritate mare)
const PHRASE_TRANSLATIONS = {
  'fructe de mare': 'seafood',
  'mic dejun': 'breakfast',
  'cartofi prăjiți': 'french fries',
  'ceapă roșie': 'red onion',
  'ardei iute': 'chili pepper',
  'ardei gras': 'bell pepper',
  'piept de pui': 'chicken breast',
  'mușchi de vită': 'beef tenderloin',
  'mușchi de porc': 'pork tenderloin',
  'cotlet de porc': 'pork chop',
  'ceafă de porc': 'pork neck',
  'aripioare de pui': 'chicken wings',
  'ficăței de pui': 'chicken liver',
  'supă cremă': 'cream soup',
  'ciorbă de burtă': 'tripe soup',
  'ciorbă de văcuță': 'beef soup',
  'ciorbă de pui': 'chicken soup',
  'ciorbă de perișoare': 'meatball soup',
  'ciorbă de fasole': 'bean soup',
  'fasole bătută': 'mashed beans',
  'salată de vinete': 'eggplant salad',
  'salată boeuf': 'beef salad',
  'salată orientală': 'oriental salad',
  'brânză de burduf': 'bellows cheese',
  'mămăligă': 'polenta',
  'ardei copt': 'roasted pepper',
};

/**
 * Aplică reparații asupra textului (string replace simplu)
 */
function applyRepairs(text) {
  if (!text) return text;
  let res = text;
  for (const [bad, good] of Object.entries(REPAIRS)) {
    // Folosim regex global case-insensitive pentru reparații de cuvinte stricate
    // Aici putem fi mai agresivi fiindcă știm că "Franwithzesc" e gunoi
    const regex = new RegExp(bad, 'gi'); 
    res = res.replace(regex, good);
  }
  return res;
}

/**
 * Traduce text folosind dicționare (expresii apoi cuvinte cu boundary)
 */
function smartTranslate(text) {
  if (!text) return text;
  
  let translated = text;
  
  // 1. Traduce expresii (case insensitive)
  const sortedPhrases = Object.keys(PHRASE_TRANSLATIONS).sort((a, b) => b.length - a.length);
  for (const phrase of sortedPhrases) {
    const translation = PHRASE_TRANSLATIONS[phrase];
    // Match expresie exactă (ignoring case)
    const regex = new RegExp(phrase, 'gi');
    translated = translated.replace(regex, (match) => {
      // Păstrează capitalizarea originală dacă e posibil (basic)
      if (match[0] === match[0].toUpperCase()) {
        return translation.charAt(0).toUpperCase() + translation.slice(1);
      }
      return translation;
    });
  }
  
  // 2. Traduce cuvinte individuale (cu word boundaries \b)
  // Pentru limba română, \b nu prinde bine caracterele speciale (ă, î, ș, ț, â)
  // Construim un regex custom pentru boundaries
  const sortedWords = Object.keys(WORD_TRANSLATIONS).sort((a, b) => b.length - a.length);
  
  for (const word of sortedWords) {
    const translation = WORD_TRANSLATIONS[word];
    
    // Regex boundary: (?<=^|[^a-zA-ZăâîșțĂÂÎȘȚ])CUVANT(?=$|[^a-zA-ZăâîșțĂÂÎȘȚ])
    // Dar JS suportă lookbehind doar în versiuni noi.
    // Alternativă sigură: (^|[^a-zA-ZăâîșțĂÂÎȘȚ0-9])(CUVANT)(?=$|[^a-zA-ZăâîșțĂÂÎȘȚ0-9])
    
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-ZăâîșțĂÂÎȘȚ0-9])(${escapedWord})(?=$|[^a-zA-ZăâîșțĂÂÎȘȚ0-9])`, 'gi');
    
    translated = translated.replace(regex, (fullMatch, prefix, matchStr) => {
      // Verifică dacă e deja tradus (evită dubla traducere dacă cuvântul țintă e în sursă)
      // Aici simplificăm și înlocuim.
      
      let replacement = translation;
      if (matchStr[0] === matchStr[0].toUpperCase()) {
        replacement = translation.charAt(0).toUpperCase() + translation.slice(1);
      }
      return prefix + replacement;
    });
  }
  
  return translated;
}

async function fixMenu() {
  const db = new sqlite3.Database(DB_PATH);
  
  console.log('🔧 START REPARARE TRADUCERI MENIU...');
  
  db.all(`SELECT id, name, name_en, description, description_en, category, category_en 
          FROM menu 
          WHERE is_sellable = 1`, [], async (err, rows) => {
    
    if (err) {
      console.error(err);
      return;
    }
    
    let corrections = 0;
    
    for (const row of rows) {
      let newNameEn = row.name_en;
      let newDescEn = row.description_en;
      let needsUpdate = false;
      
      // 1. Aplică reparații (fix botches)
      const repairedName = applyRepairs(newNameEn);
      if (repairedName !== newNameEn) {
        console.log(`🔨 [NAME REPAIR] ${newNameEn} -> ${repairedName}`);
        newNameEn = repairedName;
        needsUpdate = true;
      }
      
      const repairedDesc = applyRepairs(newDescEn);
      if (repairedDesc !== newDescEn) {
        console.log(`🔨 [DESC REPAIR] ${newDescEn} -> ${repairedDesc}`);
        newDescEn = repairedDesc;
        needsUpdate = true;
      }
      
      // 2. Aplică traduceri smart (pentru ce a rămas netradus)
      // Dacă textul conține încă cuvinte românești uzuale
      const translatedName = smartTranslate(newNameEn);
      if (translatedName !== newNameEn) {
        console.log(`✨ [NAME TRANSLATE] ${newNameEn} -> ${translatedName}`);
        newNameEn = translatedName;
        needsUpdate = true;
      }
      
      const translatedDesc = smartTranslate(newDescEn);
      if (translatedDesc !== newDescEn) {
        console.log(`✨ [DESC TRANSLATE] ${newDescEn} -> ${translatedDesc}`);
        newDescEn = translatedDesc;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await new Promise(resolve => {
          db.run(`UPDATE menu SET name_en = ?, description_en = ? WHERE id = ?`, 
                 [newNameEn, newDescEn, row.id], (e) => {
            if (e) console.error(e);
            corrections++;
            resolve();
          });
        });
      }
    }
    
    console.log(`✅ FINALIZAT. ${corrections} produse actualizate.`);
    db.close();
  });
}

fixMenu();
