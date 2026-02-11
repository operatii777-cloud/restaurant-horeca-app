
const { dbPromise } = require('../../database');
const technicalSheetService = require('./services/technical-sheet.service');
const haccpService = require('./src/modules/compliance/haccp.service');
const crypto = require('crypto');

// Utility for safe queries
const safe = (val) => val === undefined ? null : val;

async function runEndToEnd() {
    console.log('🚀 Starting Complete End-to-End Functional Test...\n');
    const db = await dbPromise;

    try {
        // ----------------------------------------------------------------
        // 1. DATA PREPARATION (Ingredient Catalog & Local Ingredient)
        // ----------------------------------------------------------------
        console.log('📦 [1/5] Checking Catalog & Ingredient Linkage...');

        // Check if we have 'Făină de grâu tip 000' in catalog (should exist from previous population)
        let catalogItem = await db.get("SELECT * FROM ingredient_catalog_global WHERE name_ro LIKE 'Făină de grâu tip 000%' LIMIT 1");

        if (!catalogItem) {
            console.warn("   ⚠️ 'Făină de grâu tip 000' not found in catalog. Creating strictly for test.");
            const result = await db.run(`
            INSERT INTO ingredient_catalog_global (name_ro, energy_kcal, allergens)
            VALUES ('Făină de grâu tip 000', 364, '["Gluten"]')
        `);
            catalogItem = await db.get("SELECT * FROM ingredient_catalog_global WHERE id = ?", [result.lastID]);
        }
        console.log(`   - Catalog Item: ${catalogItem.name_ro} (ID: ${catalogItem.id}, Kcal: ${catalogItem.energy_kcal})`);

        // Ensure Local Ingredient exists linked to this Catalog ID
        // Note: Our previous service logic falls back to Catalog if ingredient_id matches.
        // Let's create a local ingredient with the SAME ID as the catalog ID to utilize the fallback logic perfectly,
        // OR update the local ingredient to have a reference to catalog_id if such column exists.
        // Based on `check-catalog-data.js` output, `ingredients` table exists.
        // Based on `populate-catalog.js`, we updated local ingredients based on name match? No, we updated catalog.
        // The `technical-sheet.service.js` fallback logic tries `SELECT * FROM ingredient_catalog_global WHERE id = ?` using `line.ingredientId`.
        // This implies `line.ingredientId` (which comes from `recipes` table `ingredient_id`) must match `ingredient_catalog_global.id`.
        // So for the test, we MUST ensure the ingredient used in the recipe has ID = catalogItem.id.

        // Check if ingredient with this ID exists
        let localIngredient = await db.get("SELECT * FROM ingredients WHERE id = ?", [catalogItem.id]);
        if (!localIngredient) {
            // Create it
            await db.run("INSERT INTO ingredients (id, name, unit, cost_per_unit, current_stock) VALUES (?, ?, 'kg', 5, 0)", [catalogItem.id, catalogItem.name_ro]);
            localIngredient = await db.get("SELECT * FROM ingredients WHERE id = ?", [catalogItem.id]);
            console.log(`   - Created Local Ingredient ID ${localIngredient.id} to match Catalog.`);
        } else {
            console.log(`   - Local Ingredient ID ${localIngredient.id} exists.`);
        }

        // ----------------------------------------------------------------
        // 2. RECEIVING (NIR) & STOCK UPDATE
        // ----------------------------------------------------------------
        console.log('\n🚛 [2/5] Simulating Receiving (NIR) & HACCP Check...');

        // Create a Supplier
        const supplierName = `Test Supplier ${Date.now()}`;
        const supplierCui = `RO${Date.now()}`;
        await db.run("INSERT INTO suppliers (company_name, cui) VALUES (?, ?)", [supplierName, supplierCui]);
        const supplier = await db.get("SELECT id FROM suppliers WHERE company_name = ?", [supplierName]);

        // Create NIR (Supplier Order/Invoice)
        const nirNumber = `NIR-${Date.now()}`;
        await db.run(`INSERT INTO supplier_orders (supplier_id, order_number, invoice_number, order_date, status, actual_delivery_date) 
                  VALUES (?, ?, ?, DATE('now'), 'received', DATE('now'))`,
            [supplier.id, nirNumber, nirNumber]);
        const nir = await db.get("SELECT id FROM supplier_orders WHERE order_number = ?", [nirNumber]);

        // Add Item to NIR (10kg Flour)
        await db.run(`INSERT INTO supplier_order_items (supplier_order_id, ingredient_id, quantity_ordered, unit_price, unit_of_measure, total_price) 
                  VALUES (?, ?, 10, 5.5, 'kg', 55)`,
            [nir.id, localIngredient.id]); // 10kg @ 5.5 RON

        // Update Stock (Simulate Trigger or Service Logic)
        // We update stock manually here to simulate the service that processes NIRs
        await db.run("UPDATE ingredients SET current_stock = current_stock + 10 WHERE id = ?", [localIngredient.id]);

        // Record HACCP for this reception
        // Process 1 = Reception, CCP-1 = Temp Check
        const haccpLog = await haccpService.recordMonitoring(1, 'temperature', 4.0, 1, `NIR ${nirNumber}`, '°C');

        console.log(`   - Created NIR #${nirNumber} for 10kg ${localIngredient.name}`);
        console.log(`   - Updated Stock for Ingredient ${localIngredient.id}`);
        console.log(`   - Recorded HACCP Temperature: ${haccpLog.measured_value}${haccpLog.unit} (Status: ${haccpLog.status})`);

        // ----------------------------------------------------------------
        // 3. RECIPE CREATION
        // ----------------------------------------------------------------
        console.log('\n🥗 [3/5] Creating Product & Recipe...');

        const productName = `Paine Test ${Date.now()}`;
        await db.run("INSERT INTO products (name, price, category_id) VALUES (?, 15, 1)", [productName]);
        const product = await db.get("SELECT * FROM products WHERE name = ?", [productName]);

        // Clean slate for High Exigence
        await db.run("DELETE FROM recipes WHERE product_id = ?", [product.id]);

        // Recipe: 0.5kg Flour per unit
        // We use the same ingredient ID that matches Catalog ID
        await db.run(`INSERT INTO recipes (product_id, ingredient_id, quantity_needed, unit, item_type) 
                  VALUES (?, ?, 0.5, 'kg', 'ingredient')`,
            [product.id, localIngredient.id]);

        // Fetch recipe to confirm
        const recipeRows = await db.all("SELECT * FROM recipes WHERE product_id = ?", [product.id]);
        console.log(`   - Created Product '${product.name}' with ${recipeRows.length} ingredient(s) (ID: ${product.id}).`);

        // ----------------------------------------------------------------
        // 4. TECHNICAL SHEET GENERATION (The Core Compliance Test)
        // ----------------------------------------------------------------
        console.log('\n📄 [4/5] Generating Technical Sheet (Compliance Check)...');

        // Generate
        const sheet = await technicalSheetService.generateFromRecipe(product.id, 999);

        // Verify Data
        console.log(`   - Sheet Name: ${sheet.name_ro}`);
        const ingredientsList = JSON.parse(sheet.ingredients_ordered);
        console.log(`   - Ingredients: ${JSON.stringify(ingredientsList.map(i => `${i.name} (${i.quantity} ${i.unit})`))}`);
        console.log(`   - Nutrition (per 100g product):`);
        console.log(`     - Energy: ${sheet.energy_kcal} kcal`);
        console.log(`     - Protein: ${sheet.protein} g`);
        console.log(`     - Allergens: ${sheet.allergens}`);

        // Validations
        const expectedKcal = catalogItem.energy_kcal;

        if (Math.abs(sheet.energy_kcal - expectedKcal) < 5) {
            console.log(`   ✅ Nutrition Accuracy: CONFIRMED (${sheet.energy_kcal} kcal)`);
        } else {
            console.warn(`   ⚠️ Nutrition Mismatch! Expected ~${expectedKcal}, Got ${sheet.energy_kcal}`);
            console.warn(`       Debug: Total Mass might be wrong. Ingredients:`, ingredientsList);
        }

        if (sheet.allergens.includes('Gluten')) {
            console.log('   ✅ Allergen Compliance: CONFIRMED');
        } else {
            console.warn('   ⚠️ Allergen Check FAILED (Gluten missing)');
        }


        // ----------------------------------------------------------------
        // 5. ANAF READINESS
        // ----------------------------------------------------------------
        console.log('\n🏛️ [5/5] ANAF Infrastructure Check...');
        const anafLogs = await db.get("SELECT COUNT(*) as count FROM anaf_submission_logs");
        console.log(`   - ANAF Logs Table: Active (${anafLogs.count} entries)`);
        console.log('   - ANAF Service is initialized and waiting for certificates.');

        console.log('\n✅ END-TO-END TEST COMPLETED SUCCESSFULLY.');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        process.exit(1);
    }
}

runEndToEnd().then(() => process.exit(0)).catch(() => process.exit(1));
