// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { haccpService } from '../services/haccp.service';
import type { DashboardKPIs, Monitoring } from '../services/haccp.service';
import { KPICard } from '../components/dashboard/KPICard';
import { AlertsList } from '../components/dashboard/AlertsList';
import { ComplianceChart } from '../components/dashboard/ComplianceChart';

export const HACCPDashboardPage: React.FC = () => {
//   const { t } = useTranslation();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Monitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load KPIs
      const kpisData = await haccpService.getDashboardKPIs();
      setKpis(kpisData);

      // Load recent critical/warning alerts
      const alerts = await haccpService.getMonitoring({
        status: 'critical',
        limit: 10
      });
      setRecentAlerts(alerts);
    } catch (err: any) {
      setError('Eroare la încărcarea datelor dashboard: ' + (err.message || 'Eroare necunoscută'));
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate compliance chart data (last 7 days)
  const complianceChartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split('T')[0],
      complianceRate: kpis?.complianceRate || 0
    };
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-500">"se incarca dashboard ul haccp"</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard HACCP</h1>
        <p className="text-gray-600 mt-1">"vizualizare generala a conformitatii haccp"</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="monitorizari astazi"
          value={kpis?.monitoringsToday || 0}
          icon="fas fa-clipboard-check"
          status="info"
        />
        <KPICard
          title="Alerte Critice"
          value={kpis?.criticalAlerts || 0}
          icon="fas fa-exclamation-triangle"
          status={kpis && kpis.criticalAlerts > 0 ? 'critical' : 'success'}
        />
        <KPICard
          title="actiuni in asteptare"
          value={kpis?.pendingActions || 0}
          icon="fas fa-tasks"
          status={kpis && kpis.pendingActions > 0 ? 'warning' : 'success'}
        />
        <KPICard
          title="rata conformitatii"
          value={`${(kpis?.complianceRate || 0).toFixed(1)}%`}
          icon="fas fa-percentage"
          status={
            kpis && kpis.complianceRate >= 95 ? 'success' :
            kpis && kpis.complianceRate >= 85 ? 'warning' : 'critical'
          }
        />
      </div>

      {/* Alerts and Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Alerte Recente (Critice)</h2>
          <AlertsList 
            alerts={recentAlerts}
            onAlertClick={(alert) => {
              // Navigate to monitoring page with filter
              window.location.href = `/compliance/haccp/monitoring?ccp_id=${alert.ccp_id}&status=critical`;
            }}
          />
        </div>

        {/* Compliance Chart */}
        <div>
          <ComplianceChart data={complianceChartData} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">"actiuni rapide"</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/compliance/haccp/monitoring"
            className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-center"
          >
            <i className="fas fa-plus-circle text-3xl text-blue-600 mb-2"></i>
            <p className="font-semibold text-gray-900">"monitorizare rapida"</p>
            <p className="text-sm text-gray-600 mt-1">"inregistreaza o monitorizare noua"</p>
          </a>
          <a
            href="/compliance/haccp/corrective-actions"
            className="p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors text-center"
          >
            <i className="fas fa-tools text-3xl text-yellow-600 mb-2"></i>
            <p className="font-semibold text-gray-900">"actiuni corective"</p>
            <p className="text-sm text-gray-600 mt-1">"gestioneaza actiunile corective"</p>
          </a>
          <a
            href="/compliance/haccp/processes"
            className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-center"
          >
            <i className="fas fa-project-diagram text-3xl text-green-600 mb-2"></i>
            <p className="font-semibold text-gray-900">Procese HACCP</p>
            <p className="text-sm text-gray-600 mt-1">"vezi procesele si ccp urile"</p>
          </a>
        </div>
      </div>
    </div>
  );
};




