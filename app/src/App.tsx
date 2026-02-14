import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy imports - loaded on demand
const KioskTransferIframePage = lazy(() => import('./pages/KioskTransferIframePage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'));

function App() {
  return (
    <div className="app">
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/orders" replace />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/kiosk-transfer" element={<KioskTransferIframePage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
