/**
 * Complete Text Scanner
 * Găsește ABSOLUT TOT textul din aplicație:
 * - Text hardcodat în JSX
 * - Chei de traducere t('key')
 * - Titluri, labels, placeholders
 * - Butoane, tooltips, aria-labels
 * - Mesaje de eroare, validări
 * - Denumiri funcții, variabile
 * - KPI, dashboards, grafice
 *
 * INSTALARE:
 * npm install --save-dev glob
 *
 * RULARE:
 * node complete-text-scanner.cjs
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class CompleteTextScanner {
  constructor(options = {}) {
    this.srcDir = options.srcDir || './src';
    this.translationsFile = options.translationsFile || './src/i18n/ro.json';

    this.results = {
      // Text hardcodat
      hardcodedText: [],

      // Chei de traducere
      translationKeys: [],

      // Text din JSX
      jsxText: [],

      // Atribute (titles, placeholders, etc)
      attributes: [],

      // Labels pentru butoane/inputs
      labels: [],

      // Aria labels (accessibility)
      ariaLabels: [],

      // Mesaje de eroare/validare
      messages: [],

      // KPI/Dashboard text
      dashboardText: [],

      // Comentarii cu text relevant
      comments: [],

      // Nume de variabile/funcții sugestive
      identifiers: [],
    };

    this.stats = {
      filesScanned: 0,
      totalTextPieces: 0,
      uniqueTexts: new Set(),
    };

    this.translations = {};
  }

  async run() {
    console.log('===============================================');
    console.log('COMPLETE TEXT SCANNER');
    console.log('Gaseste ABSOLUT TOT textul din aplicatie');
    console.log('===============================================\n');

    try {
      // 1. Încarcă traducerile
      console.log('Step 1: Loading translations...');
      await this.loadTranslations();
      console.log(`Loaded ${Object.keys(this.translations).length} translation keys\n`);

      // 2. Scanează fișierele
      console.log('Step 2: Scanning files...');
      const files = await new Promise((resolve, reject) => {
        glob(`${this.srcDir}/**/*.{tsx,ts,jsx,js}`, {
          ignore: ['**/node_modules/**', '**/*.d.ts', '**/*.test.*', '**/dist/**']
        }, (err, files) => {
          if (err) reject(err);
          else resolve(files);
        });
      });

      console.log(`Found ${files.length} files to scan\n`);

      console.log('Step 3: Extracting text...\n');
      for (const file of files) {
        await this.scanFile(file);
      }

      // 3. Generează raportul
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
      this.translations = this.flattenObject(data);
    } catch (error) {
      console.warn(`Warning: Could not load translations: ${error.message}`);
    }
  }

  flattenObject(obj, prefix = '') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(result, this.flattenObject(value, fullKey));
      } else {
        result[fullKey] = value;
      }
    }
    return result;
  }

  async scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);
      const relPath = path.relative(this.srcDir, filePath);

      this.stats.filesScanned++;

      // 1. Găsește chei de traducere
      this.extractTranslationKeys(content, relPath);

      // 2. Găsește text hardcodat în JSX
      this.extractJSXText(content, relPath);

      // 3. Găsește string literals
      this.extractStringLiterals(content, relPath);

      // 4. Găsește atribute (title, placeholder, etc)
      this.extractAttributes(content, relPath);

      // 5. Găsește aria-labels
      this.extractAriaLabels(content, relPath);

      // 6. Găsește mesaje de eroare/validare
      this.extractMessages(content, relPath);

      // 7. Găsește comentarii relevante
      this.extractComments(content, relPath);

      // 8. Găsește identificatori sugestivi
      this.extractIdentifiers(content, relPath);

      if (this.stats.filesScanned % 50 === 0) {
        console.log(`Processed ${this.stats.filesScanned} files...`);
      }

    } catch (error) {
      console.error(`Error scanning ${filePath}: ${error.message}`);
    }
  }

  extractTranslationKeys(content, filePath) {
    // Pattern: t('key') sau T('key')
    const regex = /\b[tT]\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const key = match[1];
      const translation = this.translations[key] || '[NOT FOUND]';
      const lineNumber = content.substring(0, match.index).split('\n').length;

      this.results.translationKeys.push({
        file: filePath,
        line: lineNumber,
        key,
        translation,
        code: match[0]
      });

      this.stats.uniqueTexts.add(translation);
      this.stats.totalTextPieces++;
    }
  }

  extractJSXText(content, filePath) {
    // Text direct în JSX: <div>Text aici</div>
    const regex = />([^<>{}]+)</g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      let text = match[1].trim();

      // Skip whitespace, numbers only, și cod
      if (!text || /^\d+$/.test(text) || /^[{}\[\]().,;:]+$/.test(text)) {
        continue;
      }

      // Skip dacă e doar variabilă
      if (/^[a-z_$][a-z0-9_$]*$/i.test(text)) {
        continue;
      }

      // Verifică dacă conține text relevant (română sau engleză)
      if (this.hasRelevantText(text)) {
        const lineNumber = content.substring(0, match.index).split('\n').length;

        this.results.jsxText.push({
          file: filePath,
          line: lineNumber,
          text,
          context: this.getContext(content, match.index)
        });

        this.stats.uniqueTexts.add(text);
        this.stats.totalTextPieces++;
      }
    }
  }

  extractStringLiterals(content, filePath) {
    // String literals: 'text' sau "text"
    const regex = /(['"`])([^\1\n]{3,}?)\1/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const text = match[2];

      // Skip URLs, paths, class names
      if (this.shouldSkipString(text)) {
        continue;
      }

      if (this.hasRelevantText(text)) {
        const lineNumber = content.substring(0, match.index).split('\n').length;

        this.results.hardcodedText.push({
          file: filePath,
          line: lineNumber,
          text,
          code: match[0]
        });

        this.stats.uniqueTexts.add(text);
        this.stats.totalTextPieces++;
      }
    }
  }

  extractAttributes(content, filePath) {
    // Atribute: title="...", placeholder="...", label="...", etc.
    const attributes = ['title', 'placeholder', 'label', 'alt', 'name', 'value'];

    attributes.forEach(attr => {
      const regex = new RegExp(`${attr}\\s*=\\s*{?\\s*['"\`]([^'"\`]+)['"\`]`, 'g');
      let match;

      while ((match = regex.exec(content)) !== null) {
        const text = match[1];

        if (this.hasRelevantText(text) && !this.shouldSkipString(text)) {
          const lineNumber = content.substring(0, match.index).split('\n').length;

          this.results.attributes.push({
            file: filePath,
            line: lineNumber,
            attribute: attr,
            text,
            code: match[0]
          });

          this.stats.uniqueTexts.add(text);
          this.stats.totalTextPieces++;
        }
      }
    });
  }

  extractAriaLabels(content, filePath) {
    // aria-* attributes
    const regex = /aria-[a-z]+\s*=\s*{?\s*['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const text = match[1];

      if (this.hasRelevantText(text)) {
        const lineNumber = content.substring(0, match.index).split('\n').length;

        this.results.ariaLabels.push({
          file: filePath,
          line: lineNumber,
          text,
          code: match[0]
        });

        this.stats.uniqueTexts.add(text);
        this.stats.totalTextPieces++;
      }
    }
  }

  extractMessages(content, filePath) {
    // Mesaje de eroare, validări, toasts
    const patterns = [
      /error:\s*['"`]([^'"`]+)['"`]/gi,
      /message:\s*['"`]([^'"`]+)['"`]/gi,
      /toast\.[a-z]+\(['"`]([^'"`]+)['"`]/gi,
      /alert\(['"`]([^'"`]+)['"`]/gi,
      /throw new Error\(['"`]([^'"`]+)['"`]/gi,
    ];

    patterns.forEach(regex => {
      let match;
      regex.lastIndex = 0;

      while ((match = regex.exec(content)) !== null) {
        const text = match[1];

        if (this.hasRelevantText(text)) {
          const lineNumber = content.substring(0, match.index).split('\n').length;

          this.results.messages.push({
            file: filePath,
            line: lineNumber,
            text,
            type: 'error/message',
            code: match[0]
          });

          this.stats.uniqueTexts.add(text);
          this.stats.totalTextPieces++;
        }
      }
    });
  }

  extractComments(content, filePath) {
    // Comentarii cu text relevant (// sau /* */)
    const singleLine = /\/\/\s*(.+)$/gm;
    const multiLine = /\/\*\s*([\s\S]*?)\s*\*\//g;

    [singleLine, multiLine].forEach(regex => {
      let match;
      regex.lastIndex = 0;

      while ((match = regex.exec(content)) !== null) {
        const text = match[1].trim();

        // Skip TODO, FIXME, etc dacă nu au conținut relevant
        if (text.length > 10 && this.hasRelevantText(text)) {
          const lineNumber = content.substring(0, match.index).split('\n').length;

          this.results.comments.push({
            file: filePath,
            line: lineNumber,
            text: text.substring(0, 100), // Limitează la 100 chars
          });
        }
      }
    });
  }

  extractIdentifiers(content, filePath) {
    // Nume de variabile/funcții sugestive
    // Ex: const saveButtonLabel, function getDashboardTitle
    const patterns = [
      /const\s+([a-z][a-zA-Z0-9]*(?:Label|Title|Text|Message|Name|Button|Tooltip))\s*=/gi,
      /function\s+([a-z][a-zA-Z0-9]*(?:Label|Title|Text|Message|Name))\s*=/gi,
    ];

    patterns.forEach(regex => {
      let match;
      regex.lastIndex = 0;

      while ((match = regex.exec(content)) !== null) {
        const identifier = match[1];
        const lineNumber = content.substring(0, match.index).split('\n').length;

        this.results.identifiers.push({
          file: filePath,
          line: lineNumber,
          identifier,
          suggestion: this.identifierToRomanian(identifier)
        });
      }
    });
  }

  hasRelevantText(text) {
    // Verifică dacă textul conține litere (română sau engleză)
    return /[a-zăâîșțA-ZĂÂÎȘȚ]/.test(text) && text.length >= 3;
  }

  shouldSkipString(text) {
    // Skip URLs, paths, class names, etc.
    const skipPatterns = [
      /^https?:\/\//,
      /^\/[a-z-/]+$/,
      /^\.[a-z-]+$/,
      /^[a-z-]+\.(js|ts|tsx|css|scss)$/,
      /^[A-Z_]+$/,  // CONSTANTS
      /^#[0-9a-f]{3,6}$/i,  // Colors
      /^\d+px$/,
      /^rgb|rgba|hsl/,
    ];

    return skipPatterns.some(pattern => pattern.test(text));
  }

  getContext(content, index, range = 50) {
    const start = Math.max(0, index - range);
    const end = Math.min(content.length, index + range);
    return content.substring(start, end).replace(/\n/g, ' ').trim();
  }

  identifierToRomanian(identifier) {
    // Conversii simple de la engleză la română
    const replacements = {
      'Label': 'Etichetă',
      'Title': 'Titlu',
      'Text': 'Text',
      'Message': 'Mesaj',
      'Button': 'Buton',
      'Tooltip': 'Tooltip',
      'Name': 'Nume',
      'save': 'salvează',
      'delete': 'șterge',
      'cancel': 'anulează',
      'submit': 'trimite',
    };

    let suggestion = identifier;
    Object.entries(replacements).forEach(([en, ro]) => {
      suggestion = suggestion.replace(new RegExp(en, 'g'), ro);
    });

    return suggestion !== identifier ? suggestion : null;
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('FINAL REPORT - ALL TEXT FOUND');
    console.log('='.repeat(80) + '\n');

    console.log('STATISTICS:');
    console.log(`  Files scanned: ${this.stats.filesScanned}`);
    console.log(`  Total text pieces: ${this.stats.totalTextPieces}`);
    console.log(`  Unique texts: ${this.stats.uniqueTexts.size}\n`);

    console.log('BY CATEGORY:');
    console.log(`  Translation keys: ${this.results.translationKeys.length}`);
    console.log(`  Hardcoded text: ${this.results.hardcodedText.length}`);
    console.log(`  JSX text: ${this.results.jsxText.length}`);
    console.log(`  Attributes: ${this.results.attributes.length}`);
    console.log(`  Aria labels: ${this.results.ariaLabels.length}`);
    console.log(`  Messages: ${this.results.messages.length}`);
    console.log(`  Comments: ${this.results.comments.length}`);
    console.log(`  Identifiers: ${this.results.identifiers.length}\n`);

    // Salvează rapoarte
    this.saveReports();
  }

  saveReports() {
    console.log('Saving reports...\n');

    // 1. Raport complet JSON
    fs.writeFileSync('./complete-text-scan.json', JSON.stringify({
      stats: this.stats,
      timestamp: new Date().toISOString(),
      results: {
        translationKeys: this.results.translationKeys.slice(0, 100),
        hardcodedText: this.results.hardcodedText.slice(0, 100),
        jsxText: this.results.jsxText.slice(0, 100),
        attributes: this.results.attributes.slice(0, 100),
        ariaLabels: this.results.ariaLabels.slice(0, 100),
        messages: this.results.messages.slice(0, 100),
      }
    }, null, 2));

    // 2. Toate textele unice
    const uniqueTexts = Array.from(this.stats.uniqueTexts).sort();
    fs.writeFileSync('./all-unique-texts.txt', uniqueTexts.join('\n'));

    // 3. Traduceri necesare
    const needsTranslation = this.results.translationKeys
      .filter(item => item.translation === '[NOT FOUND]')
      .map(item => item.key);

    if (needsTranslation.length > 0) {
      fs.writeFileSync('./keys-need-translation.txt', [...new Set(needsTranslation)].join('\n'));
    }

    // 4. CSV pentru Excel
    this.generateCSV();

    console.log('Reports saved:');
    console.log('  - complete-text-scan.json (detailed report)');
    console.log('  - all-unique-texts.txt (all unique text pieces)');
    console.log('  - all-text-inventory.csv (Excel compatible)');
    if (needsTranslation.length > 0) {
      console.log('  - keys-need-translation.txt (missing translations)');
    }
    console.log('');
  }

  generateCSV() {
    let csv = 'Category,File,Line,Text,Code\n';

    // Translation keys
    this.results.translationKeys.forEach(item => {
      csv += `"Translation Key","${item.file}",${item.line},"${this.csvEscape(item.translation)}","${this.csvEscape(item.code)}"\n`;
    });

    // Hardcoded text
    this.results.hardcodedText.forEach(item => {
      csv += `"Hardcoded","${item.file}",${item.line},"${this.csvEscape(item.text)}","${this.csvEscape(item.code)}"\n`;
    });

    // JSX text
    this.results.jsxText.forEach(item => {
      csv += `"JSX Text","${item.file}",${item.line},"${this.csvEscape(item.text)}",""\n`;
    });

    // Attributes
    this.results.attributes.forEach(item => {
      csv += `"${item.attribute}","${item.file}",${item.line},"${this.csvEscape(item.text)}","${this.csvEscape(item.code)}"\n`;
    });

    fs.writeFileSync('./all-text-inventory.csv', csv);
  }

  csvEscape(str) {
    return String(str).replace(/"/g, '""').substring(0, 200);
  }
}

// MAIN
async function main() {
  // Set working directory to script location
  process.chdir(__dirname);

  const scanner = new CompleteTextScanner({
    srcDir: './src',
    translationsFile: './src/i18n/ro.json',
  });

  await scanner.run();

  console.log('Scan complete!\n');
  console.log('Next steps:');
  console.log('1. Open all-unique-texts.txt to see all text');
  console.log('2. Open all-text-inventory.csv in Excel');
  console.log('3. Review complete-text-scan.json for details');
  console.log('');

  process.exit(0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('FATAL ERROR:', error);
    process.exit(1);
  });
}

module.exports = CompleteTextScanner;