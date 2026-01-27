/**
 * MANUAL SCREENSHOTS - POS/Kiosk (Puppeteer)
 * 
 * Suite de teste pentru capturarea screenshot-urilor pentru POS/Kiosk.
 * Rulează unul câte unul pentru a nu bloca aplicația.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const SCREENSHOTS_DIR = path.join(__dirname, '../../screenshots/pos-kiosk');
const LOGIN_PIN = '5555';

// Asigură că directorul screenshots există
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Lista paginilor POS/Kiosk de capturat
const POS_KIOSK_PAGES = [
  { url: '/pos.html', name: 'pos-interface', description: 'Interfață POS pentru preluarea comenzilor' },
  { url: '/kiosk.html', name: 'kiosk-interface', description: 'Interfață Kiosk pentru comenzi self-service' },
  { url: '/kds.html', name: 'kds-kitchen', description: 'Kitchen Display System - Bucătărie' },
  { url: '/comenzi-bar.html', name: 'kds-bar', description: 'Kitchen Display System - Bar' },
  { url: '/admin.html', name: 'admin-legacy', description: 'Admin Legacy Interface' },
  { url: '/admin-advanced.html', name: 'admin-advanced', description: 'Admin Advanced Interface' },
];

// Funcție helper pentru screenshot
async function takeScreenshot(page, name, description) {
  const filename = `${name}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);

  try {
    await page.waitForTimeout(2000); // Așteaptă render complet
    
    await page.screenshot({
      path: filepath,
      fullPage: true,
      timeout: 10000
    });

    console.log(`✅ Screenshot: ${name}`);
    console.log(`   ${description}`);
    return { filename, description };
  } catch (error) {
    console.error(`❌ Eroare screenshot ${name}:`, error);
    return null;
  }
}

// Funcție pentru autentificare
async function loginToAdmin(page) {
  console.log('🔐 Autentificare în admin...');
  
  await page.goto(`${BASE_URL}/admin.html`, { 
    waitUntil: 'networkidle', 
    timeout: 30000 
  });
  
  await page.waitForTimeout(2000);

  // Verifică dacă există ecranul de login
  const pinInput = await page.$('#adminPin');
  
  if (pinInput) {
    console.log('📝 Introducere PIN...');
    await page.type('#adminPin', LOGIN_PIN);
    
    const loginButton = await page.$('#loginForm button[type="submit"], #loginBtn, button:has-text("Conectare")');
    if (loginButton) {
      await loginButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ Autentificat');
    }
  } else {
    console.log('✅ Deja autentificat sau nu necesită autentificare');
  }
}

// Funcție principală
async function captureAllScreenshots() {
  console.log('🚀 Pornire capturare screenshot-uri POS/Kiosk...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Autentificare inițială
    await loginToAdmin(page);

    // Procesează fiecare pagină unul câte unul
    for (let i = 0; i < POS_KIOSK_PAGES.length; i++) {
      const pageInfo = POS_KIOSK_PAGES[i];
      
      console.log(`\n📍 [${i + 1}/${POS_KIOSK_PAGES.length}] Navigare: ${pageInfo.name}`);
      console.log(`   URL: ${pageInfo.url}`);
      
      try {
        await page.goto(`${BASE_URL}${pageInfo.url}`, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        await takeScreenshot(page, pageInfo.name, pageInfo.description);

        // Pauză între screenshot-uri
        await page.waitForTimeout(2000);
      } catch (error) {
        console.error(`❌ Eroare la ${pageInfo.name}:`, error.message);
      }
    }

    console.log(`\n✅ Capturare completă! Screenshots salvate în: ${SCREENSHOTS_DIR}`);
  } catch (error) {
    console.error('❌ Eroare generală:', error);
  } finally {
    await browser.close();
  }
}

// Rulează dacă este apelat direct
if (require.main === module) {
  captureAllScreenshots().catch(console.error);
}

module.exports = { captureAllScreenshots };
