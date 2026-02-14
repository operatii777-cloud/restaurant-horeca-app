import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppLayout } from "@/modules/layout/AppLayout";
import { RedirectWithParams } from "@/components/RedirectWithParams";
import { LegacyRedirect } from "@/components/LegacyRedirect";
import ErrorBoundary from "@/components/ErrorBoundary";

// Critical pages - loaded immediately (dashboard, login, etc.)
import { WelcomePage } from "@/modules/welcome/pages/WelcomePage";
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { InternalMessagingPage } from "@/modules/internal-messaging/pages/InternalMessagingPage";
import { BackupPage } from "@/modules/backup/pages/BackupPage";
import { MenuManagementPage } from "@/modules/menu/pages/MenuManagementPage";
import { RecipesPage } from "@/modules/recipes/pages/RecipesPage";
// Reservations redirects to admin.html - using legacy component
// import { ReservationsPage } from "@/modules/reservations/pages/ReservationsPage";
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
// LEGACY - PHASE S3: Stocks NIR (legacy component) - REMOVED, using tipizate-enterprise instead
// import NirListPageLegacy from "@/modules/stocks/nir/pages/NirListPage";
// import NirCreatePage from "@/modules/stocks/nir/pages/NirCreatePage";
// import NirDetailsPage from "@/modules/stocks/nir/pages/NirDetailsPage";
// import ConsumeListPage from "@/modules/stocks/consume/pages/ConsumeListPage";
// import ConsumeCreatePage from "@/modules/stocks/consume/pages/ConsumeCreatePage";
// import ConsumeDetailsPage from "@/modules/stocks/consume/pages/ConsumeDetailsPage";
import InventoryListPage from "@/modules/stocks/inventory/pages/InventoryListPage";
import InventoryCreatePage from "@/modules/stocks/inventory/pages/InventoryCreatePage";
import InventoryDetailsPage from "@/modules/stocks/inventory/pages/InventoryDetailsPage";
import InventoryDashboardPage from "@/modules/stocks/inventory/pages/InventoryDashboardPage";
import { InventoryImportPage } from "@/modules/stocks/inventory/pages/InventoryImportPage";
import ManageOrdersPage from "@/modules/orders/manage/ManageOrdersPage";
// LEGACY - PHASE S3: Stocks Transfer (legacy component) - REMOVED, using tipizate-enterprise instead
// import TransferListPageLegacy from "@/modules/stocks/transfer/pages/TransferListPage";
// import TransferCreatePage from "@/modules/stocks/transfer/pages/TransferCreatePage";
// import TransferDetailsPage from "@/modules/stocks/transfer/pages/TransferDetailsPage";
import VatRatesPage from "@/modules/settings/vat/VatRatesPage";
import { SettingsPage } from "@/modules/settings/pages/SettingsPage";
import InvoicesListPage from "@/modules/invoices/InvoicesListPage";
import InvoiceDetailsPage from "@/modules/invoices/InvoiceDetailsPage";
import QueueMonitorPage from "@/modules/queue-monitor/pages/QueueMonitorPage";
// PHASE S12 - POS React Unificat + Plăți Enterprise
import { PosPage } from "@/modules/pos/pages/PosPage";
// PHASE S5.5 - Legacy Tipizate imports removed, using redirects to tipizate-enterprise

// PHASE S4.3 - Tipizate Enterprise (NEW) - LAZY LOADED (see lazy imports below)
import ProductionBatchesListPage from "@/modules/production/pages/ProductionBatchesListPage";
import ProductionBatchEditorPage from "@/modules/production/pages/ProductionBatchEditorPage";
import { LocationsPage } from "@/modules/settings/pages/LocationsPage";
import { AreasPage } from "@/modules/settings/pages/AreasPage";
import { TablesPage } from "@/modules/settings/pages/TablesPage";
// FAZA 1.5 - SAF-T Export
import { SaftExportPage } from "@/modules/saft/pages/SaftExportPage";
// SAGA Export
import { SagaExportPage } from "@/modules/saga-export/pages/SagaExportPage";
// Portion Control și Variance Reporting - disponibile doar în Admin Advanced
import { UnitsOfMeasurePage } from "@/modules/nomenclator/units/pages/UnitsOfMeasurePage";
import { PriceUtilitiesPage } from "@/modules/nomenclator/prices/pages/PriceUtilitiesPage";
import { AttributeGroupsPage } from "@/modules/nomenclator/attributes/pages/AttributeGroupsPage";
// Happy Hour redirects to admin-advanced.html - no longer using React component
// import { HappyHourPage } from "@/modules/promotions/happy-hour/pages/HappyHourPage";
import { MarketingPage } from "@/modules/marketing/pages/MarketingPage";
import { FeedbackPage } from "@/modules/marketing/feedback/pages/FeedbackPage";
import { ExecutiveDashboardPage } from "@/modules/stocks/dashboard/executive/pages/ExecutiveDashboardPage";
import { AdvancedStockDashboardPage } from "@/modules/stocks/dashboard/pages/AdvancedStockDashboardPage";
import { AdvancedReportsPage } from "@/modules/reports/advanced/pages/AdvancedReportsPage";
import { AuditLogsPage as AuditLogsPageComponent } from "@/modules/audit/logs/pages/AuditLogsPage";
// StockPredictionPage - LAZY LOADED (see lazy imports below)
import { AllergensPage } from "@/modules/stocks/allergens/pages/AllergensPage";
import { LabelsPage } from "@/modules/stocks/labels/pages/LabelsPage";
import { WastePage } from "@/modules/stocks/waste/pages/WastePage";
import { SuppliersPage } from "@/modules/stocks/suppliers/pages/SuppliersPage";
import { SupplierOrdersPage } from "@/modules/stocks/suppliers/orders/pages/SupplierOrdersPage";
import { MultiInventoryPage } from "@/modules/stocks/inventory/multi/pages/MultiInventoryPage";
import { CancellationsPage } from "@/modules/orders/cancellations/pages/CancellationsPage";
import { DeliveryOrdersPage } from "@/modules/orders/delivery/pages/DeliveryOrdersPage";
// S17.H - Delivery KPI Dashboard
import { DeliveryKpiDashboardPage } from "@/modules/delivery/dashboard/pages/DeliveryKpiDashboardPage";
import { OrdersHistoryPage } from "@/modules/orders/history/pages/OrdersHistoryPage";
import { DriveThruOrdersPage } from "@/modules/orders/drivethru/pages/DriveThruOrdersPage";
import { TakeawayOrdersPage } from "@/modules/orders/takeaway/pages/TakeawayOrdersPage";
// Reports, Profitability, Audit - LAZY LOADED (see lazy imports below)
import RecipeScalingPage from "@/modules/recipes/pages/RecipeScalingPage";
import { ArchivePage } from "@/modules/archive/pages/ArchivePage";
import { VouchersPage } from "@/modules/marketing/vouchers/pages/VouchersPage";
import { RiskAlertsPage } from "@/modules/stocks/risk-alerts/pages/RiskAlertsPage";
import { DailyOfferPage } from "@/modules/promotions/daily-offer/pages/DailyOfferPage";
import { LoyaltyPage } from "@/modules/marketing/loyalty/pages/LoyaltyPage";
import { MonitoringPage } from "@/modules/dashboard/monitoring/pages/MonitoringPage";
import { DocumentationPage } from "@/modules/docs/pages/DocumentationPage";
// Executive Dashboard, Monitoring, Platform Sync (NEW)
import { ExecutiveDashboardPage as NewExecutiveDashboardPage } from "@/modules/executive-dashboard/pages/ExecutiveDashboardPage";
import { MonitoringDashboardPage } from "@/modules/monitoring/pages/MonitoringDashboardPage";
import { PlatformSyncPage } from "@/modules/external-delivery/pages/PlatformSyncPage";
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
import { ManualInstructiuniPage } from "@/modules/settings/pages/ManualInstructiuniPage";

