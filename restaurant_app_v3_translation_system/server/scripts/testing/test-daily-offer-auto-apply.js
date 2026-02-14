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
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
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

async function testDailyOfferAutoApply() {
  console.log('🎁 TEST: Daily Offer Auto-Application\n');

  try {
    // 1. Get menu to see daily offer config
    console.log('📋 Getting menu with daily offer...');
    const menuRes = await makeRequest('GET', '/api/kiosk/menu?lang=ro');
    
    if (!menuRes.daily_offer || !menuRes.daily_offer.id) {
      console.log('❌ No active daily offer in menu');
      return;
    }
    
    console.log(`✅ Found daily offer: ${menuRes.daily_offer.title}`);
    console.log(`📊 Conditions: ${JSON.stringify(menuRes.daily_offer.conditions, null, 2)}`);
    console.log(`🎁 Benefits: ${JSON.stringify(menuRes.daily_offer.benefit_products?.slice(0, 2), null, 2)}`);
    
    // 2. Get products that match daily offer conditions
    console.log('\n📦 Getting products for order...');
    const allProductsRes = await makeRequest('GET', '/api/menu/all');
    const allProducts = allProductsRes.data || allProductsRes || [];
    
    // Find products for each condition
    const orderItems = [];
    for (const condition of menuRes.daily_offer.conditions) {
      const categoryProducts = allProducts.filter(p => p.category === condition.category);
      const qty = condition.quantity || 1;
      
      if (categoryProducts.length > 0) {
        const product = categoryProducts[0];
        orderItems.push({
          product_id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          quantity: qty
        });
        console.log(`✅ Added ${qty}x ${product.name} (${product.category})`);
      }
    }
    
    if (orderItems.length === 0) {
      console.log('❌ Could not find products for daily offer conditions');
      return;
    }
    
    // 3. Place order with condition products (without benefits - backend should add them)
    console.log(`\n📤 Placing takeaway order with ${orderItems.length} items (backend should auto-add benefits)...`);
    const orderRes = await makeRequest('POST', '/api/kiosk/order', {
      items: orderItems,
      type: 'takeout',
      payment_method: 'cash',
      is_paid: 0,
      customer_name: 'Test Auto-Apply',
      customer_phone: '+40700111223',
      idempotency_key: `test-daily-offer-auto-${Date.now()}`
    });
    
    if (orderRes.error) {
      console.log('❌ Order failed:', orderRes.error);
      return;
    }
    
    console.log('✅ Order placed successfully!');
    const orderId = orderRes.order_id || orderRes.order?.id;
    console.log(`📋 Order ID: ${orderId}`);
    
    // Parse items from response
    if (orderRes.order?.items) {
      const items = typeof orderRes.order.items === 'string' ? JSON.parse(orderRes.order.items) : orderRes.order.items;
      console.log(`\n📊 Items in order (${items.length} total):`);
      
      const freeItems = items.filter(i => i.isFree);
      const paidItems = items.filter(i => !i.isFree);
      
      console.log(`\n💰 Paid items (${paidItems.length}):`);
      paidItems.forEach(i => console.log(`  - ${i.quantity}x ${i.name} (${i.price} RON)`));
      
      console.log(`\n🎁 Free items (${freeItems.length}) - BENEFITS:`);
      if (freeItems.length === 0) {
        console.log('  ❌ NO FREE ITEMS FOUND - Benefits NOT auto-applied!');
      } else {
        freeItems.forEach(i => console.log(`  ✅ ${i.quantity}x ${i.name} (FREE - isFree=${i.isFree})`));
      }
      
      console.log(`\n💰 Total: ${orderRes.order.total} RON`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDailyOfferAutoApply();
