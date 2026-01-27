/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TIPIZATE ANAF COMPLIANT - Migration Complete
 * Conform OMFP 2634/2015 și specificațiilor enterprise-grade
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Documente implementate:
 * 1. Aviz de însoțire a mărfii (Cod ANAF 14-3-6A) - Tipizat oficial
 * 2. Bon de consum (Cod ANAF 14-3-4A) - Tipizat oficial
 * 3. Proces-verbal de scoatere din gestiune - Document intern
 * 4. Bon pierderi / rebuturi / casare - Document auxiliar
 * 5. Fișă de magazie (Cod ANAF 14-3-8) - Tipizat oficial
 */

const { dbPromise } = require('../../../../database');

async function runAnafCompliantTipizateMigration(db) {
  console.log('🔄 [ANAF Tipizate] Starting ANAF-compliant migrations...');
  
  try {
    // 1. Aviz de însoțire a mărfii (Cod ANAF 14-3-6A)
    await createAvizeInsotireTables(db);
    
    // 2. Bon de consum (Cod ANAF 14-3-4A) - Actualizare tabel existent
    await updateBonuriConsumTables(db);
    
    // 3. Proces-verbal de scoatere din gestiune
    await createProceseVerbaleTables(db);
    
    // 4. Bon pierderi / rebuturi / casare
    await createBonuriPierderiTables(db);
    
    // 5. Fișă de magazie (Cod ANAF 14-3-8)
    await createFiseMagazieTables(db);
    
    // 6. Note contabile automate
    await createNoteContabileTables(db);
    
    // 7. Jurnal tipizate (pentru audit ANAF)
    await createJurnalTipizateTable(db);
    
    console.log('✅ [ANAF Tipizate] All migrations completed successfully!');
  } catch (error) {
    console.error('❌ [ANAF Tipizate] Migration error:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. AVIZ DE ÎNSOȚIRE A MĂRFII (Cod ANAF 14-3-6A)
// ═══════════════════════════════════════════════════════════════════════════

async function createAvizeInsotireTables(db) {
  return new Promise((resolve, reject) => {
    // Tabel principal - actualizare delivery_notes existent sau creare nou
    db.run(`
      CREATE TABLE IF NOT EXISTS avize_insotire (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        serie TEXT NOT NULL DEFAULT 'AVZ',
        numar TEXT NOT NULL,
        data_emitere DATE NOT NULL,
        
        -- Expeditor
        expeditor_id INTEGER,
        expeditor_denumire TEXT NOT NULL,
        expeditor_cif TEXT,
        expeditor_adresa TEXT,
        
        -- Destinatar/Primitor
        destinatar_id INTEGER,
        destinatar_denumire TEXT NOT NULL,
        destinatar_cif TEXT,
        destinatar_adresa TEXT,
        
        -- Transport
        delegat_nume TEXT,
        delegat_ci TEXT,
        mijloc_transport TEXT,
        ora_plecare TEXT,
        
        -- Mențiuni
        tip_operatiune TEXT DEFAULT 'fara_factura' CHECK(tip_operatiune IN ('fara_factura', 'transfer', 'retur', 'prelucrare')),
        observatii TEXT,
        
        -- Status și audit
        status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'emis', 'anulat')),
        signed_by_expeditor INTEGER DEFAULT 0,
        signed_by_primitor INTEGER DEFAULT 0,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(serie, numar)
      )
    `, (err) => {
      if (err && !err.message.includes('already exists')) {
        console.error('❌ Error creating avize_insotire:', err);
        reject(err);
        return;
      }
      console.log('  ✓ Created/Updated avize_insotire table');
      
      // Tabel linii aviz
      db.run(`
        CREATE TABLE IF NOT EXISTS avize_insotire_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          aviz_id INTEGER NOT NULL,
          product_id INTEGER,
          denumire TEXT NOT NULL,
          um TEXT DEFAULT 'buc',
          cantitate REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (aviz_id) REFERENCES avize_insotire(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('❌ Error creating avize_insotire_items:', err);
          reject(err);
          return;
        }
        console.log('  ✓ Created avize_insotire_items table');
        resolve();
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. BON DE CONSUM (Cod ANAF 14-3-4A) - Actualizare
// ═══════════════════════════════════════════════════════════════════════════

async function updateBonuriConsumTables(db) {
  return new Promise((resolve) => {
    // Verifică dacă tabelul există și adaugă coloane lipsă
    const columnsToAdd = [
      { name: 'scop_consum', type: 'TEXT', default: "'productie'" },
      { name: 'departament', type: 'TEXT' },
      { name: 'emis_de', type: 'INTEGER' },
      { name: 'aprobat_de', type: 'INTEGER' },
      { name: 'aprobat_at', type: 'DATETIME' }
    ];
    
    let completed = 0;
    columnsToAdd.forEach(col => {
      db.run(`
        ALTER TABLE consumption_vouchers 
        ADD COLUMN ${col.name} ${col.type}${col.default ? ` DEFAULT ${col.default}` : ''}
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.warn(`⚠️ Could not add column ${col.name}:`, err.message);
        }
        completed++;
        if (completed === columnsToAdd.length) {
          console.log('  ✓ Updated bonuri_consum table');
          resolve();
        }
      });
    });
    
    if (columnsToAdd.length === 0) resolve();
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. PROCES-VERBAL DE SCOATERE DIN GESTIUNE
// ═══════════════════════════════════════════════════════════════════════════

async function createProceseVerbaleTables(db) {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS procese_verbale_scoatere (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        numar TEXT NOT NULL,
        data DATE NOT NULL,
        
        -- Comisie
        membru1_nume TEXT,
        membru1_functie TEXT,
        membru2_nume TEXT,
        membru2_functie TEXT,
        membru3_nume TEXT,
        membru3_functie TEXT,
        
        -- Motiv
        tip TEXT NOT NULL CHECK(tip IN ('pierdere', 'deteriorare', 'expirare', 'furt', 'inventar')),
        descriere TEXT,
        
        -- Decizie
        masura TEXT NOT NULL CHECK(masura IN ('casare', 'distrugere', 'donatie', 'ajustare_stoc')),
        
        -- Ajustare TVA
        afecta_tva INTEGER DEFAULT 0,
        ajustare_tva REAL DEFAULT 0,
        
        -- Audit
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(company_id, numar, data)
      )
    `, (err) => {
      if (err && !err.message.includes('already exists')) {
        console.error('❌ Error creating procese_verbale_scoatere:', err);
        reject(err);
        return;
      }
      console.log('  ✓ Created procese_verbale_scoatere table');
      
      db.run(`
        CREATE TABLE IF NOT EXISTS procese_verbale_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          proces_verbal_id INTEGER NOT NULL,
          product_id INTEGER,
          denumire TEXT NOT NULL,
          um TEXT DEFAULT 'buc',
          cantitate REAL NOT NULL,
          valoare REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (proces_verbal_id) REFERENCES procese_verbale_scoatere(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('❌ Error creating procese_verbale_items:', err);
          reject(err);
          return;
        }
        console.log('  ✓ Created procese_verbale_items table');
        resolve();
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. BON PIERDERI / REBUTURI / CASARE
// ═══════════════════════════════════════════════════════════════════════════

async function createBonuriPierderiTables(db) {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS bonuri_pierderi (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        serie TEXT NOT NULL DEFAULT 'BP',
        numar TEXT NOT NULL,
        data DATE NOT NULL,
        gestiune_id INTEGER,
        
        -- Legătură cu proces-verbal
        proces_verbal_id INTEGER,
        
        -- Audit
        emis_de INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (proces_verbal_id) REFERENCES procese_verbale_scoatere(id),
        UNIQUE(serie, numar)
      )
    `, (err) => {
      if (err && !err.message.includes('already exists')) {
        console.error('❌ Error creating bonuri_pierderi:', err);
        reject(err);
        return;
      }
      console.log('  ✓ Created bonuri_pierderi table');
      
      db.run(`
        CREATE TABLE IF NOT EXISTS bonuri_pierderi_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bon_pierderi_id INTEGER NOT NULL,
          product_id INTEGER,
          denumire TEXT NOT NULL,
          um TEXT DEFAULT 'buc',
          cantitate REAL NOT NULL,
          motiv TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (bon_pierderi_id) REFERENCES bonuri_pierderi(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('❌ Error creating bonuri_pierderi_items:', err);
          reject(err);
          return;
        }
        console.log('  ✓ Created bonuri_pierderi_items table');
        resolve();
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. FIȘĂ DE MAGAZIE (Cod ANAF 14-3-8)
// ═══════════════════════════════════════════════════════════════════════════

async function createFiseMagazieTables(db) {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS fise_magazie (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        gestiune_id INTEGER,
        produs_id INTEGER,
        perioada_start DATE NOT NULL,
        perioada_end DATE NOT NULL,
        
        -- Solduri inițiale
        sold_initial_cantitate REAL DEFAULT 0,
        sold_initial_valoare REAL DEFAULT 0,
        
        -- Solduri finale
        sold_final_cantitate REAL DEFAULT 0,
        sold_final_valoare REAL DEFAULT 0,
        
        -- Audit
        generat_la DATETIME DEFAULT CURRENT_TIMESTAMP,
        generat_de INTEGER,
        
        UNIQUE(company_id, gestiune_id, produs_id, perioada_start, perioada_end)
      )
    `, (err) => {
      if (err && !err.message.includes('already exists')) {
        console.error('❌ Error creating fise_magazie:', err);
        reject(err);
        return;
      }
      console.log('  ✓ Created fise_magazie table');
      
      db.run(`
        CREATE TABLE IF NOT EXISTS fise_magazie_lines (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fisa_id INTEGER NOT NULL,
          data DATE NOT NULL,
          tip_document TEXT NOT NULL,
          document_ref TEXT,
          intrare_cantitate REAL DEFAULT 0,
          intrare_valoare REAL DEFAULT 0,
          iesire_cantitate REAL DEFAULT 0,
          iesire_valoare REAL DEFAULT 0,
          sold_cantitate REAL DEFAULT 0,
          sold_valoare REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (fisa_id) REFERENCES fise_magazie(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('❌ Error creating fise_magazie_lines:', err);
          reject(err);
          return;
        }
        console.log('  ✓ Created fise_magazie_lines table');
        resolve();
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. NOTE CONTABILE AUTOMATE
// ═══════════════════════════════════════════════════════════════════════════

async function createNoteContabileTables(db) {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS note_contabile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        data DATE NOT NULL,
        tip TEXT NOT NULL CHECK(tip IN ('371_601', '371_607', '371_658', 'ajustare_tva')),
        
        -- Document sursă
        document_type TEXT NOT NULL,
        document_id INTEGER NOT NULL,
        document_serie TEXT,
        document_numar TEXT,
        
        -- Conturi
        cont_debitor TEXT NOT NULL,
        cont_creditor TEXT NOT NULL,
        suma REAL NOT NULL,
        
        -- Descriere
        descriere TEXT,
        
        -- Reversare
        storno INTEGER DEFAULT 0,
        storno_of_id INTEGER,
        
        -- Audit
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER
      )
    `, (err) => {
      if (err && !err.message.includes('already exists')) {
        console.error('❌ Error creating note_contabile:', err);
        reject(err);
        return;
      }
      console.log('  ✓ Created note_contabile table');
      resolve();
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. JURNAL TIPIZATE (pentru audit ANAF)
// ═══════════════════════════════════════════════════════════════════════════

async function createJurnalTipizateTable(db) {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS jurnal_tipizate (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        document_type TEXT NOT NULL,
        document_id INTEGER NOT NULL,
        serie TEXT NOT NULL,
        numar TEXT NOT NULL,
        data DATE NOT NULL,
        operatiune TEXT NOT NULL CHECK(operatiune IN ('creare', 'emitere', 'storno', 'anulare')),
        user_id INTEGER,
        user_name TEXT,
        ip_address TEXT,
        user_agent TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err && !err.message.includes('already exists')) {
        console.error('❌ Error creating jurnal_tipizate:', err);
        reject(err);
        return;
      }
      console.log('  ✓ Created jurnal_tipizate table');
      
      // Index pentru performanță
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_jurnal_tipizate_doc 
        ON jurnal_tipizate(document_type, document_id)
      `, () => {
        db.run(`
          CREATE INDEX IF NOT EXISTS idx_jurnal_tipizate_serie_numar 
          ON jurnal_tipizate(serie, numar)
        `, () => {
          console.log('  ✓ Created indexes for jurnal_tipizate');
          resolve();
        });
      });
    });
  });
}

module.exports = { runAnafCompliantTipizateMigration };
