const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

const mapping = new Map([
  ['Aperitive Calde', 'Hot Appetizers'],
  ['Aperitive Reci', 'Cold Appetizers'],
  ['Băuturi Spirtoase', 'Spirits'],
  ['Băuturi și Coctailuri', 'Alcoholic Cocktails'],
  ['Cafea/Ciocolată/Ceai', 'Coffee/Chocolate/Tea'],
  ['Ciorbe', 'Soups'],
  ['Coctailuri Non-Alcoolice', 'Non-Alcoholic Cocktails'],
  ['Deserturi', 'Desserts'],
  ['Fast Food', 'Fast Food'],
  ['Fel Principal', 'Main Course'],
  ['Garnituri', 'Side Dishes'],
  ['Mic Dejun', 'Breakfast'],
  ['Paste', 'Pasta'],
  ['Peste și Fructe de Mare', 'Fish & Seafood'],
  ['Pizza', 'Pizza'],
  ['Răcoritoare', 'Soft Drinks'],
  ['Salate', 'Salads'],
  ['Salate Însoțitoare', 'Side Salads'],
  ['Sosuri și Pâine', 'Sauces & Bread'],
  ['Vinuri', 'Wines']
]);

db.serialize(() => {
  const stmt = db.prepare('UPDATE menu SET category_en = ? WHERE category = ?');
  const nameStmt = db.prepare('UPDATE menu SET name_en = name WHERE category_en = ?');

  mapping.forEach((value, key) => {
    stmt.run(value, key, function (err) {
      if (err) {
        console.error(`❌ ${key} -> ${value}: ${err.message}`);
      } else {
        console.log(`✅ ${key} -> ${value} (rows affected: ${this.changes})`);
      }
    });
  });

  const categoriesToSyncName = [
    'Spirits',
    'Alcoholic Cocktails',
    'Coffee/Chocolate/Tea',
    'Non-Alcoholic Cocktails',
    'Soft Drinks',
    'Wines'
  ];

  categoriesToSyncName.forEach(cat => {
    nameStmt.run(cat, function (err) {
      if (err) {
        console.error(`❌ name_en sync ${cat}: ${err.message}`);
      } else {
        console.log(`ℹ️  name_en sincronizat pentru ${cat} (rows affected: ${this.changes})`);
      }
    });
  });

  stmt.finalize(err => {
    if (err) {
      console.error('Eroare finalizare:', err.message);
    } else {
      console.log('Actualizare categorii EN completă.');
    }
    nameStmt.finalize(nameErr => {
      if (nameErr) {
        console.error('Eroare finalizare nameStmt:', nameErr.message);
      } else {
        console.log('Sincronizare name_en finalizată.');
      }
      db.close();
    });
  });
});

