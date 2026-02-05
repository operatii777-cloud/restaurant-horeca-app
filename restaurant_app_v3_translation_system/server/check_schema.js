
const db = require('./config/database');

async function checkSchema() {
    await db.connect();
    const cols = await db.all("PRAGMA table_info(ingredients)");
    console.log("Ingredients Columns:", cols.map(c => c.name));
    await db.close();
}

checkSchema().catch(console.error);
