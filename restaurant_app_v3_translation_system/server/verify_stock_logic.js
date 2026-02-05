
const IngredientsModel = require('./models/ingredients.model');
const db = require('./config/database');

async function verify() {
    try {
        console.log("Connecting to DB...");
        await db.connect();
        // force init if needed (accessing db prop usually triggers init in this codebase style)
        // actually config/database returns a db object which initializes on first run usually.

        console.log("Checking ID 88 properties...");
        const item = await IngredientsModel.findById(88);
        if (!item) {
            console.error("❌ ID 88 NOT FOUND!");
        } else {
            console.log(`✅ ID 88 FOUND: Name="${item.name}", is_stock_item=${item.is_stock_item}, cost=${item.cost_per_unit}, min_stock=${item.min_stock}`);
            if (item.is_stock_item === 0) {
                console.log("✅ is_stock_item is correctly 0.");
            } else {
                console.error("❌ is_stock_item should be 0!");
            }
        }

        console.log("\nChecking Low Stock List...");
        const lowStock = await IngredientsModel.findLowStock();
        const foundInLowStock = lowStock.find(i => i.id === 88);

        if (foundInLowStock) {
            console.error("❌ ID 88 found in findLowStock! It should be excluded.");
        } else {
            console.log("✅ ID 88 NOT found in findLowStock.");
        }

        console.log("\nChecking Critical Stock List...");
        const criticalStock = await IngredientsModel.findCriticalStock();
        const foundInCritical = criticalStock.find(i => i.id === 88);

        if (foundInCritical) {
            console.error("❌ ID 88 found in findCriticalStock! It should be excluded.");
        } else {
            console.log("✅ ID 88 NOT found in findCriticalStock.");
        }

    } catch (e) {
        console.error("Verification Error:", e);
    }
}

// Give DB a moment to connect if it's async init
setTimeout(() => {
    verify().then(() => process.exit());
}, 2000);