// Lazy loaded pages (loaded on demand to reduce initial bundle size)
// Tipizate Enterprise
const KioskTransferIframePage = lazy(() => import('@/modules/tipizate-enterprise/pages/KioskTransferIframePage'));
// Kiosk - Lazy loaded (mare modul)
const KioskLayout = lazy(() => import('@/modules/kiosk/layout/KioskLayout').then(m => ({ default: m.KioskLayout })));
const KioskMainLayout = lazy(() => import('@/modules/kiosk/layout/KioskMainLayout').then(m => ({ default: m.KioskMainLayout })));
const KioskLoginPage = lazy(() => import('@/modules/kiosk/pages/KioskLoginPage').then(m => ({ default: m.KioskLoginPage })));
const KioskDashboardPage = lazy(() => import('@/modules/kiosk/pages/KioskDashboardPage').then(m => ({ default: m.KioskDashboardPage })));
const KioskTablesPage = lazy(() => import('@/modules/kiosk/pages/KioskTablesPage').then(m => ({ default: m.KioskTablesPage })));
const KioskTablesPage2D = lazy(() => import('@/modules/kiosk/pages/KioskTablesPage2D').then(m => ({ default: m.KioskTablesPage2D })));
const KioskOrderPage = lazy(() => import('@/modules/kiosk/pages/KioskOrderPage').then(m => ({ default: m.KioskOrderPage })));
const KioskFastSalePage = lazy(() => import('@/modules/kiosk/pages/KioskFastSalePage').then(m => ({ default: m.KioskFastSalePage })));
const KioskStaffLiveReportPage = lazy(() => import('@/modules/kiosk/pages/KioskStaffLiveReportPage').then(m => ({ default: m.KioskStaffLiveReportPage })));
// Noi pagini KIOSK (Gemini Features) - Lazy loaded
const KioskEventsPage = lazy(() => import('@/modules/kiosk/pages/KioskEventsPage').then(m => ({ default: m.KioskEventsPage })));
const KioskShiftHandoverPage = lazy(() => import('@/modules/kiosk/pages/KioskShiftHandoverPage').then(m => ({ default: m.KioskShiftHandoverPage })));
const KioskMenuBoardPage = lazy(() => import('@/modules/kiosk/pages/KioskMenuBoardPage').then(m => ({ default: m.KioskMenuBoardPage })));
import { CompliancePage } from "@/modules/compliance/pages/CompliancePage";
import { HACCPDashboardPage } from "@/modules/compliance/pages/HACCPDashboardPage";
import { HACCPProcessesPage } from "@/modules/compliance/pages/HACCPProcessesPage";
import { HACCPMonitoringPage } from "@/modules/compliance/pages/HACCPMonitoringPage";
import { HACCPCorrectiveActionsPage } from "@/modules/compliance/pages/HACCPCorrectiveActionsPage";
// Enterprise Pages (30 Nov 2025) - Lazy loaded
const SmartRestockPage = lazy(() => import('@/modules/enterprise/pages/SmartRestockPage').then(m => ({ default: m.SmartRestockPage })));
const WeatherForecastPage = lazy(() => import('@/modules/enterprise/pages/WeatherForecastPage').then(m => ({ default: m.WeatherForecastPage })));
const CompetitorTrackingPage = lazy(() => import('@/modules/enterprise/pages/CompetitorTrackingPage').then(m => ({ default: m.CompetitorTrackingPage })));
const MenuEngineeringPage = lazy(() => import('@/modules/enterprise/pages/MenuEngineeringPage').then(m => ({ default: m.MenuEngineeringPage })));
// S14 - Profitability Module (PRO Version) - Lazy loaded
const FoodCostDashboardPage = lazy(() => import('@/modules/profitability/pages/FoodCostDashboardPage').then(m => ({ default: m.FoodCostDashboardPage })));
const GiftCardsPage = lazy(() => import('@/modules/enterprise/pages/GiftCardsPage').then(m => ({ default: m.GiftCardsPage })));
const EmployeeSchedulingPage = lazy(() => import('@/modules/enterprise/pages/EmployeeSchedulingPage').then(m => ({ default: m.EmployeeSchedulingPage })));
const AutoPurchaseOrdersPage = lazy(() => import('@/modules/enterprise/pages/AutoPurchaseOrdersPage').then(m => ({ default: m.AutoPurchaseOrdersPage })));
const HostessMapPage = lazy(() => import('@/modules/enterprise/pages/HostessMapPage').then(m => ({ default: m.HostessMapPage })));
const CoatroomPage = lazy(() => import('@/modules/enterprise/pages/CoatroomPage').then(m => ({ default: m.CoatroomPage })));
const LostFoundPage = lazy(() => import('@/modules/enterprise/pages/LostFoundPage').then(m => ({ default: m.LostFoundPage })));
const HostessReportPage = lazy(() => import('@/modules/reports/hostess/pages/HostessReportPage').then(m => ({ default: m.HostessReportPage })));
const CoatroomReportPage = lazy(() => import('@/modules/reports/coatroom/pages/CoatroomReportPage').then(m => ({ default: m.CoatroomReportPage })));
const LostFoundReportPage = lazy(() => import('@/modules/reports/lostfound/pages/LostFoundReportPage').then(m => ({ default: m.LostFoundReportPage })));
const HostessDashboardPage = lazy(() => import('@/modules/dashboards/hostess/pages/HostessDashboardPage').then(m => ({ default: m.HostessDashboardPage })));
const CoatroomDashboardPage = lazy(() => import('@/modules/dashboards/coatroom/pages/CoatroomDashboardPage').then(m => ({ default: m.CoatroomDashboardPage })));
const LostFoundDashboardPage = lazy(() => import('@/modules/dashboards/lostfound/pages/LostFoundDashboardPage').then(m => ({ default: m.LostFoundDashboardPage })));
const PlatformStatsDashboardPage = lazy(() => import('@/modules/platform-stats/pages/PlatformStatsDashboardPage').then(m => ({ default: m.PlatformStatsDashboardPage })));

// Call Center (Simulated) - Lazy loaded
const CallCenterSimulatorPage = lazy(() => import('@/modules/call-center/pages/CallCenterSimulatorPage'));

