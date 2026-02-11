const http = require('http');

function testAPI(endpoint, description) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch(e) {
          reject(new Error(`Parse error: ${e.message}, Raw: ${data.substring(0,200)}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function testHistoryAPIs() {
  try {
    console.log('Testing history APIs...\n');

    // Test kitchen history
    console.log('=== KITCHEN HISTORY ===');
    const kitchenData = await testAPI('/api/daily-history/kitchen', 'Kitchen History');
    console.log(`Orders: ${kitchenData.orders?.length || 0}`);
    kitchenData.orders?.forEach(order => {
      console.log(`Order ${order.id}:`);
      let items = order.items;
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items);
        } catch (e) {
          console.log(`  Error parsing items: ${e.message}`);
          items = [];
        }
      }
      if (!Array.isArray(items)) items = [];
      console.log(`  Items count: ${items.length}`);
      items.forEach(item => {
        console.log(`  ${item.name} - ${item.category}`);
      });
    });

    console.log('\n=== BAR HISTORY ===');
    const barData = await testAPI('/api/daily-history/bar', 'Bar History');
    console.log(`Orders: ${barData.orders?.length || 0}`);
    barData.orders?.forEach(order => {
      console.log(`Order ${order.id}:`);
      let items = order.items;
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items);
        } catch (e) {
          console.log(`  Error parsing items: ${e.message}`);
          items = [];
        }
      }
      if (!Array.isArray(items)) items = [];
      items.forEach(item => {
        console.log(`  ${item.name} - ${item.category}`);
      });
    });

  } catch (error) {
    console.error('Error testing APIs:', error.message);
  }
}

testHistoryAPIs();