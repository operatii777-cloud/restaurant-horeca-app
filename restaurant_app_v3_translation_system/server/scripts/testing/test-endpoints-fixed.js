/**
 * Test script for fixed endpoints
 */

const axios = require('axios');

const baseURL = 'http://localhost:3001';
const endpoints = [
  { url: '/api/stock/movements', name: 'Stock Movements' },
  { url: '/api/alerts', name: 'Alerts' },
  { url: '/api/reports/sales', name: 'Sales Reports' },
  { url: '/api/financial/reports', name: 'Financial Reports' },
  { url: '/api/cogs/calculate', name: 'COGS Calculate' },
  { url: '/api/compliance/haccp', name: 'HACCP Compliance' },
  { url: '/api/tipizate-legal', name: 'Tipizate Legal' },
  { url: '/api/kiosk/menu', name: 'Kiosk Menu' },
  { url: '/api/menu', name: 'Menu' },
  { url: '/api/external-delivery', name: 'External Delivery' },
  { url: '/api/fiscal/receipts', name: 'Fiscal Receipts' }
];

async function testEndpoints() {
  console.log('\n🧪 Testare Endpoint-uri Fixate...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${baseURL}${endpoint.url}`, { timeout: 5000, validateStatus: () => true });
      
      if (response.status === 200) {
        const hasData = response.data?.success !== false && (response.data?.data !== undefined || response.data?.count !== undefined || Array.isArray(response.data));
        console.log(`  ✅ ${endpoint.name} (${endpoint.url}) - Status: ${response.status} ${hasData ? '(cu date)' : ''}`);
        results.push({ name: endpoint.name, status: 'OK', code: response.status });
      } else if (response.status === 404) {
        console.log(`  ❌ ${endpoint.name} (${endpoint.url}) - 404 Not Found`);
        results.push({ name: endpoint.name, status: '404', code: 404 });
      } else if (response.status === 500) {
        console.log(`  ⚠️ ${endpoint.name} (${endpoint.url}) - 500 Internal Server Error`);
        if (response.data?.error) {
          console.log(`     Error: ${response.data.error}`);
        }
        results.push({ name: endpoint.name, status: '500', code: 500 });
      } else {
        console.log(`  ⚠️ ${endpoint.name} (${endpoint.url}) - Status: ${response.status}`);
        results.push({ name: endpoint.name, status: 'WARNING', code: response.status });
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`  ❌ ${endpoint.name} (${endpoint.url}) - Server not running`);
        results.push({ name: endpoint.name, status: 'SERVER_DOWN', code: 0 });
      } else {
        console.log(`  ⚠️ ${endpoint.name} (${endpoint.url}) - Error: ${error.message}`);
        results.push({ name: endpoint.name, status: 'ERROR', code: 0 });
      }
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n📊 Rezumat Testare:');
  const ok = results.filter(r => r.status === 'OK').length;
  const fail = results.filter(r => r.status !== 'OK').length;
  console.log(`   ✅ OK: ${ok}`);
  console.log(`   ❌ Erori: ${fail}\n`);
  
  if (fail === 0) {
    console.log('✅✅✅ TOATE ENDPOINT-URILE FUNCȚIONEAZĂ CORECT!\n');
    process.exit(0);
  } else {
    console.log('⚠️ Unele endpoint-uri au probleme. Verifică mai sus.\n');
    process.exit(1);
  }
}

testEndpoints().catch(error => {
  console.error('❌ Eroare la rularea testelor:', error);
  process.exit(1);
});
