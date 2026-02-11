
const { dbPromise } = require('./database');
const crypto = require('crypto');

async function resetAdmin() {
    const db = await dbPromise;
    const password = 'admin';
    const pin = '1234';

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${hash}`;

    await db.run("UPDATE users SET password_hash = ?, pin = ? WHERE username = 'admin'", [passwordHash, pin]);
    console.log('Admin password reset to "admin" and PIN to "1234"');
}

resetAdmin().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
