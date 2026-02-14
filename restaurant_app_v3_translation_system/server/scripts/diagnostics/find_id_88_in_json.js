
const fs = require('fs');
const path = require('path');

// Directories to check
const dirs = [
    path.join(__dirname, 'retete', 'retete-raw'),
    path.join(__dirname, 'retete', 'retete-actuale'),
    path.join(__dirname, 'retete', 'retete-vechi', 'retete-raw')
];

let foundCount = 0;

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        if (!file.endsWith('.json')) return;

        try {
            const content = fs.readFileSync(path.join(dir, file), 'utf8');
            // Simple string check usually works for "ingredientId": 88 or "ingredientId":88
            // Be careful of "ingredientId": 880 or things like that.
            // Best to parse if file is small, or regex.
            if (content.match(/"ingredientId"\s*:\s*88\b/) || content.match(/"ingredient_id"\s*:\s*88\b/)) {
                console.log(`Found ID 88 in file: ${path.join(dir, file)}`);
                // Let's try to parse to get product name
                try {
                    let jsonStr = content.trim();
                    if (jsonStr.charCodeAt(0) === 0xFEFF) jsonStr = jsonStr.slice(1);

                    // Handle the array format vs object format
                    if (jsonStr.startsWith('[')) {
                        const recipes = JSON.parse(jsonStr);
                        const matches = recipes.filter(r => r.ingredient_id === 88);
                        matches.forEach(m => console.log(` - Product: ${m.product_name} (ID: ${m.product_id})`));
                    } else {
                        const product = JSON.parse(jsonStr);
                        console.log(` - Product: ${product.productName || product.name} (ID: ${product.productId || product.id})`);
                    }
                    foundCount++;
                } catch (e) {
                    console.log(` - Could not parse JSON to get name: ${e.message}`);
                }
            }
        } catch (err) {
            console.error(`Error reading ${file}: ${err.message}`);
        }
    });
});

if (foundCount === 0) console.log("No usage of ID 88 found in JSON files.");
