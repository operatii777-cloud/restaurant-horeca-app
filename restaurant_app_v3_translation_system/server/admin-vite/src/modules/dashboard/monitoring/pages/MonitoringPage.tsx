import { useTranslation } from '@/i18n/I18nContext';
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
  const { t } = useTranslation();
  const location = useLocation();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [orderMetrics, setOrderMetrics] = useState<OrderMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Detectează tab-ul din URL
  const getInitialTab = (): 'overview' | 'queue' | 'performance' => {
    if (location.pathname.includes('/performance')) return 'performance';
    if (location.pathname.includes('/queue')) return 'queue';
    return 'overview';
  };
  
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'performance'>(getInitialTab());

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
            o.status === 'pending' || o.status === 'preparing'
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
        <h1><i className="fas fa-tachometer-alt me-2"></i>{t('dashboard.monitoring.title')}</h1>
        <button className="btn btn-primary" onClick={loadMetrics}>
          <i className="fas fa-sync me-1"></i>{t('dashboard.monitoring.refresh')}</button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            {t('dashboard.monitoring.tabOverview')}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            {t('dashboard.monitoring.tabQueue')}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >{t('dashboard.monitoring.tabPerformance')}</button>
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
                  <h5><i className="fas fa-server me-2"></i>{t('dashboard.monitoring.systemMetrics')}</h5>
                </div>
                <div className="card-body">
                  {systemMetrics ? (
                    <>
                      <div className="mb-3">
                        <strong>{t('dashboard.monitoring.responseTime')}</strong> {systemMetrics.response_time || 0}ms
                      </div>
                      <div className="mb-3">
                        <strong>{t('dashboard.monitoring.activeConnections')}</strong> {systemMetrics.active_connections || 0}
                      </div>
                      <div className="mb-3">
                        <strong>{t('dashboard.monitoring.memoryUsage')}</strong> {Math.round((systemMetrics.memory?.heapUsed || 0) / 1024 / 1024)}MB
                      </div>
                    </>
                  ) : (
                    <p>{t('dashboard.monitoring.loading')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Metrics */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header bg-success text-white">
                  <h5><i className="fas fa-utensils me-2"></i>{t('dashboard.monitoring.orderMetrics')}</h5>
                </div>
                <div className="card-body">
                  {orderMetrics ? (
                    <>
                      <div className="mb-3">
                        <strong>{t('dashboard.monitoring.avgPrepTime')}</strong> {orderMetrics.avg_preparation_time.toFixed(1)} min
                      </div>
                      <div className="mb-3">
                        <strong>{t('dashboard.monitoring.delayedOrders')}</strong> <span className="text-danger">{orderMetrics.delayed_orders}</span>
                      </div>
                      <div className="mb-3">
                        <strong>{t('dashboard.monitoring.kitchenLoad')}</strong> {orderMetrics.kitchen_load} {t('dashboard.metrics.orders')}
                      </div>
                      <div className="mb-3">
                        <strong>{t('dashboard.monitoring.barLoad')}</strong> {orderMetrics.bar_load} {t('dashboard.metrics.orders')}
                      </div>
                    </>
                  ) : (
                    <p>{t('dashboard.monitoring.loading')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header bg-warning text-dark">
                  <h5><i className="fas fa-exclamation-triangle me-2"></i>{t('dashboard.monitoring.alertsTitle')}</h5>
                </div>
                <div className="card-body">
                  {orderMetrics && orderMetrics.delayed_orders > 0 && (
                    <div className="alert alert-danger">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {t('dashboard.monitoring.delayedOrdersAlert', { count: orderMetrics.delayed_orders })}
                    </div>
                  )}
                  {orderMetrics && orderMetrics.kitchen_load > 10 && (
                    <div className="alert alert-warning">
                      <i className="fas fa-clock me-2"></i>
                      {t('dashboard.monitoring.kitchenLoadAlert', { count: orderMetrics.kitchen_load })}
                    </div>
                  )}
                  {!orderMetrics || (orderMetrics.delayed_orders === 0 && orderMetrics.kitchen_load <= 10) && (
                    <div className="alert alert-success">
                      <i className="fas fa-check-circle me-2"></i>{t('dashboard.monitoring.allOk')}</div>
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
      {activeTab === 'performance' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h5><i className="fas fa-chart-line me-2"></i>{t('dashboard.monitoring.performanceMetrics')}</h5>
            </div>
            <div className="card-body">
              {systemMetrics ? (
                <div className="row">
                  <div className="col-md-6">
                    <h6>{t('dashboard.monitoring.systemPerformance')}</h6>
                    <ul className="list-group">
                      <li className="list-group-item d-flex justify-content-between">
                        <span>{t('dashboard.monitoring.responseTime')}</span>
                        <strong>{systemMetrics.response_time || 0}ms</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>{t('dashboard.monitoring.activeConnections')}</span>
                        <strong>{systemMetrics.active_connections || 0}</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>{t('dashboard.monitoring.heapUsed')}</span>
                        <strong>{Math.round((systemMetrics.memory?.heapUsed || 0) / 1024 / 1024)}MB</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>{t('dashboard.monitoring.heapTotal')}</span>
                        <strong>{Math.round((systemMetrics.memory?.heapTotal || 0) / 1024 / 1024)}MB</strong>
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>{t('dashboard.monitoring.orderPerformance')}</h6>
                    {orderMetrics ? (
                      <ul className="list-group">
                        <li className="list-group-item d-flex justify-content-between">
                          <span>{t('dashboard.monitoring.avgPrepTime')}</span>
                          <strong>{orderMetrics.avg_preparation_time.toFixed(1)} min</strong>
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                          <span>{t('dashboard.monitoring.delayedOrders')}</span>
                          <strong className="text-danger">{orderMetrics.delayed_orders}</strong>
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                          <span>{t('dashboard.monitoring.kitchenLoad')}</span>
                          <strong>{orderMetrics.kitchen_load} {t('dashboard.metrics.orders')}</strong>
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                          <span>{t('dashboard.monitoring.barLoad')}</span>
                          <strong>{orderMetrics.bar_load} {t('dashboard.metrics.orders')}</strong>
                        </li>
                      </ul>
                    ) : (
                      <p>{t('dashboard.monitoring.loading')}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p>{t('dashboard.monitoring.loadingMetrics')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};





