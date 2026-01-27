const axios = require('axios');

console.log('🚀 Script pornit...');

async function test() {
  try {
    console.log('📡 Conectare la server...');
    // Folosește token simplu pentru checkAdminAuth (acceptă admin_* sau true)
    const token = 'admin_test_' + Date.now();
    console.log('✅ Folosind token simplu:', token.substring(0, 30));
    
    console.log('📤 Trimite request pentru creare ingredient...');
    // Creare ingredient
    const r = await axios.post('http://localhost:3001/api/ingredients', {
      name: 'Test Debug ' + Date.now(),
      category: 'Test',
      unit: 'kg',
      current_stock: 10,
      min_stock: 5,
      max_stock: 50,
      safety_stock: 8,
      reorder_quantity: 20,
      force: true
    }, {
      headers: { 'Authorization': 'Bearer ' + token },
      timeout: 15000
    });
    
    console.log('✅ SUCCESS:', r.status, '- Ingredient ID:', r.data.ingredient_id);
    process.exit(0);
  } catch (e) {
    if (e.response) {
      console.log('❌ Status:', e.response.status);
      console.log('❌ Error:', e.response.data?.error || 'Unknown');
      console.log('❌ Details:', e.response.data?.details || 'N/A');
      if (e.response.data) {
        console.log('❌ Full response:', JSON.stringify(e.response.data, null, 2));
      }
    } else {
      console.log('❌ Network error:', e.message);
      console.log('❌ Stack:', e.stack);
    }
    process.exit(1);
  }
}

test().catch(e => {
  console.log('FATAL:', e.message);
  console.log('FATAL Stack:', e.stack);
  process.exit(1);
});

