const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

// Additional missing translations
const additionalTranslations = {
  // Pancakes
  "Clătite Africane": "African Pancakes",
  "Clătite cu Afine": "Pancakes with Blueberries",
  "Clătite cu Ciocolată": "Pancakes with Chocolate",
  "Clătite cu Finetti": "Pancakes with Nutella",
  
  // Salads
  "Salată Caprese": "Caprese Salad",
  "Salată Halloumi": "Halloumi Salad",
  "Salată Iceberg": "Iceberg Salad"
};

async function updateAdditionalTranslations() {
  console.log('🔄 Updating additional translations...\n');
  
  let updated = 0;
  let errors = 0;
  
  for (const [romanianName, englishName] of Object.entries(additionalTranslations)) {
    try {
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE menu SET name_en = ? WHERE name = ?`,
          [englishName, romanianName],
          function(err) {
            if (err) {
              console.error(`❌ Error updating "${romanianName}":`, err.message);
              errors++;
              reject(err);
            } else if (this.changes > 0) {
              console.log(`✅ Updated: "${romanianName}" → "${englishName}"`);
              updated++;
              resolve();
            } else {
              console.log(`⚠️  Not found: "${romanianName}"`);
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

updateAdditionalTranslations();
