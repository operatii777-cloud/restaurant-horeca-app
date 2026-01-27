// migrations/004-create-table-sessions.js
// FAZA 2B Extended - Table Turnover & Utilization
// Data: 28 Octombrie 2025

/**
 * Creare tabel table_sessions pentru tracking ocupare/eliberare mese
 * 
 * Folosit pentru:
 * - Table Turnover KPI (servings / mese ocupate)
 * - Table Utilization KPI (mese folosite / 200 total)
 * - Analiză eficiență mese
 * - Revenue per table
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function up() {
    const dbPath = path.join(__dirname, '../restaurant.db');  // server/migrations/../ = server/restaurant.db
    const db = new sqlite3.Database(dbPath);

    return new Promise((resolve, reject) => {
        let operationsPending = 5; // Număr total de operații async
        let hasError = false;

        const checkComplete = () => {
            operationsPending--;
            if (operationsPending === 0 && !hasError) {
                console.log('✅ [Migration 004] All operations completed, closing DB...');
                db.close((err) => {
                    if (err) console.error('Error closing DB:', err);
                    else console.log('✅ DB closed successfully');
                    resolve();
                });
            }
        };

        const handleError = (err, operation) => {
            if (!hasError) {
                hasError = true;
                console.error(`❌ [Migration 004] Error in ${operation}:`, err);
                db.close();
                reject(err);
            }
        };

        db.serialize(() => {
            console.log('🔄 [Migration 004] Creating table_sessions table...');

            // Creare tabel table_sessions
            db.run(`
                CREATE TABLE IF NOT EXISTS table_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    tenant_id INTEGER DEFAULT 1,
                    table_id INTEGER NOT NULL,
                    order_id INTEGER,
                    waiter_id INTEGER,
                    
                    -- Timestamps
                    occupied_at DATETIME NOT NULL,
                    freed_at DATETIME,
                    
                    -- Metrici calculate
                    duration_minutes INTEGER,
                    party_size INTEGER DEFAULT 1,
                    
                    -- Revenue
                    revenue DECIMAL(10,2) DEFAULT 0.00,
                    
                    -- Metadata
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    
                    -- Foreign keys
                    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
                )
            `, (err) => {
                if (err) {
                    handleError(err, 'CREATE TABLE');
                    return;
                }
                console.log('✅ [Migration 004] Table table_sessions created successfully');
                checkComplete();
            });

            // Index pentru performanță
            db.run(`
                CREATE INDEX IF NOT EXISTS idx_table_sessions_tenant 
                ON table_sessions(tenant_id)
            `, (err) => {
                if (err) {
                    handleError(err, 'CREATE INDEX tenant');
                    return;
                }
                console.log('✅ Index idx_table_sessions_tenant created');
                checkComplete();
            });

            db.run(`
                CREATE INDEX IF NOT EXISTS idx_table_sessions_table_date 
                ON table_sessions(table_id, occupied_at)
            `, (err) => {
                if (err) {
                    handleError(err, 'CREATE INDEX table_date');
                    return;
                }
                console.log('✅ Index idx_table_sessions_table_date created');
                checkComplete();
            });

            db.run(`
                CREATE INDEX IF NOT EXISTS idx_table_sessions_occupied_at 
                ON table_sessions(occupied_at)
            `, (err) => {
                if (err) {
                    handleError(err, 'CREATE INDEX occupied_at');
                    return;
                }
                console.log('✅ Index idx_table_sessions_occupied_at created');
                checkComplete();
            });

            db.run(`
                CREATE INDEX IF NOT EXISTS idx_table_sessions_order 
                ON table_sessions(order_id)
            `, (err) => {
                if (err) {
                    handleError(err, 'CREATE INDEX order');
                    return;
                }
                console.log('✅ Index idx_table_sessions_order created');
                checkComplete();
            });

            // Trigger pentru auto-update updated_at - numără ca ultima operație
        });
    });
}

async function down() {
    const dbPath = path.join(__dirname, '../restaurant.db');  // server/migrations/../ = server/restaurant.db
    const db = new sqlite3.Database(dbPath);

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            console.log('🔄 [Migration 004] Rolling back table_sessions table...');

            db.run(`DROP TRIGGER IF EXISTS update_table_sessions_timestamp`, (err) => {
                if (err) console.error('⚠️ Error dropping trigger:', err);
            });

            db.run(`DROP INDEX IF EXISTS idx_table_sessions_order`, (err) => {
                if (err) console.error('⚠️ Error dropping index:', err);
            });

            db.run(`DROP INDEX IF EXISTS idx_table_sessions_occupied_at`, (err) => {
                if (err) console.error('⚠️ Error dropping index:', err);
            });

            db.run(`DROP INDEX IF EXISTS idx_table_sessions_table_date`, (err) => {
                if (err) console.error('⚠️ Error dropping index:', err);
            });

            db.run(`DROP INDEX IF EXISTS idx_table_sessions_tenant`, (err) => {
                if (err) console.error('⚠️ Error dropping index:', err);
            });

            db.run(`DROP TABLE IF EXISTS table_sessions`, (err) => {
                if (err) {
                    console.error('❌ [Migration 004] Error dropping table_sessions:', err);
                    reject(err);
                    return;
                }
                console.log('✅ [Migration 004] Table table_sessions dropped successfully');
                resolve();
            });
        });

        db.close();
    });
}

// Rulare directă
if (require.main === module) {
    up()
        .then(() => {
            console.log('✅ Migration 004 completed successfully');
            process.exit(0);
        })
        .catch((err) => {
            console.error('❌ Migration 004 failed:', err);
            process.exit(1);
        });
}

module.exports = { up, down };

