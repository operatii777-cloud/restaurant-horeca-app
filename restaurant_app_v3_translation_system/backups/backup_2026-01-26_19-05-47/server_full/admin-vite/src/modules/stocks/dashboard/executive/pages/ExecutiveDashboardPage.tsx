// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './ExecutiveDashboardPage.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface ExecutiveMetrics {
  totalStockValue: number;
  totalTransfers: number;
  complianceRate: number;
  totalVariance: number;
}

interface LocationComparison {
  location_id: number;
  location_name: string;
  location_type: string;
  stock_value: number;
  transfers_count: number;
  compliance_rate: number;
  variance_value: number;
}

interface StockValueByLocation {
  location_id: number;
  location_name: string;
  total_value: number;
}

interface VarianceSummary {
  location_id: number;
  location_name: string;
  total_variance_value: number;
}

interface TopIngredient {
  ingredient_id: number;
  ingredient_name: string;
  category: string;
  transfer_count: number;
  total_quantity: number;
}

export const ExecutiveDashboardPage = () => {
//   const { t } = useTranslation();
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [locationComparison, setLocationComparison] = useState<LocationComparison[]>([]);
  const [stockValue, setStockValue] = useState<StockValueByLocation[]>([]);
  const [varianceSummary, setVarianceSummary] = useState<VarianceSummary[]>([]);
  const [topIngredients, setTopIngredients] = useState<TopIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load all data in parallel
      const [metricsRes, comparisonRes, stockValueRes, varianceRes, topIngredientsRes] = await Promise.all([
        httpClient.get('/api/executive-dashboard/metrics'),
        httpClient.get('/api/executive-dashboard/location-comparison'),
        httpClient.get('/api/executive-dashboard/stock-value'),
        httpClient.get('/api/executive-dashboard/variance-summary'),
        httpClient.get('/api/executive-dashboard/top-ingredients', { params: { limit: 10 } }),
      ]);

      // Process metrics
      if (metricsRes.data?.success && metricsRes.data?.data) {
        const data = metricsRes.data.data;
        setMetrics({
          totalStockValue: parseFloat(String(data.totalStockValue || 0)) || 0,
          totalTransfers: parseInt(String(data.totalTransfers || 0)) || 0,
          complianceRate: parseFloat(String(data.complianceRate || 0)) || 0,
          totalVariance: parseFloat(String(data.totalVariance || 0)) || 0,
        });
      } else if (metricsRes.data && !metricsRes.data.success) {
        // Fallback: try direct access
        setMetrics({
          totalStockValue: parseFloat(String(metricsRes.data.total_stock_value || 0)) || 0,
          totalTransfers: parseInt(String(metricsRes.data.total_transfers || 0)) || 0,
          complianceRate: parseFloat(String(metricsRes.data.compliance_rate || 0)) || 0,
          totalVariance: parseFloat(String(metricsRes.data.total_variance || 0)) || 0,
        });
      }

      // Process location comparison
      if (comparisonRes.data?.success && Array.isArray(comparisonRes.data?.data)) {
        setLocationComparison(comparisonRes.data.data);
      } else if (Array.isArray(comparisonRes.data)) {
        setLocationComparison(comparisonRes.data);
      }

      // Process stock value
      if (stockValueRes.data?.success && Array.isArray(stockValueRes.data?.data)) {
        setStockValue(stockValueRes.data.data);
      } else if (Array.isArray(stockValueRes.data)) {
        setStockValue(stockValueRes.data);
      }

      // Process variance summary
      if (varianceRes.data?.success && Array.isArray(varianceRes.data?.data)) {
        setVarianceSummary(varianceRes.data.data);
      } else if (Array.isArray(varianceRes.data)) {
        setVarianceSummary(varianceRes.data);
      }

      // Process top ingredients
      if (topIngredientsRes.data?.success && Array.isArray(topIngredientsRes.data?.data)) {
        setTopIngredients(topIngredientsRes.data.data);
      } else if (Array.isArray(topIngredientsRes.data)) {
        setTopIngredients(topIngredientsRes.data);
      }
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea datelor dashboard executiv:', err);
      setError(err?.response?.data?.error || err?.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (value: number | string | null | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : (value || 0);
    if (isNaN(numValue)) return '0.00 RON';
    return `${numValue.toFixed(2)} RON`;
  };

  const getComplianceBadgeClass = (rate: number) => {
    if (rate >= 90) return 'bg-success';
    if (rate >= 70) return 'bg-warning';
    return 'bg-danger';
  };

  // Chart data for Stock Value
  const stockValueChartData = {
    labels: stockValue.map((loc) => loc.location_name),
    datasets: [
      {
        label: 'Valoare Stoc (RON)',
        data: stockValue.map((loc) => {
          const value = typeof loc.total_value === 'string' ? parseFloat(loc.total_value) : (loc.total_value || 0);
          return isNaN(value) ? 0 : value;
        }),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const stockValueChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return value.toLocaleString('ro-RO') + ' RON';
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return context.parsed.y.toLocaleString('ro-RO') + ' RON';
          },
        },
      },
    },
  };

  // Chart data for Variance Distribution (Doughnut)
  const varianceChartData = {
    labels: varianceSummary.map((item) => item.location_name),
    datasets: [
      {
        label: 'Varianță (RON)',
        data: varianceSummary.map((item) => {
          const value = typeof item.total_variance_value === 'string' ? parseFloat(item.total_variance_value) : (item.total_variance_value || 0);
          return isNaN(value) ? 0 : value;
        }),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const varianceChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return context.label + ': ' + context.parsed.toLocaleString('ro-RO') + ' RON';
          },
        },
      },
    },
  };

  const handleExportConsolidated = () => {
    window.open('/api/export/consolidated?format=excel', '_blank');
  };

  if (loading) {
    return (
      <div className="executive-dashboard-page">
        <PageHeader
          title="dashboard executiv multi gestiune"
          description="Vizualizare consolidată a tuturor metricilor pentru toate locațiile"
        />
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">"se incarca dashboard ul executiv"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="executive-dashboard-page">
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-tachometer-alt me-2"></i>"dashboard executiv multi gestiune"</h5>
          <div>
            <Button variant="success" size="sm" className="me-2" onClick={handleExportConsolidated}>
              <i className="fas fa-file-excel me-1"></i>Export Consolidat
            </Button>
            <Button variant="light" size="sm" onClick={loadData}>
              <i className="fas fa-sync-alt me-1"></i>"Reîmprospătare"</Button>
          </div>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
              {error}
            </Alert>
          )}

          {/* KPI Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="bg-primary text-white">
                <Card.Body className="text-center">
                  <h5>Total Valoare Stoc</h5>
                  <h2>{metrics ? formatCurrency(metrics.totalStockValue) : '0 RON'}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-info text-white">
                <Card.Body className="text-center">
                  <h5>Total Transferuri</h5>
                  <h2>{metrics ? metrics.totalTransfers : 0}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-success text-white">
                <Card.Body className="text-center">
                  <h5>Rata Conformitate</h5>
                  <h2>{metrics ? `${metrics.complianceRate.toFixed(1)}%` : '0%'}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-danger text-white">
                <Card.Body className="text-center">
                  <h5>"total varianta"</h5>
                  <h2>{metrics ? formatCurrency(metrics.totalVariance) : '0 RON'}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Row */}
          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">"valoare stoc per locatie"</h6>
                </Card.Header>
                <Card.Body>
                  {stockValue.length === 0 ? (
                    <p className="text-muted text-center py-4">"nu exista date disponibile"</p>
                  ) : (
                    <div style={{ height: '300px' }}>
                      <Bar data={stockValueChartData} options={stockValueChartOptions} />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">"distributie varianta per locatie"</h6>
                </Card.Header>
                <Card.Body>
                  {varianceSummary.length === 0 ? (
                    <p className="text-muted text-center py-4">"nu exista date disponibile"</p>
                  ) : (
                    <div style={{ height: '300px' }}>
                      <Doughnut data={varianceChartData} options={varianceChartOptions} />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Location Comparison Table */}
          <Row className="mb-4">
            <Col md={12}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">"comparatie kpi per locatie"</h6>
                </Card.Header>
                <Card.Body>
                  {locationComparison.length === 0 ? (
                    <p className="text-muted text-center py-4">"nu exista date disponibile"</p>
                  ) : (
                    <Table hover size="sm" responsive>
                      <thead className="table-light">
                        <tr>
                          <th>Locație</th>
                          <th>Tip</th>
                          <th className="text-end">Valoare Stoc (RON)</th>
                          <th className="text-center">Nr. Transferuri</th>
                          <th className="text-center">Conformitate (%)</th>
                          <th className="text-end">Varianță (RON)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {locationComparison.map((location) => (
                          <tr key={location.location_id}>
                            <td><strong>{location.location_name}</strong></td>
                            <td>
                              <Badge bg="secondary">{location.location_type}</Badge>
                            </td>
                            <td className="text-end">{formatCurrency(location.stock_value)}</td>
                            <td className="text-center">{location.transfers_count}</td>
                            <td className="text-center">
                              <Badge bg={getComplianceBadgeClass(parseFloat(String(location.compliance_rate || 0)))}>
                                {parseFloat(String(location.compliance_rate || 0)).toFixed(1)}%
                              </Badge>
                            </td>
                            <td
                              className={`text-end ${
                                parseFloat(String(location.variance_value || 0)) > 0 ? 'text-danger' : 'text-success'
                              }`}
                            >
                              {formatCurrency(location.variance_value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Top Ingredients */}
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">Top 10 Ingrediente cu Mișcare Mare</h6>
                </Card.Header>
                <Card.Body>
                  {topIngredients.length === 0 ? (
                    <p className="text-muted text-center py-4">"nu exista date disponibile"</p>
                  ) : (
                    <Table size="sm" responsive>
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Ingredient</th>
                          <th>Categorie</th>
                          <th className="text-center">Nr. Transferuri</th>
                          <th className="text-end">Cantitate Totală</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topIngredients.map((ing, index) => (
                          <tr key={ing.ingredient_id}>
                            <td>{index + 1}</td>
                            <td>{ing.ingredient_name}</td>
                            <td>{ing.category}</td>
                            <td className="text-center">{ing.transfer_count}</td>
                            <td className="text-end">{parseFloat(String(ing.total_quantity || 0)).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};



