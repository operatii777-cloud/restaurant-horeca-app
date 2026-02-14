const http = require('http');

function testAPI(endpoint) {
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
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    setTimeout(() => req.abort(), 5000);
    req.end();
  });
}

async function testCourierDeliveries() {
  try {
    console.log('🔍 Testing Courier Deliveries API...\n');

    // Test grouped deliveries
    const result = await testAPI('/api/couriers/2/deliveries?grouped=true&status=delivered');
    
    console.log('📦 Raw response:');
    console.log(JSON.stringify(result, null, 2));

    if (result.byDate && Array.isArray(result.byDate)) {
      console.log('\n📊 Grouped by date:');
      result.byDate.forEach(dayData => {
        console.log(`\n📅 Date: ${dayData.date}`);
        console.log(`   Count: ${dayData.count}`);
        console.log(`   Earnings: ${dayData.earnings}`);
        
        if (dayData.deliveries && Array.isArray(dayData.deliveries)) {
          dayData.deliveries.forEach((delivery, idx) => {
            console.log(`   [${idx}] Order #${delivery.order_id}, Delivered: ${delivery.delivered_at}, Earnings: ${delivery.earnings}`);
          });
        }
      });
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testCourierDeliveries();
