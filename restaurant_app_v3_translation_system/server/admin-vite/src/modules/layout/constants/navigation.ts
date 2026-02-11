/**
 * PHASE S2 - UI/UX FINAL MAP
 * 
 * Navigație reorganizată: 12 categorii principale, fără duplicate, enterprise-grade.
 * Standard: Toast/Uber/Shopify style
 */

export type NavItem = {
  label: string;
  path?: string;
  icon?: string;
  badge?: string;
  children?: NavItem[];
};

export const NAVIGATION_ITEMS: NavItem[] = [
  // ========================================
  // 1. ACASĂ & DASHBOARD
  // ========================================
  { label: 'Acasă', path: '/dashboard', icon: '🏠' },
  { label: 'POS/KIOSK', path: '/kiosk/dashboard', icon: '🖥️', badge: 'quick' },
  { label: 'Dashboard Executive', path: '/executive-dashboard', icon: '📊', badge: 'nou' },
  { label: 'Monitoring & Performance', path: '/monitoring/performance', icon: '📈', badge: 'nou' },
  { label: 'Monitoring Sistem', path: '/monitoring/health', icon: '💻', badge: 'nou' },

  // ========================================
  // 2. COMENZI & OPERAȚIUNI
  // ========================================
  {
    label: 'Comenzi',
    path: '#',
    icon: '🧾',
    children: [
      { label: 'Gestionare Comenzi', path: '/orders', icon: '📋', badge: 'nou' },
      { label: 'Istoric Comenzi', path: '/orders/history', icon: '📚', badge: 'nou' },
      { label: 'Comenzi Delivery', path: '/orders/delivery', icon: '🚚', badge: 'nou' },
      { label: 'Comenzi Drive-Thru', path: '/orders/drive-thru', icon: '🚗', badge: 'nou' },
      { label: 'Comenzi Takeaway', path: '/orders/takeaway', icon: '📦', badge: 'nou' },
      { label: 'Analiză Anulări', path: '/orders/cancellations', icon: '📉', badge: 'nou' },
      { label: 'KIOSK', path: '/kiosk', icon: '🖥️', badge: 'admin' },
      { label: 'Queue Monitor', path: '/queue-monitor', icon: '📊' },
      { label: 'Curieri Proprii', path: '/couriers', icon: '🛵', badge: 'nou' },
      { label: 'Dispatch', path: '/dispatch', icon: '📡', badge: 'nou' },
    ],
  },

  // ========================================
  // 3. GESTIUNE & STOCURI (CANONIC UI)
  // ========================================
  {
    label: 'Gestiune',
    path: '#',
    icon: '📦',
    children: [
      { label: 'Stocuri', path: '/stocks', icon: '📊' },
      { label: 'Inventar Multi-Gestiune', path: '/stocks/inventory/multi', icon: '🏢', badge: 'nou' },
      { label: 'Inventory Dashboard', path: '/stocks/inventory/dashboard', icon: '📈', badge: 'nou' },
      { label: 'Import Facturi', path: '/stocks/inventory/import', icon: '📥', badge: 'nou' },
      { label: 'Furnizori', path: '/stocks/suppliers', icon: '🏢', badge: 'nou' },
      { label: 'Comenzi Furnizori', path: '/stocks/suppliers/orders', icon: '📦', badge: 'nou' },
      { label: 'Pierderi & Waste', path: '/stocks/waste', icon: '🗑️', badge: 'nou' },
      { label: 'Retur / Restituiri', path: '/tipizate-enterprise/retur', icon: '↩️' },
      { label: 'Etichete Produse', path: '/stocks/labels', icon: '🏷️', badge: 'nou' },
      { label: 'Alergeni', path: '/stocks/allergens', icon: '⚠️', badge: 'nou' },
      { label: 'Stock & Risk Alerts', path: '/stocks/risk-alerts', icon: '⚠️', badge: 'nou' },
      { label: 'Expiry Alerts', path: '/expiry-alerts', icon: '⏰', badge: 'nou' },
      { label: 'Recalls', path: '/recalls', icon: '🚨', badge: 'nou' },
      { label: 'Costuri & Prețuri', path: '/stocks/costs', icon: '💵', badge: 'nou' },
      { label: 'Dashboard Avansat', path: '/stocks/dashboard/advanced', icon: '📈', badge: 'nou' },
      { label: 'Dashboard Executiv', path: '/stocks/dashboard/executive', icon: '📊', badge: 'nou' },
      // NOTĂ: Documentele tipizate (NIR, Bon Consum, Inventar, Transfer, Waste) 
      // sunt disponibile în meniul Contabilitate → Documente Tipizate
    ],
  },

  // ========================================
  // 4. CONTABILITATE (PHASE S6.3 - ENTERPRISE ACCOUNTING MODULE)
  // ========================================
  {
    label: 'Contabilitate',
    path: '#',
    icon: '💰',
    badge: 'nou',
    children: [
      // 4.1 DOCUMENTE TIPIZATE
      {
        label: '📄 Documente Tipizate (Admin-Vite)',
        path: '#',
        icon: '📋',
        children: [
          // Documente conforme OMFP 2634/2015 - implementate în admin-vite
          { label: 'Bon Consum', path: '/tipizate-enterprise/bon-consum', icon: '📝' },
          { label: 'Aviz de Însoțire', path: '/tipizate-enterprise/aviz', icon: '📑' },
          { label: 'Proces Verbal', path: '/tipizate-enterprise/proces-verbal', icon: '📋' },
          { label: 'Pierderi/Waste', path: '/tipizate-enterprise/waste', icon: '🗑️' },
          { label: 'Restituiri', path: '/tipizate-enterprise/retur', icon: '↩️' },
          { label: 'Raport Gestiune', path: '/tipizate-enterprise/raport-gestiune', icon: '📈' },
        ],
      },
      {
        label: '📄 Documente Fiscale (Admin-Advanced)',
        path: '#',
        icon: '🧾',
        children: [
          // Documente disponibile în admin-advanced.html
          { label: 'NIR → Admin Advanced', path: '/admin-advanced/inventory', icon: '📄' },
          { label: 'Facturi → Admin Advanced', path: '/admin-advanced/fiscal?type=invoices', icon: '🧾' },
          { label: 'Chitanțe → Admin Advanced', path: '/admin-advanced/fiscal?type=receipts', icon: '💰' },
          { label: 'Registru Casă → Admin Advanced', path: '/admin-advanced/fiscal?type=register', icon: '💵' },
          { label: 'Transfer → Admin Advanced', path: '/admin-advanced/transfers', icon: '🔄' },
          { label: 'Inventar → Admin Advanced', path: '/admin-advanced/multi-inventory', icon: '📊' },
        ],
      },
      // 4.2 RAPOARTE CONTABILITATE
      {
        label: '📈 Rapoarte Contabilitate',
        path: '#',
        icon: '📊',
        children: [
          { label: 'Raport TVA', path: '/accounting/reports/vat', icon: '🧾', badge: 'nou' },
          { label: 'Raport Plăți Client', path: '/accounting/reports/client-payments', icon: '💳', badge: 'nou' },
          { label: 'Raport Furnizori', path: '/accounting/reports/suppliers', icon: '🏢', badge: 'nou' },
          { label: 'Situația Vânzărilor', path: '/reports/sales', icon: '📈' },
          { label: 'Balanța Stocurilor', path: '/accounting/reports/stock-balance', icon: '📦', badge: 'nou' },
          { label: 'Food Cost Analysis', path: '/food-cost', icon: '💹' },
          { label: 'Profitability Analysis', path: '/reports/financial', icon: '💰' },
          { label: 'Raport Consumuri', path: '/accounting/reports/consumption', icon: '📋', badge: 'nou' },
          { label: 'Intrări după TVA & Cont', path: '/accounting/reports/entries', icon: '📥', badge: 'nou' },
        ],
      },
      // 4.3 SETĂRI CONTABILITATE
      {
        label: '🔧 Setări Contabilitate',
        path: '#',
        icon: '⚙️',
        children: [
          { label: 'Cote TVA', path: '/settings/vat', icon: '🧾' },
          { label: 'Conturi Contabile', path: '/accounting/settings/accounts', icon: '📋', badge: 'nou' },
          { label: 'Mapare Produse → Conturi', path: '/accounting/settings/product-mapping', icon: '🔗', badge: 'nou' },
          { label: 'Conturi Bancare', path: '/accounting/settings/bank-accounts', icon: '🏦', badge: 'nou' },
          { label: 'Format Rapoarte', path: '/accounting/settings/report-format', icon: '📄', badge: 'nou' },
          { label: 'Export Contabilitate', path: '/accounting/settings/export', icon: '📤', badge: 'nou' },
          { label: 'Permisiuni Contabilitate', path: '/accounting/settings/permissions', icon: '🔐', badge: 'nou' },
          // NOTĂ: E-Facturare ANAF este disponibilă în meniul Fiscal (Certificat ANAF)
          { label: 'Perioade Contabile', path: '/accounting/settings/periods', icon: '📅', badge: 'nou' },
        ],
      },
      // 4.4 AUDIT & COMPLIANCE
      {
        label: '🔍 Audit & Compliance',
        path: '#',
        icon: '🔒',
        children: [
          { label: 'Audit Trail', path: '/audit/logs', icon: '📋' },
          { label: 'Semnări Digitale', path: '/accounting/audit/signatures', icon: '✍️', badge: 'nou' },
          { label: 'Security Events', path: '/audit/security', icon: '🛡️' },
          { label: 'User Activity', path: '/audit/user-activity', icon: '👤' },
        ],
      },
    ],
  },

  // ========================================
  // 5. CATALOG & PRODUSE
  // ========================================
  {
    label: 'Catalog',
    path: '#',
    icon: '📋',
    children: [
      { label: 'Categorii & Produse', path: '/catalog', icon: '🗂️', badge: 'nou' },
      { label: 'Gestionare Meniu', path: '/menu', icon: '🍽️', badge: 'nou' },
      { label: 'Menu Builder', path: '/menu/builder', icon: '🛠️', badge: 'nou' },
      { label: 'Categorii Online', path: '/catalog/online', icon: '🛒' },
      { label: 'Grupuri Atribute', path: '/catalog/attributes', icon: '🏷️' },
      { label: 'Utilitare Prețuri', path: '/catalog/prices', icon: '💰' },
      { label: 'Materii Prime', path: '/ingredients', icon: '📦', badge: 'nou' },
      { label: 'Unități de Măsură', path: '/nomenclator/units', icon: '📏', badge: 'nou' },
      { label: 'Portion Control', path: '/portions', icon: '⚖️', badge: 'nou' },
      { label: 'Variance Reports', path: '/variance-reports', icon: '📊', badge: 'nou' },
      { label: 'PDF Builder', path: '/menu-pdf', icon: '🖨️', badge: 'nou' },
    ],
  },

  // ========================================
  // 6. REȚETE & PRODUCȚIE
  // ========================================
  {
    label: 'Rețete',
    path: '#',
    icon: '📖',
    children: [
      { label: 'Rețete & Fișe Tehnice', path: '/recipes', icon: '📋', badge: 'nou' },
      { label: 'Recipe Scaling', path: '/recipes/scaling', icon: '📏', badge: 'nou' },
      { label: 'Fișe Tehnice', path: '/technical-sheets', icon: '📄', badge: 'nou' },
      { label: 'Loturi & Recepții', path: '/lots', icon: '🧾', badge: 'nou' },
      { label: 'Producție', path: '/production/batches', icon: '🧪' },
      { label: 'Traceability', path: '/traceability', icon: '🔍' },
    ],
  },

  // ========================================
  // 7. RAPOARTE & ANALIZĂ
  // ========================================
  {
    label: 'Rapoarte',
    path: '#',
    icon: '📊',
    children: [
      { label: 'Rapoarte Vânzări', path: '/reports/sales', icon: '📈', badge: 'nou' },
      { label: 'Rapoarte Stoc', path: '/reports/stock', icon: '📦', badge: 'nou' },
      { label: 'Rapoarte Financiare', path: '/reports/financial', icon: '💰', badge: 'nou' },
      { label: 'Profit & Loss (P&L)', path: '/reports/profit-loss', icon: '💰', badge: 'nou' },
      { label: 'Analiză ABC Produse', path: '/reports/abc-analysis', icon: '📈', badge: 'nou' },
      { label: 'Predicție Stoc', path: '/reports/stock-prediction', icon: '🔮', badge: 'nou' },
      { label: 'Top Products & Analytics', path: '/reports/top-products', icon: '📊', badge: 'nou' },
      { label: 'Rapoarte Personal', path: '/reports/staff', icon: '👥', badge: 'nou' },
      { label: 'Rapoarte Avansate', path: '/reports/advanced', icon: '📊', badge: 'nou' },
      { label: 'Raport Hostess', path: '/reports/hostess-occupancy', icon: '🗺️', badge: 'nou' },
      { label: 'Raport Garderobă', path: '/reports/coatroom-daily', icon: '🧥', badge: 'nou' },
      { label: 'Raport Lost & Found', path: '/reports/lostfound-items', icon: '🔍', badge: 'nou' },
      { label: 'Delivery Performance', path: '/reports/delivery-performance', icon: '🚚', badge: 'nou' },
      { label: 'Drive-Thru Performance', path: '/reports/drive-thru-performance', icon: '🚗', badge: 'nou' },
      { label: 'Dashboard Hostess', path: '/dashboards/hostess', icon: '📈', badge: 'BI' },
      { label: 'Dashboard Garderobă', path: '/dashboards/coatroom', icon: '📉', badge: 'BI' },
      { label: 'Dashboard Lost & Found', path: '/dashboards/lostfound', icon: '📊', badge: 'BI' },
      { label: 'Statistici per Platformă', path: '/dashboards/platform-stats', icon: '📱', badge: 'BI' },
    ],
  },

  // ========================================
  // 8. ENTERPRISE & FEATURES AVANSATE
  // ========================================
  {
    label: 'Enterprise',
    path: '#',
    icon: '🏢',
    children: [
      { label: 'Menu Engineering', path: '/menu-engineering', icon: '📊', badge: 'nou' },
      { label: 'Food Cost Dashboard', path: '/food-cost', icon: '💹', badge: 'nou' },
      { label: 'Gift Cards', path: '/gift-cards', icon: '🎁', badge: 'nou' },
      { label: 'Smart Restock ML', path: '/smart-restock', icon: '🤖', badge: 'nou' },
      { label: 'Weather Forecast', path: '/weather-forecast', icon: '🌤️', badge: 'nou' },
      { label: 'Competitor Tracking', path: '/competitors', icon: '🔍', badge: 'nou' },
      { label: 'Programare Personal', path: '/scheduling', icon: '📅', badge: 'nou' },
      { label: 'Auto Purchase Orders', path: '/purchase-orders', icon: '📦', badge: 'nou' },
      { label: 'Hostess Map', path: '/hostess-map', icon: '🗺️', badge: 'nou' },
      { label: 'Garderobă & Valet', path: '/coatroom', icon: '🧥', badge: 'nou' },
      { label: 'Lost & Found', path: '/lost-found', icon: '🔍', badge: 'nou' },
      { label: 'Training', path: '/training', icon: '🎓', badge: 'UI TODO' },
    ],
  },

  // ========================================
  // 9. MARKETING & CLIENȚI
  // ========================================
  {
    label: 'Marketing',
    path: '#',
    icon: '📱',
    children: [
      { label: 'Marketing & Clienți', path: '/marketing', icon: '👥', badge: 'nou' },
      { label: 'Feedback Clienți', path: '/marketing/feedback', icon: '💬', badge: 'nou' },
      { label: 'Gestionare Rezervări', path: '/reservations', icon: '🗓️', badge: 'nou' },
      { label: 'Reservations New', path: '/marketing/reservations-new', icon: '📅', badge: 'nou' },
      { label: 'Program Loialitate', path: '/marketing/loyalty', icon: '🎁', badge: 'nou' },
      { label: 'Vouchere & Bonuri', path: '/marketing/vouchers', icon: '🎫', badge: 'nou' },
      { label: 'Daily Menu & Oferte', path: '/daily-menu', icon: '🗒️', badge: 'nou' },
      { label: 'Happy Hour', path: '/promotions/happy-hour', icon: '🍺', badge: 'nou' },
      { label: 'Oferta Zilei', path: '/promotions/daily-offer', icon: '⭐', badge: 'nou' },
    ],
  },

  // ========================================
  // 9.5. MENIURI ADMIN (REFACTORIZATE DIN HTML)
  // ========================================
  {
    label: 'Admin Refactorizat',
    path: '#',
    icon: '🔧',
    badge: 'nou',
    children: [
      { label: 'Admin Principal', path: '/admin-main', icon: '🏠', badge: 'react' },
      { label: 'Admin Avansat', path: '/admin-advanced-menu', icon: '📊', badge: 'react' },
      { label: 'Catalog Rețete', path: '/catalog-recipes', icon: '📚', badge: 'react' },
      { label: 'Catalog Ingrediente', path: '/catalog-ingredients', icon: '📦', badge: 'react' },
    ],
  },

  // ========================================
  // 10. SETĂRI & CONFIGURARE
  // ========================================
  {
    label: 'Setări',
    path: '#',
    icon: '⚙️',
    children: [
      { label: 'Configurare Restaurant', path: '/settings', icon: '🏢' },
      { label: 'Gestiune Locații', path: '/settings/locations', icon: '🏭', badge: 'nou' },
      { label: 'Gestiune Zone/Săli', path: '/settings/areas', icon: '🗺️', badge: 'nou' },
      { label: 'Configurare Mese', path: '/settings/tables', icon: '🪑', badge: 'nou' },
      { label: 'Ospătari & PIN-uri', path: '/waiters', icon: '🧑‍🍳', badge: 'nou' },
      { label: 'Program & Orar', path: '/settings/schedule', icon: '⏰', badge: 'nou' },
      { label: 'Imprimante & Periferice', path: '/settings/printers', icon: '🖨️', badge: 'nou' },
      { label: 'Utilizatori & Permisiuni', path: '/settings/users', icon: '👤', badge: 'nou' },
      { label: 'Notificări & Alerte', path: '/settings/notifications', icon: '🔔', badge: 'nou' },
      { label: 'Localizare', path: '/settings/localization', icon: '🌍', badge: 'nou' },
      { label: 'Personalizare UI', path: '/settings/ui-customization', icon: '🎨', badge: 'nou' },
      { label: 'Aspect & Branding', path: '/settings/branding', icon: '🖼️', badge: 'nou' },
      { label: 'Afișare Produse', path: '/settings/product-display', icon: '🛍️', badge: 'nou' },
      { label: 'Traduceri în Așteptare', path: '/settings/missing-translations', icon: '🌐', badge: 'nou' },
      { label: 'Metode de Plată', path: '/settings/payment-methods', icon: '💳', badge: 'nou' },
      { label: 'Integrări', path: '/integrations', icon: '🔌' },
      { label: 'Sincronizare Platforme', path: '/platform-sync', icon: '🔄', badge: 'nou' },
      { label: 'Import/Export', path: '/settings/import-export', icon: '📥📤' },
      { label: 'Backup', path: '/backup', icon: '💾' },
      { label: 'Manual Instrucțiuni', path: '/settings/manual-instructiuni', icon: '📚', badge: 'nou' },
    ],
  },

  // ========================================
  // 11. FISCAL & LEGAL
  // ========================================
  {
    label: 'Fiscal',
    path: '#',
    icon: '💰',
    children: [
      { label: 'Casa de Marcat', path: '/stocks/fiscal/cash-register', icon: '💰', badge: 'nou' },
      { label: 'Sincronizare ANAF', path: '/stocks/fiscal/sync', icon: '🔄', badge: 'nou' },
      { label: 'Documente Fiscale', path: '/stocks/fiscal/documents/create', icon: '📄', badge: 'nou' },
      // Rapoarte Fiscale (casa de marcat) - DOAR AICI
      { label: 'Raport X', path: '/stocks/fiscal/reports/x', icon: '📄', badge: 'nou' },
      { label: 'Raport Z', path: '/stocks/fiscal/reports/z', icon: '📋', badge: 'nou' },
      { label: 'Raport Lunar', path: '/stocks/fiscal/reports/monthly', icon: '📅', badge: 'nou' },
      { label: 'Arhivă Fiscală', path: '/stocks/fiscal/archive', icon: '📦', badge: 'nou' },
      { label: 'Integrare ANAF', path: '/stocks/fiscal/anaf-integration', icon: '🏛️', badge: 'nou' },
      { label: 'Certificat ANAF', path: '/anaf/certificate', icon: '🔐', badge: 'nou' },
      { label: 'ANAF Health', path: '/anaf/health', icon: '📊', badge: 'nou' },
      { label: 'Submission Monitor', path: '/anaf/submissions', icon: '📋', badge: 'nou' },
      { label: 'SAF-T Export', path: '/anaf/saft-export', icon: '📄', badge: 'nou' },
    ],
  },

  // ========================================
  // 12. AUDIT & SECURITATE
  // ========================================
  {
    label: 'Audit & Security',
    path: '#',
    icon: '🔒',
    children: [
      { label: 'Audit Log', path: '/audit/logs', icon: '📋', badge: 'nou' },
      { label: 'Security Events', path: '/audit/security', icon: '🛡️', badge: 'nou' },
      { label: 'Login History', path: '/audit/login-history', icon: '📜', badge: 'nou' },
      { label: 'User Activity', path: '/audit/user-activity', icon: '👤', badge: 'nou' },
      { label: 'Security Alerts', path: '/audit/alerts', icon: '🚨', badge: 'nou' },
      {
        label: 'Compliance & HACCP',
        path: '#',
        icon: '✅',
        badge: 'ISO 22000',
        children: [
          { label: 'Compliance Dashboard', path: '/compliance', icon: '📊' },
          { label: 'HACCP Dashboard', path: '/compliance/haccp', icon: '📈', badge: 'nou' },
          { label: 'HACCP Procese', path: '/compliance/haccp/processes', icon: '🔄', badge: 'nou' },
          { label: 'Monitorizare HACCP', path: '/compliance/haccp/monitoring', icon: '📝', badge: 'nou' },
          { label: 'Acțiuni Corective', path: '/compliance/haccp/corrective-actions', icon: '⚠️', badge: 'nou' },
        ],
      },
    ],
  },

  // ========================================
  // 13. ADMIN ADVANCED (Legacy Migration)
  // ========================================
  {
    label: 'Admin Advanced',
    path: '#',
    icon: '⚙️',
    badge: 'legacy',
    children: [
      { label: 'Advanced Dashboard', path: '/admin-advanced/dashboard', icon: '📊' },
      { label: 'Queue Monitor', path: '/admin-advanced/queue-monitor', icon: '📡' },
      { label: 'Gestiune Stock (NIR/Inventory)', path: '/admin-advanced/inventory', icon: '📦' },
      { label: 'Transferuri Gestiuni', path: '/admin-advanced/transfers', icon: '🔄' },
      { label: 'Inventar Multi-Gestiune', path: '/admin-advanced/multi-inventory', icon: '🏢' },
      { label: 'Portion Control', path: '/admin-advanced/portion-control', icon: '⚖️' },
      { label: 'Variance Reporting', path: '/admin-advanced/variance-reporting', icon: '📈' },
      { label: 'Dashboard Executiv', path: '/admin-advanced/executive-dashboard', icon: '📊' },
      { label: 'Complex Reports', path: '/admin-advanced/reports', icon: '📋' },
      { label: 'Marketing & Clienți', path: '/admin-advanced/marketing', icon: '📱' },
      { label: 'Documente Fiscale & Casă', path: '/admin-advanced/fiscal?type=all', icon: '💰' },
      { label: 'Stock & Risk Alerts', path: '/admin-advanced/risk-alerts', icon: '⚠️' },
      { label: 'Restaurant Configuration', path: '/admin-advanced/restaurant-config', icon: '🏢' },
      { label: 'Feedback Clienți', path: '/admin-advanced/feedback', icon: '⭐' },
    ],
  },
];

