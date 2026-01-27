const { dbPromise } = require('./database');

async function checkCategories() {
  const db = await dbPromise;
  const rows = await new Promise((resolve, reject) => {
    db.all(`
      SELECT name, category, LENGTH(category) as len
      FROM menu
      WHERE category LIKE '%Răcoritoare%'
      LIMIT 5
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

  console.log('Categories:');
  rows.forEach(r => {
    console.log(`${r.name}: '${r.category}' (len: ${r.len})`);
  });

  db.close();
}

checkCategories().catch(console.error);