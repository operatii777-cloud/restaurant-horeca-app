const axios = require('axios');

async function testCostHistory() {
    try {
        console.log('🔍 Testare directă cost-history endpoints...\n');
        
        // 1. Login pentru a obține token
        console.log('1. Login...');
        const loginRes = await axios.post('http://localhost:3001/api/login', {
            username: 'admin',
            password: 'admin'
        });
        console.log('   ✅ Login successful');
        
        const token = loginRes.data.token || 'admin_test_123';
        
        // 2. Test GET cost-history
        console.log('\n2. GET /api/ingredients/29/cost-history');
        try {
            const getRes = await axios.get('http://localhost:3001/api/ingredients/29/cost-history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('   ✅ SUCCESS - History entries:', getRes.data.history?.length || 0);
        } catch (error) {
            console.log('   ❌ FAILED:', error.response?.status, error.response?.data?.error || error.message);
        }
        
        // 3. Test POST cost-history
        console.log('\n3. POST /api/ingredients/29/cost-history');
        try {
            const postRes = await axios.post('http://localhost:3001/api/ingredients/29/cost-history', {
                old_cost: 10.50,
                new_cost: 12.00,
                change_reason: 'test_direct_script'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('   ✅ SUCCESS - History ID:', postRes.data.history_id);
        } catch (error) {
            console.log('   ❌ FAILED:', error.response?.status, error.response?.data?.error || error.message);
        }
        
        // 4. Test GET /api/ingredients/29 pentru comparație
        console.log('\n4. GET /api/ingredients/29 (pentru comparație)');
        try {
            const getIngRes = await axios.get('http://localhost:3001/api/ingredients/29');
            console.log('   ✅ SUCCESS - Ingredient ID:', getIngRes.data.ingredient?.id);
        } catch (error) {
            console.log('   ❌ FAILED:', error.response?.status, error.response?.data?.error || error.message);
        }
        
    } catch (error) {
        console.error('❌ Eroare generală:', error.message);
    }
}

testCostHistory();

