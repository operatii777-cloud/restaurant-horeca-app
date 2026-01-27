/**
 * GENERARE MANUAL DOCUMENTAȚIE COMPLETĂ
 *
 * Script pentru generarea manualului de instrucțiuni complet
 * cu explicații detaliate pentru fiecare interfață capturată
 */

const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const MANUAL_PATH = path.join(__dirname, 'MANUAL-INSTRUCTIUNI-COMPLETE.md');

// Lista tuturor screenshot-urilor cu explicații detaliate
const SCREENSHOT_DOCUMENTATION = [
  // ========================================
  // DASHBOARD & ACASĂ
  // ========================================
  {
    filename: '01-dashboard-principal.png',
    title: '1. Dashboard Principal',
    description: 'Panoul de control principal al aplicației Restaurant App v3',
    sections: [
      '**📊 KPI Cards Principale:**',
      '- **Vânzări Astăzi** - Totalul vânzărilor pentru ziua curentă',
      '- **Comenzi Active** - Numărul comenzilor în procesare',
      '- **Timp Servire Mediu** - Durata medie de servire a comenzilor',
      '- **Profitabilitate** - Profit brut și net calculat',
      '',
      '**📈 Grafice și Analize:**',
      '- Vânzări pe perioade (ultima oră, zi, săptămână, lună)',
      '- Top 5 produse cele mai vândute',
      '- Analiză profitabilitate pe categorii',
      '- Comparație performanță față de perioada anterioară',
      '',
      '**🎯 Funcționalități Dashboard:**',
      '- Vizualizare în timp real a indicatorilor cheie',
      '- Alerte automate pentru valori critice',
      '- Export rapoarte rapide în PDF',
      '- Navigare rapidă către module specifice'
    ]
  },

  {
    filename: '02-pos-kiosk-dashboard.png',
    title: '2. POS/Kiosk Dashboard',
    description: 'Interfața principală pentru sistemele POS și Kiosk self-service',
    sections: [
      '**🖥️ Funcții POS/Kiosk:**',
      '- Gestionare comenzi în timp real',
      '- Integrare cu sistemele de plată',
      '- Gestionare mese și clienți',
      '- Sincronizare cu bucătăria și bar',
      '',
      '**📱 Interfețe Disponibile:**',
      '- **POS Split Screen** - Pentru ospătari (comandă + plată simultan)',
      '- **Kiosk Self-Service** - Pentru clienți self-service',
      '- **Kiosk Tables** - Gestionare mese disponibile',
      '- **Hostess Map** - Hartă restaurant cu mese ocupate/libere',
      '',
      '**🔄 Flux de Lucru:**',
      '1. Selecție masă/client',
      '2. Adăugare produse în comandă',
      '3. Aplicare reduceri/promoții',
      '4. Procesare plată',
      '5. Trimitere comandă către bucătărie'
    ]
  },

  {
    filename: '03-kds-bucatarie.png',
    title: '3. Kitchen Display System (KDS) - Bucătărie',
    description: 'Sistemul de afișare pentru bucătari cu comenzi active și status preparare',
    sections: [
      '**👨‍🍳 Funcții KDS Bucătărie:**',
      '- Afișare comenzi active în timp real',
      '- Organizare comenzi pe stații (apetitiv, principal, desert)',
      '- Timer-e automate pentru fiecare comandă',
      '- Notificări pentru comenzi urgente/prioritare',
      '',
      '**📋 Status Comenzi:**',
      '- **Nouă** - Comandă primită, așteaptă pregătire',
      '- **În Preparare** - Bucătarul a început lucrul',
      '- **Gata** - Preparată, așteaptă servire',
      '- **Servită** - Livrată clientului',
      '',
      '**⚡ Funcții Avansate:**',
      '- Filtrare pe tip preparat (cald/rece)',
      '- Alerte pentru ingrediente lipsă',
      '- Timp estimat de preparare',
      '- Notificări push către ospătari'
    ]
  },

  {
    filename: '04-kds-bar.png',
    title: '4. Kitchen Display System (KDS) - Bar',
    description: 'Sistemul de afișare pentru barmani cu băuturi și comenzi active',
    sections: [
      '**🍸 Funcții KDS Bar:**',
      '- Gestionare comenzi băuturi în timp real',
      '- Organizare pe categorii (bere, vin, cocktail-uri)',
      '- Prioritizare comenzi Happy Hour',
      '- Sincronizare cu POS-ul ospătarilor',
      '',
      '**🥂 Tipuri Băuturi Gestionate:**',
      '- **Bere** - Draft și sticle',
      '- **Vin** - Lista completă cu ani și regiuni',
      '- **Cocktail-uri** - Rețete standardizate',
      '- **Băuturi Nealcoolice** - Sucuri, apă, cafea',
      '',
      '**📊 Monitorizare Bar:**',
      '- Nivel stocuri băuturi',
      '- Consum mediu pe masă',
      '- Timp servire cocktail-uri',
      '- Analiză vânzări pe categorii'
    ]
  },

  // ========================================
  // GESTIUNE COMENZI
  // ========================================
  {
    filename: '05-gestionare-comenzi.png',
    title: '5. Gestionare Comenzi',
    description: 'Interfață centralizată pentru gestionarea tuturor comenzilor restaurantului',
    sections: [
      '**📋 Funcții Gestionare Comenzi:**',
      '- Vizualizare toate comenzi (active + finalizate)',
      '- Filtrare după status, dată, masă, ospătar',
      '- Modificare comenzi în timp real',
      '- Împărțire plăți între clienți',
      '- Gestionare comenzi speciale (alergeni, preferințe)',
      '',
      '**🔍 Filtre și Căutare:**',
      '- **După Status:** Pending, Preparing, Ready, Served, Paid',
      '- **După Sursă:** POS, Kiosk, Delivery, Takeaway',
      '- **După Ospătar:** Filtrare pe angajat',
      '- **După Masă:** Număr masă sau zonă',
      '',
      '**⚡ Acțiuni Rapide:**',
      '- Adăugare produse la comandă existentă',
      '- Modificare cantități/prețuri',
      '- Aplicare discount-uri globale',
      '- Transfer comandă între mese',
      '- Împărțire comandă pentru plăți separate'
    ]
  },

  {
    filename: '06-istoric-comenzi.png',
    title: '6. Istoric Comenzi',
    description: 'Arhivă completă a tuturor comenzilor cu funcții avansate de căutare și analiză',
    sections: [
      '**📚 Funcții Istoric Comenzi:**',
      '- Căutare în toate comenzile din sistem',
      '- Filtrare avansată pe multiple criterii',
      '- Export date în formate multiple (PDF, Excel, CSV)',
      '- Analiză tendințe și pattern-uri',
      '- Restaurare comenzi șterse accidental',
      '',
      '**🔎 Căutare Avansată:**',
      '- **Text liber:** Nume client, produse, note speciale',
      '- **Interval dată:** De la/până la cu calendar',
      '- **Valoare:** Filtru pe sumă comandă',
      '- **Status:** Toate statusurile disponibile',
      '',
      '**📊 Analize Disponibile:**',
      '- Pattern-uri consum clienți',
      '- Produse populare pe perioadă',
      '- Performanță ospătari pe timp',
      '- Analiză revenire clienți'
    ]
  },

  {
    filename: '07-comenzi-delivery.png',
    title: '7. Comenzi Delivery',
    description: 'Gestionare specializată pentru comenzi de livrare la domiciliu',
    sections: [
      '**🚚 Funcții Delivery:**',
      '- Gestionare adresă livrare cu hartă integrată',
      '- Calcul automat taxe de transport',
      '- Asignare și tracking curieri',
      '- Estimare timp livrare',
      '- Integrare cu aplicații delivery (Glovo, Uber Eats)',
      '',
      '**📍 Gestionare Adrese:**',
      '- Căutare inteligentă adresă',
      '- Validare adresă existentă',
      '- Coordonate GPS pentru optimizare rute',
      '- Istoric comenzi pe adresă',
      '',
      '**👥 Gestionare Curieri:**',
      '- Status curieri (disponibil/ocupat/indisponibil)',
      '- Asignare automată comenzi',
      '- Tracking în timp real',
      '- Raport performanță livrări'
    ]
  },

  {
    filename: '08-comenzi-takeaway.png',
    title: '8. Comenzi Takeaway',
    description: 'Gestionare comenzi pentru ridicare personală din restaurant',
    sections: [
      '**📦 Funcții Takeaway:**',
      '- Programare ora ridicare',
      '- Notificări SMS/email la pregătire',
      '- Sistem coadă așteptare',
      '- Gestionare timp așteptare estimat',
      '- Reduceri pentru comenzi takeaway',
      '',
      '**⏰ Gestionare Timp:**',
      '- Estimare timp preparare',
      '- Notificare client când e gata',
      '- Sistem coadă cu numere',
      '- Prioritizare comenzi urgente',
      '',
      '**💰 Optimizări Takeaway:**',
      '- Meniu special takeaway (fără farfurii)',
      '- Ambalaje optimizate pentru transport',
      '- Reduceri automate pentru comenzi mari',
      '- Marketing pentru clienți takeaway'
    ]
  },

  // ========================================
  // GESTIUNE STOCURI
  // ========================================
  {
    filename: '09-dashboard-stocuri.png',
    title: '9. Dashboard Stocuri',
    description: 'Panou de control pentru gestionarea completă a stocurilor și inventarului',
    sections: [
      '**📦 Funcții Dashboard Stocuri:**',
      '- Vizualizare niveluri stocuri în timp real',
      '- Alerte automate pentru produse aproape epuizate',
      '- Predicție consum bazată pe istoric',
      '- Analiză rotație stocuri (FIFO/FEFO)',
      '- Cost calculat pe unitate pentru fiecare ingredient',
      '',
      '**⚠️ Sistem Alerte:**',
      '- **Stoc Minim:** Notificare când se atinge pragul',
      '- **Stoc Zero:** Produse epuizate complet',
      '- **Data Expirare:** Alertă produse expiră în < 7 zile',
      '- **Vânzare Lentă:** Produse cu rotație slabă',
      '- **Stoc Excesiv:** Produse cu surplus mare',
      '',
      '**📊 Analize Stocuri:**',
      '- Valoare totală inventar',
      '- Cost mediu pe ingredient',
      '- Rata consum pe perioadă',
      '- Comparație costuri între furnizori'
    ]
  },

  {
    filename: '10-inventory-multi-gestiune.png',
    title: '10. Inventar Multi-Gestiune',
    description: 'Sistem avansat pentru gestionarea inventarului în locații multiple',
    sections: [
      '**🏢 Funcții Multi-Gestiune:**',
      '- Gestionare paralelă pentru mai multe restaurante',
      '- Transferuri între locații cu documente tipizate',
      '- Sincronizare automată stocuri între gestiuni',
      '- Rapoarte consolidate pe grup de restaurante',
      '- Control acces pe bază de locație',
      '',
      '**📄 Documente Transfer:**',
      '- **Bon Consum Intern** - Transfer între gestiuni',
      '- **Aviz de Însoțire** - Transport marfă între locații',
      '- **Proces Verbal** - Inventariere diferențe',
      '- **Raport Gestiune** - Situație stocuri pe locație',
      '',
      '**🔄 Sincronizare:**',
      '- Actualizare în timp real între toate locațiile',
      '- Rezervare stoc pentru transferuri în curs',
      '- Audit trail complet pentru toate mișcările',
      '- Backup automat pentru toate gestiunile'
    ]
  },

  {
    filename: '11-furnizori.png',
    title: '11. Gestionare Furnizori',
    description: 'Sistem complet pentru administrarea relațiilor cu furnizorii',
    sections: [
      '**🏢 Funcții Gestionare Furnizori:**',
      '- Catalog furnizori cu date complete',
      '- Gestionare contracte și acorduri comerciale',
      '- Istoric prețuri și condiții de livrare',
      '- Evaluare performanță furnizori',
      '- Comparare oferete pentru același produs',
      '',
      '**📋 Date Furnizor:**',
      '- Informații de contact complete',
      '- Termeni de plată și discount-uri',
      '- Certificate și autorizații',
      '- Rating calitate și punctualitate',
      '',
      '**📊 Analize Furnizori:**',
      '- Comparație prețuri între furnizori',
      '- Analiză cost total (preț + transport + calitate)',
      '- Statistică întârzieri livrări',
      '- Evaluare calitate produse primite'
    ]
  },

  {
    filename: '12-alerte-stocuri.png',
    title: '12. Sistem Alerte Stocuri',
    description: 'Monitorizare inteligentă a stocurilor cu notificări automate',
    sections: [
      '**🚨 Tipuri de Alerte:**',
      '- **Stoc Minim Atins** - Produse sub pragul minim',
      '- **Stoc Zero** - Produse epuizate complet',
      '- **Data Expirare Apropiată** - Produse expiră în < 7 zile',
      '- **Vânzare Lentă** - Produse cu rotație slabă',
      '- **Stoc Excesiv** - Produse cu surplus mare',
      '',
      '**📢 Canale Notificare:**',
      '- **Email** - Manageri și responsabili',
      '- **SMS** - Pentru alerte critice',
      '- **Push Notifications** - În aplicație',
      '- **Dashboard** - Indicatori vizuali roșii/portocalii',
      '',
      '**⚙️ Configurare Alerte:**',
      '- Praguri personalizabile pe produs',
      '- Program orar pentru notificări',
      '- Escaliere automată pentru alerte nesoluționate',
      '- Istoric complet alerte și rezolvări'
    ]
  },

  // ========================================
  // CONTABILITATE
  // ========================================
  {
    filename: '13-bon-consum-admin-vite.png',
    title: '13. Bon Consum (Admin-Vite)',
    description: 'Document tipizat Bon Consum în versiunea modernă React',
    sections: [
      '**📄 Bon Consum - Funcții:**',
      '- Generare documente conforme OMFP 2634/2015',
      '- Calcul automat TVA și totaluri',
      '- Asociere cu comenzi și consumuri',
      '- Export PDF cu antet restaurant',
      '- Sincronizare cu casa de marcat',
      '',
      '**📊 Structură Document:**',
      '- **Antet:** Număr document, dată, gestiune',
      '- **Linii:** Produse consumate cu cantități și prețuri',
      '- **Totaluri:** Sub-total, TVA, Total general',
      '- **Semnături:** Manager, Responsabil gestiune',
      '',
      '**🔗 Integrări:**',
      '- Legătură directă cu stocurile',
      '- Actualizare automată inventar',
      '- Transmitere către ANAF (dacă certificat activ)',
      '- Arhivare electronică conform legislație'
    ]
  },

  {
    filename: '14-situation-vanzari.png',
    title: '14. Situația Vânzărilor',
    description: 'Raport detaliat al vânzărilor cu multiple analize și perspective',
    sections: [
      '**📈 Indicatori Vânzări:**',
      '- Vânzări totale pe perioadă selectată',
      '- Vânzări pe categorii de produse',
      '- Vânzări pe metode de plată',
      '- Vânzări pe surse (POS, Delivery, Takeaway)',
      '',
      '**📊 Analize Detaliate:**',
      '- Evoluție vânzări pe zile/săptămâni/luni',
      '- Comparație cu perioada anterioară',
      '- Top produse și categorii',
      '- Vânzări pe intervale orare',
      '',
      '**💰 Indicatori Financiari:**',
      '- Marje profit pe produs/categorie',
      '- Cost alimentar vs vânzări',
      '- ROI pe promoții și campanii',
      '- Break-even point calculat'
    ]
  },

  {
    filename: '15-rapoarte-financiare.png',
    title: '15. Rapoarte Financiare Complete',
    description: 'Raportare financiară completă cu P&L, cash flow și analize detaliate',
    sections: [
      '**💼 Raport Profit & Loss (P&L):**',
      '- Venituri totale din vânzări',
      '- Costuri alimentare detaliate',
      '- Costuri operaționale (personal, utilități)',
      '- Profit brut și net calculat',
      '- Comparație cu buget și perioadă anterioară',
      '',
      '**💰 Analiză Cash Flow:**',
      '- Intrări din vânzări și alte surse',
      '- Plăți către furnizori și angajați',
      '- Investiții și cheltuieli capitale',
      '- Flux cash lunar/săptămânal',
      '',
      '**📊 Indicatori Cheie:**',
      '- Marje profit pe categorii',
      '- Rata rotației stocurilor',
      '- Cost per client servit',
      '- ROI pe investiții în echipamente'
    ]
  },

  // ========================================
  // CATALOG ȘI MENIU
  // ========================================
  {
    filename: '16-gestionare-catalog.png',
    title: '16. Gestionare Catalog Produse',
    description: 'Sistem complet pentru administrarea catalogului de produse și ingrediente',
    sections: [
      '**📋 Funcții Catalog:**',
      '- Catalog produse cu ierarhie categorii',
      '- Gestionare ingrediente și specificații',
      '- Definire alergeni și aditivi',
      '- Setări prețuri și variante',
      '- Configurare disponibilitate și sezon',
      '',
      '**🏷️ Structură Catalog:**',
      '- **Categorii principale** (Mâncăruri, Băuturi, Deserturi)',
      '- **Subcategorii** pentru organizare detaliată',
      '- **Produse individuale** cu specificații complete',
      '- **Ingrediente** cu cantități și unități de măsură',
      '',
      '**⚙️ Configurări Avansate:**',
      '- **Alergeni:** Marcarea conform legislație (14 alergeni majori)',
      '- **Aditivi:** Coduri E pentru etichetare',
      '- **Valori nutriționale:** Calorii, proteine, grăsimi',
      '- **Fotografii:** Imagini pentru meniu digital'
    ]
  },

  {
    filename: '17-gestionare-meniu.png',
    title: '17. Gestionare Meniu Restaurant',
    description: 'Interfață pentru crearea și administrarea meniului restaurantului',
    sections: [
      '**🍽️ Funcții Gestionare Meniu:**',
      '- Creare meniu digital interactiv',
      '- Organizare produse pe categorii',
      '- Setări prețuri dinamice',
      '- Configurare disponibilitate',
      '- Gestionare oferte speciale și promoții',
      '',
      '**📱 Prezentare Digitală:**',
      '- **Meniu Client:** Interfață pentru comenzi online',
      '- **Meniu Ospătar:** Acces rapid în POS',
      '- **Meniu Bucătărie:** Lista completă cu specificații',
      '- **Meniu PDF:** Export pentru printare',
      '',
      '**🎨 Personalizare:**',
      '- Layout și design personalizabil',
      '- Fotografii produse high-quality',
      '- Descrieri detaliate și alergeni',
      '- Traduceri în multiple limbi'
    ]
  },

  {
    filename: '18-retete-fise-tehnice.png',
    title: '18. Rețete și Fișe Tehnice',
    description: 'Sistem complet pentru gestionarea rețetelor și specificațiilor tehnice',
    sections: [
      '**📖 Gestionare Rețete:**',
      '- Rețete detaliate cu ingrediente și cantități',
      '- Instrucțiuni de preparare pas cu pas',
      '- Timp estimat de preparare',
      '- Specificații echipamente necesare',
      '- Cost calculat pe porție',
      '',
      '**📄 Fișe Tehnice:**',
      '- Specificații HACCP complete',
      '- Temperaturi critice de preparare',
      '- Timp de răcire și păstrare',
      '- Responsabilități pe fiecare pas',
      '- Proceduri de siguranță alimentară',
      '',
      '**🔬 Analize Nutriționale:**',
      '- Valori calorice pe porție',
      '- Conținut proteine, grăsimi, carbohidrați',
      '- Vitamine și minerale',
      '- Alergeni prezenți și cantități'
    ]
  },

  {
    filename: '19-ingrediente.png',
    title: '19. Catalog Ingrediente',
    description: 'Baza de date completă a tuturor ingredientelor folosite în restaurant',
    sections: [
      '**📦 Funcții Catalog Ingrediente:**',
      '- Bază de date cu 250+ ingrediente standard',
      '- Specificații complete pentru fiecare ingredient',
      '- Conversii unități de măsură automate',
      '- Gestionare furnizori și prețuri',
      '- Control calitate și certificate',
      '',
      '**🏷️ Specificații Ingrediente:**',
      '- **Origine:** Țară și regiune de proveniență',
      '- **Calitate:** Standarde și certificate deținute',
      '- **Condiții păstrare:** Temperatură, umiditate',
      '- **Durată valabilitate:** Perioade recomandate',
      '',
      '**💰 Gestionare Costuri:**',
      '- Prețuri de achiziție per furnizor',
      '- Cost mediu calculat automat',
      '- Comparație prețuri între furnizori',
      '- Istoric evoluție prețuri'
    ]
  },

  // ========================================
  // RAPOARTE
  // ========================================
  {
    filename: '20-rapoarte-stoc.png',
    title: '20. Rapoarte Stocuri Detaliate',
    description: 'Raportare completă pentru toate mișcările și stările stocurilor',
    sections: [
      '**📊 Tipuri Rapoarte Stoc:**',
      '- **Stare Actuală Stocuri** - Niveluri curente toate produse',
      '- **Mișcări Stoc** - Intrări, ieșiri, ajustări pe perioadă',
      '- **Analiză Rotație** - Produse cu rotație rapidă/lentă',
      '- **Costuri Stoc** - Valoare inventar și costuri',
      '- **Previziuni Consum** - Predicții bazate pe istoric',
      '',
      '**🔍 Analize Detaliate:**',
      '- **ABC Analysis** - Clasificare produse A/B/C',
      '- **XYZ Analysis** - Predictibilitate consum',
      '- **FMEA Analysis** - Riscuri și impact',
      '- **JIT Analysis** - Just in Time optimization',
      '',
      '**📈 Indicatori Performanță:**',
      '- **Inventory Turnover** - Rată rotație stoc',
      '- **Stockout Rate** - Procent epuizări stoc',
      '- **Carrying Cost** - Cost păstrare inventar',
      '- **Service Level** - Nivel servicii clienți'
    ]
  },

  {
    filename: '21-rapoarte-personal.png',
    title: '21. Rapoarte Performanță Personal',
    description: 'Analize detaliate ale performanței ospătarilor și personalului',
    sections: [
      '**👥 Indicatori Personal:**',
      '- Vânzări totale per ospătar',
      '- Număr comenzi procesate',
      '- Timp mediu servire',
      '- Satisfacție clienți (dacă măsurată)',
      '- Rate erori în comenzi',
      '',
      '**📊 Analize Comparate:**',
      '- Comparație performanță între ospătari',
      '- Evoluție performanță în timp',
      '- Corelație cu programul de lucru',
      '- Impactul training-urilor asupra performanței',
      '',
      '**💰 Indicatori Financiari:**',
      '- Vânzări medii per masă servită',
      '- Tips primite și distribuție',
      '- Cost salarial vs productivitate',
      '- ROI pe investiții în training'
    ]
  },

  // ========================================
  // ENTERPRISE FEATURES
  // ========================================
  {
    filename: '22-menu-engineering.png',
    title: '22. Menu Engineering Analysis',
    description: 'Analiză avansată pentru optimizarea meniului bazată pe profitabilitate',
    sections: [
      '**📈 Analiză Menu Engineering:**',
      '- Clasificare produse în 4 categorii STAR/PLOWHORSE',
      '- **STARS:** Produse populare cu marje mari → Promovați',
      '- **CASH COWS:** Produse populare cu marje mici → Mențineți',
      '- **PUZZLES:** Produse nepopulare cu marje mari → Promovați',
      '- **PLOWHORSES:** Produse nepopulare cu marje mici → Eliminați',
      '',
      '**💰 Calcul Profitabilitate:**',
      '- **Contribution Margin:** Preț vânzare - Cost alimentar',
      '- **Gross Profit:** CM - Costuri operaționale alocate',
      '- **ROI pe produs:** Profit vs investiție în echipamente',
      '',
      '**🎯 Strategii Optimizare:**',
      '- **Pricing dinamic** bazat pe cerere',
      '- **Bundle offers** pentru produse low-profit',
      '- **Cross-selling** pentru creșterea average check',
      '- **Menu redesign** pentru focus pe produse profitabile'
    ]
  },

  {
    filename: '23-food-cost-dashboard.png',
    title: '23. Food Cost Dashboard',
    description: 'Monitorizare în timp real a costurilor alimentare și profitabilității',
    sections: [
      '**💹 Indicatori Food Cost:**',
      '- **Food Cost Percentage** - Cost alimentar % din vânzări',
      '- **Target Food Cost** - Obiectiv bugetat (ideal 28-32%)',
      '- **Actual vs Target** - Comparație cu buget',
      '- **Cost per Category** - Analiză pe categorii produse',
      '',
      '**📊 Analize Detaliate:**',
      '- **Cost per Ingredient** - Urmărire evoluție prețuri',
      '- **Waste Analysis** - Pierderi și impact asupra cost',
      '- **Portion Control** - Verificare cantități servite',
      '- **Supplier Performance** - Comparație furnizori',
      '',
      '**⚡ Alerte și Acțiuni:**',
      '- **Cost Over Budget** - Notificare când depășește ținta',
      '- **Price Increase Alert** - Când furnizori majorează prețuri',
      '- **Waste Threshold** - Când pierderile depășesc norma',
      '- **Menu Price Update** - Sugestii ajustare prețuri'
    ]
  },

  {
    filename: '24-gift-cards.png',
    title: '24. Sistem Gift Cards',
    description: 'Gestionare completă a cardurilor cadou și programelor de loialitate',
    sections: [
      '**🎁 Funcții Gift Cards:**',
      '- Generare carduri cadou digitale/fizice',
      '- Încărcare cu valori fixe sau variabile',
      '- Tracking utilizare și balanță rămasă',
      '- Expirare automată sau fără termen',
      '- Integrare cu program loialitate',
      '',
      '**💳 Tipuri Carduri:**',
      '- **Valoare Fixă:** 50€, 100€, 200€ etc.',
      '- **Valoare Variabilă:** Clientul alege suma',
      '- **Corporate:** Pentru firme și evenimente',
      '- **Sezonier:** Crăciun, Paște, Ziua Mamei',
      '',
      '**📊 Analize și Rapoarte:**',
      '- Vânzări carduri cadou pe perioadă',
      '- Rate utilizare (retragere vs valoare)',
      '- Profil client care cumpără carduri',
      '- Impact asupra veniturilor totale'
    ]
  },

  // ========================================
  // MARKETING ȘI CLIENȚI
  // ========================================
  {
    filename: '25-marketing-clienti.png',
    title: '25. Sistem Marketing și Clienți',
    description: 'Platformă completă pentru marketing digital și gestionare clienți',
    sections: [
      '**📱 Funcții Marketing:**',
      '- Gestionare bază de date clienți',
      '- Campanii email și SMS automate',
      '- Program loialitate cu puncte',
      '- Oferte personalizate bazate pe istoric',
      '- Analiză comportament clienți',
      '',
      '**👥 Gestionare Clienți:**',
      '- Profil complet client (preferințe, alergeni)',
      '- Istoric comenzi și cheltuieli',
      '- Program loialitate și recompense',
      '- Comunicare directă prin aplicație',
      '',
      '**📊 Analize Marketing:**',
      '- **RFM Analysis** - Recency, Frequency, Monetary',
      '- **Customer Lifetime Value** - Valoarea pe viață client',
      '- **Churn Prediction** - Predicție pierdere clienți',
      '- **ROI Campanii** - Randament investiții marketing'
    ]
  },

  {
    filename: '26-rezervari.png',
    title: '26. Sistem Rezervări',
    description: 'Gestionare completă a rezervărilor și optimizare ocupare mese',
    sections: [
      '**📅 Funcții Rezervări:**',
      '- Sistem rezervări online și telefonic',
      '- Gestionare mese și configurații săli',
      '- Notificări automate pentru confirmări',
      '- Waiting list pentru perioade aglomerate',
      '- Integrare cu calendar extern',
      '',
      '**🪑 Gestionare Mese:**',
      '- Configurare mese cu poziții și capacități',
      '- Status în timp real (liber/ocupat/rezervat)',
      '- Blocare mese pentru evenimente speciale',
      '- Istoric utilizare și optimizare layout',
      '',
      '**📊 Analize Ocupare:**',
      '- Rate ocupare pe zile/oră/zona',
      '- Durată medie ședere clienți',
      '- Optimizare programare pentru max revenue',
      '- Predicție cerere pentru rezervări'
    ]
  },

  {
    filename: '27-program-loialitate.png',
    title: '27. Program Loialitate Clienți',
    description: 'Sistem avansat de fidelizare clienți cu puncte și recompense',
    sections: [
      '**🎯 Funcții Program Loialitate:**',
      '- Acumularea punctelor pe fiecare comandă',
      '- Conversie puncte în reduceri sau produse gratuite',
      '- Niveluri de membru (Bronze, Silver, Gold, Platinum)',
      '- Recompense exclusive pentru membri VIP',
      '- Comunicare personalizată prin app',
      '',
      '**💰 Mecanici Puncte:**',
      '- **1 punct per 1€ cheltuit** (bază)',
      '- **Bonus pentru comenzi mari** (+20% puncte)',
      '- **Multiplicator evenimente speciale** (x2, x3)',
      '- **Puncte suplimentare pentru recenzii** (+50)',
      '',
      '**📈 Analize Program:**',
      '- **Retention Rate** - Rată păstrare clienți',
      '- **Average Order Value** - Creșterea valorii comenzilor',
      '- **Frequency Increase** - Creșterea frecvenței vizitelor',
      '- **ROI Program** - Randament investiție în loialitate'
    ]
  },

  // ========================================
  // SETĂRI ȘI CONFIGURARE
  // ========================================
  {
    filename: '28-setari-restaurant.png',
    title: '28. Setări Generale Restaurant',
    description: 'Configurare completă a informațiilor și setărilor restaurantului',
    sections: [
      '**🏢 Informații Restaurant:**',
      '- **Date identificare:** Nume, adresă, telefon, email',
      '- **Program lucru:** Ore deschidere pe zile',
      '- **Date fiscale:** CUI, Registrul Comerț, ANAF',
      '- **Rețele sociale:** Facebook, Instagram, website',
      '',
      '**⚙️ Configurări Operaționale:**',
      '- **Monedă și limbă** implicită',
      '- **Timezone** pentru rapoarte corecte',
      '- **Format dată/oră** în interfețe',
      '- **Setări backup** automat',
      '',
      '**🎨 Branding și Design:**',
      '- **Logo și culori** corporate',
      '- **Template-uri** pentru documente',
      '- **Mesaje personalizate** pentru clienți',
      '- **Setări meniu** digital (culori, fonturi)'
    ]
  },

  {
    filename: '29-gestionare-ospatari.png',
    title: '29. Gestionare Personal și PIN-uri',
    description: 'Administrare completă a personalului cu PIN-uri și permisiuni',
    sections: [
      '**👥 Gestionare Personal:**',
      '- Adăugare/modificare date angajați',
      '- Configurare PIN-uri pentru autentificare',
      '- Setare roluri și permisiuni',
      '- Program de lucru și ture',
      '- Salarii și beneficii',
      '',
      '**🔐 Sistem PIN-uri:**',
      '- **PIN unic** per angajat (4-6 cifre)',
      '- **Roluri diferite:** Admin, Manager, Ospătar, Barman',
      '- **Permisiuni granulare:** Ce pot vedea/modifica',
      '- **Log activități** pentru audit',
      '',
      '**📊 Analize Personal:**',
      '- **Productivitate** per angajat',
      '- **Erori înregistrate** în sistem',
      '- **Timp conectare** și activitate',
      '- **Training completat** și competențe'
    ]
  },

  {
    filename: '30-configurare-mese.png',
    title: '30. Configurare Mese și Layout',
    description: 'Definire mese, săli și configurație fizică a restaurantului',
    sections: [
      '**🪑 Configurare Mese:**',
      '- **Număr mese** per sală/zona',
      '- **Capacitate** scaune per masă',
      '- **Tip mese:** Standard, Terasă, VIP, Evenimente',
      '- **Poziție în sală** cu coordonate',
      '',
      '**🏛️ Configurare Săli:**',
      '- **Împărțire pe săli/zones:** Principală, Terasă, Bar, VIP',
      '- **Capacitate totală** restaurant',
      '- **Configurații speciale:** Fumat/Nefumat, Copii',
      '- **Prețuri diferite** per zona (dacă aplicabil)',
      '',
      '**📱 Integrare Digitală:**',
      '- **Harta interactivă** pentru rezervări',
      '- **Status real-time** mese ocupate/libere',
      '- **Sincronizare** cu sistem POS',
      '- **Analytics** ocupare și optimizare'
    ]
  },

  // ========================================
  // FISCAL ȘI ANAF
  // ========================================
  {
    filename: '31-integrare-anaf.png',
    title: '31. Integrare ANAF și e-Facturare',
    description: 'Sistem complet pentru conformitate fiscală și raportare către ANAF',
    sections: [
      '**🏛️ Funcții Integrare ANAF:**',
      '- **Certificat digital** pentru semnătură electronică',
      '- **Transmisie automată** documente către ANAF',
      '- **Validare în timp real** a documentelor',
      '- **Sincronizare** cu baza de date ANAF',
      '',
      '**📄 Documente Fiscale:**',
      '- **Facturi electronice** conforme cu e-Factura',
      '- **Bonuri fiscale** prin case de marcat',
      '- **Declarații TVA** automate',
      '- **Rapoarte SAF-T** pentru audit',
      '',
      '**🔒 Securitate și Conformitate:**',
      '- **Criptare** date în tranzit și stocare',
      '- **Audit trail** complet pentru toate operațiunile',
      '- **Backup redundant** pentru documente fiscale',
      '- **Conformitate GDPR** pentru date clienți'
    ]
  },

  {
    filename: '32-casa-de-marcat.png',
    title: '32. Casa de Marcat Fiscală',
    description: 'Sistem casa de marcat conform cu OMFP 2634/2015 și legislația în vigoare',
    sections: [
      '**🧾 Funcții Casa de Marcat:**',
      '- **Înregistrare** toate vânzările cu fiscalizare',
      '- **Bon fiscal** generat automat per comandă',
      '- **Sincronizare** cu ANAF în timp real',
      '- **Arhivă electronică** documente fiscale',
      '',
      '**📊 Rapoarte Fiscale:**',
      '- **Raport X** - Închidere zilnică parțială',
      '- **Raport Z** - Închidere zilnică definitivă',
      '- **Raport Lunar** - Situație lunară completă',
      '- **Raport Anual** - Declarație anuală',
      '',
      '**⚖️ Conformitate Legală:**',
      '- **OMFP 2634/2015** implementat complet',
      '- **Coduri CAEN** configurate corespunzător',
      '- **Cote TVA** actualizate și corecte',
      '- **Sigil fiscal** digital activ'
    ]
  },

  // ========================================
  // COMPLIANCE ȘI HACCP
  // ========================================
  {
    filename: '33-dashboard-haccp.png',
    title: '33. Dashboard HACCP și Compliance',
    description: 'Monitorizare completă a conformității HACCP și siguranței alimentare',
    sections: [
      '**✅ Funcții HACCP Dashboard:**',
      '- **Monitorizare în timp real** procese critice',
      '- **Temperaturi înregistrate** automat de senzori',
      '- **Alerte automate** pentru depășiri limite',
      '- **Audit trail** complet pentru toate înregistrările',
      '',
      '**🌡️ Procese Monitorizate:**',
      '- **Recepție materii prime** (temperatură < 5°C)',
      '- **Depozitare frigider** (0-4°C)',
      '- **Depozitare congelator** (< -18°C)',
      '- **Preparare și Gătire** (> 75°C intern)',
      '- **Răcire rapidă** (60°C → 10°C în < 2 ore)',
      '',
      '**🚨 Sistem Alerte HACCP:**',
      '- **Temperatură critică** - Notificare imediată',
      '- **Proceduri deviate** - Alertă manager',
      '- **Audit depășit** - Acțiuni corective obligatorii',
      '- **Raportare incident** - Documentare completă'
    ]
  },

  {
    filename: '34-procese-haccp.png',
    title: '34. Definire Procese HACCP',
    description: 'Configurare detaliată a tuturor proceselor HACCP și punctelor critice',
    sections: [
      '**🔄 Procese HACCP Standard:**',
      '- **Recepție și Inspecție** materii prime',
      '- **Depozitare** cu control temperatură',
      '- **Preparare și Gătire** cu temperaturi minime',
      '- **Răcire și Păstrare** cu limite stricte',
      '- **Servire** și prezentare finală',
      '',
      '**📋 Puncte Critice de Control (CCP):"',
      '- **Limite critice** pentru fiecare proces',
      '- **Proceduri de monitorizare**',
      '- **Acțiuni corective** pentru deviații',
      '- **Înregistrări** obligatorii',
      '',
      '**📊 Documentare HACCP:**',
      '- **Plan HACCP** complet și actualizat',
      '- **Analiză de risc** pentru fiecare proces',
      '- **Proceduri operaționale** standardizate',
      '- **Training personal** și competențe'
    ]
  },

  // ========================================
  // AUDIT ȘI SECURITATE
  // ========================================
  {
    filename: '35-audit-log.png',
    title: '35. Audit Log Complet',
    description: 'Sistem complet de audit pentru toate acțiunile utilizatorilor în sistem',
    sections: [
      '**📋 Funcții Audit Log:**',
      '- **Înregistrare completă** toate acțiunile utilizatorilor',
      '- **Categorii evenimente:** Login, Modificări, Ștergeri, Exporturi',
      '- **Filtrare avansată** pe utilizator, dată, tip eveniment',
      '- **Export rapoarte** audit pentru autorități',
      '',
      '**🔍 Tipuri Evenimente Urmărite:**',
      '- **Autentificare:** Login/logout, schimbare parole',
      '- **Modificări date:** Creare/editare/ștergere înregistrări',
      '- **Acces fișiere:** Exporturi, backup-uri, importuri',
      '- **Configurări:** Modificări setări sistem',
      '',
      '**📊 Analize Securitate:**',
      '- **Tentative acces** neautorizat',
      '- **Pattern-uri suspicioase** activitate',
      '- **Audit compliance** pentru reglementări',
      '- **Raportare incidente** de securitate'
    ]
  },

  {
    filename: '36-user-activity.png',
    title: '36. Monitorizare Activitate Utilizatori',
    description: 'Analiză detaliată a activității tuturor utilizatorilor sistemului',
    sections: [
      '**👤 Funcții Monitorizare:**',
      '- **Timp conectare** și sesiuni active',
      '- **Acțiuni frecvente** per utilizator',
      '- **Productivitate** măsurată în timp real',
      '- **Alertă inactivitate** automată',
      '',
      '**📈 Indicatori Activitate:**',
      '- **Timp mediu sesiune** per rol utilizator',
      '- **Număr acțiuni** per oră/zi',
      '- **Rate erori** și corecții',
      '- **Comparare** între utilizatori similar',
      '',
      '**🎯 Optimizări:**',
      '- **Training țintit** pentru utilizatori lenți',
      '- **Automatizare** pentru task-uri repetitive',
      '- **Redistribuire** sarcini pentru optimizare',
      '- **Monitorizare** performanță echipă'
    ]
  },

  // ========================================
  // POS/KIOSK INTERFEȚE
  // ========================================
  {
    filename: '37-kiosk-dashboard.png',
    title: '37. Kiosk Dashboard - Gestionare Self-Service',
    description: 'Panou de control pentru sistemele de comandă self-service',
    sections: [
      '**🖥️ Funcții Kiosk Dashboard:**',
      '- **Monitorizare** toate terminalele Kiosk active',
      '- **Status echipamente** și conexiuni',
      '- **Gestionare meniuri** pentru fiecare terminal',
      '- **Analiză comenzi** generate de Kiosk',
      '',
      '**📊 Statistici Kiosk:**',
      '- **Număr comenzi** per terminal și perioadă',
      '- **Timp mediu** procesare comandă',
      '- **Rate conversie** vizitatori → clienți',
      '- **Produse populare** în self-service',
      '',
      '**⚙️ Configurare Kiosk:**',
      '- **Meniuri personalizate** per locație',
      '- **Limite de timp** pentru fiecare pas',
      '- **Opțiuni plată** disponibile',
      '- **Mesaje personalizate** și branding'
    ]
  },

  {
    filename: '38-kiosk-tables.png',
    title: '38. Kiosk Tables - Gestionare Mese',
    description: 'Interfață pentru asignarea și monitorizarea meselor în sistem Kiosk',
    sections: [
      '**🪑 Funcții Gestionare Mese:**',
      '- **Hartă vizuală** restaurant cu mese disponibile',
      '- **Rezervare mese** prin Kiosk',
      '- **Status în timp real** ocupare mese',
      '- **Optimizare** plasare clienți',
      '',
      '**📍 Tipuri Zone:**',
      '- **Masă Standard** - 2-4 persoane',
      '- **Masă Familie** - 4-6 persoane',
      '- **Seating Bar** - Pentru persoane singure',
      '- **Terasa** - Exterior (dacă disponibil)',
      '',
      '**⏰ Gestionare Timp:**',
      '- **Rezervare** cu oră specifică',
      '- **Timp așteptare** estimat',
      '- **Notificări** când masa e gata',
      '- **Extindere automată** dacă întârzie'
    ]
  },

  {
    filename: '39-pos-split-screen.png',
    title: '39. POS Split Screen - Ospătari',
    description: 'Interfață split screen pentru ospătari - comandă și plată simultan',
    sections: [
      '**📱 Funcții Split Screen:**',
      '- **Stânga:** Creare și editare comandă',
      '- **Dreapta:** Procesare plată și închidere',
      '- **Sync în timp real** între cele două panouri',
      '- **Comenzi multiple** deschise simultan',
      '',
      '**🍽️ Creare Comandă (Panou Stâng):**',
      '- **Selecție masă** și clienți',
      '- **Adăugare produse** cu cantități',
      '- **Modificări speciale** (alergeni, preferințe)',
      '- **Calcul automat** totaluri și TVA',
      '',
      '**💰 Procesare Plată (Panou Drept):**',
      '- **Metode plată** disponibile',
      '- **Împărțire** între mai mulți clienți',
      '- **Tipuri bon** (fiscal, nefiscal)',
      '- **Închidere finală** și eliberare masă'
    ]
  },

  // ========================================
  // DASHBOARDS SPECIALE
  // ========================================
  {
    filename: '40-dashboard-hostess.png',
    title: '40. Dashboard Hostess - Gestionare Intrări',
    description: 'Interfață specializată pentru hostess - mese și clienți așteptare',
    sections: [
      '**👩‍💼 Funcții Dashboard Hostess:**',
      '- **Monitorizare mese** disponibile și ocupate',
      '- **Gestionare listă așteptare** clienți',
      '- **Rezervări** și confirmări',
      '- **Coordonare** cu ospătari și bucătari',
      '',
      '**📋 Gestionare Așteptare:**',
      '- **Număr persoane** în așteptare',
      '- **Timp estimat** până la masă',
      '- **Notificări** când masa e pregătită',
      '- **Priorități** pentru clienți speciali',
      '',
      '**📊 Indicatori Hostess:**',
      '- **Timp mediu așteptare**',
      '- **Rate ocupare** mese în timp real',
      '- **Satisfacție clienți** cu serviciul',
      '- **Optimizare** flux clienți'
    ]
  },

  {
    filename: '41-dashboard-garderoba.png',
    title: '41. Dashboard Garderobă - Gestionare Haine',
    description: 'Sistem complet pentru gestionarea garderobei și obiectelor clienților',
    sections: [
      '**🧥 Funcții Garderobă:**',
      '- **Primire haine** cu tichet electronic',
      '- **Stocare organizată** pe rafturi/zones',
      '- **Returnare rapidă** scanând tichet',
      '- **Gestionare obiecte** pierdute/găsite',
      '',
      '**🎫 Sistem Tichete:**',
      '- **Tichet unic** per client/vizită',
      '- **Cod QR** pentru returnare rapidă',
      '- **Istoric complet** obiecte încredințate',
      '- **Backup electronic** pentru toate înregistrările',
      '',
      '**📦 Gestionare Obiecte Speciale:**',
      '- **Valori** (genți, laptopuri)',
      '- **Copii** fără supraveghere',
      '- **Obiecte medicale** urgente',
      '- **Integrare** cu sistem securitate'
    ]
  },

  // ========================================
  // ADMIN ADVANCED (LEGACY)
  // ========================================
  {
    filename: '42-admin-advanced-dashboard.png',
    title: '42. Admin Advanced Dashboard - Funcții Extinse',
    description: 'Dashboard Admin Advanced cu funcționalități enterprise extinse',
    sections: [
      '**⚙️ Funcții Admin Advanced:**',
      '- **Modul enterprise** cu funcții avansate',
      '- **Multi-gestiune** pentru lanțuri de restaurante',
      '- **Integrări enterprise** (ERP, CRM, BI)',
      '- **Rapoarte avansate** și analytics',
      '',
      '**🏢 Caracteristici Enterprise:**',
      '- **Scalabilitate** pentru sute de locații',
      '- **API complete** pentru integrări',
      '- **Backup redundant** și disaster recovery',
      '- **Security enterprise** cu LDAP/SSO',
      '',
      '**📊 Funcții Exclusive:**',
      '- **Menu Engineering** avansat',
      '- **Predictive Analytics** pentru vânzări',
      '- **Automated Purchasing** inteligent',
      '- **Weather Integration** pentru predicții'
    ]
  },

  {
    filename: '43-stoc-advanced.png',
    title: '43. Gestiune Stocuri Advanced',
    description: 'Sistem avansat de gestiune stocuri în Admin Advanced',
    sections: [
      '**📦 Funcții Avansate Stoc:**',
      '- **JIT (Just in Time)** pentru aprovizionare',
      '- **ABC/XYZ Analysis** pentru clasificare',
      '- **Automated Reordering** inteligent',
      '- **Cross-location transfers** optimize',
      '',
      '**🤖 Inteligență Artificială:**',
      '- **Predicție consum** bazată pe ML',
      '- **Optimizare comenzi** furnizori',
      '- **Detectare anomalii** în consum',
      '- **Recomandări** pentru ajustări prețuri',
      '',
      '**🔗 Integrări Enterprise:**',
      '- **ERP Integration** sincronizare completă',
      '- **Supplier Portals** conectare directă',
      '- **IoT Sensors** pentru monitorizare',
      '- **Blockchain** pentru traceability'
    ]
  },

  {
    filename: '44-rapoarte-complexe.png',
    title: '44. Rapoarte Complexe și Analytics',
    description: 'Sistem avansat de raportare și business intelligence',
    sections: [
      '**📊 Business Intelligence:**',
      '- **Real-time dashboards** interactive',
      '- **Predictive analytics** pentru vânzări',
      '- **Customer segmentation** avansat',
      '- **Competitor analysis** integrat',
      '',
      '**🔍 Analize Avansate:**',
      '- **Cohort Analysis** pentru retenție',
      '- **Customer Lifetime Value** predictiv',
      '- **Market Basket Analysis** pentru cross-selling',
      '- **Sentiment Analysis** pentru feedback',
      '',
      '**📈 Funcții Predictive:**',
      '- **Sales Forecasting** precis',
      '- **Demand Planning** automat',
      '- **Price Optimization** dinamic',
      '- **Churn Prediction** pentru clienți'
    ]
  },

  // ========================================
  // PAGINI LEGACY HTML
  // ========================================
  {
    filename: '45-admin-legacy.png',
    title: '45. Admin Legacy (admin.html)',
    description: 'Interfață admin tradițională HTML cu toate funcționalitățile de bază',
    sections: [
      '**🌐 Interfață Legacy Admin:**',
      '- **HTML clasic** fără framework-uri moderne',
      '- **Funcționalitate completă** pentru operațiuni de bază',
      '- **Compatibilitate** cu browsere vechi',
      '- **Performanță** optimizată pentru rețele lente',
      '',
      '**📋 Funcții Disponibile:**',
      '- **Gestionare meniu** și produse',
      '- **Comenzi active** și istoric',
      '- **Stocuri simple** fără analytics complex',
      '- **Rapoarte de bază** pentru operațiuni zilnice',
      '',
      '**🔄 Migrare către Modern:**',
      '- **Admin-Vite** pentru funcții avansate',
      '- **Legacy menținut** pentru compatibilitate',
      '- **Sincronizare** date între sisteme',
      '- **Training gradual** pentru utilizatori'
    ]
  },

  {
    filename: '46-comenzi-client.png',
    title: '46. Comenzi Client (comenzi.html)',
    description: 'Interfață publică pentru clienți care comandă direct din restaurant',
    sections: [
      '**🍽️ Funcții Comenzi Client:**',
      '- **Meniu digital** interactiv pentru clienți',
      '- **Comandă directă** fără intervenție ospătar',
      '- **Personalizare** produse și preferințe',
      '- **Plată online** integrată',
      '',
      '**📱 Experiență Client:**',
      '- **Categorii clare** cu imagini atractive',
      '- **Filtre inteligente** (vegetarian, alergeni)',
      '- **Coș de cumpărături** persistent',
      '- **Timp estimat** preparare și servire',
      '',
      '**💳 Procesare Plată:**',
      '- **Card bancar** securizat',
      '- **Portofel digital** (Apple Pay, Google Pay)',
      '- **Bonuri valoare** și vouchere',
      '- **Facturare electronică** automată'
    ]
  },

  {
    filename: '47-pos-legacy.png',
    title: '47. POS Legacy (pos.html)',
    description: 'Sistem POS tradițional pentru ospătari (dacă există separat)',
    sections: [
      '**🖥️ Funcții POS Legacy:**',
      '- **Interfață simplă** pentru ospătari',
      '- **Operare rapidă** cu touchscreen',
      '- **Integrare** cu imprimante și case de marcat',
      '- **Backup** pentru sistemele moderne',
      '',
      '**⚡ Operațiuni Rapide:**',
      '- **Scanare** produse cu coduri de bare',
      '- **Comenzi frecvente** cu preset-uri',
      '- **Împărțire** automată plăți',
      '- **Modificare rapidă** cantități/prețuri',
      '',
      '**🔗 Integrări POS:**',
      '- **Imprimantă bucătărie** automată',
      '- **Casă de marcat** fiscală conectată',
      '- **Sistem plăți** card/contactless',
      '- **Display client** pentru totaluri'
    ]
  },

  {
    filename: '48-kiosk-legacy.png',
    title: '48. Kiosk Legacy (kiosk.html)',
    description: 'Sistem self-service tradițional pentru comenzi independente',
    sections: [
      '**🖥️ Funcții Kiosk Legacy:**',
      '- **Comandă autonomă** fără personal',
      '- **Interfață touchscreen** intuitivă',
      '- **Ghidare pas cu pas** prin proces',
      '- **Suport multi-limbă** automat',
      '',
      '**👆 Flux Utilizare:**',
      '1. **Selecție limbă** și preferințe',
      '2. **Scanare masă** sau creare profil',
      '3. **Navigare meniu** cu filtre inteligente',
      '4. **Confirmare** și plată contactless',
      '',
      '**🎯 Optimizări Conversie:**',
      '- **Upselling automat** pentru produse complementare',
      '- **Timp mediu** sub 3 minute per comandă',
      '- **Rate succes** peste 95% completare',
      '- **Feedback instant** pentru îmbunătățiri'
    ]
  },

  {
    filename: '49-meniu-client.png',
    title: '49. Meniu Client Public (meniu.html)',
    description: 'Prezentare digitală a meniului pentru vizitatori și marketing',
    sections: [
      '**📖 Funcții Meniu Digital:**',
      '- **Prezentare atractivă** cu fotografii',
      '- **Categorii organizate** logic',
      '- **Filtre avansate** pentru dietă/alergeni',
      '- **Traduceri** în multiple limbi',
      '',
      '**📸 Elemente Vizuale:**',
      '- **Fotografii high-quality** pentru fiecare produs',
      '- **Descrieri detaliate** cu ingrediente',
      '- **Prețuri clare** și oferte speciale',
      '- **Rating și recenzii** clienți',
      '',
      '**📱 Funcții Interactive:**',
      '- **Filtru alergeni** cu iconuri vizuale',
      '- **Calculator caloric** pentru fiecare produs',
      '- **Recomandări personalizate** bazate pe preferințe',
      '- **Partajare** pe rețele sociale'
    ]
  },

  {
    filename: '50-kds-bucatarie-legacy.png',
    title: '50. KDS Bucătărie Legacy',
    description: 'Sistem afișare comenzi pentru bucătari în format tradițional',
    sections: [
      '**👨‍🍳 Funcții KDS Bucătărie:**',
      '- **Afișare comenzi** în timp real',
      '- **Organizare pe stații** (cald, rece, desert)',
      '- **Timer automat** pentru fiecare comandă',
      '- **Notificări sonore** pentru priorități',
      '',
      '**⏱️ Gestionare Timp:**',
      '- **Timp estimat** per tip preparat',
      '- **Alertă întârzieri** automate',
      '- **Sincronizare** cu comenzile ospătarilor',
      '- **Raportare** timp mediu preparare',
      '',
      '**🍳 Stații de Lucru:**',
      '- **Linie Cald** - Supă, Principal, Garnitură',
      '- **Linie Rece** - Salate, Antipasti',
      '- **Desert** - Dulciuri, Înghețată',
      '- **Bar** - Cocktail-uri, Băuturi speciale'
    ]
  },

  {
    filename: '51-kds-bar-legacy.png',
    title: '51. KDS Bar Legacy',
    description: 'Sistem afișare comenzi pentru barmani în format tradițional',
    sections: [
      '**🍸 Funcții KDS Bar:**',
      '- **Comenzi băuturi** în timp real',
      '- **Organizare cocktail-uri** complexe',
      '- **Prioritizare** Happy Hour și evenimente',
      '- **Sincronizare** cu POS ospătari',
      '',
      '**🥃 Gestionare Băuturi:**',
      '- **Bere draft** cu control niveluri',
      '- **Vinuri** cu specificații complete',
      '- **Cocktail-uri** cu rețete standardizate',
      '- **Băuturi speciale** pentru evenimente',
      '',
      '**📋 Control Calitate:**',
      '- **Porții exacte** conform rețete',
      '- **Temperatură servire** optimă',
      '- **Prezentare** consistentă',
      '- **Timp servire** sub 3 minute'
    ]
  },

  {
    filename: '52-rapoarte-pdf.png',
    title: '52. Rapoarte și Export PDF',
    description: 'Sistem generare rapoarte și exporturi în format PDF pentru documentare',
    sections: [
      '**📄 Funcții Rapoarte PDF:**',
      '- **Generare automată** rapoarte zilnice/lunare',
      '- **Export PDF** cu branding restaurant',
      '- **Template-uri** personalizabile',
      '- **Programare** livrare automată',
      '',
      '**📊 Tipuri Rapoarte:**',
      '- **Raport Vânzări** detaliat cu grafice',
      '- **Raport Stocuri** cu mișcări complete',
      '- **Raport Personal** cu performanță echipă',
      '- **Raport Financiar** cu P&L complet',
      '',
      '**📧 Distribuție Automată:**',
      '- **Email programat** către manageri',
      '- **Partajare securizată** cu contabili',
      '- **Arhivare cloud** conform legislație',
      '- **Backup redundant** pentru audit'
    ]
  }
];

