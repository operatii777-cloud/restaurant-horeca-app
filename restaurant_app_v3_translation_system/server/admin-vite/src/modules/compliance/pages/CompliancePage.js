"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompliancePage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var StatCard_1 = require("@/shared/components/StatCard");
var HelpButton_1 = require("@/shared/components/HelpButton");
var TemperatureLogTab_1 = require("../components/TemperatureLogTab");
var CleaningScheduleTab_1 = require("../components/CleaningScheduleTab");
var EquipmentMaintenanceTab_1 = require("../components/EquipmentMaintenanceTab");
var EquipmentTab_1 = require("../components/EquipmentTab");
var ComplianceDashboardTab_1 = require("../components/ComplianceDashboardTab");
require("./CompliancePage.css");
var CompliancePage = function () {
    var _a, _b, _c, _d, _e, _f, _g;
    //   const { t } = useTranslation();
    var _h = (0, react_1.useState)('dashboard'), activeTab = _h[0], setActiveTab = _h[1];
    var _j = (0, useApiQuery_1.useApiQuery)('/api/compliance/haccp/dashboard/kpis'), kpis = _j.data, kpisLoading = _j.loading;
    var tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
        { id: 'equipment', label: 'Echipamente', icon: 'fas fa-server' },
        { id: 'temperature-log', label: 'Jurnal Temperaturi', icon: 'fas fa-thermometer-half' },
        { id: 'cleaning-schedule', label: 'Plan Curățenie', icon: 'fas fa-broom' },
        { id: 'equipment-maintenance', label: 'Mentenanță Echipamente', icon: 'fas fa-tools' },
    ];
    return (<div className="compliance-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div className="header-content">
          <h1>🛡️ Conformitate & HACCP</h1>
          <p>Gestiunea siguranței alimentare și conformității</p>
        </div>
        <HelpButton_1.HelpButton title="Ajutor - Conformitate & HACCP" content={<div>
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
            </div>}/>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <StatCard_1.StatCard title="Temperaturi OK (24h)" value={kpisLoading ? '-' : (((_a = kpis === null || kpis === void 0 ? void 0 : kpis.data) === null || _a === void 0 ? void 0 : _a.temperaturesOk24h) || 0).toString()} icon="✅" color="success" trend={null}/>
        <StatCard_1.StatCard title="Task-uri Overdue" value={kpisLoading ? '-' : (((_b = kpis === null || kpis === void 0 ? void 0 : kpis.data) === null || _b === void 0 ? void 0 : _b.cleaningTasksOverdue) || 0).toString()} icon="⚠️" color={((_c = kpis === null || kpis === void 0 ? void 0 : kpis.data) === null || _c === void 0 ? void 0 : _c.cleaningTasksOverdue) > 0 ? 'danger' : 'success'} trend={null}/>
        <StatCard_1.StatCard title="Mentenanțe săptămâna aceasta" value={kpisLoading ? '-' : (((_d = kpis === null || kpis === void 0 ? void 0 : kpis.data) === null || _d === void 0 ? void 0 : _d.maintenanceScheduledThisWeek) || 0).toString()} icon="📅" color="info" trend={null}/>
        <StatCard_1.StatCard title="Conformitate %" value={kpisLoading ? '-' : "".concat((((_e = kpis === null || kpis === void 0 ? void 0 : kpis.data) === null || _e === void 0 ? void 0 : _e.compliancePercentage) || 0).toFixed(1), "%")} icon="📊" color={((_f = kpis === null || kpis === void 0 ? void 0 : kpis.data) === null || _f === void 0 ? void 0 : _f.compliancePercentage) >= 90 ? 'success' : ((_g = kpis === null || kpis === void 0 ? void 0 : kpis.data) === null || _g === void 0 ? void 0 : _g.compliancePercentage) >= 70 ? 'warning' : 'danger'} trend={null}/>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(function (tab) { return (<button key={tab.id} className={"tab ".concat(activeTab === tab.id ? 'active' : '')} onClick={function () { return setActiveTab(tab.id); }}>
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>); })}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'dashboard' && <ComplianceDashboardTab_1.ComplianceDashboardTab />}
        {activeTab === 'equipment' && <EquipmentTab_1.EquipmentTab />}
        {activeTab === 'temperature-log' && <TemperatureLogTab_1.TemperatureLogTab />}
        {activeTab === 'cleaning-schedule' && <CleaningScheduleTab_1.CleaningScheduleTab />}
        {activeTab === 'equipment-maintenance' && <EquipmentMaintenanceTab_1.EquipmentMaintenanceTab />}
      </div>
    </div>);
};
exports.CompliancePage = CompliancePage;
