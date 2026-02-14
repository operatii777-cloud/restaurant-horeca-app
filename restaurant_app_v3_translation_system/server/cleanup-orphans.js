const { dbPromise } = require('./database');

async function cleanOrphans() {
    const db = await dbPromise;
    console.log("Starting Orphan Cleanup...");

    // 1. Delete recipes pointing to non-existent products
    const resultProducts = await new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM recipes 
            WHERE product_id NOT IN (SELECT id FROM products)
        `, function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
    console.log(`✅ Deleted ${resultProducts} recipes linking to missing products.`);

    // 2. Delete recipes pointing to non-existent ingredients
    const resultIngredients = await new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM recipes 
            WHERE ingredient_id NOT IN (SELECT id FROM ingredients)
        `, function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
    console.log(`✅ Deleted ${resultIngredients} recipes linking to missing ingredients.`);

    console.log("Cleanup Complete.");
}

cleanOrphans().catch(console.error);
