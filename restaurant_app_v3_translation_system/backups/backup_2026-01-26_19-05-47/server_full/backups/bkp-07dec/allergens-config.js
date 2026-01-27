/**
 * CONFIGURAȚIE ALERGENI - CONFORM REGULAMENT UE 1169/2011
 * 
 * Lista celor 14 alergeni majori obligatorii în UE
 */

// 14 Alergeni Majori UE (Anexa II)
const EU_ALLERGENS = {
  // Cod intern: { ro, en, icon, common_sources }
  
  'gluten': {
    ro: 'Gluten',
    en: 'Gluten',
    icon: '🌾',
    description_ro: 'Cereale care conțin gluten (grâu, secară, orz, ovăz, mei, speltă)',
    description_en: 'Cereals containing gluten (wheat, rye, barley, oats, spelt)',
    common_in: ['pâine', 'paste', 'pizza', 'bere', 'sosuri']
  },
  
  'crustaceans': {
    ro: 'Crustacee',
    en: 'Crustaceans',
    icon: '🦞',
    description_ro: 'Crustacee și produse derivate',
    description_en: 'Crustaceans and products thereof',
    common_in: ['creveți', 'crab', 'homari', 'sosuri asiatice']
  },
  
  'eggs': {
    ro: 'Ouă',
    en: 'Eggs',
    icon: '🥚',
    description_ro: 'Ouă și produse din ouă',
    description_en: 'Eggs and products thereof',
    common_in: ['maioneză', 'paste', 'prăjituri', 'înghețată']
  },
  
  'fish': {
    ro: 'Pește',
    en: 'Fish',
    icon: '🐟',
    description_ro: 'Pește și produse din pește',
    description_en: 'Fish and products thereof',
    common_in: ['file de pește', 'sushi', 'sos de pește', 'salate']
  },
  
  'peanuts': {
    ro: 'Arahide',
    en: 'Peanuts',
    icon: '🥜',
    description_ro: 'Arahide și produse derivate',
    description_en: 'Peanuts and products thereof',
    common_in: ['unt de arahide', 'sosuri satay', 'deserturi']
  },
  
  'soybeans': {
    ro: 'Soia',
    en: 'Soybeans',
    icon: '🫘',
    description_ro: 'Soia și produse din soia',
    description_en: 'Soybeans and products thereof',
    common_in: ['tofu', 'sos soia', 'edamame', 'miso']
  },
  
  'milk': {
    ro: 'Lapte',
    en: 'Milk',
    icon: '🥛',
    description_ro: 'Lapte și produse lactate (inclusiv lactoză)',
    description_en: 'Milk and products thereof (including lactose)',
    common_in: ['brânză', 'unt', 'smântână', 'înghețată', 'ciocolată']
  },
  
  'nuts': {
    ro: 'Fructe cu coajă',
    en: 'Tree nuts',
    icon: '🌰',
    description_ro: 'Fructe cu coajă lemnoasă (migdale, alune, nuci, caju, etc.)',
    description_en: 'Tree nuts (almonds, hazelnuts, walnuts, cashews, etc.)',
    common_in: ['deserturi', 'salate', 'pesto', 'ciocolată']
  },
  
  'celery': {
    ro: 'Țelină',
    en: 'Celery',
    icon: '🥬',
    description_ro: 'Țelină și produse derivate',
    description_en: 'Celery and products thereof',
    common_in: ['supe', 'ciorbe', 'salate', 'sosuri']
  },
  
  'mustard': {
    ro: 'Muștar',
    en: 'Mustard',
    icon: '🌭',
    description_ro: 'Muștar și produse derivate',
    description_en: 'Mustard and products thereof',
    common_in: ['sosuri', 'maioneză', 'dressing-uri', 'marinări']
  },
  
  'sesame': {
    ro: 'Susan',
    en: 'Sesame',
    icon: '🌾',
    description_ro: 'Semințe de susan și produse derivate',
    description_en: 'Sesame seeds and products thereof',
    common_in: ['pâine', 'tahini', 'hummus', 'salate']
  },
  
  'sulphites': {
    ro: 'Sulfiți',
    en: 'Sulphites',
    icon: '🍷',
    description_ro: 'Dioxid de sulf și sulfiți (>10 mg/kg sau >10 mg/L)',
    description_en: 'Sulphur dioxide and sulphites (>10 mg/kg or >10 mg/L)',
    common_in: ['vin', 'bere', 'fructe uscate', 'conserve']
  },
  
  'lupin': {
    ro: 'Lupin',
    en: 'Lupin',
    icon: '🌸',
    description_ro: 'Lupin și produse derivate',
    description_en: 'Lupin and products thereof',
    common_in: ['făină', 'paste', 'produse de patiserie']
  },
  
  'molluscs': {
    ro: 'Moluște',
    en: 'Molluscs',
    icon: '🦪',
    description_ro: 'Moluște și produse derivate',
    description_en: 'Molluscs and products thereof',
    common_in: ['midii', 'scoici', 'caracatiță', 'calamari']
  }
};

