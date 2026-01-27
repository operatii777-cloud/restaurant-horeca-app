// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Alert, Badge } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './CostsPage.css';

interface ProductCost {
  id: number;
  name: string;
  name_en?: string;
  price: number;
  category: string;
  recipe_cost: number;
  profit: number;
  profit_margin: number;
}

interface CostStats {
  avgFoodCost: number;
  avgMargin: number;
  alertsCount: number;
  totalProducts: number;
}

export const CostsPage: React.FC = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductCost[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductCost[]>([]);
  const [stats, setStats] = useState<CostStats>({
    avgFoodCost: 0,
    avgMargin: 0,
    alertsCount: 0,
    totalProducts: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [foodCostFilter, setFoodCostFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, categoryFilter, foodCostFilter, searchTerm]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/costs');
      if (response.data?.success && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
        updateStats(response.data.data);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
        updateStats(response.data);
      }
    } catch (error) {
      console.error('Error loading costs:', error);
      setFeedback({ type: 'error', message: 'Eroare la încărcarea costurilor' });
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (productsData: ProductCost[]) => {
    if (productsData.length === 0) {
      setStats({ avgFoodCost: 0, avgMargin: 0, alertsCount: 0, totalProducts: 0 });
      return;
    }

    const totalFoodCost = productsData.reduce((sum, p) => {
      const foodCostPercent = p.price > 0 ? (p.recipe_cost / p.price) * 100 : 0;
      return sum + foodCostPercent;
    }, 0);

    const totalMargin = productsData.reduce((sum, p) => sum + (p.profit_margin || 0), 0);

    const alertsCount = productsData.filter(p => {
      const foodCostPercent = p.price > 0 ? (p.recipe_cost / p.price) * 100 : 0;
      return foodCostPercent > 35;
    }).length;

    setStats({
      avgFoodCost: totalFoodCost / productsData.length,
      avgMargin: totalMargin / productsData.length,
      alertsCount,
      totalProducts: productsData.length,
    });
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (categoryFilter) {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (foodCostFilter) {
      filtered = filtered.filter(p => {
        const foodCostPercent = p.price > 0 ? (p.recipe_cost / p.price) * 100 : 0;
        switch (foodCostFilter) {
          case 'excellent':
            return foodCostPercent < 25;
          case 'good':
            return foodCostPercent >= 25 && foodCostPercent < 30;
          case 'warning':
            return foodCostPercent >= 30 && foodCostPercent < 35;
          case 'danger':
            return foodCostPercent >= 35;
          default:
            return true;
        }
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name_en?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const getFoodCostLevel = (foodCostPercent: number) => {
    if (foodCostPercent < 25) {
      return { label: 'Excelent', badge: 'success', icon: '✅' };
    } else if (foodCostPercent < 30) {
      return { label: 'Bun', badge: 'info', icon: '👍' };
    } else if (foodCostPercent < 35) {
      return { label: 'Atenție', badge: 'warning', icon: '⚠️' };
    } else {
      return { label: 'Pericol', badge: 'danger', icon: '❌' };
    }
  };

  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)} RON`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTopProducts = () => {
    return [...products]
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  };

  const getBottomProducts = () => {
    return [...products]
      .filter(p => {
        const foodCostPercent = p.price > 0 ? (p.recipe_cost / p.price) * 100 : 0;
        return foodCostPercent >= 30;
      })
      .sort((a, b) => {
        const aPercent = a.price > 0 ? (a.recipe_cost / a.price) * 100 : 0;
        const bPercent = b.price > 0 ? (b.recipe_cost / b.price) * 100 : 0;
        return bPercent - aPercent;
      })
      .slice(0, 5);
  };

  return (
    <div className="costs-page">
      <PageHeader
        title='💵 costuri & preturi'
        description="Analiză costuri, prețuri și profitabilitate produse"
      />

      {feedback && (
        <Alert
          variant={feedback.type === 'error' ? 'danger' : feedback.type === 'success' ? 'success' : 'info'}
          dismissible
          onClose={() => setFeedback(null)}
          className="mt-3"
        >
          {feedback.message}
        </Alert>
      )}

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="stat-card stat-good">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-percentage fa-2x text-info"></i>
                </div>
                <div>
                  <div className="stat-value">{formatPercent(stats.avgFoodCost)}</div>
                  <div className="stat-label">Food Cost Mediu</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stat-card stat-success">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-chart-line fa-2x text-success"></i>
                </div>
                <div>
                  <div className="stat-value">{formatPercent(stats.avgMargin)}</div>
                  <div className="stat-label">"marja medie"</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stat-card stat-warning">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-exclamation-triangle fa-2x text-warning"></i>
                </div>
                <div>
                  <div className="stat-value">{stats.alertsCount}</div>
                  <div className="stat-label">Alerte Food Cost</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stat-card stat-info">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-utensils fa-2x text-primary"></i>
                </div>
                <div>
                  <div className="stat-value">{stats.totalProducts}</div>
                  <div className="stat-label">Produse Analizate</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Food Cost Guidelines */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="fas fa-info-circle me-2"></i>Ghid Food Cost
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-3 mb-3">
              <Badge bg="success" className="p-2 mb-2 d-block">✅ Excelent: &lt; 25%</Badge>
              <p className="small text-muted mb-0">"profitabilitate foarte buna"</p>
            </div>
            <div className="col-md-3 mb-3">
              <Badge bg="info" className="p-2 mb-2 d-block">👍 Bun: 25-30%</Badge>
              <p className="small text-muted mb-0">"profitabilitate acceptabila"</p>
            </div>
            <div className="col-md-3 mb-3">
              <Badge bg="warning" className="p-2 mb-2 d-block">⚠️ Atenție: 30-35%</Badge>
              <p className="small text-muted mb-0">"necesita optimizare"</p>
            </div>
            <div className="col-md-3 mb-3">
              <Badge bg="danger" className="p-2 mb-2 d-block">❌ Pericol: &gt; 35%</Badge>
              <p className="small text-muted mb-0">"pierdere sau profit minim"</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Products Analysis */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>"analiza produse"</h5>
          <div>
            <Button variant="success" className="me-2" onClick={loadProducts}>
              <i className="fas fa-sync-alt me-2"></i>"Actualizează"</Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Filters */}
          <div className="row mb-3">
            <div className="col-md-4">
              <Form.Control
                type="text"
                placeholder='[🔍_cauta_produs]'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Toate Categoriile</option>
                <option value="aperitive">"Aperitive"</option>
                <option value="ciorbe">Ciorbe</option>
                <option value="salate">"Salate"</option>
                <option value="pizza">Pizza</option>
                <option value="paste">Paste</option>
                <option value="feluri_principale">Feluri Principale</option>
                <option value="deserturi">"Deserturi"</option>
                <option value="bauturi">"Băuturi"</option>
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Select
                value={foodCostFilter}
                onChange={(e) => setFoodCostFilter(e.target.value)}
              >
                <option value="">"toate nivelurile"</option>
                <option value="excellent">✅ Excelent (&lt;25%)</option>
                <option value="good">👍 Bun (25-30%)</option>
                <option value="warning">⚠️ Atenție (30-35%)</option>
                <option value="danger">❌ Pericol (&gt;35%)</option>
              </Form.Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Se încarcă...</span>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-calculator fa-4x text-muted mb-3"></i>
              <h5>Nu există date</h5>
              <p className="text-muted">"produsele cu retete definite vor aparea aici autom"</p>
            </div>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Produs</th>
                  <th>Cost Ingrediente</th>
                  <th>"pret vanzare"</th>
                  <th>Food Cost %</th>
                  <th>"Marjă"</th>
                  <th>Profit/Porție</th>
                  <th>Recomandare</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const foodCostPercent = product.price > 0
                    ? (product.recipe_cost / product.price) * 100
                    : 0;
                  const level = getFoodCostLevel(foodCostPercent);

                  return (
                    <tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>
                        <br />
                        <small className="text-muted">{product.category}</small>
                      </td>
                      <td>{formatCurrency(product.recipe_cost)}</td>
                      <td>
                        <strong>{formatCurrency(product.price)}</strong>
                      </td>
                      <td>
                        <strong className={`text-${level.badge}`}>
                          {formatPercent(foodCostPercent)}
                        </strong>
                        <div className="progress mt-1" style={{ height: '8px' }}>
                          <div
                            className={`progress-bar bg-${level.badge}`}
                            style={{ width: `${Math.min(foodCostPercent, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <strong>{formatPercent(product.profit_margin || 0)}</strong>
                      </td>
                      <td>
                        <strong>{formatCurrency(product.profit)}</strong>
                      </td>
                      <td>
                        <Badge bg={level.badge}>
                          {level.icon} {level.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Top/Bottom Products */}
      <div className="row">
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-trophy me-2"></i>Top 5 Cele Mai Profitabile
              </h5>
            </Card.Header>
            <Card.Body>
              {getTopProducts().map((product, index) => (
                <div key={product.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <div>
                    <strong>{index + 1}. {product.name}</strong>
                    <br />
                    <small className="text-muted">{formatCurrency(product.profit)} profit</small>
                  </div>
                  <Badge bg="success">{formatPercent(product.profit_margin || 0)}</Badge>
                </div>
              ))}
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>Top 5 Necesită Atenție
              </h5>
            </Card.Header>
            <Card.Body>
              {getBottomProducts().map((product, index) => {
                const foodCostPercent = product.price > 0
                  ? (product.recipe_cost / product.price) * 100
                  : 0;
                const level = getFoodCostLevel(foodCostPercent);

                return (
                  <div key={product.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                    <div>
                      <strong>{index + 1}. {product.name}</strong>
                      <br />
                      <small className="text-muted">Food Cost: {formatPercent(foodCostPercent)}</small>
                    </div>
                    <Badge bg={level.badge}>{level.icon}</Badge>
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};



