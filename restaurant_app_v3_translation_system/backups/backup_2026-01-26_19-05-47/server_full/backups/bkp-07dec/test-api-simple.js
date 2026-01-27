// Script simplu pentru testare API fără Playwright
// Utilizare: node test-api-simple.js "API: Validare conversie unități"

console.log('🚀 Script pornit...');

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

// Helper pentru login și obținere token
async function loginAndGetToken() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    }, {
      timeout: 5000
    });
    
    return response.data.sessionToken || response.data.token || ('admin_' + Date.now());
  } catch (error) {
    console.log('⚠️ Login API eșuat, folosind fallback token:', error.message);
    return 'admin_' + Date.now();
  }
}

// Helper pentru request autentificat
async function authenticatedRequest(method, url, data = null) {
  const token = await loginAndGetToken();
  const config = {
    method,
    url,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
}

// Teste
async function runTests() {
  const testName = process.argv[2] || '';
  let passed = 0;
  let failed = 0;
  
  console.log('🧪 Testare API endpoints...');
  console.log(`📍 BASE_URL: ${BASE_URL}`);
  console.log(`🔍 Test name filter: ${testName || '(toate)'}\n`);
  
  // Test 1: Validare conversie unități (kg → g)
  if (!testName || testName.includes('conversie')) {
    try {
      console.log('🔄 Testez: Validare conversie unități...');
      const response = await axios.post(`${BASE_URL}/api/units/validate-conversion`, {
        fromUnit: 'kg',
        toUnit: 'g',
        quantity: 2
      }, { timeout: 5000 });
      
      if (response.status === 200 && response.data.success && response.data.value === 2000) {
        console.log('✅ API: Validare conversie unități (kg → g)');
        passed++;
      } else {
        console.log('❌ API: Validare conversie unități (kg → g)', response.data);
        failed++;
      }
    } catch (error) {
      console.log('❌ API: Validare conversie unități (kg → g)', error.response?.data || error.message);
      failed++;
    }
  }
  
  // Test 2: Listă unități
  if (!testName || testName.includes('unități') || testName.includes('listă')) {
    try {
      console.log('🔄 Testez: Listă unități...');
      const response = await axios.get(`${BASE_URL}/api/units/list`, { timeout: 5000 });
      if (response.status === 200 && response.data.units && response.data.units.length > 0) {
        console.log('✅ API: Listă unități disponibile');
        passed++;
      } else {
        console.log('❌ API: Listă unități disponibile', response.data);
        failed++;
      }
    } catch (error) {
      console.log('❌ API: Listă unități disponibile', error.response?.data || error.message);
      failed++;
    }
  }
  
  // Test 3: Stock valuation config
  if (!testName || testName.includes('stock') || testName.includes('valuation')) {
    try {
      console.log('🔄 Testez: Stock valuation config...');
      const response = await authenticatedRequest('GET', `${BASE_URL}/api/settings/stock-valuation`);
      if (response.status === 200 && response.data.success && response.data.config) {
        console.log('✅ API: Obține metoda de evaluare configurată');
        passed++;
      } else {
        console.log('❌ API: Obține metoda de evaluare configurată', response.data);
        failed++;
      }
    } catch (error) {
      console.log('❌ API: Obține metoda de evaluare configurată', error.response?.data || error.message);
      failed++;
    }
  }
  
  console.log(`\n📊 Rezultate: ${passed} trecute, ${failed} eșuate`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error('❌ Eroare fatală:', error.message);
  console.error(error.stack);
  process.exit(1);
});

