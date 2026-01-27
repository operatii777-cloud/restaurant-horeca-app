/**
 * PUPPETEER SCREENSHOTS - Captură suplimentară pentru POS/Kiosk
 *
 * Script Puppeteer pentru captură screenshots din interfețele POS/Kiosk legacy
 * care pot fi mai greu de accesat cu Playwright.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const SCREENSHOTS_DIR = path.join(__dirname, '../../screenshots');

// Asigură că directorul screenshots există
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Funcție helper pentru screenshot cu nume consistent
async function takeScreenshot(page, name, description) {
  const filename = `${name}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);

  try {
    await page.screenshot({
      path: filepath,
      fullPage: true
    });

    console.log(`✅ Puppeteer Screenshot capturat: ${name}`);
    console.log(`   Descriere: ${description}`);
    console.log(`   Fișier: ${filepath}`);

    return { filename, description };
  } catch (error) {
    console.error(`❌ Eroare la screenshot ${name}:`, error);
    return null;
  }
}

async function runPuppeteerScreenshots() {
  console.log('🚀 Începere captură screenshots cu Puppeteer...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // ========================================
    // PAGINI LEGACY HTML
    // ========================================

    // 1. Admin Legacy (admin.html)
    console.log('📸 Capturare admin.html...');
    await page.goto(`${BACKEND_URL}/admin.html`, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '45-admin-legacy',
      'Interfață admin legacy - versiune HTML cu toate funcționalitățile de bază');

    // 2. Comenzi.html (Client ordering)
    console.log('📸 Capturare comenzi.html...');
    await page.goto(`${BACKEND_URL}/comenzi.html`, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '46-comenzi-client',
      'Interfață comandă client - pentru clienți care comandă direct');

    // 3. POS.html (dacă există)
    try {
      console.log('📸 Capturare pos.html...');
      await page.goto(`${BACKEND_URL}/pos.html`, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '47-pos-legacy',
        'POS legacy - interfață pentru ospătari (dacă există)');
    } catch (error) {
      console.log('⚠️  pos.html nu este disponibil sau nu există');
    }

    // 4. Kiosk.html (dacă există)
    try {
      console.log('📸 Capturare kiosk.html...');
      await page.goto(`${BACKEND_URL}/kiosk.html`, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '48-kiosk-legacy',
        'Kiosk legacy - interfață self-service (dacă există)');
    } catch (error) {
      console.log('⚠️  kiosk.html nu este disponibil sau nu există');
    }

    // 5. Meniu Client (public ordering)
    console.log('📸 Capturare meniu client...');
    await page.goto(`${BACKEND_URL}/meniu.html`, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '49-meniu-client',
      'Meniu public pentru clienți - vedere online a restaurantului');

    // ========================================
    // PAGINI SPECIALE
    // ========================================

    // 6. KDS Bucătărie (dacă rulează separat)
    try {
      console.log('📸 Capturare KDS Bucătărie...');
      await page.goto(`${BACKEND_URL}/kds.html`, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '50-kds-bucatarie-legacy',
        'KDS Bucătărie - interfață legacy pentru bucătari');
    } catch (error) {
      console.log('⚠️  KDS Bucătărie legacy nu este disponibil');
    }

    // 7. KDS Bar (dacă rulează separat)
    try {
      console.log('📸 Capturare KDS Bar...');
      await page.goto(`${BACKEND_URL}/bar.html`, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '51-kds-bar-legacy',
        'KDS Bar - interfață legacy pentru barmani');
    } catch (error) {
      console.log('⚠️  KDS Bar legacy nu este disponibil');
    }

    // 8. Rapoarte PDF (exemplu)
    try {
      console.log('📸 Capturare exemplu raport PDF...');
      await page.goto(`${BACKEND_URL}/rapoarte.html`, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '52-rapoarte-pdf',
        'Interfață rapoarte - generare PDF-uri și exporturi');
    } catch (error) {
      console.log('⚠️  Rapoarte nu sunt disponibile');
    }

    console.log('\n🎯 CAPTURĂ PUPPETEER COMPLETATĂ!');
    console.log(`📁 Screenshots salvate în: ${SCREENSHOTS_DIR}`);
    console.log('📋 Screenshots Puppeteer: 8 capturi suplimentare');

  } catch (error) {
    console.error('❌ Eroare generală în Puppeteer:', error);
  } finally {
    await browser.close();
  }
}

// Rulează script-ul dacă este apelat direct
if (require.main === module) {
  runPuppeteerScreenshots()
    .then(() => {
      console.log('✅ Script Puppeteer finalizat cu succes');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Eroare în script Puppeteer:', error);
      process.exit(1);
    });
}

module.exports = { runPuppeteerScreenshots };