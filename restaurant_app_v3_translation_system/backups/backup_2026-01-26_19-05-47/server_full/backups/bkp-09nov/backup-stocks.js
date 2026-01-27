// Script pentru backup și restore al stocurilor
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = './backups';
const STOCKS_BACKUP_FILE = path.join(BACKUP_DIR, 'stocks_backup.json');

// Creează directorul de backup dacă nu există
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Funcție pentru backup stocuri
function backupStocks() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./restaurant.db', (err) => {
            if (err) {
                console.error('Eroare la conectarea la baza de date:', err.message);
                reject(err);
                return;
            }
        });

        // Backup ingrediente
        db.all("SELECT * FROM ingredients", (err, ingredients) => {
            if (err) {
                console.error('Eroare la backup ingrediente:', err.message);
                reject(err);
                return;
            }

            // Backup stocuri produse
            db.all("SELECT * FROM stock_management", (err, stockManagement) => {
                if (err) {
                    console.error('Eroare la backup stock_management:', err.message);
                    reject(err);
                    return;
                }

                // Backup istoric stocuri
                db.all("SELECT * FROM stock_history ORDER BY created_at DESC LIMIT 1000", (err, stockHistory) => {
                    if (err) {
                        console.error('Eroare la backup stock_history:', err.message);
                        reject(err);
                        return;
                    }

                    const backupData = {
                        timestamp: new Date().toISOString(),
                        ingredients: ingredients,
                        stock_management: stockManagement,
                        stock_history: stockHistory
                    };

                    try {
                        fs.writeFileSync(STOCKS_BACKUP_FILE, JSON.stringify(backupData, null, 2));
                        console.log(`✅ Backup stocuri creat: ${STOCKS_BACKUP_FILE}`);
                        console.log(`📊 Ingrediente: ${ingredients.length}`);
                        console.log(`📊 Stocuri produse: ${stockManagement.length}`);
                        console.log(`📊 Istoric stocuri: ${stockHistory.length}`);
                        resolve(backupData);
                    } catch (writeErr) {
                        console.error('Eroare la scrierea backup-ului:', writeErr.message);
                        reject(writeErr);
                    } finally {
                        db.close();
                    }
                });
            });
        });
    });
}

// Funcție pentru restore stocuri
function restoreStocks() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(STOCKS_BACKUP_FILE)) {
            console.log('⚠️ Nu există backup pentru stocuri');
            resolve(false);
            return;
        }

        try {
            const backupData = JSON.parse(fs.readFileSync(STOCKS_BACKUP_FILE, 'utf8'));
            console.log(`📂 Restaurez backup stocuri din: ${backupData.timestamp}`);

            const db = new sqlite3.Database('./restaurant.db', (err) => {
                if (err) {
                    console.error('Eroare la conectarea la baza de date:', err.message);
                    reject(err);
                    return;
                }
            });

            let completed = 0;
            const total = 3;

            // Restore ingrediente
            if (backupData.ingredients && backupData.ingredients.length > 0) {
                const ingredientStmt = db.prepare(`
                    INSERT OR REPLACE INTO ingredients 
                    (id, name, unit, current_stock, min_stock, cost_per_unit, supplier, category, is_available, last_updated, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                backupData.ingredients.forEach(ingredient => {
                    ingredientStmt.run([
                        ingredient.id,
                        ingredient.name,
                        ingredient.unit,
                        ingredient.current_stock,
                        ingredient.min_stock,
                        ingredient.cost_per_unit,
                        ingredient.supplier,
                        ingredient.category,
                        ingredient.is_available,
                        ingredient.last_updated,
                        ingredient.created_at
                    ]);
                });

                ingredientStmt.finalize();
                console.log(`✅ Restaurat ${backupData.ingredients.length} ingrediente`);
            }

            completed++;
            if (completed === total) {
                db.close();
                resolve(true);
                return;
            }

            // Restore stock_management
            if (backupData.stock_management && backupData.stock_management.length > 0) {
                const stockStmt = db.prepare(`
                    INSERT OR REPLACE INTO stock_management 
                    (id, product_id, daily_stock, current_stock, min_stock_alert, is_available, last_updated, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);

                backupData.stock_management.forEach(stock => {
                    stockStmt.run([
                        stock.id,
                        stock.product_id,
                        stock.daily_stock,
                        stock.current_stock,
                        stock.min_stock_alert,
                        stock.is_available,
                        stock.last_updated,
                        stock.created_at
                    ]);
                });

                stockStmt.finalize();
                console.log(`✅ Restaurat ${backupData.stock_management.length} stocuri produse`);
            }

            completed++;
            if (completed === total) {
                db.close();
                resolve(true);
                return;
            }

            // Restore stock_history
            if (backupData.stock_history && backupData.stock_history.length > 0) {
                const historyStmt = db.prepare(`
                    INSERT OR REPLACE INTO stock_history 
                    (id, product_id, action, quantity_change, old_stock, new_stock, reason, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);

                backupData.stock_history.forEach(history => {
                    historyStmt.run([
                        history.id,
                        history.product_id,
                        history.action,
                        history.quantity_change,
                        history.old_stock,
                        history.new_stock,
                        history.reason,
                        history.created_at
                    ]);
                });

                historyStmt.finalize();
                console.log(`✅ Restaurat ${backupData.stock_history.length} înregistrări istoric`);
            }

            completed++;
            if (completed === total) {
                db.close();
                resolve(true);
                return;
            }

        } catch (error) {
            console.error('Eroare la restore stocuri:', error.message);
            reject(error);
        }
    });
}

// Funcție pentru backup automat la modificări
function autoBackupStocks() {
    backupStocks().catch(err => {
        console.error('Eroare la backup automat stocuri:', err.message);
    });
}

// Export funcții
module.exports = {
    backupStocks,
    restoreStocks,
    autoBackupStocks
};

// Dacă scriptul este rulat direct
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'backup') {
        backupStocks()
            .then(() => {
                console.log('✅ Backup stocuri finalizat cu succes!');
                process.exit(0);
            })
            .catch(err => {
                console.error('❌ Eroare la backup stocuri:', err.message);
                process.exit(1);
            });
    } else if (command === 'restore') {
        restoreStocks()
            .then(() => {
                console.log('✅ Restore stocuri finalizat cu succes!');
                process.exit(0);
            })
            .catch(err => {
                console.error('❌ Eroare la restore stocuri:', err.message);
                process.exit(1);
            });
    } else {
        console.log('Utilizare: node backup-stocks.js [backup|restore]');
        process.exit(1);
    }
}
