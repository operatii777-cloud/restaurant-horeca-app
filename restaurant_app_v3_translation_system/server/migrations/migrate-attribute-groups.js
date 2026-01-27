/**
 * Migrare pentru adăugarea coloanelor noi la attribute_groups
 * Model boogiT: titlu, minim, maxim
 */

const { dbPromise } = require('../database');

async function migrate() {
  const db = await dbPromise;
  
  console.log('🔧 Migrare attribute_groups...');
  
  // Verifică coloanele existente
  const columns = await new Promise((resolve, reject) => {
    db.all('PRAGMA table_info(attribute_groups)', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  const colNames = columns.map(c => c.name);
  console.log('📋 Coloane existente:', colNames.join(', '));
  
  // Coloane de adăugat
  const newCols = [
    { name: 'titlu', sql: 'ALTER TABLE attribute_groups ADD COLUMN titlu TEXT' },
    { name: 'minim', sql: 'ALTER TABLE attribute_groups ADD COLUMN minim INTEGER DEFAULT 0' },
    { name: 'maxim', sql: 'ALTER TABLE attribute_groups ADD COLUMN maxim INTEGER DEFAULT 1' },
    { name: 'updated_at', sql: 'ALTER TABLE attribute_groups ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP' }
  ];
  
  for (const col of newCols) {
    if (!colNames.includes(col.name)) {
      console.log(`➕ Adaug coloana: ${col.name}`);
      await new Promise((resolve) => {
        db.run(col.sql, (err) => {
          if (err) console.error(`❌ Eroare la ${col.name}:`, err.message);
          else console.log(`✅ Coloana ${col.name} adăugată`);
          resolve();
        });
      });
    } else {
      console.log(`✓ Coloana ${col.name} există deja`);
    }
  }
  
  // Actualizează titlu cu name pentru grupurile existente
  console.log('🔄 Actualizez titlu pentru grupurile existente...');
  await new Promise((resolve) => {
    db.run('UPDATE attribute_groups SET titlu = name WHERE titlu IS NULL', function(err) {
      if (err) console.error('❌ Eroare update titlu:', err.message);
      else console.log(`✅ Actualizate ${this.changes} rânduri`);
      resolve();
    });
  });
  
  // Verifică coloanele pentru attributes
  console.log('\n🔧 Verificare tabel attributes...');
  const attrColumns = await new Promise((resolve, reject) => {
    db.all('PRAGMA table_info(attributes)', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  const attrColNames = attrColumns.map(c => c.name);
  console.log('📋 Coloane attributes:', attrColNames.join(', '));
  
  // Coloane pentru attributes (model boogiT)
  const attrNewCols = [
    { name: 'product_id', sql: 'ALTER TABLE attributes ADD COLUMN product_id INTEGER' },
    { name: 'product_name', sql: 'ALTER TABLE attributes ADD COLUMN product_name TEXT' },
    { name: 'disponibilitate', sql: 'ALTER TABLE attributes ADD COLUMN disponibilitate INTEGER DEFAULT 1' },
    { name: 'pret1', sql: 'ALTER TABLE attributes ADD COLUMN pret1 REAL DEFAULT 0' },
    { name: 'pret2', sql: 'ALTER TABLE attributes ADD COLUMN pret2 REAL DEFAULT 0' },
    { name: 'pret3', sql: 'ALTER TABLE attributes ADD COLUMN pret3 REAL DEFAULT 0' },
    { name: 'pret4', sql: 'ALTER TABLE attributes ADD COLUMN pret4 REAL DEFAULT 0' }
  ];
  
  for (const col of attrNewCols) {
    if (!attrColNames.includes(col.name)) {
      console.log(`➕ Adaug coloana: ${col.name}`);
      await new Promise((resolve) => {
        db.run(col.sql, (err) => {
          if (err) console.error(`❌ Eroare la ${col.name}:`, err.message);
          else console.log(`✅ Coloana ${col.name} adăugată`);
          resolve();
        });
      });
    } else {
      console.log(`✓ Coloana ${col.name} există deja`);
    }
  }
  
  // Creează tabel product_attribute_groups dacă nu există
  console.log('\n🔧 Verificare tabel product_attribute_groups...');
  await new Promise((resolve) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS product_attribute_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        group_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES menu(id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES attribute_groups(id) ON DELETE CASCADE,
        UNIQUE(product_id, group_id)
      )
    `, (err) => {
      if (err) console.error('❌ Eroare creare tabel:', err.message);
      else console.log('✅ Tabel product_attribute_groups verificat/creat');
      resolve();
    });
  });
  
  console.log('\n✅ Migrare completă!');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Eroare migrare:', err);
    process.exit(1);
  });

