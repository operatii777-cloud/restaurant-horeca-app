/**
 * TEST MIDDLEWARE INTEGRATION
 * Testează integrarea middleware-ului în endpoint-uri
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

/**
 * Helper pentru request-uri HTTP
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed, raw: body, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, raw: body, headers: res.headers });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Testează endpoint-ul /api/kiosk/order cu middleware
 */
async function testKioskOrder() {
  console.log('\n🧪 TEST 1: POST /api/kiosk/order cu middleware\n');
  
  // Test 1.1: Payload valid
  console.log('📝 Test 1.1: Payload valid...');
  try {
    const response = await makeRequest('POST', '/kiosk/order', {
      items: [
        { id: 1, quantity: 1, price: 10, name: 'Test Product' }
      ],
      type: 'takeaway',
      total: 10,
      payment_method: 'cash'
    });
    
    if (response.status === 200 || response.status === 201) {
      console.log('   ✅ Payload valid - Comandă creată cu succes');
      console.log(`   Order ID: ${response.data.orderId || response.data.order_id || 'N/A'}`);
    } else if (response.status === 422) {
      console.log('   ⚠️  Payload valid dar stoc insuficient (OK - validare funcționează)');
      console.log(`   Error: ${JSON.stringify(response.data.error || response.data)}`);
    } else {
      console.log(`   ❌ Eroare neașteptată: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`   ❌ Eroare: ${error.message}`);
  }
  
  // Test 1.2: Payload invalid (fără items)
  console.log('\n📝 Test 1.2: Payload invalid (fără items)...');
  try {
    const response = await makeRequest('POST', '/kiosk/order', {
      type: 'takeaway',
      total: 10
    });
    
    if (response.status === 400) {
      console.log('   ✅ Payload invalid - Validare funcționează corect');
      console.log(`   Error: ${JSON.stringify(response.data.error || response.data)}`);
    } else {
      console.log(`   ❌ Validare nu funcționează - Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}`);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ⚠️  Serverul nu rulează. Pornește serverul cu: node server.js');
    } else {
      console.log(`   ❌ Eroare: ${error.message}`);
    }
  }
  
  // Test 1.3: Payload invalid (items gol)
  console.log('\n📝 Test 1.3: Payload invalid (items gol)...');
  try {
    const response = await makeRequest('POST', '/kiosk/order', {
      items: [],
      type: 'takeaway',
      total: 10
    });
    
    if (response.status === 400) {
      console.log('   ✅ Payload invalid - Validare funcționează corect');
      console.log(`   Error: ${JSON.stringify(response.data.error || response.data)}`);
    } else {
      console.log(`   ❌ Validare nu funcționează - Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}`);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ⚠️  Serverul nu rulează. Pornește serverul cu: node server.js');
    } else {
      console.log(`   ❌ Eroare: ${error.message}`);
    }
  }
}

/**
 * Testează endpoint-ul /api/monitoring/order-health
 */
async function testMonitoring() {
  console.log('\n🧪 TEST 2: GET /api/monitoring/order-health\n');
  
  try {
    const response = await makeRequest('GET', '/monitoring/order-health');
    
    if (response.status === 200) {
      console.log('   ✅ Monitoring endpoint funcționează');
      console.log(`   Status general: ${response.data.health?.status || 'N/A'}`);
      if (response.data.health?.checks) {
        console.log('   Verificări:');
        Object.keys(response.data.health.checks).forEach(key => {
          const check = response.data.health.checks[key];
          console.log(`     - ${key}: ${check.status} - ${check.message || ''}`);
        });
      }
    } else {
      console.log(`   ❌ Eroare: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`   ❌ Eroare: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log('   ⚠️  Serverul nu rulează. Pornește serverul cu: node server.js');
    }
  }
}

/**
 * Rulează toate testele
 */
async function runTests() {
  console.log('🚀 TESTARE INTEGRARE MIDDLEWARE\n');
  console.log('=' .repeat(60));
  
  await testKioskOrder();
  await testMonitoring();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Testare completă!\n');
}

// Rulează testele dacă scriptul este executat direct
if (require.main === module) {
  runTests()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Eroare la rularea testelor:', error);
      process.exit(1);
    });
}

module.exports = { testKioskOrder, testMonitoring };
