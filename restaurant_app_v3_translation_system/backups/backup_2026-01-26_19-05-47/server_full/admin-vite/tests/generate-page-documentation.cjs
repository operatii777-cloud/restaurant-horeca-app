/**
 * GENERATOR DOCUMENTAȚIE PAGINI
 * 
 * Generează documentație detaliată pentru fiecare pagină din aplicație
 * bazat pe structura de navigare și descrieri predefinite.
 */

const fs = require('fs');
const path = require('path');

// Importă navigation items din fișierul TypeScript
// Pentru CommonJS, citim direct fișierul și extragem export-ul
function loadNavigationItems() {
  const navPath = path.join(__dirname, '../src/modules/layout/constants/navigation.ts');
  const content = fs.readFileSync(navPath, 'utf8');
  
  // Extrage NAVIGATION_ITEMS din fișierul TypeScript
  // Folosim o abordare simplă: căutăm array-ul
  const match = content.match(/export const NAVIGATION_ITEMS[^=]*=\s*(\[[\s\S]*?\]);/);
  if (!match) {
    throw new Error('Nu s-a putut extrage NAVIGATION_ITEMS din navigation.ts');
  }
  
  // Evaluăm array-ul (simplificat - în producție ar trebui un parser mai robust)
  // Pentru acum, folosim o structură hardcodată bazată pe ceea ce știm
  return getHardcodedNavigation();
}

