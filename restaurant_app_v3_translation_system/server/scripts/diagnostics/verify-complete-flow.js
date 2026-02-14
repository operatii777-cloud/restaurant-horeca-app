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

async function verifyCompleteFlow() {
  try {
    console.log('🔍 VERIFYING COMPLETE DAILY MENU FLOW\n');
    console.log('=' .repeat(70));

    // 1. Check daily menu endpoint
    console.log('\n1️⃣ Checking /api/daily-menu endpoint...');
    const dailyMenuResponse = await makeRequest('GET', '/api/daily-menu');
    const dailyMenuData = JSON.parse(dailyMenuResponse);
    console.log('   ✅ Daily Menu API Response:');
    console.log('   - Soup ID:', dailyMenuData.data?.soup_id);
    console.log('   - Main Course ID:', dailyMenuData.data?.main_course_id);
    console.log('   - Discount:', dailyMenuData.data?.discount, 'RON');
    console.log('   - Date:', dailyMenuData.data?.date);

    // 2. Check menu/all endpoint for "Meniul Zilei" category
    console.log('\n2️⃣ Checking /api/menu/all for "Meniul Zilei" category...');
    const menuResponse = await makeRequest('GET', '/api/menu/all');
    const menuData = JSON.parse(menuResponse);
    const products = menuData.data || [];
    const dailyMenuProducts = products.filter(p => p.category === 'Meniul Zilei');
    
    console.log(`   ✅ Found ${dailyMenuProducts.length} products in "Meniul Zilei" category:`);
    dailyMenuProducts.forEach(p => {
      console.log(`   - ${p.name}: ${p.price} RON`);
    });

    // 3. Verify category exists
    console.log('\n3️⃣ Checking categories list...');
    const categories = menuData.categories || [];
    const hasMeniuZilei = categories.includes('Meniul Zilei');
    console.log(`   ${hasMeniuZilei ? '✅' : '❌'} "Meniul Zilei" category ${hasMeniuZilei ? 'FOUND' : 'NOT FOUND'} in categories`);
    console.log(`   Total categories: ${categories.length}`);

    // 4. Verify totals
    console.log('\n4️⃣ Verifying prices...');
    if (dailyMenuProducts.length >= 2) {
      const soup = dailyMenuProducts[0];
      const main = dailyMenuProducts[1];
      const originalTotal = soup.price + main.price;
      const discountAmount = dailyMenuData.data?.discount || 10;
      const finalPrice = originalTotal - discountAmount;
      
      console.log(`   Soup: ${soup.price} RON`);
      console.log(`   Main: ${main.price} RON`);
      console.log(`   Original Total: ${originalTotal} RON`);
      console.log(`   Discount: -${discountAmount} RON`);
      console.log(`   Final Price: ${finalPrice} RON`);
    }

    // 5. Final status
    console.log('\n' + '='.repeat(70));
    if (hasMeniuZilei && dailyMenuProducts.length > 0) {
      console.log('\n✅ SUCCESS: "Meniul Zilei" category is properly configured!');
      console.log('   The Restorapp should now display this category with products.');
    } else {
      console.log('\n❌ ISSUE: "Meniul Zilei" category not properly populated');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyCompleteFlow();
