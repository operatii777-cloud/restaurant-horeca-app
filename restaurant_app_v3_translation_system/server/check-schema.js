const { dbPromise } = require('./database');

async function checkSchema() {
    const db = await dbPromise;
    const info = await db.all("PRAGMA table_info(recipes)");
    console.log(info);
}
checkSchema();
