const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

// Translation mapping for common Romanian food terms to English
const translations = {
  // Products - full name translations
  "Apă Plată": "Still Water",
  "Apă Minerală": "Mineral Water",
  "Suc Natural": "Natural Juice",
  "Suc de Portocale": "Orange Juice",
  "Limonadă": "Lemonade",
  "Cola": "Cola",
  "Pepsi": "Pepsi",
  "7 Up": "7 Up",
  "Sprite": "Sprite",
  "Fanta": "Fanta",
  "Tonic": "Tonic Water",
  "Ness": "Ness Tea",
  "Burn": "Burn Energy Drink",
  "Red Bull": "Red Bull",
  
  // Dishes
  "Pizza": "Pizza",
  "Margherita": "Margherita",
  "Quattro Formaggi": "Four Cheese",
  "Prosciutto": "Prosciutto",
  "Diavola": "Spicy Salami Pizza",
  "Capricciosa": "Capricciosa",
  "Quattro Stagioni": "Four Seasons",
  "Carbonara": "Carbonara",
  "Bolognese": "Bolognese",
  "Penne": "Penne",
  "Spaghetti": "Spaghetti",
  "Lasagna": "Lasagna",
  "Ravioli": "Ravioli",
  "Tortellini": "Tortellini",
  "Penne All'Arrabbiata": "Penne Arrabbiata",
  
  // Meat dishes
  "Mici cu Cartofi Prăjiți": "Grilled Mici with French Fries",
  "Ciolan cu Fasole Roșie": "Pork Knuckle with Red Beans",
  "Sarmăluțe cu Mămăligă": "Cabbage Rolls with Polenta",
  "Tochitură cu Mămăliguță": "Traditional Pork Stew with Polenta",
  "Pomana Porcului": "Pork Feast Platter",
  "Varză Călită cu Afumătură": "Sautéed Cabbage with Smoked Meat",
  "Varză a la Cluj": "Cluj-Style Cabbage",
  "Iahnie de Fasole": "Bean Stew",
  "Gulaș de Vită": "Beef Goulash",
  
  // Steaks & Grilled
  "Antricot de Vită la Grătar": "Grilled Beef Ribeye",
  "Mușchi de Vită la Grătar": "Grilled Beef Tenderloin",
  "Mușchi de Vită Gorgonzola": "Beef Tenderloin with Gorgonzola Sauce",
  "Mușchi de Vită cu Piper Verde": "Beef Tenderloin with Green Pepper Sauce",
  "Ceafă la Grătar": "Grilled Pork Neck",
  "Cotlet de Porc cu Os": "Pork Chop with Bone",
  "Cotlet de Porc cu Os și Sos de Ciuperci": "Pork Chop with Mushroom Sauce",
  "Coaste de Porc BBQ": "BBQ Pork Ribs",
  "T-Bone Steak": "T-Bone Steak",
  "Carcalete": "Grilled Pork Ribs",
  "Cârnaţi cu Cartofi Prăjiți": "Sausages with French Fries",
  
  // Chicken dishes
  "Piept de Pui la Grătar": "Grilled Chicken Breast",
  "Pulpe de Pui Dezosate": "Deboned Chicken Drumsticks",
  "Pui cu Ciuperci": "Chicken with Mushrooms",
  "Pui Gorgonzola": "Chicken Gorgonzola",
  "Polo Parmegiano": "Chicken Parmigiana",
  "Pui Crispy cu Salată Coleslaw": "Crispy Chicken with Coleslaw",
  "Cocoșel la Ceaun": "Cornish Hen Stew",
  "Jumări de Pui Picante": "Spicy Chicken Cracklings",
  "Tigaie Picantă de Pui": "Spicy Chicken Skillet",
  "Șnițel de Pui Palermo": "Chicken Schnitzel Palermo",
  "Pulpă de Rață Confiată": "Duck Confit",
  "Cordon Bleu": "Cordon Bleu",
  
  // Schnitzel
  "Șnițel Vienez": "Wiener Schnitzel",
  "Șnițel Crocant de Vită": "Crispy Beef Schnitzel",
  
  // Soups
  "Ciorbă de Văcuță": "Beef Sour Soup",
  "Ciorbă de Burtă": "Tripe Soup",
  "Ciorbă de Legume": "Vegetable Soup",
  "Supă Cremă de Ciuperci": "Cream of Mushroom Soup",
  
  // Fish
  "Somon la Grătar cu Lămâie": "Grilled Salmon with Lemon",
  "Păstrăv la Plită": "Grilled Trout",
  
  // Specialties
  "Platou Tradițional de 4 Persoane": "Traditional Platter for 4 People",
  "Obrăjori de Vită Braisați": "Braised Beef Cheeks",
  "Pastramă de Oaie la Tigaie": "Pan-Fried Sheep Pastrami",
  "Tigaie Grecească": "Greek Skillet",
  "Tocăniță de Cartofi cu Pui": "Chicken and Potato Stew",
  "Porc Forestier": "Forestiere Pork",
  
  // Salads
  "Salată Caesar": "Caesar Salad",
  "Salată Grecească": "Greek Salad",
  "Salată de Roșii": "Tomato Salad",
  "Salată Verde": "Green Salad",
  "Salată de Varză": "Cabbage Salad",
  "Salată Coleslaw": "Coleslaw",
  
  // Appetizers
  "Brânză Pane": "Breaded Cheese",
  "Aripioare de Pui": "Chicken Wings",
  "Ciuperci Pane": "Breaded Mushrooms",
  "Mozzarella Sticks": "Mozzarella Sticks",
  
  // Desserts
  "Tiramisu": "Tiramisu",
  "Panna Cotta": "Panna Cotta",
  "Cheesecake": "Cheesecake",
  "Clătite": "Pancakes",
  "Papanași": "Romanian Doughnuts",
  
  // Drinks
  "Cafea Espresso": "Espresso",
  "Cappuccino": "Cappuccino",
  "Latte": "Latte",
  "Ceai Negru": "Black Tea",
  "Ceai Verde": "Green Tea",
  "Vin Roșu": "Red Wine",
  "Vin Alb": "White Wine",
  "Bere": "Beer",
  
  // Common terms for building translations
  "cu": "with",
  "și": "and",
  "la": "at/to",
  "de": "of/from",
  "în": "in",
  "pe": "on",
  "pentru": "for",
  "Cartofi Prăjiți": "French Fries",
  "Cartofi": "Potatoes",
  "Prăjiți": "Fried",
  "Grătar": "Grilled",
  "Cuptor": "Oven-baked",
  "Tigaie": "Pan-fried",
  "Sos": "Sauce",
  "Ciuperci": "Mushrooms",
  "Vită": "Beef",
  "Porc": "Pork",
  "Pui": "Chicken",
  "Rață": "Duck",
  "Miel": "Lamb",
  "Peste": "Fish",
  "Lămâie": "Lemon",
  "Usturoi": "Garlic",
  "Ardei": "Pepper",
  "Roșii": "Tomatoes",
  "Ceapă": "Onions",
  "Brânză": "Cheese",
  "Smântână": "Sour Cream",
  "Mămăligă": "Polenta"
};

