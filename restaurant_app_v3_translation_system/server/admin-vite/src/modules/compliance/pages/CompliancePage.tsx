// import { useTranslation } from '@/i18n/I18nContext';
import { useState } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { StatCard } from '@/shared/components/StatCard';
import { HelpButton } from '@/shared/components/HelpButton';
import { TemperatureLogTab } from '../components/TemperatureLogTab';
import { CleaningScheduleTab } from '../components/CleaningScheduleTab';
import { EquipmentMaintenanceTab } from '../components/EquipmentMaintenanceTab';
import { EquipmentTab } from '../components/EquipmentTab';
import { ComplianceDashboardTab } from '../components/ComplianceDashboardTab';
import './CompliancePage.css';

type TabType = 'dashboard' | 'equipment' | 'temperature-log' | 'cleaning-schedule' | 'equipment-maintenance';

export const CompliancePage = () => {
  //   const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const { data: kpis, loading: kpisLoading } = useApiQuery('/api/compliance/haccp/dashboard/kpis');

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'equipment' as TabType, label: 'Echipamente', icon: 'fas fa-server' },
    { id: 'temperature-log' as TabType, label: 'Jurnal Temperaturi', icon: 'fas fa-thermometer-half' },
    { id: 'cleaning-schedule' as TabType, label: 'Plan Curățenie', icon: 'fas fa-broom' },
    { id: 'equipment-maintenance' as TabType, label: 'Mentenanță Echipamente', icon: 'fas fa-tools' },
  ];

  return (
    <div className="compliance-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div className="header-content">
          <h1>🛡️ Conformitate & HACCP</h1>
          <p>Gestiunea siguranței alimentare și conformității</p>
        </div>
        <HelpButton
          title="Ajutor - Conformitate & HACCP"
          content={
            <div>
              <h5>🛡️ Ce este Conformitatea & HACCP?</h5>
              <p>
                Modulul de Conformitate & HACCP permite gestionarea siguranței alimentare și conformității
                cu standardele HACCP (Hazard Analysis and Critical Control Points).
              </p>
              <h5 className="mt-4">📋 Tab-uri disponibile</h5>
              <ul>
                <li><strong>Dashboard</strong> - Vizualizare generală KPIs și status conformitate</li>
                <li><strong>Echipamente</strong> - Gestiunea echipamentelor și verificărilor</li>
                <li><strong>Jurnal Temperaturi</strong> - Înregistrare și monitorizare temperaturi</li>
                <li><strong>Plan Curățenie</strong> - Program de curățenie și verificări</li>
                <li><strong>Mentenanță Echipamente</strong> - Planificare și urmărire mentenanță</li>
              </ul>
              <h5 className="mt-4">📊 KPIs monitorizați</h5>
              <ul>
                <li><strong>Temperaturi OK (24h)</strong> - Numărul de verificări de temperatură în limite normale</li>
                <li><strong>Task-uri Overdue</strong> - Task-uri de curățenie sau mentenanță restante</li>
                <li><strong>Mentenanțe săptămâna aceasta</strong> - Mentenanțe planificate pentru săptămâna curentă</li>
                <li><strong>Conformitate %</strong> - Procentul de conformitate general</li>
              </ul>
              <div className="alert alert-warning mt-4">
                <strong>⚠️ Important:</strong> Respectarea standardelor HACCP este obligatorie pentru
                toate restaurantele. Monitorizează regulat statusul conformității.
              </div>
            </div>
          }
        />
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          title="Temperaturi OK (24h)"
          value={kpisLoading ? '-' : ((kpis as any)?.data?.temperaturesOk24h || 0).toString()}
          icon="✅"
          color="success"
          trend={null}
        />
        <StatCard
          title="Task-uri Overdue"
          value={kpisLoading ? '-' : ((kpis as any)?.data?.cleaningTasksOverdue || 0).toString()}
          icon="⚠️"
          color={(kpis as any)?.data?.cleaningTasksOverdue > 0 ? 'danger' : 'success'}
          trend={null}
        />
        <StatCard
          title="Mentenanțe săptămâna aceasta"
          value={kpisLoading ? '-' : ((kpis as any)?.data?.maintenanceScheduledThisWeek || 0).toString()}
          icon="📅"
          color="info"
          trend={null}
        />
        <StatCard
          title="Conformitate %"
          value={kpisLoading ? '-' : `${((kpis as any)?.data?.compliancePercentage || 0).toFixed(1)}%`}
          icon="📊"
          color={(kpis as any)?.data?.compliancePercentage >= 90 ? 'success' : (kpis as any)?.data?.compliancePercentage >= 70 ? 'warning' : 'danger'}
          trend={null}
        />
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'dashboard' && <ComplianceDashboardTab />}
        {activeTab === 'equipment' && <EquipmentTab />}
        {activeTab === 'temperature-log' && <TemperatureLogTab />}
        {activeTab === 'cleaning-schedule' && <CleaningScheduleTab />}
        {activeTab === 'equipment-maintenance' && <EquipmentMaintenanceTab />}
      </div>
    </div>
  );
};




