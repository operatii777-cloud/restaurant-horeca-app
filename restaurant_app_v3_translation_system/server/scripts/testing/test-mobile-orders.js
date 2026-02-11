/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST COMPLET: COMENZI DIN APLICAȚIA MOBILĂ
 * 
 * Testează toate scenariile de comandă din aplicația mobilă:
 * 1. Plată în aplicație (card) - Ridicare personală
 * 2. Plată la ridicare (cash) - Ridicare personală
 * 3. Plată în aplicație (card) - Livrare
 * 4. Plată la livrare (cash) - Livrare
 * 
 * Apoi testează gestionarea în interfețele de ospătar și curier
 * ═══════════════════════════════════════════════════════════════════════════
 */

const http = require('http');
const { dbPromise } = require('../../database');

const BASE_URL = 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

// Culori pentru console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper pentru HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    // Asigură-te că path-ul începe cu /api
    const fullPath = path.startsWith('/api') ? path : `/api${path}`;
    const url = new URL(fullPath, BASE_URL);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
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

// Obține produse disponibile direct din baza de date (fără rețete sau cu stoc disponibil)
async function getAvailableProducts() {
  log('\n📦 Obțin produse disponibile din baza de date...', 'cyan');
  
  // Așteaptă ca baza de date să fie complet inițializată
  const db = await dbPromise;
  
  // Așteaptă puțin pentru a se asigura că toate tabelele sunt create
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Găsește produse care NU au rețete asociate (nu necesită ingrediente)
  // Sau produse care au rețete dar toate ingredientele au stoc disponibil
  let products = await new Promise((resolve, reject) => {
    db.all(`
      SELECT DISTINCT
        m.id,
        m.name,
        m.name_en,
        m.price,
        m.is_active,
        m.category,
        CASE 
          WHEN r.id IS NULL THEN 1 
          ELSE 0 
        END as has_no_recipe
      FROM menu m
      LEFT JOIN recipes r ON r.menu_item_id = m.id
      WHERE m.is_active = 1 AND m.price > 0
      GROUP BY m.id
      HAVING has_no_recipe = 1 OR COUNT(r.id) = 0
      ORDER BY has_no_recipe DESC, m.name
      LIMIT 20
    `, [], (err, rows) => {
      if (err) {
        // Dacă query-ul eșuează (tabela recipes nu există), folosește doar menu
        db.all(`
          SELECT 
            id,
            name,
            name_en,
            price,
            is_active,
            category
          FROM menu
          WHERE is_active = 1 AND price > 0
          ORDER BY name
          LIMIT 20
        `, [], (err2, rows2) => {
          if (err2) reject(err2);
          else resolve(rows2 || []);
        });
      } else {
        resolve(rows || []);
      }
    });
  });
  
  if (products.length === 0) {
    throw new Error('Nu s-au găsit produse disponibile în baza de date');
  }
  
  // Formatează produsele pentru a fi compatibile cu API-ul
  const formattedProducts = products.map(p => ({
    id: p.id,
    product_id: p.id,
    name: p.name,
    name_en: p.name_en || p.name,
    price: parseFloat(p.price) || 0,
    available: true,
  })).filter(p => p.price > 0);
  
  // Prioritizează produse fără rețete (băuturi simple, apă, etc.)
  const simpleProducts = formattedProducts.filter(p => {
    const name = p.name.toLowerCase();
    // Include doar produse simple: apă, băuturi răcoritoare, etc.
    return name.includes('apă') || name.includes('apa') || 
           name.includes('cola') || name.includes('suc') ||
           name.includes('7 up') || name.includes('fanta') ||
           name.includes('sprite') || name.includes('pepsi');
  });
  
  // Dacă nu sunt suficiente produse simple, folosește primele 3 din lista completă
  const selectedProducts = (simpleProducts.length >= 2 ? simpleProducts : formattedProducts).slice(0, 3);
  
  log(`✅ Găsite ${selectedProducts.length} produse disponibile`, 'green');
  selectedProducts.forEach(p => {
    log(`   - ${p.name} (${p.price.toFixed(2)} RON)`, 'cyan');
  });
  
  return selectedProducts;
}

