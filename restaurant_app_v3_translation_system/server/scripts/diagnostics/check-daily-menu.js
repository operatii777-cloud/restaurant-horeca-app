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

async function checkDailyMenu() {
  try {
    const response = await makeRequest('GET', '/api/daily-menu');
    const data = JSON.parse(response);

    if (data.soup && data.mainCourse) {
      console.log('Meniul Zilei:');
      console.log(`Ciorbă: ${data.soup.name} - ${data.soup.price} RON`);
      console.log(`Fel principal: ${data.mainCourse.name} - ${data.mainCourse.price} RON`);
      console.log(`Preț original: ${data.soup.price + data.mainCourse.price} RON`);
      console.log(`Reducere: ${data.discount} RON`);
      console.log(`Preț ofertă: ${(data.soup.price + data.mainCourse.price) - data.discount} RON`);
    } else {
      console.log('Nu există meniu zilnic activ');
    }

  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkDailyMenu();