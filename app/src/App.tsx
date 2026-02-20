import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";

// Lazy imports - loaded on demand
const KioskTransferIframePage = lazy(() => import('./pages/KioskTransferIframePage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'));
const GuestIdentityPage = lazy(() => import('./pages/GuestIdentityPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const SupplyChainPage = lazy(() => import('./pages/SupplyChainPage'));
const LaborPage = lazy(() => import('./pages/LaborPage'));
const WarRoomPage = lazy(() => import('./pages/WarRoomPage'));
const InfrastructurePage = lazy(() => import('./pages/InfrastructurePage'));
const ExperiencePage = lazy(() => import('./pages/ExperiencePage'));
const DarkKitchenPage = lazy(() => import('./pages/DarkKitchenPage'));
const RevenuePage = lazy(() => import('./pages/RevenuePage'));
const FranchisePage = lazy(() => import('./pages/FranchisePage'));
const ApiEconomyPage = lazy(() => import('./pages/ApiEconomyPage'));
const DataNetworkPage = lazy(() => import('./pages/DataNetworkPage'));
const RiskPage = lazy(() => import('./pages/RiskPage'));
const FinancialPage = lazy(() => import('./pages/FinancialPage'));
const SuperAppPage = lazy(() => import('./pages/SuperAppPage'));

function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/war-room" replace />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/kiosk-transfer" element={<KioskTransferIframePage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/guests" element={<GuestIdentityPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/supply-chain" element={<SupplyChainPage />} />
            <Route path="/labor" element={<LaborPage />} />
            <Route path="/war-room" element={<WarRoomPage />} />
            <Route path="/infrastructure" element={<InfrastructurePage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/dark-kitchen" element={<DarkKitchenPage />} />
            <Route path="/revenue" element={<RevenuePage />} />
            <Route path="/franchise" element={<FranchisePage />} />
            <Route path="/api-economy" element={<ApiEconomyPage />} />
            <Route path="/data-network" element={<DataNetworkPage />} />
            <Route path="/risk" element={<RiskPage />} />
            <Route path="/financial" element={<FinancialPage />} />
            <Route path="/superapp" element={<SuperAppPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
