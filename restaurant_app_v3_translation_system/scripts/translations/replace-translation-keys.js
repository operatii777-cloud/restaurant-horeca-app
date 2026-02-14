/**
 * Replace All Translation Keys
 * Înlocuiește automat TOATE cheile de traducere (t('key')) cu textul în română
 *
 * INSTALARE:
 * npm install --save-dev glob
 *
 * RULARE:
 * node replace-translation-keys.js --dry-run  (preview)
 * node replace-translation-keys.js            (aplică)
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class TranslationKeyReplacer {
  constructor(options = {}) {
    this.srcDir = options.srcDir || 'server/admin-vite/src';
    this.translationsFile = options.translationsFile || 'server/admin-vite/src/i18n/ro.json';
    this.dryRun = options.dryRun || false;

    this.translations = {};
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      keysReplaced: 0,
      keysNotFound: 0,
      errors: 0,
    };

    this.notFoundKeys = new Set();
    this.replacements = [];
  }

  async run() {
    console.log('===============================================');
    console.log('REPLACE ALL TRANSLATION KEYS');
    console.log('===============================================\n');
    console.log(`Source dir: ${this.srcDir}`);
    console.log(`Translations: ${this.translationsFile}`);
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}\n`);

    try {
      // 1. Încarcă traducerile
      console.log('Step 1: Loading translations...');
      await this.loadTranslations();
      console.log(`Loaded ${Object.keys(this.translations).length} translation keys\n`);

      // 2. Găsește toate fișierele
      console.log('Step 2: Finding files...');
      const files = await glob(`${this.srcDir}/**/*.{tsx,ts,jsx,js}`, {
        ignore: ['**/node_modules/**', '**/*.d.ts', '**/*.test.*', '**/i18n/**']
      });
      console.log(`Found ${files.length} files to process\n`);

      // 3. Procesează fiecare fișier
      console.log('Step 3: Processing files...\n');
      for (const file of files) {
        await this.processFile(file);
      }

      // 4. Generează raportul
      this.generateReport();

    } catch (error) {
      console.error('ERROR:', error);
      process.exit(1);
    }
  }

  async loadTranslations() {
    try {
      const content = fs.readFileSync(this.translationsFile, 'utf8');
      const data = JSON.parse(content);

      // Flatten nested translations
      this.translations = this.flattenTranslations(data);

    } catch (error) {
      console.error(`ERROR loading translations: ${error.message}`);
      throw error;
    }
  }

  flattenTranslations(obj, prefix = '') {
    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(result, this.flattenTranslations(value, fullKey));
      } else {
        result[fullKey] = value;
      }
    }

    return result;
  }

  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let modified = content;
      let replacements = 0;

      // Pattern-uri pentru găsirea cheilor de traducere
      const patterns = [
        // t('key') sau T('key')
        { regex: /\b[tT]\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g, capture: 1 },

        // t("key") sau T("key")
        { regex: /\b[tT]\s*\(\s*"([^"]+)"\s*\)/g, capture: 1 },

        // t(`key`) sau T(`key`)
        { regex: /\b[tT]\s*\(\s*`([^`]+)`\s*\)/g, capture: 1 },

        // {t('key')} sau {T('key')} în JSX
        { regex: /\{\s*[tT]\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\}/g, capture: 1 },
      ];

      patterns.forEach(({ regex }) => {
        let match;
        regex.lastIndex = 0;

        while ((match = regex.exec(content)) !== null) {
          const fullMatch = match[0];
          const key = match[1];

          // Verifică dacă cheia există în traduceri
          if (this.translations[key]) {
            const translation = this.translations[key];

            // Construiește replacement-ul
            let replacement;

            if (fullMatch.startsWith('{')) {
              // JSX: {t('key')} → {translation}
              replacement = `{${this.escapeForJSX(translation)}}`;
            } else {
              // Regular: t('key') → 'translation'
              replacement = `'${this.escapeForString(translation)}'`;
            }

            // Înlocuiește
            modified = modified.replace(fullMatch, replacement);
            replacements++;
            this.stats.keysReplaced++;

            this.replacements.push({
              file: filePath,
              key,
              from: fullMatch,
              to: replacement,
            });

          } else {
            // Cheia nu există în traduceri
            this.notFoundKeys.add(key);
            this.stats.keysNotFound++;
          }
        }
      });

      this.stats.filesProcessed++;

      if (replacements > 0) {
        this.stats.filesModified++;

        if (!this.dryRun) {
          fs.writeFileSync(filePath, modified, 'utf8');
        }

        console.log(`[${this.stats.filesProcessed}/${this.stats.filesModified}] ${path.basename(filePath)}: ${replacements} keys replaced`);
      }

    } catch (error) {
      console.error(`ERROR processing ${filePath}: ${error.message}`);
      this.stats.errors++;
    }
  }

  escapeForString(str) {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  escapeForJSX(str) {
    // În JSX, punem direct string-ul dacă e simplu
    // sau folosim ghilimele dacă conține caractere speciale
    if (/^[a-zA-Z0-9\s\u0100-\u017F\u0180-\u024F]+$/.test(str)) {
      return `"${str}"`;
    }
    return `"${this.escapeForString(str)}"`;
  }

  generateReport() {
    console.log('\n\n' + '='.repeat(80));
    console.log('FINAL REPORT');
    console.log('='.repeat(80) + '\n');

    console.log('STATISTICS:');
    console.log(`  Files processed: ${this.stats.filesProcessed}`);
    console.log(`  Files modified: ${this.stats.filesModified}`);
    console.log(`  Keys replaced: ${this.stats.keysReplaced}`);
    console.log(`  Keys not found: ${this.stats.keysNotFound}`);
    console.log(`  Errors: ${this.stats.errors}\n`);

    if (this.notFoundKeys.size > 0) {
      console.log(`\nWARNING: ${this.notFoundKeys.size} keys not found in translations:\n`);
      const keys = Array.from(this.notFoundKeys).slice(0, 20);
      keys.forEach(key => console.log(`  - ${key}`));
      if (this.notFoundKeys.size > 20) {
        console.log(`  ... and ${this.notFoundKeys.size - 20} more`);
      }
      console.log('\nThese keys were NOT replaced.');
    }

    // Salvează rapoarte
    fs.writeFileSync('./replacement-report.json', JSON.stringify({
      stats: this.stats,
      replacements: this.replacements.slice(0, 100), // Primele 100
      notFoundKeys: Array.from(this.notFoundKeys),
    }, null, 2));

    fs.writeFileSync('./not-found-keys.txt', Array.from(this.notFoundKeys).join('\n'));

    console.log('\n\nReports saved:');
    console.log('  - replacement-report.json (detailed report)');
    console.log('  - not-found-keys.txt (missing translation keys)\n');

    if (this.dryRun) {
      console.log('='.repeat(80));
      console.log('DRY RUN MODE - No files were modified');
      console.log('Run without --dry-run to apply changes');
      console.log('='.repeat(80) + '\n');
    } else {
      console.log('='.repeat(80));
      console.log('CHANGES APPLIED SUCCESSFULLY');
      console.log('='.repeat(80) + '\n');

      console.log('NEXT STEPS:');
      console.log('1. Test the application: npm run dev');
      console.log('2. Check if everything works correctly');
      console.log('3. Review not-found-keys.txt for missing translations');
      console.log('4. Commit changes:');
      console.log('   git add .');
      console.log('   git commit -m "refactor: replace translation keys with Romanian text"');
      console.log('');
    }
  }
}

// MAIN
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log(`
===============================================
  TRANSLATION KEY REPLACER
  Auto-replace ~2127 translation keys
===============================================

This script will:
  1. Load all translations from ro.json
  2. Find all t('key') and T('key') usage
  3. Replace with actual Romanian text
  4. Generate report of changes

Mode: ${dryRun ? 'DRY RUN (preview only)' : 'LIVE (will modify files)'}

`);

  const replacer = new TranslationKeyReplacer({
    srcDir: 'server/admin-vite/src',
    translationsFile: 'server/admin-vite/src/i18n/ro.json',
    dryRun,
  });

  await replacer.run();

  console.log('Process complete!\n');
  process.exit(0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('FATAL ERROR:', error);
    process.exit(1);
  });
}

module.exports = TranslationKeyReplacer;