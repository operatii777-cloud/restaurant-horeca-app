const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001';
const results = [];

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  results.push(line);
}

async function test(name, fn) {
  try {
    log(`🔄 ${name}...`);
    await fn();
    log(`✅ ${name} - PASS`);
    return true;
  } catch (e) {
    log(`❌ ${name} - FAIL: ${e.message}`);
    if (e.response) {
      log(`   Status: ${e.response.status}`);
      log(`   Data: ${JSON.stringify(e.response.data)}`);
    }
    return false;
  }
}

async function getToken() {
  try {
    const r = await axios.post(`${BASE_URL}/api/auth/login`, 
      { username: 'admin', password: 'admin' }, 
      { timeout: 3000 });
    return r.data.sessionToken || r.data.token || 'admin_' + Date.now();
  } catch (e) {
    return 'admin_' + Date.now();
  }
}

async function authReq(method, url, data) {
  const t = await getToken();
  const config = {
    method, url, timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${t}`
    }
  };
  if (data) config.data = data;
  return axios(config);
}

async function main() {
  log('🚀 Testare API endpoints P0-P1');
  log(`📍 Server: ${BASE_URL}\n`);
  
  let ok = 0, fail = 0;
  
  // Teste Unit Conversion
  if (await test('1. Conversie kg→g', async () => {
    const r = await axios.post(`${BASE_URL}/api/units/validate-conversion`, 
      { fromUnit: 'kg', toUnit: 'g', quantity: 2 }, 
      { timeout: 3000 });
    if (r.status !== 200 || !r.data.success || r.data.value !== 2000) throw new Error('Invalid');
  })) ok++; else fail++;
  
  if (await test('2. Conversie l→ml', async () => {
    const r = await axios.post(`${BASE_URL}/api/units/validate-conversion`, 
      { fromUnit: 'l', toUnit: 'ml', quantity: 1.5 }, 
      { timeout: 3000 });
    if (r.status !== 200 || !r.data.success || r.data.value !== 1500) throw new Error('Invalid');
  })) ok++; else fail++;
  
  if (await test('3. Conversie incompatibilă', async () => {
    const r = await axios.post(`${BASE_URL}/api/units/validate-conversion`, 
      { fromUnit: 'kg', toUnit: 'ml', quantity: 1 }, 
      { timeout: 3000 });
    if (r.status !== 200 || r.data.success !== false) throw new Error('Should fail');
  })) ok++; else fail++;
  
  if (await test('4. Listă unități', async () => {
    const r = await axios.get(`${BASE_URL}/api/units/list`, { timeout: 3000 });
    if (r.status !== 200 || !r.data.units || !Array.isArray(r.data.units)) throw new Error('Invalid');
  })) ok++; else fail++;
  
  if (await test('5. Categorii unități', async () => {
    const r = await axios.get(`${BASE_URL}/api/units/categories`, { timeout: 3000 });
    if (r.status !== 200 || !r.data.categories || !Array.isArray(r.data.categories)) throw new Error('Invalid');
  })) ok++; else fail++;
  
  if (await test('6. Listă preparații', async () => {
    const r = await axios.get(`${BASE_URL}/api/recipes/preparations`, { timeout: 3000 });
    if (r.status !== 200 || !r.data.preparations || !Array.isArray(r.data.preparations)) throw new Error('Invalid');
  })) ok++; else fail++;
  
  if (await test('7. Stock valuation (GET)', async () => {
    const r = await authReq('GET', `${BASE_URL}/api/settings/stock-valuation`);
    if (r.status !== 200 || !r.data.success || !r.data.config) throw new Error('Invalid');
  })) ok++; else fail++;
  
  if (await test('8. Stock valuation (LIFO)', async () => {
    const r = await authReq('PUT', `${BASE_URL}/api/settings/stock-valuation`, { method: 'LIFO' });
    if (r.status !== 200 || !r.data.success || r.data.method !== 'LIFO') throw new Error('Invalid');
  })) ok++; else fail++;
  
  if (await test('9. Stock valuation (AVERAGE)', async () => {
    const r = await authReq('PUT', `${BASE_URL}/api/settings/stock-valuation`, { method: 'AVERAGE' });
    if (r.status !== 200 || !r.data.success || r.data.method !== 'AVERAGE') throw new Error('Invalid');
  })) ok++; else fail++;
  
  if (await test('10. Stock valuation (FIFO restore)', async () => {
    const r = await authReq('PUT', `${BASE_URL}/api/settings/stock-valuation`, { method: 'FIFO' });
    if (r.status !== 200 || !r.data.success || r.data.method !== 'FIFO') throw new Error('Invalid');
  })) ok++; else fail++;
  
  if (await test('11. Recalculare costuri', async () => {
    const r = await authReq('POST', `${BASE_URL}/api/recipes/recalculate-all-costs`);
    if (r.status !== 200 || !r.data.success) throw new Error('Invalid');
  })) ok++; else fail++;
  
  if (await test('12. Queue recalculare', async () => {
    const r = await authReq('GET', `${BASE_URL}/api/recipes/recalculation-queue`);
    if (r.status !== 200 || !r.data.success || !Array.isArray(r.data.queue)) throw new Error('Invalid');
  })) ok++; else fail++;
  
  if (await test('13. Recalculare average costs', async () => {
    const r = await authReq('POST', `${BASE_URL}/api/ingredients/recalculate-average-costs`);
    if (r.status !== 200 || !r.data.success) throw new Error('Invalid');
  })) ok++; else fail++;
  
  log(`\n📊 Rezultate: ${ok} ✅ | ${fail} ❌`);
  
  // Scrie în fișier
  fs.writeFileSync('test-results.txt', results.join('\n'));
  log('💾 Rezultate salvate în test-results.txt');
  
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => {
  log(`FATAL: ${e.message}`);
  fs.writeFileSync('test-results.txt', results.join('\n'));
  process.exit(1);
});

