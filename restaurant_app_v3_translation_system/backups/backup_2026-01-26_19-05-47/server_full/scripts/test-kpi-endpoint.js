/**
 * Test direct al endpoint-ului KPI
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/admin/dashboard/kpi',
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
    console.log('\n📊 Răspuns API:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      console.log('\n📋 Verificare date:');
      console.log(`  todayRevenue: ${json.todayRevenue}`);
      console.log(`  todayOrders: ${json.todayOrders}`);
      console.log(`  cogsToday: ${json.cogsToday}`);
      console.log(`  inventoryAlerts: ${json.inventoryAlerts}`);
      console.log(`  revenueChange: ${json.revenueChange}`);
      console.log(`  todayOrdersChange: ${json.todayOrdersChange}`);
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();

