
const { dbPromise } = require('../../database');

async function checkIngredientsSchema() {
    const db = await dbPromise;
    const columns = await db.all("PRAGMA table_info(ingredients)");
    console.log('ingredients schema:', columns.map(c => c.name));
}

checkIngredientsSchema().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