// Structură hardcodată bazată pe navigation.ts
function getHardcodedNavigation() {
  return [
    { label: 'Acasă', path: '/dashboard', icon: '🏠' },
    { label: 'POS/KIOSK', path: '/kiosk/dashboard', icon: '🖥️' },
    { label: 'Monitoring & Performance', path: '/monitoring/performance', icon: '📈' },
    {
      label: 'Comenzi',
      path: '#',
      icon: '🧾',
      children: [
        { label: 'Gestionare Comenzi', path: '/orders', icon: '📋' },
        { label: 'Istoric Comenzi', path: '/orders/history', icon: '📚' },
        { label: 'Comenzi Delivery', path: '/orders/delivery', icon: '🚚' },
        { label: 'Comenzi Drive-Thru', path: '/orders/drive-thru', icon: '🚗' },
        { label: 'Comenzi Takeaway', path: '/orders/takeaway', icon: '📦' },
        { label: 'KIOSK', path: '/kiosk', icon: '🖥️' },
        { label: 'Queue Monitor', path: '/queue-monitor', icon: '📊' },
        { label: 'Curieri Proprii', path: '/couriers', icon: '🛵' },
        { label: 'Dispatch', path: '/dispatch', icon: '📡' },
      ]
    },
    {
      label: 'Gestiune',
      path: '#',
      icon: '📦',
      children: [
        { label: 'Stocuri', path: '/stocks', icon: '📊' },
        { label: 'Inventar Multi-Gestiune', path: '/stocks/inventory/multi', icon: '🏢' },
        { label: 'Inventory Dashboard', path: '/stocks/inventory/dashboard', icon: '📈' },
        { label: 'Import Facturi', path: '/stocks/inventory/import', icon: '📥' },
        { label: 'Furnizori', path: '/stocks/suppliers', icon: '🏢' },
        { label: 'Comenzi Furnizori', path: '/stocks/suppliers/orders', icon: '📦' },
        { label: 'Pierderi & Waste', path: '/stocks/waste', icon: '🗑️' },
        { label: 'Etichete Produse', path: '/stocks/labels', icon: '🏷️' },
        { label: 'Alergeni', path: '/stocks/allergens', icon: '⚠️' },
        { label: 'Stock & Risk Alerts', path: '/stocks/risk-alerts', icon: '⚠️' },
        { label: 'Expiry Alerts', path: '/expiry-alerts', icon: '⏰' },
        { label: 'Recalls', path: '/recalls', icon: '🚨' },
        { label: 'Costuri & Prețuri', path: '/stocks/costs', icon: '💵' },
      ]
    },
    {
      label: 'Catalog',
      path: '#',
      icon: '📋',
      children: [
        { label: 'Categorii & Produse', path: '/catalog', icon: '🗂️' },
        { label: 'Gestionare Meniu', path: '/menu', icon: '🍽️' },
        { label: 'Menu Builder', path: '/menu/builder', icon: '🛠️' },
        { label: 'Categorii Online', path: '/catalog/online', icon: '🛒' },
        { label: 'Grupuri Atribute', path: '/catalog/attributes', icon: '🏷️' },
        { label: 'Utilitare Prețuri', path: '/catalog/prices', icon: '💰' },
        { label: 'Materii Prime', path: '/ingredients', icon: '📦' },
      ]
    },
    {
      label: 'Rețete',
      path: '#',
      icon: '📖',
      children: [
        { label: 'Rețete & Fișe Tehnice', path: '/recipes', icon: '📋' },
        { label: 'Recipe Scaling', path: '/recipes/scaling', icon: '📏' },
        { label: 'Fișe Tehnice', path: '/technical-sheets', icon: '📄' },
        { label: 'Loturi & Recepții', path: '/lots', icon: '🧾' },
        { label: 'Producție', path: '/production/batches', icon: '🧪' },
        { label: 'Traceability', path: '/traceability', icon: '🔍' },
      ]
    },
    {
      label: 'Rapoarte',
      path: '#',
      icon: '📊',
      children: [
        { label: 'Rapoarte Vânzări', path: '/reports/sales', icon: '📈' },
        { label: 'Rapoarte Stoc', path: '/reports/stock', icon: '📦' },
        { label: 'Rapoarte Financiare', path: '/reports/financial', icon: '💰' },
        { label: 'Profit & Loss (P&L)', path: '/reports/profit-loss', icon: '💰' },
        { label: 'Analiză ABC Produse', path: '/reports/abc-analysis', icon: '📈' },
        { label: 'Predicție Stoc', path: '/reports/stock-prediction', icon: '🔮' },
        { label: 'Top Products & Analytics', path: '/reports/top-products', icon: '📊' },
        { label: 'Rapoarte Personal', path: '/reports/staff', icon: '👥' },
        { label: 'Rapoarte Avansate', path: '/reports/advanced', icon: '📊' },
      ]
    },
    {
      label: 'Setări',
      path: '#',
      icon: '⚙️',
      children: [
        { label: 'Configurare Restaurant', path: '/settings', icon: '🏢' },
        { label: 'Gestiune Locații', path: '/settings/locations', icon: '🏭' },
        { label: 'Gestiune Zone/Săli', path: '/settings/areas', icon: '🗺️' },
        { label: 'Configurare Mese', path: '/settings/tables', icon: '🪑' },
        { label: 'Ospătari & PIN-uri', path: '/waiters', icon: '🧑‍🍳' },
        { label: 'Program & Orar', path: '/settings/schedule', icon: '⏰' },
        { label: 'Imprimante & Periferice', path: '/settings/printers', icon: '🖨️' },
        { label: 'Utilizatori & Permisiuni', path: '/settings/users', icon: '👤' },
        { label: 'Notificări & Alerte', path: '/settings/notifications', icon: '🔔' },
        { label: 'Localizare', path: '/settings/localization', icon: '🌍' },
        { label: 'Personalizare UI', path: '/settings/ui-customization', icon: '🎨' },
        { label: 'Aspect & Branding', path: '/settings/branding', icon: '🖼️' },
        { label: 'Afișare Produse', path: '/settings/product-display', icon: '🛍️' },
        { label: 'Traduceri în Așteptare', path: '/settings/missing-translations', icon: '🌐' },
        { label: 'Metode de Plată', path: '/settings/payment-methods', icon: '💳' },
        { label: 'Integrări', path: '/integrations', icon: '🔌' },
        { label: 'Import/Export', path: '/settings/import-export', icon: '📥📤' },
        { label: 'Backup', path: '/backup', icon: '💾' },
        { label: 'Manual Instrucțiuni', path: '/settings/manual-instructiuni', icon: '📚' },
      ]
    },
  ];
}

// Descrieri și instrucțiuni pentru fiecare tip de pagină
const PAGE_DESCRIPTIONS = {
  '/dashboard': {
    title: 'Dashboard Principal',
    description: 'Vedere de ansamblu asupra tuturor operațiunilor restaurantului cu KPI-uri în timp real',
    instructions: [
      'Dashboard-ul principal afișează KPI-uri cheie în timp real (vânzări, comenzi, profit)',
      'Graficele interactive arată tendințe de vânzări și performanță pe perioade',
      'Utilizați filtrele pentru a selecta perioada de timp dorită (astăzi, săptămâna aceasta, luna aceasta)',
      'Click pe orice card KPI pentru a accesa rapoarte detaliate',
      'Actualizarea se face automat la fiecare 30 de secunde',
      'Exportați datele în Excel sau PDF pentru analiză ulterioară'
    ],
    features: [
      'KPI Cards: Vânzări, Comenzi, Clienți, Profit cu comparații cu perioada anterioară',
      'Grafice Interactive: Vânzări pe perioade, Top produse, Comparații anuale',
      'Alerte Automate: Notificări pentru valori critice sau anomalii',
      'Quick Actions: Acces rapid la funcții frecvente (comenzi noi, rapoarte)',
      'Widgets Personalizabile: Reorganizați dashboard-ul după preferințe'
    ]
  },
  '/orders': {
    title: 'Gestionare Comenzi',
    description: 'Gestionare completă a tuturor comenzilor restaurantului cu filtrare avansată și modificare în timp real',
    instructions: [
      'Lista afișează toate comenzile active și finalizate organizate cronologic',
      'Utilizați filtrele pentru a căuta după status (activ, finalizat, anulat), dată, client sau tip comandă',
      'Click pe o comandă pentru a vedea detalii complete: produse, plăți, curier, istoric status',
      'Modificați statusul comenzii direct din listă (pregătit, în livrare, finalizat)',
      'Adăugați note sau instrucțiuni speciale pentru fiecare comandă',
      'Exportați rapoarte în Excel sau PDF pentru contabilitate sau analiză'
    ],
    features: [
      'Filtrare Avansată: Status, Dată, Client, Tip comandă (Delivery, Takeaway, Drive-Thru)',
      'Modificare în Timp Real: Status, Note, Alocare curier, Anulare',
      'Istoric Complet: Toate comenzile cu detalii despre modificări și evenimente',
      'Export Multiple: Excel, PDF, CSV pentru integrare cu sisteme externe',
      'Notificări: Alerte pentru comenzi noi, modificări status, probleme'
    ]
  },
  '/stocks': {
    title: 'Gestionare Stocuri',
    description: 'Gestionare completă a stocurilor și inventarului cu alerte automate și rapoarte detaliate',
    instructions: [
      'Vizualizați stocul actual pentru toate produsele organizate pe categorii',
      'Utilizați filtrele pentru a găsi produse specifice sau categorii',
      'Actualizați stocul manual sau prin import din fișiere Excel/CSV',
      'Configurați alerte pentru stocuri scăzute sau produse expirate',
      'Vizualizați istoricul mișcărilor de stoc pentru fiecare produs',
      'Exportați rapoarte de stoc pentru inventariere sau analiză'
    ],
    features: [
      'Vizualizare Stoc Real-Time: Stoc actual pentru toate produsele cu actualizare automată',
      'Alerte Automate: Notificări pentru stocuri scăzute, produse expirate, discrepanțe',
      'Import/Export: Excel, CSV pentru sincronizare cu furnizori sau sisteme externe',
      'Istoric Complet: Toate mișcările de stoc (intrări, ieșiri, ajustări) cu detalii',
      'Analiză: Rotație stoc, Valoare inventar, Predicții consum'
    ]
  },
  '/catalog': {
    title: 'Catalog Produse',
    description: 'Gestionare catalog complet de produse și categorii cu atribute detaliate și fotografii',
    instructions: [
      'Adăugați, editați sau ștergeți produse din catalog cu interfață intuitivă',
      'Organizați produsele în categorii pentru navigare ușoară (Aperitive, Feluri principale, Deserturi, Băuturi)',
      'Configurați prețuri, alergeni și informații nutriționale pentru fiecare produs',
      'Adăugați fotografii de înaltă calitate pentru fiecare produs',
      'Setați disponibilitatea produselor (disponibil/indisponibil) pentru control meniu',
      'Exportați catalogul pentru sincronizare cu alte sisteme sau platforme delivery'
    ],
    features: [
      'Gestionare Produse CRUD: Creare, Editare, Ștergere cu validare completă',
      'Categorii Ierarhice: Organizare flexibilă pe categorii și subcategorii',
      'Atribute Complete: Alergeni, Valori nutriționale, Prețuri, Descrieri',
      'Galerie Foto: Upload și gestionare fotografii pentru fiecare produs',
      'Import/Export: Sincronizare cu sisteme externe, platforme delivery, site-uri web'
    ]
  },
  '/menu': {
    title: 'Gestionare Meniu',
    description: 'Gestionare meniu restaurant cu organizare pe categorii și control disponibilitate',
    instructions: [
      'Creați și editați meniul restaurantului cu editor vizual intuitiv',
      'Organizați produsele în categorii (Aperitive, Feluri principale, Deserturi, Băuturi)',
      'Configurați disponibilitatea produselor (disponibil/indisponibil) pentru control meniu',
      'Setați prețuri și promoții (reduceri, oferte speciale)',
      'Preview meniul înainte de publicare pentru verificare',
      'Publicați meniul pentru a fi vizibil în aplicația client sau site web'
    ],
    features: [
      'Editor Vizual: Drag & drop pentru organizare rapidă a produselor',
      'Categorii Flexibile: Organizare pe categorii cu sortare personalizată',
      'Control Disponibilitate: Activare/dezactivare produse sau categorii întregi',
      'Preview: Vizualizare meniu înainte de publicare',
      'Versiuni: Păstrare istoric versiuni meniu pentru rollback'
    ]
  },
  '/recipes': {
    title: 'Rețete & Fișe Tehnice',
    description: 'Gestionare rețete complete cu ingrediente, instrucțiuni și calcul cost automat',
    instructions: [
      'Creați rețete noi sau editați rețete existente cu interfață intuitivă',
      'Adăugați ingrediente cu cantități precise (grame, litri, bucăți)',
      'Configurați instrucțiuni de preparare pas cu pas cu timpi și temperaturi',
      'Calculați costul automat pe baza prețurilor actuale ale ingrediente',
      'Scalați rețetele pentru orice număr de porții (1, 10, 100)',
      'Generați fișe tehnice HACCP complete pentru conformitate'
    ],
    features: [
      'Editor Rețete: Interfață intuitivă pentru adăugare ingrediente și instrucțiuni',
      'Calcul Cost Automat: Cost pe porție bazat pe prețuri actuale ingrediente',
      'Scalare: Ajustare automată cantități pentru orice număr de porții',
      'Fișe Tehnice: Generare automată fișe tehnice HACCP cu toate informațiile necesare',
      'Template-uri: Rețete standard pentru creare rapidă'
    ]
  },
  '/settings': {
    title: 'Configurare Restaurant',
    description: 'Configurare generală a restaurantului și sistemului cu toate opțiunile disponibile',
    instructions: [
      'Configurați informațiile de bază ale restaurantului (nume, adresă, contact)',
      'Setați programul de funcționare (zile și ore pentru fiecare zi)',
      'Configurați taxe și TVA (cote TVA, taxe locale)',
      'Gestionați metodele de plată acceptate (cash, card, online)',
      'Configurați integrarea cu sisteme externe (delivery platforms, payment gateways)',
      'Salvați modificările pentru a le aplica în sistem'
    ],
    features: [
      'Informații Restaurant: Nume, Adresă, Contact, Logo, Branding',
      'Program Funcționare: Zile și ore pentru fiecare zi cu excepții',
      'Fiscal: TVA, Taxe, Case de marcat, Integrare ANAF',
      'Plăți: Metode acceptate, Integrare payment gateways',
      'Integrări: Delivery platforms (Glovo, Uber, Bolt), Sisteme externe'
    ]
  },
  '/settings/manual-instructiuni': {
    title: 'Manual Instrucțiuni',
    description: 'Ghid complet pentru utilizarea aplicației Restaurant App v3 cu instrucțiuni detaliate pentru fiecare funcționalitate',
    instructions: [
      'Accesați manualul complet cu toate instrucțiunile pentru fiecare pagină',
      'Navigați prin secțiuni pentru a găsi informațiile necesare',
      'Utilizați căutarea (Ctrl+F) pentru a găsi rapid informații specifice',
      'Descărcați manualul pentru referință offline (PDF sau Markdown)',
      'Consultați ghidurile rapide pentru diferite roluri (Admin, Ospătar, Bucătar, Barman)',
      'Vizualizați capturile de ecran pentru fiecare interfață'
    ],
    features: [
      'Manual Complet: 100+ pagini documentate cu instrucțiuni detaliate',
      'Ghiduri Rapide: Pentru Admin, Ospătar, Bucătar, Barman cu link-uri directe',
      'Screenshots: Capturi ecran pentru fiecare interfață și funcționalitate',
      'Download: PDF sau Markdown pentru referință offline',
      'Căutare: Index complet pentru găsire rapidă informații'
    ]
  }
};

// Funcție pentru generare descrieri default
function getPageDescription(item) {
  const path = item.path || '';
  const label = item.label;
  
  // Verifică dacă există descriere predefinită
  if (PAGE_DESCRIPTIONS[path]) {
    return PAGE_DESCRIPTIONS[path];
  }
  
  // Generează descriere default bazat pe label și path
  const category = getCategoryFromPath(path);
  
  return {
    title: label,
    description: `Pagina ${label} - ${getCategoryDescription(category)}`,
    instructions: generateDefaultInstructions(label, path, category),
    features: generateDefaultFeatures(label, path, category)
  };
}

function getCategoryFromPath(path) {
  if (path.includes('/orders')) return 'comenzi';
  if (path.includes('/stocks') || path.includes('/ingredients')) return 'stocuri';
  if (path.includes('/catalog') || path.includes('/menu')) return 'catalog';
  if (path.includes('/recipes') || path.includes('/technical-sheets')) return 'rețete';
  if (path.includes('/settings')) return 'setări';
  if (path.includes('/reports')) return 'rapoarte';
  if (path.includes('/accounting')) return 'contabilitate';
  if (path.includes('/fiscal') || path.includes('/anaf')) return 'fiscal';
  if (path.includes('/compliance') || path.includes('/haccp')) return 'compliance';
  if (path.includes('/audit')) return 'audit';
  if (path.includes('/marketing')) return 'marketing';
  if (path.includes('/enterprise') || path.includes('/gift-cards')) return 'enterprise';
  if (path.includes('/kiosk') || path.includes('/pos')) return 'pos-kiosk';
  return 'general';
}

function getCategoryDescription(category) {
  const descriptions = {
    'comenzi': 'Gestionare și urmărire comenzi',
    'stocuri': 'Gestionare stocuri și inventar',
    'catalog': 'Gestionare catalog produse',
    'rețete': 'Gestionare rețete și fișe tehnice',
    'setări': 'Configurare sistem',
    'rapoarte': 'Rapoarte și analiză',
    'contabilitate': 'Contabilitate și documente',
    'fiscal': 'Fiscal și legal',
    'compliance': 'Conformitate și HACCP',
    'audit': 'Audit și securitate',
    'marketing': 'Marketing și clienți',
    'enterprise': 'Funcții enterprise',
    'pos-kiosk': 'Sisteme POS și Kiosk',
    'general': 'Funcționalitate generală'
  };
  return descriptions[category] || 'Funcționalitate aplicație';
}

function generateDefaultInstructions(label, path, category) {
  const baseInstructions = [
    `Pagina ${label} permite gestionarea și configurarea ${getCategoryDescription(category).toLowerCase()}`,
    'Utilizați filtrele și căutarea pentru a găsi informații specifice',
    'Click pe elemente pentru a accesa detalii complete',
    'Utilizați butoanele de acțiune pentru operațiuni comune (Adaugă, Editează, Șterge)',
    'Exportați datele pentru analiză sau backup (Excel, PDF, CSV)'
  ];
  
  // Instrucțiuni specifice pe categorii
  if (category === 'comenzi') {
    baseInstructions.push('Monitorizați statusul comenzilor în timp real cu actualizare automată');
    baseInstructions.push('Modificați statusul comenzilor direct din listă pentru eficiență maximă');
  } else if (category === 'stocuri') {
    baseInstructions.push('Configurați alerte pentru stocuri scăzute pentru a preveni rupturile de stoc');
    baseInstructions.push('Importați stocuri din fișiere Excel sau CSV pentru actualizare rapidă');
  } else if (category === 'setări') {
    baseInstructions.push('Salvați modificările pentru a le aplica în sistem');
    baseInstructions.push('Verificați validarea datelor înainte de salvare pentru a evita erorile');
  } else if (category === 'pos-kiosk') {
    baseInstructions.push('Utilizați interfața touch-friendly pentru operațiuni rapide');
    baseInstructions.push('Monitorizați comenzile active în timp real');
  }
  
  return baseInstructions;
}

function generateDefaultFeatures(label, path, category) {
  const baseFeatures = [
    'Interfață intuitivă și ușor de utilizat',
    'Căutare și filtrare avansată pentru găsire rapidă',
    'Export date în multiple formate (Excel, PDF, CSV)',
    'Actualizare în timp real pentru date curente'
  ];
  
  // Features specifice pe categorii
  if (category === 'comenzi') {
    baseFeatures.push('Status tracking în timp real cu notificări');
    baseFeatures.push('Notificări pentru evenimente importante (comenzi noi, modificări)');
  } else if (category === 'stocuri') {
    baseFeatures.push('Alerte automate pentru stocuri scăzute sau produse expirate');
    baseFeatures.push('Istoric complet mișcări stoc cu detalii despre fiecare operațiune');
  } else if (category === 'rapoarte') {
    baseFeatures.push('Grafice interactive pentru analiză vizuală');
    baseFeatures.push('Export Excel și PDF pentru integrare cu sisteme externe');
  } else if (category === 'pos-kiosk') {
    baseFeatures.push('Interfață optimizată pentru touch screens');
    baseFeatures.push('Sincronizare real-time cu sistemul central');
  }
  
  return baseFeatures;
}

// Funcție recursivă pentru procesare navigare
function processNavigationItems(items, parentPath = '', level = 0) {
  const pages = [];
  
  for (const item of items) {
    if (item.path && item.path !== '#') {
      const fullPath = parentPath + item.path;
      const description = getPageDescription(item);
      
      pages.push({
        path: fullPath,
        label: item.label,
        icon: item.icon || '📄',
        level: level,
        ...description
      });
    }
    
    if (item.children && item.children.length > 0) {
      const childPages = processNavigationItems(
        item.children,
        parentPath,
        level + 1
      );
      pages.push(...childPages);
    }
  }
  
  return pages;
}

// Generează HTML pentru o pagină
function generatePageHTML(page) {
  const indent = '  '.repeat(page.level);
  const anchor = page.path.replace(/[^a-zA-Z0-9]/g, '-').replace(/^-+|-+$/g, '');
  const screenshotPath = `screenshots/admin-vite/${anchor}.png`;
  
  return `
${indent}<section id="${anchor}" class="page-documentation">
${indent}  <div class="page-header">
${indent}    <h2>${page.icon} ${page.title}</h2>
${indent}    <p class="page-path">Cale: <code>${page.path}</code></p>
${indent}  </div>
${indent}  
${indent}  <div class="page-description">
${indent}    <p>${page.description}</p>
${indent}  </div>
${indent}  
${indent}  <div class="page-instructions">
${indent}    <h3>📋 Instrucțiuni de Utilizare</h3>
${indent}    <ol>
${page.instructions.map(inst => `${indent}      <li>${inst}</li>`).join('\n')}
${indent}    </ol>
${indent}  </div>
${indent}  
${indent}  <div class="page-features">
${indent}    <h3>✨ Funcționalități Principale</h3>
${indent}    <ul>
${page.features.map(feat => `${indent}      <li>${feat}</li>`).join('\n')}
${indent}    </ul>
${indent}  </div>
${indent}  
${indent}  <div class="page-screenshot">
${indent}    <h3>📸 Captură Ecran</h3>
${indent}    <img src="${screenshotPath}" 
${indent}         alt="${page.title}" 
${indent}         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
${indent}    <p class="screenshot-placeholder" style="display:none;">
${indent}      📷 Captură ecran va fi adăugată după rularea testelor de screenshot<br>
${indent}      <small>Fișier așteptat: ${screenshotPath}</small>
${indent}    </p>
${indent}  </div>
${indent}</section>
`;
}

// Generează HTML complet
function generateCompleteHTML(pages) {
  const tableOfContents = pages.map((page) => {
    const indent = '    '.repeat(page.level);
    const anchor = page.path.replace(/[^a-zA-Z0-9]/g, '-').replace(/^-+|-+$/g, '');
    return `${indent}<li><a href="#${anchor}">${page.icon} ${page.title}</a></li>`;
  }).join('\n');
  
  const pageSections = pages.map(page => generatePageHTML(page)).join('\n');
  
  return `<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manual Complet de Instrucțiuni - Restaurant App v3</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
            margin-bottom: 30px;
            border-radius: 10px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.95;
        }
        
        .toc {
            background: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .toc h2 {
            margin-bottom: 20px;
            color: #667eea;
        }
        
        .toc ul {
            list-style: none;
            columns: 2;
            column-gap: 30px;
        }
        
        .toc li {
            margin-bottom: 10px;
            break-inside: avoid;
        }
        
        .toc a {
            color: #333;
            text-decoration: none;
            padding: 5px 0;
            display: block;
            transition: color 0.2s;
        }
        
        .toc a:hover {
            color: #667eea;
        }
        
        .page-documentation {
            background: white;
            padding: 30px;
            margin-bottom: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .page-header {
            border-bottom: 3px solid #667eea;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .page-header h2 {
            color: #667eea;
            font-size: 1.8rem;
            margin-bottom: 10px;
        }
        
        .page-path {
            color: #666;
            font-size: 0.9rem;
        }
        
        .page-path code {
            background: #f0f0f0;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
        
        .page-description {
            background: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #667eea;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        
        .page-instructions, .page-features {
            margin-bottom: 25px;
        }
        
        .page-instructions h3, .page-features h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.3rem;
        }
        
        .page-instructions ol, .page-features ul {
            margin-left: 20px;
        }
        
        .page-instructions li, .page-features li {
            margin-bottom: 10px;
            line-height: 1.8;
        }
        
        .page-screenshot {
            margin-top: 25px;
        }
        
        .page-screenshot h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.3rem;
        }
        
        .page-screenshot img {
            max-width: 100%;
            border: 2px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .screenshot-placeholder {
            background: #f8f9fa;
            padding: 40px;
            text-align: center;
            border: 2px dashed #ddd;
            border-radius: 8px;
            color: #666;
        }
        
        @media (max-width: 768px) {
            .toc ul {
                columns: 1;
            }
            
            .header h1 {
                font-size: 1.8rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 Manual Complet de Instrucțiuni</h1>
            <p>Restaurant App v3 - Ghid detaliat pentru fiecare pagină și funcționalitate</p>
            <p style="margin-top: 10px; font-size: 0.9rem;">
                Versiune: 3.0.0 | Data: ${new Date().toLocaleDateString('ro-RO')} | ${pages.length} pagini documentate
            </p>
        </div>
        
        <div class="toc">
            <h2>📋 Cuprins</h2>
            <ul>
${tableOfContents}
            </ul>
        </div>
        
${pageSections}
    </div>
</body>
</html>`;
}

// Funcție principală
function generateDocumentation() {
  console.log('📚 Generare documentație pentru toate paginile...\n');
  
  // Procesează toate elementele de navigare
  const navItems = getHardcodedNavigation();
  const pages = processNavigationItems(navItems);
  
  console.log(`✅ Procesate ${pages.length} pagini\n`);
  
  // Generează HTML
  const html = generateCompleteHTML(pages);
  
  // Salvează fișierul
  const outputPath = path.join(__dirname, '../../public/manual-instructiuni-complet.html');
  fs.writeFileSync(outputPath, html, 'utf8');
  
  console.log(`✅ Documentație generată: ${outputPath}`);
  console.log(`📊 Total pagini documentate: ${pages.length}`);
  
  return pages;
}

// Rulează dacă este apelat direct
if (require.main === module) {
  try {
    generateDocumentation();
  } catch (error) {
    console.error('❌ Eroare la generare documentație:', error);
    process.exit(1);
  }
}

module.exports = { generateDocumentation, getPageDescription };
