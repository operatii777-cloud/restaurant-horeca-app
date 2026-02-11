/**
 * Script pentru inserare date test HACCP în baza de date
 */

const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../../config/db-constants');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Eroare la conectarea la baza de date:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectat la baza de date');
});

db.serialize(() => {
  // 1. Procese HACCP
  console.log('\n📋 Inserare procese HACCP...');
  db.run(`INSERT OR IGNORE INTO haccp_processes (id, name, description, category) VALUES (1, 'Recepție Mărfuri', 'Verificarea temperaturii și calității la primirea mărfurilor', 'receiving')`, (err) => {
    if (err) console.error('  ❌ Proces 1:', err.message);
    else console.log('  ✅ Proces 1 inserat');
  });
  
  db.run(`INSERT OR IGNORE INTO haccp_processes (id, name, description, category) VALUES (2, 'Stocare Rece', 'Menținerea temperaturii optime în frigider/congelator', 'storage')`, (err) => {
    if (err) console.error('  ❌ Proces 2:', err.message);
    else console.log('  ✅ Proces 2 inserat');
  });
  
  db.run(`INSERT OR IGNORE INTO haccp_processes (id, name, description, category) VALUES (3, 'Gătire', 'Asigurarea temperaturii interne corecte la gătit', 'cooking')`, (err) => {
    if (err) console.error('  ❌ Proces 3:', err.message);
    else console.log('  ✅ Proces 3 inserat');
  });

  // 2. CCP-uri
  console.log('\n🎯 Inserare CCP-uri...');
  db.run(`INSERT OR IGNORE INTO haccp_ccp (id, process_id, ccp_number, hazard_type, hazard_description, control_measure) VALUES (1, 1, 'CCP-1', 'biological', 'Contaminare bacteriană prin temperatură incorectă transport', 'Verificare temperatură la recepție - reject dacă > 4°C pentru produse refrigerate')`, (err) => {
    if (err) console.error('  ❌ CCP-1:', err.message);
    else console.log('  ✅ CCP-1 inserat');
  });
  
  db.run(`INSERT OR IGNORE INTO haccp_ccp (id, process_id, ccp_number, hazard_type, hazard_description, control_measure) VALUES (2, 2, 'CCP-2', 'biological', 'Multiplicare bacteriană prin stocare incorectă', 'Menținere temperatură frigider între 0-4°C')`, (err) => {
    if (err) console.error('  ❌ CCP-2:', err.message);
    else console.log('  ✅ CCP-2 inserat');
  });
  
  db.run(`INSERT OR IGNORE INTO haccp_ccp (id, process_id, ccp_number, hazard_type, hazard_description, control_measure) VALUES (3, 3, 'CCP-3', 'biological', 'Supraviețuire bacterii patogene (E.coli, Salmonella)', 'Temperatură internă minimum 75°C pentru carne')`, (err) => {
    if (err) console.error('  ❌ CCP-3:', err.message);
    else console.log('  ✅ CCP-3 inserat');
  });

  // 3. Limite
  console.log('\n📏 Inserare limite...');
  db.run(`INSERT OR IGNORE INTO haccp_limits (id, ccp_id, parameter_name, min_value, max_value, unit, target_value, monitoring_frequency) VALUES (1, 1, 'temperature', -2, 4, '°C', 2, 'every_batch')`, (err) => {
    if (err) console.error('  ❌ Limită CCP-1:', err.message);
    else console.log('  ✅ Limită CCP-1 inserată');
  });
  
  db.run(`INSERT OR IGNORE INTO haccp_limits (id, ccp_id, parameter_name, min_value, max_value, unit, target_value, monitoring_frequency) VALUES (2, 2, 'temperature', 0, 4, '°C', 2, 'hourly')`, (err) => {
    if (err) console.error('  ❌ Limită CCP-2:', err.message);
    else console.log('  ✅ Limită CCP-2 inserată');
  });
  
  db.run(`INSERT OR IGNORE INTO haccp_limits (id, ccp_id, parameter_name, min_value, max_value, unit, target_value, monitoring_frequency) VALUES (3, 3, 'temperature', 75, 95, '°C', 80, 'every_batch')`, (err) => {
    if (err) {
      console.error('  ❌ Limită CCP-3:', err.message);
      db.close();
    } else {
      console.log('  ✅ Limită CCP-3 inserată');
      console.log('\n✅ TOATE DATELE AU FOST INSERATE CU SUCCES!\n');
      db.close();
    }
  });
});

