// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import QueueMonitorPage from '@/modules/queue-monitor/pages/QueueMonitorPage';

interface SystemMetrics {
  response_time: number;
  active_connections: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

interface OrderMetrics {
  avg_preparation_time: number;
  delayed_orders: number;
  kitchen_load: number;
  bar_load: number;
  tables_long_occupation: number;
}

export const MonitoringPage: React.FC = () => {
//   const { t } = useTranslation();
  const location = useLocation();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [orderMetrics, setOrderMetrics] = useState<OrderMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Detectează tab-ul din URL
  const getInitialTab = (): 'overview' | 'queue' | "Performance" => {
    if (location.pathname.includes('/performance')) return "Performance";
    if (location.pathname.includes('/queue')) return 'queue';
    return 'overview';
  };
  
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | "Performance">(getInitialTab());

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      // Load system metrics
      const systemResponse = await fetch('/api/dashboard/metrics');
      if (systemResponse.ok) {
        const systemData = await systemResponse.json();
        const rawSystem = systemData.system || {};
        
        // Map backend format to frontend format
        const memory = rawSystem.memory || { heapUsed: 0, heapTotal: 0, external: 0 };
        setSystemMetrics({
          response_time: rawSystem.response_time || 0, // Not available from backend, default to 0
          active_connections: rawSystem.active_connections || 0, // Not available from backend, default to 0
          memory: {
            heapUsed: memory.heapUsed || 0,
            heapTotal: memory.heapTotal || 0,
            external: memory.external || 0,
          },
        });
      }

      // Load order metrics (we'll calculate from orders)
      const ordersResponse = await fetch('/api/orders?limit=100');
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        if (ordersData.success && ordersData.data) {
          const orders = ordersData.data;
          
          // Calculate average preparation time
          const completedOrders = orders.filter((o: any) => o.status === 'completed' && o.finished_at);
          const avgPrepTime = completedOrders.length > 0
            ? completedOrders.reduce((sum: number, o: any) => {
                const prepTime = new Date(o.finished_at).getTime() - new Date(o.timestamp).getTime();
                return sum + (prepTime / 1000 / 60); // Convert to minutes
              }, 0) / completedOrders.length
            : 0;

          // Count delayed orders (over 30 minutes)
          const delayed = orders.filter((o: any) => {
            if (o.status === 'completed' && o.finished_at) {
              const prepTime = (new Date(o.finished_at).getTime() - new Date(o.timestamp).getTime()) / 1000 / 60;
              return prepTime > 30;
            }
            return false;
          }).length;

          // Count kitchen/bar orders
          const kitchenOrders = orders.filter((o: any) => 
            o.status === "Pending:" || o.status === 'preparing'
          ).length;

          setOrderMetrics({
            avg_preparation_time: avgPrepTime,
            delayed_orders: delayed,
            kitchen_load: kitchenOrders,
            bar_load: 0, // Will be calculated separately
            tables_long_occupation: 0 // Will be calculated separately
          });
        }
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="padding-20">
      <div className="page-header margin-bottom-20">
        <h1><i className="fas fa-tachometer-alt me-2"></i>Dashboard Monitorizare și Performanță</h1>
        <button className="btn btn-primary" onClick={loadMetrics}>
          <i className="fas fa-sync me-1"></i>"Actualizează"</button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Prezentare Generală
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            Monitor Coadă
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "Performance" ? 'active' : ''}`}
            onClick={() => setActiveTab("Performance")}
          >Performance Metrics</button>
        </li>
      </ul>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="row mb-4">
            {/* System Metrics */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h5><i className="fas fa-server me-2"></i>Metrici Sistem</h5>
                </div>
                <div className="card-body">
                  {systemMetrics ? (
                    <>
                      <div className="mb-3">
                        <strong>Timp de Răspuns:</strong> {systemMetrics.response_time || 0}ms
                      </div>
                      <div className="mb-3">
                        <strong>Conexiuni Active:</strong> {systemMetrics.active_connections || 0}
                      </div>
                      <div className="mb-3">
                        <strong>Utilizare Memorie:</strong> {Math.round((systemMetrics.memory?.heapUsed || 0) / 1024 / 1024)}MB
                      </div>
                    </>
                  ) : (
                    <p>Se încarcă...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Metrics */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header bg-success text-white">
                  <h5><i className="fas fa-utensils me-2"></i>Metrici Comenzi</h5>
                </div>
                <div className="card-body">
                  {orderMetrics ? (
                    <>
                      <div className="mb-3">
                        <strong>Timp Mediu Preparare:</strong> {orderMetrics.avg_preparation_time.toFixed(1)} min
                      </div>
                      <div className="mb-3">
                        <strong>Comenzi Întârziate</strong> <span className="text-danger">{orderMetrics.delayed_orders}</span>
                      </div>
                      <div className="mb-3">
                        <strong>Încărcare Bucătărie</strong> {orderMetrics.kitchen_load} comenzi
                      </div>
                      <div className="mb-3">
                        <strong>Încărcare Bar</strong> {orderMetrics.bar_load} comenzi
                      </div>
                    </>
                  ) : (
                    <p>Se încarcă...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header bg-warning text-dark">
                  <h5><i className="fas fa-exclamation-triangle me-2"></i>Alerte</h5>
                </div>
                <div className="card-body">
                  {orderMetrics && orderMetrics.delayed_orders > 0 && (
                    <div className="alert alert-danger">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {orderMetrics.delayed_orders} comenzi întârziate necesită atenție!
                    </div>
                  )}
                  {orderMetrics && orderMetrics.kitchen_load > 10 && (
                    <div className="alert alert-warning">
                      <i className="fas fa-clock me-2"></i>
                      Bucătăria este încărcată ({orderMetrics.kitchen_load} comenzi)
                    </div>
                  )}
                  {!orderMetrics || (orderMetrics.delayed_orders === 0 && orderMetrics.kitchen_load <= 10) && (
                    <div className="alert alert-success">
                      <i className="fas fa-check-circle me-2"></i>Totul funcționează normal</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queue Monitor Tab */}
      {activeTab === 'queue' && (
        <QueueMonitorPage />
      )}

      {/* Performance Metrics Tab */}
      {activeTab === "Performance" && (
        <div>
          <div className="card">
            <div className="card-header">
              <h5><i className="fas fa-chart-line me-2"></i>Metrici Performanță</h5>
            </div>
            <div className="card-body">
              {systemMetrics ? (
                <div className="row">
                  <div className="col-md-6">
                    <h6>Performanță Sistem</h6>
                    <ul className="list-group">
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Timp de Răspuns:</span>
                        <strong>{systemMetrics.response_time || 0}ms</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Conexiuni Active:</span>
                        <strong>{systemMetrics.active_connections || 0}</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Memorie Heap Utilizată:</span>
                        <strong>{Math.round((systemMetrics.memory?.heapUsed || 0) / 1024 / 1024)}MB</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Memorie Heap Totală:</span>
                        <strong>{Math.round((systemMetrics.memory?.heapTotal || 0) / 1024 / 1024)}MB</strong>
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>Performanță Comenzi</h6>
                    {orderMetrics ? (
                      <ul className="list-group">
                        <li className="list-group-item d-flex justify-content-between">
                          <span>Timp Mediu Preparare:</span>
                          <strong>{orderMetrics.avg_preparation_time.toFixed(1)} min</strong>
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                          <span>Comenzi Întârziate</span>
                          <strong className="text-danger">{orderMetrics.delayed_orders}</strong>
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                          <span>Încărcare Bucătărie</span>
                          <strong>{orderMetrics.kitchen_load} comenzi</strong>
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                          <span>Încărcare Bar</span>
                          <strong>{orderMetrics.bar_load} comenzi</strong>
                        </li>
                      </ul>
                    ) : (
                      <p>Se încarcă...</p>
                    )}
                  </div>
                </div>
              ) : (
                <p>Se încarcă metrici...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




