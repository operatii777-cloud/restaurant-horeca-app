
const { dbPromise } = require('./database');

async function findAdmin() {
    const db = await dbPromise;
    const user = await db.get("SELECT * FROM users LIMIT 1"); // Assuming 'users' table
    if (user) {
        console.log('Found user:', user.username, user.email);
        // password hash is likely argon2 or similar, can't reverse.
        // But knowing username helps.
    } else {
        console.log('No users found in "users" table.');
        // Check if table exists
        const table = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
        if (!table) console.log('Table "users" does not exist.');
    }
}

findAdmin();
