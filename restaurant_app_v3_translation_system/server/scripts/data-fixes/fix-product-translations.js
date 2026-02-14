const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

// Complete product translations - Romanian to English
const productTranslations = {
  // Soups and broths
  "Borș de Găină": "Chicken Bors",
  "Ciorbă Rădăuțeană de Pui": "Rădăuți-Style Chicken Soup",
  "Ciorbă de Fasole cu Afumătură": "Bean Soup with Smoked Meat",
  "Ciorbă de Fasole în Pâine": "Bean Soup in Bread Bowl",
  "Ciorbă de Perișoare": "Meatball Soup",
  "Ciorbă de Pui a la Grec": "Greek-Style Chicken Soup",
  "Supă Cremă de Legume": "Cream of Vegetable Soup",
  "Supă Cremă de Roșii": "Cream of Tomato Soup",
  "Supă de Găluște": "Dumpling Soup",
  
  // Appetizers
  "Brânză Feta la Cuptor": "Oven-Baked Feta Cheese",
  "Inele de Ceapă Pane": "Breaded Onion Rings",
  "Tentacule de Calamar": "Squid Tentacles",
  "Midii în Sos de Vin Alb": "Mussels in White Wine Sauce",
  
  // Burgers
  "Burger Picant de Vită": "Spicy Beef Burger",
  "Burger de Vită": "Beef Burger",
  
  // Main courses - Meat
  "Frigărui de porc cu cartofi prăjiți": "Pork Skewers with French Fries",
  "Frigărui de pui cu cartofi prăjiți": "Chicken Skewers with French Fries",
  
  // Seafood
  "File de Dorada la Plită": "Grilled Sea Bream Fillet",
  "Somon la Cuptor": "Oven-Baked Salmon",
  "Saramură de Crap cu Mămăligă": "Carp in Brine with Polenta",
  "Platou cu Fructe de Mare": "Seafood Platter",
  "Tigaie cu Fructe de Mare": "Seafood Skillet",
  "Linguini cu Fructe de Mare": "Linguini with Seafood",
  "Spaghetti cu Fructe de Mare": "Spaghetti with Seafood",
  "Wrap Fructe de Mare": "Seafood Wrap",
  
  // Platters
  "Platou Crispy de 2 Persoane": "Crispy Platter for 2 People",
  
  // Shawarma
  "Shaorma de Pui": "Chicken Shawarma",
  "Shaorma de Vită - Mare": "Large Beef Shawarma",
  "Shaorma de Vită - Medie": "Medium Beef Shawarma",
  "Shaorma de Vită - Mică": "Small Beef Shawarma",
  
  // Quesadillas
  "Quesadilla de Pui": "Chicken Quesadilla",
  "Quesadilla de Vită": "Beef Quesadilla",
  
  // Side dishes
  "Cartofi La Cuptor": "Oven-Baked Potatoes",
  "Piure de Cartofi": "Mashed Potatoes",
  "Legume la Grătar": "Grilled Vegetables",
  
  // Salads
  "Salată Asortată de Vară": "Assorted Summer Salad",
  "Salată de Ardei Copt": "Roasted Pepper Salad",
  "Salată de Murături": "Pickled Vegetables Salad",
  "Salată de Rucola și Roșii Cherry": "Arugula and Cherry Tomato Salad",
  "Salată de Varză cu Morcov și Mărar": "Cabbage Salad with Carrot and Dill",
  "Salată de Vară cu Pui și Avocado": "Summer Salad with Chicken and Avocado",
  
  // Sauces and bread
  "Pâine de Casă": "Homemade Bread",
  "Turtă de Casă": "Homemade Flatbread",
  "Sos de Maioneză Picantă": "Spicy Mayonnaise Sauce",
  "Sos de Maioneză Simplă": "Plain Mayonnaise Sauce",
  "Sos de muștar": "Mustard Sauce",
  
  // Desserts
  "Cheesecake cu Fructe de Pădure": "Cheesecake with Forest Berries",
  "Clătite cu Dulceață de Fructe de Pădure": "Pancakes with Forest Berry Jam",
  "Clătite cu Dulceață de Vișine": "Pancakes with Sour Cherry Jam",
  
  // Drinks
  "Fresh de Grapefruit": "Grapefruit Fresh Juice",
  "Fresh de Portocală": "Orange Fresh Juice",
  
  // Wines
  "Caii de la Letea Vol 1 Aligote": "Letea Horses Vol 1 Aligote",
  "Caii de la Letea Vol 1 Cabernet & Fetească Neagră": "Letea Horses Vol 1 Cabernet & Fetească Neagră",
  "Caii de la Letea Vol 1 Rose": "Letea Horses Vol 1 Rosé",
  "Negrini Negru de Drăgășani": "Negrini Black from Drăgășani",
  "La Plage": "La Plage",
  "La Plage Rose": "La Plage Rosé"
};

async function updateTranslations() {
  console.log('🔄 Starting translation update...\n');
  
  let updated = 0;
  let errors = 0;
  
  for (const [romanianName, englishName] of Object.entries(productTranslations)) {
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
  console.log(`   📝 Total translations: ${Object.keys(productTranslations).length}`);
  
  db.close();
}

updateTranslations();
