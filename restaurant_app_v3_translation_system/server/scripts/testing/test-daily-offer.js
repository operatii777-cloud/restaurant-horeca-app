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

async function testDailyOffer() {
  console.log('🧪 Test: Ofertă zilnică - verificare și plasare comandă\n');

  try {
    // 1. Ia ofertele zilnice
    console.log('📋 Ia ofertele zilnice...');
    const offersResponse = await makeRequest('GET', '/api/daily-offer');
    const offersData = JSON.parse(offersResponse);

    if (!offersData.data || offersData.data.length === 0) {
      console.log('❌ Nu există oferte zilnice active');
      return;
    }

    const offer = offersData.data[0];
    console.log(`✅ Ofertă găsită: ${offer.name}`);
    console.log(`📋 Condiții: ${JSON.stringify(offer.conditions, null, 2)}`);
    console.log(`🎁 Beneficii: ${JSON.stringify(offer.benefits, null, 2)}\n`);

    // 2. Ia produsele pentru test
    console.log('📦 Ia produse din API...');
    const menuResponse = await makeRequest('GET', '/api/menu/all');
    const products = JSON.parse(menuResponse).data;

    // Găsește produse pentru condiții
    const conditionProducts = [];
    for (const condition of offer.conditions) {
      const categoryProducts = products.filter(p => p.category === condition.category);
      if (categoryProducts.length >= condition.quantity) {
        conditionProducts.push(...categoryProducts.slice(0, condition.quantity));
      }
    }

    // Găsește produse pentru beneficii
    const benefitProducts = [];
    for (const benefit of offer.benefits) {
      if (benefit.type === 'category') {
        const categoryProducts = products.filter(p => p.category === benefit.category);
        if (categoryProducts.length > 0) {
          benefitProducts.push(categoryProducts[0]);
        }
      } else if (benefit.type === 'specific') {
        const specificProduct = products.find(p => p.id === benefit.product_id);
        if (specificProduct) {
          benefitProducts.push(specificProduct);
        }
      }
    }

    console.log(`📦 Produse condiții: ${conditionProducts.map(p => `${p.name} (${p.price} RON)`).join(', ')}`);
    console.log(`🎁 Produse beneficii: ${benefitProducts.map(p => `${p.name} (${p.price} RON)`).join(', ')}\n`);

    // 3. Verifică oferta cu checkDailyOffer
    const cartItems = [...conditionProducts, ...benefitProducts].map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      quantity: 1
    }));

    console.log('🔍 Verifică eligibilitatea pentru ofertă...');
    const checkResponse = await makeRequest('POST', '/api/daily-offer/check', { cartItems });
    const checkResult = JSON.parse(checkResponse);

    console.log(`✅ Ofertă validă: ${checkResult.hasOffer}`);
    if (checkResult.discountItem) {
      console.log(`🎁 Produs gratuit: ${checkResult.discountItem.name}\n`);
    }

    // 4. Plasează comanda cu isFree pentru produsul gratuit
    const orderItems = cartItems.map(item => ({
      ...item,
      isFree: checkResult.discountItem && item.id === checkResult.discountItem.itemId
    }));

    const orderData = {
      items: orderItems,
      customer_name: 'Test Daily Offer',
      customer_phone: '+40700111223',
      payment_method: 'cash',
      type: 'takeaway',
      is_paid: 0,
      idempotency_key: `test-daily-offer-${Date.now()}`,
    };

    console.log('📤 Plasează comandă cu ofertă zilnică...');
    const orderResponse = await makeRequest('POST', '/api/kiosk/order', orderData);
    const orderResult = JSON.parse(orderResponse);

    console.log('✅ Comandă plasată cu succes!');
    console.log(`📋 Order ID: ${orderResult.order?.id || orderResult.order_id}`);
    console.log(`💰 Total: ${orderResult.order?.total || orderResult.total} RON`);

    // Calculează totalul așteptat (doar produsele plătite)
    const expectedTotal = conditionProducts.reduce((sum, p) => sum + p.price, 0);
    console.log(`🎯 Total așteptat (doar plătite): ${expectedTotal} RON`);

  } catch (error) {
    console.error('❌ Eroare:', error.message);
  }
}

testDailyOffer();