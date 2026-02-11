const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Database migration for ISO compliance features
 */
async function migrateISOCompliance() {
    console.log('🔄 [ISO MIGRATION] Starting ISO compliance database migration...');

    const dbPath = path.join(__dirname, '../../data/restaurant.db');
    const db = new sqlite3.Database(dbPath);

    const runSQL = (sql) => {
        return new Promise((resolve, reject) => {
            db.run(sql, function (err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    };

    try {
        // 1. Add MFA columns to users table
        try {
            await runSQL(`ALTER TABLE users ADD COLUMN mfa_enabled INTEGER DEFAULT 0`);
            console.log('✅ Added mfa_enabled column');
        } catch (err) {
            if (!err.message.includes('duplicate column')) throw err;
        }

        try {
            await runSQL(`ALTER TABLE users ADD COLUMN mfa_secret TEXT`);
            console.log('✅ Added mfa_secret column');
        } catch (err) {
            if (!err.message.includes('duplicate column')) throw err;
        }

        try {
            await runSQL(`ALTER TABLE users ADD COLUMN mfa_backup_codes TEXT`);
            console.log('✅ Added mfa_backup_codes column');
        } catch (err) {
            if (!err.message.includes('duplicate column')) throw err;
        }

        // 2. Create recall_affected_items table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS recall_affected_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recall_id INTEGER NOT NULL,
                item_type TEXT NOT NULL,
                item_id INTEGER NOT NULL,
                quantity REAL,
                customer_info TEXT,
                identified_at TEXT NOT NULL,
                FOREIGN KEY (recall_id) REFERENCES product_recalls(id)
            )
        `);
        console.log('✅ Created recall_affected_items table');

        // 3. Create equipment_calibration_schedule table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS equipment_calibration_schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                equipment_id INTEGER NOT NULL,
                calibration_type TEXT NOT NULL,
                frequency TEXT NOT NULL,
                next_due_date TEXT NOT NULL,
                last_completed TEXT,
                assigned_to INTEGER,
                critical_equipment INTEGER DEFAULT 0,
                status TEXT DEFAULT 'scheduled',
                created_at TEXT NOT NULL,
                FOREIGN KEY (equipment_id) REFERENCES compliance_equipment(id),
                FOREIGN KEY (assigned_to) REFERENCES users(id)
            )
        `);
        console.log('✅ Created equipment_calibration_schedule table');

        // 4. Create equipment_calibration_records table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS equipment_calibration_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                equipment_id INTEGER NOT NULL,
                calibration_type TEXT NOT NULL,
                performed_by INTEGER NOT NULL,
                performed_at TEXT NOT NULL,
                reference_value REAL NOT NULL,
                measured_value REAL NOT NULL,
                deviation REAL NOT NULL,
                within_tolerance INTEGER DEFAULT 1,
                adjustment_made INTEGER DEFAULT 0,
                adjustment_details TEXT,
                certificate_number TEXT,
                notes TEXT,
                FOREIGN KEY (equipment_id) REFERENCES compliance_equipment(id),
                FOREIGN KEY (performed_by) REFERENCES users(id)
            )
        `);
        console.log('✅ Created equipment_calibration_records table');

        // 5. Create calibration_alerts table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS calibration_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                equipment_id INTEGER NOT NULL,
                calibration_type TEXT NOT NULL,
                deviation REAL NOT NULL,
                severity TEXT NOT NULL,
                created_at TEXT NOT NULL,
                resolved_at TEXT,
                resolved_by INTEGER,
                status TEXT DEFAULT 'active',
                FOREIGN KEY (equipment_id) REFERENCES compliance_equipment(id),
                FOREIGN KEY (resolved_by) REFERENCES users(id)
            )
        `);
        console.log('✅ Created calibration_alerts table');

        // 6. Add calibration columns to compliance_equipment
        try {
            await runSQL(`ALTER TABLE compliance_equipment ADD COLUMN last_calibration TEXT`);
            console.log('✅ Added last_calibration column');
        } catch (err) {
            if (!err.message.includes('duplicate column')) throw err;
        }

        try {
            await runSQL(`ALTER TABLE compliance_equipment ADD COLUMN calibration_status TEXT DEFAULT 'pending'`);
            console.log('✅ Added calibration_status column');
        } catch (err) {
            if (!err.message.includes('duplicate column')) throw err;
        }

        // 7. Add completion columns to product_recalls
        try {
            await runSQL(`ALTER TABLE product_recalls ADD COLUMN completed_at TEXT`);
            console.log('✅ Added completed_at column');
        } catch (err) {
            if (!err.message.includes('duplicate column')) throw err;
        }

        try {
            await runSQL(`ALTER TABLE product_recalls ADD COLUMN completed_by INTEGER`);
            console.log('✅ Added completed_by column');
        } catch (err) {
            if (!err.message.includes('duplicate column')) throw err;
        }

        try {
            await runSQL(`ALTER TABLE product_recalls ADD COLUMN completion_notes TEXT`);
            console.log('✅ Added completion_notes column');
        } catch (err) {
            if (!err.message.includes('duplicate column')) throw err;
        }

        // 8. Create indexes
        await runSQL(`CREATE INDEX IF NOT EXISTS idx_recall_affected_recall_id ON recall_affected_items(recall_id)`);
        await runSQL(`CREATE INDEX IF NOT EXISTS idx_calibration_schedule_equipment ON equipment_calibration_schedule(equipment_id)`);
        await runSQL(`CREATE INDEX IF NOT EXISTS idx_calibration_records_equipment ON equipment_calibration_records(equipment_id)`);
        console.log('✅ Created performance indexes');

        console.log('🎉 [ISO MIGRATION] ISO compliance database migration completed successfully!');

        db.close();
        return true;
    } catch (error) {
        console.error('❌ [ISO MIGRATION] Migration failed:', error);
        db.close();
        throw error;
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateISOCompliance()
        .then(() => {
            console.log('Migration completed');
            process.exit(0);
        })
        .catch((err) => {
            console.error('Migration failed:', err);
            process.exit(1);
        });
}

module.exports = migrateISOCompliance;
