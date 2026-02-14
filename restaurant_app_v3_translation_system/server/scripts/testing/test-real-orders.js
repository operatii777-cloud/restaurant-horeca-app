/**
 * TEST COMENZI REALE
 * Testează middleware-ul cu comenzi reale din aplicația mobilă
 */

const http = require('http');
const { dbPromise } = require('../../database');

const BASE_URL = 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

/**
 * Helper pentru request-uri HTTP
 */
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    // Construiește URL-ul corect - folosește BASE_URL pentru a evita probleme cu URL parsing
    let fullPath = path;
    if (!path.startsWith('/')) {
      fullPath = '/' + path;
    }
    if (!fullPath.startsWith('/api/')) {
      fullPath = '/api' + fullPath;
    }
    
    const options = {
      method,
      hostname: 'localhost',
      port: 3001,
      path: fullPath,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Test-Real-Orders/1.0',
        'Connection': 'close', // Force close connection after response
        ...headers
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        // Verifică Content-Type pentru a determina dacă este JSON
        const contentType = res.headers['content-type'] || '';
        const isJson = contentType.includes('application/json');
        
        // Verifică dacă este HTML (catch-all route sau eroare)
        const isHtml = body.trim().startsWith('<!doctype') || 
                      body.trim().startsWith('<html') ||
                      body.trim().startsWith('<!DOCTYPE');
        
        if (isHtml) {
          resolve({ 
            status: res.statusCode, 
            data: { 
              error: 'HTML response received - endpoint may not exist or server returned HTML',
              isHtml: true
            }, 
            raw: body.substring(0, 500),
            headers: res.headers,
            isHtml: true
          });
          return;
        }
        
        // Încearcă să parseze JSON
        if (isJson || body.trim().startsWith('{') || body.trim().startsWith('[')) {
          try {
            const parsed = body.trim() ? JSON.parse(body) : {};
            resolve({ 
              status: res.statusCode, 
              data: parsed, 
              raw: body,
              headers: res.headers,
              isJson: true
            });
          } catch (e) {
            // Dacă nu poate parsa JSON, returnează raw cu eroare
            resolve({ 
              status: res.statusCode, 
              data: { 
                error: 'Invalid JSON response',
                parseError: e.message,
                raw: body.substring(0, 500)
              }, 
              raw: body,
              headers: res.headers,
              isJson: false
            });
          }
        } else {
          // Nu este JSON, returnează raw
          resolve({ 
            status: res.statusCode, 
            data: { 
              error: 'Non-JSON response',
              raw: body.substring(0, 500)
            }, 
            raw: body,
            headers: res.headers,
            isJson: false
          });
        }
      });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        resolve({
          status: 0,
          data: { 
            error: 'Server not running. Start server with: node server.js',
            code: 'ECONNREFUSED'
          },
          isError: true
        });
      } else {
        reject(error);
      }
    });
    
    // Setează timeout pentru request
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        status: 0,
        data: { 
          error: 'Request timeout after 10 seconds',
          code: 'TIMEOUT'
        },
        isError: true
      });
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Obține produse disponibile din baza de date
 */