// Enterprise Rebuild (03 Dec 2025) - Lazy loaded
const TechnicalSheetsPage = lazy(() => import('@/modules/technical-sheets/pages/TechnicalSheetsPage').then(m => ({ default: m.TechnicalSheetsPage })));
const PortionsPage = lazy(() => import('@/modules/portions/pages/PortionsPage').then(m => ({ default: m.PortionsPage })));
const RecallsPage = lazy(() => import('@/modules/recalls/pages/RecallsPage').then(m => ({ default: m.RecallsPage })));
const ExpiryAlertsPage = lazy(() => import('@/modules/expiry/pages/ExpiryAlertsPage').then(m => ({ default: m.ExpiryAlertsPage })));
const VarianceReportsPage = lazy(() => import('@/modules/variance/pages/VarianceReportsPage').then(m => ({ default: m.VarianceReportsPage })));
// Menu Builder (04 Dec 2025) - CRITICAL FEATURE - Lazy loaded
const MenuBuilderPage = lazy(() => import('@/modules/menu-builder/pages/MenuBuilderPage').then(m => ({ default: m.MenuBuilderPage })));
// Admin Diagnostics (07 Dec 2025) - Lazy loaded
const AdminDiagnosticsPage = lazy(() => import('@/modules/admin/pages/AdminDiagnosticsPage').then(m => ({ default: m.AdminDiagnosticsPage })));
// KIOSK Cook Mode - Lazy loaded
const KioskCookModePage = lazy(() => import('@/modules/kiosk/pages/KioskCookModePage').then(m => ({ default: m.KioskCookModePage })));
// KIOSK New Pages (04 Dec 2025) - Sprint Operational - Lazy loaded
const KioskPontajPage = lazy(() => import('@/modules/kiosk/pages/KioskPontajPage').then(m => ({ default: m.KioskPontajPage })));
const KioskScoreboardPage = lazy(() => import('@/modules/kiosk/pages/KioskScoreboardPage').then(m => ({ default: m.KioskScoreboardPage })));
const KioskExpeditorPage = lazy(() => import('@/modules/kiosk/pages/KioskExpeditorPage').then(m => ({ default: m.KioskExpeditorPage })));
// KIOSK Admin Pages (04 Dec 2025) - Lazy loaded
const KioskHQDashboardPage = lazy(() => import('@/modules/kiosk/pages/KioskHQDashboardPage').then(m => ({ default: m.KioskHQDashboardPage })));
const KioskTrainingPage = lazy(() => import('@/modules/kiosk/pages/KioskTrainingPage').then(m => ({ default: m.KioskTrainingPage })));
const TrainingPage = lazy(() => import('@/modules/training/pages/KioskTrainingPage').then(m => ({ default: m.KioskTrainingPage })));
const KioskNetworkHealthPage = lazy(() => import('@/modules/kiosk/pages/KioskNetworkHealthPage').then(m => ({ default: m.KioskNetworkHealthPage })));
// KIOSK Display Pages (04 Dec 2025) - Lazy loaded
const KioskSelfServicePage = lazy(() => import('@/modules/kiosk/pages/KioskSelfServicePage').then(m => ({ default: m.KioskSelfServicePage })));
const KioskQROrderingPage = lazy(() => import('@/modules/kiosk/pages/KioskQROrderingPage').then(m => ({ default: m.KioskQROrderingPage })));
const KioskFeedbackTerminalPage = lazy(() => import('@/modules/kiosk/pages/KioskFeedbackTerminalPage').then(m => ({ default: m.KioskFeedbackTerminalPage })));
const KioskCustomerDisplayPage = lazy(() => import('@/modules/kiosk/pages/KioskCustomerDisplayPage').then(m => ({ default: m.KioskCustomerDisplayPage })));
// KIOSK Front Desk Pages (04 Dec 2025) - Lazy loaded
const KioskCoatCheckPage = lazy(() => import('@/modules/kiosk/pages/KioskCoatCheckPage').then(m => ({ default: m.KioskCoatCheckPage })));
const KioskLostFoundPage = lazy(() => import('@/modules/kiosk/pages/KioskLostFoundPage').then(m => ({ default: m.KioskLostFoundPage })));
const KioskHostessMapPage = lazy(() => import('@/modules/kiosk/pages/KioskHostessMapPage').then(m => ({ default: m.KioskHostessMapPage })));
const KioskClientMonitorPage = lazy(() => import('@/modules/kiosk/pages/KioskClientMonitorPage').then(m => ({ default: m.KioskClientMonitorPage })));
const KioskLaundryPage = lazy(() => import('@/modules/kiosk/pages/KioskLaundryPage').then(m => ({ default: m.KioskLaundryPage })));
const KioskWidgetPage = lazy(() => import('@/modules/kiosk/pages/KioskWidgetPage').then(m => ({ default: m.KioskWidgetPage })));
// KioskPOSSplitPage - folosește default export cu error handling
const KioskPOSSplitPage = lazy(() =>
  import('@/modules/kiosk/pages/KioskPOSSplitPage')
    .then(m => ({ default: m.default || m.KioskPOSSplitPage }))
    .catch((err) => {
      console.error('Error loading KioskPOSSplitPage:', err);
      return {
        default: () => (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>⚠️ Eroare la încărcarea paginii POS Split</h3>
            <p>Verifică consola pentru detalii</p>
          </div>
        )
      };
    })
);
const KioskPOSSplitWrapper = lazy(() => import('@/modules/kiosk/pages/KioskPOSSplitWrapper'));
// Delivery/Couriers (01 Dec 2025)
import { CouriersPage } from "@/modules/delivery/pages/CouriersPage";
import { DispatchPage } from "@/modules/delivery/pages/DispatchPage";
import { CourierMobileApp } from "@/modules/delivery/pages/CourierMobileApp";
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
// FAZA 2 - Public Ordering Delivery
import { ComandaDeliveryPage } from "@/modules/public-ordering/delivery/pages/ComandaDeliveryPage";
import { TrackOrderPage } from "@/modules/public-ordering/tracking/pages/TrackOrderPage";


