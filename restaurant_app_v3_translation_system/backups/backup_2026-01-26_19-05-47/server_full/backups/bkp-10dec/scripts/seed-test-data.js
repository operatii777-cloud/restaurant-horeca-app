/**
 * Script pentru adăugare date de test:
 * - Unități de măsură
 * - Grupuri atribute
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'restaurant.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Eroare la deschiderea bazei de date:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectat la baza de date');
});

// Creează tabelele dacă nu există
function createTables() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabelă units_of_measure
      db.run(`CREATE TABLE IF NOT EXISTS units_of_measure (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL CHECK(category IN ('masa', 'volum', 'lungime', 'bucati', 'altul')),
        base_unit INTEGER,
        conversion_factor REAL DEFAULT 1.0,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (base_unit) REFERENCES units_of_measure(id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei units_of_measure:', err.message);
          reject(err);
        } else {
          console.log('✅ Tabelă units_of_measure verificată');
        }
      });

      // Tabelă attribute_groups
      db.run(`CREATE TABLE IF NOT EXISTS attribute_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK(type IN ('text', 'select', 'number', 'boolean', 'date')),
        description TEXT,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei attribute_groups:', err.message);
          reject(err);
        } else {
          console.log('✅ Tabelă attribute_groups verificată');
        }
      });

      // Tabelă attributes
      db.run(`CREATE TABLE IF NOT EXISTS attributes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        default_value TEXT,
        extra_price REAL DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES attribute_groups(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei attributes:', err.message);
          reject(err);
        } else {
          console.log('✅ Tabelă attributes verificată');
          resolve();
        }
      });
    });
  });
}

// Unități de măsură de test
const unitsOfMeasure = [
  // Masă
  { name: 'Gram', symbol: 'g', category: 'masa', base_unit: null, conversion_factor: 1.0, sort_order: 1 },
  { name: 'Kilogram', symbol: 'kg', category: 'masa', base_unit: null, conversion_factor: 1000.0, sort_order: 2 },
  { name: 'Tonă', symbol: 't', category: 'masa', base_unit: null, conversion_factor: 1000000.0, sort_order: 3 },
  { name: 'Uncie', symbol: 'oz', category: 'masa', base_unit: null, conversion_factor: 28.35, sort_order: 4 },
  
  // Volum
  { name: 'Mililitru', symbol: 'ml', category: 'volum', base_unit: null, conversion_factor: 1.0, sort_order: 1 },
  { name: 'Litru', symbol: 'L', category: 'volum', base_unit: null, conversion_factor: 1000.0, sort_order: 2 },
  { name: 'Decilitru', symbol: 'dl', category: 'volum', base_unit: null, conversion_factor: 100.0, sort_order: 3 },
  { name: 'Centilitru', symbol: 'cl', category: 'volum', base_unit: null, conversion_factor: 10.0, sort_order: 4 },
  
  // Lungime
  { name: 'Centimetru', symbol: 'cm', category: 'lungime', base_unit: null, conversion_factor: 1.0, sort_order: 1 },
  { name: 'Metru', symbol: 'm', category: 'lungime', base_unit: null, conversion_factor: 100.0, sort_order: 2 },
  
  // Bucăți
  { name: 'Bucată', symbol: 'buc', category: 'bucati', base_unit: null, conversion_factor: 1.0, sort_order: 1 },
  { name: 'Porție', symbol: 'porție', category: 'bucati', base_unit: null, conversion_factor: 1.0, sort_order: 2 },
  { name: 'Cutie', symbol: 'cutie', category: 'bucati', base_unit: null, conversion_factor: 1.0, sort_order: 3 },
  { name: 'Pachet', symbol: 'pachet', category: 'bucati', base_unit: null, conversion_factor: 1.0, sort_order: 4 },
];

// Grupuri atribute de test
const attributeGroups = [
  {
    name: 'Dimensiuni Pizza',
    type: 'select',
    description: 'Dimensiuni pentru pizza (M, L, XL)',
    sort_order: 1,
    attributes: [
      { name: 'M (30cm)', default_value: 'M', extra_price: 0, sort_order: 1 },
      { name: 'L (35cm)', default_value: 'L', extra_price: 5.00, sort_order: 2 },
      { name: 'XL (40cm)', default_value: 'XL', extra_price: 10.00, sort_order: 3 },
    ],
  },
  {
    name: 'Culori',
    type: 'select',
    description: 'Culori disponibile pentru produse',
    sort_order: 2,
    attributes: [
      { name: 'Roșu', default_value: 'Roșu', extra_price: 0, sort_order: 1 },
      { name: 'Verde', default_value: 'Verde', extra_price: 0, sort_order: 2 },
      { name: 'Albastru', default_value: 'Albastru', extra_price: 0, sort_order: 3 },
      { name: 'Negru', default_value: 'Negru', extra_price: 0, sort_order: 4 },
      { name: 'Alb', default_value: 'Alb', extra_price: 0, sort_order: 5 },
    ],
  },
  {
    name: 'Opțiuni Extra',
    type: 'select',
    description: 'Opțiuni suplimentare pentru produse',
    sort_order: 3,
    attributes: [
      { name: 'Extra Mozzarella', default_value: 'Extra Mozzarella', extra_price: 3.00, sort_order: 1 },
      { name: 'Extra Pepperoni', default_value: 'Extra Pepperoni', extra_price: 4.00, sort_order: 2 },
      { name: 'Fără Ceapă', default_value: 'Fără Ceapă', extra_price: 0, sort_order: 3 },
      { name: 'Fără Măsline', default_value: 'Fără Măsline', extra_price: 0, sort_order: 4 },
      { name: 'Picant', default_value: 'Picant', extra_price: 2.00, sort_order: 5 },
    ],
  },
  {
    name: 'Tip Coacere',
    type: 'select',
    description: 'Tipuri de coacere pentru pizza',
    sort_order: 4,
    attributes: [
      { name: 'Normală', default_value: 'Normală', extra_price: 0, sort_order: 1 },
      { name: 'Bine făcută', default_value: 'Bine făcută', extra_price: 0, sort_order: 2 },
      { name: 'Crocantă', default_value: 'Crocantă', extra_price: 1.00, sort_order: 3 },
    ],
  },
];

function insertUnit(db, unit) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO units_of_measure (name, symbol, category, base_unit, conversion_factor, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      [unit.name, unit.symbol, unit.category, unit.base_unit, unit.conversion_factor, unit.sort_order],
      function(err) {
        if (err) {
          console.error(`❌ Eroare la inserarea unității ${unit.name}:`, err.message);
          reject(err);
        } else {
          if (this.changes > 0) {
            console.log(`✅ Unitate adăugată: ${unit.name} (${unit.symbol})`);
          } else {
            console.log(`ℹ️  Unitate există deja: ${unit.name} (${unit.symbol})`);
          }
          resolve(this.lastID);
        }
      }
    );
  });
}

function insertAttributeGroup(db, group) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO attribute_groups (name, type, description, is_active, sort_order)
       VALUES (?, ?, ?, 1, ?)`,
      [group.name, group.type, group.description || null, group.sort_order],
      function(err) {
        if (err) {
          console.error(`❌ Eroare la inserarea grupului ${group.name}:`, err.message);
          reject(err);
        } else {
          if (this.changes > 0) {
            console.log(`✅ Grup adăugat: ${group.name}`);
            resolve(this.lastID);
          } else {
            // Găsește ID-ul grupului existent
            db.get(
              'SELECT id FROM attribute_groups WHERE name = ?',
              [group.name],
              (err, row) => {
                if (err) {
                  reject(err);
                } else {
                  console.log(`ℹ️  Grup există deja: ${group.name}`);
                  resolve(row ? row.id : null);
                }
              }
            );
          }
        }
      }
    );
  });
}

function insertAttribute(db, groupId, attribute) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO attributes (group_id, name, default_value, extra_price, is_active, sort_order)
       VALUES (?, ?, ?, ?, 1, ?)`,
      [
        groupId,
        attribute.name,
        attribute.default_value || null,
        attribute.extra_price || 0,
        attribute.sort_order,
      ],
      function(err) {
        if (err) {
          console.error(`❌ Eroare la inserarea atributului ${attribute.name}:`, err.message);
          reject(err);
        } else {
          if (this.changes > 0) {
            console.log(`  ✅ Atribut adăugat: ${attribute.name}`);
          } else {
            console.log(`  ℹ️  Atribut există deja: ${attribute.name}`);
          }
          resolve(this.lastID);
        }
      }
    );
  });
}

async function seedData() {
  console.log('\n🌱 Început adăugare date de test...\n');

  try {
    // Creează tabelele dacă nu există
    console.log('🔧 Verificare/Creare tabele...');
    await createTables();
    console.log('');

    // Adaugă unități de măsură
    console.log('📏 Adăugare unități de măsură...');
    for (const unit of unitsOfMeasure) {
      await insertUnit(db, unit);
    }

    // Adaugă grupuri atribute
    console.log('\n🏷️  Adăugare grupuri atribute...');
    for (const group of attributeGroups) {
      const groupId = await insertAttributeGroup(db, group);
      
      if (groupId && group.attributes) {
        for (const attribute of group.attributes) {
          await insertAttribute(db, groupId, attribute);
        }
      }
    }

    console.log('\n✅ Date de test adăugate cu succes!\n');
  } catch (error) {
    console.error('\n❌ Eroare la adăugarea datelor de test:', error);
    process.exit(1);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ Eroare la închiderea bazei de date:', err.message);
      } else {
        console.log('✅ Conexiunea la baza de date închisă');
      }
      process.exit(0);
    });
  }
}

// Rulează scriptul
seedData();

