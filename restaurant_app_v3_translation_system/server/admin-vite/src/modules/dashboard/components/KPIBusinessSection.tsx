
import { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Table, Button } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { httpClient } from '@/shared/api/httpClient';
import { getSocket, isSocketConnected } from '@/core/sockets/socketClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './KPIBusinessSection.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TopProduct {
  product_name: string;
  category: string;
  quantity_sold: number;
  revenue: number;
  percentage: number;
}

interface KPIData {
  todayRevenue: number;
  revenueChange: string;
  inventoryAlerts: number;
  customerRetention: number;
  cogsToday: number;
  tableTurnover: string;
  tableUtilization: string;
  avgRating: number;
  totalFeedback: number;
  excellentCount: number;
  lowRatingCount: number;
  todayOrders: number;
  todayOrdersChange: string;
  todayProfit: number;
  profitMargin: number;
  topProducts: TopProduct[];
  revenueMarginData: Array<{
    date: string;
    revenue: number;
    margin: number;
  }>;
  // NOU: Delivery/Drive-Thru/Takeaway metrics
  deliveryActive?: number;
  deliveryAvgTime?: string;
  drivethruActive?: number;
  drivethruAvgTime?: string;
  takeawayActive?: number;
  takeawayAvgTime?: string;
}