// Creează comandă din aplicația mobilă
async function createMobileOrder(scenario) {
  log(`\n🛒 Creând comandă: ${scenario.name}`, 'blue');
  
  const products = await getAvailableProducts();
  if (products.length < 2) {
    throw new Error('Nu sunt suficiente produse disponibile');
  }
  
  // Selectează 2-3 produse
  const selectedProducts = products.slice(0, Math.min(3, products.length));
  const items = selectedProducts.map(p => ({
    product_id: p.id,
    name: p.name,
    quantity: 1,
    price: p.price,
    total: p.price,
  }));
  
  const total = items.reduce((sum, item) => sum + item.total, 0);
  
  const orderData = {
    type: scenario.orderType, // 'takeaway' sau 'delivery'
    items,
    total,
    payment_method: scenario.paymentMethod,
    payment_timing: scenario.paymentTiming,
    is_paid: scenario.isPaid ? 1 : 0,
    notes: `Test: ${scenario.name}`,
    platform: 'MOBILE_APP',
    idempotency_key: `test-${Date.now()}-${Math.random()}`,
    customer: {
      name: scenario.customerName,
      phone: scenario.customerPhone,
    },
  };
  
  // Adaugă adresa dacă e livrare (în formatul așteptat de controller)
  if (scenario.orderType === 'delivery') {
    const deliveryAddress = scenario.deliveryAddress || 'Strada Test, București';
    orderData.delivery = {
      address: deliveryAddress,
    };
    // Adaugă și direct pentru compatibilitate
    orderData.delivery_address = deliveryAddress;
  }
  
  const response = await makeRequest('POST', '/kiosk/order', orderData);
  
  // Verifică dacă răspunsul este HTML (eroare de routing)
  if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
    log(`❌ EROARE: Endpoint-ul returnează HTML în loc de JSON!`, 'red');
    log(`   Verifică dacă serverul rulează și dacă ruta /api/kiosk/order este corect montată`, 'yellow');
    throw new Error('Endpoint returns HTML instead of JSON - routing issue');
  }
  
  if (response.status !== 200 || !response.data.success) {
    log(`❌ Eroare la crearea comenzii: ${JSON.stringify(response.data).substring(0, 200)}...`, 'red');
    throw new Error(`Failed to create order: ${JSON.stringify(response.data.error || response.data)}`);
  }
  
  // Extrage orderId din diferite formate posibile (camelCase și snake_case)
  const orderId = response.data.orderId ||  // camelCase (format nou)
                  response.data.order_id || // snake_case (format vechi)
                  response.data.id || 
                  response.data.data?.id ||
                  response.data.data?.order_id ||
                  response.data.data?.orderId ||
                  response.data.order?.id;
  
  if (!orderId) {
    log(`⚠️  Răspuns primit: ${JSON.stringify(response.data)}`, 'yellow');
    throw new Error('Order ID not found in response');
  }
  
  log(`✅ Comandă creată: #${orderId}`, 'green');
  log(`   Total: ${total.toFixed(2)} RON`, 'cyan');
  log(`   Plată: ${scenario.paymentMethod} - ${scenario.paymentTiming}`, 'cyan');
  log(`   Status plată: ${scenario.isPaid ? 'Achitată' : 'Neachitată'}`, 'cyan');
  
  return { orderId, orderData, total };
}

// Verifică comanda în baza de date
async function verifyOrder(orderId) {
  const db = await dbPromise;
  const order = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  if (!order) {
    throw new Error(`Comanda #${orderId} nu a fost găsită în baza de date`);
  }
  
  return order;
}

// Marchează comanda ca achitată
async function markOrderAsPaid(orderId) {
  log(`\n💰 Marchez comanda #${orderId} ca achitată...`, 'yellow');
  const response = await makeRequest('PUT', `/orders/${orderId}/mark-paid`);
  
  if (response.status !== 200 || !response.data.success) {
    log(`❌ Eroare: ${JSON.stringify(response.data)}`, 'red');
    throw new Error('Failed to mark order as paid');
  }
  
  log(`✅ Comandă marcată ca achitată`, 'green');
  return response.data;
}

// Marchează comanda ca livrată
async function markOrderAsDelivered(orderId, deliveredBy = 'waiter') {
  log(`\n🚚 Marchez comanda #${orderId} ca livrată (${deliveredBy})...`, 'yellow');
  const response = await makeRequest('PUT', `/orders/${orderId}/deliver`, {
    delivered_by: deliveredBy,
  });
  
  if (response.status !== 200 || !response.data.success) {
    log(`❌ Eroare: ${JSON.stringify(response.data)}`, 'red');
    throw new Error('Failed to mark order as delivered');
  }
  
  log(`✅ Comandă marcată ca livrată`, 'green');
  if (response.data.wasPaid !== undefined) {
    log(`   Auto-marcat ca achitată: ${response.data.wasPaid ? 'Da' : 'Nu'}`, 'cyan');
  }
  
  return response.data;
}

// Verifică comanda în KDS/Bar
async function checkOrderInKDS(orderId) {
  log(`\n📺 Verific comanda #${orderId} în KDS/Bar...`, 'cyan');
  const response = await makeRequest('GET', `/orders/${orderId}`);
  
  if (response.status !== 200 || !response.data.success) {
    log(`❌ Eroare: ${JSON.stringify(response.data)}`, 'red');
    return null;
  }
  
  const order = response.data.order || response.data.data;
  log(`✅ Comandă găsită în sistem`, 'green');
  log(`   Status: ${order.status}`, 'cyan');
  log(`   Plată: ${order.is_paid == 1 ? 'Achitată' : 'Neachitată'}`, 'cyan');
  log(`   Metodă plată: ${order.payment_method || 'N/A'}`, 'cyan');
  
  return order;
}

