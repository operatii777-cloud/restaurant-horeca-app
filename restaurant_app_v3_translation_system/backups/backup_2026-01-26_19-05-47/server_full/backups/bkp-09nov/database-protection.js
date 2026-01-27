/**
 * ============================================================================
 * DATABASE PROTECTION SYSTEM
 * ============================================================================
 * Created: 15 Jan 2025
 * Purpose: Protecție pentru baza de date împotriva modificărilor accidentale
 *          și degradării la restart
 * ============================================================================
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'restaurant.db');

// ============================================================================
// DATABASE PROTECTION CONFIGURATION
// ============================================================================

const PROTECTION_CONFIG = {
    // Activează verificări de integritate
    enableIntegrityChecks: true,
    // Activează foreign keys enforcement
    enableForeignKeys: true,
    // Activează backup automat înainte de modificări critice
    enableAutoBackup: true,
    // Activează write protection (doar admin poate modifica)
    enableWriteProtection: false, // Set to true dacă vrei protecție strictă
    // Activează journal mode WAL pentru siguranță
    enableWALMode: true,
    // Backup înainte de modificări critice
    backupBeforeCriticalOps: ['DELETE', 'DROP', 'ALTER', 'UPDATE ingredients', 'UPDATE menu']
};

// ============================================================================
// DATABASE PROTECTION FUNCTIONS
// ============================================================================

/**
 * Verifică integritatea bazei de date
 * @param {Database} db - Database connection
 * @returns {Promise<{isValid: boolean, errors: Array}>}
 */
async function checkDatabaseIntegrity(db) {
    return new Promise((resolve, reject) => {
        const errors = [];
        
        // Verificare integritate completă
        db.all('PRAGMA integrity_check', (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            
            const result = rows[0].integrity_check;
            const isValid = result === 'ok';
            
            if (!isValid) {
                errors.push(`Integrity check failed: ${result}`);
            }
            
            // Verifică foreign keys
            db.get('PRAGMA foreign_key_check', (err, fkErrors) => {
                if (err) {
                    console.warn('⚠️ Could not check foreign keys:', err.message);
                } else if (fkErrors && Object.keys(fkErrors).length > 0) {
                    errors.push(`Foreign key violations detected: ${JSON.stringify(fkErrors)}`);
                }
                
                // Verifică dacă există tabelele esențiale
                db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    const essentialTables = ['menu', 'orders', 'ingredients', 'recipes', 'categories'];
                    const existingTables = tables.map(t => t.name);
                    const missingTables = essentialTables.filter(t => !existingTables.includes(t));
                    
                    if (missingTables.length > 0) {
                        errors.push(`Missing essential tables: ${missingTables.join(', ')}`);
                    }
                    
                    resolve({
                        isValid: isValid && errors.length === 0,
                        errors: errors,
                        tablesChecked: existingTables.length,
                        essentialTablesMissing: missingTables
                    });
                });
            });
        });
    });
}

/**
 * Configurează protecțiile pentru baza de date
 * @param {Database} db - Database connection
 * @returns {Promise<void>}
 */
async function configureDatabaseProtection(db) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Activează foreign keys
            if (PROTECTION_CONFIG.enableForeignKeys) {
                db.run('PRAGMA foreign_keys = ON', (err) => {
                    if (err) {
                        console.warn('⚠️ Could not enable foreign keys:', err.message);
                    } else {
                        console.log('✅ Foreign keys enforcement enabled');
                    }
                });
            }
            
            // Activează WAL mode pentru siguranță și performanță
            if (PROTECTION_CONFIG.enableWALMode) {
                db.run('PRAGMA journal_mode = WAL', (err) => {
                    if (err) {
                        console.warn('⚠️ Could not enable WAL mode:', err.message);
                    } else {
                        console.log('✅ WAL journal mode enabled');
                    }
                });
            }
            
            // Activează synchronous mode pentru siguranță maximă
            db.run('PRAGMA synchronous = FULL', (err) => {
                if (err) {
                    console.warn('⚠️ Could not set synchronous mode:', err.message);
                } else {
                    console.log('✅ Full synchronous mode enabled');
                }
            });
            
            // Activează temp_store în memorie pentru performanță
            db.run('PRAGMA temp_store = MEMORY', (err) => {
                if (err) {
                    console.warn('⚠️ Could not set temp_store:', err.message);
                }
            });
            
            // Activează verificarea integrității la fiecare schimbare
            db.run('PRAGMA quick_check', (err) => {
                if (err) {
                    console.warn('⚠️ Quick check failed:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Database protection configured successfully');
                    resolve();
                }
            });
        });
    });
}