// Funcție pentru generare documentație
function generateDocumentation() {
  console.log('📝 Generare documentație completă pentru manualul de instrucțiuni...');

  let markdownContent = `# 📚 MANUAL INSTRUCȚIUNI COMPLET - Restaurant App v3

**Versiune:** 3.0.0  
**Data generare:** ${new Date().toLocaleDateString('ro-RO')}  
**Screenshots capturați:** ${SCREENSHOT_DOCUMENTATION.length}  
**Pentru:** Administratori, Manageri, Personal Operativ

---

## 📋 CUPRINS GENERAL

### 🏠 DASHBOARD & ACASĂ
- [Dashboard Principal](#1-dashboard-principal)
- [POS/Kiosk Dashboard](#2-poskiosk-dashboard)

### 🍳 SISTEME OPERATIVE
- [KDS Bucătărie](#3-kitchen-display-system-kds---bucătărie)
- [KDS Bar](#4-kitchen-display-system-kds---bar)

### 📋 GESTIUNE COMENZI
- [Gestionare Comenzi](#5-gestionare-comenzi)
- [Istoric Comenzi](#6-istoric-comenzi)
- [Comenzi Delivery](#7-comenzi-delivery)
- [Comenzi Takeaway](#8-comenzi-takeaway)

### 📦 GESTIUNE STOCURI
- [Dashboard Stocuri](#9-dashboard-stocuri)
- [Inventar Multi-Gestiune](#10-inventar-multi-gestiune)
- [Gestionare Furnizori](#11-gestionare-furnizori)
- [Alerte Stocuri](#12-alerte-stocuri)

### 💰 CONTABILITATE
- [Bon Consum (Admin-Vite)](#13-bon-consum-admin-vite)
- [Situația Vânzărilor](#14-situația-vânzărilor)
- [Rapoarte Financiare](#15-rapoarte-financiare-complete)

### 🍽️ CATALOG ȘI MENIU
- [Gestionare Catalog](#16-gestionare-catalog-produse)
- [Gestionare Meniu](#17-gestionare-meniu-restaurant)
- [Rețete și Fișe Tehnice](#18-rețete-și-fișe-tehnice)
- [Ingrediente](#19-catalog-ingrediente)

### 📊 RAPOARTE
- [Rapoarte Stoc](#20-rapoarte-stocuri-detaliate)
- [Rapoarte Personal](#21-rapoarte-performanță-personal)

### 🏢 ENTERPRISE FEATURES
- [Menu Engineering](#22-menu-engineering-analysis)
- [Food Cost Dashboard](#23-food-cost-dashboard)
- [Gift Cards](#24-sistem-gift-cards)

### 📱 MARKETING ȘI CLIENȚI
- [Marketing și Clienți](#25-sistem-marketing-și-clienți)
- [Rezervări](#26-sistem-rezervări)
- [Program Loialitate](#27-program-loialitate-clienți)

### ⚙️ SETĂRI ȘI CONFIGURARE
- [Setări Restaurant](#28-setări-generale-restaurant)
- [Gestionare Ospătari](#29-gestionare-personal-și-pin-uri)
- [Configurare Mese](#30-configurare-mese-și-layout)

### 🏛️ FISCAL ȘI ANAF
- [Integrare ANAF](#31-integrare-anaf-și-e-facturare)
- [Casa de Marcat](#32-casa-de-marcat-fiscală)

### ✅ COMPLIANCE ȘI HACCP
- [Dashboard HACCP](#33-dashboard-haccp-și-compliance)
- [Procese HACCP](#34-definire-procese-haccp)

### 🔒 AUDIT ȘI SECURITATE
- [Audit Log](#35-audit-log-complet)
- [User Activity](#36-monitorizare-activitate-utilizatori)

### 🖥️ POS/KIOSK INTERFEȚE
- [Kiosk Dashboard](#37-kiosk-dashboard---gestionare-self-service)
- [Kiosk Tables](#38-kiosk-tables---gestionare-mese)
- [POS Split Screen](#39-pos-split-screen---ospătari)

### 🎯 DASHBOARDS SPECIALE
- [Dashboard Hostess](#40-dashboard-hostess---gestionare-intrări)
- [Dashboard Garderobă](#41-dashboard-garderobă---gestionare-haine)

### ⚙️ ADMIN ADVANCED (LEGACY)
- [Admin Advanced Dashboard](#42-admin-advanced-dashboard---funcții-extinse)
- [Stocuri Advanced](#43-gestiune-stocuri-advanced)
- [Rapoarte Complexe](#44-rapoarte-complexe-și-analytics)

### 🌐 PAGINI LEGACY HTML
- [Admin Legacy](#45-admin-legacy-adminhtml)
- [Comenzi Client](#46-comenzi-client-comenzihtml)
- [POS Legacy](#47-pos-legacy-poshtml)
- [Kiosk Legacy](#48-kiosk-legacy-kioskhtml)
- [Meniu Client](#49-meniu-client-public-meniuhtml)
- [KDS Bucătărie Legacy](#50-kds-bucătărie-legacy)
- [KDS Bar Legacy](#51-kds-bar-legacy)
- [Rapoarte PDF](#52-rapoarte-și-export-pdf)

---

`;

  // Adaugă fiecare secțiune de documentație
  SCREENSHOT_DOCUMENTATION.forEach((doc, index) => {
    markdownContent += `## ${doc.title}

![${doc.title}](${doc.filename})
*${doc.description}*

`;

    doc.sections.forEach(section => {
      markdownContent += `${section}\n`;
    });

    markdownContent += '\n---\n\n';
  });

  // Adaugă secțiune finală cu informații tehnice
  markdownContent += `## 🔧 INFORMAȚII TEHNICE

### 📸 Metodologie Captură Screenshots

**Instrumente utilizate:**
- **Playwright** pentru captură Admin-Vite (React)
- **Puppeteer** pentru captură interfețe legacy HTML
- **Rezoluție:** 1920x1080 pixeli (Full HD)
- **Format:** PNG cu compresie optimizată

**Automate de captură:**
- Autentificare automată cu PIN 5555
- Navigare sistematică prin toate meniurile
- Așteptare încărcare completă (networkidle)
- Captură full-page pentru vizibilitate completă

### 📁 Structura Fișiere Screenshots

**Locație:** \`server/screenshots/\`
**Nomenclatură:** \`NN-descriere.png\`
**Total capturi:** ${SCREENSHOT_DOCUMENTATION.length} screenshots

### 🔄 Proces Generare Documentație

1. **Captură sistematică** cu Playwright și Puppeteer
2. **Analiză interfețe** și identificare funcții cheie
3. **Documentare detaliată** pentru fiecare screenshot
4. **Generare Markdown** automat cu explicații complete
5. **Actualizare manual** cu cele mai noi capturi

### 🎯 Utilizare Manual

- **Pentru administratori:** Explicații complete funcții enterprise
- **Pentru ospătari:** Ghiduri rapide pentru POS/Kiosk
- **Pentru bucătari:** Referință KDS și comenzi
- **Pentru dezvoltatori:** Documentație API și integrări

---

*Documentație generată automat la ${new Date().toLocaleString('ro-RO')}*
*Restaurant App v3 - Manual de Instrucțiuni Complete*
`;

  // Scrie fișierul
  try {
    fs.writeFileSync(MANUAL_PATH, markdownContent, 'utf8');
    console.log(`✅ Manual complet generat: ${MANUAL_PATH}`);
    console.log(`📊 Total secțiuni documentate: ${SCREENSHOT_DOCUMENTATION.length}`);
    console.log(`📸 Total screenshots incluse: ${SCREENSHOT_DOCUMENTATION.length}`);
  } catch (error) {
    console.error('❌ Eroare la scrierea fișierului:', error);
  }
}

// Rulează generarea dacă fișierul este executat direct
if (require.main === module) {
  generateDocumentation();
}

module.exports = { generateDocumentation, SCREENSHOT_DOCUMENTATION };