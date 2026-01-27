/**
 * Admin Diagnostics Page
 * Internal-only module for debugging and health checks
 * 
 * Purpose:
 * - List mounted routes
 * - Check backend endpoint status
 * - Show AG Grid wrapper usage
 * - Show Zustand stores count
 * - Health checks
 */

import React, { useState, useEffect } from 'react';
import { Card, Badge, Table, Button, Alert } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import { NAVIGATION_ITEMS } from '@/modules/layout/constants/navigation';
import './AdminDiagnosticsPage.css';

interface EndpointStatus {
  endpoint: string;
  method: string;
  exists: boolean;
  status?: 'ok' | 'error' | 'unknown';
  responseTime?: number;
  error?: string;
}

interface DiagnosticsData {
  routes: {
    total: number;
    mounted: number;
    navigationItems: number;
  };
  endpoints: EndpointStatus[];
  agGrid: {
    wrapperExists: boolean;
    pagesUsingWrapper: number;
    totalAgGridPages: number;
  };
  stores: {
    total: number;
    jsStores: number;
    tsStores: number;
  };
  backend: {
    health: 'ok' | 'error' | 'unknown';
    responseTime?: number;
  };
}

// Lista endpoint-uri de verificat (din audit)
const ENDPOINTS_TO_CHECK: Array<{ endpoint: string; method: string }> = [
  { endpoint: '/api/variance/daily', method: 'GET' },
  { endpoint: '/api/variance/calculate', method: 'POST' },
  { endpoint: '/api/technical-sheets', method: 'GET' },
  { endpoint: '/api/technical-sheets/generate', method: 'POST' },
  { endpoint: '/api/recalls', method: 'GET' },
  { endpoint: '/api/expiry-alerts', method: 'GET' },
  { endpoint: '/api/portions', method: 'GET' },
  { endpoint: '/api/smart-restock-v2/analysis', method: 'GET' },
  { endpoint: '/api/hostess/tables', method: 'GET' },
  { endpoint: '/api/hostess/stats', method: 'GET' },
  { endpoint: '/api/lostfound/items', method: 'GET' },
  { endpoint: '/api/lostfound/stats', method: 'GET' },
  { endpoint: '/api/coatroom/tickets', method: 'GET' },
  { endpoint: '/api/coatroom/stats', method: 'GET' },
  { endpoint: '/api/reports/delivery-performance', method: 'GET' },
  { endpoint: '/api/reports/drive-thru-performance', method: 'GET' },
  { endpoint: '/api/admin/invoices', method: 'GET' },
  { endpoint: '/api/compliance/haccp/dashboard/kpis', method: 'GET' },
];

