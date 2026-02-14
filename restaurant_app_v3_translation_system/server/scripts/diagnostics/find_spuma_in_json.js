
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'retete', 'retete-raw', 'retete-active.json');

try {
    const buffer = fs.readFileSync(filePath);
    let str = buffer.toString('utf8');

    // Find first '['
    const arrayStart = str.indexOf('[');
    if (arrayStart > -1) {
        str = str.slice(arrayStart);
    }

    // Clean up potential trailing garbage if any, though JSON.parse might ignore whitespace
    // But sometimes file ends weirdly.

    const recipes = JSON.parse(str);
    console.log(`Loaded ${recipes.length} recipe items.`);

    const matches = recipes.filter(r => {
        const iName = (r.ingredient_name || "").toLowerCase();
        return iName.includes("spuma") || iName.includes("fierbinte");
    });

    console.log(`Found ${matches.length} matches in JSON:`);
    matches.forEach(m => {
        console.log(`Product: "${m.product_name}" -> Ingredient: "${m.ingredient_name}" (ID: ${m.ingredient_id})`);
    });

} catch (e) {
    console.error(e);
}
