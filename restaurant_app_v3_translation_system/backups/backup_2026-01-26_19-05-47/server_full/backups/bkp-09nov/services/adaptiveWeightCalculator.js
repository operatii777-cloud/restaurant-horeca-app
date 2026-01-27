/**
 * ADAPTIVE WEIGHT CALCULATOR FOR PDF LAYOUT
 * 
 * Algoritm sofisticat de împachetare bazat pe greutate virtuală
 * În loc să numere produse (1, 2, 3...), calculează "greutatea" fiecărui produs
 * bazat pe complexitatea conținutului (descriere, alergeni, badge-uri)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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
 * Obține configurarea globală de greutăți
 */
async function getWeightConfig() {
  const db = getDB();
  
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM menu_pdf_weight_config WHERE id = 1`, (err, row) => {
      if (err) reject(err);
      else resolve(row || getDefaultWeightConfig());
    });
  });
}

/**
 * Configurare implicită (fallback dacă tabelul nu există)
 */
function getDefaultWeightConfig() {
  return {
    max_page_weight: 8.5,
    min_last_page_weight: 4.0,
    base_product_weight: 1.0,
    medium_description_bonus: 0.5,
    medium_description_threshold: 50,
    long_description_bonus: 1.0,
    long_description_threshold: 100,
    allergens_bonus: 0.3,
    product_image_bonus: 1.5,
    special_badge_bonus: 0.2,
    force_category_new_page: 0,
    use_adaptive_weight: 1
  };
}

/**
 * Calculează greutatea unui produs individual
 * 
 * @param {Object} product - Produs din DB
 * @param {Object} config - Configurare greutăți
 * @returns {number} - Greutatea calculată
 */
function calculateProductWeight(product, config) {
  // Dacă există greutate personalizată, folosește-o
  if (product.custom_weight !== null && product.custom_weight !== undefined) {
    return parseFloat(product.custom_weight);
  }
  
  let weight = config.base_product_weight;
  
  // Bonus descriere
  const descLength = (product.description || '').length;
  if (descLength >= config.long_description_threshold) {
    weight += config.long_description_bonus;
  } else if (descLength >= config.medium_description_threshold) {
    weight += config.medium_description_bonus;
  }
  
  // Bonus alergeni
  const allergens = product.allergens || '[]';
  if (allergens && allergens !== '[]' && allergens.trim() !== '') {
    try {
      const parsed = JSON.parse(allergens);
      if (Array.isArray(parsed) && parsed.length > 0) {
        weight += config.allergens_bonus;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  // Bonus badge-uri speciale
  const badges = product.special_badges || '[]';
  if (badges && badges !== '[]' && badges.trim() !== '') {
    try {
      const parsed = JSON.parse(badges);
      if (Array.isArray(parsed) && parsed.length > 0) {
        weight += config.special_badge_bonus * parsed.length;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  // Bonus imagine produs (DEZACTIVAT momentan în PDF)
  // if (product.image_url && product.image_url.trim() !== '') {
  //   weight += config.product_image_bonus;
  // }
  
  return weight;
}

/**
 * ALGORITMUL PRINCIPAL: Calculează pozițiile de page break bazat pe greutăți
 * 
 * @param {Array} products - Lista de produse ordonate
 * @param {Object} config - Configurare greutăți
 * @returns {Object} - { breakPositions: [3, 7, 12], pageWeights: [8.3, 8.1, 7.5, 4.2] }
 */
function calculateAdaptivePageBreaks(products, config) {
  if (!products || products.length === 0) {
    return { breakPositions: [], pageWeights: [], pages: 0 };
  }
  
  // Dacă sistemul adaptiv e dezactivat, folosește logica veche (număr fix)
  if (config.use_adaptive_weight === 0) {
    return calculateFixedNumberBreaks(products.length);
  }
  
  const breakPositions = [];
  const pageWeights = [];
  let currentPageWeight = 0;
  let currentPageProducts = [];
  
  // PASUL 1: Distribuție inițială bazată pe greutăți
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productWeight = calculateProductWeight(product, config);
    
    // Forțare manuală page break?
    if (product.force_page_break_after === 1 && i < products.length - 1) {
      // Adaugă produsul curent la pagina actuală
      currentPageWeight += productWeight;
      currentPageProducts.push(i);
      
      // Salvează pagina și începe una nouă
      pageWeights.push(currentPageWeight);
      breakPositions.push(i); // Break DUPĂ acest produs
      currentPageWeight = 0;
      currentPageProducts = [];
      continue;
    }
    
    // Verifică dacă produsul încape pe pagina curentă
    if (currentPageWeight + productWeight > config.max_page_weight && currentPageProducts.length > 0) {
      // Pagina curentă e plină, salvează-o
      pageWeights.push(currentPageWeight);
      breakPositions.push(i - 1); // Break DUPĂ ultimul produs de pe pagina anterioară
      
      // Începe pagină nouă cu produsul curent
      currentPageWeight = productWeight;
      currentPageProducts = [i];
    } else {
      // Produsul încape pe pagina curentă
      currentPageWeight += productWeight;
      currentPageProducts.push(i);
    }
  }
  
  // Adaugă ultima pagină
  if (currentPageProducts.length > 0) {
    pageWeights.push(currentPageWeight);
  }
  
  // PASUL 2: Validare și redistribuire pentru ultima pagină
  if (pageWeights.length > 1) {
    const lastPageWeight = pageWeights[pageWeights.length - 1];
    
    if (lastPageWeight < config.min_last_page_weight) {
      console.log(`   ⚠️  Ultima pagină prea ușoară (${lastPageWeight.toFixed(2)} < ${config.min_last_page_weight}), redistribuie...`);
      
      // Redistribuie: mută ultimul/ultimele produse de pe penultima pagină pe ultima
      const penultimatePageEndIndex = breakPositions[breakPositions.length - 1];
      let productsToMove = 1;
      let movedWeight = 0;
      
      // Calculează câte produse trebuie mutate pentru a ajunge la min_last_page_weight
      for (let i = penultimatePageEndIndex; i >= 0 && movedWeight + lastPageWeight < config.min_last_page_weight; i--) {
        const productWeight = calculateProductWeight(products[i], config);
        movedWeight += productWeight;
        productsToMove++;
        
        // Stop dacă penultima pagină devine prea mică
        if (pageWeights[pageWeights.length - 2] - movedWeight < config.min_last_page_weight) {
          break;
        }
      }
      
      // Actualizează break position
      if (productsToMove > 1) {
        breakPositions[breakPositions.length - 1] = penultimatePageEndIndex - productsToMove + 1;
        
        // Recalculează greutățile
        pageWeights[pageWeights.length - 2] -= movedWeight;
        pageWeights[pageWeights.length - 1] += movedWeight;
        
        console.log(`   ✅ Redistribuit ${productsToMove} produse: penultima=${pageWeights[pageWeights.length - 2].toFixed(2)}, ultima=${pageWeights[pageWeights.length - 1].toFixed(2)}`);
      }
    }
  }
  
  return {
    breakPositions: breakPositions,
    pageWeights: pageWeights,
    pages: pageWeights.length,
    algorithm: 'adaptive_weight'
  };
}

/**
 * Fallback: Logica veche cu număr fix de produse (pentru compatibilitate)
 */
function calculateFixedNumberBreaks(numProducts) {
  // Copiază logica din calculateOptimalSplit() din menuDataService.js
  if (numProducts <= 8) {
    return { breakPositions: [], pageWeights: [], pages: 1, algorithm: 'fixed_number' };
  }
  
  // Încearcă cu 8 produse/pagină
  let perPage = 8;
  let fullPages = Math.floor(numProducts / perPage);
  let lastPage = numProducts % perPage;
  
  if (lastPage === 0) {
    const breaks = [];
    for (let i = 0; i < fullPages - 1; i++) {
      breaks.push((i + 1) * perPage - 1);
    }
    return { breakPositions: breaks, pageWeights: [], pages: fullPages, algorithm: 'fixed_number' };
  } else if (lastPage >= 4 && lastPage <= 8) {
    const breaks = [];
    for (let i = 0; i < fullPages; i++) {
      breaks.push((i + 1) * perPage - 1);
    }
    return { breakPositions: breaks, pageWeights: [], pages: fullPages + 1, algorithm: 'fixed_number' };
  }
  
  // Încearcă cu 7 produse/pagină
  perPage = 7;
  fullPages = Math.floor(numProducts / perPage);
  lastPage = numProducts % perPage;
  
  if (lastPage === 0 || (lastPage >= 4 && lastPage <= 8)) {
    const breaks = [];
    for (let i = 0; i < fullPages; i++) {
      breaks.push((i + 1) * perPage - 1);
    }
    return { breakPositions: breaks, pageWeights: [], pages: lastPage === 0 ? fullPages : fullPages + 1, algorithm: 'fixed_number' };
  }
  
  // Redistribuire
  if (lastPage > 0 && lastPage < 4) {
    const redistributedFullPages = fullPages - 1;
    const redistributedLastPage = perPage + lastPage;
    
    if (redistributedLastPage >= 4 && redistributedLastPage <= 8) {
      const breaks = [];
      for (let i = 0; i < redistributedFullPages; i++) {
        breaks.push((i + 1) * perPage - 1);
      }
      return { breakPositions: breaks, pageWeights: [], pages: redistributedFullPages + 1, algorithm: 'fixed_number' };
    }
  }
  
  // Fallback: split echilibrat
  const pages = Math.ceil(numProducts / 7);
  const avgPerPage = Math.floor(numProducts / pages);
  const remainder = numProducts % pages;
  
  const breaks = [];
  let cumulative = 0;
  for (let i = 0; i < pages - 1; i++) {
    cumulative += avgPerPage + (i < remainder ? 1 : 0);
    breaks.push(cumulative - 1);
  }
  
  return { breakPositions: breaks, pageWeights: [], pages, algorithm: 'fixed_number' };
}

/**
 * Obține greutățile calculate pentru o listă de produse
 * Include și metadata pentru debugging
 */
async function getProductWeights(products) {
  const config = await getWeightConfig();
  
  return products.map(product => ({
    ...product,
    calculated_weight: calculateProductWeight(product, config),
    weight_breakdown: {
      base: config.base_product_weight,
      description: (product.description || '').length >= config.long_description_threshold 
        ? config.long_description_bonus 
        : ((product.description || '').length >= config.medium_description_threshold 
          ? config.medium_description_bonus 
          : 0),
      allergens: (product.allergens && product.allergens !== '[]') ? config.allergens_bonus : 0,
      badges: (product.special_badges && product.special_badges !== '[]') 
        ? config.special_badge_bonus * (JSON.parse(product.special_badges || '[]').length || 0)
        : 0
    }
  }));
}

/**
 * API Principal: Calculează split optim pentru o categorie
 * 
 * @param {Array} products - Lista de produse ordonate
 * @returns {Promise<Object>} - Split info cu breakPositions, pageWeights, etc.
 */
async function calculateOptimalSplitAdaptive(products) {
  if (!products || products.length === 0) {
    return {
      pages: 0,
      perPage: [],
      breakPositions: [],
      pageWeights: [],
      algorithm: 'none',
      total_products: 0
    };
  }
  
  // Obține configurare
  const config = await getWeightConfig();
  
  console.log(`   🎯 Algoritm: ${config.use_adaptive_weight ? 'ADAPTIVE WEIGHT' : 'FIXED NUMBER'}`);
  console.log(`   📊 Config: max=${config.max_page_weight}, min_last=${config.min_last_page_weight}`);
  
  // Calculează break positions
  const result = calculateAdaptivePageBreaks(products, config);
  
  // Calculează produse per pagină (pentru compatibilitate cu template-ul existent)
  const perPage = [];
  let lastBreak = -1;
  for (const breakPos of result.breakPositions) {
    perPage.push(breakPos - lastBreak);
    lastBreak = breakPos;
  }
  // Ultima pagină
  perPage.push(products.length - lastBreak - 1);
  
  console.log(`   ✅ Split: ${perPage.join(' + ')} produse pe ${result.pages} pagini`);
  if (result.pageWeights.length > 0) {
    console.log(`   ⚖️  Greutăți: ${result.pageWeights.map(w => w.toFixed(1)).join(' | ')}`);
  }
  
  return {
    pages: result.pages,
    perPage: perPage,
    breakPositions: result.breakPositions,
    pageWeights: result.pageWeights,
    algorithm: result.algorithm,
    total_products: products.length,
    config_used: {
      max_page_weight: config.max_page_weight,
      min_last_page_weight: config.min_last_page_weight,
      use_adaptive_weight: config.use_adaptive_weight
    }
  };
}

module.exports = {
  getWeightConfig,
  calculateProductWeight,
  calculateAdaptivePageBreaks,
  getProductWeights,
  calculateOptimalSplitAdaptive
};

