/**
 * Brand Initialization Script
 * Rulează la încărcarea paginii pentru a aplica configurația brand-ului
 */

// Așteaptă ca DOM-ul și config.js să fie încărcate
document.addEventListener('DOMContentLoaded', function() {
    // Verifică dacă BRAND_CONFIG este disponibil
    if (typeof BRAND_CONFIG === 'undefined') {
        console.error('BRAND_CONFIG is not loaded! Make sure config.js is included before this script.');
        return;
    }
    
    console.log('🎨 Initializing brand configuration...');
    
    // 1. Actualizează titlul paginii
    if (document.title.includes('{{BRAND_CONFIG.restaurantName}}')) {
        document.title = document.title.replace(/\{\{BRAND_CONFIG\.restaurantName\}\}/g, BRAND_CONFIG.restaurantName);
    }
    
    // 2. Înlocuiește toate placeholder-urile în HTML
    const replacePlaceholders = (element) => {
        // Înlocuiește în text nodes
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.includes('${BRAND_CONFIG.')) {
                node.textContent = node.textContent.replace(
                    /\$\{BRAND_CONFIG\.restaurantName\}/g,
                    BRAND_CONFIG.restaurantName
                );
            }
        }
        
        // Înlocuiește în atribute
        element.querySelectorAll('*').forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                if (attr.value.includes('${BRAND_CONFIG.')) {
                    attr.value = attr.value.replace(
                        /\$\{BRAND_CONFIG\.restaurantName\}/g,
                        BRAND_CONFIG.restaurantName
                    );
                }
            });
        });
    };
    
    replacePlaceholders(document.body);
    
    // 3. Aplică tema
    if (typeof applyTheme === 'function') {
        applyTheme();
    }
    
    // 4. Actualizează logo-urile
    updateLogos();
    
    // 5. Actualizează informațiile de contact
    updateContactInfo();
    
    console.log('✅ Brand configuration applied successfully');
});

// Funcție pentru actualizarea logo-urilor
function updateLogos() {
    if (typeof ASSETS_CONFIG === 'undefined') return;
    
    // Actualizează logo-ul principal
    const mainLogos = document.querySelectorAll('img[src*="logo"], .logo img');
    mainLogos.forEach(img => {
        if (img.src.includes('logo') && ASSETS_CONFIG.logo.main) {
            img.src = ASSETS_CONFIG.logo.main;
            img.alt = BRAND_CONFIG.restaurantName;
        }
    });
    
    // Actualizează favicon
    const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (favicon && ASSETS_CONFIG.logo.favicon) {
        favicon.href = ASSETS_CONFIG.logo.favicon;
    }
}

// Funcție pentru actualizarea informațiilor de contact
function updateContactInfo() {
    if (typeof CONTACT_INFO === 'undefined') return;
    
    // Actualizează numerele de telefon
    const phoneElements = document.querySelectorAll('.phone, [href^="tel:"]');
    phoneElements.forEach(el => {
        if (CONTACT_INFO.phones && CONTACT_INFO.phones[0]) {
            if (el.tagName === 'A') {
                el.href = `tel:${CONTACT_INFO.phones[0]}`;
            }
            el.textContent = CONTACT_INFO.phones[0];
        }
    });
    
    // Actualizează email-urile
    const emailElements = document.querySelectorAll('.email, [href^="mailto:"]');
    emailElements.forEach(el => {
        if (CONTACT_INFO.emails && CONTACT_INFO.emails[0]) {
            if (el.tagName === 'A') {
                el.href = `mailto:${CONTACT_INFO.emails[0]}`;
            }
            el.textContent = CONTACT_INFO.emails[0];
        }
    });
    
    // Actualizează adresa
    const addressElements = document.querySelectorAll('.address');
    addressElements.forEach(el => {
        if (CONTACT_INFO.address) {
            const address = `${CONTACT_INFO.address.street}, ${CONTACT_INFO.address.city}`;
            el.textContent = address;
        }
    });
}

// Funcție pentru aplicarea temei
function applyTheme() {
    if (typeof THEME_CONFIG === 'undefined') return;
    
    const root = document.documentElement;
    
    // Aplică culorile
    if (THEME_CONFIG.colors) {
        Object.keys(THEME_CONFIG.colors).forEach(colorName => {
            root.style.setProperty(`--color-${colorName}`, THEME_CONFIG.colors[colorName]);
        });
    }
    
    // Aplică fonturile
    if (THEME_CONFIG.fonts) {
        Object.keys(THEME_CONFIG.fonts).forEach(fontName => {
            root.style.setProperty(`--font-${fontName}`, THEME_CONFIG.fonts[fontName]);
        });
    }
}

// Export pentru utilizare globală
window.applyTheme = applyTheme;
window.updateLogos = updateLogos;
window.updateContactInfo = updateContactInfo;
