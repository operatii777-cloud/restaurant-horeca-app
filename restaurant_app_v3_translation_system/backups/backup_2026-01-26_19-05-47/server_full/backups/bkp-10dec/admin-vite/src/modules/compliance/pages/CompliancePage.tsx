import { useState } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { StatCard } from '@/shared/components/StatCard';
import { TemperatureLogTab } from '../components/TemperatureLogTab';
import { CleaningScheduleTab } from '../components/CleaningScheduleTab';
import { EquipmentMaintenanceTab } from '../components/EquipmentMaintenanceTab';
import { ComplianceDashboardTab } from '../components/ComplianceDashboardTab';
import './CompliancePage.css';

type TabType = 'dashboard' | 'temperature-log' | 'cleaning-schedule' | 'equipment-maintenance';

export const CompliancePage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  const { data: kpis, loading: kpisLoading } = useApiQuery('/api/compliance/dashboard/kpis');

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'temperature-log' as TabType, label: 'Jurnal Temperaturi', icon: 'fas fa-thermometer-half' },
    { id: 'cleaning-schedule' as TabType, label: 'Plan Curățenie', icon: 'fas fa-broom' },
    { id: 'equipment-maintenance' as TabType, label: 'Mentenanță Echipamente', icon: 'fas fa-tools' },
  ];

  return (
    <div className="compliance-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🛡️ Conformitate & HACCP</h1>
          <p>Gestiunea siguranței alimentare și conformității</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          title="Temperaturi OK (24h)"
          value={kpisLoading ? '-' : (kpis?.data?.temperaturesOk24h || 0).toString()}
          icon="fas fa-check-circle"
          color="success"
          trend={null}
        />
        <StatCard
          title="Task-uri Overdue"
          value={kpisLoading ? '-' : (kpis?.data?.cleaningTasksOverdue || 0).toString()}
          icon="fas fa-exclamation-triangle"
          color={kpis?.data?.cleaningTasksOverdue > 0 ? 'danger' : 'success'}
          trend={null}
        />
        <StatCard
          title="Mentenanțe Săptămâna Aceasta"
          value={kpisLoading ? '-' : (kpis?.data?.maintenanceScheduledThisWeek || 0).toString()}
          icon="fas fa-calendar-week"
          color="info"
          trend={null}
        />
        <StatCard
          title="Conformitate %"
          value={kpisLoading ? '-' : `${(kpis?.data?.compliancePercentage || 0).toFixed(1)}%`}
          icon="fas fa-percentage"
          color={kpis?.data?.compliancePercentage >= 90 ? 'success' : kpis?.data?.compliancePercentage >= 70 ? 'warning' : 'danger'}
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
        {activeTab === 'temperature-log' && <TemperatureLogTab />}
        {activeTab === 'cleaning-schedule' && <CleaningScheduleTab />}
        {activeTab === 'equipment-maintenance' && <EquipmentMaintenanceTab />}
      </div>
    </div>
  );
};

