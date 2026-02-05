// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { QuickMonitoringForm } from '../components/monitoring/QuickMonitoringForm';
import { MonitoringHistoryTable } from '../components/monitoring/MonitoringHistoryTable';

export const HACCPMonitoringPage: React.FC = () => {
  //   const { t } = useTranslation();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Listen for monitoring records to refresh table
    const handleMonitoringRecorded = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    window.addEventListener('haccp-monitoring-recorded', handleMonitoringRecorded);
    return () => {
      window.removeEventListener('haccp-monitoring-recorded', handleMonitoringRecorded);
    };
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Monitorizare HACCP</h1>
        <p className="text-gray-600 mt-1">înregistrare și vizualizare monitorizări HACCP</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Monitoring Form */}
        <div>
          <QuickMonitoringForm />
        </div>

        {/* Monitoring History Table */}
        <div>
          <MonitoringHistoryTable refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Mobile: Stack vertically */}
      <style>{`
        @media (max-width: 1024px) {
          .grid.lg\\:grid-cols-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};