// Lazy load large modules - Reports (rarely used, large)
// const AdvancedReportsPage = lazy(() => import('@/modules/reports/advanced/pages/AdvancedReportsPage').then(m => ({ default: m.AdvancedReportsPage })));
const SalesReportsPage = lazy(() => import('@/modules/reports/sales/pages/SalesReportsPage').then(m => ({ default: m.SalesReportsPage })));
const StockReportsPage = lazy(() => import('@/modules/reports/stock/pages/StockReportsPage').then(m => ({ default: m.StockReportsPage })));
const DeliveryPerformanceReportPage = lazy(() => import('@/modules/reports/delivery/pages/DeliveryPerformanceReportPage').then(m => ({ default: m.DeliveryPerformanceReportPage })));
const DriveThruPerformanceReportPage = lazy(() => import('@/modules/reports/drivethru/pages/DriveThruPerformanceReportPage').then(m => ({ default: m.DriveThruPerformanceReportPage })));
const TopProductsPage = lazy(() => import('@/modules/reports/top-products/pages/TopProductsPage').then(m => ({ default: m.TopProductsPage })));
const FinancialReportsPage = lazy(() => import('@/modules/reports/financial/pages/FinancialReportsPage').then(m => ({ default: m.FinancialReportsPage })));
const StaffReportsPage = lazy(() => import('@/modules/reports/staff/pages/StaffReportsPage').then(m => ({ default: m.StaffReportsPage })));
const ABCAnalysisPage = lazy(() => import('@/modules/reports/pages/ABCAnalysisPage').then(m => ({ default: m.ABCAnalysisPage })));
const StockPredictionPage = lazy(() => import('@/modules/reports/stock-prediction/pages/StockPredictionPage').then(m => ({ default: m.StockPredictionPage })));
// PHASE S6.3 - Accounting Reports
const VatReportPage = lazy(() => import('@/modules/accounting/reports/pages/VatReportPage').then(m => ({ default: m.VatReportPage })));
const ClientPaymentsReportPage = lazy(() => import('@/modules/accounting/reports/pages/ClientPaymentsReportPage').then(m => ({ default: m.ClientPaymentsReportPage })));
const SuppliersReportPage = lazy(() => import('@/modules/accounting/reports/pages/SuppliersReportPage').then(m => ({ default: m.SuppliersReportPage })));
const ConsumptionReportPage = lazy(() => import('@/modules/accounting/reports/pages/ConsumptionReportPage').then(m => ({ default: m.ConsumptionReportPage })));
const EntriesByVatReportPage = lazy(() => import('@/modules/accounting/reports/pages/EntriesByVatReportPage').then(m => ({ default: m.EntriesByVatReportPage })));
const StockBalanceReportPage = lazy(() => import('@/modules/accounting/reports/pages/StockBalanceReportPage').then(m => ({ default: m.StockBalanceReportPage })));
const DailyBalanceReportPage = lazy(() => import('@/modules/accounting/reports/pages/DailyBalanceReportPage').then(m => ({ default: m.DailyBalanceReportPage })));
// PHASE S6.3 - Accounting Settings
const AccountingExportPage = lazy(() => import('@/modules/accounting/settings/pages/AccountingExportPage').then(m => ({ default: m.AccountingExportPage })));
const AccountingAccountsPage = lazy(() => import('@/modules/accounting/settings/pages/AccountingAccountsPage').then(m => ({ default: m.AccountingAccountsPage })));
const ProductAccountingMappingPage = lazy(() => import('@/modules/accounting/settings/pages/ProductAccountingMappingPage').then(m => ({ default: m.ProductAccountingMappingPage })));
const AccountingPeriodsPage = lazy(() => import('@/modules/accounting/settings/pages/AccountingPeriodsPage').then(m => ({ default: m.AccountingPeriodsPage })));
const BankAccountsPage = lazy(() => import('@/modules/accounting/settings/pages/BankAccountsPage').then(m => ({ default: m.BankAccountsPage })));
// PHASE S6.3 - Accounting Audit
const DigitalSignaturesPage = lazy(() => import('@/modules/accounting/audit/pages/DigitalSignaturesPage').then(m => ({ default: m.DigitalSignaturesPage })));
const AccountingPermissionsPage = lazy(() => import('@/modules/accounting/settings/pages/AccountingPermissionsPage').then(m => ({ default: m.AccountingPermissionsPage })));

// Lazy load Tipizate Enterprise (large module with many pages)
const NirListPage = lazy(() => import('@/modules/tipizate-enterprise/pages/NirListPage'));
const PrintPreviewPage = lazy(() => import('@/modules/tipizate-enterprise/pages/PrintPreviewPage'));
const NirEditorPage = lazy(() => import('@/modules/tipizate-enterprise/pages/NirEditorPage'));
const BonConsumListPage = lazy(() => import('@/modules/tipizate-enterprise/pages/BonConsumListPage'));
const BonConsumEditorPage = lazy(() => import('@/modules/tipizate-enterprise/pages/BonConsumEditorPage'));
const TransferListPage = lazy(() => import('@/modules/tipizate-enterprise/pages/TransferListPage'));
const TransferEditorPage = lazy(() => import('@/modules/tipizate-enterprise/pages/TransferEditorPage'));
const InventarListPage = lazy(() => import('@/modules/tipizate-enterprise/pages/InventarListPage'));
const KioskInventarIframePage = lazy(() => import('@/modules/tipizate-enterprise/pages/KioskInventarIframePage'));
const InventarEditorPage = lazy(() => import('@/modules/tipizate-enterprise/pages/InventarEditorPage'));
const WasteListPage = lazy(() => import('@/modules/tipizate-enterprise/pages/WasteListPage'));
const WasteEditorPage = lazy(() => import('@/modules/tipizate-enterprise/pages/WasteEditorPage'));
const FacturaListPage = lazy(() => import('@/modules/tipizate-enterprise/pages/FacturaListPage'));
const FacturaEditorPage = lazy(() => import('@/modules/tipizate-enterprise/pages/FacturaEditorPage'));
const ChitantaListPage = lazy(() => import('@/modules/tipizate-enterprise/pages/ChitantaListPage'));
const ChitantaEditorPage = lazy(() => import('@/modules/tipizate-enterprise/pages/ChitantaEditorPage'));
const RegistruCasaListPage = lazy(() => import('@/modules/tipizate-enterprise/pages/RegistruCasaListPage'));
const RegistruCasaEditorPage = lazy(() => import('@/modules/tipizate-enterprise/pages/RegistruCasaEditorPage'));
const RaportGestiuneListPage = lazy(() => import('@/modules/tipizate-enterprise/pages/RaportGestiuneListPage'));
const RaportGestiuneEditorPage = lazy(() => import('@/modules/tipizate-enterprise/pages/RaportGestiuneEditorPage'));
const RaportXListPage = lazy(() => import('@/modules/tipizate-enterprise/pages/RaportXListPage'));
const RaportXEditorPage = lazy(() => import('@/modules/tipizate-enterprise/pages/RaportXEditorPage'));
const RaportZListPage = lazy(() => import('@/modules/tipizate-enterprise/pages/RaportZListPage'));
const RaportZEditorPage = lazy(() => import('@/modules/tipizate-enterprise/pages/RaportZEditorPage'));
const RaportLunarListPage = lazy(() => import('@/modules/tipizate-enterprise/pages/RaportLunarListPage'));
const RaportLunarEditorPage = lazy(() => import('@/modules/tipizate-enterprise/pages/RaportLunarEditorPage'));
const AvizListPage = lazy(() => import('@/modules/tipizate-enterprise/pages/AvizListPage'));
const AvizEditorPage = lazy(() => import('@/modules/tipizate-enterprise/pages/AvizEditorPage'));
const ProcesVerbalListPage = lazy(() => import('@/modules/tipizate-enterprise/pages/ProcesVerbalListPage'));
const ProcesVerbalEditorPage = lazy(() => import('@/modules/tipizate-enterprise/pages/ProcesVerbalEditorPage'));
const ReturListPage = lazy(() => import('@/modules/tipizate-enterprise/pages/ReturListPage'));
const ReturEditorPage = lazy(() => import('@/modules/tipizate-enterprise/pages/ReturEditorPage'));

