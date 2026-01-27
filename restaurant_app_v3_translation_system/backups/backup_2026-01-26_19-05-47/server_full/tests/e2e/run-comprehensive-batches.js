/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BATCH RUNNER - Admin-Vite Comprehensive Tests
 *
 * Rulează testele comprehensive în batch-uri mai mici pentru a evita timeout
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Citește structura meniului din testul principal
const MENU_STRUCTURE = [
  // MENIU PRINCIPAL
  { path: 'welcome', name: '🏠 Acasă/Welcome', category: 'main' },
  { path: 'dashboard', name: '📊 Dashboard', category: 'main' },
  { path: 'dashboard/monitoring', name: '📈 Dashboard Monitoring', category: 'main' },
  { path: 'monitoring/performance', name: '💻 Monitoring Performance', category: 'monitoring' },
  { path: 'monitoring/health', name: '⚙️ Monitoring Health', category: 'monitoring' },
  { path: 'executive-dashboard', name: '📊 Executive Dashboard', category: 'main' },
  { path: 'platform-sync', name: '🔄 Platform Sync', category: 'main' },

  // MENIU COMENZI
  { path: 'orders', name: '🧾 Orders Management', category: 'orders' },
  { path: 'orders/manage', name: '📋 Manage Orders', category: 'orders' },
  { path: 'orders/history', name: '📖 Orders History', category: 'orders' },
  { path: 'orders/delivery', name: '🚚 Delivery Orders', category: 'orders' },
  { path: 'orders/drive-thru', name: '🚗 Drive-Thru Orders', category: 'orders' },
  { path: 'orders/takeaway', name: '🥡 Takeaway Orders', category: 'orders' },
  { path: 'orders/cancellations', name: '❌ Order Cancellations', category: 'orders' },

  // MENIU GESTIUNE
  { path: 'menu', name: '🍽️ Menu Management', category: 'management' },
  { path: 'catalog', name: '📋 Catalog', category: 'management' },
  { path: 'catalog/online', name: '🌐 Catalog Online', category: 'management' },
  { path: 'ingredients', name: '🥕 Ingredients', category: 'management' },
  { path: 'stocks', name: '📦 Stocks Management', category: 'management' },
  { path: 'stocks/allergens', name: '⚠️ Allergens', category: 'management' },
  { path: 'stocks/labels', name: '🏷️ Labels', category: 'management' },
  { path: 'stocks/costs', name: '💰 Stock Costs', category: 'management' },
  { path: 'stocks/risk-alerts', name: '🚨 Risk Alerts', category: 'management' },
  { path: 'stocks/suppliers', name: '🏭 Suppliers', category: 'management' },
  { path: 'stocks/suppliers/orders', name: '📋 Supplier Orders', category: 'management' },
  { path: 'stocks/inventory/dashboard', name: '📊 Inventory Dashboard', category: 'management' },
  { path: 'stocks/inventory/multi', name: '🔄 Multi Inventory', category: 'management' },
  { path: 'stocks/inventory/import', name: '📥 Import Inventory', category: 'management' },

  // MENIU CONTABILITATE
  { path: 'accounting/reports/vat', name: '📊 VAT Report', category: 'accounting' },
  { path: 'accounting/reports/client-payments', name: '💳 Client Payments', category: 'accounting' },
  { path: 'accounting/reports/suppliers', name: '🏭 Supplier Reports', category: 'accounting' },
  { path: 'accounting/reports/consumption', name: '🍽️ Consumption Report', category: 'accounting' },
  { path: 'accounting/reports/entries', name: '📝 Entries by VAT', category: 'accounting' },
  { path: 'accounting/reports/stock-balance', name: '⚖️ Stock Balance', category: 'accounting' },
  { path: 'accounting/reports/daily-balance', name: '📅 Daily Balance', category: 'accounting' },
  { path: 'accounting/settings/accounts', name: '⚙️ Accounting Accounts', category: 'accounting' },
  { path: 'accounting/settings/product-mapping', name: '🔗 Product Mapping', category: 'accounting' },
  { path: 'accounting/settings/periods', name: '📆 Accounting Periods', category: 'accounting' },
  { path: 'accounting/settings/bank-accounts', name: '🏦 Bank Accounts', category: 'accounting' },
  { path: 'accounting/settings/permissions', name: '🔐 Accounting Permissions', category: 'accounting' },
  { path: 'accounting/settings/export', name: '📤 Accounting Export', category: 'accounting' },
  { path: 'accounting/audit/signatures', name: '✍️ Digital Signatures', category: 'accounting' },

  // MENIU CATALOG
  { path: 'recipes', name: '👨‍🍳 Recipes', category: 'catalog' },
  { path: 'daily-menu', name: '📅 Daily Menu', category: 'catalog' },
  { path: 'lots', name: '📦 Lots', category: 'catalog' },
  { path: 'traceability', name: '🔍 Traceability', category: 'catalog' },
  { path: 'menu-pdf', name: '📄 Menu PDF Builder', category: 'catalog' },

  // MENIU RAPOARTE
  { path: 'reports', name: '📊 Reports', category: 'reports' },
  { path: 'reports/profit-loss', name: '💰 Profit & Loss', category: 'reports' },
  { path: 'reports/abc-analysis', name: '📈 ABC Analysis', category: 'reports' },
  { path: 'reports/staff', name: '👥 Staff Reports', category: 'reports' },
  { path: 'reports/advanced', name: '🔬 Advanced Reports', category: 'reports' },
  { path: 'reports/sales', name: '💸 Sales Reports', category: 'reports' },
  { path: 'reports/stock', name: '📦 Stock Reports', category: 'reports' },
  { path: 'reports/delivery-performance', name: '🚚 Delivery Performance', category: 'reports' },
  { path: 'reports/drive-thru-performance', name: '🚗 Drive-Thru Performance', category: 'reports' },
  { path: 'reports/top-products', name: '🥇 Top Products', category: 'reports' },
  { path: 'reports/financial', name: '💵 Financial Reports', category: 'reports' },

  // MENIU ENTERPRISE
  { path: 'production/batches', name: '🏭 Production Batches', category: 'enterprise' },
  { path: 'backup', name: '💾 Backup', category: 'enterprise' },
  { path: 'waiters', name: '👥 Waiters', category: 'enterprise' },
  { path: 'queue-monitor', name: '📋 Queue Monitor', category: 'enterprise' },
  { path: 'compliance', name: '✅ Compliance', category: 'enterprise' },
  { path: 'compliance/haccp', name: '🦠 HACCP Dashboard', category: 'enterprise' },
  { path: 'compliance/haccp/processes', name: '🔄 HACCP Processes', category: 'enterprise' },
  { path: 'compliance/haccp/monitoring', name: '📊 HACCP Monitoring', category: 'enterprise' },
  { path: 'compliance/haccp/corrective-actions', name: '🔧 HACCP Corrective Actions', category: 'enterprise' },

  // MENIU MARKETING
  { path: 'marketing', name: '📱 Marketing', category: 'marketing' },
  { path: 'internal-messaging', name: '💬 Internal Messaging', category: 'marketing' },

  // MENIU SETARI
  { path: 'settings', name: '⚙️ Settings', category: 'settings' },
  { path: 'tables', name: '🪑 Tables', category: 'settings' },
  { path: 'settings/locations', name: '📍 Locations', category: 'settings' },

  // MENIU FISCAL
  { path: 'fiscal/invoices', name: '📄 Invoices', category: 'fiscal' },
  { path: 'fiscal/vat-rates', name: '💰 VAT Rates', category: 'fiscal' },

  // MENIU AUDIT & SECURITY
  { path: 'audit/logs', name: '📋 Audit Logs', category: 'audit' },
  { path: 'audit/alerts', name: '🚨 Security Alerts', category: 'audit' },
  { path: 'audit/login-history', name: '🔑 Login History', category: 'audit' },
  { path: 'audit/user-activity', name: '👤 User Activity', category: 'audit' },
  { path: 'audit/security', name: '🛡️ Security Events', category: 'audit' },

  // MENIU ADMIN ADVANCED
  { path: 'admin-advanced/dashboard', name: '🎛️ Admin Dashboard', category: 'admin-advanced' },
  { path: 'admin-advanced/queue-monitor', name: '📊 Queue Monitor Advanced', category: 'admin-advanced' },
  { path: 'admin-advanced/inventory', name: '📦 Advanced Inventory', category: 'admin-advanced' },
  { path: 'admin-advanced/transfers', name: '🔄 Stock Transfers', category: 'admin-advanced' },
  { path: 'admin-advanced/multi-inventory', name: '📊 Multi Inventory', category: 'admin-advanced' },
  { path: 'admin-advanced/portion-control', name: '⚖️ Portion Control', category: 'admin-advanced' },
  { path: 'admin-advanced/variance-reports', name: '📈 Variance Reports', category: 'admin-advanced' },
  { path: 'admin-advanced/units-of-measure', name: '📏 Units of Measure', category: 'admin-advanced' },
  { path: 'admin-advanced/price-utilities', name: '💲 Price Utilities', category: 'admin-advanced' },
  { path: 'admin-advanced/attribute-groups', name: '🏷️ Attribute Groups', category: 'admin-advanced' },
  { path: 'admin-advanced/smart-restock', name: '🧠 Smart Restock', category: 'admin-advanced' },
  { path: 'admin-advanced/employee-scheduling', name: '👥 Employee Scheduling', category: 'admin-advanced' },
  { path: 'admin-advanced/auto-purchase-orders', name: '🤖 Auto Purchase Orders', category: 'admin-advanced' },
  { path: 'admin-advanced/hostess-map', name: '🗺️ Hostess Map', category: 'admin-advanced' },
  { path: 'admin-advanced/coatroom', name: '👕 Coatroom', category: 'admin-advanced' },
  { path: 'admin-advanced/lost-found', name: '🔍 Lost & Found', category: 'admin-advanced' },
  { path: 'admin-advanced/hostess-dashboard', name: '👩 Hostess Dashboard', category: 'admin-advanced' },
  { path: 'admin-advanced/coatroom-dashboard', name: '👕 Coatroom Dashboard', category: 'admin-advanced' },
  { path: 'admin-advanced/lost-found-dashboard', name: '🔍 Lost & Found Dashboard', category: 'admin-advanced' },
  { path: 'admin-advanced/platform-stats', name: '📊 Platform Stats', category: 'admin-advanced' },
  { path: 'admin-advanced/menu-engineering', name: '🍽️ Menu Engineering', category: 'admin-advanced' },
  { path: 'admin-advanced/gift-cards', name: '🎁 Gift Cards', category: 'admin-advanced' },
  { path: 'admin-advanced/forecast', name: '🌤️ Weather Forecast', category: 'admin-advanced' },
  { path: 'admin-advanced/competitor-tracking', name: '🏪 Competitor Tracking', category: 'admin-advanced' },
  { path: 'admin-advanced/profitability', name: '💰 Profitability Dashboard', category: 'admin-advanced' },
  { path: 'admin-advanced/technical-sheets', name: '📋 Technical Sheets', category: 'admin-advanced' },
  { path: 'admin-advanced/portions', name: '🍽️ Portions', category: 'admin-advanced' },
  { path: 'admin-advanced/recalls', name: '🚨 Recalls', category: 'admin-advanced' },
  { path: 'admin-advanced/expiry-alerts', name: '⏰ Expiry Alerts', category: 'admin-advanced' },
  { path: 'admin-advanced/menu-builder', name: '🏗️ Menu Builder', category: 'admin-advanced' },
  { path: 'admin-advanced/admin-diagnostics', name: '🔧 Admin Diagnostics', category: 'admin-advanced' },
  { path: 'admin-advanced/training', name: '🎓 Training', category: 'admin-advanced' },

  // PAGINI SPECIALE
  { path: 'archive', name: '📚 Archive', category: 'special' },
  { path: 'training', name: '🎓 Training', category: 'special' },
  { path: 'documentation', name: '📖 Documentation', category: 'special' },
];

