
const { dbPromise } = require('./database');

async function checkSupplierOrderItemsSchema() {
    const db = await dbPromise;
    const columns = await db.all("PRAGMA table_info(supplier_order_items)");
    console.log('supplier_order_items schema:', columns.map(c => c.name));
}

checkSupplierOrderItemsSchema().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
