#!/usr/bin/env node

/**
 * 🔧 Script automat pentru repararea erorilor "t is not defined"
 * 
 * Rulează în VS Code Terminal:
 * 1. Salvează acest fișier ca: fix-all-translations.js
 * 2. npm install glob (dacă nu ai deja)
 * 3. node fix-all-translations.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configurare
const CONFIG = {
  // Opțiuni: 'add-hooks' sau 'remove-translations'
  mode: 'remove-translations', // Schimbă în 'add-hooks' dacă vrei să păstrezi i18next
  
  srcDir: 'server/admin-vite/src',
  filePattern: '**/*.{tsx,ts}',
  excludePatterns: ['**/*.test.ts', '**/*.test.tsx', '**/node_modules/**'],
  createBackup: true,
};

// Mapare traduceri comune în română
const TRANSLATION_MAP = {
  // Help/Ajutor
  "t('help')": "'Ajutor'",
  "t(\"help\")": "'Ajutor'",
  "t('help.button')": "'Ajutor'",
  "t(\"help.button\")": "'Ajutor'",
  "t('help.title')": "'Ghid de Ajutor'",
  "t(\"help.title\")": "'Ghid de Ajutor'",
  
  // Alerts/Alerte
  "t('alerts.title')": "'Alerte'",
  "t(\"alerts.title\")": "'Alerte'",
  "t('alerts.noAlerts')": "'Nu există alerte'",
  "t(\"alerts.noAlerts\")": "'Nu există alerte'",
  "t('alerts.critical')": "'Critic'",
  "t(\"alerts.critical\")": "'Critic'",
  "t('alerts.warning')": "'Avertisment'",
  "t(\"alerts.warning\")": "'Avertisment'",
  "t('alerts.info')": "'Informare'",
  "t(\"alerts.info\")": "'Informare'",
  "t('alerts.success')": "'Succes'",
  "t(\"alerts.success\")": "'Succes'",
  
  // Common actions
  "t('common.save')": "'Salvează'",
  "t('common.cancel')": "'Anulează'",
  "t('common.delete')": "'Șterge'",
  "t('common.edit')": "'Editează'",
  "t('common.add')": "'Adaugă'",
  "t('common.close')": "'Închide'",
  "t('common.confirm')": "'Confirmă'",
  "t('common.yes')": "'Da'",
  "t('common.no')": "'Nu'",
  
  // Buttons
  "t('button.save')": "'Salvează'",
  "t('button.cancel')": "'Anulează'",
  "t('button.submit')": "'Trimite'",
  
  // Messages
  "t('message.success')": "'Operațiune reușită'",
  "t('message.error')": "'A apărut o eroare'",
  "t('message.loading')": "'Se încarcă...'",
};

