/**
 * MIGRATION: Add PDF Sections Support
 * 
 * Creates menu_pdf_sections table and adds section_id to menu_pdf_categories
 * Allows grouping categories into custom sections/chapters
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'restaurant.db');

async function runMigration() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Error connecting to database:', err);
        reject(err);
        return;
      }
      console.log('✅ Connected to database');
    });

    db.serialize(() => {
      // Step 1: Create menu_pdf_sections table
      db.run(`
        CREATE TABLE IF NOT EXISTS menu_pdf_sections (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('food', 'drinks')),
          order_index INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating menu_pdf_sections table:', err);
          reject(err);
          return;
        }
        console.log('✅ Table menu_pdf_sections created');
      });

      // Step 2: Check if section_id column exists
      db.all(`PRAGMA table_info(menu_pdf_categories)`, [], (err, columns) => {
        if (err) {
          console.error('❌ Error checking menu_pdf_categories structure:', err);
          reject(err);
          return;
        }

        const hasSectionId = columns.some(col => col.name === 'section_id');

        if (!hasSectionId) {
          // Add section_id column
          db.run(`
            ALTER TABLE menu_pdf_categories 
            ADD COLUMN section_id INTEGER REFERENCES menu_pdf_sections(id)
          `, (err) => {
            if (err) {
              console.error('❌ Error adding section_id column:', err);
              reject(err);
              return;
            }
            console.log('✅ Column section_id added to menu_pdf_categories');
            db.close();
            resolve();
          });
        } else {
          console.log('ℹ️  Column section_id already exists');
          db.close();
          resolve();
        }
      });
    });
  });
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { runMigration };
