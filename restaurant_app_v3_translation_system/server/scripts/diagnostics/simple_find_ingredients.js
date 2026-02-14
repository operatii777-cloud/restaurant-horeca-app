
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

const searchTerms = ['apa', 'lapte', 'spuma'];

db.serialize(() => {
    db.all("SELECT * FROM customization_options", [], (err, rows) => {
        if (err) return console.error(err);

        console.log(`\nTotal items in customization_options: ${rows.length}`);

        const matches = rows.filter(i => {
            const name = (i.option_name || '').toLowerCase();
            return searchTerms.some(term => name.includes(term));
        });

        console.log(`Found ${matches.length} CUSTOMIZATIONS matching broad terms:`);
        matches.forEach(match => {
            console.log(`ID: ${match.id}, Menu ID: ${match.menu_item_id}, Name: "${match.option_name}"`);
        });
    });
});

setTimeout(() => db.close(), 3000);
