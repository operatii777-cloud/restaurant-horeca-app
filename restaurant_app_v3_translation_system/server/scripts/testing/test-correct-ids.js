const http = require('http');

// Test pentru a verifica că comenzile folosesc ID-uri corecte
async function testOrderWithCorrectIds() {
  console.log('🧪 Test: Plasare comandă cu ID-uri corecte din API\n');

  try {
    // 1. Ia produse din API
    const menuResponse = await makeRequest('GET', '/api/menu/all');
    const products = JSON.parse(menuResponse).data;

    if (!products || products.length === 0) {
      throw new Error('Nu s-au găsit produse în API');
    }

    // Ia primele 2 produse
    const product1 = products[0];
    const product2 = products[1];

    console.log(`📦 Produs 1: ID=${product1.id}, Nume=${product1.name}`);
    console.log(`📦 Produs 2: ID=${product2.id}, Nume=${product2.name}\n`);

    // 2. Creează cartItems cu ID-uri corecte
    const cartItems = [
      {
        id: product1.id,
        product_id: product1.id,
        name: product1.name,
        price: product1.price,
        quantity: 1,
      },
      {
        id: product2.id,
        product_id: product2.id,
        name: product2.name,
        price: product2.price,
        quantity: 2,
      }
    ];

    // 3. Plasează comanda
    const orderData = {
      items: cartItems,
      customer_name: 'Test Client',
      customer_phone: '+40700111222',
      payment_method: 'cash',
      type: 'takeaway',
      is_paid: 0,
      idempotency_key: `test-correct-ids-${Date.now()}`,
    };

    console.log('📤 Trimit comandă la /api/kiosk/order...');
    const orderResponse = await makeRequest('POST', '/api/kiosk/order', orderData);
    const result = JSON.parse(orderResponse);

    console.log('✅ Comandă plasată cu succes!');
    console.log('📄 Response complet:', JSON.stringify(result, null, 2));
    console.log(`📋 Order ID: ${result.data?.id || result.id || 'N/A'}`);
    console.log(`💰 Total: ${result.data?.total || result.total || 'N/A'} RON`);

    // 4. Verifică istoricul pentru a vedea dacă produsele sunt corecte
    console.log('\n🔍 Verific istoric...');
    const historyResponse = await makeRequest('GET', '/api/daily-history/kitchen');
    const history = JSON.parse(historyResponse);

    console.log('📄 History response:', JSON.stringify(history, null, 2));

    if (history.success && history.data && history.data.length > 0) {
      const latestOrder = history.data[0];
      console.log(`📊 Ultima comandă: ${latestOrder.id}`);
      console.log('📦 Produse în comandă:');
      if (latestOrder.items) {
        latestOrder.items.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name} (ID: ${item.product_id})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Eroare:', error.message);
  }
}

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

// Rulează testul
testOrderWithCorrectIds();