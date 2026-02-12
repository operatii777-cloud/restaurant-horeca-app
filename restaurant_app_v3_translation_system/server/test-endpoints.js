/**
 * Test Script: Verify All Admin-Vite Backend Endpoints
 * Tests refactored pages and critical menu items
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Critical endpoints for refactored pages
const ENDPOINTS_TO_TEST = [
  // Refactored Pages APIs
  { name: 'Recipe Templates', method: 'GET', path: '/api/recipe-templates' },
  { name: 'Ingredient Catalog', method: 'GET', path: '/api/ingredient-catalog' },
  { name: 'Allergens', method: 'GET', path: '/api/ingredient-catalog/allergens' },
  { name: 'Additives', method: 'GET', path: '/api/ingredient-catalog/additives' },
  { name: 'Admin Menu', method: 'GET', path: '/api/admin/menu' },
  { name: 'Admin Products', method: 'GET', path: '/api/admin/products' },
  
  // Critical Menu Items
  { name: 'Reservations', method: 'GET', path: '/api/reservations' },
  { name: 'Orders', method: 'GET', path: '/api/orders' },
  { name: 'Ingredients', method: 'GET', path: '/api/ingredients' },
  { name: 'Recipes', method: 'GET', path: '/api/recipes' },
  { name: 'Categories', method: 'GET', path: '/api/admin/categories' },
  { name: 'Settings', method: 'GET', path: '/api/admin/settings' },
  { name: 'Stocks', method: 'GET', path: '/api/stocks' },
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.path, BASE_URL);
    
    const options = {
      method: endpoint.method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const status = res.statusCode;
        const success = status >= 200 && status < 400;
        
        let parsedData = null;
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          // Not JSON
        }
        
        resolve({
          name: endpoint.name,
          path: endpoint.path,
          status,
          success,
          hasData: parsedData && (Array.isArray(parsedData) ? parsedData.length > 0 : !!parsedData),
          dataType: parsedData ? (Array.isArray(parsedData) ? 'array' : 'object') : 'unknown',
          dataCount: Array.isArray(parsedData) ? parsedData.length : null,
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        name: endpoint.name,
        path: endpoint.path,
        status: 0,
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: endpoint.name,
        path: endpoint.path,
        status: 0,
        success: false,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Admin-Vite Backend Endpoints...\n');
  console.log('Server:', BASE_URL);
  console.log('Total endpoints:', ENDPOINTS_TO_TEST.length);
  console.log('=' .repeat(80));
  console.log('');

  const results = [];
  
  for (const endpoint of ENDPOINTS_TO_TEST) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    const icon = result.success ? '✅' : '❌';
    const status = result.status || 'ERR';
    const dataInfo = result.hasData ? ` (${result.dataCount || '?'} items)` : result.error ? ` (${result.error})` : '';
    
    console.log(`${icon} [${status}] ${result.name.padEnd(25)} ${result.path}${dataInfo}`);
  }

  console.log('');
  console.log('=' .repeat(80));
  console.log('\n📊 Summary:');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const withData = results.filter(r => r.hasData).length;
  
  console.log(`  ✅ Successful: ${successful}/${results.length}`);
  console.log(`  ❌ Failed: ${failed}/${results.length}`);
  console.log(`  📦 With Data: ${withData}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Endpoints:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}: ${r.path} (${r.error || 'Status ' + r.status})`);
    });
  }
  
  if (successful > 0 && withData === 0) {
    console.log('\n⚠️  Warning: Endpoints respond but have no data. Run seed script:');
    console.log('   node seed-sample-data.js');
  }
  
  console.log('');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Check if server is running
const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.get(BASE_URL, (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.setTimeout(2000);
  });
};

checkServer().then(isRunning => {
  if (!isRunning) {
    console.error('❌ Server not running at', BASE_URL);
    console.error('   Start the server first: node server.js');
    process.exit(1);
  }
  runTests();
});
