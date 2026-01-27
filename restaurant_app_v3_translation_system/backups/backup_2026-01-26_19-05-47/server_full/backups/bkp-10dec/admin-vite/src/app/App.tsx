import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/modules/layout/AppLayout";
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { InternalMessagingPage } from "@/modules/internal-messaging/pages/InternalMessagingPage";
import { BackupPage } from "@/modules/backup/pages/BackupPage";
import { MenuManagementPage } from "@/modules/menu/pages/MenuManagementPage";
import { RecipesPage } from "@/modules/recipes/pages/RecipesPage";
import { ReservationsPage } from "@/modules/reservations/pages/ReservationsPage";
import { WaitersPage } from "@/modules/waiters/pages/WaitersPage";
import { StockManagementPage } from "@/modules/stocks/pages/StockManagementPage";
import { OrdersManagementPage } from "@/modules/orders/pages/OrdersManagementPage";
import { CatalogPage } from "@/modules/catalog/pages/CatalogPage";
import { CatalogOnlinePage } from "@/modules/catalog/pages/CatalogOnlinePage";
import { DailyMenuPage } from "@/modules/daily-menu/pages/DailyMenuPage";
import { LotsPage } from "@/modules/lots/pages/LotsPage";
import { TraceabilityPage } from "@/modules/traceability/pages/TraceabilityPage";
import { MenuPDFBuilderPage } from "@/modules/menu-pdf/pages/MenuPDFBuilderPage";
// LEGACY - PHASE S3: Stocks NIR (legacy component)
import NirListPageLegacy from "@/modules/stocks/nir/pages/NirListPage";
import NirCreatePage from "@/modules/stocks/nir/pages/NirCreatePage";
import NirDetailsPage from "@/modules/stocks/nir/pages/NirDetailsPage";
import ConsumeListPage from "@/modules/stocks/consume/pages/ConsumeListPage";
import ConsumeCreatePage from "@/modules/stocks/consume/pages/ConsumeCreatePage";
import ConsumeDetailsPage from "@/modules/stocks/consume/pages/ConsumeDetailsPage";
import InventoryListPage from "@/modules/stocks/inventory/pages/InventoryListPage";
import InventoryCreatePage from "@/modules/stocks/inventory/pages/InventoryCreatePage";
import InventoryDetailsPage from "@/modules/stocks/inventory/pages/InventoryDetailsPage";
import InventoryDashboardPage from "@/modules/stocks/inventory/pages/InventoryDashboardPage";
import { InventoryImportPage } from "@/modules/stocks/inventory/pages/InventoryImportPage";
import PosPage from "@/modules/pos/components/PosPage";
import ManageOrdersPage from "@/modules/orders/manage/ManageOrdersPage";
// LEGACY - PHASE S3: Stocks Transfer (legacy component)
import TransferListPageLegacy from "@/modules/stocks/transfer/pages/TransferListPage";
import TransferCreatePage from "@/modules/stocks/transfer/pages/TransferCreatePage";
import TransferDetailsPage from "@/modules/stocks/transfer/pages/TransferDetailsPage";
import VatRatesPage from "@/modules/settings/vat/VatRatesPage";
import { SettingsPage } from "@/modules/settings/pages/SettingsPage";
import InvoicesListPage from "@/modules/invoices/InvoicesListPage";
import InvoiceDetailsPage from "@/modules/invoices/InvoiceDetailsPage";
import QueueMonitorPage from "@/modules/queue-monitor/pages/QueueMonitorPage";
// PHASE S11 - e-Factura UBL (ANAF) + UI React
import { EFacturaDashboardPage } from "@/modules/efactura/pages/EFacturaDashboardPage";
import { EFacturaDetailsPage } from "@/modules/efactura/pages/EFacturaDetailsPage";
// PHASE S12 - POS React Unificat + Plăți Enterprise
import { PosPage } from "@/modules/pos/pages/PosPage";
// PHASE S5.5 - Legacy Tipizate imports removed, using redirects to tipizate-enterprise