/**
 * Creează backup automat înainte de operații critice
 * @param {string} operation - Numele operației
 * @param {Object} params - Parametrii operației
 * @returns {Promise<string|null>} - Path-ul backup-ului sau null dacă nu a fost creat
 */
async function createAutoBackup(operation, params = {}) {
    if (!PROTECTION_CONFIG.enableAutoBackup) {
        return null;
    }
    
    // Verifică dacă operația necesită backup
    const needsBackup = PROTECTION_CONFIG.backupBeforeCriticalOps.some(op => 
        operation.toUpperCase().includes(op.toUpperCase())
    );
    
    if (!needsBackup) {
        return null;
    }
    
    try {
        const { backupDatabase } = require('./backup-database.js');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const backupName = `auto-pre-${operation.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
        
        console.log(`🔄 Creating auto-backup before ${operation}...`);
        backupDatabase(backupName);
        console.log(`✅ Auto-backup created: ${backupName}`);
        
        return backupName;
    } catch (error) {
        console.error(`❌ Failed to create auto-backup before ${operation}:`, error.message);
        return null;
    }
}

/**
 * Wrapper pentru operații de scriere cu protecție
 * @param {Database} db - Database connection
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @param {string} operation - Numele operației (pentru logging și backup)
 * @returns {Promise<any>}
 */
async function protectedWrite(db, query, params = [], operation = 'WRITE') {
    // Verifică dacă operația necesită backup
    await createAutoBackup(operation, { query, params });
    
    // Verifică integritatea înainte de operație (dacă e activată)
    if (PROTECTION_CONFIG.enableIntegrityChecks) {
        const integrity = await checkDatabaseIntegrity(db);
        if (!integrity.isValid && integrity.errors.length > 0) {
            console.error('❌ Database integrity check failed before operation:', integrity.errors);
            throw new Error(`Database integrity check failed: ${integrity.errors.join('; ')}`);
        }
    }
    
    // Execută operația într-o tranzacție
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION', (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                db.run(query, params, function(runErr) {
                    if (runErr) {
                        db.run('ROLLBACK', () => {
                            reject(runErr);
                        });
                        return;
                    }
                    
                    const lastID = this.lastID;
                    const changes = this.changes;
                    
                    // Verifică integritatea după operație (quick_check pentru performanță)
                    if (PROTECTION_CONFIG.enableIntegrityChecks) {
                        db.all('PRAGMA quick_check', (integrityErr, integrityRows) => {
                            if (integrityErr) {
                                db.run('ROLLBACK', () => {
                                    reject(new Error(`Integrity check failed: ${integrityErr.message}`));
                                });
                                return;
                            }
                            
                            const integrityResult = integrityRows[0].quick_check;
                            if (integrityResult !== 'ok') {
                                db.run('ROLLBACK', () => {
                                    reject(new Error(`Integrity check failed after operation: ${integrityResult}`));
                                });
                                return;
                            }
                            
                            // Commit dacă totul e OK
                            db.run('COMMIT', (commitErr) => {
                                if (commitErr) {
                                    reject(commitErr);
                                } else {
                                    resolve({
                                        lastID: lastID,
                                        changes: changes
                                    });
                                }
                            });
                        });
                    } else {
                        // Commit fără verificare integritate
                        db.run('COMMIT', (commitErr) => {
                            if (commitErr) {
                                reject(commitErr);
                            } else {
                                resolve({
                                    lastID: lastID,
                                    changes: changes
                                });
                            }
                        });
                    }
                });
            });
        });
    });
}

/**
 * Inițializează protecțiile la pornirea serverului
 * @param {Database} db - Database connection
 * @returns {Promise<void>}
 */
async function initializeDatabaseProtection(db) {
    console.log('🛡️ Initializing database protection system...');
    
    try {
        // Configurează protecțiile
        await configureDatabaseProtection(db);
        
        // Verifică integritatea la pornire
        if (PROTECTION_CONFIG.enableIntegrityChecks) {
            const integrity = await checkDatabaseIntegrity(db);
            
            if (!integrity.isValid) {
                console.error('❌ Database integrity check failed at startup:', integrity.errors);
                console.error('   Consider restoring from backup');
                
                // Nu aruncăm eroare - doar logăm pentru că serverul trebuie să poată porni
                // Admin-ul va vedea eroarea și poate restaura din backup
            } else {
                console.log(`✅ Database integrity verified: ${integrity.tablesChecked} tables checked`);
            }
        }
        
        console.log('✅ Database protection system initialized');
    } catch (error) {
        console.error('❌ Failed to initialize database protection:', error.message);
        // Nu blocăm pornirea serverului - doar logăm eroarea
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    checkDatabaseIntegrity,
    configureDatabaseProtection,
    createAutoBackup,
    protectedWrite,
    initializeDatabaseProtection,
    PROTECTION_CONFIG
};

