/**
 * MENU DATA SERVICE
 * 
 * Serviciu pentru pregătirea datelor meniu pentru generare PDF
 * Include: produse, categorii, alergeni, gramaje, prețuri, traduceri
 */

const sqlite3 = require('sqlite3').verbose();
const { parseAllergens, formatAllergens } = require('../allergens-config');
const path = require('path');
const fs = require('fs');

// Cache database connection
let db = null;

function getDB() {
  if (!db) {
    const dbPath = path.join(__dirname, '..', 'restaurant.db');
    db = new sqlite3.Database(dbPath);
  }
  return db;
}

/**
 * Obține datele complete pentru meniu (food sau drinks)
 * Respectă configurația din menu_pdf_categories și menu_pdf_products
 * @param {string} type - 'food' sau 'drinks'
 * @param {string} lang - 'ro' sau 'en'
 * @returns {Promise<Object>} - Date structurate pentru PDF
 */
async function getMenuData(type, lang = 'ro') {
  const db = getDB();
  
  console.log(`📊 [MenuDataService] Obțin date pentru ${type} (${lang})...`);
  
  // STEP 1: Obține categorii configurate (doar cele vizibile, în ordinea configurată)
  const configuredCategories = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        id, 
        category_name,
        order_index,
        header_image,
        page_break_after
      FROM menu_pdf_categories
      WHERE category_type = ?
      AND display_in_pdf = 1
      ORDER BY order_index ASC
    `, [type], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  if (configuredCategories.length === 0) {
    console.log(`   ⚠️  Nicio categorie configurată pentru ${type}!`);
    return {
      restaurant: await getRestaurantInfo(),
      categories: [],
      metadata: {
        type: type,
        lang: lang,
        generated_at: new Date().toISOString(),
        generated_at_formatted: new Date().toLocaleString(lang === 'ro' ? 'ro-RO' : 'en-US'),
        total_products: 0,
        total_categories: 0
      }
    };
  }
  
  console.log(`   ✅ ${configuredCategories.length} categorii configurate`);
  
  // STEP 2: Pentru fiecare categorie, obține produse configurate
  const groupedCategories = [];
  let totalProducts = 0;
  
  for (const categoryConfig of configuredCategories) {
    const categoryName = categoryConfig.category_name;
    
    // Obține produse pentru această categorie (doar cele vizibile, în ordinea configurată)
    const products = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          m.id, m.name, m.name_en, 
          m.category, m.category_en,
          m.description, m.description_en,
          m.price, m.weight,
          m.allergens, m.allergens_en,
          m.image_url,
          pdfp.custom_image,
          pdfp.custom_order
        FROM menu m
        LEFT JOIN menu_pdf_products pdfp ON m.id = pdfp.product_id
        WHERE m.category = ?
        AND m.is_sellable = 1
        AND (pdfp.display_in_pdf IS NULL OR pdfp.display_in_pdf = 1)
        ORDER BY COALESCE(pdfp.custom_order, m.display_order, 0) ASC, m.name ASC
      `, [categoryName], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Skip categorii fără produse
    if (products.length === 0) {
      continue;
    }
    
    totalProducts += products.length;
    
    // Obține traducerea categoriei (primul produs o are în category_en)
    const firstProduct = products[0];
    
    // Calculează împărțirea optimă pentru această categorie
    const split = calculateOptimalSplit(products.length);
    
    // Calculează pozițiile unde trebuie page break
    const breakPositions = [];
    let cumulativeCount = 0;
    for (let i = 0; i < split.perPage.length - 1; i++) {
      cumulativeCount += split.perPage[i];
      breakPositions.push(cumulativeCount - 1); // Index de la 0
    }
    
    // Creează categorie cu produse + info despre split optim
    const formattedProducts = products.map((p, index) => {
      const formatted = formatProductForPDF(p, lang);
      formatted.should_break_after = breakPositions.includes(index);
      formatted.index_in_category = index;
      return formatted;
    });
    
    // Traduce numele categoriei
    let categoryNameTranslated;
    if (lang === 'ro') {
      categoryNameTranslated = categoryName;
    } else {
      // ENGLEZĂ: Folosește category_en dacă există, altfel traduce automat
      categoryNameTranslated = (firstProduct.category_en && firstProduct.category_en.trim()) 
        ? firstProduct.category_en.trim()
        : translateCategory(categoryName);
    }
    
    const categoryData = {
      name_ro: categoryName,
      name_en: categoryNameTranslated,
      icon: getCategoryIcon(categoryName),
      category_image_url: categoryConfig.header_image || getCategoryImageUrl(categoryName), // Folosește header_image din config
      page_break_after: categoryConfig.page_break_after === 1, // Flag pentru page break
      products: formattedProducts,
      // INFO ÎMPĂRȚIRE OPTIMĂ
      split_info: {
        total_products: products.length,
        pages: split.pages,
        per_page: split.perPage, // [4, 4] sau [5, 5, 5], etc.
        is_single_page: split.pages === 1,
        break_positions: breakPositions // [3, 7] pentru 4+4+...
      }
    };
    
    groupedCategories.push(categoryData);
  }
  
  console.log(`   ✅ ${totalProducts} produse găsite`);
  console.log(`   🔍 Limba setată: ${lang}`);
  console.log(`   📊 Categorii: ${groupedCategories.length}`);
  
  // Obține info restaurant
  const restaurantInfo = await getRestaurantInfo();
  
  // Metadata
  const metadata = {
    type: type,
    lang: lang,
    generated_at: new Date().toISOString(),
    generated_at_formatted: new Date().toLocaleString(lang === 'ro' ? 'ro-RO' : 'en-US'),
    total_products: totalProducts,
    total_categories: groupedCategories.length
  };
  
  return {
    restaurant: restaurantInfo,
    categories: groupedCategories,
    metadata: metadata
  };
}