async function getAvailableProducts(limit = 5) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT id, name, price, category 
      FROM menu 
      WHERE is_sellable = 1 
        AND (is_active = 1 OR is_active IS NULL)
      LIMIT ?
    `, [limit], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Testează creare comandă reală din aplicația mobilă
 */
async function testRealMobileOrder() {
  console.log('\n🧪 TEST 1: Comandă reală din aplicația mobilă (restorapp)\n');
  
  try {
    // Obține produse disponibile
    const products = await getAvailableProducts(3);
    if (products.length === 0) {
      console.log('   ⚠️  Nu există produse disponibile în baza de date');
      return;
    }
    
    console.log(`   📦 Produse disponibile: ${products.length}`);
    products.forEach(p => {
      console.log(`      - ${p.name} (ID: ${p.id}, Preț: ${p.price} RON)`);
    });
    
    // Creează comandă reală (structură corectă pentru middleware)
    const orderPayload = {
      items: products.map(p => ({
        product_id: p.id,
        product_name: p.name,
        name: p.name,
        quantity: 1,
        price: parseFloat(p.price) || 0,
        finalPrice: parseFloat(p.price) || 0,
        category: p.category || null
      })),
      type: 'takeaway',
      total: products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0),
      payment_method: 'cash',
      payment_timing: 'onPickup',
      is_paid: 0,
      idempotency_key: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    console.log('\n   📝 Creând comandă...');
    console.log(`      Tip: ${orderPayload.type}`);
    console.log(`      Items: ${orderPayload.items.length}`);
    console.log(`      Total: ${orderPayload.total} RON`);
    console.log(`      Payment: ${orderPayload.payment_method} (${orderPayload.payment_timing})`);
    
    const response = await makeRequest('POST', '/kiosk/order', orderPayload);
    
    // Verifică erori de conexiune
    if (response.isError) {
      console.log(`\n   ❌ ${response.data.error}`);
      if (response.data.code === 'ECONNREFUSED') {
        console.log(`      ⚠️  Serverul nu rulează. Pornește serverul cu: node server.js`);
      }
      return { success: false, error: response.data.error };
    }
    
    // Verifică dacă răspunsul este HTML
    if (response.isHtml) {
      console.log(`\n   ❌ Serverul returnează HTML - endpoint-ul nu este găsit sau serverul nu rulează`);
      console.log(`      Status: ${response.status}`);
      console.log(`      Content-Type: ${response.headers['content-type'] || 'N/A'}`);
      console.log(`      Raw response (first 200 chars): ${response.raw.substring(0, 200)}`);
      console.log(`      ⚠️  Verifică că serverul rulează: node server.js`);
      return { success: false, error: 'HTML response - endpoint not found' };
    }
    
    // Verifică dacă răspunsul este JSON valid
    if (!response.isJson && response.status !== 200 && response.status !== 201) {
      console.log(`\n   ❌ Răspuns neașteptat: ${response.status}`);
      console.log(`      Data: ${JSON.stringify(response.data).substring(0, 300)}`);
      return { success: false, error: `Unexpected response: ${response.status}` };
    }
    
    if (response.status === 200 || response.status === 201) {
      const orderId = response.data.orderId || response.data.order_id || response.data.id;
      console.log(`\n   ✅ Comandă creată cu succes!`);
      console.log(`      Status: ${response.status}`);
      console.log(`      Content-Type: ${response.headers['content-type'] || 'N/A'}`);
      console.log(`      Response: ${JSON.stringify(response.data).substring(0, 300)}`);
      console.log(`      Order ID: ${orderId || 'N/A'}`);
      
      if (!orderId) {
        console.log('   ⚠️  Order ID nu a fost returnat în response');
        console.log(`      Full response: ${JSON.stringify(response.data)}`);
        return { success: false, error: 'Order ID not returned' };
      }
      
      // Așteaptă puțin pentru a permite procesarea completă (stock movements, events)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifică stocuri consumate
      const db = await dbPromise;
      const stockMoves = await new Promise((resolve, reject) => {
        // Verifică structura tabelului stock_moves
        db.all(`
          SELECT * FROM stock_moves
          WHERE (reference_id = ? AND reference_type = 'ORDER')
          ORDER BY timestamp DESC
        `, [orderId], (err, rows) => {
          if (err) {
            // Încearcă cu nume alternativ de coloană
            db.all(`
              SELECT * FROM stock_movements
              WHERE reference_id = ? AND reference_type = 'ORDER'
              ORDER BY timestamp DESC
            `, [orderId], (err2, rows2) => {
              if (err2) reject(err2);
              else resolve(rows2 || []);
            });
          } else {
            resolve(rows || []);
          }
        });
      });
      
      console.log(`      Stock Movements: ${stockMoves.length}`);
      if (stockMoves.length > 0) {
        console.log('      ✅ Stocuri consumate corect!');
      } else {
        console.log('      ⚠️  Nu există stock movements (poate produsele nu au rețete)');
      }
      
      // Verifică comanda în baza de date
      const order = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (order) {
        console.log(`      Platform: ${order.platform || 'N/A'}`);
        console.log(`      Order Source: ${order.order_source || 'N/A'}`);
        console.log(`      Status: ${order.status || 'N/A'}`);
        console.log(`      Is Paid: ${order.is_paid || 0}`);
      }
      
      return { success: true, orderId, stockMoves: stockMoves.length };
    } else {
      console.log(`\n   ❌ Eroare la crearea comenzii: ${response.status}`);
      console.log(`      Response: ${JSON.stringify(response.data).substring(0, 300)}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`\n   ❌ Eroare: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log('   ⚠️  Serverul nu rulează. Pornește serverul cu: node server.js');
    }
    return { success: false, error: error.message };
  }
}

/**
 * Testează creare comandă delivery
 */
async function testRealDeliveryOrder() {
  console.log('\n🧪 TEST 2: Comandă reală delivery din aplicația mobilă\n');
  
  try {
    const products = await getAvailableProducts(2);
    if (products.length === 0) {
      console.log('   ⚠️  Nu există produse disponibile');
      return;
    }
    
    const orderPayload = {
      items: products.map(p => ({
        product_id: p.id,
        product_name: p.name,
        name: p.name,
        quantity: 1,
        price: parseFloat(p.price) || 0,
        finalPrice: parseFloat(p.price) || 0,
        category: p.category || null
      })),
      type: 'delivery',
      delivery: {
        address: 'Strada Test 123, București'
      },
      total: products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0),
      payment_method: 'cash',
      payment_timing: 'onDelivery',
      is_paid: 0,
      idempotency_key: `test_delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    console.log('   📝 Creând comandă delivery...');
    
    const response = await makeRequest('POST', '/kiosk/order', orderPayload);
    
    // Verifică erori de conexiune
    if (response.isError) {
      console.log(`\n   ❌ ${response.data.error}`);
      if (response.data.code === 'ECONNREFUSED') {
        console.log(`      ⚠️  Serverul nu rulează. Pornește serverul cu: node server.js`);
      }
      return { success: false };
    }
    
    // Verifică dacă răspunsul este HTML
    if (response.isHtml) {
      console.log(`\n   ❌ Serverul returnează HTML - endpoint-ul nu este găsit`);
      console.log(`      Status: ${response.status}`);
      console.log(`      Content-Type: ${response.headers['content-type'] || 'N/A'}`);
      return { success: false };
    }
    
    // Verifică dacă răspunsul este JSON valid
    if (!response.isJson && response.status !== 200 && response.status !== 201) {
      console.log(`\n   ❌ Răspuns neașteptat: ${response.status}`);
      console.log(`      Data: ${JSON.stringify(response.data).substring(0, 300)}`);
      return { success: false };
    }
    
    if (response.status === 200 || response.status === 201) {
      const orderId = response.data.orderId || response.data.order_id || response.data.id;
      console.log(`\n   ✅ Comandă delivery creată cu succes!`);
      console.log(`      Status: ${response.status}`);
      console.log(`      Content-Type: ${response.headers['content-type'] || 'N/A'}`);
      console.log(`      Response: ${JSON.stringify(response.data).substring(0, 300)}`);
      console.log(`      Order ID: ${orderId || 'N/A'}`);
      
      if (!orderId) {
        console.log('   ⚠️  Order ID nu a fost returnat în response');
        console.log(`      Full response: ${JSON.stringify(response.data)}`);
        return { success: false };
      }
      
      // Verifică stocuri
      const db = await dbPromise;
      const stockMoves = await new Promise((resolve, reject) => {
        db.all(`
          SELECT COUNT(*) as count FROM stock_moves
          WHERE reference_id = ? AND reference_type = 'ORDER'
        `, [orderId], (err, row) => {
          if (err) {
            // Încearcă cu nume alternativ
            db.all(`
              SELECT COUNT(*) as count FROM stock_movements
              WHERE reference_id = ? AND reference_type = 'ORDER'
            `, [orderId], (err2, row2) => {
              if (err2) reject(err2);
              else resolve(row2?.[0]?.count || 0);
            });
          } else {
            resolve(row?.[0]?.count || 0);
          }
        });
      });
      
      console.log(`      Stock Movements: ${stockMoves}`);
      return { success: true, orderId };
    } else {
      console.log(`\n   ❌ Eroare: ${response.status}`);
      console.log(`      ${JSON.stringify(response.data).substring(0, 300)}`);
      return { success: false };
    }
  } catch (error) {
    console.log(`\n   ❌ Eroare: ${error.message}`);
    return { success: false };
  }
}

