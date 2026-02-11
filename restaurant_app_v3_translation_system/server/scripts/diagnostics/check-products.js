const { dbPromise } = require('../../database');

async function checkProducts() {
  const db = await dbPromise;
  const products = await new Promise((resolve, reject) => {
    db.all(`
      SELECT id, name, category
      FROM menu
      WHERE name LIKE '%Red Bull%'
         OR name LIKE '%San Benedetto%'
         OR name LIKE '%Ice Tea%'
         OR name LIKE '%Brânză Feta%'
         OR name LIKE '%Omletă%'
         OR name LIKE '%Mozzarella%'
      ORDER BY name
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

  console.log('Products:');
  products.forEach(p => {
    console.log(`${p.id}: ${p.name} - Category: '${p.category}'`);
  });

  db.close();
}

checkProducts().catch(console.error);