/**
 * Formatează un produs pentru afișare în PDF
 */
function formatProductForPDF(product, lang) {
  // Nume și descriere în limba selectată
  // IMPORTANT: Pentru engleză, folosește DOAR câmpurile _en, FĂRĂ fallback la română
  let name, description;
  
  if (lang === 'ro') {
    name = product.name;
    description = product.description || '';
  } else {
    // ENGLEZĂ: DOAR câmpurile _en, FĂRĂ fallback la română
    name = (product.name_en && product.name_en.trim()) || '[Name not translated]';
    description = (product.description_en && product.description_en.trim()) || '';
  }
  
  // Gramaj/Cantitate
  const portion = product.weight || '';
  
  // Alergeni
  let allergens = [];
  let allergensFormatted = '';
  
  // Pentru engleză, folosește DOAR allergens_en, nu allergens
  const allergensData = lang === 'ro' 
    ? (product.allergens || '[]')
    : (product.allergens_en || product.allergens || '[]');
  
  if (allergensData && allergensData !== '[]') {
    try {
      // Parsează alergeni
      allergens = parseAllergens(allergensData);
      
      if (allergens.length > 0) {
        // Formatează cu emoji icons
        allergensFormatted = formatAllergens(allergens, lang, true);
      } else {
        allergensFormatted = lang === 'ro' 
          ? 'Nu conține alergeni declarați' 
          : 'No declared allergens';
      }
    } catch (e) {
      console.error(`   ⚠️  Eroare parsare alergeni pentru ${product.name}:`, e.message);
      allergensFormatted = lang === 'ro' 
        ? 'Informații indisponibile' 
        : 'Information unavailable';
    }
  } else {
    allergensFormatted = lang === 'ro' 
      ? 'Nu conține alergeni declarați' 
      : 'No declared allergens';
  }
  
  // Aditivi (E-uri)
  let additivesFormatted = '';
  
  // Pentru engleză, folosește DOAR additives_en, nu additives
  const additivesData = lang === 'ro' 
    ? (product.additives || '')
    : (product.additives_en || product.additives || '');
  
  if (additivesData && additivesData.trim() !== '') {
    additivesFormatted = additivesData.trim();
  } else {
    additivesFormatted = lang === 'ro' 
      ? 'Fără aditivi declarați' 
      : 'No declared additives';
  }
  
  // Imagine produs - COMPLET DEZACTIVAT pentru PDF
  // NICIO imagine individuală de produs în PDF (nici food, nici drinks)
  // Doar imaginile categoriilor rămân (cele din header)
  let image_url = null;
  let image_base64 = null;
  
  // MOTIVAȚIE:
  // 1. HTML devine > 500MB cu Base64
  // 2. Imaginile de mâncare apar greșit în meniul de băuturi
  // 3. Layout mai curat și consistent
  
  return {
    id: product.id,
    name: name,
    description: description,
    price: parseFloat(product.price).toFixed(2),
    portion: portion,
    allergens: allergens,
    allergens_formatted: allergensFormatted,
    additives_formatted: additivesFormatted,
    image_url: image_url,
    image_base64: image_base64,
    category: product.category
  };
}

/**
 * Obține URL imagine pentru categorie
 * Bazat pe extracția automată din Word (24 imagini)
 */
