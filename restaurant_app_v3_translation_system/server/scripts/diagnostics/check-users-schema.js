
const { dbPromise } = require('./database');

async function checkSchema() {
    const db = await dbPromise;
    const cols = await db.all("PRAGMA table_info(users)");
    console.log(cols);
}

checkSchema().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
