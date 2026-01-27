/**
 * Script pentru crearea print screen-urilor cu Playwright
 * pentru ghidul de setup al sistemului de traducere
 */

const { chromium } = require('playwright');

async function createScreenshots() {
    console.log('🎬 Încep crearea print screen-urilor...');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    try {
        // Screenshot 1: Structura directorului
        console.log('📸 Screenshot 1: Structura directorului...');
        await page.goto('file:///C:/restaurant_app/server/public/translation/');
        await page.screenshot({ 
            path: 'screenshots/setup-01-directory-structure.png',
            fullPage: true 
        });

        // Screenshot 2: Conținutul ro.json
        console.log('📸 Screenshot 2: Conținutul ro.json...');
        await page.goto('file:///C:/restaurant_app/server/public/translation/ro.json');
        await page.screenshot({ 
            path: 'screenshots/setup-02-ro-json-content.png',
            fullPage: true 
        });

        // Screenshot 3: Conținutul en.json
        console.log('📸 Screenshot 3: Conținutul en.json...');
        await page.goto('file:///C:/restaurant_app/server/public/translation/en.json');
        await page.screenshot({ 
            path: 'screenshots/setup-03-en-json-content.png',
            fullPage: true 
        });

        // Screenshot 4: Pagina de test inițială (RO)
        console.log('📸 Screenshot 4: Pagina de test în română...');
        await page.goto('http://localhost:3000/test-translation.html');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ 
            path: 'screenshots/setup-04-test-page-romanian.png',
            fullPage: true 
        });

        // Screenshot 5: Pagina de test în engleză
        console.log('📸 Screenshot 5: Pagina de test în engleză...');
        await page.click('button[onclick="testChangeLanguage(\'en\')"]');
        await page.waitForTimeout(1000); // Așteaptă traducerea
        await page.screenshot({ 
            path: 'screenshots/setup-05-test-page-english.png',
            fullPage: true 
        });

        // Screenshot 6: Consola fără erori
        console.log('📸 Screenshot 6: Consola fără erori...');
        await page.goto('http://localhost:3000/test-translation.html');
        await page.waitForLoadState('networkidle');
        
        // Deschide Developer Tools
        await page.keyboard.press('F12');
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: 'screenshots/setup-06-console-no-errors.png',
            fullPage: true 
        });

        // Screenshot 7: Admin.html cu script adăugat
        console.log('📸 Screenshot 7: Admin.html cu script...');
        await page.goto('http://localhost:3000/admin.html');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ 
            path: 'screenshots/setup-07-admin-with-script.png',
            fullPage: true 
        });

        // Screenshot 8: Elemente cu data-translate
        console.log('📸 Screenshot 8: Elemente cu data-translate...');
        await page.goto('http://localhost:3000/test-translation.html');
        await page.waitForLoadState('networkidle');
        
        // Highlight elements with data-translate
        await page.evaluate(() => {
            document.querySelectorAll('[data-translate]').forEach(el => {
                el.style.border = '2px solid red';
                el.style.backgroundColor = 'yellow';
            });
        });
        
        await page.screenshot({ 
            path: 'screenshots/setup-08-elements-with-data-translate.png',
            fullPage: true 
        });

        // Screenshot 9: Admin panel cu traduceri
        console.log('📸 Screenshot 9: Admin panel cu traduceri...');
        await page.goto('http://localhost:3000/admin.html');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ 
            path: 'screenshots/setup-09-admin-with-translations.png',
            fullPage: true 
        });

        // Screenshot 10: Configurare avansată
        console.log('📸 Screenshot 10: Configurare avansată...');
        await page.goto('http://localhost:3000/test-translation.html');
        await page.waitForLoadState('networkidle');
        
        // Click pe butonul de test API
        await page.click('button[onclick="testJavaScriptAPI()"]');
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: 'screenshots/setup-10-advanced-configuration.png',
            fullPage: true 
        });

        console.log('✅ Toate print screen-urile au fost create cu succes!');
        console.log('📁 Fișierele sunt în: server/public/translation/screenshots/');

    } catch (error) {
        console.error('❌ Eroare la crearea print screen-urilor:', error);
    } finally {
        await browser.close();
    }
}

// Rulează script-ul
createScreenshots().catch(console.error);
