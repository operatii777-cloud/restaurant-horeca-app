const { dbPromise } = require('./database');

async function findProducts() {
  const db = await dbPromise;
  const rows = await new Promise((resolve, reject) => {
    db.all(`
      SELECT id, name
      FROM menu
      WHERE name LIKE '%gul%'
         OR name LIKE '%cea%'
         OR name LIKE '%antr%'
      ORDER BY name
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

  console.log('Produse căutate:');
  rows.forEach(r => {
    console.log(`${r.id}: ${r.name}`);
  });

  db.close();
}

findProducts().catch(console.error);