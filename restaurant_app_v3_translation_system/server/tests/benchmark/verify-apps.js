/**
 * Verificare separată per aplicație
 * Benchmark universal – fiecare aplicație poate avea configurare diferită
 *
 * Usage:
 *   node verify-apps.js <baseURL> [profile]
 *
 * Profiles: restorapp | courier | v3 | hybrid
 * Dacă profile lipsește, verifică toate profile-urile relevante.
 *
 * Exemple:
 *   node verify-apps.js http://localhost:3001 restorapp
 *   node verify-apps.js http://localhost:3001 courier
 *   node verify-apps.js http://localhost:3000 hybrid
 *   node verify-apps.js http://localhost:3001
 */

const axios = require('axios');

const baseURL = process.argv[2] || 'http://localhost:3001';
const profile = (process.argv[3] || 'all').toLowerCase();

const PROFILES = {
  restorapp: {
    name: 'restorapp (Mobile/QR/Kiosk)',
    endpoints: [
      { method: 'GET', path: '/api/kiosk/menu', desc: 'Meniu kiosk/QR' },
      { method: 'GET', path: '/api/daily-menu', desc: 'Ofertă zilnică' },
      { method: 'GET', path: '/api/config', desc: 'Config white-label' },
      { method: 'GET', path: '/api/server-info', desc: 'Server info (auto-discovery)' },
      { method: 'POST', path: '/api/kiosk/cart/validate', desc: 'Validare coș', body: { items: [] } },
      { method: 'GET', path: '/health', desc: 'Health' },
      { method: 'GET', path: '/api/health', desc: 'API health' },
    ],
  },
  courier: {
    name: 'courier-flutter-app (Curieri)',
    endpoints: [
      { method: 'POST', path: '/api/couriers/login', desc: 'Login curier', body: { pin: '0000' } },
      { method: 'GET', path: '/api/couriers', desc: 'Lista curieri (admin)' },
      { method: 'GET', path: '/api/orders/delivery', desc: 'Comenzi delivery' },
      { method: 'GET', path: '/health', desc: 'Health' },
    ],
  },
  v3: {
    name: 'v3 (Backend complet)',
    endpoints: [
      { method: 'GET', path: '/health', desc: 'Health' },
      { method: 'GET', path: '/api/health', desc: 'API health' },
      { method: 'GET', path: '/api/kiosk/menu', desc: 'Meniu kiosk' },
      { method: 'GET', path: '/api/products', desc: 'Produse' },
      { method: 'POST', path: '/api/orders/create', desc: 'Creare comandă', body: { type: 'dine_in', items: [{ product_id: 1, name: 'Test', quantity: 1, price: 10 }], total: 10, table: 'T1', payment_method: 'cash', platform: 'KIOSK' } },
      { method: 'GET', path: '/api/couriers', desc: 'Curieri' },
      { method: 'GET', path: '/api/orders/delivery', desc: 'Comenzi delivery' },
    ],
  },
  hybrid: {
    name: 'hybrid',
    endpoints: [
      { method: 'GET', path: '/api/health', desc: 'Health' },
      { method: 'GET', path: '/api/produse', desc: 'Produse' },
      { method: 'GET', path: '/api/mese', desc: 'Mese' },
      { method: 'GET', path: '/api/comenzi/memorate', desc: 'Comenzi memorate' },
    ],
  },
};

async function checkEndpoint(baseURL, ep) {
  const url = `${baseURL}${ep.path}`;
  try {
    const config = { timeout: 5000, validateStatus: () => true };
    if (ep.body && (ep.method === 'POST' || ep.method === 'PUT')) {
      config.data = ep.body;
    }
    const res = ep.method === 'GET'
      ? await axios.get(url, config)
      : ep.method === 'POST'
        ? await axios.post(url, ep.body || {}, config)
        : await axios.put(url, ep.body || {}, config);
    const ok = res.status >= 200 && res.status < 400;
    return { ok, status: res.status, error: ok ? null : res.data?.error || res.statusText };
  } catch (err) {
    return { ok: false, status: null, error: err.message || err.code };
  }
}

async function runProfile(name, endpoints) {
  console.log(`\n📱 ${name}`);
  console.log('─'.repeat(50));
  let pass = 0;
  for (const ep of endpoints) {
    const result = await checkEndpoint(baseURL, ep);
    const icon = result.ok ? '✅' : '❌';
    const detail = result.ok ? `(${result.status})` : `- ${result.error || result.status}`;
    console.log(`   ${icon} ${ep.method} ${ep.path} - ${ep.desc} ${detail}`);
    if (result.ok) pass++;
  }
  console.log(`   Scor: ${pass}/${endpoints.length}`);
  return { pass, total: endpoints.length };
}

async function main() {
  console.log(`\n🔍 Verificare API: ${baseURL}`);
  console.log(`   Profil: ${profile === 'all' ? 'toate' : profile}\n`);

  const toRun = profile === 'all'
    ? Object.entries(PROFILES)
    : Object.entries(PROFILES).filter(([k]) => k === profile);

  if (toRun.length === 0) {
    console.log(`Profil necunoscut: ${profile}`);
    console.log('Profile valide: restorapp | courier | v3 | hybrid | all');
    process.exit(1);
  }

  let totalPass = 0, totalTotal = 0;
  for (const [key, { name, endpoints }] of toRun) {
    const { pass, total } = await runProfile(name, endpoints);
    totalPass += pass;
    totalTotal += total;
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`Total: ${totalPass}/${totalTotal} endpoint-uri OK`);
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
