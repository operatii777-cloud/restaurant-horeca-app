// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S14 - CostsPage PRO Version
 * Profitabilitate pe produse cu S13 COGS Engine
 */

import { useState, useMemo } from 'react';
import { Card, Row, Col, Button, Form, Alert, Badge } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { useProductProfitability } from '../hooks/useProductProfitability';
import { syncAllCogs } from '../api/profitabilityApi';
import { ProfitabilityKpiCard } from '../components/ProfitabilityKpiCard';
import { ProductProfitabilityTable } from '../components/ProductProfitabilityTable';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './CostsPage.css';

export const CostsPage: React.FC = () => {
  //   const { t } = useTranslation();
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [foodCostFilter, setFoodCostFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);

  const filters = useMemo(
    () => ({
      dateFrom,
      dateTo,
      categoryCode: categoryFilter || undefined,
    }),
    [dateFrom, dateTo, categoryFilter]
  );

  const { tableRows, stats, loading, error, refetch } = useProductProfitability(filters);

  // Filtrează produsele
  const filteredRows = useMemo(() => {
    let filtered = [...tableRows];

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (foodCostFilter) {
      filtered = filtered.filter((p) => {
        switch (foodCostFilter) {
          case 'excellent':
            return p.foodCostPercent < 25;
          case 'good':
            return p.foodCostPercent >= 25 && p.foodCostPercent < 30;
          case 'warning':
            return p.foodCostPercent >= 30 && p.foodCostPercent < 35;
          case 'danger':
            return p.foodCostPercent >= 35;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [tableRows, searchTerm, foodCostFilter]);

  const handleSyncAll = async () => {
    setSyncingAll(true);
    setFeedback(null);
    try {
      const result = await syncAllCogs();
      if (result.success) {
        setFeedback({
          type: 'success',
          message: `COGS sincronizat pentru ${result.synced || "Toate"} produse!`,
        });
        // Refresh data after sync
        setTimeout(() => {
          refetch();
        }, 1000);
      } else {
        setFeedback({
          type: 'error',
          message: result.message || 'Eroare la sincronizare COGS',
        });
      }
    } catch (error: any) {
      console.error('Error syncing all COGS:', error);
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || error.message || 'Eroare la sincronizare COGS',
      });
    } finally {
      setSyncingAll(false);
    }
  };

  // Calculează KPI blocks
  const kpiBlocks = useMemo(() => {
    return {
      avgFoodCost: {
        title: 'Food Cost Mediu',
        value: `${stats.avgFoodCostPercent.toFixed(1)}%`,
        subtitle: `${stats.totalProducts} produse`,
        color: stats.avgFoodCostPercent > 35 ? 'red' : stats.avgFoodCostPercent > 30 ? 'orange' : 'green',
      } as any,
      avgMargin: {
        title: 'Marjă Medie',
        value: `${stats.avgMarginPercent.toFixed(1)}%`,
        subtitle: 'Profitabilitate',
        color: stats.avgMarginPercent < 50 ? 'orange' : 'green',
      } as any,
      totalProducts: {
        title: 'Produse Analizate',
        value: stats.totalProducts.toString(),
        subtitle: 'Cu rețete definite',
        color: 'blue',
      } as any,
      alertsCount: {
        title: 'Alerte Food Cost',
        value: stats.alertsCount.toString(),
        subtitle: 'Food Cost > 35%',
        color: stats.alertsCount > 0 ? 'red' : 'green',
      } as any,
    };
  }, [stats]);

  // Top/Bottom products
  const topProducts = useMemo(() => {
    return [...filteredRows].sort((a, b) => b.profit - a.profit).slice(0, 5);
  }, [filteredRows]);

  const bottomProducts = useMemo(() => {
    return [...filteredRows]
      .filter((p) => p.foodCostPercent >= 30)
      .sort((a, b) => b.foodCostPercent - a.foodCostPercent)
      .slice(0, 5);
  }, [filteredRows]);

  return (
    <div className="costs-page">
      <PageHeader
        title='💵 Costuri & Prețuri'
        description="Analiză costuri, prețuri și profitabilitate produse cu S13 COGS Engine"
      />

      {error && (
        <Alert variant="danger" dismissible onClose={() => { }}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

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

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={12} lg={3}>
          <ProfitabilityKpiCard kpi={kpiBlocks.avgFoodCost} loading={loading} />
        </Col>
        <Col md={12} lg={3}>
          <ProfitabilityKpiCard kpi={kpiBlocks.avgMargin} loading={loading} />
        </Col>
        <Col md={12} lg={3}>
          <ProfitabilityKpiCard kpi={kpiBlocks.totalProducts} loading={loading} />
        </Col>
        <Col md={12} lg={3}>
          <ProfitabilityKpiCard kpi={kpiBlocks.alertsCount} loading={loading} />
        </Col>
      </Row>

      {/* Filters & Actions */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-filter me-2"></i>Filtre & Acțiuni
          </h5>
          <Button
            variant="success"
            onClick={handleSyncAll}
            disabled={syncingAll || loading}
          >
            <i className={`fas ${syncingAll ? 'fa-spinner fa-spin' : 'fa-sync-alt'} me-2`}></i>
            {syncingAll ? 'Se sincronizează...' : 'Recalculează COGS (Toate Produsele)'}
          </Button>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Label>Perioada de la</Form.Label>
              <Form.Control
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                onBlur={refetch}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Perioada până la</Form.Label>
              <Form.Control
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                onBlur={refetch}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Caută produs</Form.Label>
              <Form.Control
                type="text"
                placeholder='🔍 Caută produs...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Food Cost Level:</Form.Label>
              <Form.Select value={foodCostFilter} onChange={(e) => setFoodCostFilter(e.target.value)}>
                <option value="">Toate nivelurile</option>
                <option value="excellent">✅ Excelent (&lt;25%)</option>
                <option value="good">👍 Bun (25-30%)</option>
                <option value="warning">⚠️ Atenție (30-35%)</option>
                <option value="danger">❌ Pericol (&gt;35%)</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Products Table */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>Analiză Produse ({filteredRows.length} produse)
          </h5>
        </Card.Header>
        <Card.Body>
          <ProductProfitabilityTable
            rows={filteredRows}
            loading={loading}
            onSyncComplete={refetch}
          />
        </Card.Body>
      </Card>

      {/* Top/Bottom Products */}
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-trophy me-2"></i>Top 5 Cele Mai Profitabile
              </h5>
            </Card.Header>
            <Card.Body>
              {topProducts.length === 0 ? (
                <p className="text-muted text-center">Nu există date</p>
              ) : (
                topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom"
                  >
                    <div>
                      <strong>
                        {index + 1}. {product.productName}
                      </strong>
                      <br />
                      <small className="text-muted">
                        {product.profit.toFixed(2)} RON profit | {product.marginPercent.toFixed(1)}% marjă
                      </small>
                    </div>
                    <Badge bg="success">{product.marginPercent.toFixed(1)}%</Badge>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>Top 5 Necesită Atenție
              </h5>
            </Card.Header>
            <Card.Body>
              {bottomProducts.length === 0 ? (
                <p className="text-muted text-center">Nu există produse cu Food Cost ridicat.</p>
              ) : (
                bottomProducts.map((product, index) => {
                  const level =
                    product.foodCostPercent < 25
                      ? { label: 'Excelent', badge: 'success' }
                      : product.foodCostPercent < 30
                        ? { label: 'Bun', badge: 'info' }
                        : product.foodCostPercent < 35
                          ? { label: 'Atenție', badge: 'warning' }
                          : { label: 'Pericol', badge: 'danger' };

                  return (
                    <div
                      key={product.productId}
                      className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom"
                    >
                      <div>
                        <strong>
                          {index + 1}. {product.productName}
                        </strong>
                        <br />
                        <small className="text-muted">
                          Food Cost: {product.foodCostPercent.toFixed(1)}%
                        </small>
                      </div>
                      <Badge bg={level.badge as any}>{level.label}</Badge>
                    </div>
                  );
                })
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};




