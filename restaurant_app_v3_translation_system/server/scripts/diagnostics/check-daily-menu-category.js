const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function checkDailyMenuCategory() {
  try {
    const response = await makeRequest('GET', '/api/menu/all');
    const data = JSON.parse(response);
    const products = data.data || [];

    console.log('Produse în categoria "Meniul Zilei":');
    const dailyMenuProducts = products.filter(p => p.category === 'Meniul Zilei');
    dailyMenuProducts.forEach(p => {
      console.log(`- ${p.name}: ${p.price} RON`);
    });

    if (dailyMenuProducts.length === 0) {
      console.log('Nu s-au găsit produse în categoria "Meniul Zilei"');
    }

  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkDailyMenuCategory();