
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = require('./server/config/database');
const ingredientsModel = require('./server/models/ingredients.model');
const recipesModel = require('./server/models/recipes.model');

async function findIngredients() {
    try {
        // Manually connect to the correct database path
        const dbPath = path.join(__dirname, 'server/restaurant.db');
        console.log('🔍 Connecting to local database:', dbPath);

        await new Promise((resolve, reject) => {
            db.db = new sqlite3.Database(dbPath, (err) => {
                if (err) return reject(err);
                db.isConnected = true;
                console.log('✅ Connected manually');
                resolve();
            });
        });

        // Enable foreign keys
        await db.run('PRAGMA foreign_keys = ON');

        const searchTerms = ['apa fierbinte', 'spuma de lapte', 'hot water', 'milk foam'];

        console.log('Searching for ingredients...');
        const allIngredients = await ingredientsModel.findAll();

        const matches = allIngredients.filter(i => {
            const name = i.name.toLowerCase();
            return searchTerms.some(term => name.includes(term));
        });

        console.log(`Found ${matches.length} matches:`);

        for (const match of matches) {
            console.log(`\nID: ${match.id}, Name: ${match.name}`);
            console.log(`Current Stock: ${match.current_stock} ${match.unit}`);

            // Find usage in recipes
            const usage = await recipesModel.getIngredientUsage(match.id);
            console.log(`Used in ${usage.length} recipes:`);
            usage.forEach(u => {
                console.log(` - Product: ${u.product_name} (ID: ${u.product_id}), Qty: ${u.quantity}`);
            });
        }
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        setTimeout(async () => {
            if (db.isConnected) await db.close();
            process.exit(0);
        }, 1000);
    }
}

findIngredients();
