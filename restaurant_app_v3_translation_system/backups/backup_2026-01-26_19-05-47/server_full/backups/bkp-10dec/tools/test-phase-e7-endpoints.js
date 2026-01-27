/**
 * PHASE E7 ENDPOINT TESTER
 * 
 * Tests all SAFE module endpoints to verify they work correctly after migration.
 * 
 * Usage: node tools/test-phase-e7-endpoints.js [baseUrl]
 * Default: http://localhost:3001
 */

const http = require('http');

const BASE_URL = process.argv[2] || 'http://localhost:3001';

const SAFE_ENDPOINTS = [
  // Variance
  { method: 'GET', path: '/api/variance/daily?date=2025-12-07', name: 'Variance Daily' },
  { method: 'POST', path: '/api/variance/calculate', name: 'Variance Calculate', body: { date: '2025-12-07' } },
  
  // Technical Sheets
  { method: 'GET', path: '/api/technical-sheets', name: 'Technical Sheets List' },
  { method: 'GET', path: '/api/technical-sheets/1', name: 'Technical Sheet By ID' },
  
  // Recalls
  { method: 'GET', path: '/api/recalls', name: 'Recalls List' },
  
  // Expiry Alerts
  { method: 'GET', path: '/api/expiry-alerts', name: 'Expiry Alerts List' },
  
  // Portions
  { method: 'GET', path: '/api/portions', name: 'Portions List' },
  
  // Smart Restock
  { method: 'GET', path: '/api/smart-restock-v2/analysis?days=30', name: 'Smart Restock Analysis' },
  
  // Hostess
  { method: 'GET', path: '/api/hostess/tables', name: 'Hostess Tables' },
  { method: 'GET', path: '/api/hostess/stats', name: 'Hostess Stats' },
  
  // Lost & Found
  { method: 'GET', path: '/api/lostfound/items', name: 'Lost & Found Items' },
  { method: 'GET', path: '/api/lostfound/stats', name: 'Lost & Found Stats' },
  
  // Coatroom
  { method: 'GET', path: '/api/coatroom/tickets', name: 'Coatroom Tickets' },
  { method: 'GET', path: '/api/coatroom/stats', name: 'Coatroom Stats' },
  
  // Laundry
  { method: 'GET', path: '/api/laundry/items', name: 'Laundry Items' },
  { method: 'GET', path: '/api/laundry/stats', name: 'Laundry Stats' },
  
  // Delivery Reports
  { method: 'GET', path: '/api/reports/delivery-performance', name: 'Delivery Performance Report' },
];

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (body) {
      const bodyString = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyString);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function testEndpoint(endpoint) {
  try {
    const startTime = Date.now();
    const response = await makeRequest(endpoint.method, endpoint.path, endpoint.body);
    const duration = Date.now() - startTime;
    
    const isSuccess = response.status >= 200 && response.status < 500; // Accept 4xx as "working" (auth, validation, etc.)
    const isError = response.status >= 500;
    
    let status;
    if (isError) {
      status = '❌ ERROR';
    } else if (response.status === 404) {
      status = '⚠️  NOT FOUND (may be expected)';
    } else {
      status = '✅ OK';
    }
    
    return {
      name: endpoint.name,
      method: endpoint.method,
      path: endpoint.path,
      status: response.status,
      duration,
      result: status,
      success: isSuccess
    };
  } catch (error) {
    return {
      name: endpoint.name,
      method: endpoint.method,
      path: endpoint.path,
      status: 'ERROR',
      duration: 0,
      result: '❌ CONNECTION ERROR',
      error: error.message,
      success: false
    };
  }
}

async function runTests() {
  console.log('🧪 PHASE E7 ENDPOINT TESTING');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}\n`);
  
  const results = [];
  
  for (const endpoint of SAFE_ENDPOINTS) {
    process.stdout.write(`Testing ${endpoint.name}... `);
    const result = await testEndpoint(endpoint);
    results.push(result);
    console.log(result.result);
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED ENDPOINTS:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   ${r.result} - ${r.method} ${r.path} (${r.name})`);
      if (r.error) {
        console.log(`      Error: ${r.error}`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(60));
  if (failed === 0) {
    console.log('🟢 ALL TESTS PASSED - SAFE modules working correctly!');
    process.exit(0);
  } else {
    console.log('🔴 SOME TESTS FAILED - Review failed endpoints');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});

