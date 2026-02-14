"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceDashboardTab = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var TemperatureChart_1 = require("./TemperatureChart");
require("./ComplianceDashboardTab.css");
var ComplianceDashboardTab = function () {
    var _a, _b;
    //   const { t } = useTranslation();
    var recentTemps = (0, useApiQuery_1.useApiQuery)('/api/compliance/temperature-log?limit=24').data;
    var overdueTasks = (0, useApiQuery_1.useApiQuery)('/api/compliance/cleaning-schedule?overdue=true').data;
    var upcomingMaintenance = (0, useApiQuery_1.useApiQuery)('/api/compliance/equipment-maintenance?status=scheduled').data;
    return (<div className="compliance-dashboard-tab">
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h3>Alertări Critice</h3>
          <div className="alerts-list">
            {((_a = overdueTasks === null || overdueTasks === void 0 ? void 0 : overdueTasks.data) === null || _a === void 0 ? void 0 : _a.length) > 0 ? (overdueTasks.data.map(function (task) { return (<div key={task.id} className="alert-item danger">
                  <i className="fas fa-exclamation-triangle"></i>
                  <div>
                    <strong>{task.title}</strong>
                    <p>Termen: {new Date(task.due_date).toLocaleDateString('ro-RO')}</p>
                  </div>
                </div>); })) : (<div className="no-alerts">
                <i className="fas fa-check-circle text-success"></i>
                <span>Nicio alertă critică</span>
              </div>)}
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Mentenanțe aproape de termen</h3>
          <div className="maintenance-list">
            {((_b = upcomingMaintenance === null || upcomingMaintenance === void 0 ? void 0 : upcomingMaintenance.data) === null || _b === void 0 ? void 0 : _b.slice(0, 5).map(function (maint) { return (<div key={maint.id} className="maintenance-item">
                <div>
                  <strong>{maint.equipment_name}</strong>
                  <p>{maint.maintenance_type} - {new Date(maint.scheduled_date).toLocaleDateString('ro-RO')}</p>
                </div>
              </div>); })) || <p>Nicio mentenanță programată</p>}
          </div>
        </div>
      </div>

      {(recentTemps === null || recentTemps === void 0 ? void 0 : recentTemps.data) && recentTemps.data.length > 0 && (<div className="chart-section">
          <TemperatureChart_1.TemperatureChart logs={recentTemps.data} equipmentId={0}/>
        </div>)}
    </div>);
};
exports.ComplianceDashboardTab = ComplianceDashboardTab;
