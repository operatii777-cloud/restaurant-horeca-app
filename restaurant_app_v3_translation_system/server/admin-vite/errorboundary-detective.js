/**
 * ErrorBoundary Detective
 * Extrage erorile reale din ErrorBoundary pentru fiecare pagină
 *
 * INSTALARE:
 * npm install --save-dev playwright
 *
 * RULARE:
 * node errorboundary-detective.js
 */

import { chromium } from 'playwright';
import fs from 'fs';

class ErrorBoundaryDetective {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:5173/admin-vite';
    this.routes = config.routes || [
      '/welcome',
      '/dashboard',
      '/menu',
      '/catalog',
      '/settings',
      '/orders',
      '/marketing/reservations-new',
      '/reports/sales',
      '/reports/profit-loss',
      '/lots',
      '/recipes',
      '/admin-advanced/reports',
      '/admin-advanced/marketing',
      '/admin-advanced/happy-hour',
      '/admin-advanced/fiscal',
      '/admin-advanced/risk-alerts',
      '/admin-advanced/restaurant-config',
      '/admin-advanced/feedback',
      '/settings/areas',
      '/settings/tables',
      '/settings/product-display',
      '/settings/missing-translations',
      '/settings/payment-methods',
      '/settings/vat',
      '/settings/schedule',
      '/settings/users',
      '/settings/printers',
      '/settings/notifications',
      '/settings/localization',
      '/integrations',
      '/settings/ui-customization',
      '/settings/import-export',
      '/settings/branding',
      '/settings/manual-instructiuni',
      '/import',
      '/export',
      '/stocks/fiscal/reports/monthly',
      '/stocks/fiscal/archive',
      '/stocks/fiscal/documents/create',
      '/stocks/fiscal/cash-register',
      '/stocks/fiscal/reports/x',
      '/stocks/fiscal/reports/z',
      '/stocks/fiscal/sync',
      '/stocks/fiscal/anaf-integration',
      '/anaf/certificate',
      '/anaf/health',
      '/anaf/submissions',
      '/saft/export',
      '/saga/export',
      '/nomenclator/units',
      '/catalog/prices',
      '/catalog/attributes',
      '/promotions/happy-hour',
      '/promotions/daily-offer',
      '/marketing',
      '/marketing/feedback',
      '/marketing/vouchers',
      '/marketing/loyalty',
      '/marketing/reservations-new',
      '/stocks/dashboard/executive',
      '/stocks/dashboard/advanced',
      '/reports/stock-prediction',
      '/audit/logs',
      '/audit/security',
      '/audit/login-history',
      '/audit/user-activity',
      '/audit/alerts',
      '/docs',
      '/menu-engineering',
      '/food-cost',
      '/gift-cards',
      '/smart-restock',
      '/weather-forecast',
      '/competitors',
      '/scheduling',
      '/purchase-orders',
      '/hostess-map',
      '/coatroom',
      '/lost-found',
      '/reports/hostess-occupancy',
      '/reports/coatroom-daily',
      '/reports/lostfound-items',
      '/dashboards/hostess',
      '/dashboards/coatroom',
      '/dashboards/lostfound',
      '/dashboards/platform-stats',
      '/technical-sheets',
      '/recipes/scaling',
      '/menu/builder',
      '/portions',
      '/recalls',
      '/expiry-alerts',
      '/variance-reports',
      '/admin/diagnostics',
      '/print',
      '/tipizate-enterprise/bon-consum',
      '/tipizate-enterprise/bon-consum/new',
      '/tipizate-enterprise/bon-consum/1',
      '/tipizate-enterprise/waste',
      '/tipizate-enterprise/waste/new',
      '/tipizate-enterprise/waste/1',
      '/tipizate-enterprise/raport-gestiune',
      '/tipizate-enterprise/raport-gestiune/new',
      '/tipizate-enterprise/raport-gestiune/1',
      '/tipizate-enterprise/raport-x',
      '/tipizate-enterprise/raport-x/new',
      '/tipizate-enterprise/raport-x/1',
      '/tipizate-enterprise/raport-z',
      '/tipizate-enterprise/raport-z/new',
      '/tipizate-enterprise/raport-z/1',
      '/tipizate-enterprise/raport-lunar',
      '/tipizate-enterprise/raport-lunar/new',
      '/tipizate-enterprise/raport-lunar/1',
      '/tipizate-enterprise/aviz',
      '/tipizate-enterprise/aviz/new',
      '/tipizate-enterprise/aviz/1',
      '/tipizate-enterprise/proces-verbal',
      '/tipizate-enterprise/proces-verbal/new',
      '/tipizate-enterprise/proces-verbal/1',
      '/tipizate-enterprise/retur',
      '/tipizate-enterprise/retur/new',
      '/tipizate-enterprise/retur/1',
      '/invoices',
      '/efactura',
      '/efactura/1',
      '/pos',
      '/invoices/1',
      '/pos/1',
      '/tipizate',
      '/tipizate/nir',
      '/tipizate/bon-consum',
      '/tipizate/avize',
      '/tipizate/chitante',
      '/tipizate/registru-casa',
      '/tipizate/fisa-magazie',
      '/tipizate/raport-gestiune',
      '/tipizate/transfer',
      '/tipizate/inventar',
    ];