// Mapping alternative names → cod standard
const ALLERGEN_ALIASES = {
  // Romanian variations
  'gluten': 'gluten',
  'cereale cu gluten': 'gluten',
  'grâu': 'gluten',
  'pâine': 'gluten',
  
  'crustacee': 'crustaceans',
  'creveti': 'crustaceans',
  'creveți': 'crustaceans',
  'crab': 'crustaceans',
  
  'oua': 'eggs',
  'ouă': 'eggs',
  'ou': 'eggs',
  
  'peste': 'fish',
  'pește': 'fish',
  
  'arahide': 'peanuts',
  
  'soia': 'soybeans',
  'soya': 'soybeans',
  
  'lapte': 'milk',
  'lactate': 'milk',
  'branza': 'milk',
  'brânză': 'milk',
  'unt': 'milk',
  'smantana': 'milk',
  'smântână': 'milk',
  
  'fructe cu coaja': 'nuts',
  'fructe cu coajă': 'nuts',
  'nuci': 'nuts',
  'alune': 'nuts',
  'migdale': 'nuts',
  'caju': 'nuts',
  'cashew': 'nuts',
  
  'telina': 'celery',
  'țelină': 'celery',
  
  'mustar': 'mustard',
  'muștar': 'mustard',
  
  'susan': 'sesame',
  
  'sulfiti': 'sulphites',
  'sulfiți': 'sulphites',
  'dioxid de sulf': 'sulphites',
  
  'lupin': 'lupin',
  
  'moluste': 'molluscs',
  'moluște': 'molluscs',
  'scoici': 'molluscs',
  'midii': 'molluscs',
  
  // OpenFoodFacts format
  'en:gluten': 'gluten',
  'en:eggs': 'eggs',
  'en:fish': 'fish',
  'en:milk': 'milk',
  'en:nuts': 'nuts',
  'en:crustaceans': 'crustaceans',
  'en:molluscs': 'molluscs',
  'en:celery': 'celery',
  'en:mustard': 'mustard',
  'en:sesame-seeds': 'sesame',
  'en:sulphur-dioxide-and-sulphites': 'sulphites',
  'en:lupin': 'lupin',
  'en:peanuts': 'peanuts',
  'en:soybeans': 'soybeans',
  'fr:amandons': 'nuts'
};

/**
 * Normalizează string alergeni la format standard
 * @param {string} allergensString - String brut din DB (poate fi JSON, CSV, etc.)
 * @returns {Array} - Array de coduri standard alergeni
 */
function parseAllergens(allergensString) {
  if (!allergensString || allergensString.trim() === '') {
    return [];
  }
  
  let allergensList = [];
  
  try {
    // Încearcă să parseze ca JSON
    const parsed = JSON.parse(allergensString);
    allergensList = Array.isArray(parsed) ? parsed.flat() : [parsed];
  } catch (e) {
    // Nu e JSON valid, split by comma
    allergensList = allergensString.split(',').map(a => a.trim());
  }
  
  // Normalizează fiecare alergen
  const normalized = allergensList
    .map(a => String(a).trim().toLowerCase())
    .filter(a => a && a !== '[]' && a !== 'nu specificat')
    .map(a => ALLERGEN_ALIASES[a] || a)
    .filter(a => EU_ALLERGENS[a]); // Păstrează doar alergeni valizi
  
  // Elimină duplicate
  return [...new Set(normalized)];
}

/**
 * Formatează alergeni pentru afișare
 * @param {Array} allergenCodes - Array de coduri alergeni
 * @param {string} lang - Limba ('ro' sau 'en')
 * @param {boolean} withIcons - Include emoji icons
 * @returns {string} - String formatat pentru afișare
 */
function formatAllergens(allergenCodes, lang = 'ro', withIcons = true) {
  if (!allergenCodes || allergenCodes.length === 0) {
    return lang === 'ro' ? 'Nu conține alergeni declarați' : 'No declared allergens';
  }
  
  return allergenCodes
    .map(code => {
      const allergen = EU_ALLERGENS[code];
      if (!allergen) return null;
      
      const name = allergen[lang];
      const icon = withIcons ? `${allergen.icon} ` : '';
      
      return `${icon}${name}`;
    })
    .filter(Boolean)
    .join(', ');
}

/**
 * Obține lista completă de alergeni cu detalii
 * @param {Array} allergenCodes - Array de coduri alergeni
 * @param {string} lang - Limba
 * @returns {Array} - Array de obiecte cu detalii complete
 */
function getAllergenDetails(allergenCodes, lang = 'ro') {
  return allergenCodes
    .map(code => {
      const allergen = EU_ALLERGENS[code];
      if (!allergen) return null;
      
      return {
        code: code,
        name: allergen[lang],
        icon: allergen.icon,
        description: allergen[`description_${lang}`]
      };
    })
    .filter(Boolean);
}

module.exports = {
  EU_ALLERGENS,
  ALLERGEN_ALIASES,
  parseAllergens,
  formatAllergens,
  getAllergenDetails
};