function getCategoryImageUrl(categoryName) {
  const categoryImages = {
    // === FOOD CATEGORIES === //
    'Mic Dejun': '/images/menu/categories/mic-dejun-1.png',
    'Aperitive Reci': '/images/menu/categories/aperitive-reci-1.png',
    'Aperitive Calde': '/images/menu/categories/aperitive-calde-1.png',
    'Ciorbe': '/images/menu/categories/ciorbe-1.png',
    'Paste': '/images/menu/categories/paste-1.png',
    'Peste și Fructe de Mare': '/images/menu/categories/peste-fructe-mare-1.png',
    'Fel Principal': '/images/menu/categories/fel-principal-1.jpg',
    'Platouri': '/images/menu/categories/platouri-1.jpg',
    'Fast Food': '/images/menu/categories/burgeri-1.jpg',
    'Burgeri': '/images/menu/categories/burgeri-1.jpg', // Alias
    'Salate': '/images/menu/categories/salate-1.jpg',
    'Salate Însoțitoare': '/images/menu/categories/salate-2.jpg',
    'Pizza': '/images/menu/categories/pizza-1.jpg',
    'Garnituri': '/images/menu/categories/garnituri-1.jpeg',
    'Deserturi': '/images/menu/categories/deserturi-1.jpeg',
    
    // === DRINKS CATEGORIES === //
    'Băuturi și Coctailuri': '/images/menu/categories/deserturi-2.jpeg', // Placeholder
    'Coctailuri Non-Alcoolice': null, // FĂRĂ IMAGINE - evită text fiscal
    'Cafea/Ciocolată/Ceai': '/images/menu/categories/deserturi-3.jpeg', // Placeholder
    'Răcoritoare': '/images/menu/categories/deserturi-4.jpeg' // Placeholder
  };
  
  const imagePath = categoryImages[categoryName];
  
  if (imagePath) {
    const fullPath = path.join(__dirname, '..', 'public', imagePath);
    if (fs.existsSync(fullPath)) {
      // Convert to Base64 for Playwright/Puppeteer embedding
      try {
        const imageBuffer = fs.readFileSync(fullPath);
        const ext = path.extname(imagePath).toLowerCase();
        let mimeType = 'image/jpeg';
        if (ext === '.png') mimeType = 'image/png';
        if (ext === '.webp') mimeType = 'image/webp';
        
        return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
      } catch (e) {
        console.error(`   ⚠️  Eroare citire imagine categorie ${imagePath}:`, e.message);
        return null;
      }
    }
  }
  
  return null;
}

/**
 * Calculează împărțirea optimă pentru o categorie
 * 
 * REGULI FINALE (conform specificației utilizator - 30 Oct 2025):
 * 
 * ⚠️  REGULĂ CRITICĂ: NICIODATĂ < 2 produse pe ultima pagină!
 * 
 * 1. ≤8 produse: TOATE pe 1 pagină
 * 2. >8 produse:
 *    a) Împărțire RELATIV EGALĂ cu MAX 8 produse/pagină
 *    b) Ultima pagină: MINIM 4 produse (garantează > 2)
 *    c) Dacă nu merge cu 8/pag → încearcă 7/pag
 *    d) Dacă ultima < 4 → redistribuie echilibrat
 * 
 * VALIDARE:
 * - 9 produse → [4, 5] ✅ (ultima: 5 ≥ 2)
 * - 10 produse → [5, 5] ✅ (ultima: 5 ≥ 2)
 * - 11 produse → [7, 4] ✅ (ultima: 4 ≥ 2)
 * - 17 produse → [5, 6, 6] ✅ (ultima: 6 ≥ 2)
 * - 30 produse → [8, 8, 8, 6] ✅ (ultima: 6 ≥ 2)
 * - 43 produse → [7, 7, 7, 7, 7, 8] ✅ (ultima: 8 ≥ 2)
 * - 105 produse → [7×15] ✅ (ultima: 7 ≥ 2)
 */
