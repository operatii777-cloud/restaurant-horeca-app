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
  { label: 'Monitoring & Performance', path: '/monitoring/performance', icon: '📈', badge: 'nou' },

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
      // PHASE S5.5 - Redirected to Tipizate Enterprise
      { label: 'NIR', path: '/tipizate-enterprise/nir', icon: '📄' },
      { label: 'Bon Consum', path: '/tipizate-enterprise/bon-consum', icon: '📝' },
      { label: 'Inventar', path: '/tipizate-enterprise/inventar', icon: '📊' },
      { label: 'Inventar Multi-Gestiune', path: '/stocks/inventory/multi', icon: '🏢', badge: 'nou' },
      { label: 'Inventory Dashboard', path: '/stocks/inventory/dashboard', icon: '📈', badge: 'nou' },
      { label: 'Import Facturi', path: '/stocks/inventory/import', icon: '📥', badge: 'nou' },
      { label: 'Transferuri Gestiuni', path: '/tipizate-enterprise/transfer', icon: '🔄' },
      { label: 'Furnizori', path: '/stocks/suppliers', icon: '🏢', badge: 'nou' },
      { label: 'Comenzi Furnizori', path: '/stocks/suppliers/orders', icon: '📦', badge: 'nou' },
      { label: 'Pierderi & Waste', path: '/stocks/waste', icon: '🗑️', badge: 'nou' },
      { label: 'Etichete Produse', path: '/stocks/labels', icon: '🏷️', badge: 'nou' },
      { label: 'Alergeni', path: '/stocks/allergens', icon: '⚠️', badge: 'nou' },
      { label: 'Stock & Risk Alerts', path: '/stocks/risk-alerts', icon: '⚠️', badge: 'nou' },
      { label: 'Expiry Alerts', path: '/expiry-alerts', icon: '⏰', badge: 'nou' },
      { label: 'Recalls', path: '/recalls', icon: '🚨', badge: 'nou' },
      { label: 'Costuri & Prețuri', path: '/stocks/costs', icon: '💵', badge: 'nou' },
      { label: 'Dashboard Avansat', path: '/stocks/dashboard/advanced', icon: '📈', badge: 'nou' },
      { label: 'Dashboard Executiv', path: '/stocks/dashboard/executive', icon: '📊', badge: 'nou' },
    ],
  },

  // ========================================
  // 4. TIPIZATE & DOCUMENTE (PHASE S4.3 - ENTERPRISE)
  // ========================================
  {
    label: 'Tipizate & Documente',
    path: '#',
    icon: '📋',
    children: [
      { label: 'NIR', path: '/tipizate-enterprise/nir', icon: '📄', badge: 'nou' },
      { label: 'Bon Consum', path: '/tipizate-enterprise/bon-consum', icon: '📝', badge: 'nou' },
      { label: 'Transfer Gestiuni', path: '/tipizate-enterprise/transfer', icon: '🔄', badge: 'nou' },
      { label: 'Inventar', path: '/tipizate-enterprise/inventar', icon: '📊', badge: 'nou' },
      { label: 'Facturi', path: '/tipizate-enterprise/factura', icon: '🧾', badge: 'nou' },
      { label: 'Chitanțe', path: '/tipizate-enterprise/chitanta', icon: '💰', badge: 'nou' },
      { label: 'Registru de Casă', path: '/tipizate-enterprise/registru-casa', icon: '💵', badge: 'nou' },
      { label: 'Raport Gestiune', path: '/tipizate-enterprise/raport-gestiune', icon: '📈', badge: 'nou' },
      { label: 'Raport X', path: '/tipizate-enterprise/raport-x', icon: '📋', badge: 'nou' },
      { label: 'Raport Z', path: '/tipizate-enterprise/raport-z', icon: '📊', badge: 'nou' },
      { label: 'Raport Lunar', path: '/tipizate-enterprise/raport-lunar', icon: '📅', badge: 'nou' },
      { label: 'Avize', path: '/tipizate-enterprise/aviz', icon: '📑', badge: 'nou' },
      { label: 'Procese Verbale', path: '/tipizate-enterprise/proces-verbal', icon: '📝', badge: 'nou' },
      { label: 'Restituiri', path: '/tipizate-enterprise/retur', icon: '↩️', badge: 'nou' },
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
      { label: 'Program Loialitate', path: '/marketing/loyalty', icon: '🎁', badge: 'nou' },
      { label: 'Vouchere & Bonuri', path: '/marketing/vouchers', icon: '🎫', badge: 'nou' },
      { label: 'Daily Menu & Oferte', path: '/daily-menu', icon: '🗒️', badge: 'nou' },
      { label: 'Happy Hour', path: '/promotions/happy-hour', icon: '🍺', badge: 'nou' },
      { label: 'Oferta Zilei', path: '/promotions/daily-offer', icon: '⭐', badge: 'nou' },
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
      { label: 'Import/Export', path: '/settings/import-export', icon: '📥📤' },
      { label: 'Backup', path: '/backup', icon: '💾' },
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
      { label: 'Raport X', path: '/stocks/fiscal/reports/x', icon: '📄', badge: 'nou' },
      { label: 'Raport Z', path: '/stocks/fiscal/reports/z', icon: '📋', badge: 'nou' },
      { label: 'Raport Lunar', path: '/stocks/fiscal/reports/monthly', icon: '📅', badge: 'nou' },
      { label: 'Arhivă Fiscală', path: '/stocks/fiscal/archive', icon: '📦', badge: 'nou' },
      { label: 'Integrare ANAF', path: '/stocks/fiscal/anaf-integration', icon: '🏛️', badge: 'nou' },
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
      { label: 'Compliance', path: '/compliance', icon: '✅', badge: 'nou' },
    ],
  },
];

