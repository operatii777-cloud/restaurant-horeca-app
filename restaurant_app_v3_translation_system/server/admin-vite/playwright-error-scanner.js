/**
 * Playwright Error Scanner pentru admin-vite
 * Scanează automat toate paginile și capturează erorile
 *
 * INSTALARE:
 * npm install --save-dev playwright
 * npx playwright install chromium
 *
 * RULARE:
 * node playwright-error-scanner.js
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

class AdminViteErrorScanner {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:3001/admin-vite';
    this.routes = config.routes || [
      // Core pages - doar câteva pentru test rapid
      '/welcome',
      '/dashboard',
      '/menu',
      '/catalog',
      '/settings',

      // Orders
      '/orders',
      '/orders/history',
      '/orders/delivery',
      '/orders/drive-thru',
      '/orders/takeaway',
      '/orders/cancellations',

      // Delivery & Couriers
      '/couriers',
      '/dispatch',
      '/drive-thru',
      '/delivery-monitor',
      '/delivery-dashboard',
      '/delivery/kpi',

      // Recipes & Production
      '/recipes',
      '/production/batches',

      // Reservations (legacy redirect)
      '/reservations',

      // Daily Menu & Lots
      '/daily-menu',
      '/lots',

      // Compliance
      '/compliance',
      '/compliance/haccp',
      '/compliance/haccp/processes',
      '/compliance/haccp/monitoring',
      '/compliance/haccp/corrective-actions',

      // Settings & Tables
      '/settings',
      '/tables',

      // Reports
      '/reports',
      '/reports/profit-loss',
      '/reports/abc-analysis',
      '/reports/staff',
      '/reports/advanced',
      '/reports/sales',
      '/reports/stock',
      '/reports/delivery-performance',
      '/reports/drive-thru-performance',
      '/reports/top-products',
      '/reports/financial',

      // Accounting Reports
      '/accounting/reports/vat',
      '/accounting/reports/client-payments',
      '/accounting/reports/suppliers',
      '/accounting/reports/consumption',
      '/accounting/reports/entries',
      '/accounting/reports/stock-balance',
      '/accounting/reports/daily-balance',

      // Accounting Settings
      '/accounting/settings/export',
      '/accounting/settings/accounts',
      '/accounting/settings/mapping',

      // Stocks modules
      '/stocks/inventory/dashboard',
      '/stocks/inventory/multi',
      '/stocks/inventory/import',
      '/stocks/allergens',
      '/stocks/labels',
      '/stocks/costs',
      '/stocks/risk-alerts',
      '/stocks/suppliers',
      '/stocks/suppliers/orders',

      // Platform & External
      '/platform-sync',
      '/external-delivery/sync',
      '/platform-stats',

      // Other modules
      '/internal-messaging',
      '/menu-pdf',
      '/waiters',
      '/queue-monitor',
      '/backup',
      '/traceability',
      '/training',

      // Tipizate Enterprise (sample)
      '/tipizate-enterprise/bon-consum',
      '/tipizate-enterprise/factura',

      // Archive
      '/archive',
    ];

    this.errors = [];
    this.testedPages = [];
    this.screenshots = [];
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🚀 Pornesc scanarea automată...\n');
    console.log(`📍 URL de bază: ${this.baseUrl}`);
    console.log(`📄 Pagini de testat: ${this.routes.length}\n`);

    console.log('🔧 Configurație browser:');
    console.log('   - Headless: false (vizual)');
    console.log('   - Slow motion: 100ms');
    console.log('   - Timeout per pagină: 45 secunde\n');

    console.log('🧪 Test simplu - verific dacă scriptul rulează...');
    console.log('✅ Script activ\n');

    try {
      console.log('🌐 Inițializez browser-ul Playwright...');
      // Pornește browser
      this.browser = await chromium.launch({
        headless: false, // Schimbă în true pentru rulare în fundal
        slowMo: 100, // Încetinește pentru a putea vedea ce se întâmplă
      });
      console.log('✅ Browser pornit');

      // Creează context și pagină
      const context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
        bypassCSP: true,
      });
      console.log('✅ Context creat');

      this.page = await context.newPage();
      console.log('✅ Pagină creată\n');

      // Ascultă toate erorile din consolă
      this.setupErrorListeners();
      console.log('👂 Event listeners configurați\n');

      console.log('🔍 Încep scanarea paginilor...\n');
      // Testează fiecare pagină
      for (const route of this.routes) {
        await this.testPage(route);
        await this.wait(1500); // Așteaptă între pagini
      }

      // Generează raportul
      await this.generateReport();

    } catch (error) {
      console.error('❌ Eroare fatală:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  setupErrorListeners() {
    // Capturează erori JavaScript din consolă
    this.page.on('console', async (msg) => {
      const type = msg.type();
      const text = msg.text();

      // Capturează doar erorile
      if (type === 'error' && (
        text.includes('ReferenceError') ||
        text.includes('is not defined') ||
        text.includes('TypeError') ||
        text.includes('Uncaught')
      )) {
        await this.captureError(text, this.page.url());
      }
    });

    // Capturează page errors
    this.page.on('pageerror', async (error) => {
      await this.captureError(error.message, this.page.url());
    });

    // Capturează request failures
    this.page.on('requestfailed', (request) => {
      console.log(`⚠️  Request failed: ${request.url()}`);
    });
  }

  async captureError(errorText, url) {
    // Extrage informații din eroare
    const urlPath = url.replace(this.baseUrl, '');

    // Parse error pentru detalii
    const patterns = {
      variable: /(\w+) is not defined/,
      file: /at\s+(\w+\.tsx?):/,
      line: /:(\d+):/,
      referenceError: /ReferenceError:\s*(.+?)(?:\n|$)/,
    };

    const errorInfo = {
      page: urlPath || 'unknown',
      fullError: errorText,
      variable: errorText.match(patterns.variable)?.[1] || 'Unknown',
      file: errorText.match(patterns.file)?.[1] || 'Unknown',
      line: errorText.match(patterns.line)?.[1] || 'Unknown',
      timestamp: new Date().toISOString(),
      url: url,
    };

    // Nu duplica erorile
    const exists = this.errors.some(e =>
      e.page === errorInfo.page &&
      e.variable === errorInfo.variable &&
      e.file === errorInfo.file
    );

    if (!exists) {
      this.errors.push(errorInfo);
      console.log(`🐛 Eroare găsită: ${errorInfo.variable} în ${errorInfo.file}:${errorInfo.line}`);
    }
  }

  async testPage(route) {
    const fullUrl = this.baseUrl + route;
    console.log(`\n🔍 Testez: ${route}`);

    try {
      // Verifică dacă pagina există înainte să navigăm
      const healthCheckUrl = this.baseUrl.replace('/admin-vite', '/health');
      const healthResponse = await fetch(healthCheckUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Playwright-Error-Scanner/1.0'
        }
      }).catch(() => null);

      if (!healthResponse || !healthResponse.ok) {
        console.log(`⚠️  ${route} - Server indisponibil, sar peste`);
        this.testedPages.push({
          route,
          status: 'skipped',
          reason: 'Server unavailable'
        });
        return;
      }

      // Navighează la pagină cu timeout mai mare
      const response = await this.page.goto(fullUrl, {
        waitUntil: 'domcontentloaded', // Mai puțin strict decât 'networkidle'
        timeout: 45000,
      });

      if (!response) {
        console.log(`❌ ${route} - Niciun răspuns de la server`);
        this.testedPages.push({
          route,
          status: 'error',
          error: 'No response from server'
        });
        return;
      }

      if (!response.ok() && response.status() !== 404) {
        console.log(`❌ ${route} - Status HTTP: ${response.status()}`);
        this.testedPages.push({
          route,
          status: response.status(),
          error: `HTTP ${response.status()}`
        });
        return;
      }

      // Așteaptă ca React să se încarce, dar cu timeout mai scurt
      await this.page.waitForTimeout(3000);

      // Verifică dacă există ErrorBoundary sau alte erori vizibile
      const pageStatus = await this.page.evaluate(() => {
        const hasErrorBoundary = document.body.textContent.includes('ErrorBoundary') ||
          document.body.textContent.includes('Something went wrong') ||
          document.body.textContent.includes('Error:');

        const hasLoadingError = document.body.textContent.includes('Failed to load') ||
          document.body.textContent.includes('Network Error') ||
          document.body.textContent.includes('Connection failed');

        const hasAuthError = document.body.textContent.includes('Unauthorized') ||
          document.body.textContent.includes('403') ||
          document.body.textContent.includes('Forbidden');

        return {
          hasErrorBoundary,
          hasLoadingError,
          hasAuthError,
          title: document.title,
          bodyText: document.body.textContent.substring(0, 200)
        };
      });

      if (pageStatus.hasErrorBoundary || pageStatus.hasLoadingError) {
        console.log(`⚠️  ${route} - Detectat eroare în UI`);
        console.log(`   Text găsit: "${pageStatus.bodyText.replace(/\n/g, ' ')}"`);

        // Face screenshot la eroare
        const screenshotPath = `./error-screenshots/${route.replace(/\//g, '_')}.png`;
        await this.page.screenshot({
          path: screenshotPath,
          fullPage: true
        }).catch(() => {
          console.log(`⚠️  Nu am putut face screenshot pentru ${route}`);
        });
        this.screenshots.push(screenshotPath);

        this.testedPages.push({
          route,
          status: 'ui_error',
          error: pageStatus.hasErrorBoundary ? 'ErrorBoundary detected' : 'Loading/Network error detected',
          title: pageStatus.title
        });
        return;
      }

      if (pageStatus.hasAuthError) {
        console.log(`🔒 ${route} - Eroare de autentificare`);
        this.testedPages.push({
          route,
          status: 'auth_error',
          error: 'Authentication/Authorization error'
        });
        return;
      }

      // Verifică dacă pagina s-a încărcat corect (are conținut)
      if (!pageStatus.title || pageStatus.title.includes('Error') || pageStatus.bodyText.length < 50) {
        console.log(`⚠️  ${route} - Pagină goală sau eronată`);
        this.testedPages.push({
          route,
          status: 'empty_page',
          error: 'Page appears empty or malformed',
          title: pageStatus.title
        });
        return;
      }

      this.testedPages.push({
        route,
        status: response.status(),
        title: pageStatus.title
      });
      console.log(`✅ ${route} - OK (${response.status()})`);

    } catch (error) {
      console.log(`❌ ${route} - Eroare: ${error.message}`);

      // Nu crash-ui serverul - continuăm cu următoarea pagină
      this.testedPages.push({
        route,
        status: 'error',
        error: error.message
      });

      // Așteaptă un pic înainte să continuăm, pentru a nu suprasolicita serverul
      await this.wait(2000);
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateReport() {
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 RAPORT FINAL - SCANARE COMPLETĂ');
    console.log('='.repeat(80) + '\n');

    // Creează folder pentru screenshots dacă nu există
    if (!fs.existsSync('./error-screenshots')) {
      fs.mkdirSync('./error-screenshots');
    }

    // Statistici
    console.log(`📄 Pagini testate: ${this.testedPages.length}`);
    console.log(`🐛 Erori găsite: ${this.errors.length}`);
    console.log(`📸 Screenshots: ${this.screenshots.length}\n`);

    if (this.errors.length === 0) {
      console.log('✅ Nicio eroare găsită! Toate paginile funcționează corect.');
      return;
    }

    // Grupează erorile după variabilă
    const groupedErrors = this.errors.reduce((acc, error) => {
      const key = error.variable;
      if (!acc[key]) acc[key] = [];
      acc[key].push(error);
      return acc;
    }, {});

    console.log('🔴 ERORI GRUPATE:\n');

    Object.entries(groupedErrors).forEach(([variable, errors]) => {
      console.log(`\n❌ Variabila nedefinită: "${variable}"`);
      console.log(`   Apare în ${errors.length} locuri:\n`);

      errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.file}:${err.line}`);
        console.log(`      Pagina: ${err.page}`);
      });
    });

    // Salvează raportul ca JSON
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPages: this.testedPages.length,
        totalErrors: this.errors.length,
        screenshots: this.screenshots.length,
      },
      testedPages: this.testedPages,
      errors: this.errors,
      groupedErrors: groupedErrors,
    };

    const reportPath = './error-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Raport salvat în: ${reportPath}`);

    // Generează raport Markdown
    await this.generateMarkdownReport(groupedErrors);

    // Generează comenzi de reparare
    this.generateFixCommands(groupedErrors);
  }

  async generateMarkdownReport(groupedErrors) {
    let markdown = `# 🔬 Admin Vite - Raport Erori\n\n`;
    markdown += `**Data:** ${new Date().toLocaleString('ro-RO')}\n\n`;
    markdown += `## 📊 Sumar\n\n`;
    markdown += `- **Pagini testate:** ${this.testedPages.length}\n`;
    markdown += `- **Erori găsite:** ${this.errors.length}\n`;
    markdown += `- **Screenshots:** ${this.screenshots.length}\n\n`;

    markdown += `## 🐛 Erori Detaliate\n\n`;

    Object.entries(groupedErrors).forEach(([variable, errors]) => {
      markdown += `### ❌ \`${variable}\` is not defined\n\n`;
      markdown += `Apare în **${errors.length}** locuri:\n\n`;

      errors.forEach((err, idx) => {
        markdown += `${idx + 1}. **${err.file}:${err.line}**\n`;
        markdown += `   - Pagina: \`${err.page}\`\n`;
        markdown += `   - URL: ${err.url}\n\n`;
      });
    });

    markdown += `## 📋 Pagini Testate\n\n`;
    this.testedPages.forEach(page => {
      const icon = page.status === 'error' ? '❌' : '✅';
      markdown += `${icon} \`${page.route}\` - Status: ${page.status}\n`;
    });

    fs.writeFileSync('./error-report.md', markdown);
    console.log(`📄 Raport Markdown salvat în: ./error-report.md`);
  }

  generateFixCommands(groupedErrors) {
    console.log('\n\n' + '='.repeat(80));
    console.log('🔧 COMENZI PENTRU REPARARE');
    console.log('='.repeat(80) + '\n');

    Object.keys(groupedErrors).forEach(variable => {
      console.log(`# Pentru variabila: ${variable}`);
      console.log(`grep -rn "\\b${variable}\\b" src/ --include="*.tsx" --include="*.ts"`);
      console.log('');
    });

    console.log('\n💡 Următorii pași:');
    console.log('1. Verifică error-report.json pentru detalii complete');
    console.log('2. Verifică error-report.md pentru un raport lizibil');
    console.log('3. Verifică ./error-screenshots/ pentru capturi de ecran');
    console.log('4. Rulează comenzile grep de mai sus pentru a găsi variabilele\n');
  }
}

// ====================================================================
// CONFIGURARE ȘI RULARE
// ====================================================================

async function main() {
  const scanner = new AdminViteErrorScanner({
    baseUrl: 'http://localhost:3001/admin-vite',
    // Adaugă mai multe rute aici dacă este necesar
  });

  await scanner.init();

  console.log('\n✅ Scanare completă!\n');
  process.exit(0);
}

// Rulează scriptul
main().catch(error => {
  console.error('❌ Eroare fatală:', error);
  process.exit(1);
});

// ES Module export (optional)
// export { AdminViteErrorScanner };