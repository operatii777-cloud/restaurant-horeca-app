/**
 * HACCP TABLES - Tabele pentru sistemul de siguranță alimentară
 * Data: 05 Februarie 2026
 * Include în database.js pentru crearea automată
 */

function createHaccpTables(db) {
    return new Promise((resolve, reject) => {
        console.log('\n🛡️ Creating HACCP Tables...\n');

        const tables = [];
        let completed = 0;

        // Counter pentru progres
        const checkComplete = () => {
            completed++;
            if (completed === tables.length) {
                console.log(`\n✅ HACCP tables created: ${completed}/${tables.length}\n`);
                resolve();
            }
        };

        // ========== 1. HACCP PROCESSES ==========
        tables.push(() => {
            db.run(`CREATE TABLE IF NOT EXISTS haccp_processes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
                if (err) console.error('❌ haccp_processes:', err.message);
                else {
                    console.log('✅ haccp_processes created');
                    // Populate defaults if empty
                    db.get('SELECT COUNT(*) as count FROM haccp_processes', (err, row) => {
                        if (!err && row.count === 0) {
                            const defaults = [
                                ['Recepție', 'Recepția materiilor prime'],
                                ['Depozitare', 'Depozitare la temperatura controlată'],
                                ['Preparare', 'Preparare termică și non-termică'],
                                ['Gătire', 'Procese termice (fierbere, coacere, prăjire)'],
                                ['Răcire', 'Răcire rapidă'],
                                ['Servire', 'Menținere la cald și servire']
                            ];
                            const stmt = db.prepare('INSERT INTO haccp_processes (name, description) VALUES (?, ?)');
                            defaults.forEach(d => stmt.run(d));
                            stmt.finalize();
                            console.log('   -> Populated default HACCP processes');
                        }
                    });
                }
                checkComplete();
            });
        });

        // ========== 2. CRITICAL CONTROL POINTS (CCP) ==========
        tables.push(() => {
            db.run(`CREATE TABLE IF NOT EXISTS haccp_ccp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        process_id INTEGER NOT NULL,
        ccp_number TEXT NOT NULL, -- e.g., "CCP 1"
        name TEXT NOT NULL,
        hazard_description TEXT,
        control_measure TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (process_id) REFERENCES haccp_processes(id) ON DELETE CASCADE
      )`, (err) => {
                if (err) console.error('❌ haccp_ccp:', err.message);
                else console.log('✅ haccp_ccp created');
                checkComplete();
            });
        });

        // ========== 3. CRITICAL LIMITS ==========
        tables.push(() => {
            db.run(`CREATE TABLE IF NOT EXISTS haccp_limits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ccp_id INTEGER NOT NULL,
        parameter_name TEXT NOT NULL, -- e.g., "Temperatura internă"
        min_val REAL,
        max_val REAL,
        target_val REAL,
        unit TEXT, -- e.g., "°C", "min"
        frequency TEXT, -- e.g., "La fiecare lot"
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ccp_id) REFERENCES haccp_ccp(id) ON DELETE CASCADE
      )`, (err) => {
                if (err) console.error('❌ haccp_limits:', err.message);
                else console.log('✅ haccp_limits created');
                checkComplete();
            });
        });

        // ========== 4. MONITORING LOGS ==========
        tables.push(() => {
            db.run(`CREATE TABLE IF NOT EXISTS haccp_monitoring (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ccp_id INTEGER NOT NULL,
        parameter_name TEXT NOT NULL,
        measured_value REAL NOT NULL,
        operator_id INTEGER,
        status TEXT DEFAULT 'compliant', -- compliant, critical, warning
        notes TEXT,
        monitored_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ccp_id) REFERENCES haccp_ccp(id),
        FOREIGN KEY (operator_id) REFERENCES users(id) -- or waiters/employees
      )`, (err) => {
                if (err) console.error('❌ haccp_monitoring:', err.message);
                else console.log('✅ haccp_monitoring created');
                checkComplete();
            });
        });

        // ========== 5. CORRECTIVE ACTIONS ==========
        tables.push(() => {
            db.run(`CREATE TABLE IF NOT EXISTS haccp_corrective_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ccp_id INTEGER NOT NULL,
        monitoring_id INTEGER, -- Optional link to specific failed check
        action_taken TEXT NOT NULL,
        taken_by INTEGER,
        resolved INTEGER DEFAULT 0,
        resolved_at DATETIME,
        verification_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ccp_id) REFERENCES haccp_ccp(id),
        FOREIGN KEY (monitoring_id) REFERENCES haccp_monitoring(id) ON DELETE SET NULL
      )`, (err) => {
                if (err) console.error('❌ haccp_corrective_actions:', err.message);
                else console.log('✅ haccp_corrective_actions created');
                checkComplete();
            });
        });

        // Execute all table creation
        tables.forEach(createTable => createTable());
    });
}

module.exports = { createHaccpTables };
