
const { dbPromise } = require('../../database');

async function checkRecipesSchema() {
    const db = await dbPromise;
    const columns = await db.all("PRAGMA table_info(recipes)");
    console.log('recipes schema:', columns.map(c => c.name));

    // Check if there's a recipe_ingredients table
    try {
        const columns2 = await db.all("PRAGMA table_info(recipe_ingredients)");
        console.log('recipe_ingredients schema:', columns2.map(c => c.name));
    } catch (e) { }
}

checkRecipesSchema().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
