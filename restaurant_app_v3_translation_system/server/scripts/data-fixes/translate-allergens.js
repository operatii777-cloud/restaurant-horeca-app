const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

// Allergen translations
const allergenTranslations = {
  "Ouă": "Eggs",
  "Gluten": "Gluten",
  "Fructe cu coajă": "Tree Nuts",
  "Dioxid de sulf și sulfiți": "Sulphur Dioxide and Sulphites",
  "Migdale": "Almonds",
  "Pește": "Fish",
  "Crustacee": "Crustaceans",
  "Moluște": "Molluscs",
  "Arahide": "Peanuts",
  "Soia": "Soybeans",
  "Lapte": "Milk",
  "Țelină": "Celery",
  "Muștar": "Mustard",
  "Susan": "Sesame Seeds",
  "Lupin": "Lupin",
  "Fructe cu coajă tare": "Tree Nuts",
  "Nuci": "Walnuts",
  "Alune": "Hazelnuts",
  "Caju": "Cashews",
  "Fistic": "Pistachios",
  "Nuci de Macadamia": "Macadamia Nuts",
  "Nuci de Brazilia": "Brazil Nuts",
  "Nuci de Pecan": "Pecan Nuts"
};

function translateAllergens(allergensRO) {
  if (!allergensRO || allergensRO.trim() === '') {
    return null;
  }
  
  // Split by comma and translate each allergen
  const allergenList = allergensRO.split(',').map(a => a.trim());
  const translatedList = allergenList.map(allergen => {
    return allergenTranslations[allergen] || allergen;
  });
  
  return translatedList.join(', ');
}

async function updateAllergenTranslations() {
  console.log('🔄 Starting allergen translation update...\n');
  
  // Get all products with allergens
  const products = await new Promise((resolve, reject) => {
    db.all(`SELECT id, name, allergens FROM menu WHERE allergens IS NOT NULL AND allergens != ''`, 
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
  });
  
  console.log(`📦 Found ${products.length} products with allergens\n`);
  
  let updated = 0;
  let errors = 0;
  
  for (const product of products) {
    const translatedAllergens = translateAllergens(product.allergens);
    
    try {
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE menu SET allergens_en = ? WHERE id = ?`,
          [translatedAllergens, product.id],
          function(err) {
            if (err) {
              console.error(`❌ Error updating product ${product.id}:`, err.message);
              errors++;
              reject(err);
            } else {
              console.log(`✅ ${product.id}: ${product.name}`);
              console.log(`   RO: ${product.allergens}`);
              console.log(`   EN: ${translatedAllergens}\n`);
              updated++;
              resolve();
            }
          }
        );
      });
    } catch (err) {
      // Error already logged
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Updated: ${updated} products`);
  console.log(`   ❌ Errors: ${errors}`);
  
  db.close();
}

updateAllergenTranslations();