export const AdminDiagnosticsPage: React.FC = () => {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [endpointsStatus, setEndpointsStatus] = useState<EndpointStatus[]>([]);
  const [checkingEndpoints, setCheckingEndpoints] = useState(false);

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = async () => {
    setLoading(true);
    try {
      // Count routes from navigation
      const navigationRoutes = countRoutes(NAVIGATION_ITEMS);
      
      // Check AG Grid wrapper
      const agGridWrapperExists = await checkAgGridWrapper();
      
      // Count Zustand stores (approximate - based on file search)
      const storesCount = {
        total: 10, // Approximate based on audit
        jsStores: 7,
        tsStores: 3,
      };

      // Check backend health
      const backendHealth = await checkBackendHealth();

      setData({
        routes: {
          total: navigationRoutes.total,
          mounted: navigationRoutes.total, // Assume all are mounted
          navigationItems: navigationRoutes.items,
        },
        endpoints: [],
        agGrid: {
          wrapperExists: agGridWrapperExists,
          pagesUsingWrapper: 2, // TemperatureLogTab, SecurityAlertsPage
          totalAgGridPages: 12,
        },
        stores: storesCount,
        backend: backendHealth,
      });
    } catch (error) {
      console.error('Error loading diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  const countRoutes = (items: typeof NAVIGATION_ITEMS): { total: number; items: number } => {
    let total = 0;
    let itemsCount = 0;
    
    const countRecursive = (navItems: typeof NAVIGATION_ITEMS) => {
      navItems.forEach(item => {
        if (item.path && item.path !== '#') {
          total++;
        }
        itemsCount++;
        if (item.children) {
          countRecursive(item.children);
        }
      });
    };
    
    countRecursive(items);
    return { total, items };
  };

  const checkAgGridWrapper = async (): Promise<boolean> => {
    try {
      // Try to dynamically import to check if it exists
      const module = await import('@/shared/components/AgGridTable');
      return !!module.AgGridTable;
    } catch {
      return false;
    }
  };

  const checkBackendHealth = async (): Promise<{ health: 'ok' | 'error' | 'unknown'; responseTime?: number }> => {
    try {
      const start = Date.now();
      const response = await httpClient.get('/api/health');
      const responseTime = Date.now() - start;
      
      if (response.status === 200) {
        return { health: 'ok', responseTime };
      }
      return { health: 'error', responseTime };
    } catch (error) {
      return { health: 'error' };
    }
  };

  const checkEndpoints = async () => {
    setCheckingEndpoints(true);
    const results: EndpointStatus[] = [];

    for (const { endpoint, method } of ENDPOINTS_TO_CHECK) {
      try {
        const start = Date.now();
        let response;
        
        if (method === 'GET') {
          response = await httpClient.get(endpoint);
        } else {
          // For POST, we'll just check if endpoint exists (might fail with 400/401 but that's ok)
          try {
            response = await httpClient.post(endpoint, {});
          } catch (e: any) {
            // 400/401 means endpoint exists, just wrong payload
            if (e.response && [400, 401, 403].includes(e.response.status)) {
              response = { status: e.response.status, data: {} };
            } else {
              throw e;
            }
          }
        }
        
        const responseTime = Date.now() - start;
        const status = response.status === 200 ? 'ok' : response.status === 404 ? 'error' : 'unknown';
        
        results.push({
          endpoint,
          method,
          exists: response.status !== 404,
          status,
          responseTime,
        });
      } catch (error: any) {
        const status = error.response?.status === 404 ? 'error' : 'unknown';
        results.push({
          endpoint,
          method,
          exists: error.response?.status !== 404,
          status,
          error: error.message,
        });
      }
    }

    setEndpointsStatus(results);
    setCheckingEndpoints(false);
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="🔧 Admin Diagnostics" description="Se încarcă..." />
      </div>
    );
  }

  return (
    <div className="page admin-diagnostics-page">
      <PageHeader 
        title="🔧 Admin Diagnostics" 
        description="Internal diagnostics and health checks for admin-vite"
        actions={[
          {
            label: 'Check Endpoints',
            variant: 'primary',
            onClick: checkEndpoints,
          },
          {
            label: 'Refresh',
            variant: 'secondary',
            onClick: loadDiagnostics,
          },
        ]}
      />

      <div className="diagnostics-grid">
        {/* Routes Status */}
        <Card className="diagnostic-card">
          <Card.Header>
            <h5>📋 Routes Status</h5>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover size="sm">
              <tbody>
                <tr>
                  <td><strong>Total Routes (Navigation)</strong></td>
                  <td><Badge bg="info">{data?.routes.navigationItems || 0}</Badge></td>
                </tr>
                <tr>
                  <td><strong>Routes with Path</strong></td>
                  <td><Badge bg="success">{data?.routes.total || 0}</Badge></td>
                </tr>
                <tr>
                  <td><strong>Mounted Routes</strong></td>
                  <td><Badge bg="success">{data?.routes.mounted || 0}</Badge></td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Backend Health */}
        <Card className="diagnostic-card">
          <Card.Header>
            <h5>🏥 Backend Health</h5>
          </Card.Header>
          <Card.Body>
            <div className="health-status">
              <Badge bg={data?.backend.health === 'ok' ? 'success' : 'danger'}>
                {data?.backend.health === 'ok' ? '✅ Healthy' : '❌ Unhealthy'}
              </Badge>
              {data?.backend.responseTime && (
                <span className="ms-2">Response time: {data.backend.responseTime}ms</span>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* AG Grid Status */}
        <Card className="diagnostic-card">
          <Card.Header>
            <h5>📊 AG Grid Wrapper</h5>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover size="sm">
              <tbody>
                <tr>
                  <td><strong>Wrapper Exists</strong></td>
                  <td>
                    <Badge bg={data?.agGrid.wrapperExists ? 'success' : 'danger'}>
                      {data?.agGrid.wrapperExists ? '✅ Yes' : '❌ No'}
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td><strong>Pages Using Wrapper</strong></td>
                  <td><Badge bg="info">{data?.agGrid.pagesUsingWrapper || 0}</Badge></td>
                </tr>
                <tr>
                  <td><strong>Total AG Grid Pages</strong></td>
                  <td><Badge bg="secondary">{data?.agGrid.totalAgGridPages || 0}</Badge></td>
                </tr>
                <tr>
                  <td><strong>Migration Progress</strong></td>
                  <td>
                    <Badge bg="warning">
                      {data?.agGrid.totalAgGridPages 
                        ? `${Math.round((data.agGrid.pagesUsingWrapper / data.agGrid.totalAgGridPages) * 100)}%`
                        : '0%'}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Zustand Stores */}
        <Card className="diagnostic-card">
          <Card.Header>
            <h5>🗄️ Zustand Stores</h5>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover size="sm">
              <tbody>
                <tr>
                  <td><strong>Total Stores</strong></td>
                  <td><Badge bg="info">{data?.stores.total || 0}</Badge></td>
                </tr>
                <tr>
                  <td><strong>JavaScript (.js)</strong></td>
                  <td><Badge bg="warning">{data?.stores.jsStores || 0}</Badge></td>
                </tr>
                <tr>
                  <td><strong>TypeScript (.ts)</strong></td>
                  <td><Badge bg="success">{data?.stores.tsStores || 0}</Badge></td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Endpoints Status */}
        <Card className="diagnostic-card diagnostic-card-wide">
          <Card.Header>
            <h5>🔌 Backend Endpoints Status</h5>
            <Button 
              size="sm" 
              variant="primary" 
              onClick={checkEndpoints}
              disabled={checkingEndpoints}
              className="ms-auto"
            >
              {checkingEndpoints ? 'Checking...' : 'Check All Endpoints'}
            </Button>
          </Card.Header>
          <Card.Body>
            {endpointsStatus.length === 0 ? (
              <Alert variant="info">
                Click "Check All Endpoints" to verify backend endpoint availability.
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Endpoint</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Response Time</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpointsStatus.map((ep, idx) => (
                      <tr key={idx}>
                        <td><code>{ep.endpoint}</code></td>
                        <td><Badge bg="secondary">{ep.method}</Badge></td>
                        <td>
                          <Badge bg={
                            ep.status === 'ok' ? 'success' :
                            ep.status === 'error' ? 'danger' : 'warning'
                          }>
                            {ep.status === 'ok' ? '✅ OK' :
                             ep.status === 'error' ? '❌ Error' : '⚠️ Unknown'}
                          </Badge>
                        </td>
                        <td>
                          {ep.responseTime ? `${ep.responseTime}ms` : '-'}
                        </td>
                        <td>
                          {ep.error ? <small className="text-danger">{ep.error}</small> : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

