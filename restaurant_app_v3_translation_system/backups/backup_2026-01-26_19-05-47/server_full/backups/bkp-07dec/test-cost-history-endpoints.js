const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Funcție pentru login și obținere token
async function loginAndGetToken() {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        // Returnează cookie-ul sau token-ul din răspuns
        const cookies = response.headers['set-cookie'];
        if (cookies) {
            return cookies.join('; ');
        }
        
        // Dacă nu există cookie, returnează token-ul din body
        return response.data.token || response.data.accessToken;
    } catch (error) {
        console.error('❌ Eroare la login:', error.response?.data || error.message);
        throw error;
    }
}

// Funcție pentru request autentificat
async function authenticatedRequest(method, url, data = null, authToken = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (authToken) {
            if (authToken.includes('=')) {
                // Este un cookie
                config.headers['Cookie'] = authToken;
            } else {
                // Este un token JWT
                config.headers['Authorization'] = `Bearer ${authToken}`;
            }
        }
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return response;
    } catch (error) {
        return {
            error: true,
            status: error.response?.status,
            data: error.response?.data || error.message
        };
    }
}

// Teste pentru endpoint-urile cost-history
async function testCostHistoryEndpoints() {
    console.log('🔐 Logare...');
    const authToken = await loginAndGetToken();
    console.log('✅ Logare reușită\n');
    
    // Test 1: GET /api/ingredients/:id/cost-history
    console.log('📋 TEST 1: GET /api/ingredients/1/cost-history');
    const test1 = await authenticatedRequest('GET', '/api/ingredients/1/cost-history', null, authToken);
    if (test1.error) {
        console.log(`❌ EROARE: Status ${test1.status}`);
        console.log('   Răspuns:', JSON.stringify(test1.data, null, 2));
    } else {
        console.log(`✅ SUCCESS: Status ${test1.status}`);
        console.log('   Răspuns:', JSON.stringify(test1.data, null, 2));
    }
    console.log('');
    
    // Test 2: POST /api/ingredients/:id/cost-history
    console.log('📋 TEST 2: POST /api/ingredients/1/cost-history');
    const test2 = await authenticatedRequest('POST', '/api/ingredients/1/cost-history', {
        old_cost: 10.50,
        new_cost: 12.00,
        change_reason: 'Test manual'
    }, authToken);
    if (test2.error) {
        console.log(`❌ EROARE: Status ${test2.status}`);
        console.log('   Răspuns:', JSON.stringify(test2.data, null, 2));
    } else {
        console.log(`✅ SUCCESS: Status ${test2.status}`);
        console.log('   Răspuns:', JSON.stringify(test2.data, null, 2));
    }
    console.log('');
    
    // Test 3: GET /api/ingredients/search-nutrition
    console.log('📋 TEST 3: GET /api/ingredients/search-nutrition?query=zahar');
    const test3 = await authenticatedRequest('GET', '/api/ingredients/search-nutrition?query=zahar', null, authToken);
    if (test3.error) {
        console.log(`❌ EROARE: Status ${test3.status}`);
        console.log('   Răspuns:', JSON.stringify(test3.data, null, 2));
    } else {
        console.log(`✅ SUCCESS: Status ${test3.status}`);
        console.log('   Răspuns:', JSON.stringify(test3.data, null, 2));
    }
    console.log('');
    
    // Test 4: GET /api/ingredients/:id (generic - ar trebui să funcționeze)
    console.log('📋 TEST 4: GET /api/ingredients/1');
    const test4 = await authenticatedRequest('GET', '/api/ingredients/1', null, authToken);
    if (test4.error) {
        console.log(`❌ EROARE: Status ${test4.status}`);
        console.log('   Răspuns:', JSON.stringify(test4.data, null, 2));
    } else {
        console.log(`✅ SUCCESS: Status ${test4.status}`);
        console.log('   Răspuns:', JSON.stringify(test4.data, null, 2));
    }
    console.log('');
    
    console.log('✅ Teste finalizate!');
}

// Rulează testele
testCostHistoryEndpoints().catch(error => {
    console.error('❌ Eroare fatală:', error.message);
    if (error.code === 'ECONNREFUSED') {
        console.error('⚠️ Serverul nu rulează pe portul 3001!');
    }
    process.exit(1);
});

