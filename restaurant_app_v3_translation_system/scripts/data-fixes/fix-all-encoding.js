#!/usr/bin/env node

/**
 * 🔧 SCRIPT COMPLET REPARARE ENCODING - TOT PROIECTUL
 * 
 * Repară:
 * ✅ Toate fișierele .tsx/.ts/.jsx/.js din src/
 * ✅ Baza de date SQLite
 * ✅ Configurare backend
 * ✅ Configurare frontend
 * 
 * Rulează: node fix-all-encoding.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ============================================================================
// CONFIGURARE
// ============================================================================
const CONFIG = {
  // Directoare de scanat
  srcDir: 'server/admin-vite/src',
  backendDir: 'server', // sau 'backend', 'api', etc.
  
  // Extensii de fișiere
  fileExtensions: ['tsx', 'ts', 'jsx', 'js', 'json'],
  
  // Baza de date
  dbPath: 'server/database.db',
  dbTables: [
    { name: 'produse', textColumns: ['denumire', 'descriere', 'categorie'] },
    { name: 'meniuri', textColumns: ['denumire', 'descriere'] },
    { name: 'categorii', textColumns: ['denumire', 'descriere'] },
    { name: 'comenzi', textColumns: ['observatii', 'adresa_livrare'] },
  ],
  
  // Opțiuni
  createBackup: true,
  dryRun: false, // true = doar afișează ce s-ar schimba
};

// ============================================================================
// MAPARE COMPLETĂ SIMBOLURI → CARACTERE CORECTE
// ============================================================================
const ENCODING_MAP = [
  // ă minusculă
  ['Äƒ', 'ă'],
  ['Ä\u0083', 'ă'],
  ['Ã', 'ă'],
  ['ÄŸ', 'ă'],
  
  // Ă majusculă
  ['Ä‚', 'Ă'],
  ['Ă', 'Ă'],
  
  // â minusculă
  ['Ã¢', 'â'],
  ['Ã¢', 'â'],
  ['Ã‚', 'â'],
  
  // Â majusculă
  ['Ã‚', 'Â'],
  ['Â', 'Â'],
  
  // î minusculă
  ['Ã®', 'î'],
  ['Ã®', 'î'],
  ['ÃŽ', 'î'],
  
  // Î majusculă
  ['ÃŽ', 'Î'],
  ['Î', 'Î'],
  
  // ș minusculă
  ['È™', 'ș'],
  ['È™', 'ș'],
  ['Å¡', 'ș'],
  ['È™', 'ș'],
  
  // Ș majusculă
  ['È˜', 'Ș'],
  ['Å ', 'Ș'],
  ['È˜', 'Ș'],
  
  // ț minusculă
  ['È›', 'ț'],
  ['È›', 'ț'],
  ['Å£', 'ț'],
  ['È›', 'ț'],
  
  // Ț majusculă
  ['Èš', 'Ț'],
  ['Å¢', 'Ț'],
  ['Èš', 'Ț'],
  
  // Combinații duble (double encoding)
  ['Ã\u0083Â¢', 'â'],
  ['Ã\u0083Â®', 'î'],
  ['Ã\u0083Æ', 'ă'],
];

// ============================================================================
// FUNCȚII UTILITARE
// ============================================================================

/**
 * Verifică dacă textul conține simboluri corupte
 */
function hasCorruption(text) {
  if (!text || typeof text !== 'string') return false;
  
  return ENCODING_MAP.some(([corrupt]) => text.includes(corrupt));
}

/**
 * Curăță textul de simboluri corupte
 */
function cleanText(text) {
  if (!text || typeof text !== 'string') return text;
  
  let cleaned = text;
  
  for (const [corrupt, correct] of ENCODING_MAP) {
    if (cleaned.includes(corrupt)) {
      cleaned = cleaned.split(corrupt).join(correct);
    }
  }
  
  return cleaned;
}

/**
 * Găsește toate stringurile din cod (între ghilimele)
 */
