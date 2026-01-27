const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testEndpoint(method, url, data = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        };
        if (data) config.data = data;
        
        const response = await axios(config);
        return { success: true, status: response.status, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            status: error.response?.status || 'NO_RESPONSE',
            message: error.response?.data?.error || error.message 
        };
    }
}

async function runTests() {
    console.log('\n🧪 TESTEZ ENDPOINT-URILE COST-HISTORY\n');
    
    // Test 1: GET /api/ingredients/:id/cost-history
    console.log('TEST 1: GET /api/ingredients/1/cost-history');
    const test1 = await testEndpoint('GET', '/api/ingredients/1/cost-history');
    if (test1.success) {
        console.log(`✅ SUCCESS - Status: ${test1.status}`);
    } else {
        console.log(`❌ ERROR - Status: ${test1.status}, Message: ${test1.message}`);
    }
    console.log('');
    
    // Test 2: GET /api/ingredients/search-nutrition
    console.log('TEST 2: GET /api/ingredients/search-nutrition?query=zahar');
    const test2 = await testEndpoint('GET', '/api/ingredients/search-nutrition?query=zahar');
    if (test2.success) {
        console.log(`✅ SUCCESS - Status: ${test2.status}`);
    } else {
        console.log(`❌ ERROR - Status: ${test2.status}, Message: ${test2.message}`);
    }
    console.log('');
    
    // Test 3: GET /api/ingredients/:id (generic)
    console.log('TEST 3: GET /api/ingredients/1');
    const test3 = await testEndpoint('GET', '/api/ingredients/1');
    if (test3.success) {
        console.log(`✅ SUCCESS - Status: ${test3.status}`);
    } else {
        console.log(`❌ ERROR - Status: ${test3.status}, Message: ${test3.message}`);
    }
    console.log('');
    
    console.log('✅ Teste finalizate!\n');
}

runTests().catch(err => {
    console.error('❌ Eroare fatală:', err.message);
    if (err.code === 'ECONNREFUSED') {
        console.error('⚠️ Serverul nu rulează pe portul 3001!');
    }
    process.exit(1);
});

