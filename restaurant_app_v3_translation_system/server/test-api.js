const fetch = require('node-fetch');

async function test() {
    try {
        const response = await fetch('http://localhost:3001/api/ingredients');
        const data = await response.json();
        console.log('Response keys:', Object.keys(data));
        if (data.ingredients) {
            console.log('Ingredients count:', data.ingredients.length);
            if (data.ingredients.length > 0) {
                console.log('Sample ingredient:', JSON.stringify(data.ingredients[0], null, 2));
            }
        } else {
            console.log('❌ ingredients key is MISSING');
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
