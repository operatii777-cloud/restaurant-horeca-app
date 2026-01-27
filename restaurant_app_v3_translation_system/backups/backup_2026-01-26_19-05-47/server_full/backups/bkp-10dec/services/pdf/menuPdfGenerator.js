/**
 * MENU PDF GENERATOR SERVICE
 * 
 * Serviciu principal pentru generare PDF-uri meniu folosind Puppeteer + Handlebars
 */

const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { getMenuData } = require('../menuDataService');

// Cache browser instance
let browserInstance = null;

/**
 * Obține instanță browser (refolosită pentru performanță)
 */
async function getBrowser() {
  if (!browserInstance || !browserInstance.isConnected()) {
    console.log('🌐 Lansare browser Puppeteer...');
    browserInstance = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    console.log('✅ Browser lansat');
  }
  return browserInstance;
}

/**
 * Închide browser
 */
async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    console.log('✅ Browser închis');
  }
}

/**
 * Încarcă și compilează template Handlebars
 */
async function loadTemplate() {
  const templatePath = path.join(__dirname, '..', '..', 'templates', 'menu', 'menu-layout.hbs');
  const templateContent = await fs.readFile(templatePath, 'utf8');
  
  // Încarc CSS
  const cssPath = path.join(__dirname, '..', '..', 'templates', 'styles', 'menu-pdf.css');
  const css = await fs.readFile(cssPath, 'utf8');
  
  // Încarc partials
  const partialsDir = path.join(__dirname, '..', '..', 'templates', 'partials');
  const categoryPartial = await fs.readFile(path.join(partialsDir, 'category-section.hbs'), 'utf8');
  const productPartial = await fs.readFile(path.join(partialsDir, 'product-item.hbs'), 'utf8');
  const fiscalPartial = await fs.readFile(path.join(partialsDir, 'fiscal-receipt-info.hbs'), 'utf8');
  
  // Înregistrează partials
  handlebars.registerPartial('category-section', categoryPartial);
  handlebars.registerPartial('product-item', productPartial);
  handlebars.registerPartial('fiscal-receipt-info', fiscalPartial);
  
  // Înregistrează helpers
  handlebars.registerHelper('eq', (a, b) => a === b);
  
  // Compilează template
  const template = handlebars.compile(templateContent);
  
  return { template, css };
}

/**
 * Generează HTML din template + date
 */
async function generateHTML(type, lang) {
  console.log(`📄 Generez HTML pentru ${type} (${lang})...`);
  
  // Încarcă template
  const { template, css } = await loadTemplate();
  
  // Obține date meniu
  const menuData = await getMenuData(type, lang);
  
  // Titluri
  const titles = {
    food: {
      ro: { title: 'Meniu Mâncare', subtitle: 'Preparate Culinare & Deserturi' },
      en: { title: 'Food Menu', subtitle: 'Culinary Dishes & Desserts' }
    },
    drinks: {
      ro: { title: 'Meniu Băuturi', subtitle: 'Băuturi, Cocktail-uri & Cafea' },
      en: { title: 'Drinks Menu', subtitle: 'Beverages, Cocktails & Coffee' }
    }
  };
  
  const titleData = titles[type][lang];
  
  // Combină date pentru template
  const templateData = {
    ...menuData,
    css: css,
    menu_title: titleData.title,
    menu_subtitle: titleData.subtitle
  };
  
  // Generează HTML
  const html = template(templateData);
  
  console.log(`✅ HTML generat (${html.length} caractere)`);
  
  return html;
}

/**
 * Generează PDF din HTML
 */
async function generatePDF(type, lang, outputPath) {
  console.log(`\n🔄 [PDF Generator] Start generare: ${type}_${lang}.pdf`);
  console.log(`   Output: ${outputPath}`);
  
  const startTime = Date.now();
  
  try {
    // Generează HTML
    const html = await generateHTML(type, lang);
    
    // Obține browser
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    // Setează viewport pentru consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });
    
    console.log('   ⏳ Setare conținut HTML...');
    await page.setContent(html, {
      waitUntil: ['domcontentloaded'],  // Nu așteptăm network (e base64)
      timeout: 90000  // 90 secunde pentru HTML mare cu imagini base64
    });
    
    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');
    
    console.log('   ⏳ Generare PDF...');
    
    // Asigură că directorul există
    const dir = path.dirname(outputPath);
    if (!fsSync.existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    
    // Generează PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      },
      preferCSSPageSize: false
    });
    
    await page.close();
    
    // Verifică dimensiune fișier
    const stats = await fs.stat(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ PDF generat cu succes!`);
    console.log(`   Dimensiune: ${sizeKB} KB`);
    console.log(`   Durată: ${duration}ms\n`);
    
    return {
      success: true,
      path: outputPath,
      size: stats.size,
      sizeKB: parseFloat(sizeKB),
      duration: duration
    };
    
  } catch (error) {
    console.error(`❌ Eroare generare PDF:`, error.message);
    console.error(`   Stack:`, error.stack);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generează toate cele 4 PDF-uri (food/drinks × ro/en)
 */
async function generateAllPDFs() {
  console.log('\n🚀 GENERARE TOATE PDF-URILE\n');
  console.log('='.repeat(70));
  
  const combinations = [
    { type: 'food', lang: 'ro', filename: 'menu-food-ro.pdf' },
    { type: 'food', lang: 'en', filename: 'menu-food-en.pdf' },
    { type: 'drinks', lang: 'ro', filename: 'menu-drinks-ro.pdf' },
    { type: 'drinks', lang: 'en', filename: 'menu-drinks-en.pdf' }
  ];
  
  const cacheDir = path.join(__dirname, '..', '..', 'cache', 'pdfs');
  const results = [];
  
  for (const combo of combinations) {
    const outputPath = path.join(cacheDir, combo.filename);
    const result = await generatePDF(combo.type, combo.lang, outputPath);
    results.push({
      ...combo,
      ...result
    });
  }
  
  console.log('='.repeat(70));
  console.log('\n📊 RAPORT GENERARE:\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  successful.forEach(r => {
    console.log(`✅ ${r.filename}: ${r.sizeKB} KB (${r.duration}ms)`);
  });
  
  if (failed.length > 0) {
    console.log('');
    failed.forEach(r => {
      console.log(`❌ ${r.filename}: ${r.error}`);
    });
  }
  
  const totalSize = successful.reduce((sum, r) => sum + r.sizeKB, 0);
  const totalDuration = successful.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`\n📈 STATISTICI:`);
  console.log(`   Total reușite: ${successful.length}/${combinations.length}`);
  console.log(`   Total dimensiune: ${totalSize.toFixed(2)} KB`);
  console.log(`   Total durată: ${totalDuration}ms`);
  console.log(`   Medie per PDF: ${(totalDuration / successful.length).toFixed(0)}ms\n`);
  
  console.log('='.repeat(70) + '\n');
  
  return {
    success: failed.length === 0,
    total: combinations.length,
    successful: successful.length,
    failed: failed.length,
    results: results
  };
}

// Export functions
module.exports = {
  generatePDF,
  generateAllPDFs,
  getBrowser,
  closeBrowser
};

// Cleanup on exit
process.on('exit', () => {
  if (browserInstance) {
    browserInstance.close();
  }
});

process.on('SIGTERM', async () => {
  await closeBrowser();
  process.exit(0);
});