// PHASE S4.3 - Tipizate Enterprise (NEW)
import NirListPage from "@/modules/tipizate-enterprise/pages/NirListPage";
import NirEditorPage from "@/modules/tipizate-enterprise/pages/NirEditorPage";
import BonConsumListPage from "@/modules/tipizate-enterprise/pages/BonConsumListPage";
import BonConsumEditorPage from "@/modules/tipizate-enterprise/pages/BonConsumEditorPage";
import TransferListPage from "@/modules/tipizate-enterprise/pages/TransferListPage";
import TransferEditorPage from "@/modules/tipizate-enterprise/pages/TransferEditorPage";
import InventarListPage from "@/modules/tipizate-enterprise/pages/InventarListPage";
import InventarEditorPage from "@/modules/tipizate-enterprise/pages/InventarEditorPage";
import FacturaListPage from "@/modules/tipizate-enterprise/pages/FacturaListPage";
import FacturaEditorPage from "@/modules/tipizate-enterprise/pages/FacturaEditorPage";
import ChitantaListPage from "@/modules/tipizate-enterprise/pages/ChitantaListPage";
import ChitantaEditorPage from "@/modules/tipizate-enterprise/pages/ChitantaEditorPage";
import RegistruCasaListPage from "@/modules/tipizate-enterprise/pages/RegistruCasaListPage";
import RegistruCasaEditorPage from "@/modules/tipizate-enterprise/pages/RegistruCasaEditorPage";
import RaportGestiuneListPage from "@/modules/tipizate-enterprise/pages/RaportGestiuneListPage";
import RaportGestiuneEditorPage from "@/modules/tipizate-enterprise/pages/RaportGestiuneEditorPage";
import RaportXListPage from "@/modules/tipizate-enterprise/pages/RaportXListPage";
import RaportXEditorPage from "@/modules/tipizate-enterprise/pages/RaportXEditorPage";
import RaportZListPage from "@/modules/tipizate-enterprise/pages/RaportZListPage";
import RaportZEditorPage from "@/modules/tipizate-enterprise/pages/RaportZEditorPage";
import RaportLunarListPage from "@/modules/tipizate-enterprise/pages/RaportLunarListPage";
import RaportLunarEditorPage from "@/modules/tipizate-enterprise/pages/RaportLunarEditorPage";
import AvizListPage from "@/modules/tipizate-enterprise/pages/AvizListPage";
import AvizEditorPage from "@/modules/tipizate-enterprise/pages/AvizEditorPage";
import ProcesVerbalListPage from "@/modules/tipizate-enterprise/pages/ProcesVerbalListPage";
import ProcesVerbalEditorPage from "@/modules/tipizate-enterprise/pages/ProcesVerbalEditorPage";
import ReturListPage from "@/modules/tipizate-enterprise/pages/ReturListPage";
import ReturEditorPage from "@/modules/tipizate-enterprise/pages/ReturEditorPage";
import ProductionBatchesListPage from "@/modules/production/pages/ProductionBatchesListPage";
import ProductionBatchEditorPage from "@/modules/production/pages/ProductionBatchEditorPage";
// S14 - Profitability Module (PRO Version)
import { ProfitLossPage } from "@/modules/profitability/pages/ProfitLossPage";
import { ABCAnalysisPage } from "@/modules/reports/pages/ABCAnalysisPage";
import { LocationsPage } from "@/modules/settings/pages/LocationsPage";
import { AreasPage } from "@/modules/settings/pages/AreasPage";
import { TablesPage } from "@/modules/settings/pages/TablesPage";
import { MonthlyReportPage } from "@/modules/stocks/fiscal/pages/MonthlyReportPage";
import { FiscalArchivePage } from "@/modules/stocks/fiscal/pages/FiscalArchivePage";
import { FiscalDocumentsCreatePage } from "@/modules/stocks/fiscal/pages/FiscalDocumentsCreatePage";
import { CashRegisterPage } from "@/modules/stocks/fiscal/pages/CashRegisterPage";
import { FiscalReportXPage } from "@/modules/stocks/fiscal/pages/FiscalReportXPage";
import { FiscalReportZPage } from "@/modules/stocks/fiscal/pages/FiscalReportZPage";
import { AnafSyncPage } from "@/modules/stocks/fiscal/pages/AnafSyncPage";
import { AnafIntegrationPage } from "@/modules/stocks/fiscal/pages/AnafIntegrationPage";
import { PortionControlPage } from "@/modules/nomenclator/portion-control/pages/PortionControlPage";
import { VarianceReportingPage } from "@/modules/nomenclator/variance/pages/VarianceReportingPage";
import { UnitsOfMeasurePage } from "@/modules/nomenclator/units/pages/UnitsOfMeasurePage";
import { PriceUtilitiesPage } from "@/modules/nomenclator/prices/pages/PriceUtilitiesPage";
import { AttributeGroupsPage } from "@/modules/nomenclator/attributes/pages/AttributeGroupsPage";
import { HappyHourPage } from "@/modules/promotions/happy-hour/pages/HappyHourPage";
import { MarketingPage } from "@/modules/marketing/pages/MarketingPage";
import { FeedbackPage } from "@/modules/marketing/feedback/pages/FeedbackPage";
import { ExecutiveDashboardPage } from "@/modules/stocks/dashboard/executive/pages/ExecutiveDashboardPage";
import { AdvancedStockDashboardPage } from "@/modules/stocks/dashboard/pages/AdvancedStockDashboardPage";
import { StockPredictionPage } from "@/modules/reports/stock-prediction/pages/StockPredictionPage";
import { AllergensPage } from "@/modules/stocks/allergens/pages/AllergensPage";
import { LabelsPage } from "@/modules/stocks/labels/pages/LabelsPage";
import { WastePage } from "@/modules/stocks/waste/pages/WastePage";
import { SuppliersPage } from "@/modules/stocks/suppliers/pages/SuppliersPage";
import { SupplierOrdersPage } from "@/modules/stocks/suppliers/orders/pages/SupplierOrdersPage";
import { MultiInventoryPage } from "@/modules/stocks/inventory/multi/pages/MultiInventoryPage";
import { CancellationsPage } from "@/modules/orders/cancellations/pages/CancellationsPage";
import { DeliveryOrdersPage } from "@/modules/orders/delivery/pages/DeliveryOrdersPage";
import { OrdersHistoryPage } from "@/modules/orders/history/pages/OrdersHistoryPage";
import { DriveThruOrdersPage } from "@/modules/orders/drivethru/pages/DriveThruOrdersPage";
import { TakeawayOrdersPage } from "@/modules/orders/takeaway/pages/TakeawayOrdersPage";
import { AdvancedReportsPage } from "@/modules/reports/advanced/pages/AdvancedReportsPage";
import RecipeScalingPage from "@/modules/recipes/pages/RecipeScalingPage";
import { SalesReportsPage } from "@/modules/reports/sales/pages/SalesReportsPage";
import { StockReportsPage } from "@/modules/reports/stock/pages/StockReportsPage";
import { DeliveryPerformanceReportPage } from "@/modules/reports/delivery/pages/DeliveryPerformanceReportPage";
import { DriveThruPerformanceReportPage } from "@/modules/reports/drivethru/pages/DriveThruPerformanceReportPage";
import { ArchivePage } from "@/modules/archive/pages/ArchivePage";
import { TopProductsPage } from "@/modules/reports/top-products/pages/TopProductsPage";
import { FinancialReportsPage } from "@/modules/reports/financial/pages/FinancialReportsPage";
import { StaffReportsPage } from "@/modules/reports/staff/pages/StaffReportsPage";
import { VouchersPage } from "@/modules/marketing/vouchers/pages/VouchersPage";
// S14 - Profitability Module (PRO Version)
import { CostsPage } from "@/modules/profitability/pages/CostsPage";
import { RiskAlertsPage } from "@/modules/stocks/risk-alerts/pages/RiskAlertsPage";
import { DailyOfferPage } from "@/modules/promotions/daily-offer/pages/DailyOfferPage";
import { LoyaltyPage } from "@/modules/marketing/loyalty/pages/LoyaltyPage";
import { MonitoringPage } from "@/modules/dashboard/monitoring/pages/MonitoringPage";
import { AuditLogsPage } from "@/modules/audit/logs/pages/AuditLogsPage";
import { SecurityEventsPage } from "@/modules/audit/security/pages/SecurityEventsPage";
import { LoginHistoryPage } from "@/modules/audit/login-history/pages/LoginHistoryPage";
import { UserActivityPage } from "@/modules/audit/user-activity/pages/UserActivityPage";
import { SecurityAlertsPage } from "@/modules/audit/alerts/pages/SecurityAlertsPage";
import { DocumentationPage } from "@/modules/docs/pages/DocumentationPage";
import { ProductDisplayPage } from "@/modules/settings/pages/ProductDisplayPage";
import { MissingTranslationsPage } from "@/modules/settings/pages/MissingTranslationsPage";
import { PaymentMethodsPage } from "@/modules/settings/pages/PaymentMethodsPage";
import { SchedulePage } from "@/modules/settings/pages/SchedulePage";
import { UsersPage } from "@/modules/settings/pages/UsersPage";
import { PrintersPage } from "@/modules/settings/pages/PrintersPage";
import { NotificationsPage } from "@/modules/settings/pages/NotificationsPage";
import { LocalizationPage } from "@/modules/settings/pages/LocalizationPage";
import { IntegrationsPage } from "@/modules/settings/pages/IntegrationsPage";
import { UICustomizationPage } from "@/modules/settings/pages/UICustomizationPage";
import { ImportExportPage } from "@/modules/settings/pages/ImportExportPage";
import { ImportPage } from "@/modules/settings/pages/ImportPage";
import { ExportPage } from "@/modules/settings/pages/ExportPage";
import { BrandingPage } from "@/modules/settings/pages/BrandingPage";
import { KioskLayout } from "@/modules/kiosk/layout/KioskLayout";
import { KioskMainLayout } from "@/modules/kiosk/layout/KioskMainLayout";
import { KioskLoginPage } from "@/modules/kiosk/pages/KioskLoginPage";
import { KioskDashboardPage } from "@/modules/kiosk/pages/KioskDashboardPage";
import { KioskTablesPage } from "@/modules/kiosk/pages/KioskTablesPage";
import { KioskTablesPage2D } from "@/modules/kiosk/pages/KioskTablesPage2D";
import { KioskOrderPage } from "@/modules/kiosk/pages/KioskOrderPage";
import { KioskFastSalePage } from "@/modules/kiosk/pages/KioskFastSalePage";
import { KioskStaffLiveReportPage } from "@/modules/kiosk/pages/KioskStaffLiveReportPage";
// Noi pagini KIOSK (Gemini Features)
import { KioskEventsPage } from "@/modules/kiosk/pages/KioskEventsPage";
import { KioskShiftHandoverPage } from "@/modules/kiosk/pages/KioskShiftHandoverPage";
import { KioskMenuBoardPage } from "@/modules/kiosk/pages/KioskMenuBoardPage";
import { CompliancePage } from "@/modules/compliance/pages/CompliancePage";
// Enterprise Pages (30 Nov 2025)
import { SmartRestockPage } from "@/modules/enterprise/pages/SmartRestockPage";
import { WeatherForecastPage } from "@/modules/enterprise/pages/WeatherForecastPage";
import { CompetitorTrackingPage } from "@/modules/enterprise/pages/CompetitorTrackingPage";
import { MenuEngineeringPage } from "@/modules/enterprise/pages/MenuEngineeringPage";
// S14 - Profitability Module (PRO Version)
import { FoodCostDashboardPage } from "@/modules/profitability/pages/FoodCostDashboardPage";
import { GiftCardsPage } from "@/modules/enterprise/pages/GiftCardsPage";
import { EmployeeSchedulingPage } from "@/modules/enterprise/pages/EmployeeSchedulingPage";
import { AutoPurchaseOrdersPage } from "@/modules/enterprise/pages/AutoPurchaseOrdersPage";
import { HostessMapPage } from "@/modules/enterprise/pages/HostessMapPage";
import { CoatroomPage } from "@/modules/enterprise/pages/CoatroomPage";
import { LostFoundPage } from "@/modules/enterprise/pages/LostFoundPage";
import { HostessReportPage } from "@/modules/reports/hostess/pages/HostessReportPage";
import { CoatroomReportPage } from "@/modules/reports/coatroom/pages/CoatroomReportPage";
import { LostFoundReportPage } from "@/modules/reports/lostfound/pages/LostFoundReportPage";
import { HostessDashboardPage } from "@/modules/dashboards/hostess/pages/HostessDashboardPage";
import { CoatroomDashboardPage } from "@/modules/dashboards/coatroom/pages/CoatroomDashboardPage";
import { LostFoundDashboardPage } from "@/modules/dashboards/lostfound/pages/LostFoundDashboardPage";

