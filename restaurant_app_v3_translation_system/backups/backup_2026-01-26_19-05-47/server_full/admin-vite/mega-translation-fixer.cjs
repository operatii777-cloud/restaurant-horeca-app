/*
 * MEGA TRANSLATION FIXER
 * Repară TOATE componentele care au probleme cu t sau T deodată
 * 
 * Bazat pe raportul ErrorBoundary Detective care arată:
 * - 45 pagini cu "t is not defined"
 * - 16 pagini cu "T is not defined"
 * 
 * INSTALARE:
 * npm install --save-dev glob
 * 
 * RULARE:
 * node mega-translation-fixer.js --dry-run  (pentru preview)
 * node mega-translation-fixer.js            (pentru a aplica)
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class MegaTranslationFixer {
  constructor(options = {}) {
    this.srcDir = options.srcDir || './src';
    this.dryRun = options.dryRun || false;
    
    // Componente identificate din raportul ErrorBoundary
    this.problematicComponents = {
      // t is not defined (lowercase)
      't': [
        'LegacyRedirect',
        'BonConsumListPage',
        'BonConsumEditorPage',
        'WasteListPage',
        'WasteEditorPage',
        'RaportGestiuneListPage',
        'RaportGestiuneEditorPage',
        'RaportXListPage',
        'RaportXEditorPage',
        'RaportZListPage',
        'RaportZEditorPage',
        'RaportLunarListPage',
        'RaportLunarEditorPage',
        'AvizListPage',
        'AvizEditorPage',
        'ProcesVerbalListPage',
        'ProcesVerbalEditorPage',
        'ReturListPage',
        'ReturEditorPage',
      ],
      // T is not defined (uppercase)
      'T': [
        'SalesReportsPage',
        'ProfitLossPage',
        'LotEditorModal',
        'FiscalReportXPage',
        'FiscalReportZPage',
        'AnafIntegrationPage',
        'SagaExportPage',
        'CampaignModal',
        'AdvancedStockDashboardPage',
        'MenuEngineeringPage',
        'FoodCostDashboardPage',
        'EmployeeSchedulingPage',
        'CoatroomReportPage',
        'CoatroomDashboardPage',
        'PlatformStatsDashboardPage',
        'VarianceReportsPage',
      ]
    };

    this.fixed = [];
    this.errors = [];
    this.skipped = [];
  }

  async run() {
    console.log('🚀 MEGA TRANSLATION FIXER - REPARARE MASIVĂ\n');
    console.log(`📁 Director: ${this.srcDir}`);
    console.log(`🔧 Mod: ${this.dryRun ? 'DRY RUN (preview)' : 'LIVE (va modifica fișierele)'}\n`);

    const allComponents = [
      ...this.problematicComponents.t,
      ...this.problematicComponents.T
    ];

    console.log(`🎯 Componente de reparat: ${allComponents.length}\n`);

    try {
      // Găsește toate fișierele
      const files = await glob(`${this.srcDir}/**/*.{tsx,ts}`, {
        ignore: ['**/node_modules/**', '**/*.d.ts', '**/*.test.*']
      });

      console.log(`📄 Scanez ${files.length} fișiere...\n`);

      // Procesează fiecare fișier
      for (const file of files) {
        await this.processFile(file);
      }

      // Generează raportul
      this.generateReport();

    } catch (error) {
      console.error('❌ Eroare fatală:', error);
      process.exit(1);
    }
  }

  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath, path.extname(filePath));

      // Verifică dacă e unul din componentele problematice
      const needsLowercaseT = this.problematicComponents.t.includes(fileName);
      const needsUppercaseT = this.problematicComponents.T.includes(fileName);

      if (!needsLowercaseT && !needsUppercaseT) {
        // Nu e în lista problematică, dar verifică dacă folosește t/T fără import
        const usesT = this.usesTranslationWithoutImport(content);
        if (!usesT) {
          return; // Nu are nevoie de fix
        }
      }

      // Verifică ce pattern folosește fișierul
      const pattern = this.detectTranslationPattern(content, fileName);

      if (pattern === 'skip') {
        this.skipped.push({ file: filePath, reason: 'Already has import' });
        return;
      }

      console.log(`\n🔧 ${fileName}.tsx`);
      console.log(`   Pattern detectat: ${pattern}`);

      // Aplică fix-ul
      let fixed;
      if (pattern === 'lowercase-t') {
        fixed = this.fixLowercaseT(content, filePath);
      } else if (pattern === 'uppercase-T') {
        fixed = this.fixUppercaseT(content, filePath);
      } else if (pattern === 'both') {
        fixed = this.fixBoth(content, filePath);
      }

      if (fixed && fixed !== content) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, fixed);
          console.log(`   ✅ Reparat și salvat`);
        } else {
          console.log(`   ℹ️  [DRY RUN] Ar fi fost reparat`);
        }
        
        this.fixed.push({ 
          file: filePath,
          component: fileName,
          pattern 
        });
      } else {
        this.skipped.push({ 
          file: filePath, 
          reason: 'No changes needed or already fixed' 
        });
      }

    } catch (error) {
      console.error(`❌ Eroare la ${filePath}:`, error.message);
      this.errors.push({ file: filePath, reason: error.message });
    }
  }

  usesTranslationWithoutImport(content) {
    // Verifică dacă folosește t() sau T() fără să aibă import
    const usesLowercaseT = /\bt\(['"`]/.test(content) || /\{t\(['"`]/.test(content);
    const usesUppercaseT = /\bT\(['"`]/.test(content) || /\{T\(['"`]/.test(content);
    
    const hasImport = /import.*useTranslation.*from.*['"].*i18n/i.test(content);

    return (usesLowercaseT || usesUppercaseT) && !hasImport;
  }

  detectTranslationPattern(content, fileName) {
    // Verifică dacă deja are import
    if (/import.*useTranslation.*from/.test(content)) {
      // Are import, verifică dacă hook-ul e folosit
      if (/const\s*{\s*t\s*[,}]/.test(content) || /const\s*{\s*t\s*:\s*T\s*}/.test(content)) {
        return 'skip'; // Deja fix-uit
      }
    }

    // Detectează ce pattern folosește
    const usesLowercaseT = /\bt\(['"`]/.test(content);
    const usesUppercaseT = /\bT\(['"`]/.test(content);

    if (usesLowercaseT && usesUppercaseT) return 'both';
    if (usesUppercaseT) return 'uppercase-T';
    if (usesLowercaseT) return 'lowercase-t';

    return 'none';
  }

  fixLowercaseT(content, filePath) {
    let fixed = content;

    // 1. Adaugă import
    fixed = this.addImport(fixed);

    // 2. Adaugă hook
    fixed = this.addHook(fixed, 't');

    return fixed;
  }

  fixUppercaseT(content, filePath) {
    let fixed = content;

    // 1. Adaugă import
    fixed = this.addImport(fixed);

    // 2. Adaugă hook cu rename: const { t: T }
    fixed = this.addHook(fixed, 'T');

    return fixed;
  }

  fixBoth(content, filePath) {
    // Folosește T și adaugă și alias pentru lowercase
    return this.fixUppercaseT(content, filePath);
  }

  addImport(content) {
    // Verifică dacă deja are import
    if (/import.*useTranslation.*from/.test(content)) {
      return content;
    }

    // Găsește ultimul import
    const importLines = content.match(/^import\s+.*from\s+['"].*['"];?$/gm);
    
    if (importLines && importLines.length > 0) {
      const lastImport = importLines[importLines.length - 1];
      const importStatement = "import { useTranslation } from '@/i18n/I18nContext';";
      
      return content.replace(lastImport, lastImport + '\n' + importStatement);
    } else {
      // Nu sunt imports, adaugă la început
      return "import { useTranslation } from '@/i18n/I18nContext';\n\n" + content;
    }
  }

  addHook(content, varName) {
    // Verifică dacă hook-ul există deja
    if (/const\s*{\s*t\s*[,}:]/.test(content)) {
      return content;
    }

    // Găsește începutul funcției/componentului
    const patterns = [
      // export default function ComponentName() {
      /^(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*(:.*?)?\s*{)/m,
      // export function ComponentName() {
      /^(export\s+function\s+\w+\s*\([^)]*\)\s*(:.*?)?\s*{)/m,
      // const ComponentName = () => {
      /^(export\s+default\s+)?const\s+\w+\s*=\s*\([^)]*\)\s*(:\s*\w+\s*)?=>\s*{/m,
      // function ComponentName() {
      /^(function\s+\w+\s*\([^)]*\)\s*(:.*?)?\s*{)/m,
    ];

    let hookAdded = false;
    const hookLine = varName === 'T' 
      ? '\n  const { t: T } = useTranslation();\n'
      : '\n  const { t } = useTranslation();\n';

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const componentStart = match[0];
        content = content.replace(componentStart, componentStart + hookLine);
        hookAdded = true;
        break;
      }
    }

    if (!hookAdded) {
      console.warn(`   ⚠️  Nu am găsit începutul componentului`);
    }

    return content;
  }

  generateReport() {
    console.log('\n\n' + '█'.repeat(80));
    console.log('📊 RAPORT FINAL - MEGA FIX');
    console.log('█'.repeat(80) + '\n');

    console.log(`✅ Fișiere reparate: ${this.fixed.length}`);
    console.log(`⏭️  Fișiere sărite: ${this.skipped.length}`);
    console.log(`❌ Erori: ${this.errors.length}\n`);

    if (this.fixed.length > 0) {
      console.log('✅ FIȘIERE REPARATE:\n');
      
      // Grupează după pattern
      const byPattern = this.fixed.reduce((acc, item) => {
        if (!acc[item.pattern]) acc[item.pattern] = [];
        acc[item.pattern].push(item);
        return acc;
      }, {});

      Object.entries(byPattern).forEach(([pattern, items]) => {
        console.log(`\n${pattern.toUpperCase()}:`);
        items.forEach((item, idx) => {
          console.log(`  ${idx + 1}. ${item.component}`);
          console.log(`     ${item.file}`);
        });
      });
    }

    if (this.errors.length > 0) {
      console.log('\n\n❌ FIȘIERE CU ERORI:\n');
      this.errors.forEach((item, idx) => {
        console.log(`${idx + 1}. ${path.basename(item.file)}`);
        console.log(`   ${item.reason}\n`);
      });
    }

    // Salvează raportul
    const report = {
      timestamp: new Date().toISOString(),
      stats: {
        fixed: this.fixed.length,
        skipped: this.skipped.length,
        errors: this.errors.length,
      },
      fixed: this.fixed,
      skipped: this.skipped,
      errors: this.errors,
    };

    fs.writeFileSync('./mega-fix-report.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Raport salvat: mega-fix-report.json');

    if (this.dryRun) {
      console.log('\n⚠️  ATENȚIE: Acesta a fost un DRY RUN');
      console.log('Rulează fără --dry-run pentru a aplica modificările:\n');
      console.log('  node mega-translation-fixer.js\n');
    } else {
      console.log('\n✅ MODIFICĂRI APLICATE!');
      console.log('\n📋 URMĂTORII PAȘI:');
      console.log('1. Testează aplicația: npm run dev');
      console.log('2. Verifică în browser că erorile au dispărut');
      console.log('3. Rulează din nou ErrorBoundary Detective pentru confirmare:');
      console.log('   node errorboundary-detective.js');
      console.log('4. Commit modificările:\n');
      console.log('   git add .');
      console.log('   git commit -m "fix: add missing translation hooks to all components"');
      console.log('');
    }
  }
}

// ====================================================================
// MAIN
// ====================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log(`
╔════════════════════════════════════════════════════════════╗
║      🚀 MEGA TRANSLATION FIXER - MASS REPAIR TOOL         ║
╚════════════════════════════════════════════════════════════╝

Bazat pe raportul ErrorBoundary Detective:
  • 45 pagini cu "t is not defined"
  • 16 pagini cu "T is not defined"
  • Total: 61 componente de reparat

Acest script va:
  ✅ Găsi toate componentele problematice
  ✅ Adăuga import { useTranslation } din '@/i18n/I18nContext'
  ✅ Adăuga hook-ul const { t } = useTranslation()
  ✅ Sau const { t: T } = useTranslation() pentru uppercase T
  ✅ Salva modificările automat

${dryRun ? '⚠️  MOD DRY RUN - Nu va modifica fișierele' : '🔧 MOD LIVE - Va modifica fișierele'}
`);

  const fixer = new MegaTranslationFixer({
    srcDir: './src',
    dryRun,
  });

  await fixer.run();
  
  console.log('\n✅ Proces complet!\n');
  process.exit(0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Eroare fatală:', error);
    process.exit(1);
  });
}

module.exports = MegaTranslationFixer;