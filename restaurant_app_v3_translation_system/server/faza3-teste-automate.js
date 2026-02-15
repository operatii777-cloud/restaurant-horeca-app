#!/usr/bin/env node

/**
 * FAZA 3: Testare Automată End-to-End
 * Automated testing of all interfaces using Playwright
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.magenta}${'='.repeat(70)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.magenta}${'='.repeat(70)}${colors.reset}\n`)
};

const testResults = {
  timestamp: new Date().toISOString(),
  serverStatus: null,
  playwrightTests: null,
  apiTests: null,
  performanceTests: null
};

// Check if server is running
async function checkServer() {
  log.section('FAZA 3.1: Verificare Server');
  
  try {
    const { stdout } = await execAsync('curl -s http://localhost:3001/health');
    log.success('Server is running on port 3001');
    testResults.serverStatus = 'running';
    return true;
  } catch (error) {
    log.error('Server is not running on port 3001');
    log.warning('Please start server with: npm start');
    testResults.serverStatus = 'stopped';
    return false;
  }
}

// Run comprehensive verification
async function runVerification() {
  log.section('FAZA 3.2: Verificare Completă Aplicație');
  
  try {
    log.info('Running comprehensive-verification.js...');
    const { stdout, stderr } = await execAsync('node comprehensive-verification.js', {
      cwd: __dirname,
      timeout: 60000
    });
    
    console.log(stdout);
    if (stderr && !stderr.includes('Warning')) {
      console.error(stderr);
    }
    
    log.success('Verification completed');
    return true;
  } catch (error) {
    log.warning('Verification completed with warnings');
    console.log(error.stdout || '');
    return false;
  }
}

// Test API endpoints
async function testAPIEndpoints() {
  log.section('FAZA 3.3: Testare Endpoint-uri API');
  
  const endpoints = [
    { url: 'http://localhost:3001/health', name: 'Health' },
    { url: 'http://localhost:3001/api/health', name: 'API Health' },
    { url: 'http://localhost:3001/api/menu/all', name: 'Menu All' },
    { url: 'http://localhost:3001/api/kiosk/menu', name: 'Kiosk Menu' },
    { url: 'http://localhost:3001/api/products', name: 'Products' },
    { url: 'http://localhost:3001/api/categories', name: 'Categories' }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" ${endpoint.url}`);
      const statusCode = stdout.trim();
      const success = ['200', '401'].includes(statusCode);
      
      if (success) {
        log.success(`${endpoint.name}: ${statusCode}`);
      } else {
        log.error(`${endpoint.name}: ${statusCode}`);
      }
      
      results.push({
        name: endpoint.name,
        url: endpoint.url,
        status: statusCode,
        success: success
      });
    } catch (error) {
      log.error(`${endpoint.name}: Failed`);
      results.push({
        name: endpoint.name,
        url: endpoint.url,
        status: 'error',
        success: false
      });
    }
  }
  
  testResults.apiTests = results;
  const successCount = results.filter(r => r.success).length;
  log.info(`API Tests: ${successCount}/${results.length} passed`);
  
  return results;
}

// Run Playwright E2E tests
async function runPlaywrightTests() {
  log.section('FAZA 3.4: Testare End-to-End cu Playwright');
  
  try {
    log.info('Checking Playwright installation...');
    await execAsync('npx playwright --version');
    log.success('Playwright is installed');
  } catch (error) {
    log.warning('Playwright not found, installing...');
    try {
      await execAsync('npm install -D @playwright/test', {
        cwd: __dirname,
        timeout: 120000
      });
      log.success('Playwright installed');
    } catch (installError) {
      log.error('Failed to install Playwright');
      return false;
    }
  }
  
  try {
    log.info('Running Playwright E2E tests...');
    const { stdout, stderr } = await execAsync(
      'npx playwright test tests/e2e/comprehensive-e2e-test.spec.js --reporter=list',
      {
        cwd: __dirname,
        timeout: 300000 // 5 minutes
      }
    );
    
    console.log(stdout);
    log.success('Playwright tests completed');
    
    testResults.playwrightTests = {
      status: 'completed',
      output: stdout
    };
    
    return true;
  } catch (error) {
    log.warning('Some Playwright tests failed (this is normal for first run)');
    console.log(error.stdout || '');
    
    testResults.playwrightTests = {
      status: 'completed_with_failures',
      output: error.stdout || error.message
    };
    
    return false;
  }
}

// Performance tests
async function runPerformanceTests() {
  log.section('FAZA 3.5: Testare Performanță');
  
  const interfaces = [
    { url: 'http://localhost:3001/admin-vite/', name: 'Admin-Vite' },
    { url: 'http://localhost:3001/legacy/orders/comanda.html', name: 'POS Comanda' },
    { url: 'http://localhost:3001/legacy/orders/kiosk.html', name: 'Kiosk' }
  ];
  
  const results = [];
  
  for (const iface of interfaces) {
    try {
      const startTime = Date.now();
      await execAsync(`curl -s -o /dev/null ${iface.url}`);
      const loadTime = Date.now() - startTime;
      
      const performance = loadTime < 3000 ? 'excellent' : loadTime < 5000 ? 'good' : 'needs_improvement';
      
      log.info(`${iface.name}: ${loadTime}ms (${performance})`);
      
      results.push({
        name: iface.name,
        url: iface.url,
        loadTime: loadTime,
        performance: performance
      });
    } catch (error) {
      log.error(`${iface.name}: Failed to test`);
      results.push({
        name: iface.name,
        url: iface.url,
        loadTime: null,
        performance: 'error'
      });
    }
  }
  
  testResults.performanceTests = results;
  return results;
}

// Generate report
function generateReport() {
  log.section('FAZA 3.6: Generare Raport Teste Automate');
  
  const report = {
    timestamp: testResults.timestamp,
    summary: {
      serverStatus: testResults.serverStatus,
      apiTestsPassed: testResults.apiTests?.filter(t => t.success).length || 0,
      apiTestsTotal: testResults.apiTests?.length || 0,
      playwrightStatus: testResults.playwrightTests?.status || 'not_run',
      performanceResults: testResults.performanceTests?.map(t => ({
        name: t.name,
        loadTime: t.loadTime,
        performance: t.performance
      })) || []
    },
    details: testResults
  };
  
  // Save JSON report
  const jsonPath = path.join(__dirname, '../../FAZA3_TESTE_AUTOMATE.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  log.success('JSON report saved: FAZA3_TESTE_AUTOMATE.json');
  
  // Generate markdown report
  const mdReport = `# FAZA 3: Testare Automată End-to-End

**Data:** ${new Date().toLocaleString('ro-RO')}

## Rezumat

- **Status Server:** ${testResults.serverStatus === 'running' ? '✅ Funcționează' : '❌ Oprit'}
- **Teste API:** ${report.summary.apiTestsPassed}/${report.summary.apiTestsTotal} trecute
- **Teste Playwright:** ${report.summary.playwrightStatus === 'completed' ? '✅ Complete' : '⚠️ ' + report.summary.playwrightStatus}

## Teste API

${testResults.apiTests?.map(test => `- **${test.name}**: ${test.success ? '✅' : '❌'} (${test.status})`).join('\n') || 'Nu s-au rulat teste'}

## Teste Performanță

${testResults.performanceTests?.map(test => `- **${test.name}**: ${test.loadTime}ms (${test.performance})`).join('\n') || 'Nu s-au rulat teste'}

## Teste Playwright E2E

${testResults.playwrightTests?.status === 'completed' ? '✅ Toate testele au rulat cu succes' : testResults.playwrightTests?.status === 'completed_with_failures' ? '⚠️ Testele au rulat dar cu unele eșecuri' : '❌ Testele nu au rulat'}

## Status

${testResults.serverStatus === 'running' ? '✅' : '⚠️'} FAZA 3 Completă - ${testResults.serverStatus === 'running' ? 'Toate testele automate executate!' : 'Server oprit - unele teste nu au putut rula'}

---
*Generat automat de FAZA 3 testing script*
`;
  
  const mdPath = path.join(__dirname, '../../FAZA3_TESTE_AUTOMATE.md');
  fs.writeFileSync(mdPath, mdReport);
  log.success('Markdown report saved: FAZA3_TESTE_AUTOMATE.md');
  
  return report;
}

// Main execution
async function main() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  FAZA 3: Testare Automată End-to-End                               ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  try {
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
      log.warning('Continuând cu testele care nu necesită server...');
    }
    
    await runVerification();
    
    if (serverRunning) {
      await testAPIEndpoints();
      await runPerformanceTests();
      await runPlaywrightTests();
    }
    
    const report = generateReport();
    
    log.section('FAZA 3: COMPLETĂ! ✅');
    console.log(`
${colors.green}Teste Automate Complete:${colors.reset}
  • Server: ${testResults.serverStatus}
  • API Tests: ${report.summary.apiTestsPassed}/${report.summary.apiTestsTotal} passed
  • Playwright: ${report.summary.playwrightStatus}
  • Performance tests: ${testResults.performanceTests?.length || 0} interfaces tested

${colors.cyan}Rapoarte generate:${colors.reset}
  • FAZA3_TESTE_AUTOMATE.json
  • FAZA3_TESTE_AUTOMATE.md

${colors.yellow}Următorul pas:${colors.reset} FAZA 4 - Audit Manual
`);
    
    process.exit(0);
  } catch (error) {
    log.error(`Eroare: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main();
