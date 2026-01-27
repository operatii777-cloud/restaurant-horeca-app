import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface StaffReport {
  waiter: string;
  count: number;
  total: number;
  average: number;
}

export const StaffReportsPage: React.FC = () => {
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
      
      const res = await fetch(`/api/orders?startDate=${start}&endDate=${endDate}&limit=1000`);
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
    <div style={{ padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h1><i className="fas fa-users me-2"></i>Rapoarte Personal</h1>
        <button className="btn btn-primary" onClick={loadStaffReport}>
          <i className="fas fa-sync me-1"></i>Actualizează
        </button>
      </div>

      <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          rowData={reports}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true }}
          loading={loading}
        />
      </div>
    </div>
  );
};