function calculateOptimalSplit(numProducts) {
  // ≤8 produse: TOATE pe 1 pagină
  if (numProducts <= 8) {
    return { pages: 1, perPage: [numProducts] };
  }
  
  // >8 produse: Aplică regulile CORECTE
  
  // PASUL 1: Încearcă cu 8 produse/pagină
  let perPage = 8;
  let fullPages = Math.floor(numProducts / perPage);
  let lastPage = numProducts % perPage;
  
  // Dacă split perfect (toate paginile au 8) SAU ultima pagină are 4-8 produse
  if (lastPage === 0) {
    // Split perfect cu 8 produse pe fiecare pagină
    return { pages: fullPages, perPage: Array(fullPages).fill(perPage) };
  } else if (lastPage >= 4 && lastPage <= 8) {
    // Ultima pagină are 4-8 produse ✅
    const splits = Array(fullPages).fill(perPage);
    splits.push(lastPage);
    return { pages: fullPages + 1, perPage: splits };
  }
  
  // PASUL 2: Dacă ultima < 4 cu 8/pag, încearcă cu 7 produse/pagină
  perPage = 7;
  fullPages = Math.floor(numProducts / perPage);
  lastPage = numProducts % perPage;
  
  if (lastPage === 0) {
    // Split perfect cu 7 produse pe fiecare pagină
    return { pages: fullPages, perPage: Array(fullPages).fill(perPage) };
  } else if (lastPage >= 4 && lastPage <= 8) {
    // Ultima pagină are 4-8 produse ✅
    const splits = Array(fullPages).fill(perPage);
    splits.push(lastPage);
    return { pages: fullPages + 1, perPage: splits };
  }
  
  // PASUL 3: Dacă ultima < 4 cu 7/pag, redistribuie produsele
  // Ex: 43 produse → 6 pagini × 7 = 42, rest 1 (prea mic)
  // Soluție: 5 pagini × 7 + 1 pagină × 8 = 35 + 8 = 43
  if (lastPage > 0 && lastPage < 4) {
    // Reducem numărul de pagini pline și punem restul pe ultima pagină
    const redistributedFullPages = fullPages - 1;
    const redistributedLastPage = perPage + lastPage; // 7 + 1 = 8
    
    if (redistributedLastPage >= 4 && redistributedLastPage <= 8) {
      const splits = Array(redistributedFullPages).fill(perPage);
      splits.push(redistributedLastPage);
      return { pages: redistributedFullPages + 1, perPage: splits };
    }
  }
  
  // FALLBACK: Split echilibrat (cazuri extreme rare)
  const pages = Math.ceil(numProducts / 7);
  const avgPerPage = Math.floor(numProducts / pages);
  const remainder = numProducts % pages;
  
  const splits = Array(pages).fill(avgPerPage);
  // Distribuie restul pe ultimele pagini
  for (let i = 0; i < remainder; i++) {
    splits[splits.length - 1 - i]++;
  }
  
  return { pages, perPage: splits };
}

/**
 * Obține emoji icon pentru categorie
 */
function getCategoryIcon(categoryName) {
  const icons = {
    'Aperitive Reci': '🥗',
    'Aperitive Calde': '🔥',
    'Ciorbe': '🍲',
    'Salate': '🥗',
    'Salate Însoțitoare': '🥬',
    'Pizza': '🍕',
    'Paste': '🍝',
    'Peste și Fructe de Mare': '🐟',
    'Fel Principal': '🥩',
    'Platouri': '🍖',
    'Fast Food': '🍔',
    'Garnituri': '🥔',
    'Deserturi': '🍰',
    'Mic Dejun': '🍳',
    'Sosuri și Pâine': '🍞',
    'Băuturi și Coctailuri': '🍹',
    'Coctailuri Non-Alcoolice': '🥤', // ← NOU
    'Cafea/Ciocolată/Ceai': '☕',
    'Răcoritoare': '🥤'
  };
  
  return icons[categoryName] || '🍽️';
}

/**
 * Traduce categoria în engleză
 */
function translateCategory(categoryRo) {
  const translations = {
    'Aperitive Reci': 'Cold Appetizers',
    'Aperitive Calde': 'Hot Appetizers',
    'Ciorbe': 'Soups',
    'Salate': 'Salads',
    'Salate Însoțitoare': 'Side Salads',
    'Pizza': 'Pizza',
    'Paste': 'Pasta',
    'Peste și Fructe de Mare': 'Fish & Seafood',
    'Fel Principal': 'Main Course',
    'Platouri': 'Platters',
    'Fast Food': 'Fast Food',
    'Garnituri': 'Side Dishes',
    'Deserturi': 'Desserts',
    'Mic Dejun': 'Breakfast',
    'Sosuri și Pâine': 'Sauces & Bread',
    'Băuturi și Coctailuri': 'Drinks & Cocktails',
    'Coctailuri Non-Alcoolice': 'Non-Alcoholic Cocktails', // ← NOU
    'Cafea/Ciocolată/Ceai': 'Coffee/Chocolate/Tea',
    'Răcoritoare': 'Soft Drinks'
  };
  
  return translations[categoryRo] || categoryRo;
}

/**
 * Obține informații restaurant
 */
async function getRestaurantInfo() {
  // TODO: Obține din DB sau config
  return {
    name: 'Restaurant App',
    name_full: 'Restaurant App - Digital Menu System',
    address: 'Str. Exemplu Nr. 123, București',
    phone: '+40 123 456 789',
    email: 'contact@restaurant-app.ro',
    website: 'www.restaurant-app.ro',
    logo_url: '/images/logo.png'
  };
}

module.exports = {
  getMenuData,
  formatProductForPDF,
  getCategoryImageUrl,
  getCategoryIcon
};