// Test principal
async function runTests() {
  log('\n═══════════════════════════════════════════════════════════════', 'blue');
  log('🧪 TEST COMPLET: COMENZI DIN APLICAȚIA MOBILĂ', 'blue');
  log('═══════════════════════════════════════════════════════════════\n', 'blue');
  
  const scenarios = [
    {
      name: 'Plată în aplicație (card) - Ridicare personală',
      orderType: 'takeaway', // takeaway = ridicare personală
      paymentMethod: 'card',
      paymentTiming: 'inApp',
      isPaid: true,
      customerName: 'Test Client 1',
      customerPhone: '0712345671',
    },
    {
      name: 'Plată la ridicare (cash) - Ridicare personală',
      orderType: 'takeaway',
      paymentMethod: 'cash',
      paymentTiming: 'onPickup',
      isPaid: false,
      customerName: 'Test Client 2',
      customerPhone: '0712345672',
    },
    {
      name: 'Plată în aplicație (card) - Livrare',
      orderType: 'delivery',
      paymentMethod: 'card',
      paymentTiming: 'inApp',
      isPaid: true,
      customerName: 'Test Client 3',
      customerPhone: '0712345673',
      deliveryAddress: 'Strada Test 123, București',
    },
    {
      name: 'Plată la livrare (cash) - Livrare',
      orderType: 'delivery',
      paymentMethod: 'cash',
      paymentTiming: 'onDelivery',
      isPaid: false,
      customerName: 'Test Client 4',
      customerPhone: '0712345674',
      deliveryAddress: 'Strada Test 456, București',
    },
  ];
  
  const results = [];
  
  try {
    // Test 1: Creează toate comenzile
    log('\n═══════════════════════════════════════════════════════════════', 'yellow');
    log('FAZA 1: CREARE COMENZI', 'yellow');
    log('═══════════════════════════════════════════════════════════════\n', 'yellow');
    
    for (const scenario of scenarios) {
      try {
        const { orderId, total } = await createMobileOrder(scenario);
        
        // Verifică în baza de date
        const order = await verifyOrder(orderId);
        
        // Verifică statusul plății
        const expectedPaid = scenario.isPaid ? 1 : 0;
        if (order.is_paid != expectedPaid) {
          log(`⚠️  ATENȚIE: Status plată neașteptat! Așteptat: ${expectedPaid}, Găsit: ${order.is_paid}`, 'yellow');
        }
        
        // Verifică în KDS/Bar
        await checkOrderInKDS(orderId);
        
        results.push({
          scenario: scenario.name,
          orderId,
          total,
          order,
          success: true,
        });
        
        // Așteaptă puțin între comenzi
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        log(`❌ Eroare la scenariul "${scenario.name}": ${error.message}`, 'red');
        results.push({
          scenario: scenario.name,
          success: false,
          error: error.message,
        });
      }
    }
    
    // Test 2: Gestionare comenzilor cu ridicare personală
    log('\n═══════════════════════════════════════════════════════════════', 'yellow');
    log('FAZA 2: GESTIONARE COMENZI CU RIDICARE PERSONALĂ', 'yellow');
    log('═══════════════════════════════════════════════════════════════\n', 'yellow');
    
    const pickupOrders = results.filter(r => 
      r.success && 
      (r.scenario.includes('Ridicare personală'))
    );
    
    for (const result of pickupOrders) {
      const order = result.order;
      
      // Dacă nu este achitată, marchează ca achitată
      if (order.is_paid == 0) {
        await markOrderAsPaid(result.orderId);
        // Re-verifică
        const updatedOrder = await verifyOrder(result.orderId);
        if (updatedOrder.is_paid != 1) {
          log(`❌ EROARE: Comanda #${result.orderId} nu a fost marcată corect ca achitată!`, 'red');
        }
      }
      
      // Marchează ca livrată
      await markOrderAsDelivered(result.orderId, 'waiter');
      
      // Verifică final
      const finalOrder = await verifyOrder(result.orderId);
      if (finalOrder.status !== 'delivered') {
        log(`❌ EROARE: Comanda #${result.orderId} nu a fost marcată corect ca livrată!`, 'red');
      }
      if (finalOrder.is_paid != 1) {
        log(`❌ EROARE: Comanda #${result.orderId} nu este marcată ca achitată după livrare!`, 'red');
      }
      
      log(`✅ Comandă #${result.orderId} gestionată complet`, 'green');
    }
    
    // Test 3: Gestionare comenzilor cu livrare
    log('\n═══════════════════════════════════════════════════════════════', 'yellow');
    log('FAZA 3: GESTIONARE COMENZI CU LIVRARE', 'yellow');
    log('═══════════════════════════════════════════════════════════════\n', 'yellow');
    
    const deliveryOrders = results.filter(r => 
      r.success && 
      (r.scenario.includes('Livrare'))
    );
    
    for (const result of deliveryOrders) {
      const order = result.order;
      
      // Dacă nu este achitată și e cash, marchează ca achitată (simulare curier)
      if (order.is_paid == 0 && order.payment_method === 'cash') {
        await markOrderAsPaid(result.orderId);
      }
      
      // Marchează ca livrată (curier)
      await markOrderAsDelivered(result.orderId, 'courier');
      
      // Verifică final
      const finalOrder = await verifyOrder(result.orderId);
      if (finalOrder.status !== 'delivered') {
        log(`❌ EROARE: Comanda #${result.orderId} nu a fost marcată corect ca livrată!`, 'red');
      }
      if (finalOrder.is_paid != 1) {
        log(`❌ EROARE: Comanda #${result.orderId} nu este marcată ca achitată după livrare!`, 'red');
      }
      
      log(`✅ Comandă #${result.orderId} gestionată complet`, 'green');
    }
    
    // Rezumat final
    log('\n═══════════════════════════════════════════════════════════════', 'blue');
    log('📊 REZUMAT FINAL', 'blue');
    log('═══════════════════════════════════════════════════════════════\n', 'blue');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    log(`✅ Comenzi create cu succes: ${successful.length}/${scenarios.length}`, 'green');
    if (failed.length > 0) {
      log(`❌ Comenzi eșuate: ${failed.length}`, 'red');
      failed.forEach(f => {
        log(`   - ${f.scenario}: ${f.error}`, 'red');
      });
    }
    
    if (successful.length > 0) {
      const totalAmount = successful.reduce((sum, r) => sum + (r.total || 0), 0);
      log(`\n💰 Total comandat: ${totalAmount.toFixed(2)} RON`, 'cyan');
      log(`📦 Comenzi procesate: ${successful.length}`, 'cyan');
    }
    
    log('\n✅ Test complet finalizat!', 'green');
    
  } catch (error) {
    log(`\n❌ EROARE CRITICĂ: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Rulează testele
runTests()
  .then(() => {
    log('\n🎉 Toate testele au fost finalizate!', 'green');
    process.exit(0);
  })
  .catch((error) => {
    log(`\n💥 EROARE FATALĂ: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
