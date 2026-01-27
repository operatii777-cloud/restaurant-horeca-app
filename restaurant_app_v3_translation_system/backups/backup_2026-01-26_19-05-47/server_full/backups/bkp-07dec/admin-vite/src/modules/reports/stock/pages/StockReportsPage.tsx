import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Alert, Tabs, Tab, Badge, Row, Col } from 'react-bootstrap';
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
} from 'chart.js';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './StockReportsPage.css';

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

interface IngredientStock {
  id: number;
  name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  category?: string;
}

interface InventorySession {
  id: number;
  session_date: string;
  status: string;
  total_items: number;
  discrepancies: number;
}

interface StockAlert {
  ingredient_id: number;
  ingredient_name: string;
  current_stock: number;
  min_stock: number;
  alert_type: 'low' | 'out' | 'high';
}

export const StockReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('current');
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Data states
  const [ingredients, setIngredients] = useState<IngredientStock[]>([]);
  const [inventorySessions, setInventorySessions] = useState<InventorySession[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [activeTab, startDate, endDate]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case 'current':
          await loadCurrentStock();
          break;
        case 'history':
          await loadInventoryHistory();
          break;
        case 'alerts':
          await loadStockAlerts();
          break;
      }
    } catch (err: any) {
      console.error('Error loading report:', err);
      setError(err.response?.data?.error || 'Eroare la încărcarea raportului');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentStock = async () => {
    const response = await httpClient.get('/api/ingredients');
    if (response.data?.success && Array.isArray(response.data.data)) {
      setIngredients(response.data.data);
    } else if (Array.isArray(response.data)) {
      setIngredients(response.data);
    }
  };

  const loadInventoryHistory = async () => {
    const response = await httpClient.get('/api/inventory/sessions', {
      params: { startDate, endDate },
    });
    if (response.data?.success && Array.isArray(response.data.data)) {
      setInventorySessions(response.data.data);
    } else if (Array.isArray(response.data)) {
      setInventorySessions(response.data);
    }
  };

  const loadStockAlerts = async () => {
    try {
      // Încearcă să obțină alertele din dashboard
      const response = await httpClient.get('/api/admin/dashboard/inventory-alerts');
      if (response.data?.success && Array.isArray(response.data.data)) {
        setStockAlerts(response.data.data);
      } else {
        // Fallback: calculează alertele din ingrediente
        await loadCurrentStock();
        const alerts: StockAlert[] = ingredients
          .filter(ing => ing.current_stock < ing.min_stock)
          .map(ing => ({
            ingredient_id: ing.id,
            ingredient_name: ing.name,
            current_stock: ing.current_stock,
            min_stock: ing.min_stock,
            alert_type: ing.current_stock === 0 ? 'out' : 'low',
          }));
        setStockAlerts(alerts);
      }
    } catch (err) {
      // Fallback: calculează alertele din ingrediente
      await loadCurrentStock();
      const alerts: StockAlert[] = ingredients
        .filter(ing => ing.current_stock < ing.min_stock)
        .map(ing => ({
          ingredient_id: ing.id,
          ingredient_name: ing.name,
          current_stock: ing.current_stock,
          min_stock: ing.min_stock,
          alert_type: ing.current_stock === 0 ? 'out' : 'low',
        }));
      setStockAlerts(alerts);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO');
  };

  const getStockStatus = (ingredient: IngredientStock) => {
    if (ingredient.current_stock === 0) {
      return { badge: 'danger', text: 'STOC EPUIZAT' };
    } else if (ingredient.current_stock < ingredient.min_stock) {
      return { badge: 'warning', text: 'STOC SCĂZUT' };
    } else if (ingredient.max_stock && ingredient.current_stock > ingredient.max_stock) {
      return { badge: 'info', text: 'STOC RIDICAT' };
    }
    return { badge: 'success', text: 'OK' };
  };

  // Chart data for Inventory History
  const getInventoryHistoryChartData = () => {
    return {
      labels: inventorySessions.map((session) => formatDate(session.session_date)),
      datasets: [
        {
          label: 'Total Items',
          data: inventorySessions.map((session) => session.total_items),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Discrepanțe',
          data: inventorySessions.map((session) => session.discrepancies),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Chart data for Stock Alerts
  const getStockAlertsChartData = () => {
    const lowStock = stockAlerts.filter(a => a.alert_type === 'low').length;
    const outOfStock = stockAlerts.filter(a => a.alert_type === 'out').length;
    
    return {
      labels: ['Stoc Scăzut', 'Stoc Epuizat'],
      datasets: [
        {
          label: 'Număr Alerte',
          data: [lowStock, outOfStock],
          backgroundColor: [
            'rgba(255, 206, 86, 0.5)',
            'rgba(255, 99, 132, 0.5)',
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const lowStockCount = ingredients.filter(ing => ing.current_stock < ing.min_stock).length;
  const outOfStockCount = ingredients.filter(ing => ing.current_stock === 0).length;
  const totalValue = ingredients.reduce((sum, ing) => {
    // Estimare valoare (ar trebui să aibă cost_per_unit în backend)
    return sum + (ing.current_stock * 1); // Placeholder
  }, 0);

  return (
    <div className="stock-reports-page">
      <PageHeader
        title="📦 Rapoarte Stoc"
        description="Rapoarte detaliate despre stocuri, inventar și alerte"
      />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3">
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>Total Ingrediente</h6>
              <h4>{ingredients.length}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>Stoc Scăzut</h6>
              <h4 className="text-warning">{lowStockCount}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>Stoc Epuizat</h6>
              <h4 className="text-danger">{outOfStockCount}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6>Valoare Estimată</h6>
              <h4>{totalValue.toFixed(2)} RON</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      {(activeTab === 'history' || activeTab === 'alerts') && (
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Label>Data Start</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Form.Label>Data End</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Form.Label>&nbsp;</Form.Label>
                <div>
                  <Button variant="primary" onClick={loadReport}>
                    <i className="fas fa-sync me-2"></i>Actualizează
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)} className="mb-4">
        <Tab eventKey="current" title="📦 Stocuri Curente">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Situație Stocuri Curente</h5>
              <Badge bg="info">{ingredients.length} ingrediente</Badge>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : ingredients.length === 0 ? (
                <Alert variant="info">Nu există ingrediente în sistem</Alert>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th>Categorie</th>
                      <th>Stoc Curent</th>
                      <th>Stoc Minim</th>
                      <th>Stoc Maxim</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient) => {
                      const status = getStockStatus(ingredient);
                      return (
                        <tr
                          key={ingredient.id}
                          className={
                            ingredient.current_stock < ingredient.min_stock
                              ? 'table-warning'
                              : ingredient.current_stock === 0
                              ? 'table-danger'
                              : ''
                          }
                        >
                          <td><strong>{ingredient.name}</strong></td>
                          <td>{ingredient.category || '—'}</td>
                          <td>
                            <strong>{ingredient.current_stock || 0}</strong> {ingredient.unit}
                          </td>
                          <td>{ingredient.min_stock || 0} {ingredient.unit}</td>
                          <td>{ingredient.max_stock || '—'}</td>
                          <td>
                            <Badge bg={status.badge}>{status.text}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="history" title="📊 Istoric Inventar">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Istoric Sesiuni Inventar</h5>
              <Badge bg="info">{inventorySessions.length} sesiuni</Badge>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : inventorySessions.length === 0 ? (
                <Alert variant="info">Nu există sesiuni de inventar pentru perioada selectată</Alert>
              ) : (
                <>
                  {inventorySessions.length > 0 && (
                    <div className="mb-4" style={{ height: '300px' }}>
                      <Line data={getInventoryHistoryChartData()} options={{ responsive: true }} />
                    </div>
                  )}
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Status</th>
                        <th>Total Items</th>
                        <th>Discrepanțe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventorySessions.map((session) => (
                        <tr key={session.id}>
                          <td>{formatDate(session.session_date)}</td>
                          <td>
                            <Badge bg={session.status === 'completed' ? 'success' : 'warning'}>
                              {session.status}
                            </Badge>
                          </td>
                          <td>{session.total_items}</td>
                          <td>
                            <Badge bg={session.discrepancies > 0 ? 'warning' : 'success'}>
                              {session.discrepancies}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="alerts" title="⚠️ Alerte Stoc">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Alerte Stoc</h5>
              <Badge bg="danger">{stockAlerts.length} alerte</Badge>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>
              ) : stockAlerts.length === 0 ? (
                <Alert variant="success">
                  <i className="fas fa-check-circle me-2"></i>
                  Nu există alerte de stoc! Toate ingredientele au stoc suficient.
                </Alert>
              ) : (
                <>
                  {stockAlerts.length > 0 && (
                    <div className="mb-4" style={{ height: '300px' }}>
                      <Bar data={getStockAlertsChartData()} options={{ responsive: true }} />
                    </div>
                  )}
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Ingredient</th>
                        <th>Stoc Curent</th>
                        <th>Stoc Minim</th>
                        <th>Tip Alertă</th>
                        <th>Acțiune</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockAlerts.map((alert) => (
                        <tr
                          key={alert.ingredient_id}
                          className={alert.alert_type === 'out' ? 'table-danger' : 'table-warning'}
                        >
                          <td><strong>{alert.ingredient_name}</strong></td>
                          <td>
                            <strong className={alert.alert_type === 'out' ? 'text-danger' : 'text-warning'}>
                              {alert.current_stock}
                            </strong>
                          </td>
                          <td>{alert.min_stock}</td>
                          <td>
                            <Badge bg={alert.alert_type === 'out' ? 'danger' : 'warning'}>
                              {alert.alert_type === 'out' ? 'STOC EPUIZAT' : 'STOC SCĂZUT'}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="outline-primary" size="sm">
                              <i className="fas fa-shopping-cart me-1"></i>Comandă
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

