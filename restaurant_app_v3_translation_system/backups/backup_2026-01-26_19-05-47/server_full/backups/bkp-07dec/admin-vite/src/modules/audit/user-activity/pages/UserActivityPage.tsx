import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UserActivity {
  user_id: number;
  username: string;
  total_actions: number;
  last_activity: string;
  actions_by_type: Record<string, number>;
}

export const UserActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUsers, setTopUsers] = useState<UserActivity[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    loadUserActivity();
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      const response = await fetch('/api/audit/user-activity/chart?days=30');
      if (!response.ok) throw new Error('Failed to load chart data');
      
      const data = await response.json();
      const chartDataPoints = Array.isArray(data) ? data : [];
      
      setChartData({
        labels: chartDataPoints.map((d: any) => new Date(d.date).toLocaleDateString('ro-RO')),
        datasets: [
          {
            label: 'Acțiuni',
            data: chartDataPoints.map((d: any) => d.actions),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
          },
          {
            label: 'Utilizatori Activi',
            data: chartDataPoints.map((d: any) => d.users),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.1
          }
        ]
      });
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  const loadUserActivity = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/audit-log?limit=1000');
      if (!response.ok) throw new Error('Failed to load user activity');
      
      const data = await response.json();
      const logs = Array.isArray(data) ? data : [];
      
      // Grupează după utilizator
      const activityMap: Record<number, UserActivity> = {};
      
      logs.forEach((log: any) => {
        const userId = log.user_id || 0;
        if (!activityMap[userId]) {
          activityMap[userId] = {
            user_id: userId,
            username: log.username || 'Unknown',
            total_actions: 0,
            last_activity: log.timestamp,
            actions_by_type: {}
          };
        }
        
        activityMap[userId].total_actions++;
        activityMap[userId].actions_by_type[log.action] = (activityMap[userId].actions_by_type[log.action] || 0) + 1;
        
        if (new Date(log.timestamp) > new Date(activityMap[userId].last_activity)) {
          activityMap[userId].last_activity = log.timestamp;
        }
      });
      
      const activitiesList = Object.values(activityMap);
      activitiesList.sort((a, b) => b.total_actions - a.total_actions);
      
      setActivities(activitiesList);
      setTopUsers(activitiesList.slice(0, 10));
    } catch (error) {
      console.error('Error loading user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = [
    { field: 'username', headerName: 'Utilizator', width: 200 },
    { field: 'total_actions', headerName: 'Total Acțiuni', width: 150 },
    { field: 'last_activity', headerName: 'Ultima Activitate', width: 180, valueFormatter: (params: any) => new Date(params.value).toLocaleString('ro-RO') },
    {
      headerName: 'Acțiuni pe Tip',
      width: 300,
      cellRenderer: (params: any) => {
        const actions = params.data.actions_by_type;
        return Object.entries(actions).map(([action, count]: [string, any]) => 
          `${action}: ${count}`
        ).join(', ');
      }
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h1><i className="fas fa-user-clock me-2"></i>User Activity</h1>
        <button className="btn btn-primary" onClick={loadUserActivity}>
          <i className="fas fa-sync me-1"></i>Actualizează
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5><i className="fas fa-trophy me-2"></i>Top 10 Utilizatori Activi</h5>
            </div>
            <div className="card-body">
              <ol>
                {topUsers.map((user, idx) => (
                  <li key={user.user_id}>
                    <strong>{user.username}</strong> - {user.total_actions} acțiuni
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5><i className="fas fa-chart-line me-2"></i>Evoluție Activitate (30 zile)</h5>
            </div>
            <div className="card-body">
              {chartData ? (
                <Line 
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false,
                      },
                    },
                  }}
                />
              ) : (
                <p>Se încarcă datele...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          rowData={activities}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true }}
          loading={loading}
        />
      </div>
    </div>
  );
};

