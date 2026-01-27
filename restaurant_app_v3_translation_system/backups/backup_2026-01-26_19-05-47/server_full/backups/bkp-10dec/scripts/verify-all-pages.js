// Script pentru verificare rapidă a tuturor paginilor
const fs = require('fs');
const path = require('path');

const ROUTES_TO_CHECK = [
  // Nomenclator
  '/catalog/attributes',
  '/catalog/online',
  '/catalog/prices',
  '/nomenclator/portion-control',
  '/nomenclator/variance',
  
  // Comenzi
  '/orders/cancellations',
  
  // Gestiune (CRITICE)
  '/stocks/nir',
  '/stocks/risk-alerts',
  '/stocks/consume',
  '/stocks/inventory',
  '/stocks/inventory/multi',
  '/stocks/inventory/dashboard',
  '/stocks/transfer',
  '/stocks/suppliers/orders',
  '/stocks/labels',
  '/stocks/dashboard/advanced',
  '/stocks/fiscal/archive',
  '/stocks/inventory/import',
  
  // Rapoarte
  '/reports/stock',
  '/reports/top-products',
  '/reports/financial',
  '/reports/profit-loss',
  '/reports/abc-analysis',
  '/reports/stock-prediction',
  '/reports/advanced',
  
  // Audit
  '/audit/security',
  '/audit/login-history',
  '/audit/user-activity',
  '/audit/alerts',
  
  // Enterprise
  '/competitors',
  
  // Promoții
  '/promotions/daily-offer',
  
  // Marketing
  '/marketing',
  '/marketing/feedback',
  
  // Setări
  '/settings/locations',
  '/settings/areas',
  '/settings/tables',
  '/waiters',
  '/settings/schedule',
  '/settings/localization',
  '/settings/ui-customization',
  '/settings/branding',
  '/settings/product-display',
  '/settings/missing-translations',
  '/settings/payment-methods',
  '/integrations',
  
  // Financiar
  '/stocks/fiscal/documents/create',
  '/stocks/fiscal/cash-register',
  '/stocks/costs',
  '/stocks/fiscal/reports/monthly',
  '/stocks/fiscal/reports/x',
  '/stocks/fiscal/reports/z',
  '/stocks/fiscal/sync',
  '/stocks/fiscal/anaf-integration',
  
  // Altele
  '/archive',
  '/docs',
];

