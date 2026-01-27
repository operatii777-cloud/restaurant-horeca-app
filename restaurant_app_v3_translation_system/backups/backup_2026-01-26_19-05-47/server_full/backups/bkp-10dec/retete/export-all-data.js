/**
 * 🔄 SCRIPT DE EXPORT COMPLET AL DATELOR DE REȚETE
 * 
 * Exportă toate datele din baza de date într-o structură modulară:
 * - Toate rețetele (1357+)
 * - Toate produsele (338+)
 * - Toate ingredientele (447+)
 * - Toate ambalajele
 * 
 * @version 1.0.0
 * @date 2025-10-20
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '..', 'restaurant.db'));

console.log('🔄 EXPORT COMPLET AL DATELOR DE REȚETE');
console.log('======================================\n');

// Structură pentru a stoca toate datele
const exportData = {
  metadata: {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    description: 'Export complet al rețetelor, produselor și ingredientelor'
  },
  statistics: {},
  data: {}
};

// PASUL 1: Exportă toate ingredientele
console.log('📦 PASUL 1: Export ingrediente...');
db.all(`
  SELECT 
    id, name, category, unit, current_stock, min_stock,
    cost_per_unit, supplier, is_available, created_at, last_updated
  FROM ingredients
  ORDER BY category, name
`, (err, ingredients) => {
  if (err) {
    console.error('❌ Eroare la exportul ingredientelor:', err);
    return;
  }
  
  console.log(`✅ Exportate ${ingredients.length} ingrediente`);
  exportData.statistics.totalIngredients = ingredients.length;
  exportData.data.ingredients = ingredients;
  
  // Grupează ingredientele pe categorii
  const ingredientsByCategory = {};
  ingredients.forEach(ing => {
    const category = ing.category || 'Necategorizat';
    if (!ingredientsByCategory[category]) {
      ingredientsByCategory[category] = [];
    }
    ingredientsByCategory[category].push(ing);
  });
  
  // Salvează ingredientele pe categorii
  Object.keys(ingredientsByCategory).forEach(category => {
    const fileName = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filePath = path.join(__dirname, 'ingrediente', `${fileName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(ingredientsByCategory[category], null, 2));
    console.log(`  📄 ${category}: ${ingredientsByCategory[category].length} ingrediente → ${fileName}.json`);
  });
  
  // Salvează toate ingredientele într-un singur fișier
  fs.writeFileSync(
    path.join(__dirname, 'ingrediente', 'toate-ingredientele.json'),
    JSON.stringify(ingredients, null, 2)
  );
  
  // PASUL 2: Exportă toate produsele
  console.log('\n🍕 PASUL 2: Export produse...');
  db.all(`
    SELECT 
      id, name, name_en, description, description_en, category, category_en,
      price, image_url, allergens, allergens_en, weight, is_vegetarian, is_spicy,
      is_takeout_only, info, ingredients, prep_time, spice_level, calories,
      protein, carbs, fat, fiber, sodium, sugar, salt, is_sellable
    FROM menu
    ORDER BY category, name
  `, (err, products) => {
    if (err) {
      console.error('❌ Eroare la exportul produselor:', err);
      return;
    }
    
    console.log(`✅ Exportate ${products.length} produse`);
    exportData.statistics.totalProducts = products.length;
    exportData.data.products = products;
    
    // Grupează produsele pe categorii
    const productsByCategory = {};
    products.forEach(prod => {
      const category = prod.category || 'Necategorizat';
      if (!productsByCategory[category]) {
        productsByCategory[category] = [];
      }
      productsByCategory[category].push(prod);
    });
    
    // Salvează produsele pe categorii
    Object.keys(productsByCategory).forEach(category => {
      const fileName = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const filePath = path.join(__dirname, 'produse', `${fileName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(productsByCategory[category], null, 2));
      console.log(`  📄 ${category}: ${productsByCategory[category].length} produse → ${fileName}.json`);
    });
    
    // Salvează toate produsele într-un singur fișier
    fs.writeFileSync(
      path.join(__dirname, 'produse', 'toate-produsele.json'),
      JSON.stringify(products, null, 2)
    );
    
    // PASUL 3: Exportă toate rețetele
    console.log('\n📋 PASUL 3: Export rețete...');
    db.all(`
      SELECT 
        r.id, r.product_id, r.ingredient_id, r.quantity_needed, r.unit,
        r.waste_percentage, r.variable_consumption, r.item_type, r.created_at,
        m.name as product_name, m.category as product_category,
        i.name as ingredient_name, i.category as ingredient_category,
        i.unit as ingredient_unit
      FROM recipes r
      LEFT JOIN menu m ON r.product_id = m.id
      LEFT JOIN ingredients i ON r.ingredient_id = i.id
      ORDER BY r.product_id, r.item_type, r.id
    `, (err, recipes) => {
      if (err) {
        console.error('❌ Eroare la exportul rețetelor:', err);
        return;
      }
      
      console.log(`✅ Exportate ${recipes.length} rețete`);
      exportData.statistics.totalRecipes = recipes.length;
      exportData.data.recipes = recipes;
      
      // Analizează rețetele
      const activeRecipes = recipes.filter(r => r.product_name !== null);
      const orphanRecipes = recipes.filter(r => r.product_name === null);
      const ingredientRecipes = recipes.filter(r => r.item_type === 'ingredient');
      const packagingRecipes = recipes.filter(r => r.item_type && r.item_type.startsWith('packaging'));
      
      console.log(`\n📊 STATISTICI REȚETE:`);
      console.log(`  ✅ Rețete active (cu produs valid): ${activeRecipes.length}`);
      console.log(`  ❌ Rețete orfane (fără produs): ${orphanRecipes.length}`);
      console.log(`  🥬 Rețete cu ingrediente: ${ingredientRecipes.length}`);
      console.log(`  📦 Rețete cu ambalaje: ${packagingRecipes.length}`);
      
      exportData.statistics.activeRecipes = activeRecipes.length;
      exportData.statistics.orphanRecipes = orphanRecipes.length;
      exportData.statistics.ingredientRecipes = ingredientRecipes.length;
      exportData.statistics.packagingRecipes = packagingRecipes.length;
      
      // Salvează toate rețetele
      fs.writeFileSync(
        path.join(__dirname, 'retete-raw', 'toate-retetele.json'),
        JSON.stringify(recipes, null, 2)
      );
      
      // Salvează rețetele active
      fs.writeFileSync(
        path.join(__dirname, 'retete-raw', 'retete-active.json'),
        JSON.stringify(activeRecipes, null, 2)
      );
      
      // Salvează rețetele orfane
      fs.writeFileSync(
        path.join(__dirname, 'retete-raw', 'retete-orfane.json'),
        JSON.stringify(orphanRecipes, null, 2)
      );
      
      // Salvează rețetele cu ambalaje
      fs.writeFileSync(
        path.join(__dirname, 'ambalaje', 'retete-ambalaje.json'),
        JSON.stringify(packagingRecipes, null, 2)
      );
      
      // Grupează rețetele active pe produse
      const recipesByProduct = {};
      activeRecipes.forEach(recipe => {
        const productId = recipe.product_id;
        if (!recipesByProduct[productId]) {
          recipesByProduct[productId] = {
            productId: productId,
            productName: recipe.product_name,
            productCategory: recipe.product_category,
            ingredients: [],
            packaging: []
          };
        }
        
        if (recipe.item_type === 'ingredient') {
          recipesByProduct[productId].ingredients.push({
            ingredientId: recipe.ingredient_id,
            ingredientName: recipe.ingredient_name,
            ingredientCategory: recipe.ingredient_category,
            quantityNeeded: recipe.quantity_needed,
            unit: recipe.unit,
            wastePercentage: recipe.waste_percentage,
            variableConsumption: recipe.variable_consumption
          });
        } else if (recipe.item_type && recipe.item_type.startsWith('packaging')) {
          recipesByProduct[productId].packaging.push({
            ingredientId: recipe.ingredient_id,
            ingredientName: recipe.ingredient_name,
            quantityNeeded: recipe.quantity_needed,
            unit: recipe.unit,
            itemType: recipe.item_type
          });
        }
      });
      
      // Salvează rețetele pe produse
      Object.values(recipesByProduct).forEach(productRecipe => {
        const fileName = `produs-${productRecipe.productId}-${productRecipe.productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
        const filePath = path.join(__dirname, 'retete-raw', fileName);
        fs.writeFileSync(filePath, JSON.stringify(productRecipe, null, 2));
      });
      
      console.log(`  📄 Salvate ${Object.keys(recipesByProduct).length} fișiere de rețete pe produse`);
      
      // PASUL 4: Analizează produsele fără rețete
      console.log('\n🔍 PASUL 4: Analiza produselor fără rețete...');
      
      const productsWithRecipes = new Set(activeRecipes.map(r => r.product_id));
      const productsWithoutRecipes = products.filter(p => !productsWithRecipes.has(p.id));
      
      console.log(`  ✅ Produse CU rețete: ${productsWithRecipes.size}`);
      console.log(`  ❌ Produse FĂRĂ rețete: ${productsWithoutRecipes.length}`);
      
      exportData.statistics.productsWithRecipes = productsWithRecipes.size;
      exportData.statistics.productsWithoutRecipes = productsWithoutRecipes.length;
      
      // Salvează produsele fără rețete
      fs.writeFileSync(
        path.join(__dirname, 'analiza', 'produse-fara-retete.json'),
        JSON.stringify(productsWithoutRecipes, null, 2)
      );
      
      // PASUL 5: Analizează ingredientele neutilizate
      console.log('\n🔍 PASUL 5: Analiza ingredientelor neutilizate...');
      
      const usedIngredients = new Set(activeRecipes.map(r => r.ingredient_id));
      const unusedIngredients = ingredients.filter(i => !usedIngredients.has(i.id));
      
      console.log(`  ✅ Ingrediente FOLOSITE în rețete: ${usedIngredients.size}`);
      console.log(`  ❌ Ingrediente NEFOLOSITE: ${unusedIngredients.length}`);
      
      exportData.statistics.usedIngredients = usedIngredients.size;
      exportData.statistics.unusedIngredients = unusedIngredients.length;
      
      // Salvează ingredientele neutilizate
      fs.writeFileSync(
        path.join(__dirname, 'analiza', 'ingrediente-neutilizate.json'),
        JSON.stringify(unusedIngredients, null, 2)
      );
      
      // PASUL 6: Creează raportul complet
      console.log('\n📊 PASUL 6: Generare raport complet...');
      
      const report = {
        ...exportData,
        summary: {
          totalIngredients: ingredients.length,
          usedIngredients: usedIngredients.size,
          unusedIngredients: unusedIngredients.length,
          totalProducts: products.length,
          productsWithRecipes: productsWithRecipes.size,
          productsWithoutRecipes: productsWithoutRecipes.length,
          totalRecipes: recipes.length,
          activeRecipes: activeRecipes.length,
          orphanRecipes: orphanRecipes.length,
          ingredientRecipes: ingredientRecipes.length,
          packagingRecipes: packagingRecipes.length
        },
        categories: {
          ingredients: Object.keys(ingredientsByCategory).map(cat => ({
            name: cat,
            count: ingredientsByCategory[cat].length
          })),
          products: Object.keys(productsByCategory).map(cat => ({
            name: cat,
            count: productsByCategory[cat].length
          }))
        }
      };
      
      // Salvează raportul complet
      fs.writeFileSync(
        path.join(__dirname, 'RAPORT-EXPORT-COMPLET.json'),
        JSON.stringify(report, null, 2)
      );
      
      // Creează README cu instrucțiuni
      const readme = `# 📁 DIRECTORUL REȚETE - EXPORT COMPLET

**Data exportului:** ${new Date().toISOString()}
**Versiune:** 1.0.0

---

## 📊 STATISTICI GENERALE

### Ingrediente:
- **Total:** ${ingredients.length}
- **Folosite în rețete:** ${usedIngredients.size}
- **Nefolosite:** ${unusedIngredients.length}
- **Categorii:** ${Object.keys(ingredientsByCategory).length}

### Produse:
- **Total:** ${products.length}
- **Cu rețete:** ${productsWithRecipes.size}
- **Fără rețete:** ${productsWithoutRecipes.length}
- **Categorii:** ${Object.keys(productsByCategory).length}

### Rețete:
- **Total:** ${recipes.length}
- **Active (cu produs valid):** ${activeRecipes.length}
- **Orfane (fără produs):** ${orphanRecipes.length}
- **Cu ingrediente:** ${ingredientRecipes.length}
- **Cu ambalaje:** ${packagingRecipes.length}

---

## 📁 STRUCTURA DIRECTOARELOR

\`\`\`
retete/
├── ingrediente/           ← Toate ingredientele, grupate pe categorii
│   ├── toate-ingredientele.json
│   ├── legume-si-fructe.json
│   ├── carne-si-peste.json
│   ├── lactate-si-branzeturi.json
│   └── ...
├── produse/              ← Toate produsele, grupate pe categorii
│   ├── toate-produsele.json
│   ├── pizza.json
│   ├── paste.json
│   ├── bauturi.json
│   └── ...
├── retete-raw/           ← Toate rețetele (1357+)
│   ├── toate-retetele.json
│   ├── retete-active.json
│   ├── retete-orfane.json
│   ├── produs-1-pizza-margherita.json
│   ├── produs-2-carbonara.json
│   └── ...
├── ambalaje/             ← Rețete cu ambalaje
│   └── retete-ambalaje.json
├── analiza/              ← Analize și rapoarte
│   ├── produse-fara-retete.json
│   └── ingrediente-neutilizate.json
├── backup/               ← Backup-uri (gol deocamdată)
├── RAPORT-EXPORT-COMPLET.json  ← Raportul complet
└── README.md             ← Acest fișier
\`\`\`

---

## 🎯 URMĂTORII PAȘI (CURĂȚENIA)

### 1. **Eliminare rețete orfane:**
   - ${orphanRecipes.length} rețete fără produs asociat
   - Verifică \`retete-raw/retete-orfane.json\`

### 2. **Adaugă rețete la produse fără rețete:**
   - ${productsWithoutRecipes.length} produse fără rețete
   - Verifică \`analiza/produse-fara-retete.json\`

### 3. **Curățenie ingrediente neutilizate:**
   - ${unusedIngredients.length} ingrediente nefolosite
   - Verifică \`analiza/ingrediente-neutilizate.json\`

### 4. **Organizare rețete pe categorii:**
   - Separă rețete pentru Pizza, Paste, Ciorbe, etc.
   - Creează fișiere modulare per categorie

### 5. **Validare și testare:**
   - Verifică consistența datelor
   - Testează scăderea stocurilor

---

## 📝 NOTĂ IMPORTANTĂ

**ÎNAINTE DE A MODIFICA CEVA:**
- Toate datele sunt salvate în acest director
- Baza de date originală NU a fost modificată
- Poți restaura oricând din backup-ul creat

**DUPĂ CURĂȚENIE:**
- Vom crea scripturi de import pentru datele curate
- Vom testa totul înainte de a actualiza baza de date

---

**Generat de:** export-all-data.js
**Data:** ${new Date().toLocaleString('ro-RO')}
`;
      
      fs.writeFileSync(
        path.join(__dirname, 'README.md'),
        readme
      );
      
      console.log('\n✅ EXPORT COMPLET FINALIZAT!');
      console.log('======================================');
      console.log(`📁 Toate datele au fost exportate în: server/retete/`);
      console.log(`📊 Raport complet: server/retete/RAPORT-EXPORT-COMPLET.json`);
      console.log(`📖 Instrucțiuni: server/retete/README.md`);
      console.log('');
      console.log('🎯 URMĂTORII PAȘI:');
      console.log('  1. Analizează raportul complet');
      console.log('  2. Identifică rețetele orfane de eliminat');
      console.log('  3. Adaugă rețete la produsele fără rețete');
      console.log('  4. Curățenie ingrediente neutilizate');
      console.log('');
      
      db.close();
    });
  });
});