function findStringsInCode(content) {
  const strings = [];
  
  // Regex pentru string-uri: 'text', "text", `text`
  const stringRegex = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let match;
  
  while ((match = stringRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const stringContent = match[2];
    
    if (hasCorruption(stringContent)) {
      strings.push({
        full: fullMatch,
        content: stringContent,
        cleaned: cleanText(stringContent),
        index: match.index
      });
    }
  }
  
  return strings;
}

// ============================================================================
// PROCESARE FIȘIERE SURSĂ
// ============================================================================

/**
 * Procesează un fișier sursă
 */
function processSourceFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    
    // Verifică dacă are corupții
    if (!hasCorruption(originalContent)) {
      return { success: false, skipped: true };
    }
    
    // Găsește toate string-urile corupte
    const corruptStrings = findStringsInCode(originalContent);
    
    if (corruptStrings.length === 0) {
      // Poate fi corupție în comentarii sau alte locuri
      const cleaned = cleanText(originalContent);
      if (cleaned === originalContent) {
        return { success: false, skipped: true };
      }
    }
    
    // Înlocuiește în ordine inversă pentru a păstra index-urile
    let modifiedContent = originalContent;
    const sortedStrings = [...corruptStrings].sort((a, b) => b.index - a.index);
    
    for (const str of sortedStrings) {
      const before = modifiedContent.substring(0, str.index);
      const after = modifiedContent.substring(str.index + str.full.length);
      
      // Păstrează tipul de ghilimele original
      const quote = str.full[0];
      const replacement = `${quote}${str.cleaned}${quote}`;
      
      modifiedContent = before + replacement + after;
    }
    
    // Curăță și restul conținutului (comentarii, etc.)
    modifiedContent = cleanText(modifiedContent);
    
    if (CONFIG.dryRun) {
      return {
        success: true,
        changes: corruptStrings.length,
        dryRun: true
      };
    }
    
    // Creează backup
    if (CONFIG.createBackup) {
      fs.writeFileSync(filePath + '.backup', originalContent, 'utf8');
    }
    
    // Salvează fișierul modificat
    fs.writeFileSync(filePath, modifiedContent, 'utf8');
    
    return {
      success: true,
      changes: corruptStrings.length
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// PROCESARE BAZĂ DE DATE
// ============================================================================

/**
 * Repară baza de date SQLite
 */
function fixDatabase() {
  console.log('\n📊 Procesare bază de date SQLite...\n');
  
  if (!fs.existsSync(CONFIG.dbPath)) {
    console.log('⚠️  Baza de date nu a fost găsită la:', CONFIG.dbPath);
    console.log('   Treci peste acest pas dacă nu folosești SQLite.\n');
    return { processed: 0, skipped: true };
  }
  
  try {
    const Database = require('better-sqlite3');
    
    // Creează backup
    if (CONFIG.createBackup) {
      const backupPath = CONFIG.dbPath + '.backup-' + Date.now();
      fs.copyFileSync(CONFIG.dbPath, backupPath);
      console.log(`💾 Backup DB creat: ${backupPath}\n`);
    }
    
    const db = new Database(CONFIG.dbPath);
    
    // Verifică encoding
    const encoding = db.pragma('encoding', { simple: true });
    console.log(`   Encoding curent: ${encoding}`);
    
    if (encoding !== 'UTF-8') {
      console.log('   ⚠️  ATENȚIE: Encoding-ul nu este UTF-8!');
      console.log('   Recomandare: Migrează datele într-o bază nouă cu UTF-8.\n');
    }
    
    let totalFixed = 0;
    
    for (const table of CONFIG.dbTables) {
      // Verifică dacă tabela există
      const exists = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
      ).get(table.name);
      
      if (!exists) {
        console.log(`   ⏭️  Tabelul "${table.name}" nu există`);
        continue;
      }
      
      const rows = db.prepare(`SELECT * FROM ${table.name}`).all();
      console.log(`   📋 ${table.name}: ${rows.length} rânduri`);
      
      let fixedInTable = 0;
      
      for (const row of rows) {
        const updates = {};
        let needsUpdate = false;
        
        for (const column of table.textColumns) {
          if (row[column] && hasCorruption(row[column])) {
            const cleaned = cleanText(row[column]);
            updates[column] = cleaned;
            needsUpdate = true;
          }
        }
        
        if (needsUpdate && !CONFIG.dryRun) {
          const setClause = Object.keys(updates).map(col => `${col} = ?`).join(', ');
          const values = [...Object.values(updates), row.id];
          db.prepare(`UPDATE ${table.name} SET ${setClause} WHERE id = ?`).run(...values);
          fixedInTable++;
        } else if (needsUpdate) {
          fixedInTable++;
        }
      }
      
      console.log(`   ✅ ${fixedInTable} rânduri ${CONFIG.dryRun ? 'de reparat' : 'reparate'}`);
      totalFixed += fixedInTable;
    }
    
    db.close();
    
    return { processed: totalFixed };
    
  } catch (error) {
    console.log(`   ❌ Eroare: ${error.message}\n`);
    return { processed: 0, error: error.message };
  }
}

// ============================================================================
// GENERARE FIȘIERE DE CONFIGURARE
// ============================================================================

/**
 * Generează fișier de configurare pentru backend
 */
function generateBackendConfig() {
  const content = `
// ============================================================================
// CONFIGURARE ENCODING UTF-8 PENTRU BACKEND
// Adaugă acest cod în fișierul principal al serverului (server.js, index.js, etc.)
// ============================================================================

const express = require('express');
const Database = require('better-sqlite3');

const app = express();

// 1. Conexiune SQLite cu UTF-8
const db = new Database('./database.db');
db.pragma('encoding = "UTF-8"');

// Verifică encoding-ul
console.log('📊 Database encoding:', db.pragma('encoding', { simple: true }));

// 2. Middleware pentru JSON cu UTF-8
app.use(express.json({ 
  type: 'application/json; charset=utf-8'
}));

// 3. Header UTF-8 pentru toate răspunsurile
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Export conexiunea pentru folosire în alte module
module.exports = { db, app };
`;
  
  if (!CONFIG.dryRun) {
    fs.writeFileSync('backend-utf8-config.js', content);
    console.log('📄 Generat: backend-utf8-config.js');
  }
}

/**
 * Generează fișier de configurare pentru frontend
 */
function generateFrontendConfig() {
  const content = `
// ============================================================================
// CONFIGURARE ENCODING UTF-8 PENTRU FRONTEND
// Salvează ca: src/services/api.js
// ============================================================================

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json; charset=UTF-8',
  },
  transformResponse: [(data) => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
    return data;
  }],
});

// Interceptor pentru logging (opțional)
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 API Response:', response.config.url, response.data);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error);
    return Promise.reject(error);
  }
);

export default api;

// ============================================================================
// FOLOSIRE ÎN COMPONENTE:
// ============================================================================
// import api from './services/api';
// 
// const { data } = await api.get('/comenzi');
// const { data } = await api.post('/produse', { denumire: 'Cafea' });
`;
  
  if (!CONFIG.dryRun) {
    fs.writeFileSync('frontend-utf8-config.js', content);
    console.log('📄 Generat: frontend-utf8-config.js');
  }
}

// ============================================================================
// MAIN
// ============================================================================

console.log('🚀 SCRIPT COMPLET REPARARE ENCODING - TOT PROIECTUL\n');
console.log('='.repeat(70));
console.log(`📁 Director sursă: ${CONFIG.srcDir}`);
console.log(`🗄️  Bază de date: ${CONFIG.dbPath}`);
console.log(`${CONFIG.dryRun ? '🔍 MOD DRY RUN - nu se modifică nimic' : '✏️  MOD ACTIV - se modifică fișierele'}`);
console.log('='.repeat(70) + '\n');

// PASUL 1: Scanează și repară fișierele sursă
console.log('📂 PASUL 1: Scanare fișiere sursă...\n');

const pattern = `${CONFIG.srcDir}/**/*.{${CONFIG.fileExtensions.join(',')}}`;
const files = glob.sync(pattern, {
  ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*']
});

console.log(`📄 Găsite ${files.length} fișiere de procesat\n`);

const stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  totalChanges: 0
};

