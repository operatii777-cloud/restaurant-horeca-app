// Script pentru backup și restore al imaginilor produselor
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = './backups';
const IMAGES_BACKUP_FILE = path.join(BACKUP_DIR, 'images_backup.json');

// Creează directorul de backup dacă nu există
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Funcție pentru backup imagini
function backupImages() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./restaurant.db', (err) => {
            if (err) {
                console.error('Eroare la conectarea la baza de date:', err.message);
                reject(err);
                return;
            }
        });

        console.log('🖼️ Creez backup pentru imaginile produselor...');
        
        // Backup produse cu imagini
        db.all("SELECT id, name, image_url FROM menu WHERE image_url IS NOT NULL AND image_url != ''", (err, products) => {
            if (err) {
                console.error('Eroare la backup produse cu imagini:', err.message);
                reject(err);
                return;
            }

            const backupData = {
                timestamp: new Date().toISOString(),
                products_with_images: products,
                total_images: products.length
            };

            try {
                fs.writeFileSync(IMAGES_BACKUP_FILE, JSON.stringify(backupData, null, 2));
                console.log(`✅ Backup imagini creat: ${IMAGES_BACKUP_FILE}`);
                console.log(`📊 Produse cu imagini: ${products.length}`);
                resolve(backupData);
            } catch (writeErr) {
                console.error('Eroare la scrierea backup-ului:', writeErr.message);
                reject(writeErr);
            } finally {
                db.close();
            }
        });
    });
}

// Funcție pentru restore imagini
function restoreImages() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(IMAGES_BACKUP_FILE)) {
            console.log('⚠️ Nu există backup pentru imagini');
            resolve(false);
            return;
        }

        try {
            const backupData = JSON.parse(fs.readFileSync(IMAGES_BACKUP_FILE, 'utf8'));
            console.log(`📂 Restaurez backup imagini din: ${backupData.timestamp}`);

            const db = new sqlite3.Database('./restaurant.db', (err) => {
                if (err) {
                    console.error('Eroare la conectarea la baza de date:', err.message);
                    reject(err);
                    return;
                }
            });

            let restored = 0;
            let skipped = 0;

            if (backupData.products_with_images && backupData.products_with_images.length > 0) {
                const stmt = db.prepare(`
                    UPDATE menu 
                    SET image_url = ? 
                    WHERE id = ? AND (image_url IS NULL OR image_url = '')
                `);

                backupData.products_with_images.forEach(product => {
                    stmt.run([product.image_url, product.id], function(err) {
                        if (err) {
                            console.error(`Eroare la restaurarea imaginii pentru ${product.name}:`, err.message);
                            skipped++;
                        } else if (this.changes > 0) {
                            console.log(`✅ Restaurată imaginea pentru: ${product.name}`);
                            restored++;
                        } else {
                            console.log(`⏭️ Produsul ${product.name} are deja imagine`);
                            skipped++;
                        }
                    });
                });

                stmt.finalize();
            }

            db.close();
            console.log(`\n📈 Rezumat restore imagini:`);
            console.log(`   ✅ Restaurate: ${restored} imagini`);
            console.log(`   ⏭️ Oprite: ${skipped} imagini`);
            console.log(`   📊 Total procesate: ${backupData.products_with_images.length} imagini`);
            
            resolve({ restored, skipped });
        } catch (error) {
            console.error('Eroare la restore imagini:', error.message);
            reject(error);
        }
    });
}

// Funcție pentru backup automat la modificări
function autoBackupImages() {
    backupImages().catch(err => {
        console.error('Eroare la backup automat imagini:', err.message);
    });
}

// Export funcții
module.exports = {
    backupImages,
    restoreImages,
    autoBackupImages
};

// Dacă scriptul este rulat direct
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'backup') {
        backupImages()
            .then(() => {
                console.log('✅ Backup imagini finalizat cu succes!');
                process.exit(0);
            })
            .catch(err => {
                console.error('❌ Eroare la backup imagini:', err.message);
                process.exit(1);
            });
    } else if (command === 'restore') {
        restoreImages()
            .then(() => {
                console.log('✅ Restore imagini finalizat cu succes!');
                process.exit(0);
            })
            .catch(err => {
                console.error('❌ Eroare la restore imagini:', err.message);
                process.exit(1);
            });
    } else {
        console.log('Utilizare: node backup-images.js [backup|restore]');
        process.exit(1);
    }
}
