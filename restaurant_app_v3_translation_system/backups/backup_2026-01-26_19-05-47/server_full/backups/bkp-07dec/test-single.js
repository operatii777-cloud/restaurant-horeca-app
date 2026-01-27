// Test simplu pentru un singur endpoint
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

console.log('🚀 Test simplu - Validare conversie unități');
console.log(`📍 BASE_URL: ${BASE_URL}`);

axios.post(`${BASE_URL}/api/units/validate-conversion`, {
  fromUnit: 'kg',
  toUnit: 'g',
  quantity: 2
}, { timeout: 5000 })
  .then(response => {
    console.log('✅ SUCCESS:', response.status);
    console.log('📦 Data:', JSON.stringify(response.data, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.log('❌ ERROR:', error.message);
    if (error.response) {
      console.log('📦 Response:', error.response.status, error.response.data);
    }
    process.exit(1);
  });

