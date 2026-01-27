// Script simplificat pentru testare pas cu pas
console.log('🚀 Script pornit...');
const axios = require('axios');
console.log('✅ Axios încărcat');

const BASE_URL = 'http://localhost:3001';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

let token = null;

async function getToken() {
  if (token) return token;
  try {
    const r = await axios.post(`${BASE_URL}/api/auth/login`, { username: ADMIN_USERNAME, password: ADMIN_PASSWORD }, { timeout: 3000 });
    token = r.data.sessionToken || r.data.token || 'admin_' + Date.now();
    return token;
  } catch (e) {
    token = 'admin_' + Date.now();
    return token;
  }
}

async function authReq(method, url, data) {
  const t = await getToken();
  const config = { method, url, timeout: 5000, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` } };
  if (data) config.data = data;
  return axios(config);
}

async function test(name, fn) {
  try {
    process.stdout.write(`\n🔄 ${name}... `);
    await fn();
    console.log('✅');
    return true;
  } catch (e) {
    console.log(`❌ ${e.response?.status || e.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Testare API endpoints P0-P1\n');
  console.log(`📍 Server: ${BASE_URL}\n`);
  
  let ok = 0, fail = 0;
  
  // Test 1
  if (await test('1. Conversie kg→g', async () => {
    const r = await axios.post(`${BASE_URL}/api/units/validate-conversion`, { fromUnit: 'kg', toUnit: 'g', quantity: 2 }, { timeout: 3000 });
    if (r.status !== 200 || !r.data.success || r.data.value !== 2000) throw new Error('Invalid');
  })) ok++; else fail++;
  
  // Test 2
  if (await test('2. Conversie l→ml', async () => {
    const r = await axios.post(`${BASE_URL}/api/units/validate-conversion`, { fromUnit: 'l', toUnit: 'ml', quantity: 1.5 }, { timeout: 3000 });
    if (r.status !== 200 || !r.data.success || r.data.value !== 1500) throw new Error('Invalid');
  })) ok++; else fail++;
  
  // Test 3
  if (await test('3. Conversie incompatibilă', async () => {
    const r = await axios.post(`${BASE_URL}/api/units/validate-conversion`, { fromUnit: 'kg', toUnit: 'ml', quantity: 1 }, { timeout: 3000 });
    if (r.status !== 200 || r.data.success !== false) throw new Error('Should fail');
  })) ok++; else fail++;
  
  // Test 4
  if (await test('4. Listă unități', async () => {
    const r = await axios.get(`${BASE_URL}/api/units/list`, { timeout: 3000 });
    if (r.status !== 200 || !r.data.units || !Array.isArray(r.data.units)) throw new Error('Invalid');
  })) ok++; else fail++;
  
  // Test 5
  if (await test('5. Listă unități (weight)', async () => {
    const r = await axios.get(`${BASE_URL}/api/units/list?category=weight`, { timeout: 3000 });
    if (r.status !== 200 || !r.data.units) throw new Error('Invalid');
  })) ok++; else fail++;
  
  // Test 6
  if (await test('6. Categorii unități', async () => {
    const r = await axios.get(`${BASE_URL}/api/units/categories`, { timeout: 3000 });
    if (r.status !== 200 || !r.data.categories || !Array.isArray(r.data.categories)) throw new Error('Invalid');
  })) ok++; else fail++;
  
  // Test 7
  if (await test('7. Listă preparații', async () => {
    const r = await axios.get(`${BASE_URL}/api/recipes/preparations`, { timeout: 3000 });
    if (r.status !== 200 || !r.data.preparations || !Array.isArray(r.data.preparations)) throw new Error('Invalid');
  })) ok++; else fail++;
  
  // Test 8
  if (await test('8. Stock valuation (GET)', async () => {
    const r = await authReq('GET', `${BASE_URL}/api/settings/stock-valuation`);
    if (r.status !== 200 || !r.data.success || !r.data.config) throw new Error('Invalid');
  })) ok++; else fail++;
  
  // Test 9
  if (await test('9. Stock valuation (LIFO)', async () => {
    const r = await authReq('PUT', `${BASE_URL}/api/settings/stock-valuation`, { method: 'LIFO' });
    if (r.status !== 200 || !r.data.success || r.data.method !== 'LIFO') throw new Error('Invalid');
  })) ok++; else fail++;
  
  // Test 10
  if (await test('10. Stock valuation (AVERAGE)', async () => {
    const r = await authReq('PUT', `${BASE_URL}/api/settings/stock-valuation`, { method: 'AVERAGE' });
    if (r.status !== 200 || !r.data.success || r.data.method !== 'AVERAGE') throw new Error('Invalid');
  })) ok++; else fail++;
  
  // Test 11
  if (await test('11. Stock valuation (FIFO restore)', async () => {
    const r = await authReq('PUT', `${BASE_URL}/api/settings/stock-valuation`, { method: 'FIFO' });
    if (r.status !== 200 || !r.data.success || r.data.method !== 'FIFO') throw new Error('Invalid');
  })) ok++; else fail++;
  
  // Test 12
  if (await test('12. Recalculare costuri', async () => {
    const r = await authReq('POST', `${BASE_URL}/api/recipes/recalculate-all-costs`);
    if (r.status !== 200 || !r.data.success) throw new Error('Invalid');
  })) ok++; else fail++;
  
  // Test 13
  if (await test('13. Queue recalculare', async () => {
    const r = await authReq('GET', `${BASE_URL}/api/recipes/recalculation-queue`);
    if (r.status !== 200 || !r.data.success || !Array.isArray(r.data.queue)) throw new Error('Invalid');
  })) ok++; else fail++;
  
  // Test 14
  if (await test('14. Recalculare average costs', async () => {
    const r = await authReq('POST', `${BASE_URL}/api/ingredients/recalculate-average-costs`);
    if (r.status !== 200 || !r.data.success) throw new Error('Invalid');
  })) ok++; else fail++;
  
  console.log(`\n📊 Rezultate: ${ok} ✅ | ${fail} ❌`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });

