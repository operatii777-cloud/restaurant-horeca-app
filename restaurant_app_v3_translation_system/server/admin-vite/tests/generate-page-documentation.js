/**
 * GENERATOR DOCUMENTAȚIE PAGINI
 * 
 * Generează documentație detaliată pentru fiecare pagină din aplicație
 * bazat pe structura de navigare și descrieri predefinite.
 */

const fs = require('fs');
const path = require('path');
const { NAVIGATION_ITEMS } = require('../src/modules/layout/constants/navigation.ts');

// Descrieri și instrucțiuni pentru fiecare tip de pagină
const PAGE_DESCRIPTIONS = {
  // Dashboard & Acasă
  '/dashboard': {
    title: 'Dashboard Principal',
    description: 'Vedere de ansamblu asupra tuturor operațiunilor restaurantului',
    instructions: [
      'Dashboard-ul principal afișează KPI-uri cheie în timp real',
      'Graficele interactive arată tendințe de vânzări și performanță',
      'Utilizați filtrele pentru a selecta perioada de timp dorită',
      'Click pe orice card pentru a accesa rapoarte detaliate',
      'Actualizarea se face automat la fiecare 30 de secunde'
    ],
    features: [
      'KPI Cards: Vânzări, Comenzi, Clienți, Profit',
      'Grafice: Vânzări pe perioade, Top produse, Comparații',
      'Alerte: Notificări pentru valori critice',
      'Quick Actions: Acces rapid la funcții frecvente'
    ]
  },
  '/kiosk/dashboard': {
    title: 'POS/Kiosk Dashboard',
    description: 'Dashboard centralizat pentru acces rapid la funcționalitățile POS și Kiosk',
    instructions: [
      'Această pagină oferă acces rapid la toate funcțiile operaționale',
      'Selectați modul dorit: POS, Kiosk, KDS, sau Rapoarte',
      'Utilizați butoanele mari pentru acces rapid la funcții frecvente',
      'Status-ul sistemului este afișat în timp real'
    ],
    features: [
      'Acces rapid la POS Split Screen',
      'Lansare Kiosk Self-Service',
      'Acces la KDS Bucătărie și Bar',
      'Rapoarte operaționale live'
    ]
  },
  // Comenzi
  '/orders': {
    title: 'Gestionare Comenzi',
    description: 'Gestionare completă a tuturor comenzilor restaurantului',
    instructions: [
      'Lista afișează toate comenzile active și finalizate',
      'Utilizați filtrele pentru a căuta după status, dată, sau client',
      'Click pe o comandă pentru a vedea detalii complete',
      'Modificați statusul comenzii direct din listă',
      'Exportați rapoarte în Excel sau PDF'
    ],
    features: [
      'Filtrare avansată: Status, Dată, Client, Tip comandă',
      'Modificare în timp real: Status, Note, Alocare curier',
      'Istoric complet: Toate comenzile cu detalii',
      'Export: Excel, PDF, CSV'
    ]
  },
  '/orders/history': {
    title: 'Istoric Comenzi',
    description: 'Istoric complet al tuturor comenzilor finalizate',
    instructions: [
      'Vizualizați toate comenzile finalizate organizate cronologic',
      'Utilizați filtrele pentru a găsi comenzi specifice',
      'Click pe o comandă pentru a vedea detalii complete',
      'Exportați rapoarte pentru analiză ulterioară',
      'Analizați tendințe și pattern-uri de comandă'
    ],
    features: [
      'Căutare avansată: Client, Dată, Sumă, Status',
      'Detalii complete: Produse, Plăți, Curier',
      'Analiză: Grafice și statistici',
      'Export: Excel, PDF pentru contabilitate'
    ]
  },
  // Stocuri
  '/stocks': {
    title: 'Gestionare Stocuri',
    description: 'Gestionare completă a stocurilor și inventarului',
    instructions: [
      'Vizualizați stocul actual pentru toate produsele',
      'Utilizați filtrele pentru a găsi produse specifice',
      'Actualizați stocul manual sau prin import',
      'Configurați alerte pentru stocuri scăzute',
      'Exportați rapoarte de stoc pentru analiză'
    ],
    features: [
      'Vizualizare stoc: Real-time pentru toate produsele',
      'Alerte automate: Stocuri scăzute, Expirare',
      'Import/Export: Excel, CSV pentru sincronizare',
      'Istoric: Mișcări de stoc cu detalii complete'
    ]
  },
  // Catalog
  '/catalog': {
    title: 'Catalog Produse',
    description: 'Gestionare catalog complet de produse și categorii',
    instructions: [
      'Adăugați, editați sau ștergeți produse din catalog',
      'Organizați produsele în categorii pentru navigare ușoară',
      'Configurați prețuri, alergeni și informații nutriționale',
      'Adăugați fotografii pentru fiecare produs',
      'Exportați catalogul pentru sincronizare cu alte sisteme'
    ],
    features: [
      'Gestionare produse: CRUD complet cu validare',
      'Categorii: Organizare ierarhică',
      'Atribute: Alergeni, Valori nutriționale, Prețuri',
      'Import/Export: Sincronizare cu sisteme externe'
    ]
  },
  '/menu': {
    title: 'Gestionare Meniu',
    description: 'Gestionare meniu restaurant cu organizare pe categorii',
    instructions: [
      'Creați și editați meniul restaurantului',
      'Organizați produsele în categorii (Aperitive, Feluri principale, Deserturi)',
      'Configurați disponibilitatea produselor (disponibil/indisponibil)',
      'Setați prețuri și promoții',
      'Preview meniul înainte de publicare'
    ],
    features: [
      'Editor vizual: Drag & drop pentru organizare',
      'Categorii: Organizare flexibilă',
      'Disponibilitate: Control pe produs sau categorie',
      'Preview: Vizualizare înainte de publicare'
    ]
  },
  // Rețete
  '/recipes': {
    title: 'Rețete & Fișe Tehnice',
    description: 'Gestionare rețete complete cu ingrediente și instrucțiuni',
    instructions: [
      'Creați rețete noi sau editați rețete existente',
      'Adăugați ingrediente cu cantități precise',
      'Configurați instrucțiuni de preparare pas cu pas',
      'Calculați costul automat pe baza prețurilor ingrediente',
      'Generați fișe tehnice HACCP complete'
    ],
    features: [
      'Editor rețete: Interfață intuitivă pentru ingrediente',
      'Calcul cost: Automat bazat pe prețuri actuale',
      'Scalare: Ajustare cantități pentru orice număr de porții',
      'Fișe tehnice: Generare automată HACCP'
    ]
  },
  // Setări
  '/settings': {
    title: 'Configurare Restaurant',
    description: 'Configurare generală a restaurantului și sistemului',
    instructions: [
      'Configurați informațiile de bază ale restaurantului',
      'Setați programul de funcționare',
      'Configurați taxe și TVA',
      'Gestionați metodele de plată acceptate',
      'Configurați integrarea cu sisteme externe'
    ],
    features: [
      'Informații restaurant: Nume, Adresă, Contact',
      'Program: Zile și ore de funcționare',
      'Fiscal: TVA, Taxe, Case de marcat',
      'Integrări: Delivery platforms, Payment gateways'
    ]
  },
  '/settings/manual-instructiuni': {
    title: 'Manual Instrucțiuni',
    description: 'Ghid complet pentru utilizarea aplicației Restaurant App v3',
    instructions: [
      'Accesați manualul complet cu toate instrucțiunile',
      'Navigați prin secțiuni pentru a găsi informațiile necesare',
      'Descărcați manualul pentru referință offline',
      'Utilizați căutarea pentru a găsi rapid informații specifice',
      'Consultați ghidurile rapide pentru diferite roluri'
    ],
    features: [
      'Manual complet: 52 secțiuni documentate',
      'Ghiduri rapide: Pentru Admin, Ospătar, Bucătar, Barman',
      'Screenshots: Capturi ecran pentru fiecare interfață',
      'Download: PDF sau Markdown pentru referință'
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
    'general': 'Funcționalitate generală'
  };
  return descriptions[category] || 'Funcționalitate aplicație';
}

function generateDefaultInstructions(label, path, category) {
  const baseInstructions = [
    `Pagina ${label} permite gestionarea și configurarea ${getCategoryDescription(category).toLowerCase()}`,
    'Utilizați filtrele și căutarea pentru a găsi informații specifice',
    'Click pe elemente pentru a accesa detalii complete',
    'Utilizați butoanele de acțiune pentru operațiuni comune',
    'Exportați datele pentru analiză sau backup'
  ];
  
  // Instrucțiuni specifice pe categorii
  if (category === 'comenzi') {
    baseInstructions.push('Monitorizați statusul comenzilor în timp real');
    baseInstructions.push('Modificați statusul comenzilor direct din listă');
  } else if (category === 'stocuri') {
    baseInstructions.push('Configurați alerte pentru stocuri scăzute');
    baseInstructions.push('Importați stocuri din fișiere Excel sau CSV');
  } else if (category === 'setări') {
    baseInstructions.push('Salvați modificările pentru a le aplica');
    baseInstructions.push('Verificați validarea datelor înainte de salvare');
  }
  
  return baseInstructions;
}

function generateDefaultFeatures(label, path, category) {
  const baseFeatures = [
    'Interfață intuitivă și ușor de utilizat',
    'Căutare și filtrare avansată',
    'Export date în multiple formate',
    'Actualizare în timp real'
  ];
  
  // Features specifice pe categorii
  if (category === 'comenzi') {
    baseFeatures.push('Status tracking în timp real');
    baseFeatures.push('Notificări pentru evenimente importante');
  } else if (category === 'stocuri') {
    baseFeatures.push('Alerte automate pentru stocuri scăzute');
    baseFeatures.push('Istoric complet mișcări stoc');
  } else if (category === 'rapoarte') {
    baseFeatures.push('Grafice interactive');
    baseFeatures.push('Export Excel și PDF');
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
  
  return `
${indent}<section id="${page.path.replace(/[^a-zA-Z0-9]/g, '-')}" class="page-documentation">
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
${indent}    <img src="screenshots/admin-vite/${page.path.replace(/[^a-zA-Z0-9]/g, '-')}.png" 
${indent}         alt="${page.title}" 
${indent}         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
${indent}    <p class="screenshot-placeholder" style="display:none;">
${indent}      📷 Captură ecran va fi adăugată după rularea testelor de screenshot
${indent}    </p>
${indent}  </div>
${indent}</section>
`;
}

// Generează HTML complet
function generateCompleteHTML(pages) {
  const tableOfContents = pages.map((page, index) => {
    const indent = '    '.repeat(page.level);
    const anchor = page.path.replace(/[^a-zA-Z0-9]/g, '-');
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
  const pages = processNavigationItems(NAVIGATION_ITEMS);
  
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
