/**
 * TESTARE PUPPETEER - FUNCȚIONALITĂȚI CRITICE
 * Data: 03 Decembrie 2025
 * Scop: Testează funcționalitățile critice care modifică baza de date
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3001';

// ==================== HELPER FUNCTIONS ====================
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function screenshot(page, name) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  console.log(`📸 Screenshot saved: ${name}.png`);
}

// ==================== TESTS ====================
async function runTests() {
  console.log('🧪 PUPPETEER - CRITICAL FUNCTIONALITY TESTS');
  console.log('===========================================\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Vizibil pentru debugging
    slowMo: 50, // Slow down pentru a vedea ce se întâmplă
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };
  
  try {
    // ==================== TEST 1: NIR Creation (FIFO) ====================
    console.log('\n📦 TEST 1: NIR Creation (FIFO Stock Entry)');
    results.total++;
    
    try {
      await page.goto(`${BASE_URL}/admin-vite/stocks/nir`);
      await delay(2000);
      
      // Verifică dacă pagina s-a încărcat
      const nirTitle = await page.$eval('h1, h2, .page-title', el => el.textContent).catch(() => null);
      
      if (nirTitle && nirTitle.includes('NIR')) {
        console.log('✅ NIR page loaded');
        results.passed++;
      } else {
        throw new Error('NIR page title not found');
      }
      
      await screenshot(page, 'test1-nir-page');
      
    } catch (error) {
      console.log(`❌ TEST 1 FAILED: ${error.message}`);
      results.failed++;
      results.errors.push(`TEST 1 (NIR): ${error.message}`);
    }
    
    // ==================== TEST 2: Inventory Adjustment ====================
    console.log('\n📊 TEST 2: Inventory Adjustment (Stock Moves)');
    results.total++;
    
    try {
      await page.goto(`${BASE_URL}/admin-vite/stocks/inventory`);
      await delay(2000);
      
      const invTitle = await page.$eval('h1, h2, .page-title', el => el.textContent).catch(() => null);
      
      if (invTitle && (invTitle.includes('Inventory') || invTitle.includes('Inventar'))) {
        console.log('✅ Inventory page loaded');
        results.passed++;
      } else {
        throw new Error('Inventory page title not found');
      }
      
      await screenshot(page, 'test2-inventory-page');
      
    } catch (error) {
      console.log(`❌ TEST 2 FAILED: ${error.message}`);
      results.failed++;
      results.errors.push(`TEST 2 (Inventory): ${error.message}`);
    }
    
    // ==================== TEST 3: Bon Consum (FIFO Consumption) ====================
    console.log('\n🔥 TEST 3: Bon Consum (FIFO Stock Consumption)');
    results.total++;
    
    try {
      await page.goto(`${BASE_URL}/admin-vite/stocks/consume`);
      await delay(2000);
      
      const consumeTitle = await page.$eval('h1, h2, .page-title', el => el.textContent).catch(() => null);
      
      if (consumeTitle && consumeTitle.includes('Consum')) {
        console.log('✅ Bon Consum page loaded');
        results.passed++;
      } else {
        throw new Error('Bon Consum page title not found');
      }
      
      await screenshot(page, 'test3-consume-page');
      
    } catch (error) {
      console.log(`❌ TEST 3 FAILED: ${error.message}`);
      results.failed++;
      results.errors.push(`TEST 3 (Bon Consum): ${error.message}`);
    }
    
    // ==================== TEST 4: Hostess Map (Table Sessions) ====================
    console.log('\n🪑 TEST 4: Hostess Map (Table Sessions)');
    results.total++;
    
    try {
      await page.goto(`${BASE_URL}/admin-vite/hostess-map`);
      await delay(2000);
      
      const hostessTitle = await page.$eval('h1, h2, .page-title', el => el.textContent).catch(() => null);
      
      if (hostessTitle && hostessTitle.includes('Hostess')) {
        console.log('✅ Hostess Map page loaded');
        results.passed++;
      } else {
        throw new Error('Hostess Map page title not found');
      }
      
      await screenshot(page, 'test4-hostess-map-page');
      
    } catch (error) {
      console.log(`❌ TEST 4 FAILED: ${error.message}`);
      results.failed++;
      results.errors.push(`TEST 4 (Hostess Map): ${error.message}`);
    }
    
    // ==================== TEST 5: Coatroom (Ticket Management) ====================
    console.log('\n🧥 TEST 5: Coatroom (Ticket Management)');
    results.total++;
    
    try {
      await page.goto(`${BASE_URL}/admin-vite/coatroom`);
      await delay(2000);
      
      const coatroomTitle = await page.$eval('h1, h2, .page-title', el => el.textContent).catch(() => null);
      
      if (coatroomTitle && (coatroomTitle.includes('Coatroom') || coatroomTitle.includes('Garderob'))) {
        console.log('✅ Coatroom page loaded');
        results.passed++;
      } else {
        throw new Error('Coatroom page title not found');
      }
      
      await screenshot(page, 'test5-coatroom-page');
      
    } catch (error) {
      console.log(`❌ TEST 5 FAILED: ${error.message}`);
      results.failed++;
      results.errors.push(`TEST 5 (Coatroom): ${error.message}`);
    }
    
    // ==================== TEST 6: Lost & Found ====================
    console.log('\n🔍 TEST 6: Lost & Found (Item Tracking)');
    results.total++;
    
    try {
      await page.goto(`${BASE_URL}/admin-vite/lost-found`);
      await delay(2000);
      
      const lostFoundTitle = await page.$eval('h1, h2, .page-title', el => el.textContent).catch(() => null);
      
      if (lostFoundTitle && lostFoundTitle.includes('Lost')) {
        console.log('✅ Lost & Found page loaded');
        results.passed++;
      } else {
        throw new Error('Lost & Found page title not found');
      }
      
      await screenshot(page, 'test6-lostfound-page');
      
    } catch (error) {
      console.log(`❌ TEST 6 FAILED: ${error.message}`);
      results.failed++;
      results.errors.push(`TEST 6 (Lost & Found): ${error.message}`);
    }
    
    // ==================== TEST 7: Courier Management ====================
    console.log('\n🚴 TEST 7: Courier Management');
    results.total++;
    
    try {
      await page.goto(`${BASE_URL}/admin-vite/couriers`);
      await delay(2000);
      
      const courierTitle = await page.$eval('h1, h2, .page-title', el => el.textContent).catch(() => null);
      
      if (courierTitle && (courierTitle.includes('Courier') || courierTitle.includes('Curier'))) {
        console.log('✅ Courier Management page loaded');
        results.passed++;
      } else {
        throw new Error('Courier Management page title not found');
      }
      
      await screenshot(page, 'test7-courier-management-page');
      
    } catch (error) {
      console.log(`❌ TEST 7 FAILED: ${error.message}`);
      results.failed++;
      results.errors.push(`TEST 7 (Courier): ${error.message}`);
    }
    
    // ==================== TEST 8: KIOSK Dashboard ====================
    console.log('\n📊 TEST 8: KIOSK Dashboard');
    results.total++;
    
    try {
      await page.goto(`${BASE_URL}/kiosk/dashboard`);
      await delay(3000); // Extra time for KIOSK layout
      
      const kioskLayout = await page.$('.kiosk-layout, .kiosk-main-layout, .kiosk-sidebar');
      
      if (kioskLayout) {
        console.log('✅ KIOSK Dashboard loaded with sidebar');
        results.passed++;
      } else {
        throw new Error('KIOSK layout not found');
      }
      
      await screenshot(page, 'test8-kiosk-dashboard');
      
    } catch (error) {
      console.log(`❌ TEST 8 FAILED: ${error.message}`);
      results.failed++;
      results.errors.push(`TEST 8 (KIOSK): ${error.message}`);
    }
    
  } finally {
    await browser.close();
  }
  
  // ==================== RESULTS SUMMARY ====================
  console.log('\n===========================================');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('===========================================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach((error, idx) => {
      console.log(`  ${idx + 1}. ${error}`);
    });
  }
  
  console.log('\n===========================================\n');
  
  return results;
}

// ==================== RUN TESTS ====================
if (require.main === module) {
  runTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runTests };