const PATH_MAPPING = {
  '/catalog/attributes': 'nomenclator/attributes/pages/AttributeGroupsPage',
  '/catalog/online': 'catalog/online/pages/OnlineCategoriesPage',
  '/catalog/prices': 'nomenclator/prices/pages/PriceUtilitiesPage',
  '/nomenclator/portion-control': 'nomenclator/portion-control/pages/PortionControlPage',
  '/nomenclator/variance': 'nomenclator/variance/pages/VarianceReportingPage',
  '/orders/cancellations': 'orders/cancellations/pages/CancellationsPage',
  '/stocks/nir': 'stocks/nir/pages/NirListPage',
  '/stocks/risk-alerts': 'stocks/risk-alerts/pages/RiskAlertsPage',
  '/stocks/consume': 'stocks/consume/pages/ConsumeListPage',
  '/stocks/inventory': 'stocks/inventory/pages/InventoryListPage',
  '/stocks/inventory/multi': 'stocks/inventory/multi/pages/MultiInventoryPage',
  '/stocks/inventory/dashboard': 'stocks/inventory/pages/InventoryDashboardPage',
  '/stocks/transfer': 'stocks/transfer/pages/TransferListPage',
  '/stocks/suppliers/orders': 'stocks/suppliers/orders/pages/SupplierOrdersPage',
  '/stocks/labels': 'stocks/labels/pages/LabelsPage',
  '/stocks/dashboard/advanced': 'stocks/dashboard/advanced/pages/AdvancedStockDashboardPage',
  '/stocks/fiscal/archive': 'stocks/fiscal/pages/FiscalArchivePage',
  '/stocks/inventory/import': 'stocks/inventory/import/pages/InventoryImportPage',
  '/reports/stock': 'reports/stock/pages/StockReportsPage',
  '/reports/top-products': 'reports/top-products/pages/TopProductsPage',
  '/reports/financial': 'reports/financial/pages/FinancialReportsPage',
  '/reports/profit-loss': 'reports/pages/ProfitLossPage',
  '/reports/abc-analysis': 'reports/pages/ABCAnalysisPage',
  '/reports/stock-prediction': 'reports/stock-prediction/pages/StockPredictionPage',
  '/reports/advanced': 'reports/advanced/pages/AdvancedReportsPage',
  '/audit/security': 'audit/security/pages/SecurityEventsPage',
  '/audit/login-history': 'audit/login-history/pages/LoginHistoryPage',
  '/audit/user-activity': 'audit/user-activity/pages/UserActivityPage',
  '/audit/alerts': 'audit/alerts/pages/SecurityAlertsPage',
  '/competitors': 'enterprise/pages/CompetitorTrackingPage',
  '/promotions/daily-offer': 'promotions/daily-offer/pages/DailyOfferPage',
  '/marketing': 'marketing/pages/MarketingPage',
  '/marketing/feedback': 'marketing/feedback/pages/FeedbackPage',
  '/settings/locations': 'settings/pages/LocationsPage',
  '/settings/areas': 'settings/pages/AreasPage',
  '/settings/tables': 'settings/pages/TablesPage',
  '/waiters': 'waiters/pages/WaitersPage',
  '/settings/schedule': 'settings/pages/SchedulePage',
  '/settings/localization': 'settings/pages/LocalizationPage',
  '/settings/ui-customization': 'settings/pages/UICustomizationPage',
  '/settings/branding': 'settings/pages/BrandingPage',
  '/settings/product-display': 'settings/pages/ProductDisplayPage',
  '/settings/missing-translations': 'settings/pages/MissingTranslationsPage',
  '/settings/payment-methods': 'settings/pages/PaymentMethodsPage',
  '/integrations': 'settings/pages/IntegrationsPage',
  '/stocks/fiscal/documents/create': 'stocks/fiscal/pages/FiscalDocumentsCreatePage',
  '/stocks/fiscal/cash-register': 'stocks/fiscal/pages/CashRegisterPage',
  '/stocks/costs': 'stocks/costs/pages/CostsPage',
  '/stocks/fiscal/reports/monthly': 'stocks/fiscal/pages/MonthlyReportPage',
  '/stocks/fiscal/reports/x': 'stocks/fiscal/pages/FiscalReportXPage',
  '/stocks/fiscal/reports/z': 'stocks/fiscal/pages/FiscalReportZPage',
  '/stocks/fiscal/sync': 'stocks/fiscal/pages/AnafSyncPage',
  '/stocks/fiscal/anaf-integration': 'stocks/fiscal/pages/AnafIntegrationPage',
  '/archive': 'archive/pages/ArchivePage',
  '/docs': 'docs/pages/DocumentationPage',
};

console.log('🔍 VERIFICARE RAPIDĂ TOATE MODULELE\n');

let total = 0;
let found = 0;
let notFound = 0;
let functional = 0;

for (const [route, filePath] of Object.entries(PATH_MAPPING)) {
  total++;
  const tsxPath = path.join(__dirname, '../admin-vite/src/modules', filePath + '.tsx');
  const jsxPath = path.join(__dirname, '../admin-vite/src/modules', filePath + '.jsx');
  
  let exists = false;
  let lines = 0;
  
  if (fs.existsSync(tsxPath)) {
    exists = true;
    const content = fs.readFileSync(tsxPath, 'utf8');
    lines = content.split('\n').length;
  } else if (fs.existsSync(jsxPath)) {
    exists = true;
    const content = fs.readFileSync(jsxPath, 'utf8');
    lines = content.split('\n').length;
  }
  
  if (exists) {
    found++;
    if (lines > 50) functional++;
    console.log(`✅ ${route.padEnd(45)} → ${lines} linii ${lines > 50 ? '✅' : '⚠️'}`);
  } else {
    notFound++;
    console.log(`❌ ${route.padEnd(45)} → NU EXISTĂ`);
  }
}

console.log('\n' + '='.repeat(70));
console.log(`📊 STATISTICI FINALE:`);
console.log(`Total verificate: ${total}`);
console.log(`✅ Găsite: ${found} (${(found/total*100).toFixed(1)}%)`);
console.log(`✅ Funcționale (>50 linii): ${functional} (${(functional/total*100).toFixed(1)}%)`);
console.log(`❌ Lipsă: ${notFound} (${(notFound/total*100).toFixed(1)}%)`);

