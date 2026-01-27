/**
 * MENU PDF GENERATOR - PLAYWRIGHT VERSION
 * 
 * Generator profesional pentru PDF-uri meniu folosind Playwright + Handlebars
 * Migrare de la Puppeteer pentru control mai bun și PDF-uri mai profesionale
 */

const playwright = require('playwright');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { getMenuData } = require('../menuDataService');

// Cache browser instance
let browserInstance = null;

/**
 * Obține instanță browser Playwright
 */
async function getBrowser() {
  if (!browserInstance) {
    console.log('🌐 Lansare browser Playwright (Chromium)...');
    browserInstance = await playwright.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
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
  
  // Înregistrează partials (FRESH pentru fiecare generare)
  handlebars.unregisterPartial('category-section');
  handlebars.unregisterPartial('product-item');
  handlebars.unregisterPartial('fiscal-receipt-info');
  
  handlebars.registerPartial('category-section', categoryPartial);
  handlebars.registerPartial('product-item', productPartial);
  handlebars.registerPartial('fiscal-receipt-info', fiscalPartial);
  
  // Înregistrează helpers (FRESH)
  handlebars.registerHelper('eq', (a, b) => a === b);
  handlebars.registerHelper('lt', (a, b) => a < b);
  handlebars.registerHelper('lte', (a, b) => a <= b);
  handlebars.registerHelper('gt', (a, b) => a > b);
  handlebars.registerHelper('gte', (a, b) => a >= b);
  handlebars.registerHelper('and', (a, b) => a && b);
  handlebars.registerHelper('or', (a, b) => a || b);
  handlebars.registerHelper('not', (a) => !a);
  
  // Compilează template
  const template = handlebars.compile(templateContent);
  
  return { template, css };
}

/**
 * ✅ FUNCȚIA OPTIMIZATĂ - Încarcă logo Base64
 * Convertește logo-ul QrOMS în base64 pentru injectare în PDF
 */
async function getQrOMSLogoBase64() {
  try {
    const logoPath = path.join(__dirname, '..', '..', 'public', 'QrOMS.jpg');
    
    console.log('📷 Încerc să încarc logo de la:', logoPath);
    
    if (!fsSync.existsSync(logoPath)) {
      console.warn('   ⚠️  Logo QrOMS.jpg NU GĂSIT');
      return null;
    }
    
    const imageBuffer = await fs.readFile(logoPath);
    const base64 = imageBuffer.toString('base64');
    const mimeType = 'image/jpeg';
    
    const dataUrl = `data:${mimeType};base64,${base64}`;
    console.log('✅ Logo încărcat cu succes! Lungime Base64:', base64.length, 'caractere');
    
    return dataUrl;
    
  } catch (error) {
    console.error('❌ Eroare la încărcarea logo-ului:', error.message);
    return null;
  }
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
  
  // Obține logo-ul QrOMS în base64
  const qrOMSLogoBase64 = await getQrOMSLogoBase64();
  
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
    restaurant: menuData.restaurant,
    categories: menuData.categories,
    metadata: {
      ...menuData.metadata,
      lang: lang  // IMPORTANT: Asigur că limba e setată corect
    },
    css: css,
    menu_title: titleData.title,
    menu_subtitle: titleData.subtitle,
    qrOMSLogo: qrOMSLogoBase64  // Logo-ul QrOMS în base64
  };
  
  // Debug: Verifică limba
  console.log(`   🔍 Limba setată: ${templateData.metadata.lang}`);
  console.log(`   📊 Categorii: ${templateData.categories.length}`);
  
  // Generează HTML
  const html = template(templateData);
  
  console.log(`✅ HTML generat (${html.length} caractere)`);
  
  return html;
}

/**
 * Generează PDF din HTML (PLAYWRIGHT)
 */