// Împarte în batch-uri de câte 20 de pagini
const BATCH_SIZE = 20;
const batches = [];

for (let i = 0; i < MENU_STRUCTURE.length; i += BATCH_SIZE) {
  batches.push(MENU_STRUCTURE.slice(i, i + BATCH_SIZE));
}

console.log(`📦 Created ${batches.length} batches of ${BATCH_SIZE} pages each`);
console.log(`📊 Total pages: ${MENU_STRUCTURE.length}`);

async function runBatch(batchIndex, batch) {
  return new Promise((resolve, reject) => {
    console.log(`\n🏃 Running batch ${batchIndex + 1}/${batches.length} (${batch.length} pages)`);

    // Creează un script temporar pentru acest batch
    const batchScript = `
const { MENU_STRUCTURE } = require('./admin-vite-comprehensive.test.js');

// Suprascrie MENU_STRUCTURE cu batch-ul curent
global.MENU_STRUCTURE_OVERRIDE = ${JSON.stringify(batch, null, 2)};

// Rulează testul
require('./admin-vite-comprehensive.test.js');
`;

    const batchFile = path.join(__dirname, `batch-${batchIndex}.js`);
    fs.writeFileSync(batchFile, batchScript);

    const testProcess = exec(`npx playwright test ${batchFile} --timeout=60000`, {
      cwd: __dirname,
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    let output = '';
    let errorOutput = '';

    testProcess.stdout.on('data', (data) => {
      output += data;
      process.stdout.write(data);
    });

    testProcess.stderr.on('data', (data) => {
      errorOutput += data;
      process.stderr.write(data);
    });

    testProcess.on('close', (code) => {
      // Șterge fișierul temporar
      try {
        fs.unlinkSync(batchFile);
      } catch (e) {
        // Ignore errors when deleting temp file
      }

      if (code === 0) {
        console.log(`✅ Batch ${batchIndex + 1} completed successfully`);
        resolve({ batchIndex, success: true, output, errorOutput });
      } else {
        console.log(`❌ Batch ${batchIndex + 1} failed with code ${code}`);
        resolve({ batchIndex, success: false, code, output, errorOutput });
      }
    });

    testProcess.on('error', (error) => {
      try {
        fs.unlinkSync(batchFile);
      } catch (e) {
        // Ignore errors when deleting temp file
      }
      reject(error);
    });

    // Timeout după 2 minute per batch
    setTimeout(() => {
      testProcess.kill();
      try {
        fs.unlinkSync(batchFile);
      } catch (e) {
        // Ignore errors when deleting temp file
      }
      resolve({ batchIndex, success: false, timeout: true, output, errorOutput });
    }, 120000);
  });
}

async function runAllBatches() {
  console.log('🚀 Starting Admin-Vite Comprehensive Batch Testing');
  console.log('=' .repeat(60));

  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < batches.length; i++) {
    try {
      const result = await runBatch(i, batches[i]);
      results.push(result);

      // Pauză scurtă între batch-uri
      if (i < batches.length - 1) {
        console.log('⏳ Waiting 5 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.log(`💥 Critical error in batch ${i + 1}:`, error.message);
      results.push({ batchIndex: i, success: false, error: error.message });
    }
  }

  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;

  console.log('\n' + '='.repeat(60));
  console.log('📊 BATCH TESTING RESULTS');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`⏱️  Total time: ${totalTime.toFixed(1)} seconds`);
  console.log(`📦 Batches run: ${results.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success rate: ${((successful / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ FAILED BATCHES:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   Batch ${result.batchIndex + 1}: ${result.timeout ? 'TIMEOUT' : result.code ? `CODE ${result.code}` : result.error || 'UNKNOWN'}`);
    });
  }

  // Salvează rezultatele detaliate
  const reportPath = path.join(__dirname, '../../reports/batch-test-results.json');
  const reportsDir = path.dirname(reportPath);

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalTime,
    batches: results.length,
    successful,
    failed,
    results
  }, null, 2));

  console.log(`\n💾 Detailed report saved: ${reportPath}`);

  if (failed === 0) {
    console.log('\n🎉 ALL BATCHES PASSED! Admin-Vite is fully functional!');
  } else {
    console.log(`\n⚠️  ${failed} batches failed. Check the detailed report for issues.`);
  }

  return results;
}

// Run the batch testing
if (require.main === module) {
  runAllBatches()
    .then(() => {
      console.log('\n🏁 Batch testing completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Batch testing failed:', error);
      process.exit(1);
    });
}

module.exports = { runAllBatches, batches };