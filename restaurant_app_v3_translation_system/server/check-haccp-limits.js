
const { dbPromise } = require('./database');

async function checkHaccpLimits() {
    const db = await dbPromise;
    const limits = await db.all("SELECT * FROM haccp_limits");
    console.log('HACCP Limits:', limits);
}

checkHaccpLimits().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
