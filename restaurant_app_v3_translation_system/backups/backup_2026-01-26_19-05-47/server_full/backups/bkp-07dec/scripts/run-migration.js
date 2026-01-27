/**
 * RUN MIGRATION - Rulează migrări SQL
 * Data: 03 Decembrie 2025
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../restaurant.db');

async function runMigration(sqlFile) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    
    console.log(`📄 Running migration: ${sqlFile}`);
    
    // Citește fișierul SQL
    const sqlPath = path.join(__dirname, '../migrations', sqlFile);
    
    if (!fs.existsSync(sqlPath)) {
      return reject(new Error(`Migration file not found: ${sqlPath}`));
    }
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolon și rulează fiecare statement
    const statements = sql.split(';').filter(s => s.trim());
    
    let completed = 0;
    let total = statements.length;
    
    const runNext = (index) => {
      if (index >= statements.length) {
        console.log(`✅ Migration completed: ${completed}/${total} statements\n`);
        db.close();
        return resolve({ completed, total });
      }
      
      const statement = statements[index].trim();
      
      if (!statement || statement.startsWith('--')) {
        return runNext(index + 1);
      }
      
      db.run(statement, [], (err) => {
        if (err) {
          // Ignoră erori pentru "table already exists"
          if (err.message.includes('already exists')) {
            console.log(`⚠️  Table already exists (skipped)`);
            return runNext(index + 1);
          }
          
          console.error(`❌ Error in statement ${index + 1}:`, err.message);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
          return reject(err);
        }
        
        completed++;
        runNext(index + 1);
      });
    };
    
    runNext(0);
  });
}

// RUN
if (require.main === module) {
  const migrationFile = process.argv[2] || '010_ingredient_catalog_global.sql';
  
  console.log('🚀 DATABASE MIGRATION');
  console.log('====================\n');
  
  runMigration(migrationFile)
    .then(result => {
      console.log(`🎉 Migration successful: ${result.completed}/${result.total} statements executed!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runMigration };

