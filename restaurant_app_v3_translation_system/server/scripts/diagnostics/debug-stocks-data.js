const { dbPromise } = require('../../database');

async function debugStocks() {
    try {
        const db = await dbPromise;

        console.log('--- DIAGNOSTIC START ---');

        // 1. Check Menu Count
        const menuCount = await db.get("SELECT COUNT(*) as count FROM menu");
        console.log(`Menu Items: ${menuCount.count}`);

        // 2. Check Recipes Count
        const recipesCount = await db.get("SELECT COUNT(*) as count FROM recipes");
        console.log(`Recipes: ${recipesCount.count}`);

        // 3. Check Products WITH Recipes (The query used in controller)
        const menuItems = await db.all("SELECT id, name FROM menu LIMIT 5");
        console.log('Sample Menu Items:', menuItems);

        const linkedProducts = await db.all(`
      SELECT m.id, m.name
      FROM menu m
      WHERE EXISTS (
        SELECT 1 FROM recipes r WHERE r.product_id = m.id
      )
      LIMIT 5
    `);

        console.log(`Products with Recipes (Linked): ${linkedProducts.length}`);
        if (linkedProducts.length > 0) {
            console.log('Sample Linked Products:', linkedProducts.map(p => p.name));
        } else {
            console.log('(!) No products found with associated recipes. This is why the table is empty.');
        }

        // 4. Check if we have ANY products
        if (linkedProducts.length === 0 && menuCount.count > 0) {
            console.log('Suggestion: You have products in the menu, but none have recipes defined.');
        }

        console.log('--- DIAGNOSTIC END ---');
    } catch (err) {
        console.error('Diagnostic failed:', err);
    }
}

debugStocks();
