#!/usr/bin/env node

/**
 * 🔧 REPARARE COMPLETĂ SISTEM i18n
 *
 * Ce face:
 * 1. Găsește ro.json
 * 2. Găsește toate $[cheie] în cod
 * 3. Le înlocuiește cu traduceri din ro.json
 * 4. Creează sistem de traduceri funcțional
 *
 * Rulează: node fix-i18n-complete.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ============================================================================
// CONFIGURARE
// ============================================================================
const CONFIG = {
  srcDir: 'src',
  roJsonPattern: '**/i18n/ro.json',

  // Pattern-uri pentru chei nerezolvate
  keyPatterns: [
    { regex: /\$\[([a-z_]+)\]/g, name: '$[key]' },
    { regex: /\$\{([a-z_]+)\}/g, name: '${key}' },
  ],

  createBackup: true,
  dryRun: false,
};

// ============================================================================
// GĂSEȘTE ȘI ÎNCARCĂ ro.json
// ============================================================================

console.log('🔍 REPARARE COMPLETĂ SISTEM i18n\n');
console.log('='.repeat(70) + '\n');

// Schimbă directorul de lucru în directorul admin-vite
const adminViteDir = path.dirname(__filename);
process.chdir(adminViteDir);
console.log('Changed CWD to:', process.cwd());

// Găsește ro.json
console.log('CWD:', process.cwd());
const roJsonFiles = glob.sync(CONFIG.roJsonPattern, {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
});
console.log('Found files:', roJsonFiles);

if (roJsonFiles.length === 0) {
  console.error('❌ Nu am găsit fișierul ro.json!');
  console.error('   Caută manual și setează calea în CONFIG.roJsonPattern\n');
  process.exit(1);
}

const roJsonPath = roJsonFiles[0];
console.log(`📖 Folosesc ro.json: ${roJsonPath}\n`);

// Încarcă traducerile
let translations;
try {
  const content = fs.readFileSync(roJsonPath, 'utf8');
  translations = JSON.parse(content);
  console.log(`✅ Încărcate ${Object.keys(translations).length} traduceri\n`);
} catch (error) {
  console.error(`❌ Eroare la citirea ro.json: ${error.message}\n`);
  process.exit(1);
}

// ============================================================================
// FUNCȚII
// ============================================================================

/**
 * Traduce o cheie
 */
function translate(key) {
  if (translations[key]) {
    return translations[key];
  }

  // Auto-generează dacă lipsește
  console.warn(`   ⚠️  Cheie lipsă: "${key}" - auto-generez`);
  return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Procesează un fișier
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = content;
    let totalChanges = 0;
    const changes = [];

    // Procesează fiecare pattern
    for (const { regex, name } of CONFIG.keyPatterns) {
      const matches = [];
      regex.lastIndex = 0;
      let match;

      while ((match = regex.exec(content)) !== null) {
        matches.push({
          full: match[0],
          key: match[1],
          index: match.index
        });
      }

      if (matches.length === 0) continue;

      // Înlocuiește în ordine inversă
      matches.sort((a, b) => b.index - a.index);

      for (const m of matches) {
        const translation = translate(m.key);
        const before = modified.substring(0, m.index);
        const after = modified.substring(m.index + m.full.length);

        // Determină tipul de ghilimele din context
        const beforeChar = before[before.length - 1];
        const afterChar = after[0];

        let replacement;
        if (beforeChar === '{' && afterChar === '}') {
          // JSX: {$[key]}
          replacement = `"${translation}"`;
        } else if (beforeChar === '>' || afterChar === '<') {
          // Text în JSX: >$[key]<
          replacement = translation;
        } else {
          // Default
          replacement = `"${translation}"`;
        }

        modified = before + replacement + after;

        changes.push({
          from: m.full,
          to: replacement,
          key: m.key,
          translation
        });

        totalChanges++;
      }
    }

    if (totalChanges === 0) {
      return { success: false, skipped: true };
    }

    if (CONFIG.dryRun) {
      return { success: true, changes, dryRun: true };
    }

    // Backup
    if (CONFIG.createBackup) {
      fs.writeFileSync(filePath + '.backup', content, 'utf8');
    }

    // Salvează
    fs.writeFileSync(filePath, modified, 'utf8');

    return { success: true, changes };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// PROCESARE FIȘIERE
// ============================================================================

console.log('📂 Scanare și procesare fișiere...\n');

const files = glob.sync(`${CONFIG.srcDir}/**/*.{tsx,ts,jsx,js,json}`, {
  ignore: [
    '**/node_modules/**',
    '**/*.test.*',
    '**/dist/**',
    '**/build/**',
    roJsonPath // Nu procesa ro.json
  ]
});

console.log(`📄 Găsite ${files.length} fișiere\n`);

const stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  totalChanges: 0
};

const missingKeys = new Set();

