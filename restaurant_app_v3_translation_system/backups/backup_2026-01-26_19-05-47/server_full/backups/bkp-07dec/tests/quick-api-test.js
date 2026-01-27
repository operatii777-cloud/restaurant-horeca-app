const axios = require('axios');

async function quickTest() {
  try {
    console.log('🧪 Quick API Test\n');
    
    const response = await axios.get('http://localhost:3001/api/technical-sheets');
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
  } catch (error) {
    console.log('❌ ERROR!');
    console.log('Message:', error.message);
    console.log('Code:', error.code);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

quickTest();

