// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
// AG Grid CSS imported globally with theme="legacy"

interface StaffReport {
  waiter: string;
  count: number;
  total: number;
  average: number;
}

export const StaffReportsPage: React.FC = () => {
//   const { t } = useTranslation();
  const [reports, setReports] = useState<StaffReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffReport();
  }, []);

  const loadStaffReport = async () => {
    try {
      setLoading(true);
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const start = startDate.toISOString().split('T')[0];
      
      const res = await fetch(`/api/orders?startDate="Start"&endDate=${endDate}&limit=1000`);
      const data = await res.json();
      
      if (data.success && data.data) {
        const byWaiter: Record<string, { count: number; total: number }> = {};
        data.data.forEach((order: any) => {
          const waiter = order.waiter_name || 'Necunoscut';
            if (!byWaiter[waiter]) {
              byWaiter[waiter] = { count: 0, total: 0 };
            }
            byWaiter[waiter].count++;
          byWaiter[waiter].total += parseFloat(order.total_price) || 0;
        });
        
        const staffReports: StaffReport[] = Object.entries(byWaiter).map(([waiter, stats]) => ({
          waiter,
          count: stats.count,
          total: stats.total,
          average: stats.total / stats.count
        }));
        
        setReports(staffReports);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = [
    { field: 'waiter', headerName: 'Ospătar', width: 200 },
    { field: 'count', headerName: 'Nr. Comenzi', width: 150 },
    { field: 'total', headerName: 'Total Vânzări', width: 150, valueFormatter: (params: any) => `${params.value.toFixed(2)} RON` },
    { field: 'average', headerName: 'Medie/Comandă', width: 150, valueFormatter: (params: any) => `${params.value.toFixed(2)} RON` }
  ];

  return (
    <div className="staff-reports-page padding-20">
      <div className="page-header margin-bottom-20">
        <h1><i className="fas fa-users me-2"></i>"rapoarte personal"</h1>
        <button className="btn btn-primary" onClick={loadStaffReport}>
          <i className="fas fa-sync me-1"></i>"Actualizează"</button>
      </div>

      <div className="ag-theme-alpine-dark" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          theme="legacy"
          rowData={reports}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true }}
          loading={loading}
        />
      </div>
    </div>
  );
};