    this.errorDetails = [];
    this.consoleErrors = [];
  }

  async investigate() {
    console.log('🔍 ERRORBOUNDARY DETECTIVE - Investigație Profundă\n');
    console.log(`📍 URL: ${this.baseUrl}`);
    console.log(`📄 Pagini: ${this.routes.length}\n`);

    let browser;
    try {
      browser = await chromium.launch({
        headless: false,
        slowMo: 50,
        args: ['--window-size=1920,1080'],
      });

      const page = await browser.newPage({
        viewport: { width: 1920, height: 1080 }
      });

      // Capturează TOATE mesajele din consolă
      page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();

        // Capturează erori și warning-uri
        if (type === 'error' || type === 'warning') {
          this.consoleErrors.push({
            type,
            text,
            url: page.url(),
            timestamp: new Date().toISOString(),
          });
        }

        // Detectează mesaje de la ErrorBoundary
        if (text.includes('ErrorBoundary') ||
            text.includes('Component stack') ||
            text.includes('Caught error')) {
          console.log(`\n🚨 ErrorBoundary Message:`);
          console.log(`   ${text}`);
        }
      });

      // Capturează erori de pagină
      page.on('pageerror', error => {
        console.log(`\n💥 Page Error: ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
      });

      // Testează fiecare pagină
      for (const route of this.routes) {
        await this.investigatePage(page, route);
        await this.delay(2000);
      }

      // Generează raport
      await this.generateReport();

    } catch (error) {
      console.error('❌ Eroare fatală:', error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async investigatePage(page, route) {
    const fullUrl = this.baseUrl + route;
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔍 Investighez: ${route}`);
    console.log(`${'='.repeat(70)}`);

    try {
      // Navighează
      await page.goto(fullUrl, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Așteaptă render
      await this.delay(2000);

      // Extrage informații din ErrorBoundary
      const errorInfo = await page.evaluate(() => {
        // Caută ErrorBoundary în DOM
        const errorElements = [
          document.querySelector('[class*="error-boundary"]'),
          document.querySelector('[class*="ErrorBoundary"]'),
          document.querySelector('[class*="error"]'),
          ...Array.from(document.querySelectorAll('*')).filter(el =>
            el.textContent.includes('ErrorBoundary') ||
            el.textContent.includes('Something went wrong') ||
            el.textContent.includes('Error:')
          )
        ].filter(Boolean);

        if (errorElements.length === 0) {
          return { hasError: false };
        }

        // Extrage textul complet din toate elementele de eroare
        const errorTexts = errorElements.map(el => ({
          className: el.className,
          text: el.textContent,
          html: el.innerHTML,
        }));

        return {
          hasError: true,
          errorTexts,
          bodyText: document.body.textContent,
        };
      });

      // Extrage stack trace din console
      const recentConsoleErrors = this.consoleErrors
        .filter(e => e.url === fullUrl)
        .slice(-10); // Ultimele 10 erori pentru această pagină

      if (errorInfo.hasError) {
        console.log(`   🚨 ErrorBoundary DETECTAT!`);

        // Încearcă să extragă eroarea specifică
        const specificError = this.extractSpecificError(errorInfo, recentConsoleErrors);

        if (specificError) {
          console.log(`   💥 EROARE GĂSITĂ:`);
          console.log(`      ${specificError.message}`);
          console.log(`      Fișier: ${specificError.file}:${specificError.line}`);
          console.log(`      Component: ${specificError.component}`);
        } else {
          console.log(`   ⚠️  Nu am putut extrage detalii specifice`);
        }

        // Salvează detalii complete
        this.errorDetails.push({
          route,
          url: fullUrl,
          errorInfo,
          consoleErrors: recentConsoleErrors,
          specificError,
          timestamp: new Date().toISOString(),
        });

        // Screenshot
        const screenshotDir = './errorboundary-screenshots';
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }

        const filename = `${route.replace(/\//g, '_')}_${Date.now()}.png`;
        const screenshotPath = `${screenshotDir}/${filename}`;

        await page.screenshot({
          path: screenshotPath,
          fullPage: true
        });

        console.log(`   📸 Screenshot: ${screenshotPath}`);

      } else {
        console.log(`   ✅ Fără ErrorBoundary - Pagina OK!`);
      }

    } catch (error) {
      console.log(`   ❌ Eroare la navigare: ${error.message}`);
      this.errorDetails.push({
        route,
        url: fullUrl,
        navigationError: error.message,
      });
    }
  }

  extractSpecificError(errorInfo, consoleErrors) {
    // Caută pattern-uri de eroare în textele din ErrorBoundary
    const allText = errorInfo.errorTexts
      .map(t => t.text)
      .join('\n');

    // Pattern-uri comune
    const patterns = {
      referenceError: /(\w+) is not defined/,
      typeError: /Cannot read propert(?:y|ies) ['"](\w+)['"]/,
      file: /at\s+(\w+\.tsx?):/,
      line: /:(\d+):\d+/,
      component: /at\s+(\w+)\s+\(/,
    };

    // Verifică și console errors
    const errorMessages = [
      allText,
      ...consoleErrors.map(e => e.text)
    ];

    let specificError = null;

    for (const msg of errorMessages) {
      const refMatch = msg.match(patterns.referenceError);
      const typeMatch = msg.match(patterns.typeError);
      const fileMatch = msg.match(patterns.file);
      const lineMatch = msg.match(patterns.line);
      const compMatch = msg.match(patterns.component);

      if (refMatch || typeMatch) {
        specificError = {
          type: refMatch ? 'ReferenceError' : 'TypeError',
          message: refMatch ? `${refMatch[1]} is not defined` : `Cannot read property '${typeMatch[1]}'`,
          variable: refMatch?.[1] || typeMatch?.[1],
          file: fileMatch?.[1] || 'Unknown',
          line: lineMatch?.[1] || 'Unknown',
          component: compMatch?.[1] || 'Unknown',
          fullMessage: msg,
        };
        break;
      }
    }

    return specificError;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateReport() {
    console.log('\n\n' + '█'.repeat(80));
    console.log('📊 RAPORT INVESTIGAȚIE ERRORBOUNDARY');
    console.log('█'.repeat(80) + '\n');

    const pagesWithErrors = this.errorDetails.filter(e => e.errorInfo?.hasError);
    const pagesOK = this.routes.length - pagesWithErrors.length;

    console.log(`📊 Statistici:`);
    console.log(`   Pagini testate: ${this.routes.length}`);
    console.log(`   Pagini cu ErrorBoundary: ${pagesWithErrors.length}`);
    console.log(`   Pagini OK: ${pagesOK}`);
    console.log(`   Console Errors totale: ${this.consoleErrors.length}\n`);

    if (pagesWithErrors.length === 0) {
      console.log('✅ FANTASTIC! Nicio pagină cu ErrorBoundary!\n');
      return;
    }

    console.log('🚨 PAGINI CU ERRORBOUNDARY:\n');

    pagesWithErrors.forEach((detail, idx) => {
      console.log(`\n${idx + 1}. ${detail.route}`);

      if (detail.specificError) {
        console.log(`   💥 Eroare: ${detail.specificError.type}`);
        console.log(`      Message: ${detail.specificError.message}`);
        console.log(`      Variable: ${detail.specificError.variable}`);
        console.log(`      File: ${detail.specificError.file}:${detail.specificError.line}`);
        console.log(`      Component: ${detail.specificError.component}`);
      } else {
        console.log(`   ⚠️  Eroare neidentificată - vezi screenshot`);
      }
    });

    // Grupează erorile
    const grouped = this.groupErrors(pagesWithErrors);

    if (Object.keys(grouped).length > 0) {
      console.log('\n\n🔴 ERORI GRUPATE DUPĂ TIP:\n');

      Object.entries(grouped).forEach(([errorType, items]) => {
        console.log(`\n❌ ${errorType}`);
        console.log(`   Apare în ${items.length} pagini:`);
        items.forEach((item, idx) => {
          console.log(`   ${idx + 1}. ${item.route}`);
          if (item.specificError?.file) {
            console.log(`      ${item.specificError.file}:${item.specificError.line}`);
          }
        });
      });
    }

    // Salvează raportul complet
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPages: this.routes.length,
        pagesWithErrors: pagesWithErrors.length,
        pagesOK,
        consoleErrors: this.consoleErrors.length,
      },
      errorDetails: this.errorDetails,
      consoleErrors: this.consoleErrors,
      grouped,
    };

    fs.writeFileSync(
      './errorboundary-investigation.json',
      JSON.stringify(report, null, 2)
    );
    console.log('\n💾 Raport salvat: errorboundary-investigation.json');

    // Generează sugestii de fix
    this.generateFixSuggestions(grouped);
  }

  groupErrors(errorDetails) {
    return errorDetails.reduce((acc, detail) => {
      if (!detail.specificError) {
        if (!acc['Unknown Error']) acc['Unknown Error'] = [];
        acc['Unknown Error'].push(detail);
        return acc;
      }

      const key = detail.specificError.message || 'Unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(detail);
      return acc;
    }, {});
  }

  generateFixSuggestions(grouped) {
    console.log('\n\n' + '█'.repeat(80));
    console.log('🔧 SUGESTII DE REPARARE');
    console.log('█'.repeat(80) + '\n');

    Object.entries(grouped).forEach(([errorType, items]) => {
      console.log(`\n📌 Pentru: "${errorType}"\n`);

      // Identifică pattern-ul erorii
      const firstItem = items[0];
      const error = firstItem.specificError;

      if (error?.type === 'ReferenceError') {
        console.log(`   💡 Variabila "${error.variable}" nu este definită`);
        console.log(`   🔧 Fix sugerat:`);
        console.log(`      1. Verifică dacă există import pentru "${error.variable}"`);
        console.log(`      2. Adaugă import sau definește variabila`);
        console.log(`      3. Dacă e funcție de traducere, vezi fix-translations.js`);
        console.log(`\n   📁 Fișiere afectate:`);
        const uniqueFiles = [...new Set(items.map(i => i.specificError?.file).filter(Boolean))];
        uniqueFiles.forEach(file => {
          console.log(`      - ${file}`);
        });
        console.log(`\n   🔍 Comandă grep:`);
        console.log(`      grep -rn "\\b${error.variable}\\b" src/ --include="*.tsx" --include="*.ts"`);
      }

      if (error?.type === 'TypeError') {
        console.log(`   💡 Proprietatea "${error.variable}" nu poate fi citită`);
        console.log(`   🔧 Fix sugerat:`);
        console.log(`      1. Verifică că obiectul nu este undefined/null`);
        console.log(`      2. Adaugă optional chaining: obj?.${error.variable}`);
        console.log(`      3. Adaugă verificare: if (obj && obj.${error.variable})`);
      }

      if (errorType === 'Unknown Error') {
        console.log(`   ⚠️  Eroare neidentificată automat`);
        console.log(`   🔧 Pași de investigare:`);
        console.log(`      1. Vezi screenshot-urile din ./errorboundary-screenshots/`);
        console.log(`      2. Verifică errorboundary-investigation.json`);
        console.log(`      3. Deschide pagina în browser și vezi Console (F12)`);
      }
    });

    console.log('\n\n📋 NEXT STEPS:\n');
    console.log('1. Verifică errorboundary-investigation.json pentru detalii complete');
    console.log('2. Vezi screenshots în ./errorboundary-screenshots/');
    console.log('3. Repară erorile identificate');
    console.log('4. Rulează din nou pentru verificare');
    console.log('');
  }
}

// ====================================================================
// MAIN
// ====================================================================

async function main() {

  // Check server availability before running tests
  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
  try {
    const res = await fetch('http://localhost:5173/admin-vite/', { timeout: 5000 });
    if (!res.ok) {
      console.error('❌ Serverul Vite a răspuns cu status:', res.status);
      process.exit(1);
    }
  } catch (e) {
    console.error('❌ Serverul Vite nu este pornit sau nu răspunde. Pornește serverul și reîncearcă.');
    process.exit(1);
  }

  const detective = new ErrorBoundaryDetective({
    baseUrl: 'http://localhost:5173/admin-vite',
  });

  await detective.investigate();

  console.log('\n✅ Investigație completă!\n');
  process.exit(0);
}

// Rulează scriptul
main().catch(error => {
  console.error('❌ Eroare fatală:', error);
  process.exit(1);
});