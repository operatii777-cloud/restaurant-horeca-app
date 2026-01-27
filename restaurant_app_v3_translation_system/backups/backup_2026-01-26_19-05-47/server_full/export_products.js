const { dbPromise } = require('./database');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const db = await dbPromise;
    
    // Obține produsele din tabela menu (nu products)
    const products = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          m.id,
          m.name,
          m.description,
          m.price,
          m.category,
          m.image_url,
          m.is_active,
          m.is_sellable,
          m.allergens,
          m.additives,
          m.display_order
        FROM menu m
        WHERE m.is_active = 1 AND COALESCE(m.is_sellable, 1) = 1
        ORDER BY m.category ASC, COALESCE(m.display_order, 999) ASC, m.name ASC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Parse allergens și additives (poate fi string sau JSON)
    const processedProducts = products.map(p => {
      let allergens = [];
      if (p.allergens) {
        try {
          if (typeof p.allergens === 'string') {
            if (p.allergens.startsWith('[') && p.allergens.endsWith(']')) {
              allergens = JSON.parse(p.allergens);
            } else if (p.allergens.includes(',')) {
              allergens = p.allergens.split(',').map(a => a.trim()).filter(a => a);
            } else if (p.allergens.trim()) {
              allergens = [p.allergens.trim()];
            }
          } else if (Array.isArray(p.allergens)) {
            allergens = p.allergens;
          }
        } catch (e) {
          // Dacă nu se poate parse, lasă gol
        }
      }
      
      let additives = [];
      if (p.additives) {
        try {
          if (typeof p.additives === 'string') {
            if (p.additives.startsWith('[') && p.additives.endsWith(']')) {
              additives = JSON.parse(p.additives);
            } else if (p.additives.includes(',')) {
              additives = p.additives.split(',').map(a => a.trim()).filter(a => a);
            } else if (p.additives.trim()) {
              additives = [p.additives.trim()];
            }
          } else if (Array.isArray(p.additives)) {
            additives = p.additives;
          }
        } catch (e) {
          // Dacă nu se poate parse, lasă gol
        }
      }
      
      // Construiește image_url ca path relativ către assets (pentru aplicația mobilă)
      let imageUrl = p.image_url || null;
      if (imageUrl) {
        // Extrage numele fișierului din path (ex: /images/menu/18.jpg -> 18.jpg)
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          // Construiește path relativ către assets
          imageUrl = 'assets/images/products/' + fileName;
        } else {
          imageUrl = null;
        }
      }
      
      return {
        id: p.id,
        name: p.name,
        description: p.description || null,
        price: p.price,
        image_url: imageUrl,
        category_id: p.category ? p.category : null, // Folosim categoria ca ID pentru compatibilitate
        category_name: p.category || 'Fără categorie',
        is_active: p.is_active || 1,
        is_sellable: p.is_sellable !== undefined ? p.is_sellable : 1,
        allergens: allergens,
        additives: additives
      };
    });
    
    // Grupează produsele pe categorii
    const categoriesMap = new Map();
    const categoriesOrdered = [];
    
    processedProducts.forEach(product => {
      const categoryName = product.category_name || 'Fără categorie';
      
      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, {
          id: categoryName, // Folosim numele categoriei ca ID
          name: categoryName,
          products: []
        });
        categoriesOrdered.push(categoryName);
      }
      
      categoriesMap.get(categoryName).products.push({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        is_active: product.is_active,
        is_sellable: product.is_sellable,
        allergens: product.allergens,
        additives: product.additives
      });
    });
    
    const categories = Array.from(categoriesMap.values());
    
    // Creează structura pentru fallback (compatibilă cu formatul actual)
    const fallbackData = {
      success: true,
      products: processedProducts,
      categories: categories,
      categories_ordered: categoriesOrdered,
      daily_offer: null,
      happy_hour: null,
      daily_menu: null,
      timestamp: new Date().toISOString()
    };
    
    // Salvează JSON-ul
    const outputPath = path.join(__dirname, '..', '..', '..', 'restorapp', 'products_export.json');
    // Asigură-te că directorul există
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(fallbackData, null, 2), 'utf8');
    
    console.log(`✅ Exported ${processedProducts.length} products in ${categories.length} categories`);
    console.log(`📁 Saved to: ${outputPath}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error exporting products:', error);
    process.exit(1);
  }
})();