files.forEach((file, index) => {
  const displayPath = file.length > 55 ? '...' + file.slice(-52) : file;
  process.stdout.write(`[${index + 1}/${files.length}] ${displayPath.padEnd(55)} `);

  const result = processFile(file);

  if (result.skipped) {
    console.log('✓');
    stats.skipped++;
  } else if (result.success) {
    const mode = result.dryRun ? '🔍' : '✅';
    console.log(`${mode} ${result.changes.length} chei`);

    // Afișează primele 2 modificări
    result.changes.slice(0, 2).forEach(change => {
      console.log(`     ${change.from} → ${change.to}`);
    });

    if (result.changes.length > 2) {
      console.log(`     ... și încă ${result.changes.length - 2}`);
    }

    stats.processed++;
    stats.totalChanges += result.changes.length;
  } else if (result.error) {
    console.log(`❌ ${result.error}`);
    stats.errors++;
  }
});

// ============================================================================
// RAPORT FINAL
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('📊 REZULTATE:');
console.log('='.repeat(70));
console.log(`✅ Fișiere ${CONFIG.dryRun ? 'de reparat' : 'reparate'}:  ${stats.processed}`);
console.log(`⏭️  Fișiere OK:        ${stats.skipped}`);
console.log(`❌ Erori:             ${stats.errors}`);
console.log(`🔧 Total modificări:  ${stats.totalChanges}`);
console.log('='.repeat(70) + '\n');

// Salvează chei lipsă
if (missingKeys.size > 0) {
  console.log(`⚠️  ATENȚIE: ${missingKeys.size} chei LIPSĂ din ro.json!\n`);

  const missingTranslations = {};
  missingKeys.forEach(key => {
    missingTranslations[key] = translate(key);
  });

  fs.writeFileSync(
    'missing-keys.json',
    JSON.stringify(missingTranslations, null, 2)
  );

  console.log('💾 Chei lipsă salvate în: missing-keys.json');
  console.log('   Adaugă aceste traduceri în ro.json!\n');

  console.log('🔑 Chei lipsă (primele 10):');
  Array.from(missingKeys).slice(0, 10).forEach(key => {
    console.log(`   - ${key}: "${translate(key)}"`);
  });
  console.log();
}

// ============================================================================
// CREEAZĂ SISTEM DE TRADUCERI
// ============================================================================

if (!CONFIG.dryRun && stats.processed > 0) {
  console.log('🛠️  Creare sistem de traduceri...\n');

  // 1. Creează utilitar de traducere
  const translateUtilContent = `/**
 * Sistem simplu de traduceri
 * Auto-generat de fix-i18n-complete.js
 */

import translations from '../locales/ro.json';

/**
 * Traduce o cheie
 * @param key - Cheia de traducere
 * @param fallback - Text implicit dacă cheia nu există
 * @returns Traducerea sau fallback
 */
export function translate(key: string, fallback?: string): string {
  return translations[key as keyof typeof translations] || fallback || key;
}

// Alias scurt
export const t = translate;

// Export traduceri pentru utilizări speciale
export { translations };
`;

  const utilDir = path.join(CONFIG.srcDir, 'utils');
  if (!fs.existsSync(utilDir)) {
    fs.mkdirSync(utilDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(utilDir, 'translate.ts'),
    translateUtilContent
  );

  console.log('✅ Creat: src/utils/translate.ts');

  // 2. Creează component React pentru traduceri
  const tComponentContent = `/**
 * Component React pentru traduceri
 * Auto-generat de fix-i18n-complete.js
 */

import React from 'react';
import { translate } from '../utils/translate';

interface TProps {
  k: string;
  fallback?: string;
}

/**
 * Component pentru traduceri în JSX
 * @example <T k="vanzari_astazi" />
 */
export function T({ k, fallback }: TProps) {
  return <>{translate(k, fallback)}</>;
}
`;

  const componentsDir = path.join(CONFIG.srcDir, 'components');
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(componentsDir, 'T.tsx'),
    tComponentContent
  );

  console.log('✅ Creat: src/components/T.tsx\n');
}

// ============================================================================
// PAȘI URMĂTORI
// ============================================================================

if (!CONFIG.dryRun) {
  console.log('🎯 PAȘI URMĂTORI:\n');
  console.log('1. Verifică fișierele modificate');

  if (missingKeys.size > 0) {
    console.log('2. Adaugă cheile din missing-keys.json în ro.json');
  }

  console.log('3. Testează aplicația: npm run dev');
  console.log('4. Verifică că textele apar corect');
  console.log('5. Pentru traduceri viitoare, folosește:');
  console.log('   import { t } from "./utils/translate";');
  console.log('   const text = t("cheie");');
  console.log('6. Dacă totul e OK, șterge backup-urile\n');

  if (CONFIG.createBackup) {
    console.log('💾 Pentru restaurare:');
    console.log('   find src -name "*.backup" -exec sh -c \'mv "$1" "${1%.backup}"\' _ {} \\;\n');
  }
} else {
  console.log('🔍 Acesta a fost un DRY RUN!');
  console.log('   Pentru a aplica: CONFIG.dryRun = false\n');
}

console.log('✨ Gata!\n');