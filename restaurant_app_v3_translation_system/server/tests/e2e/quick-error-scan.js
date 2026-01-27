/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK ERROR SCAN - Admin-Vite Critical Issues Detection
 *
 * Scanare rapidă pentru erori critice în toate paginile admin-vite
 * ═══════════════════════════════════════════════════════════════════════════
 */

const puppeteer = require('puppeteer');

// Liste reduse pentru scanare rapidă
const CRITICAL_PAGES = [
  // Pagini esențiale
  { path: 'welcome', name: 'Welcome', category: 'main' },
  { path: 'dashboard', name: 'Dashboard', category: 'main' },
  { path: 'orders', name: 'Orders', category: 'orders' },
  { path: 'menu', name: 'Menu', category: 'management' },
  { path: 'stocks', name: 'Stocks', category: 'management' },
  { path: 'settings', name: 'Settings', category: 'settings' },

  // Pagini enterprise
  { path: 'reports', name: 'Reports', category: 'reports' },
  { path: 'compliance', name: 'Compliance', category: 'enterprise' },
  { path: 'backup', name: 'Backup', category: 'enterprise' },

  // Pagini admin
  { path: 'audit/logs', name: 'Audit Logs', category: 'audit' },
  { path: 'admin-advanced/dashboard', name: 'Admin Dashboard', category: 'admin-advanced' },
];

const BASE_URL = 'http://localhost:3001/admin-vite';

async function quickErrorScan() {
  console.log('🔍 Starting Quick Error Scan for Admin-Vite...');
  console.log(`📋 Testing ${CRITICAL_PAGES.length} critical pages`);
  console.log('');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const allErrors = [];
  const allIssues = [];

  try {
    for (let i = 0; i < CRITICAL_PAGES.length; i++) {
      const pageInfo = CRITICAL_PAGES[i];
      const page = await browser.newPage();

      console.log(`[${i + 1}/${CRITICAL_PAGES.length}] Testing: ${pageInfo.name}`);

      // Capture errors
      const errors = [];
      const networkErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push({
            level: 'error',
            message: msg.text(),
            timestamp: new Date().toISOString()
          });
        }
      });

      page.on('response', response => {
        if (!response.ok() && response.status() >= 400) {
          networkErrors.push({
            status: response.status(),
            url: response.url(),
            timestamp: new Date().toISOString()
          });
        }
      });

      try {
        const url = `${BASE_URL}/${pageInfo.path}`;
        console.log(`   URL: ${url}`);

        // Navigate with short timeout
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });

        // Wait minimal time
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check basic page health
        const healthCheck = await page.evaluate(() => {
          return {
            hasReact: !!window.React,
            hasBody: document.body.innerHTML.length > 100,
            hasTitle: document.title.length > 0,
            hasErrors: document.querySelectorAll('.error, [class*="error"]').length > 0,
            hasLoading: document.querySelectorAll('[class*="loading"], [class*="spinner"]').length > 0
          };
        });

        console.log(`   ✅ Loaded: ${healthCheck.hasBody ? 'YES' : 'NO'}`);
        console.log(`   🚨 Errors: ${errors.length}, Network: ${networkErrors.length}`);

        if (errors.length > 0 || networkErrors.length > 0 || !healthCheck.hasBody) {
          allIssues.push({
            page: pageInfo.path,
            name: pageInfo.name,
            category: pageInfo.category,
            url: url,
            consoleErrors: errors,
            networkErrors: networkErrors,
            healthCheck: healthCheck,
            severity: errors.length > 0 ? 'high' : networkErrors.length > 0 ? 'medium' : 'low'
          });
        }

      } catch (error) {
        console.log(`   ❌ FAILED: ${error.message}`);

        allIssues.push({
          page: pageInfo.path,
          name: pageInfo.name,
          category: pageInfo.category,
          url: `${BASE_URL}/${pageInfo.path}`,
          error: error.message,
          severity: 'critical'
        });
      }

      await page.close();
    }

  } finally {
    await browser.close();
  }

  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('📊 QUICK ERROR SCAN REPORT');
  console.log('='.repeat(60));

  console.log(`\n🔍 Pages scanned: ${CRITICAL_PAGES.length}`);
  console.log(`🚨 Issues found: ${allIssues.length}`);

  if (allIssues.length > 0) {
    console.log('\n🚨 ISSUES DETECTED:');

    // Group by severity
    const critical = allIssues.filter(i => i.severity === 'critical');
    const high = allIssues.filter(i => i.severity === 'high');
    const medium = allIssues.filter(i => i.severity === 'medium');
    const low = allIssues.filter(i => i.severity === 'low');

    if (critical.length > 0) {
      console.log(`\n🔴 CRITICAL ISSUES (${critical.length}):`);
      critical.forEach(issue => {
        console.log(`   ❌ ${issue.name} (${issue.page}): ${issue.error || 'Page failed to load'}`);
      });
    }

    if (high.length > 0) {
      console.log(`\n🟠 HIGH PRIORITY (${high.length}):`);
      high.forEach(issue => {
        console.log(`   ⚠️  ${issue.name} (${issue.page}): ${issue.consoleErrors?.length || 0} console errors`);
      });
    }

    if (medium.length > 0) {
      console.log(`\n🟡 MEDIUM PRIORITY (${medium.length}):`);
      medium.forEach(issue => {
        console.log(`   📡 ${issue.name} (${issue.page}): ${issue.networkErrors?.length || 0} network errors`);
      });
    }

    if (low.length > 0) {
      console.log(`\n🟢 LOW PRIORITY (${low.length}):`);
      low.forEach(issue => {
        console.log(`   ℹ️  ${issue.name} (${issue.page}): Minor issues`);
      });
    }

    console.log('\n💡 RECOMMENDATIONS:');
    console.log('   1. Fix critical page loading issues first');
    console.log('   2. Address console errors (JavaScript/TypeScript)');
    console.log('   3. Check network requests for 4xx/5xx errors');
    console.log('   4. Verify React components are rendering properly');

  } else {
    console.log('\n✅ NO ISSUES DETECTED!');
    console.log('   All critical pages loaded successfully.');
  }

  console.log('\n' + '='.repeat(60));

  // Save detailed report
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, '../../reports/quick-error-scan-report.json');

  const reportsDir = path.dirname(reportPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      pagesScanned: CRITICAL_PAGES.length,
      issuesFound: allIssues.length,
      criticalIssues: allIssues.filter(i => i.severity === 'critical').length,
      highIssues: allIssues.filter(i => i.severity === 'high').length,
      mediumIssues: allIssues.filter(i => i.severity === 'medium').length,
      lowIssues: allIssues.filter(i => i.severity === 'low').length
    },
    issues: allIssues
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`💾 Detailed report saved: ${reportPath}`);

  return allIssues;
}

// Run the scan
if (require.main === module) {
  quickErrorScan()
    .then(issues => {
      console.log(`\n✅ Scan completed. Found ${issues.length} issues.`);
      process.exit(issues.length > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Scan failed:', error);
      process.exit(1);
    });
}

module.exports = { quickErrorScan, CRITICAL_PAGES };