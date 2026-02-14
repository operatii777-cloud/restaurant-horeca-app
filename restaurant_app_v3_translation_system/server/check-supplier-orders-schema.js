
const { dbPromise } = require('./database');

async function checkSupplierOrdersSchema() {
    const db = await dbPromise;
    const columns = await db.all("PRAGMA table_info(supplier_orders)");
    console.log('supplier_orders schema:', columns.map(c => c.name));
}

checkSupplierOrdersSchema().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
