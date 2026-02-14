const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/menu/all',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const products = JSON.parse(data);
      console.log('First 3 products:');
      products.slice(0, 10).forEach((product, index) => {
        console.log(`${index + 1}. ID: ${product.id}, Name: ${product.name}, Category: ${product.category}`);
      });
    } catch (e) {
      console.log('Response data:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();