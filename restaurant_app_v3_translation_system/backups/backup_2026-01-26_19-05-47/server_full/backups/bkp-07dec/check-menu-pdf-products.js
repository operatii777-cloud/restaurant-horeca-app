// Script pentru verificare structură menu_pdf_products
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'restaurant.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Eroare:', err.message);
    process.exit(1);
  }
  
  // Verifică structura tabelului
  db.all("PRAGMA table_info(menu_pdf_products)", (err, columns) => {
    if (err) {
      console.error('❌ Eroare:', err.message);
      db.close();
      return;
    }
    
    console.log('📋 Structura tabelului menu_pdf_products:');
    columns.forEach(col => {
      console.log(`   ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // Verifică foreign keys
    db.all("PRAGMA foreign_key_list(menu_pdf_products)", (err, fks) => {
      if (err) {
        console.error('❌ Eroare:', err.message);
      } else {
        console.log('\n🔗 Foreign Keys:');
        if (fks.length === 0) {
          console.log('   Nu există foreign keys definite');
        } else {
          fks.forEach(fk => {
            console.log(`   ${fk.from} -> ${fk.table}.${fk.to}`);
          });
        }
      }
      
      // Verifică datele
      db.all("SELECT * FROM menu_pdf_products LIMIT 5", (err, rows) => {
        if (err) {
          console.error('❌ Eroare:', err.message);
        } else {
          console.log('\n📊 Date (primele 5):');
          rows.forEach(row => {
            console.log('   ', row);
          });
        }
        
        db.close();
      });
    });
  });
});