// Verifică dacă fișierul folosește 't(' dar nu are hook-ul
function needsFix(content) {
  const usesT = /\bt\(['"`]/.test(content);
  const hasHook = /const\s*{\s*t\s*}\s*=\s*useTranslation\(\)/.test(content);
  const hasImport = /useTranslation.*from\s*['"]react-i18next['"]/.test(content);
  
  return usesT && (!hasHook || !hasImport);
}

// Găsește toate utilizările lui t() în fișier (îmbunătățit pentru a evita false positives)
function findAllTCalls(content) {
  const regex = /t\(['"]([^'"]+)['"]\)/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const beforeMatch = content.substring(0, match.index);
    const afterMatch = content.substring(match.index + match[0].length);
    
    // Skip dacă suntem într-un import dinamic
    const lastImport = beforeMatch.lastIndexOf('import(');
    if (lastImport !== -1) {
      const afterImport = content.substring(lastImport);
      const firstClosingParen = afterImport.indexOf(')');
      if (firstClosingParen !== -1 && firstClosingParen > (match.index - lastImport + match[0].length)) {
        continue;
      }
    }
    
    // Skip dacă suntem într-un șir de caractere
    const quoteChar = beforeMatch.includes('"') ? '"' : "'";
    const lastQuote = beforeMatch.lastIndexOf(quoteChar);
    if (lastQuote !== -1 && !afterMatch.includes(quoteChar)) {
      continue;
    }
    
    // Skip dacă suntem într-un comentariu
    if (beforeMatch.includes('/*') && !afterMatch.includes('*/')) {
      continue;
    }
    if (beforeMatch.includes('//') && !afterMatch.includes('\n')) {
      continue;
    }
    
    // Verifică dacă e precedat de caractere semnificative pentru un apel de funcție
    const significantPrefixes = [' ', '=', ',', '(', '\n', '\t', ';', '{', '['];
    let isValidCall = false;
    
    for (let i = beforeMatch.length - 1; i >= 0; i--) {
      const char = beforeMatch[i];
      if (significantPrefixes.includes(char)) {
        isValidCall = true;
        break;
      }
      if (!/\s/.test(char)) {
        // Dacă găsim un caracter care nu e whitespace, verificăm dacă e parte din destructuring
        const context = beforeMatch.substring(Math.max(0, i - 10), i + 1);
        if (context.includes('{ t }') || context.includes('{t}')) {
          isValidCall = true;
        }
        break;
      }
    }
    
    if (!isValidCall) {
      continue;
    }
    
    matches.push({
      full: match[0],
      key: match[1],
      index: match.index
    });
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
    // Găsește prima funcție de componentă
    const patterns = [
      /(export\s+(?:default\s+)?function\s+\w+[^ {]*{)/,
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
  
  // Găsește toate apelurile t()
  const tCalls = findAllTCalls(content);
  
  if (tCalls.length === 0) {
    return { content: modified, changes: [] };
  }
  
  // Înlocuiește cu mapări cunoscute
  for (const [search, replace] of Object.entries(TRANSLATION_MAP)) {
    if (modified.includes(search)) {
      const count = (modified.match(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      modified = modified.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
      changes.push(`Înlocuit ${count}x: ${search} → ${replace}`);
    }
  }
  
  // Pentru cheile nemapate, creează un placeholder generic
  const remainingCalls = findAllTCalls(modified);
  for (const call of remainingCalls) {
    const placeholder = `'[${call.key}]'`; // Ex: '[some.unknown.key]'
    modified = modified.replace(call.full, placeholder);
    changes.push(`⚠️  Cheia necunoscută: ${call.full} → ${placeholder}`);
  }
  
  // Elimină importul react-i18next dacă există și nu mai e folosit
  if (!/\bt\(['"`]/.test(modified) && /import.*useTranslation.*from\s*['"]react-i18next['"]/.test(modified)) {
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
console.log('🚀 Script automat de reparare erori traduceri\n');
console.log(`📁 Căutare fișiere în: ${CONFIG.srcDir}`);
console.log(`🔧 Mod: ${CONFIG.mode === 'add-hooks' ? 'Adăugare hook-uri' : 'Înlocuire cu text românesc'}\n`);

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
    console.log('⏭️  Skipped (OK)');
    stats.skipped++;
  } else if (result.success) {
    console.log('✅ Fixed!');
    result.changes.forEach(change => console.log(`    • ${change}`));
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
console.log(`✅ Fișiere reparate:  ${stats.processed}`);
console.log(`⏭️  Fișiere OK:        ${stats.skipped}`);
console.log(`❌ Erori:             ${stats.errors}`);
console.log(`🔧 Total modificări:  ${stats.totalChanges}`);
console.log('='.repeat(70));

if (CONFIG.createBackup) {
  console.log('\n💾 Backup-uri create cu extensia .backup');
  console.log('   Pentru a restaura: mv fisier.tsx.backup fisier.tsx');
}

console.log('\n🎯 PAȘI URMĂTORI:');
console.log('1. Verifică fișierele modificate');
console.log('2. Rulează: npm run dev');
console.log('3. Testează aplicația în browser');
console.log('4. Dacă totul e OK, șterge backup-urile: find src -name "*.backup" -delete\n');

if (CONFIG.mode === 'remove-translations') {
  console.log('⚠️  ATENȚIE: Cheile necunoscute sunt marcate cu [key.name]');
  console.log('   Caută în cod după "[" și înlocuiește cu textul corect în română.\n');
}