// Enterprise Rebuild (03 Dec 2025)
import { TechnicalSheetsPage } from "@/modules/technical-sheets/pages/TechnicalSheetsPage";
import { PortionsPage } from "@/modules/portions/pages/PortionsPage";
import { RecallsPage } from "@/modules/recalls/pages/RecallsPage";
import { ExpiryAlertsPage } from "@/modules/expiry/pages/ExpiryAlertsPage";
import { VarianceReportsPage } from "@/modules/variance/pages/VarianceReportsPage";
// Menu Builder (04 Dec 2025) - CRITICAL FEATURE
import { MenuBuilderPage } from "@/modules/menu-builder/pages/MenuBuilderPage";
// Admin Diagnostics (07 Dec 2025)
import { AdminDiagnosticsPage } from "@/modules/admin/pages/AdminDiagnosticsPage";
// KIOSK Cook Mode
import { KioskCookModePage } from "@/modules/kiosk/pages/KioskCookModePage";
// KIOSK New Pages (04 Dec 2025) - Sprint Operational
import { KioskPontajPage } from "@/modules/kiosk/pages/KioskPontajPage";
import { KioskScoreboardPage } from "@/modules/kiosk/pages/KioskScoreboardPage";
import { KioskExpeditorPage } from "@/modules/kiosk/pages/KioskExpeditorPage";
// KIOSK Admin Pages (04 Dec 2025)
import { KioskHQDashboardPage } from "@/modules/kiosk/pages/KioskHQDashboardPage";
import { KioskTrainingPage } from "@/modules/kiosk/pages/KioskTrainingPage";
import { KioskNetworkHealthPage } from "@/modules/kiosk/pages/KioskNetworkHealthPage";
// KIOSK Display Pages (04 Dec 2025)
import { KioskSelfServicePage } from "@/modules/kiosk/pages/KioskSelfServicePage";
import { KioskFeedbackTerminalPage } from "@/modules/kiosk/pages/KioskFeedbackTerminalPage";
import { KioskCustomerDisplayPage } from "@/modules/kiosk/pages/KioskCustomerDisplayPage";
// KIOSK Front Desk Pages (04 Dec 2025)
import { KioskCoatCheckPage } from "@/modules/kiosk/pages/KioskCoatCheckPage";
import { KioskLostFoundPage } from "@/modules/kiosk/pages/KioskLostFoundPage";
import { KioskHostessMapPage } from "@/modules/kiosk/pages/KioskHostessMapPage";
import { KioskClientMonitorPage } from "@/modules/kiosk/pages/KioskClientMonitorPage";
import { KioskLaundryPage } from "@/modules/kiosk/pages/KioskLaundryPage";
import { KioskWidgetPage } from "@/modules/kiosk/pages/KioskWidgetPage";
import { KioskPOSSplitPage } from "@/modules/kiosk/pages/KioskPOSSplitPage";
import { KioskPOSSplitWrapper } from "@/modules/kiosk/pages/KioskPOSSplitWrapper";
// Delivery/Couriers (01 Dec 2025)
import { CouriersPage } from "@/modules/delivery/pages/CouriersPage";
import { DispatchPage } from "@/modules/delivery/pages/DispatchPage";
import { CourierMobileApp } from "@/modules/delivery/pages/CourierMobileApp";
import { DriveThruPage } from "@/modules/delivery/pages/DriveThruPage";
import { DeliveryMonitorPage } from "@/modules/delivery/pages/DeliveryMonitorPage";
import { DeliveryDashboardPage } from "@/modules/delivery/pages/DeliveryDashboardPage";
// PHASE S10 - React UI Modules
import { KdsPage } from "@/modules/kds/pages/KdsPage";
import { BarPage } from "@/modules/bar/pages/BarPage";
import { DeliveryPage } from "@/modules/delivery/pages/DeliveryPage";
import { DriveThruPage } from "@/modules/drivethru/pages/DriveThruPage";
import { WaiterPage } from "@/modules/waiter/pages/WaiterPage";
import { OrderPage } from "@/modules/order/pages/OrderPage";
import { KioskTablesPreviewPage } from "@/modules/kiosk/preview/KioskTablesPreviewPage";