// Lazy load Profitability (large)
const ProfitLossPage = lazy(() => import('@/modules/profitability/pages/ProfitLossPage').then(m => ({ default: m.ProfitLossPage })));
const CostsPage = lazy(() => import('@/modules/profitability/pages/CostsPage').then(m => ({ default: m.CostsPage })));

// Lazy load Audit (large)
// const AuditLogsPage = lazy(() => import('@/modules/audit/logs/pages/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
const SecurityEventsPage = lazy(() => import('@/modules/audit/security/pages/SecurityEventsPage').then(m => ({ default: m.SecurityEventsPage })));
const LoginHistoryPage = lazy(() => import('@/modules/audit/login-history/pages/LoginHistoryPage').then(m => ({ default: m.LoginHistoryPage })));
const UserActivityPage = lazy(() => import('@/modules/audit/user-activity/pages/UserActivityPage').then(m => ({ default: m.UserActivityPage })));
const SecurityAlertsPage = lazy(() => import('@/modules/audit/alerts/pages/SecurityAlertsPage').then(m => ({ default: m.SecurityAlertsPage })));

// Legacy HTML pages refactored to React - can be imported when needed
import { AdminPage } from '@/modules/admin-legacy/pages/AdminPage';
import { AdminAdvancedPage } from '@/modules/admin-legacy/pages/AdminAdvancedPage';
import { CatalogRetetePage } from '@/modules/catalog-legacy/pages/CatalogRetetePage';
import { CatalogIngredientePage } from '@/modules/catalog-legacy/pages/CatalogIngredientePage';
import { LegacyPagesDemo } from '@/components/LegacyPagesDemo';

// Lazy load ANAF (large)
const CertificateManagerPage = lazy(() => import('@/modules/anaf/pages/CertificateManagerPage').then(m => ({ default: m.CertificateManagerPage })));
const AnafHealthDashboardPage = lazy(() => import('@/modules/anaf/pages/AnafHealthDashboardPage').then(m => ({ default: m.AnafHealthDashboardPage })));
const SubmissionMonitorPage = lazy(() => import('@/modules/anaf/pages/SubmissionMonitorPage').then(m => ({ default: m.SubmissionMonitorPage })));

// Lazy load E-Factura (large)
const EFacturaDashboardPage = lazy(() => import('@/modules/efactura/pages/EFacturaDashboardPage').then(m => ({ default: m.EFacturaDashboardPage })));
const EFacturaDetailsPage = lazy(() => import('@/modules/efactura/pages/EFacturaDetailsPage').then(m => ({ default: m.EFacturaDetailsPage })));

// Lazy load Stocks/Fiscal (large)
const MonthlyReportPage = lazy(() => import('@/modules/stocks/fiscal/pages/MonthlyReportPage').then(m => ({ default: m.MonthlyReportPage })));
const FiscalArchivePage = lazy(() => import('@/modules/stocks/fiscal/pages/FiscalArchivePage').then(m => ({ default: m.FiscalArchivePage })));
const FiscalDocumentsCreatePage = lazy(() => import('@/modules/stocks/fiscal/pages/FiscalDocumentsCreatePage').then(m => ({ default: m.FiscalDocumentsCreatePage })));
const CashRegisterPage = lazy(() => import('@/modules/stocks/fiscal/pages/CashRegisterPage').then(m => ({ default: m.CashRegisterPage })));
const FiscalReportXPage = lazy(() => import('@/modules/stocks/fiscal/pages/FiscalReportXPage').then(m => ({ default: m.FiscalReportXPage })));
const FiscalReportZPage = lazy(() => import('@/modules/stocks/fiscal/pages/FiscalReportZPage').then(m => ({ default: m.FiscalReportZPage })));
const AnafSyncPage = lazy(() => import('@/modules/stocks/fiscal/pages/AnafSyncPage').then(m => ({ default: m.AnafSyncPage })));
const AnafIntegrationPage = lazy(() => import('@/modules/stocks/fiscal/pages/AnafIntegrationPage').then(m => ({ default: m.AnafIntegrationPage })));

