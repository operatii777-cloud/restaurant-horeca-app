
const { dbPromise } = require('../../database');

async function checkSuppliersSchema() {
    const db = await dbPromise;
    const columns = await db.all("PRAGMA table_info(suppliers)");
    console.log('suppliers schema:', columns.map(c => c.name));
}

checkSuppliersSchema().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