const App = () => {
  console.log('🔍 App render - current pathname:', window.location.pathname);
  
  return (
    <Routes>
      {/* KIOSK Routes fără Sidebar - trebuie să fie ÎNAINTE pentru a avea prioritate */}
      <Route path="/kiosk/login" element={<KioskLayout />}>
        <Route index element={<KioskLoginPage />} />
      </Route>
      <Route path="/kiosk/cook-mode/:productId" element={<KioskLayout />}>
        <Route index element={<KioskCookModePage />} />
      </Route>

      {/* Courier Mobile App - PRIMUL! Fără layout, fullscreen pentru mobil */}
      <Route path="/courier" element={<CourierMobileApp />} />
      <Route path="/courier/*" element={<CourierMobileApp />} />

      {/* POS Fullscreen - Fără sidebar, fullscreen cu providers */}
      <Route path="/pos-fullscreen" element={<KioskPOSSplitWrapper />} />

      {/* PHASE S10 - React UI Modules (Display-only, no sidebar) */}
      <Route path="/comanda" element={<OrderPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/kiosk-tables-preview" element={<KioskTablesPreviewPage />} />
      <Route path="/kds" element={<KdsPage />} />
      <Route path="/bar" element={<BarPage />} />
      <Route path="/delivery" element={<DeliveryPage />} />
      <Route path="/delivery/:waiterId" element={<DeliveryPage />} />
      <Route path="/drive-thru" element={<DriveThruPage />} />
      <Route path="/waiter" element={<WaiterPage />} />
      <Route path="/waiter/:waiterId" element={<WaiterPage />} />

      {/* KIOSK Routes cu Sidebar - KioskMainLayout */}
      <Route path="/kiosk" element={<KioskMainLayout />}>
        <Route index element={<Navigate to="/kiosk/dashboard" replace />} />
        <Route path="dashboard" element={<KioskDashboardPage />} />
        <Route path="tables" element={<KioskTablesPage2D />} />
        <Route path="pos-split" element={<KioskPOSSplitPage />} />
        <Route path="order/:tableId" element={<KioskOrderPage />} />
        <Route path="fast-sale" element={<KioskFastSalePage />} />
        {/* Staff Reports - ambele rute pentru compatibilitate */}
        <Route path="staff-live-report" element={<KioskStaffLiveReportPage />} />
        <Route path="reports/staff-live" element={<KioskStaffLiveReportPage />} />
        {/* Events & Shift */}
        <Route path="events" element={<KioskEventsPage />} />
        <Route path="shift-handover" element={<KioskShiftHandoverPage />} />
        <Route path="menu-board" element={<KioskMenuBoardPage />} />
        {/* NEW: Operational Pages (04 Dec 2025) */}
        <Route path="pontaj" element={<KioskPontajPage />} />
        <Route path="scoreboard" element={<KioskScoreboardPage />} />
        <Route path="expeditor" element={<KioskExpeditorPage />} />
        {/* NEW: Admin Pages (04 Dec 2025) */}
        <Route path="hq-dashboard" element={<KioskHQDashboardPage />} />
        <Route path="training" element={<KioskTrainingPage />} />
        <Route path="network-health" element={<KioskNetworkHealthPage />} />
        {/* NEW: Display Pages (04 Dec 2025) */}
        <Route path="self-service" element={<KioskSelfServicePage />} />
        <Route path="feedback-terminal" element={<KioskFeedbackTerminalPage />} />
        <Route path="customer-display" element={<KioskCustomerDisplayPage />} />
        {/* NEW: Front Desk Pages (04 Dec 2025) */}
        <Route path="coatcheck" element={<KioskCoatCheckPage />} />
        <Route path="lost-found" element={<KioskLostFoundPage />} />
        <Route path="hostess-map" element={<KioskHostessMapPage />} />
        <Route path="client-monitor" element={<KioskClientMonitorPage />} />
        <Route path="widget" element={<KioskWidgetPage />} />
        <Route path="laundry" element={<KioskLaundryPage />} />
      </Route>
      
      {/* AdminV4 Routes - folosesc AppLayout */}
      {/* NU folosim path="*" pentru a nu captura /kiosk/* */}
      <Route path="/*" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="dashboard/monitoring" element={<MonitoringPage />} />
        <Route path="monitoring/performance" element={<MonitoringPage />} />
        <Route path="internal-messaging" element={<InternalMessagingPage />} />
        <Route path="menu" element={<MenuManagementPage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="catalog/online" element={<CatalogOnlinePage />} />
        <Route path="ingredients" element={<StockManagementPage />} />
        <Route path="stocks" element={<StockManagementPage />} />
        {/* PHASE S5.5 - Legacy Stocks Routes → Redirect to Tipizate Enterprise */}
        <Route path="stocks/nir" element={<Navigate to="/tipizate-enterprise/nir" replace />} />
        <Route path="stocks/nir/new" element={<Navigate to="/tipizate-enterprise/nir/new" replace />} />
        <Route path="stocks/nir/:id" element={<RedirectWithParams to={(p) => `/tipizate-enterprise/nir/${p.id}`} />} />
        <Route path="stocks/consume" element={<Navigate to="/tipizate-enterprise/bon-consum" replace />} />
        <Route path="stocks/consume/new" element={<Navigate to="/tipizate-enterprise/bon-consum/new" replace />} />
        <Route path="stocks/consume/:id" element={<RedirectWithParams to={(p) => `/tipizate-enterprise/bon-consum/${p.id}`} />} />
        <Route path="stocks/inventory" element={<Navigate to="/tipizate-enterprise/inventar" replace />} />
        <Route path="stocks/inventory/new" element={<Navigate to="/tipizate-enterprise/inventar/new" replace />} />
        <Route path="stocks/inventory/:id" element={<Navigate to="/tipizate-enterprise/inventar/:id" replace />} />
        {/* Inventory Dashboard & Multi-Inventory remain (separate functionality) */}
        <Route path="stocks/inventory/dashboard" element={<InventoryDashboardPage />} />
        <Route path="stocks/inventory/multi" element={<MultiInventoryPage />} />
        <Route path="stocks/inventory/import" element={<InventoryImportPage />} />
        <Route path="stocks/allergens" element={<AllergensPage />} />
        <Route path="stocks/labels" element={<LabelsPage />} />
        <Route path="stocks/waste" element={<WastePage />} />
        <Route path="stocks/costs" element={<CostsPage />} />
        <Route path="stocks/risk-alerts" element={<RiskAlertsPage />} />
        <Route path="stocks/suppliers" element={<SuppliersPage />} />
        <Route path="stocks/suppliers/orders" element={<SupplierOrdersPage />} />
        <Route path="orders/manage" element={<ManageOrdersPage />} />
        {/* PHASE S5.5 - Legacy Transfer Routes → Redirect to Tipizate Enterprise */}
        <Route path="stocks/transfer" element={<Navigate to="/tipizate-enterprise/transfer" replace />} />
        <Route path="stocks/transfer/new" element={<Navigate to="/tipizate-enterprise/transfer/new" replace />} />
        <Route path="stocks/transfer/:id" element={<RedirectWithParams to={(p) => `/tipizate-enterprise/transfer/${p.id}`} />} />
        <Route path="orders" element={<OrdersManagementPage />} />
        <Route path="orders/history" element={<OrdersHistoryPage />} />
        <Route path="orders/delivery" element={<DeliveryOrdersPage />} />
        <Route path="orders/drive-thru" element={<DriveThruOrdersPage />} />
        <Route path="orders/takeaway" element={<TakeawayOrdersPage />} />
        <Route path="orders/cancellations" element={<CancellationsPage />} />
        <Route path="couriers" element={<CouriersPage />} />
        <Route path="dispatch" element={<DispatchPage />} />
        <Route path="drive-thru" element={<DriveThruPage />} />
        <Route path="delivery-monitor" element={<DeliveryMonitorPage />} />
        <Route path="delivery-dashboard" element={<DeliveryDashboardPage />} />
        <Route path="recipes" element={<RecipesPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="daily-menu" element={<DailyMenuPage />} />
        <Route path="lots" element={<LotsPage />} />
        <Route path="traceability" element={<TraceabilityPage />} />
        <Route path="backup" element={<BackupPage />} />
        <Route path="menu-pdf" element={<MenuPDFBuilderPage />} />
        <Route path="waiters" element={<WaitersPage />} />
        <Route path="queue-monitor" element={<QueueMonitorPage />} />
        <Route path="compliance" element={<CompliancePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="production/batches" element={<ProductionBatchesListPage />} />
        <Route path="production/batches/:id" element={<ProductionBatchEditorPage />} />
        <Route path="reports/profit-loss" element={<ProfitLossPage />} />
        <Route path="reports/abc-analysis" element={<ABCAnalysisPage />} />
        <Route path="reports/staff" element={<StaffReportsPage />} />
        <Route path="reports/advanced" element={<AdvancedReportsPage />} />
        <Route path="reports/sales" element={<SalesReportsPage />} />
        <Route path="reports/stock" element={<StockReportsPage />} />
        <Route path="reports/delivery-performance" element={<DeliveryPerformanceReportPage />} />
        <Route path="reports/drive-thru-performance" element={<DriveThruPerformanceReportPage />} />
        <Route path="archive" element={<ArchivePage />} />
        <Route path="reports/top-products" element={<TopProductsPage />} />
        <Route path="reports/financial" element={<FinancialReportsPage />} />
        <Route path="settings/locations" element={<LocationsPage />} />
        <Route path="settings/areas" element={<AreasPage />} />
        <Route path="settings/tables" element={<TablesPage />} />
        <Route path="settings/product-display" element={<ProductDisplayPage />} />
        <Route path="settings/missing-translations" element={<MissingTranslationsPage />} />
        <Route path="settings/payment-methods" element={<PaymentMethodsPage />} />
        <Route path="settings/schedule" element={<SchedulePage />} />
        <Route path="settings/users" element={<UsersPage />} />
        <Route path="settings/printers" element={<PrintersPage />} />
        <Route path="settings/notifications" element={<NotificationsPage />} />
        <Route path="settings/localization" element={<LocalizationPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="settings/ui-customization" element={<UICustomizationPage />} />
        <Route path="settings/import-export" element={<ImportExportPage />} />
        <Route path="settings/branding" element={<BrandingPage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="export" element={<ExportPage />} />
        <Route path="stocks/fiscal/reports/monthly" element={<MonthlyReportPage />} />
        <Route path="stocks/fiscal/archive" element={<FiscalArchivePage />} />
        <Route path="stocks/fiscal/documents/create" element={<FiscalDocumentsCreatePage />} />
        <Route path="stocks/fiscal/cash-register" element={<CashRegisterPage />} />
        <Route path="stocks/fiscal/reports/x" element={<FiscalReportXPage />} />
        <Route path="stocks/fiscal/reports/z" element={<FiscalReportZPage />} />
        <Route path="stocks/fiscal/sync" element={<AnafSyncPage />} />
        <Route path="stocks/fiscal/anaf-integration" element={<AnafIntegrationPage />} />
        <Route path="nomenclator/portion-control" element={<PortionControlPage />} />
        <Route path="nomenclator/variance" element={<VarianceReportingPage />} />
        <Route path="nomenclator/units" element={<UnitsOfMeasurePage />} />
        <Route path="catalog/prices" element={<PriceUtilitiesPage />} />
        <Route path="catalog/attributes" element={<AttributeGroupsPage />} />
        <Route path="promotions/happy-hour" element={<HappyHourPage />} />
        <Route path="promotions/daily-offer" element={<DailyOfferPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="marketing/feedback" element={<FeedbackPage />} />
        <Route path="marketing/vouchers" element={<VouchersPage />} />
        <Route path="marketing/loyalty" element={<LoyaltyPage />} />
        <Route path="stocks/dashboard/executive" element={<ExecutiveDashboardPage />} />
        <Route path="stocks/dashboard/advanced" element={<AdvancedStockDashboardPage />} />
        <Route path="reports/stock-prediction" element={<StockPredictionPage />} />
        <Route path="audit/logs" element={<AuditLogsPage />} />
        <Route path="audit/security" element={<SecurityEventsPage />} />
        <Route path="audit/login-history" element={<LoginHistoryPage />} />
        <Route path="audit/user-activity" element={<UserActivityPage />} />
        <Route path="audit/alerts" element={<SecurityAlertsPage />} />
        <Route path="docs" element={<DocumentationPage />} />
        {/* Enterprise Routes (30 Nov 2025 - Updated 03 Dec 2025) */}
        <Route path="menu-engineering" element={<MenuEngineeringPage />} />
        <Route path="food-cost" element={<FoodCostDashboardPage />} />
        <Route path="gift-cards" element={<GiftCardsPage />} />
        <Route path="smart-restock" element={<SmartRestockPage />} />
        <Route path="weather-forecast" element={<WeatherForecastPage />} />
        <Route path="competitors" element={<CompetitorTrackingPage />} />
        <Route path="scheduling" element={<EmployeeSchedulingPage />} />
        <Route path="purchase-orders" element={<AutoPurchaseOrdersPage />} />
        <Route path="hostess-map" element={<HostessMapPage />} />
        <Route path="coatroom" element={<CoatroomPage />} />
        <Route path="lost-found" element={<LostFoundPage />} />
        <Route path="reports/hostess-occupancy" element={<HostessReportPage />} />
        <Route path="reports/coatroom-daily" element={<CoatroomReportPage />} />
        <Route path="reports/lostfound-items" element={<LostFoundReportPage />} />
        <Route path="dashboards/hostess" element={<HostessDashboardPage />} />
        <Route path="dashboards/coatroom" element={<CoatroomDashboardPage />} />
        <Route path="dashboards/lostfound" element={<LostFoundDashboardPage />} />
        
        {/* Enterprise Rebuild Routes (03 Dec 2025) */}
        <Route path="technical-sheets" element={<TechnicalSheetsPage />} />
        <Route path="recipes/scaling" element={<RecipeScalingPage />} />
        {/* Menu Builder (04 Dec 2025) - CRITICAL FEATURE */}
        <Route path="menu/builder" element={<MenuBuilderPage />} />
        <Route path="portions" element={<PortionsPage />} />
        <Route path="recalls" element={<RecallsPage />} />
        <Route path="expiry-alerts" element={<ExpiryAlertsPage />} />
        <Route path="variance-reports" element={<VarianceReportsPage />} />
        {/* Admin Diagnostics - Internal only */}
        <Route path="admin/diagnostics" element={<AdminDiagnosticsPage />} />
        
        {/* ------------------------------------------------------------------ */}
        {/* PHASE S4.2 - TIPIZATE ENTERPRISE (NEW)                            */}
        {/* UI de lucru unificat pentru toate tipizatele                       */}
        {/* ------------------------------------------------------------------ */}
        
        {/* PHASE S5.6 - Print Preview */}
        <Route path="print" element={<PrintPreviewPage />} />
        
        {/* NIR Enterprise */}
        <Route path="tipizate-enterprise/nir" element={<NirListPage />} />
        <Route path="tipizate-enterprise/nir/new" element={<NirEditorPage />} />
        <Route path="tipizate-enterprise/nir/:id" element={<NirEditorPage />} />
        
        {/* Bon Consum Enterprise */}
        <Route path="tipizate-enterprise/bon-consum" element={<BonConsumListPage />} />
        <Route path="tipizate-enterprise/bon-consum/new" element={<BonConsumEditorPage />} />
        <Route path="tipizate-enterprise/bon-consum/:id" element={<BonConsumEditorPage />} />
        
        {/* Transfer Enterprise */}
        <Route path="tipizate-enterprise/transfer" element={<TransferListPage />} />
        <Route path="tipizate-enterprise/transfer/new" element={<TransferEditorPage />} />
        <Route path="tipizate-enterprise/transfer/:id" element={<TransferEditorPage />} />
        
        {/* Inventar Enterprise */}
        <Route path="tipizate-enterprise/inventar" element={<InventarListPage />} />
        <Route path="tipizate-enterprise/inventar/new" element={<InventarEditorPage />} />
        <Route path="tipizate-enterprise/inventar/:id" element={<InventarEditorPage />} />
        
        {/* Factură Enterprise */}
        <Route path="tipizate-enterprise/factura" element={<FacturaListPage />} />
        <Route path="tipizate-enterprise/factura/new" element={<FacturaEditorPage />} />
        <Route path="tipizate-enterprise/factura/:id" element={<FacturaEditorPage />} />
        
        {/* Chitanță Enterprise */}
        <Route path="tipizate-enterprise/chitanta" element={<ChitantaListPage />} />
        <Route path="tipizate-enterprise/chitanta/new" element={<ChitantaEditorPage />} />
        <Route path="tipizate-enterprise/chitanta/:id" element={<ChitantaEditorPage />} />
        
        {/* Registru Casă Enterprise */}
        <Route path="tipizate-enterprise/registru-casa" element={<RegistruCasaListPage />} />
        <Route path="tipizate-enterprise/registru-casa/new" element={<RegistruCasaEditorPage />} />
        <Route path="tipizate-enterprise/registru-casa/:id" element={<RegistruCasaEditorPage />} />
        
        {/* Raport Gestiune Enterprise */}
        <Route path="tipizate-enterprise/raport-gestiune" element={<RaportGestiuneListPage />} />
        <Route path="tipizate-enterprise/raport-gestiune/new" element={<RaportGestiuneEditorPage />} />
        <Route path="tipizate-enterprise/raport-gestiune/:id" element={<RaportGestiuneEditorPage />} />
        
        {/* Raport X Enterprise */}
        <Route path="tipizate-enterprise/raport-x" element={<RaportXListPage />} />
        <Route path="tipizate-enterprise/raport-x/new" element={<RaportXEditorPage />} />
        <Route path="tipizate-enterprise/raport-x/:id" element={<RaportXEditorPage />} />
        
        {/* Raport Z Enterprise */}
        <Route path="tipizate-enterprise/raport-z" element={<RaportZListPage />} />
        <Route path="tipizate-enterprise/raport-z/new" element={<RaportZEditorPage />} />
        <Route path="tipizate-enterprise/raport-z/:id" element={<RaportZEditorPage />} />
        
        {/* Raport Lunar Enterprise */}
        <Route path="tipizate-enterprise/raport-lunar" element={<RaportLunarListPage />} />
        <Route path="tipizate-enterprise/raport-lunar/new" element={<RaportLunarEditorPage />} />
        <Route path="tipizate-enterprise/raport-lunar/:id" element={<RaportLunarEditorPage />} />
        
        {/* Aviz Enterprise */}
        <Route path="tipizate-enterprise/aviz" element={<AvizListPage />} />
        <Route path="tipizate-enterprise/aviz/new" element={<AvizEditorPage />} />
        <Route path="tipizate-enterprise/aviz/:id" element={<AvizEditorPage />} />
        
        {/* Proces Verbal Enterprise */}
        <Route path="tipizate-enterprise/proces-verbal" element={<ProcesVerbalListPage />} />
        <Route path="tipizate-enterprise/proces-verbal/new" element={<ProcesVerbalEditorPage />} />
        <Route path="tipizate-enterprise/proces-verbal/:id" element={<ProcesVerbalEditorPage />} />
        
        {/* Retur Enterprise */}
        <Route path="tipizate-enterprise/retur" element={<ReturListPage />} />
        <Route path="tipizate-enterprise/retur/new" element={<ReturEditorPage />} />
        <Route path="tipizate-enterprise/retur/:id" element={<ReturEditorPage />} />
        
        {/* ------------------------------------------------------------------ */}
        {/* LEGACY ROUTES (PHASE S3)                                          */}
        {/* Păstrate DOAR ca fallback / referință.                             */}
        {/* Vor fi înlocuite în S4/S5 cu UI enterprise pentru tipizate & POS.  */}
        {/* ------------------------------------------------------------------ */}
        
        {/* LEGACY_ROUTE - PHASE S3: Invoices (legacy component) */}
        <Route path="invoices" element={<InvoicesListPage />} />
        {/* PHASE S11 - e-Factura UBL (ANAF) + UI React */}
        <Route path="efactura" element={<EFacturaDashboardPage />} />
        <Route path="efactura/:id" element={<EFacturaDetailsPage />} />
        {/* PHASE S12 - POS React Unificat + Plăți Enterprise */}
        <Route path="pos" element={<PosPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailsPage />} />
        
        {/* LEGACY_ROUTE - PHASE S3: POS (legacy component) */}
        <Route path="pos/:orderId" element={<PosPage />} />
        
        {/* LEGACY_ROUTE - PHASE S3: Tipizate (legacy components - will be replaced in S4) */}
        <Route path="tipizate" element={<TipizateHomePage />} />
        <Route path="tipizate/nir" element={<NirTipizatePage />} />
        <Route path="tipizate/bon-consum" element={<BonConsumTipizatePage />} />
        <Route path="tipizate/avize" element={<AvizeTipizatePage />} />
        <Route path="tipizate/chitante" element={<ChitanteTipizatePage />} />
        <Route path="tipizate/registru-casa" element={<RegistruCasaPage />} />
        <Route path="tipizate/fisa-magazie" element={<FisaMagaziePage />} />
        <Route path="tipizate/raport-gestiune" element={<RaportGestiunePage />} />
        <Route path="tipizate/transfer" element={<TransferTipizatePage />} />
        <Route path="tipizate/inventar" element={<InventarTipizatePage />} />
      </Route>
      
      {/* Redirect pentru rute necunoscute - dar NU pentru /kiosk/* (deja procesat mai sus) */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
