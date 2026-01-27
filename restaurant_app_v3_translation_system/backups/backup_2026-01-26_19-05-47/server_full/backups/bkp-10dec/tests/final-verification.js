/**
 * VERIFICARE FINALĂ - Test complet toate funcționalitățile
 * Data: 03 Decembrie 2025
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const config = { method, url: `${BASE_URL}${endpoint}` };
    if (data) config.data = data;
    
    const response = await axios(config);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runFinalVerification() {
  console.log('\n🎯 VERIFICARE FINALĂ - TOATE FUNCȚIONALITĂȚILE');
  console.log('================================================\n');
  
  const tests = [];
  
  // ========== ENTERPRISE FEATURES ==========
  console.log('📋 ENTERPRISE FEATURES:\n');
  
  // 1. Technical Sheets
  let result = await testAPI('/api/technical-sheets');
  console.log(`${result.success ? '✅' : '❌'} Technical Sheets API`);
  tests.push({ name: 'Technical Sheets', ...result });
  
  // 2. Portions
  result = await testAPI('/api/portions');
  console.log(`${result.success ? '✅' : '❌'} Portions API`);
  tests.push({ name: 'Portions', ...result });
  
  // 3. Recalls
  result = await testAPI('/api/recalls');
  console.log(`${result.success ? '✅' : '❌'} Recalls API`);
  tests.push({ name: 'Recalls', ...result });
  
  // 4. Expiry Alerts
  result = await testAPI('/api/expiry-alerts');
  console.log(`${result.success ? '✅' : '❌'} Expiry Alerts API`);
  tests.push({ name: 'Expiry Alerts', ...result });
  
  // 5. Variance
  result = await testAPI('/api/variance/daily?date=2025-12-03');
  console.log(`${result.success ? '✅' : '❌'} Variance API`);
  tests.push({ name: 'Variance', ...result });
  
  // 6. Dynamic Pricing
  result = await testAPI('/api/pricing/dynamic/1');
  console.log(`${result.success ? '✅' : '❌'} Dynamic Pricing API`);
  tests.push({ name: 'Dynamic Pricing', ...result });
  
  // ========== EXISTING CRITICAL FEATURES ==========
  console.log('\n🔥 CRITICAL FEATURES:\n');
  
  // 7. Hostess Map
  result = await testAPI('/api/hostess/tables');
  console.log(`${result.success ? '✅' : '❌'} Hostess Map API`);
  tests.push({ name: 'Hostess Map', ...result });
  
  // 8. Coatroom
  result = await testAPI('/api/coatroom/tickets');
  console.log(`${result.success ? '✅' : '❌'} Coatroom API`);
  tests.push({ name: 'Coatroom', ...result });
  
  // 9. Lost & Found
  result = await testAPI('/api/lostfound/items');
  console.log(`${result.success ? '✅' : '❌'} Lost & Found API`);
  tests.push({ name: 'Lost & Found', ...result });
  
  // 10. Couriers
  result = await testAPI('/api/couriers');
  console.log(`${result.success ? '✅' : '❌'} Couriers API`);
  tests.push({ name: 'Couriers', ...result });
  
  // ========== STOCK MODULES (FIFO) ==========
  console.log('\n📦 STOCK MODULES (FIFO):\n');
  
  // 11. NIR
  result = await testAPI('/api/nir');
  console.log(`${result.success ? '✅' : '❌'} NIR API`);
  tests.push({ name: 'NIR', ...result });
  
  // 12. Inventory
  result = await testAPI('/api/inventory');
  console.log(`${result.success ? '✅' : '❌'} Inventory API`);
  tests.push({ name: 'Inventory', ...result });
  
  // ========== STATISTICS ==========
  console.log('\n================================================');
  console.log('📊 FINAL STATISTICS');
  console.log('================================================');
  
  const passed = tests.filter(t => t.success).length;
  const failed = tests.filter(t => !t.success).length;
  const successRate = ((passed / tests.length) * 100).toFixed(1);
  
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${successRate}%`);
  console.log('================================================\n');
  
  if (failed > 0) {
    console.log('❌ FAILED TESTS:');
    tests.filter(t => !t.success).forEach(t => {
      console.log(`  - ${t.name}: ${t.error}`);
    });
    console.log('');
  }
  
  if (successRate >= 90) {
    console.log('🎉 APLICAȚIA E FUNCȚIONALĂ! Ready for production!\n');
  } else if (successRate >= 75) {
    console.log('⚠️ Majoritatea funcționalităților funcționează. Verifică erorile.\n');
  } else {
    console.log('🔴 Multe funcționalități au probleme. Debugging necesar.\n');
  }
  
  return { passed, failed, successRate, tests };
}

// RUN
if (require.main === module) {
  runFinalVerification()
    .then(result => {
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Verification failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runFinalVerification };