export const KPIBusinessSection = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // Load KPI data (wrapped in useCallback for stability)
  const loadKPIData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/admin/dashboard/kpi');

      if (response.data) {
        // Normalize response - API might return { success, kpi, ... } or direct data
        const data = response.data.kpi || response.data;
        
        // Helper function pentru a converti la număr
        const toNumber = (value: any, defaultValue: number = 0): number => {
          if (typeof value === 'number') return value;
          if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? defaultValue : parsed;
          }
          return defaultValue;
        };
        
        // Ensure arrays exist with fallback to empty arrays
        const normalizedData: KPIData = {
          todayRevenue: toNumber(data.todayRevenue, 0),
          revenueChange: data.revenueChange || '0%',
          inventoryAlerts: toNumber(data.inventoryAlerts, 0),
          customerRetention: toNumber(data.customerRetention, 0),
          cogsToday: toNumber(data.cogsToday, 0),
          tableTurnover: data.tableTurnover || '0x',
          tableUtilization: data.tableUtilization || '0/0',
          avgRating: toNumber(data.avgRating, 0),
          totalFeedback: toNumber(data.totalFeedback, 0),
          excellentCount: toNumber(data.excellentCount, 0),
          lowRatingCount: toNumber(data.lowRatingCount, 0),
          todayOrders: toNumber(data.todayOrders, 0),
          todayOrdersChange: data.todayOrdersChange || '0%',
          todayProfit: toNumber(data.todayProfit, 0),
          profitMargin: toNumber(data.profitMargin, 0),
          topProducts: Array.isArray(data.topProducts) ? data.topProducts : [],
          revenueMarginData: Array.isArray(data.revenueMarginData) ? data.revenueMarginData : [],
          deliveryActive: data.deliveryActive || 0,
          deliveryAvgTime: data.deliveryAvgTime || 'N/A',
          drivethruActive: data.drivethruActive || 0,
          drivethruAvgTime: data.drivethruAvgTime || 'N/A',
          takeawayActive: data.takeawayActive || 0,
          takeawayAvgTime: data.takeawayAvgTime || 'N/A',
        };
        
        setKpiData(normalizedData);
      } else {
        // Fallback: use mock data for development
        setKpiData({
          todayRevenue: 12500,
          revenueChange: '+12.5% față de ieri',
          inventoryAlerts: 8,
          customerRetention: 68,
          cogsToday: 4500,
          tableTurnover: '2.3x',
          tableUtilization: '145/200',
          avgRating: 4.5,
          totalFeedback: 127,
          excellentCount: 89,
          lowRatingCount: 3,
          todayOrders: 156,
          todayOrdersChange: '+8.3% față de ieri',
          todayProfit: 8000,
          profitMargin: 64,
          deliveryActive: 0,
          deliveryAvgTime: 'N/A',
          drivethruActive: 0,
          drivethruAvgTime: 'N/A',
          takeawayActive: 0,
          takeawayAvgTime: 'N/A',
          topProducts: [
            { product_name: 'Pizza Margherita', category: 'Pizza', quantity_sold: 45, revenue: 1125, percentage: 9.0 },
            { product_name: 'Pasta Carbonara', category: 'Pasta', quantity_sold: 32, revenue: 960, percentage: 7.7 },
            { product_name: 'Salată Cezar', category: 'Salate', quantity_sold: 28, revenue: 700, percentage: 5.6 },
            { product_name: 'Tiramisu', category: 'Desert', quantity_sold: 25, revenue: 625, percentage: 5.0 },
            { product_name: 'Coca Cola', category: 'Băuturi', quantity_sold: 120, revenue: 600, percentage: 4.8 },
          ],
          revenueMarginData: [
            { date: '2025-01-15', revenue: 11000, margin: 62 },
            { date: '2025-01-16', revenue: 12000, margin: 63 },
            { date: '2025-01-17', revenue: 11500, margin: 61 },
            { date: '2025-01-18', revenue: 13000, margin: 64 },
            { date: '2025-01-19', revenue: 12500, margin: 63 },
            { date: '2025-01-20', revenue: 12800, margin: 64 },
            { date: '2025-01-21', revenue: 12500, margin: 63 },
          ],
        });
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea KPI-urilor:', error);
      // Fallback: use mock data
      setKpiData({
        todayRevenue: 12500,
        revenueChange: '+12.5% față de ieri',
        inventoryAlerts: 8,
        customerRetention: 68,
        cogsToday: 4500,
        tableTurnover: '2.3x',
        tableUtilization: '145/200',
        avgRating: 4.5,
        totalFeedback: 127,
        excellentCount: 89,
        lowRatingCount: 3,
        todayOrders: 156,
        todayOrdersChange: '+8.3% față de ieri',
        todayProfit: 8000,
        profitMargin: 64,
        topProducts: [
          { product_name: 'Pizza Margherita', category: 'Pizza', quantity_sold: 45, revenue: 1125, percentage: 9.0 },
          { product_name: 'Pasta Carbonara', category: 'Pasta', quantity_sold: 32, revenue: 960, percentage: 7.7 },
          { product_name: 'Salată Cezar', category: 'Salate', quantity_sold: 28, revenue: 700, percentage: 5.6 },
          { product_name: 'Tiramisu', category: 'Desert', quantity_sold: 25, revenue: 625, percentage: 5.0 },
          { product_name: 'Coca Cola', category: 'Băuturi', quantity_sold: 120, revenue: 600, percentage: 4.8 },
        ],
        revenueMarginData: [
          { date: '2025-01-15', revenue: 11000, margin: 62 },
          { date: '2025-01-16', revenue: 12000, margin: 63 },
          { date: '2025-01-17', revenue: 11500, margin: 61 },
          { date: '2025-01-18', revenue: 13000, margin: 64 },
          { date: '2025-01-19', revenue: 12500, margin: 63 },
          { date: '2025-01-20', revenue: 12800, margin: 64 },
          { date: '2025-01-21', revenue: 12500, margin: 63 },
        ],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadKPIData();
  }, [loadKPIData]);

  // Socket.IO real-time updates
  useEffect(() => {
    const socket = getSocket();
    setSocketConnected(isSocketConnected());

    // Handle connection status
    const handleConnect = () => {
      console.log('✅ Dashboard: Socket.IO connected');
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      console.log('⚠️ Dashboard: Socket.IO disconnected');
      setSocketConnected(false);
    };

    // Handle order updates - refresh dashboard when orders change
    const handleOrderUpdate = () => {
      console.log('📊 Dashboard: Order updated, refreshing KPIs...');
      loadKPIData();
    };

    // Handle stock updates - refresh dashboard when inventory changes
    const handleStockUpdate = () => {
      console.log('📦 Dashboard: Stock updated, refreshing KPIs...');
      loadKPIData();
    };

    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('orderUpdated', handleOrderUpdate);
    socket.on('stockUpdated', handleStockUpdate);

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('orderUpdated', handleOrderUpdate);
      socket.off('stockUpdated', handleStockUpdate);
    };
  }, [loadKPIData]);

  if (loading) {
    return (
      <div className="kpi-business-section">
        <Card className="shadow-sm">
          <Card.Body>
              <div className="text-center">
                <i className="fas fa-spinner fa-spin me-2"></i>Se încarcă KPI-urile business...</div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (!kpiData) {
    return null;
  }

  // Ensure arrays exist with fallback to empty arrays
  const revenueMarginData = Array.isArray(kpiData.revenueMarginData) ? kpiData.revenueMarginData : [];
  const topProducts = Array.isArray(kpiData.topProducts) ? kpiData.topProducts : [];

  const revenueMarginChartData = {
    labels: revenueMarginData.map((item) =>
      new Date(item.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' }),
    ),
    datasets: [
      {
        label: 'Venituri (RON)',
        data: revenueMarginData.map((item) => item.revenue),
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Marjă Brută (%)',
        data: revenueMarginData.map((item) => item.margin),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const revenueMarginChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            if (context.datasetIndex === 0) {
              return `Venituri: ${context.parsed.y.toFixed(2)} RON`;
            } else {
              return `Marjă: ${context.parsed.y.toFixed(2)}%`;
            }
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Venituri (RON)',
        },
        ticks: {
          callback: function (value: any) {
            return value.toFixed(0) + ' RON';
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Marjă (%)',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function (value: any) {
            return value.toFixed(0) + '%';
          },
        },
      },
    },
  };

  return (
    <div className="kpi-business-section">
      <h3 className="kpi-section-title">
        <i className="fas fa-chart-line me-2"></i>KPI Business
      </h3>

      {/* Row 1: Revenue, Orders, Profit, COGS */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="metric-card text-white bg-primary">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.todayRevenue.toFixed(2)} RON</h4>
                  <small>Venituri Astăzi</small>
                </div>
                <i className="fas fa-coins fa-2x"></i>
              </div>
              <small className="mt-2 d-block">{kpiData.revenueChange}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card text-white" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.todayOrders}</h4>
                  <small>Comenzi Astăzi</small>
                </div>
                <i className="fas fa-shopping-cart fa-2x"></i>
              </div>
              <small className="mt-2 d-block">{kpiData.todayOrdersChange}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card text-white" style={{ background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)' }}>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.todayProfit.toFixed(2)} RON</h4>
                  <small>Profit Astăzi</small>
                </div>
                <i className="fas fa-chart-line fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Marjă: {kpiData.profitMargin.toFixed(1)}%</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card text-white bg-danger">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.cogsToday.toFixed(2)} RON</h4>
                  <small>COGS Astăzi</small>
                </div>
                <i className="fas fa-calculator fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Cost ingrediente vândute</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Row 1.5: Alerts, Retention */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="metric-card text-white bg-warning">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.inventoryAlerts}</h4>
                  <small>Alerte Stoc</small>
                </div>
                <i className="fas fa-exclamation-triangle fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Produse sub minim stoc</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="metric-card text-white bg-success">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.customerRetention}%</h4>
                  <small>Retenție Clienți</small>
                </div>
                <i className="fas fa-users fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Clienți care revin</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Row 1.5: Table Turnover & Utilization */}
      <Row className="mb-4">
        <Col md={6}>
          <Card
            className="metric-card text-white"
            style={{ background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)' }}
          >
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.tableTurnover}</h4>
                  <small>🔄 Rotație Mese</small>
                </div>
                <i className="fas fa-sync-alt fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Grupuri per masă ocupată</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card
            className="metric-card text-white"
            style={{ background: 'linear-gradient(135deg, #6610f2 0%, #5a0dd6 100%)' }}
          >
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.tableUtilization}</h4>
                  <small>📊 Utilizare Mese</small>
                </div>
                <i className="fas fa-table fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Mese folosite din 200</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Row 2: Delivery, Drive-Thru, Takeaway Metrics - NOU */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="metric-card text-white" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>🛵 Delivery</h4>
                  <small>Active: {kpiData.deliveryActive || 0}</small>
                </div>
                <i className="fas fa-motorcycle fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Timp mediu: {kpiData.deliveryAvgTime || 'N/A'}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="metric-card text-white" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>🚗 Drive-Thru</h4>
                  <small>Active: {kpiData.drivethruActive || 0}</small>
                </div>
                <i className="fas fa-car fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Timp mediu: {kpiData.drivethruAvgTime || 'N/A'}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="metric-card text-white" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>📦 Takeaway</h4>
                  <small>Active: {kpiData.takeawayActive || 0}</small>
                </div>
                <i className="fas fa-shopping-bag fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Timp mediu: {kpiData.takeawayAvgTime || 'N/A'}</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Row 2: Feedback Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="metric-card text-white bg-info">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.avgRating.toFixed(1)}★</h4>
                  <small>🌍 Rating Mediu OVERALL</small>
                </div>
                <i className="fas fa-star fa-2x"></i>
              </div>
              <small className="mt-2 d-block">{kpiData.totalFeedback} evaluări (overall)</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card
            className="metric-card text-white"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.excellentCount}</h4>
                  <small>⭐ Rating-uri 5★ (OVERALL)</small>
                </div>
                <i className="fas fa-heart fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Clienți foarte mulțumiți</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="metric-card text-white bg-warning">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{kpiData.lowRatingCount}</h4>
                  <small>⚠️ Rating-uri ≤2★ (OVERALL)</small>
                </div>
                <i className="fas fa-exclamation-circle fa-2x"></i>
              </div>
              <small className="mt-2 d-block">Necesită atenție urgentă</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Row 3: Revenue & Margin Chart + Top Products */}
      <Row className="mb-4">
        <Col md={7}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-area me-1"></i> Evoluție Venituri & Marjă Brută (Ultimele 7 zile)
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Line data={revenueMarginChartData} options={revenueMarginChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-trophy me-1"></i> Top 5 Produse Astăzi
              </h5>
              <Button variant="link" size="sm" onClick={loadKPIData}>
                <i className="fas fa-sync-alt"></i>
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive" style={{ maxHeight: '300px', overflowY: "Auto" }}>
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Produs</th>
                      <th>Cantitate</th>
                      <th>Venit</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center text-muted">Nu există date disponibile</td>
                      </tr>
                    ) : (
                      topProducts.map((product, index) => {
                        const revenue = typeof product.revenue === 'number' ? product.revenue : (parseFloat(String(product.revenue || 0)) || 0);
                        const percentage = typeof product.percentage === 'number' ? product.percentage : (parseFloat(String(product.percentage || 0)) || 0);
                        return (
                          <tr key={index}>
                            <td>
                              <strong>{product.product_name || 'N/A'}</strong>
                              <br />
                              <small className="text-muted">{product.category || ''}</small>
                            </td>
                            <td>{product.quantity_sold || 0}</td>
                            <td>{revenue.toFixed(2)} RON</td>
                            <td>
                              <span className="badge bg-info">{percentage.toFixed(1)}%</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Row 4: Top Products Bar Chart */}
      <Row>
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-bar me-1"></i>Top Produse - Distribuție Venituri</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '250px' }}>
                <Bar
                  data={{
                    labels: topProducts.map((p) => p.product_name),
                    datasets: [
                      {
                        label: 'Venit (RON)',
                        data: topProducts.map((p) => p.revenue),
                        backgroundColor: [
                          'rgba(37, 99, 235, 0.8)',
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(251, 191, 36, 0.8)',
                          'rgba(239, 68, 68, 0.8)',
                          'rgba(139, 92, 246, 0.8)',
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context: any) {
                            const product = topProducts[context.dataIndex];
                            if (!product) return `Venit: ${context.parsed.y.toFixed(2)} RON`;
                            const percentage = typeof product.percentage === 'number' ? product.percentage : (parseFloat(String(product.percentage || 0)) || 0);
                            return `Venit: ${context.parsed.y.toFixed(2)} RON (${percentage.toFixed(1)}%)`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Venit (RON)',
                        },
                      },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};




