/**
 * Debug Translation Issues
 * Găsește exact unde și cum se folosește t/T în fișiere
 * 
 * RULARE:
 * node debug-translation-issues.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class TranslationDebugger {
  constructor() {
    this.srcDir = './src';
    this.issues = [];
    
    // Componente din raportul ErrorBoundary care au probleme
    this.targetComponents = [
      'LegacyRedirect',
      'BonConsumListPage',
      'BonConsumEditorPage',
      'SalesReportsPage',
      'ProfitLossPage',
      'LotEditorModal',
      'CampaignModal',
    ];
  }

  async analyze() {
    console.log('🔍 DEBUG TRANSLATION ISSUES\n');

    const files = await glob(`${this.srcDir}/**/*.{tsx,ts}`, {
      ignore: ['**/node_modules/**', '**/*.d.ts']
    });

    console.log(`📄 Scanez ${files.length} fișiere...\n`);

    for (const file of files) {
      const fileName = path.basename(file, path.extname(file));
      
      if (this.targetComponents.includes(fileName)) {
        await this.analyzeFile(file);
      }
    }

    this.generateReport();
  }

  async analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const lines = content.split('\n');

    console.log(`\n${'='.repeat(70)}`);
    console.log(`📄 ${fileName}`);
    console.log(`${'='.repeat(70)}`);

    const analysis = {
      file: filePath,
      fileName,
      hasImport: false,
      hasHook: false,
      usesTLowercase: false,
      usesTUppercase: false,
      importLine: null,
      hookLine: null,
      usageLines: [],
    };

    // Verifică import
    const importPatterns = [
      /import.*useTranslation.*from.*['\"](.*?)['\"]/,
      /import.*{.*t.*}.*from.*['\"](.*?)['\"]/,
    ];

    lines.forEach((line, idx) => {
      importPatterns.forEach(pattern => {
        const match = line.match(pattern);
        if (match) {
          analysis.hasImport = true;
          analysis.importLine = {
            number: idx + 1,
            content: line.trim(),
            from: match[1] || 'unknown'
          };
        }
      });
    });

    // Verifică hook
    const hookPatterns = [
      /const\s*{\s*t\s*[,}:]/,
      /useTranslation\s*\(/,
    ];

    lines.forEach((line, idx) => {
      hookPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          analysis.hasHook = true;
          analysis.hookLine = {
            number: idx + 1,
            content: line.trim()
          };
        }
      });
    });

    // Găsește toate utilizările de t/T
    const usagePatterns = [
      { pattern: /\bt\s*\(/g, type: 't()' },
      { pattern: /\bT\s*\(/g, type: 'T()' },
      { pattern: /\{t\s*\(/g, type: '{t(' },
      { pattern: /\{T\s*\(/g, type: '{T(' },
      { pattern: /\bt\./g, type: 't.' },
      { pattern: /\bT\./g, type: 'T.' },
    ];

    lines.forEach((line, idx) => {
      usagePatterns.forEach(({ pattern, type }) => {
        if (pattern.test(line)) {
          analysis.usageLines.push({
            number: idx + 1,
            content: line.trim(),
            type
          });
          
          if (type.includes('t')) {
            analysis.usesTLowercase = true;
          }
          if (type.includes('T')) {
            analysis.usesTUppercase = true;
          }
        }
      });
    });

    // Afișează analiza
    console.log(`\n📊 Analiză:`);
    console.log(`   Import: ${analysis.hasImport ? '✅ DA' : '❌ NU'}`);
    if (analysis.importLine) {
      console.log(`      Linia ${analysis.importLine.number}: ${analysis.importLine.content}`);
      console.log(`      Din: ${analysis.importLine.from}`);
    }

    console.log(`   Hook: ${analysis.hasHook ? '✅ DA' : '❌ NU'}`);
    if (analysis.hookLine) {
      console.log(`      Linia ${analysis.hookLine.number}: ${analysis.hookLine.content}`);
    }

    console.log(`   Folosește t (lowercase): ${analysis.usesTLowercase ? '✅ DA' : '❌ NU'}`);
    console.log(`   Folosește T (uppercase): ${analysis.usesTUppercase ? '✅ DA' : '❌ NU'}`);

    if (analysis.usageLines.length > 0) {
      console.log(`\n   📍 Utilizări găsite (${analysis.usageLines.length}):`);
      analysis.usageLines.slice(0, 5).forEach(usage => {
        console.log(`      Linia ${usage.number} [${usage.type}]: ${usage.content.substring(0, 80)}...`);
      });
      if (analysis.usageLines.length > 5) {
        console.log(`      ... și încă ${analysis.usageLines.length - 5} utilizări`);
      }
    } else {
      console.log(`\n   ⚠️  Nu am găsit nicio utilizare de t() sau T()!`);
    }

    // Determină problema
    console.log(`\n💡 Diagnostic:`);
    if (!analysis.hasImport && !analysis.hasHook && analysis.usageLines.length === 0) {
      console.log(`   ✅ Fișierul pare OK - nu folosește traduceri`);
    } else if (analysis.hasImport && analysis.hasHook) {
      console.log(`   ✅ Fișierul pare OK - are import și hook`);
    } else if (analysis.hasImport && !analysis.hasHook) {
      console.log(`   🔧 TREBUIE REPARAT: Are import dar lipsește hook-ul`);
      console.log(`      Adaugă: const { t${analysis.usesTUppercase ? ': T' : ''} } = useTranslation();`);
    } else if (!analysis.hasImport && analysis.usageLines.length > 0) {
      console.log(`   🔧 TREBUIE REPARAT: Folosește t/T dar lipsește import-ul`);
      console.log(`      Adaugă: import { useTranslation } from '@/i18n/I18nContext';`);
      console.log(`      Adaugă: const { t${analysis.usesTUppercase ? ': T' : ''} } = useTranslation();`);
    } else {
      console.log(`   ❓ Situație neclară - verifică manual`);
    }

    this.issues.push(analysis);
  }

  generateReport() {
    console.log('\n\n' + '█'.repeat(80));
    console.log('📊 RAPORT FINAL DEBUG');
    console.log('█'.repeat(80) + '\n');

    const needsFix = this.issues.filter(i => 
      (i.usageLines.length > 0 && (!i.hasImport || !i.hasHook))
    );

    const alreadyOK = this.issues.filter(i => 
      i.hasImport && i.hasHook
    );

    const noTranslations = this.issues.filter(i => 
      i.usageLines.length === 0
    );

    console.log(`📊 Sumar:`);
    console.log(`   Total fișiere analizate: ${this.issues.length}`);
    console.log(`   Necesită reparare: ${needsFix.length}`);
    console.log(`   Deja OK: ${alreadyOK.length}`);
    console.log(`   Nu folosesc traduceri: ${noTranslations.length}\n`);

    if (needsFix.length > 0) {
      console.log('🔧 FIȘIERE CARE NECESITĂ REPARARE:\n');
      needsFix.forEach((issue, idx) => {
        console.log(`${idx + 1}. ${issue.fileName}`);
        console.log(`   Path: ${issue.file}`);
        console.log(`   Import: ${issue.hasImport ? '✅' : '❌'}`);
        console.log(`   Hook: ${issue.hasHook ? '✅' : '❌'}`);
        console.log(`   Utilizări: ${issue.usageLines.length}`);
        
        if (!issue.hasImport) {
          console.log(`   🔧 Adaugă: import { useTranslation } from '@/i18n/I18nContext';`);
        }
        if (!issue.hasHook) {
          const hookVar = issue.usesTUppercase ? 't: T' : 't';
          console.log(`   🔧 Adaugă: const { ${hookVar} } = useTranslation();`);
        }
        console.log('');
      });
    }

    if (alreadyOK.length > 0) {
      console.log('\n✅ FIȘIERE DEJA OK:\n');
      alreadyOK.forEach((issue, idx) => {
        console.log(`${idx + 1}. ${issue.fileName} - Import: ✅ Hook: ✅`);
      });
    }

    if (noTranslations.length > 0) {
      console.log('\n⚠️  FIȘIERE FĂRĂ TRADUCERI (posibil fals pozitive):\n');
      noTranslations.forEach((issue, idx) => {
        console.log(`${idx + 1}. ${issue.fileName}`);
      });
    }

    // Salvează raport
    fs.writeFileSync('./translation-debug-report.json', JSON.stringify(this.issues, null, 2));
    console.log('\n💾 Raport salvat: translation-debug-report.json\n');

    // Generează comenzi de fix manual
    if (needsFix.length > 0) {
      console.log('\n' + '█'.repeat(80));
      console.log('🔧 COMENZI PENTRU FIX MANUAL');
      console.log('█'.repeat(80) + '\n');

      needsFix.forEach(issue => {
        console.log(`# ${issue.fileName}`);
        console.log(`code "${issue.file}"`);
        if (!issue.hasImport) {
          console.log(`# Adaugă la începutul fișierului:`);
          console.log(`# import { useTranslation } from '@/i18n/I18nContext';`);
        }
        if (!issue.hasHook) {
          const hookVar = issue.usesTUppercase ? 't: T' : 't';
          console.log(`# Adaugă în component (după props):`);
          console.log(`# const { ${hookVar} } = useTranslation();`);
        }
        console.log('');
      });
    }
  }
}

// MAIN
async function main() {
  const translationDebugger = new TranslationDebugger();
  await translationDebugger.analyze();
  
  console.log('✅ Debug complet!\n');
  process.exit(0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Eroare:', error);
    process.exit(1);
  });
}

module.exports = TranslationDebugger;
