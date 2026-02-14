#!/usr/bin/env node

/**
 * 🔧 Script ÎMBUNĂTĂȚIT pentru repararea erorilor "t is not defined"
 * 
 * VERSIUNE 2.0 - Cu regex precis și fără false positives
 * 
 * Rulează în VS Code Terminal:
 * 1. Salvează acest fișier ca: fix-translations-v2.js
 * 2. npm install glob (dacă nu ai deja)
 * 3. node fix-translations-v2.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configurare
const CONFIG = {
  mode: 'remove-translations', // sau 'add-hooks'
  srcDir: 'server/admin-vite/src',
  filePattern: '**/*.{tsx,ts}',
  excludePatterns: ['**/*.test.ts', '**/*.test.tsx', '**/node_modules/**'],
  createBackup: true,
  dryRun: false, // Setează true pentru a vedea ce s-ar schimba fără a modifica fișierele
};

// Mapare traduceri comune în română
const TRANSLATION_MAP = {
  // Help/Ajutor
  "help": "Ajutor",
  "help.button": "Ajutor",
  "help.title": "Ghid de Ajutor",
  
  // Alerts/Alerte
  "alerts.title": "Alerte",
  "alerts.noAlerts": "Nu există alerte",
  "alerts.critical": "Critic",
  "alerts.warning": "Avertisment",
  "alerts.info": "Informare",
  "alerts.success": "Succes",
  
  // Common actions
  "common.save": "Salvează",
  "common.cancel": "Anulează",
  "common.delete": "Șterge",
  "common.edit": "Editează",
  "common.add": "Adaugă",
  "common.close": "Închide",
  "common.confirm": "Confirmă",
  "common.yes": "Da",
  "common.no": "Nu",
  "common.loading": "Se încarcă...",
  "common.search": "Caută",
  "common.filter": "Filtrează",
  "common.export": "Exportă",
  "common.import": "Importă",
  "common.print": "Printează",
  
  // Buttons
  "button.save": "Salvează",
  "button.cancel": "Anulează",
  "button.submit": "Trimite",
  "button.back": "Înapoi",
  "button.next": "Următorul",
  
  // Messages
  "message.success": "Operațiune reușită",
  "message.error": "A apărut o eroare",
  "message.loading": "Se încarcă...",
  "message.saved": "Salvat cu succes",
  "message.deleted": "Șters cu succes",
};

/**
 * REGEX PRECIS - evită false positives!
 * Detectează DOAR apeluri de forma: t('key') sau t("key")
 * NU detectează: alert(), prompt(), split(), etc.
 */