const App = () => {
  // PHASE PRODUCTION-READY: Accessible loading fallback
  const LoadingFallback = () => (
    <div
      className="loading-spinner-container"
      role="status"
      aria-live="polite"
      aria-label="Se încarcă conținutul"
    >
      <div className="loading-spinner" aria-hidden="true"></div>
      <span className="sr-only">Se încarcă conținutul</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .loading-spinner {
            animation: none;
          }
        }
      `}</style>
    </div>
  );

  // Helper component pentru lazy loading cu Suspense
  const LazyRoute = ({ component: Component }: { component: React.ComponentType<any> }) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );

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

      {/* FAZA 2 - Public Ordering (No auth required) */}
      <Route path="/public/delivery" element={<ComandaDeliveryPage />} />
      <Route path="/public/track-order" element={<TrackOrderPage />} />

      {/* PHASE S10 - React UI Modules (Display-only, no sidebar) */}
      <Route path="/comanda" element={<OrderPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/kiosk-tables-preview" element={<KioskTablesPreviewPage />} />
      {/* KDS Routes - accessible from both /kds and /admin-vite/kds for compatibility */}
      {/* Note: /kds and /bar work because basename is /admin-vite/, so they resolve to /admin-vite/kds and /admin-vite/bar */}
      <Route path="/kds" element={<KdsPage />} />
      <Route path="/admin-vite/kds" element={<KdsPage />} />
      {/* Bar Routes - accessible from both /bar and /admin-vite/bar for compatibility */}
      <Route path="/bar" element={<BarPage />} />
      <Route path="/admin-vite/bar" element={<BarPage />} />
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
        <Route path="qr-ordering" element={<KioskQROrderingPage />} />
        <Route path="feedback-terminal" element={<KioskFeedbackTerminalPage />} />
        <Route path="customer-display" element={<KioskCustomerDisplayPage />} />
        {/* NEW: Front Desk Pages (04 Dec 2025) */}
        <Route path="coatcheck" element={<KioskCoatCheckPage />} />
        <Route path="lost-found" element={<KioskLostFoundPage />} />
        <Route path="hostess-map" element={<KioskHostessMapPage />} />
        <Route path="client-monitor" element={<KioskClientMonitorPage />} />
        <Route path="widget" element={<KioskWidgetPage />} />
        <Route path="laundry" element={<KioskLaundryPage />} />

        {/* Tipizate Enterprise - Documente interne (admin-vite) */}
        <Route path="tipizate-enterprise/bon-consum" element={<LazyRoute component={BonConsumListPage} />} />
        <Route path="tipizate-enterprise/bon-consum/new" element={<LazyRoute component={BonConsumEditorPage} />} />
        <Route path="tipizate-enterprise/bon-consum/:id" element={<LazyRoute component={BonConsumEditorPage} />} />
        <Route path="tipizate-enterprise/waste" element={<LazyRoute component={WasteListPage} />} />
        <Route path="tipizate-enterprise/waste/new" element={<LazyRoute component={WasteEditorPage} />} />
        <Route path="tipizate-enterprise/waste/:id" element={<LazyRoute component={WasteEditorPage} />} />

        {/* NIR Enterprise KIOSK: Redirect către admin-advanced.html#inventory?iframe=true */}
        <Route path="kiosk/tipizate-enterprise/nir" element={<LegacyRedirect url="/admin-advanced.html#inventory" />} />

        {/* NIR Enterprise */}
        <Route path="tipizate-enterprise/nir" element={<LazyRoute component={NirListPage} />} />
        <Route path="tipizate-enterprise/nir/new" element={<LazyRoute component={NirEditorPage} />} />
        <Route path="tipizate-enterprise/nir/:id" element={<LazyRoute component={NirEditorPage} />} />

        {/* Transfer Enterprise */}
        <Route path="tipizate-enterprise/transfer" element={<LazyRoute component={KioskTransferIframePage} />} />
        <Route path="tipizate-enterprise/transfer/new" element={<LazyRoute component={TransferEditorPage} />} />
        <Route path="tipizate-enterprise/transfer/:id" element={<LazyRoute component={TransferEditorPage} />} />

        {/* Inventar Enterprise */}
        <Route path="tipizate-enterprise/inventar" element={<LazyRoute component={KioskInventarIframePage} />} />
        <Route path="tipizate-enterprise/inventar/new" element={<LazyRoute component={InventarEditorPage} />} />
        <Route path="tipizate-enterprise/inventar/:id" element={<LazyRoute component={InventarEditorPage} />} />

        {/* Factura Enterprise */}
        <Route path="tipizate-enterprise/factura" element={<LazyRoute component={FacturaListPage} />} />
        <Route path="tipizate-enterprise/factura/new" element={<LazyRoute component={FacturaEditorPage} />} />
        <Route path="tipizate-enterprise/factura/:id" element={<LazyRoute component={FacturaEditorPage} />} />

        {/* Chitanta Enterprise */}
        <Route path="tipizate-enterprise/chitanta" element={<LazyRoute component={ChitantaListPage} />} />
        <Route path="tipizate-enterprise/chitanta/new" element={<LazyRoute component={ChitantaEditorPage} />} />
        <Route path="tipizate-enterprise/chitanta/:id" element={<LazyRoute component={ChitantaEditorPage} />} />

        {/* Registru Casa Enterprise */}
        <Route path="tipizate-enterprise/registru-casa" element={<LazyRoute component={RegistruCasaListPage} />} />
        <Route path="tipizate-enterprise/registru-casa/new" element={<LazyRoute component={RegistruCasaEditorPage} />} />
        <Route path="tipizate-enterprise/registru-casa/:id" element={<LazyRoute component={RegistruCasaEditorPage} />} />


        {/* Stocks - Aceeași componentă ca Admin-vite */}
        <Route path="stocks" element={<StockManagementPage />} />
      </Route>

      {/* AdminV4 Routes - folosesc AppLayout */}
      {/* NU folosim path="*" pentru a nu captura /kiosk/* */}
      <Route path="/*" element={<AppLayout />}>
        <Route index element={<Navigate to="/welcome" replace />} />
        <Route path="welcome" element={<WelcomePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="dashboard/monitoring" element={<MonitoringPage />} />
        <Route path="monitoring/performance" element={<MonitoringPage />} />
        <Route path="monitoring/health" element={<MonitoringDashboardPage />} />
        <Route path="monitoring/dashboard" element={<MonitoringDashboardPage />} />
        <Route path="executive-dashboard" element={<NewExecutiveDashboardPage />} />
        <Route path="platform-sync" element={<PlatformSyncPage />} />
        <Route path="external-delivery/sync" element={<PlatformSyncPage />} />
        <Route path="internal-messaging" element={<InternalMessagingPage />} />
        
        {/* Legacy HTML pages refactored to React - importable when needed */}
        <Route path="legacy/admin" element={<AdminPage />} />
        <Route path="legacy/admin-advanced" element={<AdminAdvancedPage />} />
        <Route path="legacy/catalog-retete" element={<CatalogRetetePage />} />
        <Route path="legacy/catalog-ingrediente" element={<CatalogIngredientePage />} />
        
        {/* Demo page showing how to use legacy components */}
        <Route path="legacy/demo" element={<LegacyPagesDemo />} />
        
        <Route path="menu" element={<MenuManagementPage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="catalog/online" element={<CatalogOnlinePage />} />
        <Route path="ingredients" element={<StockManagementPage />} />
        <Route path="stocks" element={<StockManagementPage />} />
        {/* PHASE S5.5 - Legacy Stocks Routes → Redirect to Admin Advanced */}
        <Route path="stocks/nir" element={<Navigate to="/admin-advanced/inventory" replace />} />
        <Route path="stocks/nir/*" element={<Navigate to="/admin-advanced/inventory" replace />} />
        <Route path="stocks/consume" element={<Navigate to="/tipizate-enterprise/bon-consum" replace />} />
        <Route path="stocks/consume/new" element={<Navigate to="/tipizate-enterprise/bon-consum/new" replace />} />
        <Route path="stocks/consume/:id" element={<RedirectWithParams to={(p) => `/tipizate-enterprise/bon-consum/${p.id}`} />} />
        <Route path="stocks/inventory" element={<Navigate to="/admin-advanced/multi-inventory" replace />} />
        <Route path="stocks/inventory/new" element={<Navigate to="/admin-advanced/multi-inventory" replace />} />
        {/* Inventory Dashboard & Multi-Inventory remain (separate functionality) */}
        <Route path="stocks/inventory/:id" element={<InventoryDetailsPage />} />
        <Route path="stocks/inventory/dashboard" element={<InventoryDashboardPage />} />
        <Route path="stocks/inventory/multi" element={<MultiInventoryPage />} />
        <Route path="stocks/inventory/import" element={<InventoryImportPage />} />
        <Route path="stocks/allergens" element={<AllergensPage />} />
        <Route path="stocks/labels" element={<LabelsPage />} />
        {/* PHASE S5.5 - Legacy Waste Route → Redirect to Tipizate Enterprise */}
        <Route path="stocks/waste" element={<Navigate to="/tipizate-enterprise/waste" replace />} />
        <Route path="stocks/costs" element={<CostsPage />} />
        <Route path="stocks/retur" element={<Navigate to="/tipizate-enterprise/retur" replace />} />
        <Route path="stocks/risk-alerts" element={<RiskAlertsPage />} />
        <Route path="stocks/suppliers" element={<SuppliersPage />} />
        <Route path="stocks/suppliers/orders" element={<SupplierOrdersPage />} />
        <Route path="orders/manage" element={<ManageOrdersPage />} />
        {/* PHASE S5.5 - Legacy Transfer Routes → Redirect to Admin Advanced */}
        <Route path="stocks/transfer" element={<Navigate to="/admin-advanced/transfers" replace />} />
        <Route path="stocks/transfer/*" element={<Navigate to="/admin-advanced/transfers" replace />} />
        {/* PHASE S5.5 - Legacy Waste Route → Redirect to Tipizate Enterprise */}
        <Route path="stocks/waste" element={<Navigate to="/tipizate-enterprise/waste" replace />} />
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
        <Route path="delivery/kpi" element={<DeliveryKpiDashboardPage />} />
        <Route path="recipes" element={<RecipesPage />} />
        <Route path="reservations" element={<LegacyRedirect url="/admin.html#reservations" />} />
        <Route path="daily-menu" element={<DailyMenuPage />} />
        <Route path="lots" element={<LotsPage />} />
        <Route path="traceability" element={<TraceabilityPage />} />
        <Route path="backup" element={<BackupPage />} />
        <Route path="menu-pdf" element={<MenuPDFBuilderPage />} />
        <Route path="waiters" element={<WaitersPage />} />
        <Route path="queue-monitor" element={<QueueMonitorPage />} />
        {/* Queue Monitor direct route - priority over admin-advanced */}
        <Route path="admin-advanced/queue-monitor" element={<QueueMonitorPage />} />
        <Route path="compliance" element={<CompliancePage />} />
        <Route path="compliance/haccp" element={<HACCPDashboardPage />} />
        <Route path="compliance/haccp/processes" element={<HACCPProcessesPage />} />
        <Route path="compliance/haccp/monitoring" element={<HACCPMonitoringPage />} />
        <Route path="compliance/haccp/corrective-actions" element={<HACCPCorrectiveActionsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="tables" element={<TablesPage />} />
        <Route path="profitability" element={<LazyRoute component={ProfitLossPage} />} />
        <Route path="training" element={<TrainingPage />} />
        <Route path="production/batches" element={<ProductionBatchesListPage />} />
        <Route path="production/batches/:id" element={<ProductionBatchEditorPage />} />
        <Route path="reports" element={<AdvancedReportsPage />} />
        <Route path="reports/profit-loss" element={<LazyRoute component={ProfitLossPage} />} />
        <Route path="reports/abc-analysis" element={<LazyRoute component={ABCAnalysisPage} />} />
        <Route path="reports/staff" element={<LazyRoute component={StaffReportsPage} />} />
        <Route path="reports/advanced" element={<LazyRoute component={AdvancedReportsPage} />} />
        <Route path="reports/sales" element={<LazyRoute component={SalesReportsPage} />} />
        <Route path="reports/stock" element={<LazyRoute component={StockReportsPage} />} />
        <Route path="reports/delivery-performance" element={<LazyRoute component={DeliveryPerformanceReportPage} />} />
        <Route path="reports/drive-thru-performance" element={<LazyRoute component={DriveThruPerformanceReportPage} />} />
        <Route path="archive" element={<ArchivePage />} />
        <Route path="reports/top-products" element={<LazyRoute component={TopProductsPage} />} />
        <Route path="reports/financial" element={<LazyRoute component={FinancialReportsPage} />} />
        {/* PHASE S6.3 - Accounting Reports */}
        <Route path="accounting/reports/vat" element={<LazyRoute component={VatReportPage} />} />
        <Route path="accounting/reports/client-payments" element={<LazyRoute component={ClientPaymentsReportPage} />} />
        <Route path="accounting/reports/suppliers" element={<LazyRoute component={SuppliersReportPage} />} />
        <Route path="accounting/reports/consumption" element={<LazyRoute component={ConsumptionReportPage} />} />
        <Route path="accounting/reports/entries" element={<LazyRoute component={EntriesByVatReportPage} />} />
        <Route path="accounting/reports/stock-balance" element={<LazyRoute component={StockBalanceReportPage} />} />
        <Route path="accounting/reports/daily-balance" element={<LazyRoute component={DailyBalanceReportPage} />} />
        {/* PHASE S6.3 - Accounting Settings */}
        <Route path="accounting/settings/export" element={<LazyRoute component={AccountingExportPage} />} />
        <Route path="accounting/settings/accounts" element={<LazyRoute component={AccountingAccountsPage} />} />
        <Route path="accounting/settings/product-mapping" element={<LazyRoute component={ProductAccountingMappingPage} />} />
        <Route path="accounting/settings/periods" element={<LazyRoute component={AccountingPeriodsPage} />} />
        <Route path="accounting/settings/bank-accounts" element={<LazyRoute component={BankAccountsPage} />} />
        <Route path="accounting/settings/permissions" element={<LazyRoute component={AccountingPermissionsPage} />} />
        {/* PHASE S6.3 - Accounting Audit */}
        <Route path="accounting/audit/signatures" element={<LazyRoute component={DigitalSignaturesPage} />} />
        <Route path="settings/locations" element={<LocationsPage />} />

        {/* Admin Advanced Routes - Legacy HTML Redirect */}
        <Route path="admin-advanced/dashboard" element={<LegacyRedirect url="/admin-advanced.html#dashboard" />} />
        <Route path="admin-advanced/queue-monitor" element={<LegacyRedirect url="/admin-advanced.html#queue-monitor" />} />
        <Route path="admin-advanced/inventory" element={<LegacyRedirect url="/admin-advanced.html#inventory" />} />
        <Route path="admin-advanced/transfers" element={<LegacyRedirect url="/admin-advanced.html#transfers" />} />
        <Route path="admin-advanced/multi-inventory" element={<LegacyRedirect url="/admin-advanced.html#multi-inventory" />} />
        <Route path="admin-advanced/portion-control" element={<LegacyRedirect url="/admin-advanced.html#portion-control" />} />
        <Route path="admin-advanced/variance-reporting" element={<LegacyRedirect url="/admin-advanced.html#variance-reporting" />} />
        <Route path="admin-advanced/executive-dashboard" element={<LegacyRedirect url="/admin-advanced.html#executive-dashboard" />} />
        <Route path="admin-advanced/reports" element={<LegacyRedirect url="/admin-advanced.html#reports" />} />
        <Route path="admin-advanced/marketing" element={<LegacyRedirect url="/admin-advanced.html#marketing" />} />
        <Route path="admin-advanced/happy-hour" element={<LegacyRedirect url="/admin-advanced.html#happy-hour" />} />
        <Route path="admin-advanced/fiscal" element={<LegacyRedirect url="/admin-advanced.html#fiscal" />} />
        <Route path="admin-advanced/risk-alerts" element={<LegacyRedirect url="/admin-advanced.html#risk-alerts" />} />
        <Route path="admin-advanced/restaurant-config" element={<LegacyRedirect url="/admin-advanced.html#restaurant-config" />} />
        <Route path="admin-advanced/feedback" element={<LegacyRedirect url="/admin-advanced.html#feedback" />} />
        <Route path="settings/areas" element={<AreasPage />} />
        <Route path="settings/tables" element={<TablesPage />} />
        <Route path="settings/product-display" element={<ProductDisplayPage />} />
        <Route path="settings/missing-translations" element={<MissingTranslationsPage />} />
        <Route path="settings/payment-methods" element={<PaymentMethodsPage />} />
        <Route path="settings/vat" element={<VatRatesPage />} />
        <Route path="settings/schedule" element={<SchedulePage />} />
        <Route path="settings/users" element={<UsersPage />} />
        <Route path="settings/printers" element={<PrintersPage />} />
        <Route path="settings/notifications" element={<NotificationsPage />} />
        <Route path="settings/localization" element={<LocalizationPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="settings/ui-customization" element={<UICustomizationPage />} />
        <Route path="settings/import-export" element={<ImportExportPage />} />
        <Route path="settings/branding" element={<BrandingPage />} />
        <Route path="settings/manual-instructiuni" element={<ManualInstructiuniPage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="export" element={<ExportPage />} />
        <Route path="stocks/fiscal/reports/monthly" element={<LazyRoute component={MonthlyReportPage} />} />
        <Route path="stocks/fiscal/archive" element={<LazyRoute component={FiscalArchivePage} />} />
        <Route path="stocks/fiscal/documents/create" element={<LazyRoute component={FiscalDocumentsCreatePage} />} />
        <Route path="stocks/fiscal/cash-register" element={<LazyRoute component={CashRegisterPage} />} />
        <Route path="stocks/fiscal/reports/x" element={<LazyRoute component={FiscalReportXPage} />} />
        <Route path="stocks/fiscal/reports/z" element={<LazyRoute component={FiscalReportZPage} />} />
        <Route path="stocks/fiscal/sync" element={<LazyRoute component={AnafSyncPage} />} />
        <Route path="stocks/fiscal/anaf-integration" element={<LazyRoute component={AnafIntegrationPage} />} />
        {/* FAZA 1 - ANAF Management */}
        <Route path="anaf/certificate" element={<LazyRoute component={CertificateManagerPage} />} />
        <Route path="anaf/health" element={<LazyRoute component={AnafHealthDashboardPage} />} />
        {/* FAZA 1 - ANAF Certificate & Health Management */}
        <Route path="anaf/submissions" element={<LazyRoute component={SubmissionMonitorPage} />} />
        {/* FAZA 1.5 - SAF-T Export */}
        <Route path="anaf/saft-export" element={<SaftExportPage />} />
        {/* SAGA Export */}
        <Route path="saga/export" element={<SagaExportPage />} />
        {/* Portion Control și Variance - disponibile în Admin Advanced */}
        <Route path="nomenclator/units" element={<UnitsOfMeasurePage />} />
        <Route path="catalog/prices" element={<PriceUtilitiesPage />} />
        <Route path="catalog/attributes" element={<AttributeGroupsPage />} />
        <Route path="promotions/happy-hour" element={<LegacyRedirect url="/admin-advanced.html#happy-hour" />} />
        <Route path="promotions/daily-offer" element={<DailyOfferPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="marketing/feedback" element={<FeedbackPage />} />
        <Route path="marketing/vouchers" element={<VouchersPage />} />
        <Route path="marketing/loyalty" element={<LoyaltyPage />} />

        {/* Call Center Simulator */}
        <Route path="call-center-simulator" element={<LazyRoute component={CallCenterSimulatorPage} />} />

        <Route path="marketing/reservations-new" element={<ReservationsPage />} />
        <Route path="stocks/dashboard/executive" element={<ExecutiveDashboardPage />} />
        <Route path="stocks/dashboard/advanced" element={<AdvancedStockDashboardPage />} />
        <Route path="reports/stock-prediction" element={<LazyRoute component={StockPredictionPage} />} />
        <Route path="audit/logs" element={<AuditLogsPageComponent />} />
        <Route path="audit/security" element={<LazyRoute component={SecurityEventsPage} />} />
        <Route path="audit/login-history" element={<LazyRoute component={LoginHistoryPage} />} />
        <Route path="audit/user-activity" element={<LazyRoute component={UserActivityPage} />} />
        <Route path="audit/alerts" element={<LazyRoute component={SecurityAlertsPage} />} />
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
        <Route path="dashboards/platform-stats" element={<PlatformStatsDashboardPage />} />

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
        <Route path="print" element={<LazyRoute component={PrintPreviewPage} />} />

        {/* NIR Enterprise → Admin Advanced */}

        {/* Bon Consum Enterprise */}
        <Route path="tipizate-enterprise/bon-consum" element={<LazyRoute component={BonConsumListPage} />} />
        <Route path="tipizate-enterprise/bon-consum/new" element={<LazyRoute component={BonConsumEditorPage} />} />
        <Route path="tipizate-enterprise/bon-consum/:id" element={<LazyRoute component={BonConsumEditorPage} />} />

        {/* Transfer Enterprise → Admin Advanced */}

        {/* Inventar Enterprise → Admin Advanced */}

        {/* Waste Enterprise */}
        <Route path="tipizate-enterprise/waste" element={<LazyRoute component={WasteListPage} />} />
        <Route path="tipizate-enterprise/waste/new" element={<LazyRoute component={WasteEditorPage} />} />
        <Route path="tipizate-enterprise/waste/:id" element={<LazyRoute component={WasteEditorPage} />} />

        {/* Factură Enterprise → Admin Advanced */}

        {/* Chitanță Enterprise → Admin Advanced */}

        {/* Registru Casă Enterprise → Admin Advanced */}

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
        <Route path="efactura" element={<LazyRoute component={EFacturaDashboardPage} />} />
        <Route path="efactura/:id" element={<LazyRoute component={EFacturaDetailsPage} />} />
        {/* PHASE S12 - POS React Unificat + Plăți Enterprise */}
        <Route path="pos" element={<PosPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailsPage />} />

        {/* LEGACY_ROUTE - PHASE S3: POS (legacy component) */}
        <Route path="pos/:orderId" element={<PosPage />} />

        {/* LEGACY_ROUTE - PHASE S3: Tipizate (redirected to admin-advanced or tipizate-enterprise) */}
        <Route path="tipizate" element={<Navigate to="/admin-advanced/inventory" replace />} />
        <Route path="tipizate/nir" element={<Navigate to="/admin-advanced/inventory" replace />} />
        <Route path="tipizate/bon-consum" element={<Navigate to="/tipizate-enterprise/bon-consum" replace />} />
        <Route path="tipizate/avize" element={<Navigate to="/tipizate-enterprise/aviz" replace />} />
        <Route path="tipizate/chitante" element={<Navigate to="/admin-advanced/fiscal" replace />} />
        <Route path="tipizate/registru-casa" element={<Navigate to="/admin-advanced/fiscal" replace />} />
        <Route path="tipizate/fisa-magazie" element={<Navigate to="/tipizate-enterprise/raport-gestiune" replace />} />
        <Route path="tipizate/raport-gestiune" element={<Navigate to="/tipizate-enterprise/raport-gestiune" replace />} />
        <Route path="tipizate/transfer" element={<Navigate to="/admin-advanced/transfers" replace />} />
        <Route path="tipizate/inventar" element={<Navigate to="/admin-advanced/multi-inventory" replace />} />
      </Route>

      {/* Redirect pentru rute necunoscute - dar NU pentru /kiosk/* (deja procesat mai sus) */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Wrap App with ErrorBoundary for global error handling
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;