/**
 * Verifică uniformitatea comenzilor create
 */
async function checkOrderUniformity() {
  console.log('\n🧪 TEST 3: Verificare uniformitate comenzi\n');
  
  try {
    const db = await dbPromise;
    
    // Comenzi recente (ultimele 10)
    const recentOrders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id, platform, order_source, type, status, is_paid,
          timestamp
        FROM orders
        WHERE timestamp >= datetime('now', '-1 hour')
        ORDER BY timestamp DESC
        LIMIT 10
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    if (recentOrders.length === 0) {
      console.log('   ⚠️  Nu există comenzi recente');
      return;
    }
    
    console.log(`   📊 Comenzi recente: ${recentOrders.length}`);
    
    // Verifică stock_movements
    let ordersWithStock = 0;
    let ordersWithoutStock = 0;
    
    for (const order of recentOrders) {
      const stockMoves = await new Promise((resolve, reject) => {
        db.get(`
          SELECT COUNT(*) as count FROM stock_moves
          WHERE reference_id = ? AND reference_type = 'ORDER'
        `, [order.id], (err, row) => {
          if (err) {
            // Încearcă cu nume alternativ
            db.get(`
              SELECT COUNT(*) as count FROM stock_movements
              WHERE reference_id = ? AND reference_type = 'ORDER'
            `, [order.id], (err2, row2) => {
              if (err2) reject(err2);
              else resolve(row2?.count || 0);
            });
          } else {
            resolve(row?.count || 0);
          }
        });
      });
      
      if (stockMoves > 0) {
        ordersWithStock++;
      } else {
        ordersWithoutStock++;
        console.log(`      ⚠️  Comanda #${order.id} (${order.platform}) - fără stock_movements`);
      }
    }
    
    console.log(`\n   ✅ Comenzi cu stock_movements: ${ordersWithStock}`);
    console.log(`   ⚠️  Comenzi fără stock_movements: ${ordersWithoutStock}`);
    
    // Verifică platform și order_source
    const nullFields = recentOrders.filter(o => !o.platform || !o.order_source);
    if (nullFields.length > 0) {
      console.log(`\n   ⚠️  Comenzi cu platform/order_source NULL: ${nullFields.length}`);
      nullFields.forEach(o => {
        console.log(`      - Comanda #${o.id}: platform=${o.platform}, order_source=${o.order_source}`);
      });
    } else {
      console.log(`\n   ✅ Toate comenzile au platform și order_source setate`);
    }
  } catch (error) {
    console.log(`\n   ❌ Eroare: ${error.message}`);
  }
}

/**
 * Rulează toate testele
 */
async function runTests() {
  console.log('🚀 TESTARE COMENZI REALE CU MIDDLEWARE\n');
  console.log('='.repeat(60));
  
  // Așteaptă baza de date
  try {
    await dbPromise;
    console.log('✅ Baza de date conectată\n');
  } catch (error) {
    console.log('❌ Eroare la conectarea la baza de date:', error.message);
    process.exit(1);
  }
  
  const results = {
    mobileOrder: await testRealMobileOrder(),
    deliveryOrder: await testRealDeliveryOrder(),
  };
  
  await checkOrderUniformity();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 REZUMAT TESTE:');
  console.log(`   ✅ Comenzi mobile: ${results.mobileOrder.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`   ✅ Comenzi delivery: ${results.deliveryOrder.success ? 'SUCCESS' : 'FAILED'}`);
  console.log('\n✅ Testare completă!\n');
}

// Rulează testele dacă scriptul este executat direct
if (require.main === module) {
  runTests()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Eroare la rularea testelor:', error);
      process.exit(1);
    });
}

module.exports = { testRealMobileOrder, testRealDeliveryOrder, checkOrderUniformity };
