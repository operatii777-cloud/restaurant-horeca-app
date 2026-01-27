/**
 * 📋 EXPORT COMPLET FIȘE TEHNICE DE PRODUS (FTP)
 * 
 * Exportă toate fișele tehnice de produs din baza de date:
 * - Rețete complete cu ingrediente
 * - Calcule de cost
 * - Ambalaje pentru restaurant și delivery
 * - Waste percentage
 * - Variable consumption
 * - Informații nutriționale
 * 
 * @version 1.0.0
 * @date 2025-10-20
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '..', 'restaurant.db'));

console.log('📋 EXPORT COMPLET FIȘE TEHNICE DE PRODUS (FTP)');
console.log('==============================================\n');

// Structură pentru fișele tehnice
const ftpData = {
  metadata: {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    description: 'Export complet al fișelor tehnice de produs'
  },
  statistics: {},
  ftp: []
};

console.log('📦 Încărcare produse cu rețete...');

// PASUL 1: Obține toate produsele cu rețete
db.all(`
  SELECT DISTINCT
    m.id, m.name, m.name_en, m.category, m.category_en,
    m.price, m.description, m.description_en, m.weight,
    m.prep_time, m.spice_level, m.calories, m.protein,
    m.carbs, m.fat, m.fiber, m.sodium, m.sugar, m.salt,
    m.allergens, m.allergens_en, m.is_vegetarian, m.is_spicy,
    m.is_takeout_only, m.is_sellable
  FROM menu m
  INNER JOIN recipes r ON m.id = r.product_id
  WHERE m.is_sellable = 1
  ORDER BY m.category, m.name
`, (err, products) => {
  if (err) {
    console.error('❌ Eroare la încărcarea produselor:', err);
    db.close();
    return;
  }

  console.log(`✅ Găsite ${products.length} produse cu rețete\n`);
  ftpData.statistics.totalProducts = products.length;

  let processedCount = 0;
  const productPromises = products.map(product => {
    return new Promise((resolve, reject) => {
      // Obține rețeta completă pentru produs
      db.all(`
        SELECT 
          r.id as recipe_id,
          r.ingredient_id,
          r.quantity_needed,
          r.unit as recipe_unit,
          r.waste_percentage,
          r.variable_consumption,
          r.item_type,
          i.name as ingredient_name,
          i.category as ingredient_category,
          i.unit as ingredient_unit,
          i.cost_per_unit,
          i.supplier,
          i.current_stock,
          i.min_stock
        FROM recipes r
        INNER JOIN ingredients i ON r.ingredient_id = i.id
        WHERE r.product_id = ?
        ORDER BY 
          CASE r.item_type 
            WHEN 'ingredient' THEN 1 
            WHEN 'packaging_restaurant' THEN 2 
            WHEN 'packaging_delivery' THEN 3 
            ELSE 4 
          END,
          i.name
      `, [product.id], (err, recipes) => {
        if (err) {
          console.error(`❌ Eroare la încărcarea rețetei pentru ${product.name}:`, err);
          return reject(err);
        }

        if (!recipes || recipes.length === 0) {
          console.warn(`⚠️ Produsul ${product.name} nu are rețetă definită`);
          return resolve(null);
        }

        // Separă ingredientele de ambalaje
        const ingredients = recipes.filter(r => r.item_type === 'ingredient');
        const packagingRestaurant = recipes.filter(r => r.item_type === 'packaging_restaurant');
        const packagingDelivery = recipes.filter(r => r.item_type === 'packaging_delivery');

        // Calculează costul total
        let totalCost = 0;
        let totalCostWithWaste = 0;

        ingredients.forEach(ing => {
          const baseCost = ing.quantity_needed * ing.cost_per_unit;
          const wasteMultiplier = 1 + (ing.waste_percentage || 0) / 100;
          const costWithWaste = baseCost * wasteMultiplier;
          
          totalCost += baseCost;
          totalCostWithWaste += costWithWaste;
        });

        // Calculează markup
        const markup = product.price > 0 ? ((product.price - totalCostWithWaste) / product.price * 100).toFixed(2) : 0;
        const profitMargin = product.price > 0 ? (product.price - totalCostWithWaste).toFixed(2) : 0;

        // Creează fișa tehnică completă
        const ftp = {
          // Informații produs
          product: {
            id: product.id,
            name: product.name,
            name_en: product.name_en,
            category: product.category,
            category_en: product.category_en,
            price: product.price,
            description: product.description,
            description_en: product.description_en,
            weight: product.weight,
            prep_time: product.prep_time,
            spice_level: product.spice_level,
            is_vegetarian: product.is_vegetarian,
            is_spicy: product.is_spicy,
            is_takeout_only: product.is_takeout_only,
            allergens: product.allergens,
            allergens_en: product.allergens_en
          },
          
          // Informații nutriționale
          nutrition: {
            calories: product.calories,
            protein: product.protein,
            carbs: product.carbs,
            fat: product.fat,
            fiber: product.fiber,
            sodium: product.sodium,
            sugar: product.sugar,
            salt: product.salt
          },

          // Rețetă - Ingrediente
          recipe: {
            ingredients: ingredients.map(ing => ({
              id: ing.ingredient_id,
              name: ing.ingredient_name,
              category: ing.ingredient_category,
              quantity: ing.quantity_needed,
              unit: ing.recipe_unit,
              unitStock: ing.ingredient_unit,
              wastePercentage: ing.waste_percentage || 0,
              variableConsumption: ing.variable_consumption,
              costPerUnit: ing.cost_per_unit,
              totalCost: (ing.quantity_needed * ing.cost_per_unit).toFixed(2),
              totalCostWithWaste: ((ing.quantity_needed * ing.cost_per_unit) * (1 + (ing.waste_percentage || 0) / 100)).toFixed(2),
              supplier: ing.supplier,
              currentStock: ing.current_stock,
              minStock: ing.min_stock,
              stockStatus: ing.current_stock < ing.min_stock ? 'LOW' : 'OK'
            })),
            
            packagingRestaurant: packagingRestaurant.map(pkg => ({
              id: pkg.ingredient_id,
              name: pkg.ingredient_name,
              quantity: pkg.quantity_needed,
              unit: pkg.recipe_unit,
              costPerUnit: pkg.cost_per_unit,
              totalCost: (pkg.quantity_needed * pkg.cost_per_unit).toFixed(2)
            })),
            
            packagingDelivery: packagingDelivery.map(pkg => ({
              id: pkg.ingredient_id,
              name: pkg.ingredient_name,
              quantity: pkg.quantity_needed,
              unit: pkg.recipe_unit,
              costPerUnit: pkg.cost_per_unit,
              totalCost: (pkg.quantity_needed * pkg.cost_per_unit).toFixed(2)
            }))
          },

          // Calcule de cost
          costs: {
            totalIngredientsCost: totalCost.toFixed(2),
            totalCostWithWaste: totalCostWithWaste.toFixed(2),
            sellingPrice: product.price,
            profitMargin: parseFloat(profitMargin),
            markup: parseFloat(markup),
            foodCostPercentage: product.price > 0 ? ((totalCostWithWaste / product.price) * 100).toFixed(2) : 0
          },

          // Statistici
          stats: {
            totalIngredients: ingredients.length,
            totalPackagingItems: packagingRestaurant.length + packagingDelivery.length,
            hasNutritionalInfo: !!(product.calories || product.protein || product.carbs || product.fat),
            lowStockIngredients: ingredients.filter(ing => ing.current_stock < ing.min_stock).length
          }
        };

        ftpData.ftp.push(ftp);
        processedCount++;

        // Progress indicator
        if (processedCount % 10 === 0) {
          console.log(`📊 Procesate ${processedCount}/${products.length} fișe tehnice...`);
        }

        resolve(ftp);
      });
    });
  });

  // Așteaptă procesarea tuturor produselor
  Promise.all(productPromises).then(() => {
    console.log(`\n✅ Procesate ${processedCount} fișe tehnice\n`);

    // Statistici finale
    ftpData.statistics.processedProducts = processedCount;
    ftpData.statistics.totalIngredients = ftpData.ftp.reduce((sum, ftp) => sum + ftp.stats.totalIngredients, 0);
    ftpData.statistics.averageCost = (ftpData.ftp.reduce((sum, ftp) => sum + parseFloat(ftp.costs.totalCostWithWaste), 0) / processedCount).toFixed(2);
    ftpData.statistics.averagePrice = (ftpData.ftp.reduce((sum, ftp) => sum + ftp.product.price, 0) / processedCount).toFixed(2);
    ftpData.statistics.averageMarkup = (ftpData.ftp.reduce((sum, ftp) => sum + parseFloat(ftp.costs.markup), 0) / processedCount).toFixed(2);

    // PASUL 2: Salvează fișele tehnice
    console.log('💾 PASUL 2: Salvare fișe tehnice...\n');

    // Salvează toate fișele tehnice într-un singur fișier
    fs.writeFileSync(
      path.join(__dirname, 'toate-ftpurile.json'),
      JSON.stringify(ftpData, null, 2)
    );
    console.log(`  ✅ Salvat: toate-ftpurile.json`);

    // Salvează fișele tehnice pe categorii
    const ftpByCategory = {};
    ftpData.ftp.forEach(ftp => {
      const category = ftp.product.category || 'Necategorizat';
      if (!ftpByCategory[category]) {
        ftpByCategory[category] = [];
      }
      ftpByCategory[category].push(ftp);
    });

    Object.keys(ftpByCategory).forEach(category => {
      const fileName = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
      fs.writeFileSync(
        path.join(__dirname, `ftp-${fileName}.json`),
        JSON.stringify(ftpByCategory[category], null, 2)
      );
      console.log(`  ✅ Salvat: ftp-${fileName}.json (${ftpByCategory[category].length} produse)`);
    });

    // Salvează fiecare fișă tehnică individual
    const individualDir = path.join(__dirname, 'individual');
    if (!fs.existsSync(individualDir)) {
      fs.mkdirSync(individualDir);
    }

    ftpData.ftp.forEach(ftp => {
      const fileName = `ftp-${ftp.product.id}-${ftp.product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
      fs.writeFileSync(
        path.join(individualDir, fileName),
        JSON.stringify(ftp, null, 2)
      );
    });
    console.log(`  ✅ Salvate ${ftpData.ftp.length} fișe tehnice individuale în: individual/`);

    // PASUL 3: Generează raportul
    console.log('\n📊 PASUL 3: Generare raport...\n');

    const report = `# 📋 RAPORT EXPORT FIȘE TEHNICE DE PRODUS (FTP)

**Data exportului:** ${new Date().toLocaleString('ro-RO')}
**Versiune:** 1.0.0

---

## 📊 STATISTICI GENERALE

- **Total produse cu FTP:** ${ftpData.statistics.processedProducts}
- **Total ingrediente folosite:** ${ftpData.statistics.totalIngredients}
- **Cost mediu per produs:** ${ftpData.statistics.averageCost} RON
- **Preț mediu per produs:** ${ftpData.statistics.averagePrice} RON
- **Markup mediu:** ${ftpData.statistics.averageMarkup}%

---

## 📁 CATEGORII EXPORTATE

${Object.keys(ftpByCategory).map(cat => `- **${cat}:** ${ftpByCategory[cat].length} produse`).join('\n')}

---

## 🎯 TOP 10 PRODUSE DUPĂ COST

${ftpData.ftp
  .sort((a, b) => parseFloat(b.costs.totalCostWithWaste) - parseFloat(a.costs.totalCostWithWaste))
  .slice(0, 10)
  .map((ftp, i) => `${i + 1}. **${ftp.product.name}** - ${ftp.costs.totalCostWithWaste} RON (Preț: ${ftp.product.price} RON, Markup: ${ftp.costs.markup}%)`)
  .join('\n')}

---

## 🎯 TOP 10 PRODUSE DUPĂ MARKUP

${ftpData.ftp
  .sort((a, b) => parseFloat(b.costs.markup) - parseFloat(a.costs.markup))
  .slice(0, 10)
  .map((ftp, i) => `${i + 1}. **${ftp.product.name}** - ${ftp.costs.markup}% (Cost: ${ftp.costs.totalCostWithWaste} RON, Preț: ${ftp.product.price} RON)`)
  .join('\n')}

---

## ⚠️ PRODUSE CU STOC SCĂZUT LA INGREDIENTE

${ftpData.ftp
  .filter(ftp => ftp.stats.lowStockIngredients > 0)
  .map(ftp => `- **${ftp.product.name}** - ${ftp.stats.lowStockIngredients} ingrediente cu stoc scăzut`)
  .join('\n') || '✅ Toate produsele au ingrediente cu stoc suficient'}

---

## 📝 FIȘIERE GENERATE

- \`toate-ftpurile.json\` - Toate fișele tehnice (${ftpData.statistics.processedProducts} produse)
${Object.keys(ftpByCategory).map(cat => `- \`ftp-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json\` - ${ftpByCategory[cat].length} produse`).join('\n')}
- \`individual/\` - ${ftpData.statistics.processedProducts} fișe tehnice individuale

---

**Generat de:** export-all-ftp.js  
**Data:** ${new Date().toLocaleString('ro-RO')}
`;

    fs.writeFileSync(path.join(__dirname, 'RAPORT-FTP.md'), report);
    console.log('  ✅ Salvat: RAPORT-FTP.md\n');

    // PASUL 4: Finalizare
    console.log('✅ EXPORT COMPLET FINALIZAT!');
    console.log('============================');
    console.log(`📁 Toate fișele tehnice au fost exportate în: server/fise-tehnice-produs/`);
    console.log(`📊 Raport complet: server/fise-tehnice-produs/RAPORT-FTP.md`);
    console.log('');

    db.close();
  }).catch(err => {
    console.error('❌ Eroare la procesarea fișelor tehnice:', err);
    db.close();
  });
});