const T_CALL_REGEX = /\bt\s*\(\s*(['"`])([^'"`]+)\1\s*\)/g;

// Verifică dacă un caracter este parte dintr-un identificator (literă, cifră, _)
function isIdentifierChar(char) {
  return /[a-zA-Z0-9_]/.test(char);
}

// Verifică dacă fișierul folosește 't(' ca funcție de traducere
function needsFix(content) {
  // Verifică dacă există apeluri t() 
  const hasT = T_CALL_REGEX.test(content);
  
  if (!hasT) return false;
  
  // Verifică dacă are hook sau import pentru traduceri
  const hasHook = /const\s*{\s*t\s*}\s*=\s*useTranslation\(\)/.test(content);
  const hasImport = /useTranslation.*from\s*['"]react-i18next['"]/.test(content);
  
  // Needs fix dacă folosește t() dar nu are hook/import
  return hasT && (!hasHook || !hasImport);
}

// Găsește toate utilizările VALIDE ale lui t() în fișier
function findAllTCalls(content) {
  const matches = [];
  let match;
  
  // Reset regex
  T_CALL_REGEX.lastIndex = 0;
  
  while ((match = T_CALL_REGEX.exec(content)) !== null) {
    const beforeChar = match.index > 0 ? content[match.index - 1] : ' ';
    
    // Verifică că înainte de 't' nu e un caracter de identificator
    // Asta previne false positives precum: alert(), prompt(), etc.
    if (!isIdentifierChar(beforeChar)) {
      matches.push({
        full: match[0],
        key: match[2],
        quote: match[1],
        index: match.index
      });
    }
  }
  
  return matches;
}

// Opțiunea 1: Adaugă hook-uri useTranslation
function addTranslationHooks(content, filePath) {
  let modified = content;
  let changes = [];
  
  // 1. Adaugă import dacă lipsește
  if (!/import.*useTranslation.*from\s*['"]react-i18next['"]/.test(modified)) {
    const lines = modified.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, "import { useTranslation } from 'react-i18next';");
      modified = lines.join('\n');
      changes.push('Adăugat import useTranslation');
    }
  }
  
  // 2. Adaugă hook dacă lipsește
  if (!/const\s*{\s*t\s*}\s*=\s*useTranslation\(\)/.test(modified)) {
    const patterns = [
      /(export\s+(?:default\s+)?function\s+\w+[^{]*{)/,
      /((?:export\s+)?(?:const|let)\s+\w+\s*[:=]\s*\([^)]*\)\s*=>\s*{)/,
    ];
    
    for (const pattern of patterns) {
      const match = modified.match(pattern);
      if (match) {
        const insertPos = match.index + match[0].length;
        const before = modified.substring(0, insertPos);
        const after = modified.substring(insertPos);
        
        modified = before + '\n  const { t } = useTranslation();' + after;
        changes.push('Adăugat hook useTranslation()');
        break;
      }
    }
  }
  
  return { content: modified, changes };
}

// Opțiunea 2: Înlocuiește traducerile cu text direct
function removeTranslations(content, filePath) {
  let modified = content;
  let changes = [];
  
  // Găsește toate apelurile VALIDE t()
  const tCalls = findAllTCalls(content);
  
  if (tCalls.length === 0) {
    return { content: modified, changes: [] };
  }
  
  console.log(`\n    Găsite ${tCalls.length} apeluri valide t() în ${path.basename(filePath)}`);
  
  // Înlocuiește în ordine inversă pentru a păstra index-urile corecte
  const sortedCalls = [...tCalls].sort((a, b) => b.index - a.index);
  
  for (const call of sortedCalls) {
    const key = call.key;
    let replacement;
    
    if (TRANSLATION_MAP[key]) {
      replacement = `'${TRANSLATION_MAP[key]}'`;
      changes.push(`✓ ${call.full} → ${replacement}`);
    } else {
      replacement = `'[${key}]'`;
      changes.push(`⚠ ${call.full} → ${replacement} (necunoscut)`);
    }
    
    // Înlocuiește EXACT apelul găsit, fără regex global
    const before = modified.substring(0, call.index);
    const after = modified.substring(call.index + call.full.length);
    modified = before + replacement + after;
  }
  
  // Elimină importul react-i18next dacă nu mai e folosit
  if (!/\bt\s*\(/.test(modified) && /import.*useTranslation.*from\s*['"]react-i18next['"]/.test(modified)) {
    modified = modified.replace(/import\s*{\s*useTranslation\s*}\s*from\s*['"]react-i18next['"];?\n?/g, '');
    modified = modified.replace(/const\s*{\s*t\s*}\s*=\s*useTranslation\(\);?\n?/g, '');
    changes.push('Eliminat import și hook useTranslation (nefolosit)');
  }
  
  return { content: modified, changes };
}

// Procesează un singur fișier
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (!needsFix(content)) {
      return { success: false, skipped: true };
    }
    
    const result = CONFIG.mode === 'add-hooks' 
      ? addTranslationHooks(content, filePath)
      : removeTranslations(content, filePath);
    
    if (result.changes.length === 0) {
      return { success: false, skipped: true };
    }
    
    if (CONFIG.dryRun) {
      console.log(`\n[DRY RUN] ${filePath}`);
      result.changes.forEach(change => console.log(`    ${change}`));
      return { success: true, changes: result.changes, skipped: false, dryRun: true };
    }
    
    // Creează backup
    if (CONFIG.createBackup) {
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, content, 'utf8');
    }
    
    // Salvează fișierul modificat
    fs.writeFileSync(filePath, result.content, 'utf8');
    
    return { success: true, changes: result.changes, skipped: false };
    
  } catch (error) {
    return { success: false, error: error.message, skipped: false };
  }
}

// MAIN
console.log('🚀 Script automat de reparare erori traduceri v2.0\n');
console.log(`📁 Căutare fișiere în: ${CONFIG.srcDir}`);
console.log(`🔧 Mod: ${CONFIG.mode === 'add-hooks' ? 'Adăugare hook-uri' : 'Înlocuire cu text românesc'}`);
console.log(`${CONFIG.dryRun ? '🔍 DRY RUN - nu se modifică fișiere' : '✏️  Modificare activă'}\n`);

// Găsește toate fișierele .tsx și .ts
const files = glob.sync(`${CONFIG.srcDir}/${CONFIG.filePattern}`, {
  ignore: CONFIG.excludePatterns
});

console.log(`📄 Găsite ${files.length} fișiere de procesat\n`);

let stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  totalChanges: 0
};

// Procesează fiecare fișier
files.forEach((file, index) => {
  process.stdout.write(`[${index + 1}/${files.length}] ${file} ... `);
  
  const result = processFile(file);
  
  if (result.skipped) {
    console.log('⏭️  OK');
    stats.skipped++;
  } else if (result.success) {
    console.log(result.dryRun ? '🔍 Would fix' : '✅ Fixed!');
    if (result.changes.length <= 3) {
      result.changes.forEach(change => console.log(`    ${change}`));
    } else {
      console.log(`    ${result.changes.length} modificări`);
    }
    stats.processed++;
    stats.totalChanges += result.changes.length;
  } else if (result.error) {
    console.log(`❌ Error: ${result.error}`);
    stats.errors++;
  }
});

// Raport final
console.log('\n' + '='.repeat(70));
console.log('📊 RAPORT FINAL:');
console.log('='.repeat(70));
console.log(`✅ Fișiere ${CONFIG.dryRun ? 'de reparat' : 'reparate'}:  ${stats.processed}`);
console.log(`⏭️  Fișiere OK:        ${stats.skipped}`);
console.log(`❌ Erori:             ${stats.errors}`);
console.log(`🔧 Total modificări:  ${stats.totalChanges}`);
console.log('='.repeat(70));

if (!CONFIG.dryRun) {
  if (CONFIG.createBackup) {
    console.log('\n💾 Backup-uri create cu extensia .backup');
    console.log('   Pentru a restaura: find src -name "*.backup" -exec sh -c \'mv "$1" "${1%.backup}"\' _ {} \\;');
  }
  
  console.log('\n🎯 PAȘI URMĂTORI:');
  console.log('1. Rulează: npm run build');
  console.log('2. Verifică că nu sunt erori de compilare');
  console.log('3. Testează aplicația în browser');
  console.log('4. Dacă totul e OK, șterge backup-urile\n');
} else {
  console.log('\n🔍 Acesta a fost un DRY RUN');
  console.log('   Pentru a aplica modificările, schimbă CONFIG.dryRun = false\n');
}