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

async function checkMenuCategories() {
  try {
    const response = await makeRequest('GET', '/api/menu/all');
    const data = JSON.parse(response);
    const products = data.data || [];

    console.log('Categorii găsite:');
    const categories = [...new Set(products.map(p => p.category))].sort();
    categories.forEach(cat => {
      const productsInCat = products.filter(p => p.category === cat);
      console.log(`- ${cat}: ${productsInCat.length} produse`);
    });

    console.log('\nProduse în categoria "Meniul Zilei":');
    const dailyMenuProducts = products.filter(p => p.category === 'Meniul Zilei' || p.category === 'meniul zilei');
    dailyMenuProducts.forEach(p => {
      console.log(`- ${p.name}: ${p.price} RON`);
    });

  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkMenuCategories();