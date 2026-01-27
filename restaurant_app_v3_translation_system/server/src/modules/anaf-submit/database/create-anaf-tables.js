/**
 * PHASE S8.7 - Migration: Create ANAF queue and journal tables
 * 
 * Restaurant App V3 powered by QrOMS
 */

const { dbPromise } = require('../../../../database');

async function createAnafTables() {
  const db = await dbPromise;
  
  // Create anaf_queue table
  await new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS anaf_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_type TEXT NOT NULL,
        document_id INTEGER NOT NULL,
        xml TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('high', 'normal')),
        status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'DEAD_LETTER')),
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error('❌ Error creating anaf_queue table:', err.message);
          reject(err);
        } else {
          console.log('✅ anaf_queue table created/verified');
          
          // Create indexes
          db.run(`CREATE INDEX IF NOT EXISTS idx_anaf_queue_status ON anaf_queue(status, scheduled_at)`, () => {});
          db.run(`CREATE INDEX IF NOT EXISTS idx_anaf_queue_priority ON anaf_queue(priority, scheduled_at)`, () => resolve());
        }
      }
    );
  });

  // Create anaf_journal table
  await new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS anaf_journal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        document_type TEXT NOT NULL,
        xml TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('QUEUED', 'SUBMITTED', 'CONFIRMED', 'REJECTED', 'FAILED')),
        attempts INTEGER NOT NULL DEFAULT 0,
        spv_id TEXT,
        response_xml TEXT,
        error TEXT,
        submitted_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error('❌ Error creating anaf_journal table:', err.message);
          reject(err);
        } else {
          console.log('✅ anaf_journal table created/verified');
          
          // Create indexes
          db.run(`CREATE INDEX IF NOT EXISTS idx_anaf_journal_document ON anaf_journal(document_id, document_type)`, () => {});
          db.run(`CREATE INDEX IF NOT EXISTS idx_anaf_journal_status ON anaf_journal(status, created_at)`, () => resolve());
        }
      }
    );
  });
}

module.exports = { createAnafTables };


