// import { useTranslation } from '@/i18n/I18nContext';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { TemperatureChart } from './TemperatureChart';
import './ComplianceDashboardTab.css';

export const ComplianceDashboardTab = () => {
//   const { t } = useTranslation();
  const { data: recentTemps } = useApiQuery('/api/compliance/temperature-log?limit=24');
  const { data: overdueTasks } = useApiQuery('/api/compliance/cleaning-schedule?overdue=true');
  const { data: upcomingMaintenance } = useApiQuery('/api/compliance/equipment-maintenance?status=scheduled');

  return (
    <div className="compliance-dashboard-tab">
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h3>"alertari critice"</h3>
          <div className="alerts-list">
            {overdueTasks?.data?.length > 0 ? (
              overdueTasks.data.map((task: any) => (
                <div key={task.id} className="alert-item danger">
                  <i className="fas fa-exclamation-triangle"></i>
                  <div>
                    <strong>{task.title}</strong>
                    <p>Termen: {new Date(task.due_date).toLocaleDateString('ro-RO')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-alerts">
                <i className="fas fa-check-circle text-success"></i>
                <span>"nicio alerta critica"</span>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h3>"mentenante aproape de termen"</h3>
          <div className="maintenance-list">
            {upcomingMaintenance?.data?.slice(0, 5).map((maint: any) => (
              <div key={maint.id} className="maintenance-item">
                <div>
                  <strong>{maint.equipment_name}</strong>
                  <p>{maint.maintenance_type} - {new Date(maint.scheduled_date).toLocaleDateString('ro-RO')}</p>
                </div>
              </div>
            )) || <p>"nicio mentenanta programata"</p>}
          </div>
        </div>
      </div>

      {recentTemps?.data && recentTemps.data.length > 0 && (
        <div className="chart-section">
          <TemperatureChart logs={recentTemps.data} equipmentId={0} />
        </div>
      )}
    </div>
  );
};