files.forEach((file, index) => {
  process.stdout.write(`[${index + 1}/${files.length}] ${file.substring(0, 60).padEnd(60)} `);
  
  const result = processSourceFile(file);
  
  if (result.skipped) {
    console.log('✓');
    stats.skipped++;
  } else if (result.success) {
    console.log(`✅ ${result.changes} modificări`);
    stats.processed++;
    stats.totalChanges += result.changes;
  } else if (result.error) {
    console.log(`❌ ${result.error}`);
    stats.errors++;
  }
});

console.log('\n' + '='.repeat(70));
console.log('📊 STATISTICI FIȘIERE:');
console.log('='.repeat(70));
console.log(`✅ Fișiere ${CONFIG.dryRun ? 'de reparat' : 'reparate'}:  ${stats.processed}`);
console.log(`⏭️  Fișiere OK:        ${stats.skipped}`);
console.log(`❌ Erori:             ${stats.errors}`);
console.log(`🔧 Total modificări:  ${stats.totalChanges}`);
console.log('='.repeat(70) + '\n');

// PASUL 2: Repară baza de date
console.log('📊 PASUL 2: Reparare bază de date...\n');
const dbResult = fixDatabase();

// PASUL 3: Generează fișiere de configurare
console.log('\n📝 PASUL 3: Generare fișiere configurare...\n');
generateBackendConfig();
generateFrontendConfig();

// RAPORT FINAL
console.log('\n' + '='.repeat(70));
console.log('✅ PROCESARE COMPLETĂ!');
console.log('='.repeat(70));
console.log(`📂 Fișiere sursă procesate: ${stats.processed}`);
console.log(`📊 Rânduri DB reparate: ${dbResult.processed || 0}`);
console.log('='.repeat(70) + '\n');

if (!CONFIG.dryRun) {
  console.log('🎯 PAȘI URMĂTORI:\n');
  console.log('1. Integrează codul din backend-utf8-config.js în serverul tău');
  console.log('2. Copiază frontend-utf8-config.js ca src/services/api.js');
  console.log('3. Înlocuiește toate fetch/axios cu: import api from "./services/api"');
  console.log('4. Restart backend: npm run dev (sau pm2 restart)');
  console.log('5. Restart frontend: Ctrl + C și npm run dev');
  console.log('6. Testează în browser - verifică că nu mai apar simboluri');
  console.log('7. Dacă totul e OK, șterge backup-urile: find . -name "*.backup" -delete\n');
  
  if (CONFIG.createBackup) {
    console.log('💾 Backup-uri create - pentru restaurare:');
    console.log('   find src -name "*.backup" -exec sh -c \'mv "$1" "${1%.backup}"\' _ {} \\;\n');
  }
} else {
  console.log('🔍 Acesta a fost un DRY RUN!');
  console.log('   Pentru a aplica modificările: schimbă CONFIG.dryRun = false\n');
}

console.log('✨ Gata! Toate textele ar trebui să apară corect în română!');