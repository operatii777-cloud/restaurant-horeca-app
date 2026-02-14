"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var KioskTransferIframePage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/KioskTransferIframePage'); }); });
var react_router_dom_1 = require("react-router-dom");
var react_1 = require("react");
var AppLayout_1 = require("@/modules/layout/AppLayout");
var RedirectWithParams_1 = require("@/components/RedirectWithParams");
var LegacyRedirect_1 = require("@/components/LegacyRedirect");
var ErrorBoundary_1 = require("@/components/ErrorBoundary");
// Critical pages - loaded immediately (dashboard, login, etc.)
var WelcomePage_1 = require("@/modules/welcome/pages/WelcomePage");
var DashboardPage_1 = require("@/modules/dashboard/pages/DashboardPage");
var InternalMessagingPage_1 = require("@/modules/internal-messaging/pages/InternalMessagingPage");
var BackupPage_1 = require("@/modules/backup/pages/BackupPage");
var MenuManagementPage_1 = require("@/modules/menu/pages/MenuManagementPage");
var RecipesPage_1 = require("@/modules/recipes/pages/RecipesPage");
// Reservations redirects to admin.html - using legacy component
// import { ReservationsPage } from "@/modules/reservations/pages/ReservationsPage";
var ReservationsPage_1 = require("@/modules/reservations/pages/ReservationsPage");
var WaitersPage_1 = require("@/modules/waiters/pages/WaitersPage");
var StockManagementPage_1 = require("@/modules/stocks/pages/StockManagementPage");
var OrdersManagementPage_1 = require("@/modules/orders/pages/OrdersManagementPage");
var CatalogPage_1 = require("@/modules/catalog/pages/CatalogPage");
var CatalogOnlinePage_1 = require("@/modules/catalog/pages/CatalogOnlinePage");
var DailyMenuPage_1 = require("@/modules/daily-menu/pages/DailyMenuPage");
var LotsPage_1 = require("@/modules/lots/pages/LotsPage");
var TraceabilityPage_1 = require("@/modules/traceability/pages/TraceabilityPage");
var MenuPDFBuilderPage_1 = require("@/modules/menu-pdf/pages/MenuPDFBuilderPage");
var InventoryDetailsPage_1 = require("@/modules/stocks/inventory/pages/InventoryDetailsPage");
var InventoryDashboardPage_1 = require("@/modules/stocks/inventory/pages/InventoryDashboardPage");
var InventoryImportPage_1 = require("@/modules/stocks/inventory/pages/InventoryImportPage");
var ManageOrdersPage_1 = require("@/modules/orders/manage/ManageOrdersPage");
// LEGACY - PHASE S3: Stocks Transfer (legacy component) - REMOVED, using tipizate-enterprise instead
// import TransferListPageLegacy from "@/modules/stocks/transfer/pages/TransferListPage";
// import TransferCreatePage from "@/modules/stocks/transfer/pages/TransferCreatePage";
// import TransferDetailsPage from "@/modules/stocks/transfer/pages/TransferDetailsPage";
var VatRatesPage_1 = require("@/modules/settings/vat/VatRatesPage");
var SettingsPage_1 = require("@/modules/settings/pages/SettingsPage");
var InvoicesListPage_1 = require("@/modules/invoices/InvoicesListPage");
var InvoiceDetailsPage_1 = require("@/modules/invoices/InvoiceDetailsPage");
var QueueMonitorPage_1 = require("@/modules/queue-monitor/pages/QueueMonitorPage");
// PHASE S12 - POS React Unificat + Plăți Enterprise
var PosPage_1 = require("@/modules/pos/pages/PosPage");
// PHASE S5.5 - Legacy Tipizate imports removed, using redirects to tipizate-enterprise
// PHASE S4.3 - Tipizate Enterprise (NEW) - LAZY LOADED (see lazy imports below)
var ProductionBatchesListPage_1 = require("@/modules/production/pages/ProductionBatchesListPage");
var ProductionBatchEditorPage_1 = require("@/modules/production/pages/ProductionBatchEditorPage");
var LocationsPage_1 = require("@/modules/settings/pages/LocationsPage");
var AreasPage_1 = require("@/modules/settings/pages/AreasPage");
var TablesPage_1 = require("@/modules/settings/pages/TablesPage");
// FAZA 1.5 - SAF-T Export
var SaftExportPage_1 = require("@/modules/saft/pages/SaftExportPage");
// SAGA Export
var SagaExportPage_1 = require("@/modules/saga-export/pages/SagaExportPage");
// Portion Control și Variance Reporting - disponibile doar în Admin Advanced
var UnitsOfMeasurePage_1 = require("@/modules/nomenclator/units/pages/UnitsOfMeasurePage");
var PriceUtilitiesPage_1 = require("@/modules/nomenclator/prices/pages/PriceUtilitiesPage");
var AttributeGroupsPage_1 = require("@/modules/nomenclator/attributes/pages/AttributeGroupsPage");
// Happy Hour redirects to admin-advanced.html - no longer using React component
// import { HappyHourPage } from "@/modules/promotions/happy-hour/pages/HappyHourPage";
var MarketingPage_1 = require("@/modules/marketing/pages/MarketingPage");
var FeedbackPage_1 = require("@/modules/marketing/feedback/pages/FeedbackPage");
var ExecutiveDashboardPage_1 = require("@/modules/stocks/dashboard/executive/pages/ExecutiveDashboardPage");
var AdvancedStockDashboardPage_1 = require("@/modules/stocks/dashboard/pages/AdvancedStockDashboardPage");
var AdvancedReportsPage_1 = require("@/modules/reports/advanced/pages/AdvancedReportsPage");
var AuditLogsPage_1 = require("@/modules/audit/logs/pages/AuditLogsPage");
// StockPredictionPage - LAZY LOADED (see lazy imports below)
var AllergensPage_1 = require("@/modules/stocks/allergens/pages/AllergensPage");
var LabelsPage_1 = require("@/modules/stocks/labels/pages/LabelsPage");
var SuppliersPage_1 = require("@/modules/stocks/suppliers/pages/SuppliersPage");
var SupplierOrdersPage_1 = require("@/modules/stocks/suppliers/orders/pages/SupplierOrdersPage");
var MultiInventoryPage_1 = require("@/modules/stocks/inventory/multi/pages/MultiInventoryPage");
var CancellationsPage_1 = require("@/modules/orders/cancellations/pages/CancellationsPage");
var DeliveryOrdersPage_1 = require("@/modules/orders/delivery/pages/DeliveryOrdersPage");
// S17.H - Delivery KPI Dashboard
var DeliveryKpiDashboardPage_1 = require("@/modules/delivery/dashboard/pages/DeliveryKpiDashboardPage");
var OrdersHistoryPage_1 = require("@/modules/orders/history/pages/OrdersHistoryPage");
var DriveThruOrdersPage_1 = require("@/modules/orders/drivethru/pages/DriveThruOrdersPage");
var TakeawayOrdersPage_1 = require("@/modules/orders/takeaway/pages/TakeawayOrdersPage");
// Reports, Profitability, Audit - LAZY LOADED (see lazy imports below)
var RecipeScalingPage_1 = require("@/modules/recipes/pages/RecipeScalingPage");
var ArchivePage_1 = require("@/modules/archive/pages/ArchivePage");
var VouchersPage_1 = require("@/modules/marketing/vouchers/pages/VouchersPage");
var RiskAlertsPage_1 = require("@/modules/stocks/risk-alerts/pages/RiskAlertsPage");
var DailyOfferPage_1 = require("@/modules/promotions/daily-offer/pages/DailyOfferPage");
var LoyaltyPage_1 = require("@/modules/marketing/loyalty/pages/LoyaltyPage");
var MonitoringPage_1 = require("@/modules/dashboard/monitoring/pages/MonitoringPage");
var DocumentationPage_1 = require("@/modules/docs/pages/DocumentationPage");
// Executive Dashboard, Monitoring, Platform Sync (NEW)
var ExecutiveDashboardPage_2 = require("@/modules/executive-dashboard/pages/ExecutiveDashboardPage");
var MonitoringDashboardPage_1 = require("@/modules/monitoring/pages/MonitoringDashboardPage");
var PlatformSyncPage_1 = require("@/modules/external-delivery/pages/PlatformSyncPage");
var ProductDisplayPage_1 = require("@/modules/settings/pages/ProductDisplayPage");
var MissingTranslationsPage_1 = require("@/modules/settings/pages/MissingTranslationsPage");
var PaymentMethodsPage_1 = require("@/modules/settings/pages/PaymentMethodsPage");
var SchedulePage_1 = require("@/modules/settings/pages/SchedulePage");
var UsersPage_1 = require("@/modules/settings/pages/UsersPage");
var PrintersPage_1 = require("@/modules/settings/pages/PrintersPage");
var NotificationsPage_1 = require("@/modules/settings/pages/NotificationsPage");
var LocalizationPage_1 = require("@/modules/settings/pages/LocalizationPage");
var IntegrationsPage_1 = require("@/modules/settings/pages/IntegrationsPage");
var UICustomizationPage_1 = require("@/modules/settings/pages/UICustomizationPage");
var ImportExportPage_1 = require("@/modules/settings/pages/ImportExportPage");
var ImportPage_1 = require("@/modules/settings/pages/ImportPage");
var ExportPage_1 = require("@/modules/settings/pages/ExportPage");
var BrandingPage_1 = require("@/modules/settings/pages/BrandingPage");
var ManualInstructiuniPage_1 = require("@/modules/settings/pages/ManualInstructiuniPage");
// Kiosk - Lazy loaded (mare modul)
var KioskLayout = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/layout/KioskLayout'); }).then(function (m) { return ({ default: m.KioskLayout }); }); });
var KioskMainLayout = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/layout/KioskMainLayout'); }).then(function (m) { return ({ default: m.KioskMainLayout }); }); });
var KioskLoginPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskLoginPage'); }).then(function (m) { return ({ default: m.KioskLoginPage }); }); });
var KioskDashboardPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskDashboardPage'); }).then(function (m) { return ({ default: m.KioskDashboardPage }); }); });
var KioskTablesPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskTablesPage'); }).then(function (m) { return ({ default: m.KioskTablesPage }); }); });
var KioskTablesPage2D = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskTablesPage2D'); }).then(function (m) { return ({ default: m.KioskTablesPage2D }); }); });
var KioskOrderPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskOrderPage'); }).then(function (m) { return ({ default: m.KioskOrderPage }); }); });
var KioskFastSalePage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskFastSalePage'); }).then(function (m) { return ({ default: m.KioskFastSalePage }); }); });
var KioskStaffLiveReportPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskStaffLiveReportPage'); }).then(function (m) { return ({ default: m.KioskStaffLiveReportPage }); }); });
// Noi pagini KIOSK (Gemini Features) - Lazy loaded
var KioskEventsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskEventsPage'); }).then(function (m) { return ({ default: m.KioskEventsPage }); }); });
var KioskShiftHandoverPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskShiftHandoverPage'); }).then(function (m) { return ({ default: m.KioskShiftHandoverPage }); }); });
var KioskMenuBoardPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskMenuBoardPage'); }).then(function (m) { return ({ default: m.KioskMenuBoardPage }); }); });
var CompliancePage_1 = require("@/modules/compliance/pages/CompliancePage");
var HACCPDashboardPage_1 = require("@/modules/compliance/pages/HACCPDashboardPage");
var HACCPProcessesPage_1 = require("@/modules/compliance/pages/HACCPProcessesPage");
var HACCPMonitoringPage_1 = require("@/modules/compliance/pages/HACCPMonitoringPage");
var HACCPCorrectiveActionsPage_1 = require("@/modules/compliance/pages/HACCPCorrectiveActionsPage");
// Enterprise Pages (30 Nov 2025) - Lazy loaded
var SmartRestockPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/enterprise/pages/SmartRestockPage'); }).then(function (m) { return ({ default: m.SmartRestockPage }); }); });
var WeatherForecastPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/enterprise/pages/WeatherForecastPage'); }).then(function (m) { return ({ default: m.WeatherForecastPage }); }); });
var CompetitorTrackingPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/enterprise/pages/CompetitorTrackingPage'); }).then(function (m) { return ({ default: m.CompetitorTrackingPage }); }); });
var MenuEngineeringPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/enterprise/pages/MenuEngineeringPage'); }).then(function (m) { return ({ default: m.MenuEngineeringPage }); }); });
// S14 - Profitability Module (PRO Version) - Lazy loaded
var FoodCostDashboardPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/profitability/pages/FoodCostDashboardPage'); }).then(function (m) { return ({ default: m.FoodCostDashboardPage }); }); });
var GiftCardsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/enterprise/pages/GiftCardsPage'); }).then(function (m) { return ({ default: m.GiftCardsPage }); }); });
var EmployeeSchedulingPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/enterprise/pages/EmployeeSchedulingPage'); }).then(function (m) { return ({ default: m.EmployeeSchedulingPage }); }); });
var AutoPurchaseOrdersPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/enterprise/pages/AutoPurchaseOrdersPage'); }).then(function (m) { return ({ default: m.AutoPurchaseOrdersPage }); }); });
var HostessMapPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/enterprise/pages/HostessMapPage'); }).then(function (m) { return ({ default: m.HostessMapPage }); }); });
var CoatroomPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/enterprise/pages/CoatroomPage'); }).then(function (m) { return ({ default: m.CoatroomPage }); }); });
var LostFoundPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/enterprise/pages/LostFoundPage'); }).then(function (m) { return ({ default: m.LostFoundPage }); }); });
var HostessReportPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/reports/hostess/pages/HostessReportPage'); }).then(function (m) { return ({ default: m.HostessReportPage }); }); });
var CoatroomReportPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/reports/coatroom/pages/CoatroomReportPage'); }).then(function (m) { return ({ default: m.CoatroomReportPage }); }); });
var LostFoundReportPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/reports/lostfound/pages/LostFoundReportPage'); }).then(function (m) { return ({ default: m.LostFoundReportPage }); }); });
var HostessDashboardPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/dashboards/hostess/pages/HostessDashboardPage'); }).then(function (m) { return ({ default: m.HostessDashboardPage }); }); });
var CoatroomDashboardPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/dashboards/coatroom/pages/CoatroomDashboardPage'); }).then(function (m) { return ({ default: m.CoatroomDashboardPage }); }); });
var LostFoundDashboardPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/dashboards/lostfound/pages/LostFoundDashboardPage'); }).then(function (m) { return ({ default: m.LostFoundDashboardPage }); }); });
var PlatformStatsDashboardPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/platform-stats/pages/PlatformStatsDashboardPage'); }).then(function (m) { return ({ default: m.PlatformStatsDashboardPage }); }); });
// Call Center (Simulated) - Lazy loaded
var CallCenterSimulatorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/call-center/pages/CallCenterSimulatorPage'); }); });
// Enterprise Rebuild (03 Dec 2025) - Lazy loaded
var TechnicalSheetsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/technical-sheets/pages/TechnicalSheetsPage'); }).then(function (m) { return ({ default: m.TechnicalSheetsPage }); }); });
var PortionsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/portions/pages/PortionsPage'); }).then(function (m) { return ({ default: m.PortionsPage }); }); });
var RecallsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/recalls/pages/RecallsPage'); }).then(function (m) { return ({ default: m.RecallsPage }); }); });
var ExpiryAlertsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/expiry/pages/ExpiryAlertsPage'); }).then(function (m) { return ({ default: m.ExpiryAlertsPage }); }); });
var VarianceReportsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/variance/pages/VarianceReportsPage'); }).then(function (m) { return ({ default: m.VarianceReportsPage }); }); });
// Menu Builder (04 Dec 2025) - CRITICAL FEATURE - Lazy loaded
var MenuBuilderPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/menu-builder/pages/MenuBuilderPage'); }).then(function (m) { return ({ default: m.MenuBuilderPage }); }); });
// Admin Diagnostics (07 Dec 2025) - Lazy loaded
var AdminDiagnosticsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/admin/pages/AdminDiagnosticsPage'); }).then(function (m) { return ({ default: m.AdminDiagnosticsPage }); }); });
// KIOSK Cook Mode - Lazy loaded
var KioskCookModePage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskCookModePage'); }).then(function (m) { return ({ default: m.KioskCookModePage }); }); });
// KIOSK New Pages (04 Dec 2025) - Sprint Operational - Lazy loaded
var KioskPontajPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskPontajPage'); }).then(function (m) { return ({ default: m.KioskPontajPage }); }); });
var KioskScoreboardPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskScoreboardPage'); }).then(function (m) { return ({ default: m.KioskScoreboardPage }); }); });
var KioskExpeditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskExpeditorPage'); }).then(function (m) { return ({ default: m.KioskExpeditorPage }); }); });
// KIOSK Admin Pages (04 Dec 2025) - Lazy loaded
var KioskHQDashboardPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskHQDashboardPage'); }).then(function (m) { return ({ default: m.KioskHQDashboardPage }); }); });
var KioskTrainingPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskTrainingPage'); }).then(function (m) { return ({ default: m.KioskTrainingPage }); }); });
var TrainingPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/training/pages/KioskTrainingPage'); }).then(function (m) { return ({ default: m.KioskTrainingPage }); }); });
var KioskNetworkHealthPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskNetworkHealthPage'); }).then(function (m) { return ({ default: m.KioskNetworkHealthPage }); }); });
// KIOSK Display Pages (04 Dec 2025) - Lazy loaded
var KioskSelfServicePage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskSelfServicePage'); }).then(function (m) { return ({ default: m.KioskSelfServicePage }); }); });
var KioskQROrderingPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskQROrderingPage'); }).then(function (m) { return ({ default: m.KioskQROrderingPage }); }); });
var KioskFeedbackTerminalPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskFeedbackTerminalPage'); }).then(function (m) { return ({ default: m.KioskFeedbackTerminalPage }); }); });
var KioskCustomerDisplayPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskCustomerDisplayPage'); }).then(function (m) { return ({ default: m.KioskCustomerDisplayPage }); }); });
// KIOSK Front Desk Pages (04 Dec 2025) - Lazy loaded
var KioskCoatCheckPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskCoatCheckPage'); }).then(function (m) { return ({ default: m.KioskCoatCheckPage }); }); });
var KioskLostFoundPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskLostFoundPage'); }).then(function (m) { return ({ default: m.KioskLostFoundPage }); }); });
var KioskHostessMapPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskHostessMapPage'); }).then(function (m) { return ({ default: m.KioskHostessMapPage }); }); });
var KioskClientMonitorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskClientMonitorPage'); }).then(function (m) { return ({ default: m.KioskClientMonitorPage }); }); });
var KioskLaundryPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskLaundryPage'); }).then(function (m) { return ({ default: m.KioskLaundryPage }); }); });
var KioskWidgetPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskWidgetPage'); }).then(function (m) { return ({ default: m.KioskWidgetPage }); }); });
// KioskPOSSplitPage - folosește default export cu error handling
var KioskPOSSplitPage = (0, react_1.lazy)(function () {
    return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskPOSSplitPage'); }).then(function (m) { return ({ default: m.default || m.KioskPOSSplitPage }); })
        .catch(function (err) {
        console.error('Error loading KioskPOSSplitPage:', err);
        return {
            default: function () { return (<div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>⚠️ Eroare la încărcarea paginii POS Split</h3>
            <p>Verifică consola pentru detalii</p>
          </div>); }
        };
    });
});
var KioskPOSSplitWrapper = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/kiosk/pages/KioskPOSSplitWrapper'); }); });
// Delivery/Couriers (01 Dec 2025)
var CouriersPage_1 = require("@/modules/delivery/pages/CouriersPage");
var DispatchPage_1 = require("@/modules/delivery/pages/DispatchPage");
var CourierMobileApp_1 = require("@/modules/delivery/pages/CourierMobileApp");
var DeliveryMonitorPage_1 = require("@/modules/delivery/pages/DeliveryMonitorPage");
var DeliveryDashboardPage_1 = require("@/modules/delivery/pages/DeliveryDashboardPage");
// PHASE S10 - React UI Modules
var KdsPage_1 = require("@/modules/kds/pages/KdsPage");
var BarPage_1 = require("@/modules/bar/pages/BarPage");
var DeliveryPage_1 = require("@/modules/delivery/pages/DeliveryPage");
var DriveThruPage_1 = require("@/modules/drivethru/pages/DriveThruPage");
var WaiterPage_1 = require("@/modules/waiter/pages/WaiterPage");
var OrderPage_1 = require("@/modules/order/pages/OrderPage");
var KioskTablesPreviewPage_1 = require("@/modules/kiosk/preview/KioskTablesPreviewPage");
// FAZA 2 - Public Ordering Delivery
var ComandaDeliveryPage_1 = require("@/modules/public-ordering/delivery/pages/ComandaDeliveryPage");
var TrackOrderPage_1 = require("@/modules/public-ordering/tracking/pages/TrackOrderPage");
// Lazy load large modules - Reports (rarely used, large)
// const AdvancedReportsPage = lazy(() => import('@/modules/reports/advanced/pages/AdvancedReportsPage').then(m => ({ default: m.AdvancedReportsPage })));
var SalesReportsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/reports/sales/pages/SalesReportsPage'); }).then(function (m) { return ({ default: m.SalesReportsPage }); }); });
var StockReportsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/reports/stock/pages/StockReportsPage'); }).then(function (m) { return ({ default: m.StockReportsPage }); }); });
var DeliveryPerformanceReportPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/reports/delivery/pages/DeliveryPerformanceReportPage'); }).then(function (m) { return ({ default: m.DeliveryPerformanceReportPage }); }); });
var DriveThruPerformanceReportPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/reports/drivethru/pages/DriveThruPerformanceReportPage'); }).then(function (m) { return ({ default: m.DriveThruPerformanceReportPage }); }); });
var TopProductsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/reports/top-products/pages/TopProductsPage'); }).then(function (m) { return ({ default: m.TopProductsPage }); }); });
var FinancialReportsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/reports/financial/pages/FinancialReportsPage'); }).then(function (m) { return ({ default: m.FinancialReportsPage }); }); });
var StaffReportsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/reports/staff/pages/StaffReportsPage'); }).then(function (m) { return ({ default: m.StaffReportsPage }); }); });
var ABCAnalysisPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/reports/pages/ABCAnalysisPage'); }).then(function (m) { return ({ default: m.ABCAnalysisPage }); }); });
var StockPredictionPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/reports/stock-prediction/pages/StockPredictionPage'); }).then(function (m) { return ({ default: m.StockPredictionPage }); }); });
// PHASE S6.3 - Accounting Reports
var VatReportPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/accounting/reports/pages/VatReportPage'); }).then(function (m) { return ({ default: m.VatReportPage }); }); });
var ClientPaymentsReportPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/accounting/reports/pages/ClientPaymentsReportPage'); }).then(function (m) { return ({ default: m.ClientPaymentsReportPage }); }); });
var SuppliersReportPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/accounting/reports/pages/SuppliersReportPage'); }).then(function (m) { return ({ default: m.SuppliersReportPage }); }); });
var ConsumptionReportPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/accounting/reports/pages/ConsumptionReportPage'); }).then(function (m) { return ({ default: m.ConsumptionReportPage }); }); });
var EntriesByVatReportPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/accounting/reports/pages/EntriesByVatReportPage'); }).then(function (m) { return ({ default: m.EntriesByVatReportPage }); }); });
var StockBalanceReportPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/accounting/reports/pages/StockBalanceReportPage'); }).then(function (m) { return ({ default: m.StockBalanceReportPage }); }); });
var DailyBalanceReportPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/accounting/reports/pages/DailyBalanceReportPage'); }).then(function (m) { return ({ default: m.DailyBalanceReportPage }); }); });
// PHASE S6.3 - Accounting Settings
var AccountingExportPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/accounting/settings/pages/AccountingExportPage'); }).then(function (m) { return ({ default: m.AccountingExportPage }); }); });
var AccountingAccountsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/accounting/settings/pages/AccountingAccountsPage'); }).then(function (m) { return ({ default: m.AccountingAccountsPage }); }); });
var ProductAccountingMappingPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/accounting/settings/pages/ProductAccountingMappingPage'); }).then(function (m) { return ({ default: m.ProductAccountingMappingPage }); }); });
var AccountingPeriodsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/accounting/settings/pages/AccountingPeriodsPage'); }).then(function (m) { return ({ default: m.AccountingPeriodsPage }); }); });
var BankAccountsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/accounting/settings/pages/BankAccountsPage'); }).then(function (m) { return ({ default: m.BankAccountsPage }); }); });
// PHASE S6.3 - Accounting Audit
var DigitalSignaturesPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/accounting/audit/pages/DigitalSignaturesPage'); }).then(function (m) { return ({ default: m.DigitalSignaturesPage }); }); });
var AccountingPermissionsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/accounting/settings/pages/AccountingPermissionsPage'); }).then(function (m) { return ({ default: m.AccountingPermissionsPage }); }); });
// Lazy load Tipizate Enterprise (large module with many pages)
var NirListPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/NirListPage'); }); });
var PrintPreviewPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/PrintPreviewPage'); }); });
var NirEditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/NirEditorPage'); }); });
var BonConsumListPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/BonConsumListPage'); }); });
var BonConsumEditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/BonConsumEditorPage'); }); });
var TransferListPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/TransferListPage'); }); });
var TransferEditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/TransferEditorPage'); }); });
var InventarListPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/InventarListPage'); }); });
var KioskInventarIframePage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/KioskInventarIframePage'); }); });
var InventarEditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/InventarEditorPage'); }); });
var WasteListPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/WasteListPage'); }); });
var WasteEditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/WasteEditorPage'); }); });
var FacturaListPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/FacturaListPage'); }); });
var FacturaEditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/FacturaEditorPage'); }); });
var ChitantaListPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/ChitantaListPage'); }); });
var ChitantaEditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/ChitantaEditorPage'); }); });
var RegistruCasaListPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/RegistruCasaListPage'); }); });
var RegistruCasaEditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/RegistruCasaEditorPage'); }); });
var RaportGestiuneListPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/RaportGestiuneListPage'); }); });
var RaportGestiuneEditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/RaportGestiuneEditorPage'); }); });
var RaportXListPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/RaportXListPage'); }); });
var RaportXEditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/RaportXEditorPage'); }); });
var RaportZListPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/RaportZListPage'); }); });
var RaportZEditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/RaportZEditorPage'); }); });
var RaportLunarListPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/RaportLunarListPage'); }); });
var RaportLunarEditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/RaportLunarEditorPage'); }); });
var AvizListPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/AvizListPage'); }); });
var AvizEditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/AvizEditorPage'); }); });
var ProcesVerbalListPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/ProcesVerbalListPage'); }); });
var ProcesVerbalEditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/ProcesVerbalEditorPage'); }); });
var ReturListPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/ReturListPage'); }); });
var ReturEditorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/tipizate-enterprise/pages/ReturEditorPage'); }); });
// Lazy load Profitability (large)
var ProfitLossPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/profitability/pages/ProfitLossPage'); }).then(function (m) { return ({ default: m.ProfitLossPage }); }); });
var CostsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/profitability/pages/CostsPage'); }).then(function (m) { return ({ default: m.CostsPage }); }); });
// Lazy load Audit (large)
// const AuditLogsPage = lazy(() => import('@/modules/audit/logs/pages/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
var SecurityEventsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/audit/security/pages/SecurityEventsPage'); }).then(function (m) { return ({ default: m.SecurityEventsPage }); }); });
var LoginHistoryPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/audit/login-history/pages/LoginHistoryPage'); }).then(function (m) { return ({ default: m.LoginHistoryPage }); }); });
var UserActivityPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/audit/user-activity/pages/UserActivityPage'); }).then(function (m) { return ({ default: m.UserActivityPage }); }); });
var SecurityAlertsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/audit/alerts/pages/SecurityAlertsPage'); }).then(function (m) { return ({ default: m.SecurityAlertsPage }); }); });
// Lazy load ANAF (large)
var CertificateManagerPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/anaf/pages/CertificateManagerPage'); }).then(function (m) { return ({ default: m.CertificateManagerPage }); }); });
var AnafHealthDashboardPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/anaf/pages/AnafHealthDashboardPage'); }).then(function (m) { return ({ default: m.AnafHealthDashboardPage }); }); });
var SubmissionMonitorPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/anaf/pages/SubmissionMonitorPage'); }).then(function (m) { return ({ default: m.SubmissionMonitorPage }); }); });
// Lazy load E-Factura (large)
var EFacturaDashboardPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/efactura/pages/EFacturaDashboardPage'); }).then(function (m) { return ({ default: m.EFacturaDashboardPage }); }); });
var EFacturaDetailsPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/efactura/pages/EFacturaDetailsPage'); }).then(function (m) { return ({ default: m.EFacturaDetailsPage }); }); });
// Lazy load Stocks/Fiscal (large)
var MonthlyReportPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/stocks/fiscal/pages/MonthlyReportPage'); }).then(function (m) { return ({ default: m.MonthlyReportPage }); }); });
var FiscalArchivePage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/stocks/fiscal/pages/FiscalArchivePage'); }).then(function (m) { return ({ default: m.FiscalArchivePage }); }); });
var FiscalDocumentsCreatePage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/stocks/fiscal/pages/FiscalDocumentsCreatePage'); }).then(function (m) { return ({ default: m.FiscalDocumentsCreatePage }); }); });
var CashRegisterPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/stocks/fiscal/pages/CashRegisterPage'); }).then(function (m) { return ({ default: m.CashRegisterPage }); }); });
var FiscalReportXPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/stocks/fiscal/pages/FiscalReportXPage'); }).then(function (m) { return ({ default: m.FiscalReportXPage }); }); });
var FiscalReportZPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/stocks/fiscal/pages/FiscalReportZPage'); }).then(function (m) { return ({ default: m.FiscalReportZPage }); }); });
var AnafSyncPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/stocks/fiscal/pages/AnafSyncPage'); }).then(function (m) { return ({ default: m.AnafSyncPage }); }); });
var AnafIntegrationPage = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('@/modules/stocks/fiscal/pages/AnafIntegrationPage'); }).then(function (m) { return ({ default: m.AnafIntegrationPage }); }); });
var App = function () {
    // PHASE PRODUCTION-READY: Accessible loading fallback
    var LoadingFallback = function () { return (<div className="loading-spinner-container" role="status" aria-live="polite" aria-label="Se încarcă conținutul">
      <div className="loading-spinner" aria-hidden="true"></div>
      <span className="sr-only">Se încarcă conținutul</span>
      <style>{"\n        @keyframes spin {\n          0% { transform: rotate(0deg); }\n          100% { transform: rotate(360deg); }\n        }\n        @media (prefers-reduced-motion: reduce) {\n          .loading-spinner {\n            animation: none;\n          }\n        }\n      "}</style>
    </div>); };
    // Helper component pentru lazy loading cu Suspense
    var LazyRoute = function (_a) {
        var Component = _a.component;
        return (<react_1.Suspense fallback={<LoadingFallback />}>
      <Component />
    </react_1.Suspense>);
    };
    console.log('🔍 App render - current pathname:', window.location.pathname);
    return (<react_router_dom_1.Routes>
      {/* KIOSK Routes fără Sidebar - trebuie să fie ÎNAINTE pentru a avea prioritate */}
      <react_router_dom_1.Route path="/kiosk/login" element={<KioskLayout />}>
        <react_router_dom_1.Route index element={<KioskLoginPage />}/>
      </react_router_dom_1.Route>
      <react_router_dom_1.Route path="/kiosk/cook-mode/:productId" element={<KioskLayout />}>
        <react_router_dom_1.Route index element={<KioskCookModePage />}/>
      </react_router_dom_1.Route>

      {/* Courier Mobile App - PRIMUL! Fără layout, fullscreen pentru mobil */}
      <react_router_dom_1.Route path="/courier" element={<CourierMobileApp_1.CourierMobileApp />}/>
      <react_router_dom_1.Route path="/courier/*" element={<CourierMobileApp_1.CourierMobileApp />}/>

      {/* POS Fullscreen - Fără sidebar, fullscreen cu providers */}
      <react_router_dom_1.Route path="/pos-fullscreen" element={<KioskPOSSplitWrapper />}/>

      {/* FAZA 2 - Public Ordering (No auth required) */}
      <react_router_dom_1.Route path="/public/delivery" element={<ComandaDeliveryPage_1.ComandaDeliveryPage />}/>
      <react_router_dom_1.Route path="/public/track-order" element={<TrackOrderPage_1.TrackOrderPage />}/>

      {/* PHASE S10 - React UI Modules (Display-only, no sidebar) */}
      <react_router_dom_1.Route path="/comanda" element={<OrderPage_1.OrderPage />}/>
      <react_router_dom_1.Route path="/order" element={<OrderPage_1.OrderPage />}/>
      <react_router_dom_1.Route path="/kiosk-tables-preview" element={<KioskTablesPreviewPage_1.KioskTablesPreviewPage />}/>
      {/* KDS Routes - accessible from both /kds and /admin-vite/kds for compatibility */}
      {/* Note: /kds and /bar work because basename is /admin-vite/, so they resolve to /admin-vite/kds and /admin-vite/bar */}
      <react_router_dom_1.Route path="/kds" element={<KdsPage_1.KdsPage />}/>
      <react_router_dom_1.Route path="/admin-vite/kds" element={<KdsPage_1.KdsPage />}/>
      {/* Bar Routes - accessible from both /bar and /admin-vite/bar for compatibility */}
      <react_router_dom_1.Route path="/bar" element={<BarPage_1.BarPage />}/>
      <react_router_dom_1.Route path="/admin-vite/bar" element={<BarPage_1.BarPage />}/>
      <react_router_dom_1.Route path="/delivery" element={<DeliveryPage_1.DeliveryPage />}/>
      <react_router_dom_1.Route path="/delivery/:waiterId" element={<DeliveryPage_1.DeliveryPage />}/>
      <react_router_dom_1.Route path="/drive-thru" element={<DriveThruPage_1.DriveThruPage />}/>
      <react_router_dom_1.Route path="/waiter" element={<WaiterPage_1.WaiterPage />}/>
      <react_router_dom_1.Route path="/waiter/:waiterId" element={<WaiterPage_1.WaiterPage />}/>

      {/* KIOSK Routes cu Sidebar - KioskMainLayout */}
      <react_router_dom_1.Route path="/kiosk" element={<KioskMainLayout />}>
        <react_router_dom_1.Route index element={<react_router_dom_1.Navigate to="/kiosk/dashboard" replace/>}/>
        <react_router_dom_1.Route path="dashboard" element={<KioskDashboardPage />}/>
        <react_router_dom_1.Route path="tables" element={<KioskTablesPage2D />}/>
        <react_router_dom_1.Route path="pos-split" element={<KioskPOSSplitPage />}/>
        <react_router_dom_1.Route path="order/:tableId" element={<KioskOrderPage />}/>
        <react_router_dom_1.Route path="fast-sale" element={<KioskFastSalePage />}/>
        {/* Staff Reports - ambele rute pentru compatibilitate */}
        <react_router_dom_1.Route path="staff-live-report" element={<KioskStaffLiveReportPage />}/>
        <react_router_dom_1.Route path="reports/staff-live" element={<KioskStaffLiveReportPage />}/>
        {/* Events & Shift */}
        <react_router_dom_1.Route path="events" element={<KioskEventsPage />}/>
        <react_router_dom_1.Route path="shift-handover" element={<KioskShiftHandoverPage />}/>
        <react_router_dom_1.Route path="menu-board" element={<KioskMenuBoardPage />}/>
        {/* NEW: Operational Pages (04 Dec 2025) */}
        <react_router_dom_1.Route path="pontaj" element={<KioskPontajPage />}/>
        <react_router_dom_1.Route path="scoreboard" element={<KioskScoreboardPage />}/>
        <react_router_dom_1.Route path="expeditor" element={<KioskExpeditorPage />}/>
        {/* NEW: Admin Pages (04 Dec 2025) */}
        <react_router_dom_1.Route path="hq-dashboard" element={<KioskHQDashboardPage />}/>
        <react_router_dom_1.Route path="training" element={<KioskTrainingPage />}/>
        <react_router_dom_1.Route path="network-health" element={<KioskNetworkHealthPage />}/>
        {/* NEW: Display Pages (04 Dec 2025) */}
        <react_router_dom_1.Route path="self-service" element={<KioskSelfServicePage />}/>
        <react_router_dom_1.Route path="qr-ordering" element={<KioskQROrderingPage />}/>
        <react_router_dom_1.Route path="feedback-terminal" element={<KioskFeedbackTerminalPage />}/>
        <react_router_dom_1.Route path="customer-display" element={<KioskCustomerDisplayPage />}/>
        {/* NEW: Front Desk Pages (04 Dec 2025) */}
        <react_router_dom_1.Route path="coatcheck" element={<KioskCoatCheckPage />}/>
        <react_router_dom_1.Route path="lost-found" element={<KioskLostFoundPage />}/>
        <react_router_dom_1.Route path="hostess-map" element={<KioskHostessMapPage />}/>
        <react_router_dom_1.Route path="client-monitor" element={<KioskClientMonitorPage />}/>
        <react_router_dom_1.Route path="widget" element={<KioskWidgetPage />}/>
        <react_router_dom_1.Route path="laundry" element={<KioskLaundryPage />}/>

        {/* Tipizate Enterprise - Documente interne (admin-vite) */}
        <react_router_dom_1.Route path="tipizate-enterprise/bon-consum" element={<LazyRoute component={BonConsumListPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/bon-consum/new" element={<LazyRoute component={BonConsumEditorPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/bon-consum/:id" element={<LazyRoute component={BonConsumEditorPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/waste" element={<LazyRoute component={WasteListPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/waste/new" element={<LazyRoute component={WasteEditorPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/waste/:id" element={<LazyRoute component={WasteEditorPage}/>}/>

        {/* NIR Enterprise KIOSK: Redirect către admin-advanced.html#inventory?iframe=true */}
        <react_router_dom_1.Route path="kiosk/tipizate-enterprise/nir" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#inventory"/>}/>

        {/* NIR Enterprise */}
        <react_router_dom_1.Route path="tipizate-enterprise/nir" element={<LazyRoute component={NirListPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/nir/new" element={<LazyRoute component={NirEditorPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/nir/:id" element={<LazyRoute component={NirEditorPage}/>}/>

        {/* Transfer Enterprise */}
        <react_router_dom_1.Route path="tipizate-enterprise/transfer" element={<LazyRoute component={KioskTransferIframePage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/transfer/new" element={<LazyRoute component={TransferEditorPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/transfer/:id" element={<LazyRoute component={TransferEditorPage}/>}/>

        {/* Inventar Enterprise */}
        <react_router_dom_1.Route path="tipizate-enterprise/inventar" element={<LazyRoute component={KioskInventarIframePage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/inventar/new" element={<LazyRoute component={InventarEditorPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/inventar/:id" element={<LazyRoute component={InventarEditorPage}/>}/>

        {/* Factura Enterprise */}
        <react_router_dom_1.Route path="tipizate-enterprise/factura" element={<LazyRoute component={FacturaListPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/factura/new" element={<LazyRoute component={FacturaEditorPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/factura/:id" element={<LazyRoute component={FacturaEditorPage}/>}/>

        {/* Chitanta Enterprise */}
        <react_router_dom_1.Route path="tipizate-enterprise/chitanta" element={<LazyRoute component={ChitantaListPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/chitanta/new" element={<LazyRoute component={ChitantaEditorPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/chitanta/:id" element={<LazyRoute component={ChitantaEditorPage}/>}/>

        {/* Registru Casa Enterprise */}
        <react_router_dom_1.Route path="tipizate-enterprise/registru-casa" element={<LazyRoute component={RegistruCasaListPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/registru-casa/new" element={<LazyRoute component={RegistruCasaEditorPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/registru-casa/:id" element={<LazyRoute component={RegistruCasaEditorPage}/>}/>


        {/* Stocks - Aceeași componentă ca Admin-vite */}
        <react_router_dom_1.Route path="stocks" element={<StockManagementPage_1.StockManagementPage />}/>
      </react_router_dom_1.Route>

      {/* AdminV4 Routes - folosesc AppLayout */}
      {/* NU folosim path="*" pentru a nu captura /kiosk/* */}
      <react_router_dom_1.Route path="/*" element={<AppLayout_1.AppLayout />}>
        <react_router_dom_1.Route index element={<react_router_dom_1.Navigate to="/welcome" replace/>}/>
        <react_router_dom_1.Route path="welcome" element={<WelcomePage_1.WelcomePage />}/>
        <react_router_dom_1.Route path="dashboard" element={<DashboardPage_1.DashboardPage />}/>
        <react_router_dom_1.Route path="dashboard/monitoring" element={<MonitoringPage_1.MonitoringPage />}/>
        <react_router_dom_1.Route path="monitoring/performance" element={<MonitoringPage_1.MonitoringPage />}/>
        <react_router_dom_1.Route path="monitoring/health" element={<MonitoringDashboardPage_1.MonitoringDashboardPage />}/>
        <react_router_dom_1.Route path="monitoring/dashboard" element={<MonitoringDashboardPage_1.MonitoringDashboardPage />}/>
        <react_router_dom_1.Route path="executive-dashboard" element={<ExecutiveDashboardPage_2.ExecutiveDashboardPage />}/>
        <react_router_dom_1.Route path="platform-sync" element={<PlatformSyncPage_1.PlatformSyncPage />}/>
        <react_router_dom_1.Route path="external-delivery/sync" element={<PlatformSyncPage_1.PlatformSyncPage />}/>
        <react_router_dom_1.Route path="internal-messaging" element={<InternalMessagingPage_1.InternalMessagingPage />}/>
        <react_router_dom_1.Route path="menu" element={<MenuManagementPage_1.MenuManagementPage />}/>
        <react_router_dom_1.Route path="catalog" element={<CatalogPage_1.CatalogPage />}/>
        <react_router_dom_1.Route path="catalog/online" element={<CatalogOnlinePage_1.CatalogOnlinePage />}/>
        <react_router_dom_1.Route path="ingredients" element={<StockManagementPage_1.StockManagementPage />}/>
        <react_router_dom_1.Route path="stocks" element={<StockManagementPage_1.StockManagementPage />}/>
        {/* PHASE S5.5 - Legacy Stocks Routes → Redirect to Admin Advanced */}
        <react_router_dom_1.Route path="stocks/nir" element={<react_router_dom_1.Navigate to="/admin-advanced/inventory" replace/>}/>
        <react_router_dom_1.Route path="stocks/nir/*" element={<react_router_dom_1.Navigate to="/admin-advanced/inventory" replace/>}/>
        <react_router_dom_1.Route path="stocks/consume" element={<react_router_dom_1.Navigate to="/tipizate-enterprise/bon-consum" replace/>}/>
        <react_router_dom_1.Route path="stocks/consume/new" element={<react_router_dom_1.Navigate to="/tipizate-enterprise/bon-consum/new" replace/>}/>
        <react_router_dom_1.Route path="stocks/consume/:id" element={<RedirectWithParams_1.RedirectWithParams to={function (p) { return "/tipizate-enterprise/bon-consum/".concat(p.id); }}/>}/>
        <react_router_dom_1.Route path="stocks/inventory" element={<react_router_dom_1.Navigate to="/admin-advanced/multi-inventory" replace/>}/>
        <react_router_dom_1.Route path="stocks/inventory/new" element={<react_router_dom_1.Navigate to="/admin-advanced/multi-inventory" replace/>}/>
        {/* Inventory Dashboard & Multi-Inventory remain (separate functionality) */}
        <react_router_dom_1.Route path="stocks/inventory/:id" element={<InventoryDetailsPage_1.default />}/>
        <react_router_dom_1.Route path="stocks/inventory/dashboard" element={<InventoryDashboardPage_1.default />}/>
        <react_router_dom_1.Route path="stocks/inventory/multi" element={<MultiInventoryPage_1.MultiInventoryPage />}/>
        <react_router_dom_1.Route path="stocks/inventory/import" element={<InventoryImportPage_1.InventoryImportPage />}/>
        <react_router_dom_1.Route path="stocks/allergens" element={<AllergensPage_1.AllergensPage />}/>
        <react_router_dom_1.Route path="stocks/labels" element={<LabelsPage_1.LabelsPage />}/>
        {/* PHASE S5.5 - Legacy Waste Route → Redirect to Tipizate Enterprise */}
        <react_router_dom_1.Route path="stocks/waste" element={<react_router_dom_1.Navigate to="/tipizate-enterprise/waste" replace/>}/>
        <react_router_dom_1.Route path="stocks/costs" element={<CostsPage />}/>
        <react_router_dom_1.Route path="stocks/retur" element={<react_router_dom_1.Navigate to="/tipizate-enterprise/retur" replace/>}/>
        <react_router_dom_1.Route path="stocks/risk-alerts" element={<RiskAlertsPage_1.RiskAlertsPage />}/>
        <react_router_dom_1.Route path="stocks/suppliers" element={<SuppliersPage_1.SuppliersPage />}/>
        <react_router_dom_1.Route path="stocks/suppliers/orders" element={<SupplierOrdersPage_1.SupplierOrdersPage />}/>
        <react_router_dom_1.Route path="orders/manage" element={<ManageOrdersPage_1.default />}/>
        {/* PHASE S5.5 - Legacy Transfer Routes → Redirect to Admin Advanced */}
        <react_router_dom_1.Route path="stocks/transfer" element={<react_router_dom_1.Navigate to="/admin-advanced/transfers" replace/>}/>
        <react_router_dom_1.Route path="stocks/transfer/*" element={<react_router_dom_1.Navigate to="/admin-advanced/transfers" replace/>}/>
        {/* PHASE S5.5 - Legacy Waste Route → Redirect to Tipizate Enterprise */}
        <react_router_dom_1.Route path="stocks/waste" element={<react_router_dom_1.Navigate to="/tipizate-enterprise/waste" replace/>}/>
        <react_router_dom_1.Route path="orders" element={<OrdersManagementPage_1.OrdersManagementPage />}/>
        <react_router_dom_1.Route path="orders/history" element={<OrdersHistoryPage_1.OrdersHistoryPage />}/>
        <react_router_dom_1.Route path="orders/delivery" element={<DeliveryOrdersPage_1.DeliveryOrdersPage />}/>
        <react_router_dom_1.Route path="orders/drive-thru" element={<DriveThruOrdersPage_1.DriveThruOrdersPage />}/>
        <react_router_dom_1.Route path="orders/takeaway" element={<TakeawayOrdersPage_1.TakeawayOrdersPage />}/>
        <react_router_dom_1.Route path="orders/cancellations" element={<CancellationsPage_1.CancellationsPage />}/>
        <react_router_dom_1.Route path="couriers" element={<CouriersPage_1.CouriersPage />}/>
        <react_router_dom_1.Route path="dispatch" element={<DispatchPage_1.DispatchPage />}/>
        <react_router_dom_1.Route path="drive-thru" element={<DriveThruPage_1.DriveThruPage />}/>
        <react_router_dom_1.Route path="delivery-monitor" element={<DeliveryMonitorPage_1.DeliveryMonitorPage />}/>
        <react_router_dom_1.Route path="delivery-dashboard" element={<DeliveryDashboardPage_1.DeliveryDashboardPage />}/>
        <react_router_dom_1.Route path="delivery/kpi" element={<DeliveryKpiDashboardPage_1.DeliveryKpiDashboardPage />}/>
        <react_router_dom_1.Route path="recipes" element={<RecipesPage_1.RecipesPage />}/>
        <react_router_dom_1.Route path="reservations" element={<LegacyRedirect_1.LegacyRedirect url="/admin.html#reservations"/>}/>
        <react_router_dom_1.Route path="daily-menu" element={<DailyMenuPage_1.DailyMenuPage />}/>
        <react_router_dom_1.Route path="lots" element={<LotsPage_1.LotsPage />}/>
        <react_router_dom_1.Route path="traceability" element={<TraceabilityPage_1.TraceabilityPage />}/>
        <react_router_dom_1.Route path="backup" element={<BackupPage_1.BackupPage />}/>
        <react_router_dom_1.Route path="menu-pdf" element={<MenuPDFBuilderPage_1.MenuPDFBuilderPage />}/>
        <react_router_dom_1.Route path="waiters" element={<WaitersPage_1.WaitersPage />}/>
        <react_router_dom_1.Route path="queue-monitor" element={<QueueMonitorPage_1.default />}/>
        {/* Queue Monitor direct route - priority over admin-advanced */}
        <react_router_dom_1.Route path="admin-advanced/queue-monitor" element={<QueueMonitorPage_1.default />}/>
        <react_router_dom_1.Route path="compliance" element={<CompliancePage_1.CompliancePage />}/>
        <react_router_dom_1.Route path="compliance/haccp" element={<HACCPDashboardPage_1.HACCPDashboardPage />}/>
        <react_router_dom_1.Route path="compliance/haccp/processes" element={<HACCPProcessesPage_1.HACCPProcessesPage />}/>
        <react_router_dom_1.Route path="compliance/haccp/monitoring" element={<HACCPMonitoringPage_1.HACCPMonitoringPage />}/>
        <react_router_dom_1.Route path="compliance/haccp/corrective-actions" element={<HACCPCorrectiveActionsPage_1.HACCPCorrectiveActionsPage />}/>
        <react_router_dom_1.Route path="settings" element={<SettingsPage_1.SettingsPage />}/>
        <react_router_dom_1.Route path="tables" element={<TablesPage_1.TablesPage />}/>
        <react_router_dom_1.Route path="profitability" element={<LazyRoute component={ProfitLossPage}/>}/>
        <react_router_dom_1.Route path="training" element={<TrainingPage />}/>
        <react_router_dom_1.Route path="production/batches" element={<ProductionBatchesListPage_1.default />}/>
        <react_router_dom_1.Route path="production/batches/:id" element={<ProductionBatchEditorPage_1.default />}/>
        <react_router_dom_1.Route path="reports" element={<AdvancedReportsPage_1.AdvancedReportsPage />}/>
        <react_router_dom_1.Route path="reports/profit-loss" element={<LazyRoute component={ProfitLossPage}/>}/>
        <react_router_dom_1.Route path="reports/abc-analysis" element={<LazyRoute component={ABCAnalysisPage}/>}/>
        <react_router_dom_1.Route path="reports/staff" element={<LazyRoute component={StaffReportsPage}/>}/>
        <react_router_dom_1.Route path="reports/advanced" element={<LazyRoute component={AdvancedReportsPage_1.AdvancedReportsPage}/>}/>
        <react_router_dom_1.Route path="reports/sales" element={<LazyRoute component={SalesReportsPage}/>}/>
        <react_router_dom_1.Route path="reports/stock" element={<LazyRoute component={StockReportsPage}/>}/>
        <react_router_dom_1.Route path="reports/delivery-performance" element={<LazyRoute component={DeliveryPerformanceReportPage}/>}/>
        <react_router_dom_1.Route path="reports/drive-thru-performance" element={<LazyRoute component={DriveThruPerformanceReportPage}/>}/>
        <react_router_dom_1.Route path="archive" element={<ArchivePage_1.ArchivePage />}/>
        <react_router_dom_1.Route path="reports/top-products" element={<LazyRoute component={TopProductsPage}/>}/>
        <react_router_dom_1.Route path="reports/financial" element={<LazyRoute component={FinancialReportsPage}/>}/>
        {/* PHASE S6.3 - Accounting Reports */}
        <react_router_dom_1.Route path="accounting/reports/vat" element={<LazyRoute component={VatReportPage}/>}/>
        <react_router_dom_1.Route path="accounting/reports/client-payments" element={<LazyRoute component={ClientPaymentsReportPage}/>}/>
        <react_router_dom_1.Route path="accounting/reports/suppliers" element={<LazyRoute component={SuppliersReportPage}/>}/>
        <react_router_dom_1.Route path="accounting/reports/consumption" element={<LazyRoute component={ConsumptionReportPage}/>}/>
        <react_router_dom_1.Route path="accounting/reports/entries" element={<LazyRoute component={EntriesByVatReportPage}/>}/>
        <react_router_dom_1.Route path="accounting/reports/stock-balance" element={<LazyRoute component={StockBalanceReportPage}/>}/>
        <react_router_dom_1.Route path="accounting/reports/daily-balance" element={<LazyRoute component={DailyBalanceReportPage}/>}/>
        {/* PHASE S6.3 - Accounting Settings */}
        <react_router_dom_1.Route path="accounting/settings/export" element={<LazyRoute component={AccountingExportPage}/>}/>
        <react_router_dom_1.Route path="accounting/settings/accounts" element={<LazyRoute component={AccountingAccountsPage}/>}/>
        <react_router_dom_1.Route path="accounting/settings/product-mapping" element={<LazyRoute component={ProductAccountingMappingPage}/>}/>
        <react_router_dom_1.Route path="accounting/settings/periods" element={<LazyRoute component={AccountingPeriodsPage}/>}/>
        <react_router_dom_1.Route path="accounting/settings/bank-accounts" element={<LazyRoute component={BankAccountsPage}/>}/>
        <react_router_dom_1.Route path="accounting/settings/permissions" element={<LazyRoute component={AccountingPermissionsPage}/>}/>
        {/* PHASE S6.3 - Accounting Audit */}
        <react_router_dom_1.Route path="accounting/audit/signatures" element={<LazyRoute component={DigitalSignaturesPage}/>}/>
        <react_router_dom_1.Route path="settings/locations" element={<LocationsPage_1.LocationsPage />}/>

        {/* Admin Advanced Routes - Legacy HTML Redirect */}
        <react_router_dom_1.Route path="admin-advanced/dashboard" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#dashboard"/>}/>
        <react_router_dom_1.Route path="admin-advanced/queue-monitor" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#queue-monitor"/>}/>
        <react_router_dom_1.Route path="admin-advanced/inventory" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#inventory"/>}/>
        <react_router_dom_1.Route path="admin-advanced/transfers" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#transfers"/>}/>
        <react_router_dom_1.Route path="admin-advanced/multi-inventory" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#multi-inventory"/>}/>
        <react_router_dom_1.Route path="admin-advanced/portion-control" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#portion-control"/>}/>
        <react_router_dom_1.Route path="admin-advanced/variance-reporting" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#variance-reporting"/>}/>
        <react_router_dom_1.Route path="admin-advanced/executive-dashboard" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#executive-dashboard"/>}/>
        <react_router_dom_1.Route path="admin-advanced/reports" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#reports"/>}/>
        <react_router_dom_1.Route path="admin-advanced/marketing" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#marketing"/>}/>
        <react_router_dom_1.Route path="admin-advanced/happy-hour" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#happy-hour"/>}/>
        <react_router_dom_1.Route path="admin-advanced/fiscal" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#fiscal"/>}/>
        <react_router_dom_1.Route path="admin-advanced/risk-alerts" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#risk-alerts"/>}/>
        <react_router_dom_1.Route path="admin-advanced/restaurant-config" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#restaurant-config"/>}/>
        <react_router_dom_1.Route path="admin-advanced/feedback" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#feedback"/>}/>
        <react_router_dom_1.Route path="settings/areas" element={<AreasPage_1.AreasPage />}/>
        <react_router_dom_1.Route path="settings/tables" element={<TablesPage_1.TablesPage />}/>
        <react_router_dom_1.Route path="settings/product-display" element={<ProductDisplayPage_1.ProductDisplayPage />}/>
        <react_router_dom_1.Route path="settings/missing-translations" element={<MissingTranslationsPage_1.MissingTranslationsPage />}/>
        <react_router_dom_1.Route path="settings/payment-methods" element={<PaymentMethodsPage_1.PaymentMethodsPage />}/>
        <react_router_dom_1.Route path="settings/vat" element={<VatRatesPage_1.default />}/>
        <react_router_dom_1.Route path="settings/schedule" element={<SchedulePage_1.SchedulePage />}/>
        <react_router_dom_1.Route path="settings/users" element={<UsersPage_1.UsersPage />}/>
        <react_router_dom_1.Route path="settings/printers" element={<PrintersPage_1.PrintersPage />}/>
        <react_router_dom_1.Route path="settings/notifications" element={<NotificationsPage_1.NotificationsPage />}/>
        <react_router_dom_1.Route path="settings/localization" element={<LocalizationPage_1.LocalizationPage />}/>
        <react_router_dom_1.Route path="integrations" element={<IntegrationsPage_1.IntegrationsPage />}/>
        <react_router_dom_1.Route path="settings/ui-customization" element={<UICustomizationPage_1.UICustomizationPage />}/>
        <react_router_dom_1.Route path="settings/import-export" element={<ImportExportPage_1.ImportExportPage />}/>
        <react_router_dom_1.Route path="settings/branding" element={<BrandingPage_1.BrandingPage />}/>
        <react_router_dom_1.Route path="settings/manual-instructiuni" element={<ManualInstructiuniPage_1.ManualInstructiuniPage />}/>
        <react_router_dom_1.Route path="import" element={<ImportPage_1.ImportPage />}/>
        <react_router_dom_1.Route path="export" element={<ExportPage_1.ExportPage />}/>
        <react_router_dom_1.Route path="stocks/fiscal/reports/monthly" element={<LazyRoute component={MonthlyReportPage}/>}/>
        <react_router_dom_1.Route path="stocks/fiscal/archive" element={<LazyRoute component={FiscalArchivePage}/>}/>
        <react_router_dom_1.Route path="stocks/fiscal/documents/create" element={<LazyRoute component={FiscalDocumentsCreatePage}/>}/>
        <react_router_dom_1.Route path="stocks/fiscal/cash-register" element={<LazyRoute component={CashRegisterPage}/>}/>
        <react_router_dom_1.Route path="stocks/fiscal/reports/x" element={<LazyRoute component={FiscalReportXPage}/>}/>
        <react_router_dom_1.Route path="stocks/fiscal/reports/z" element={<LazyRoute component={FiscalReportZPage}/>}/>
        <react_router_dom_1.Route path="stocks/fiscal/sync" element={<LazyRoute component={AnafSyncPage}/>}/>
        <react_router_dom_1.Route path="stocks/fiscal/anaf-integration" element={<LazyRoute component={AnafIntegrationPage}/>}/>
        {/* FAZA 1 - ANAF Management */}
        <react_router_dom_1.Route path="anaf/certificate" element={<LazyRoute component={CertificateManagerPage}/>}/>
        <react_router_dom_1.Route path="anaf/health" element={<LazyRoute component={AnafHealthDashboardPage}/>}/>
        {/* FAZA 1 - ANAF Certificate & Health Management */}
        <react_router_dom_1.Route path="anaf/submissions" element={<LazyRoute component={SubmissionMonitorPage}/>}/>
        {/* FAZA 1.5 - SAF-T Export */}
        <react_router_dom_1.Route path="anaf/saft-export" element={<SaftExportPage_1.SaftExportPage />}/>
        {/* SAGA Export */}
        <react_router_dom_1.Route path="saga/export" element={<SagaExportPage_1.SagaExportPage />}/>
        {/* Portion Control și Variance - disponibile în Admin Advanced */}
        <react_router_dom_1.Route path="nomenclator/units" element={<UnitsOfMeasurePage_1.UnitsOfMeasurePage />}/>
        <react_router_dom_1.Route path="catalog/prices" element={<PriceUtilitiesPage_1.PriceUtilitiesPage />}/>
        <react_router_dom_1.Route path="catalog/attributes" element={<AttributeGroupsPage_1.AttributeGroupsPage />}/>
        <react_router_dom_1.Route path="promotions/happy-hour" element={<LegacyRedirect_1.LegacyRedirect url="/admin-advanced.html#happy-hour"/>}/>
        <react_router_dom_1.Route path="promotions/daily-offer" element={<DailyOfferPage_1.DailyOfferPage />}/>
        <react_router_dom_1.Route path="marketing" element={<MarketingPage_1.MarketingPage />}/>
        <react_router_dom_1.Route path="marketing/feedback" element={<FeedbackPage_1.FeedbackPage />}/>
        <react_router_dom_1.Route path="marketing/vouchers" element={<VouchersPage_1.VouchersPage />}/>
        <react_router_dom_1.Route path="marketing/loyalty" element={<LoyaltyPage_1.LoyaltyPage />}/>

        {/* Call Center Simulator */}
        <react_router_dom_1.Route path="call-center-simulator" element={<LazyRoute component={CallCenterSimulatorPage}/>}/>

        <react_router_dom_1.Route path="marketing/reservations-new" element={<ReservationsPage_1.ReservationsPage />}/>
        <react_router_dom_1.Route path="stocks/dashboard/executive" element={<ExecutiveDashboardPage_1.ExecutiveDashboardPage />}/>
        <react_router_dom_1.Route path="stocks/dashboard/advanced" element={<AdvancedStockDashboardPage_1.AdvancedStockDashboardPage />}/>
        <react_router_dom_1.Route path="reports/stock-prediction" element={<LazyRoute component={StockPredictionPage}/>}/>
        <react_router_dom_1.Route path="audit/logs" element={<AuditLogsPage_1.AuditLogsPage />}/>
        <react_router_dom_1.Route path="audit/security" element={<LazyRoute component={SecurityEventsPage}/>}/>
        <react_router_dom_1.Route path="audit/login-history" element={<LazyRoute component={LoginHistoryPage}/>}/>
        <react_router_dom_1.Route path="audit/user-activity" element={<LazyRoute component={UserActivityPage}/>}/>
        <react_router_dom_1.Route path="audit/alerts" element={<LazyRoute component={SecurityAlertsPage}/>}/>
        <react_router_dom_1.Route path="docs" element={<DocumentationPage_1.DocumentationPage />}/>
        {/* Enterprise Routes (30 Nov 2025 - Updated 03 Dec 2025) */}
        <react_router_dom_1.Route path="menu-engineering" element={<MenuEngineeringPage />}/>
        <react_router_dom_1.Route path="food-cost" element={<FoodCostDashboardPage />}/>
        <react_router_dom_1.Route path="gift-cards" element={<GiftCardsPage />}/>
        <react_router_dom_1.Route path="smart-restock" element={<SmartRestockPage />}/>
        <react_router_dom_1.Route path="weather-forecast" element={<WeatherForecastPage />}/>
        <react_router_dom_1.Route path="competitors" element={<CompetitorTrackingPage />}/>
        <react_router_dom_1.Route path="scheduling" element={<EmployeeSchedulingPage />}/>
        <react_router_dom_1.Route path="purchase-orders" element={<AutoPurchaseOrdersPage />}/>
        <react_router_dom_1.Route path="hostess-map" element={<HostessMapPage />}/>
        <react_router_dom_1.Route path="coatroom" element={<CoatroomPage />}/>
        <react_router_dom_1.Route path="lost-found" element={<LostFoundPage />}/>
        <react_router_dom_1.Route path="reports/hostess-occupancy" element={<HostessReportPage />}/>
        <react_router_dom_1.Route path="reports/coatroom-daily" element={<CoatroomReportPage />}/>
        <react_router_dom_1.Route path="reports/lostfound-items" element={<LostFoundReportPage />}/>
        <react_router_dom_1.Route path="dashboards/hostess" element={<HostessDashboardPage />}/>
        <react_router_dom_1.Route path="dashboards/coatroom" element={<CoatroomDashboardPage />}/>
        <react_router_dom_1.Route path="dashboards/lostfound" element={<LostFoundDashboardPage />}/>
        <react_router_dom_1.Route path="dashboards/platform-stats" element={<PlatformStatsDashboardPage />}/>

        {/* Enterprise Rebuild Routes (03 Dec 2025) */}
        <react_router_dom_1.Route path="technical-sheets" element={<TechnicalSheetsPage />}/>
        <react_router_dom_1.Route path="recipes/scaling" element={<RecipeScalingPage_1.default />}/>
        {/* Menu Builder (04 Dec 2025) - CRITICAL FEATURE */}
        <react_router_dom_1.Route path="menu/builder" element={<MenuBuilderPage />}/>
        <react_router_dom_1.Route path="portions" element={<PortionsPage />}/>
        <react_router_dom_1.Route path="recalls" element={<RecallsPage />}/>
        <react_router_dom_1.Route path="expiry-alerts" element={<ExpiryAlertsPage />}/>
        <react_router_dom_1.Route path="variance-reports" element={<VarianceReportsPage />}/>
        {/* Admin Diagnostics - Internal only */}
        <react_router_dom_1.Route path="admin/diagnostics" element={<AdminDiagnosticsPage />}/>

        {/* ------------------------------------------------------------------ */}
        {/* PHASE S4.2 - TIPIZATE ENTERPRISE (NEW)                            */}
        {/* UI de lucru unificat pentru toate tipizatele                       */}
        {/* ------------------------------------------------------------------ */}

        {/* PHASE S5.6 - Print Preview */}
        <react_router_dom_1.Route path="print" element={<LazyRoute component={PrintPreviewPage}/>}/>

        {/* NIR Enterprise → Admin Advanced */}

        {/* Bon Consum Enterprise */}
        <react_router_dom_1.Route path="tipizate-enterprise/bon-consum" element={<LazyRoute component={BonConsumListPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/bon-consum/new" element={<LazyRoute component={BonConsumEditorPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/bon-consum/:id" element={<LazyRoute component={BonConsumEditorPage}/>}/>

        {/* Transfer Enterprise → Admin Advanced */}

        {/* Inventar Enterprise → Admin Advanced */}

        {/* Waste Enterprise */}
        <react_router_dom_1.Route path="tipizate-enterprise/waste" element={<LazyRoute component={WasteListPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/waste/new" element={<LazyRoute component={WasteEditorPage}/>}/>
        <react_router_dom_1.Route path="tipizate-enterprise/waste/:id" element={<LazyRoute component={WasteEditorPage}/>}/>

        {/* Factură Enterprise → Admin Advanced */}

        {/* Chitanță Enterprise → Admin Advanced */}

        {/* Registru Casă Enterprise → Admin Advanced */}

        {/* Raport Gestiune Enterprise */}
        <react_router_dom_1.Route path="tipizate-enterprise/raport-gestiune" element={<RaportGestiuneListPage />}/>
        <react_router_dom_1.Route path="tipizate-enterprise/raport-gestiune/new" element={<RaportGestiuneEditorPage />}/>
        <react_router_dom_1.Route path="tipizate-enterprise/raport-gestiune/:id" element={<RaportGestiuneEditorPage />}/>

        {/* Raport X Enterprise */}
        <react_router_dom_1.Route path="tipizate-enterprise/raport-x" element={<RaportXListPage />}/>
        <react_router_dom_1.Route path="tipizate-enterprise/raport-x/new" element={<RaportXEditorPage />}/>
        <react_router_dom_1.Route path="tipizate-enterprise/raport-x/:id" element={<RaportXEditorPage />}/>

        {/* Raport Z Enterprise */}
        <react_router_dom_1.Route path="tipizate-enterprise/raport-z" element={<RaportZListPage />}/>
        <react_router_dom_1.Route path="tipizate-enterprise/raport-z/new" element={<RaportZEditorPage />}/>
        <react_router_dom_1.Route path="tipizate-enterprise/raport-z/:id" element={<RaportZEditorPage />}/>

        {/* Raport Lunar Enterprise */}
        <react_router_dom_1.Route path="tipizate-enterprise/raport-lunar" element={<RaportLunarListPage />}/>
        <react_router_dom_1.Route path="tipizate-enterprise/raport-lunar/new" element={<RaportLunarEditorPage />}/>
        <react_router_dom_1.Route path="tipizate-enterprise/raport-lunar/:id" element={<RaportLunarEditorPage />}/>

        {/* Aviz Enterprise */}
        <react_router_dom_1.Route path="tipizate-enterprise/aviz" element={<AvizListPage />}/>
        <react_router_dom_1.Route path="tipizate-enterprise/aviz/new" element={<AvizEditorPage />}/>
        <react_router_dom_1.Route path="tipizate-enterprise/aviz/:id" element={<AvizEditorPage />}/>

        {/* Proces Verbal Enterprise */}
        <react_router_dom_1.Route path="tipizate-enterprise/proces-verbal" element={<ProcesVerbalListPage />}/>
        <react_router_dom_1.Route path="tipizate-enterprise/proces-verbal/new" element={<ProcesVerbalEditorPage />}/>
        <react_router_dom_1.Route path="tipizate-enterprise/proces-verbal/:id" element={<ProcesVerbalEditorPage />}/>

        {/* Retur Enterprise */}
        <react_router_dom_1.Route path="tipizate-enterprise/retur" element={<ReturListPage />}/>
        <react_router_dom_1.Route path="tipizate-enterprise/retur/new" element={<ReturEditorPage />}/>
        <react_router_dom_1.Route path="tipizate-enterprise/retur/:id" element={<ReturEditorPage />}/>

        {/* ------------------------------------------------------------------ */}
        {/* LEGACY ROUTES (PHASE S3)                                          */}
        {/* Păstrate DOAR ca fallback / referință.                             */}
        {/* Vor fi înlocuite în S4/S5 cu UI enterprise pentru tipizate & POS.  */}
        {/* ------------------------------------------------------------------ */}

        {/* LEGACY_ROUTE - PHASE S3: Invoices (legacy component) */}
        <react_router_dom_1.Route path="invoices" element={<InvoicesListPage_1.default />}/>
        {/* PHASE S11 - e-Factura UBL (ANAF) + UI React */}
        <react_router_dom_1.Route path="efactura" element={<LazyRoute component={EFacturaDashboardPage}/>}/>
        <react_router_dom_1.Route path="efactura/:id" element={<LazyRoute component={EFacturaDetailsPage}/>}/>
        {/* PHASE S12 - POS React Unificat + Plăți Enterprise */}
        <react_router_dom_1.Route path="pos" element={<PosPage_1.PosPage />}/>
        <react_router_dom_1.Route path="invoices/:id" element={<InvoiceDetailsPage_1.default />}/>

        {/* LEGACY_ROUTE - PHASE S3: POS (legacy component) */}
        <react_router_dom_1.Route path="pos/:orderId" element={<PosPage_1.PosPage />}/>

        {/* LEGACY_ROUTE - PHASE S3: Tipizate (redirected to admin-advanced or tipizate-enterprise) */}
        <react_router_dom_1.Route path="tipizate" element={<react_router_dom_1.Navigate to="/admin-advanced/inventory" replace/>}/>
        <react_router_dom_1.Route path="tipizate/nir" element={<react_router_dom_1.Navigate to="/admin-advanced/inventory" replace/>}/>
        <react_router_dom_1.Route path="tipizate/bon-consum" element={<react_router_dom_1.Navigate to="/tipizate-enterprise/bon-consum" replace/>}/>
        <react_router_dom_1.Route path="tipizate/avize" element={<react_router_dom_1.Navigate to="/tipizate-enterprise/aviz" replace/>}/>
        <react_router_dom_1.Route path="tipizate/chitante" element={<react_router_dom_1.Navigate to="/admin-advanced/fiscal" replace/>}/>
        <react_router_dom_1.Route path="tipizate/registru-casa" element={<react_router_dom_1.Navigate to="/admin-advanced/fiscal" replace/>}/>
        <react_router_dom_1.Route path="tipizate/fisa-magazie" element={<react_router_dom_1.Navigate to="/tipizate-enterprise/raport-gestiune" replace/>}/>
        <react_router_dom_1.Route path="tipizate/raport-gestiune" element={<react_router_dom_1.Navigate to="/tipizate-enterprise/raport-gestiune" replace/>}/>
        <react_router_dom_1.Route path="tipizate/transfer" element={<react_router_dom_1.Navigate to="/admin-advanced/transfers" replace/>}/>
        <react_router_dom_1.Route path="tipizate/inventar" element={<react_router_dom_1.Navigate to="/admin-advanced/multi-inventory" replace/>}/>
      </react_router_dom_1.Route>

      {/* Redirect pentru rute necunoscute - dar NU pentru /kiosk/* (deja procesat mai sus) */}
      <react_router_dom_1.Route path="*" element={<react_router_dom_1.Navigate to="/dashboard" replace/>}/>
    </react_router_dom_1.Routes>);
};
// Wrap App with ErrorBoundary for global error handling
var AppWithErrorBoundary = function () { return (<ErrorBoundary_1.default>
    <App />
  </ErrorBoundary_1.default>); };
exports.default = AppWithErrorBoundary;