async function generatePDF(type, lang, outputPath) {
  console.log(`\n🔄 [PDF Generator - Playwright] Start generare: ${type}_${lang}.pdf`);
  console.log(`   Output: ${outputPath}`);
  
  const startTime = Date.now();
  
  try {
    // Generează HTML
    const html = await generateHTML(type, lang);
    
    // Obține logo-ul QrOMS în base64 (pentru branding)
    const qrOMSLogoBase64 = await getQrOMSLogoBase64();
    
    // Obține browser
    const browser = await getBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Setează viewport
    await page.setViewportSize({
      width: 1200,
      height: 1600
    });
    
    console.log('   ⏳ Setare conținut HTML...');
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: 90000
    });
    
    // Wait for fonts
    await page.evaluate(() => document.fonts.ready);
    
    console.log('   ⏳ Generare PDF cu Playwright...');
    
    // Asigură că directorul există
    const dir = path.dirname(outputPath);
    if (!fsSync.existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }

    // 6. INJECTEAZĂ LOGO CA ELEMENT DOM (sigur 100%) - OPTIMIZAT
    if (qrOMSLogoBase64) {
      console.log('💉 Injectez branding QrOMS în prima pagină...');
      
      await page.evaluate((logoBase64) => {
        // Găsește DOAR header-ul primei pagini (.menu-header)
        const header = document.querySelector('.menu-header');
        
        if (!header) {
          console.warn('Header nu găsit, nu injectez branding');
          return;
        }
        
        // Șterge TOATE branding-urile existente (în întregul document)
        const allExisting = document.querySelectorAll('.qroms-branding-badge, .qroms-branding-first-page');
        allExisting.forEach(el => el.remove());
        
        // Șterge și din header dacă există
        const existingInHeader = header.querySelector('.qroms-branding-badge');
        if (existingInHeader) {
          existingInHeader.remove();
        }
        
        // CREEAZĂ BRANDING BADGE - DOAR ÎN HEADER (PRIMA PAGINĂ)
        const brandingDiv = document.createElement('div');
        brandingDiv.className = 'qroms-branding-badge';
        
        // Stiluri inline FORTE - DOAR ÎN HEADER (prima pagină)
        brandingDiv.setAttribute('style', `
          position: absolute !important;
          top: 20px !important;
          right: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          z-index: 10000 !important;
          background: linear-gradient(135deg, #f0f0f0, #ffffff) !important;
          padding: 8px 12px !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid #e0e0e0 !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        `);
        
        // CREEAZĂ HTML PENTRU BADGE
        brandingDiv.innerHTML = `
          <img 
            src="${logoBase64}" 
            alt="QrOMS Logo" 
            style="
              width: 28px !important;
              height: 28px !important;
              object-fit: contain !important;
              display: block !important;
              flex-shrink: 0 !important;
            "
          />
          <span style="
            font-size: 9pt !important;
            font-weight: 700 !important;
            color: #0a2540 !important;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
            white-space: nowrap !important;
            line-height: 1.2 !important;
            letter-spacing: 0.3px !important;
          ">Powered by QrOMS</span>
        `;
        
        // INSEREAZĂ DOAR ÎN HEADER (prima pagină)
        header.appendChild(brandingDiv);
        
        console.log('✅ Branding injectat DOAR în header (prima pagină)!');
        
        // ELIMINĂ BRANDING-UL DE PE ALTE ELEMENTE (categorii, last-page, etc.)
        const categories = document.querySelectorAll('.category-section, .last-page-info');
        categories.forEach(section => {
          const badBranding = section.querySelectorAll('.qroms-branding-badge, .qroms-branding-first-page');
          badBranding.forEach(el => el.remove());
        });
        
      }, qrOMSLogoBase64);
      
      // 7. AȘTEAPTĂ CA IMAGINILE SĂ SE ÎNCARCE
      await page.waitForTimeout(300);
      
      // Verifică dacă branding-ul a fost injectat
      const brandingExists = await page.evaluate(() => {
        return document.querySelector('.qroms-branding-badge') !== null || 
               document.querySelector('.qroms-branding-first-page') !== null;
      });
      console.log(`   ${brandingExists ? '✅' : '❌'} Branding ${brandingExists ? 'injectat' : 'NU a fost injectat'}`);
    } else {
      console.log('   ⚠️  Logo QrOMS nu este disponibil');
    }

    // 8. GENEREAZĂ PDF cu Playwright - OPTIMIZAT PENTRU LOGO
    console.log('🖨️  Generez PDF...');
    
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '20mm',    // Mărit pentru logo în top-right
        bottom: '15mm',
        left: '15mm',
        right: '15mm'
      },
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false // Dezactivează footer implicit
    });
    
    await context.close();
    
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
 * Generează toate cele 4 PDF-uri
 */
async function generateAllPDFs() {
  console.log('\n🚀 GENERARE TOATE PDF-URILE (PLAYWRIGHT)\n');
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

process.on('SIGINT', async () => {
  await closeBrowser();
  process.exit(0);
});