// Helper function to translate product names
function translateProductName(romanianName) {
  // Check for exact match first
  if (translations[romanianName]) {
    return translations[romanianName];
  }
  
  // If no exact match, try to translate word by word
  let englishName = romanianName;
  
  // Replace known terms
  for (const [ro, en] of Object.entries(translations)) {
    const regex = new RegExp('\\b' + ro.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    englishName = englishName.replace(regex, en);
  }
  
  // If nothing changed, return original (might be already in English or international name)
  return englishName;
}

// Main function
async function addTranslations() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Get all products
      db.all('SELECT id, name, description FROM menu WHERE is_sellable = 1 ORDER BY id', [], (err, products) => {
        if (err) {
          console.error('❌ Error fetching products:', err);
          reject(err);
          return;
        }
        
        console.log(`📦 Found ${products.length} products to translate`);
        
        // Prepare update statements
        const updates = products.map(product => {
          const englishName = translateProductName(product.name);
          const englishDescription = product.description ? translateProductName(product.description) : null;
          
          return {
            id: product.id,
            name: product.name,
            name_en: englishName,
            description_en: englishDescription
          };
        });
        
        // Begin transaction
        db.run('BEGIN TRANSACTION', (err) => {
          if (err) {
            console.error('❌ Error starting transaction:', err);
            reject(err);
            return;
          }
          
          let completed = 0;
          let errors = 0;
          
          // Update each product
          updates.forEach((update, index) => {
            db.run(
              'UPDATE menu SET name_en = ?, description_en = ? WHERE id = ?',
              [update.name_en, update.description_en, update.id],
              (err) => {
                if (err) {
                  console.error(`❌ Error updating product ${update.id}:`, err);
                  errors++;
                } else {
                  completed++;
                  if (completed % 50 === 0) {
                    console.log(`✅ Progress: ${completed}/${products.length} products updated`);
                  }
                }
                
                // Check if all done
                if (completed + errors === products.length) {
                  if (errors > 0) {
                    db.run('ROLLBACK', () => {
                      console.error(`❌ Transaction rolled back due to ${errors} errors`);
                      reject(new Error(`${errors} errors occurred`));
                    });
                  } else {
                    db.run('COMMIT', (err) => {
                      if (err) {
                        console.error('❌ Error committing transaction:', err);
                        reject(err);
                      } else {
                        console.log(`\n✅ Successfully updated ${completed} products!`);
                        
                        // Show some examples
                        db.all('SELECT id, name, name_en FROM menu WHERE is_sellable = 1 LIMIT 10', [], (err, samples) => {
                          if (!err && samples) {
                            console.log('\n📋 Sample translations:');
                            console.table(samples);
                          }
                          resolve(completed);
                        });
                      }
                    });
                  }
                }
              }
            );
          });
        });
      });
    });
  });
}

// Run the script
console.log('🚀 Starting product translation process...\n');
addTranslations()
  .then(count => {
    console.log(`\n🎉 Translation complete! ${count} products updated.`);
    db.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 Translation failed:', err);
    db.close();
    process.exit(1);
  });
