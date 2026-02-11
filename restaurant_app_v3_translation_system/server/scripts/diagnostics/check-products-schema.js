
const { dbPromise } = require('../../database');

async function checkProductsSchema() {
    const db = await dbPromise;
    const columns = await db.all("PRAGMA table_info(products)");
    console.log('products schema:', columns.map(c => c.name));
}

checkProductsSchema().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
