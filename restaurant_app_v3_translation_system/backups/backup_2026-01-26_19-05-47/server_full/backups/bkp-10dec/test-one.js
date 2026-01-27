const axios = require('axios');

console.log('START TEST');
console.log('Testing endpoint...');

axios.post('http://localhost:3001/api/units/validate-conversion', {
  fromUnit: 'kg',
  toUnit: 'g',
  quantity: 2
}, { timeout: 5000 })
  .then(response => {
    console.log('SUCCESS:', response.status);
    console.log('DATA:', JSON.stringify(response.data));
    process.exit(0);
  })
  .catch(error => {
    console.log('ERROR:', error.message);
    if (error.response) {
      console.log('STATUS:', error.response.status);
      console.log('DATA:', JSON.stringify(error.response.data));
    }
    process.exit(1);
  });

