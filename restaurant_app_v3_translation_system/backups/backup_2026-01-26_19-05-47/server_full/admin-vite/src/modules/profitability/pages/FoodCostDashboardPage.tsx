// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S14 - FoodCostDashboardPage PRO Version
 * Dashboard Food Cost cu date din S13 Engine
 */

import { useState, useMemo } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { HelpButton } from '@/shared/components/HelpButton';
import { useDailyCogsSummary } from '../hooks/useDailyCogsSummary';
import { useCategoryProfitability } from '../hooks/useCategoryProfitability';
import { ProfitabilityKpiCard } from '../components/ProfitabilityKpiCard';
import { ProfitabilityAlertCard } from '../components/ProfitabilityAlertCard';
import { CategoryProfitabilityChart } from '../components/CategoryProfitabilityChart';
import { DailyCogsTimelineChart } from '../components/DailyCogsTimelineChart';
import { computeAlerts } from '../utils/profitabilityMappers';
import { useProductProfitability } from '../hooks/useProductProfitability';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './FoodCostDashboardPage.css';

export const FoodCostDashboardPage = () => {
//   const { t } = useTranslation();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');

  // CalculeazÄƒ datele pentru perioada selectatÄƒ
  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
    }

    return {
      dateFrom: startDate.toISOString().split('T')[0],
      dateTo: endDate.toISOString().split('T')[0],
    };
  }, [period]);

  const dailyFilters = useMemo(
    () => ({
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo,
    }),
    'dateRange'
  );

  const { data: dailyData, chartData, kpiBlocks, loading: dailyLoading, refetch: refetchDaily } =
    useDailyCogsSummary(dailyFilters);

  const { data: categoryData, pieChartData, loading: categoryLoading, refetch: refetchCategory } =
    useCategoryProfitability(dailyFilters);

  const { data: productData, loading: productLoading } = useProductProfitability(dailyFilters);

  // CalculeazÄƒ KPI-uri pentru perioada selectatÄƒ
  const periodKpi = useMemo(() => {
    if (dailyData.length === 0) {
      return {
        foodCost: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
        orders: 0,
        avgTicket: 0,
      };
    }

    const totalRevenue = dailyData.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const totalCogs = dailyData.reduce((sum, d) => sum + (d.cogsTotal || 0), 0);
    const avgFoodCost = dailyData.reduce((sum, d) => sum + (d.foodCostPercent || 0), 0) / dailyData.length;

    return {
      foodCost: avgFoodCost,
      revenue: totalRevenue,
      cost: totalCogs,
      profit: totalRevenue - totalCogs,
      orders: dailyData.length, // Aproximare - ar putea fi calculat din orders
      avgTicket: dailyData.length > 0 ? totalRevenue / dailyData.length : 0,
    };
  }, [dailyData]);

  // GenereazÄƒ alerts
  const alerts = useMemo(() => {
    return computeAlerts(productData, categoryData, dailyData);
  }, [productData, categoryData, dailyData]);

  const loading = dailyLoading || categoryLoading || productLoading;

  const handleRefresh = () => {
    refetchDaily();
    refetchCategory();
  };

  const getStatusColor = (foodCostPercent: number, target: number = 30) => {
    if (foodCostPercent <= target) return '#22c55e'; // Green
    if (foodCostPercent <= target + 5) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="food-cost-dashboard-page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <PageHeader
          title="ðŸ’¹ Food Cost Dashboard"
          description="AnalizÄƒ costuri alimentare Ã®n timp real cu S13 COGS Engine"
        />
        <HelpButton
          title="Ajutor - Food Cost Dashboard"
          content={
            <div>
              <h5>ðŸ’¹ Ce este Food Cost Dashboard?</h5>
              <p>
                Food Cost Dashboard oferÄƒ o analizÄƒ completÄƒ a costurilor alimentare Ã®n timp real, 
                folosind S13 COGS Engine pentru calcularea precisÄƒ a costurilor.
              </p>
              <h5 className="mt-4">ðŸ“Š KPIs disponibile</h5>
              <ul>
                <li><strong>Food Cost %</strong> - Procentul costurilor alimentare faÈ›Äƒ de vÃ¢nzÄƒri</li>
                <li><strong>Profit Margin</strong> - Marja de profit</li>
                <li><strong>Contribution Margin</strong> - Marja de contribuÈ›ie</li>
                <li><strong>Target vs Actual</strong> - ComparaÈ›ie Ã®ntre È›intÄƒ È™i realitate</li>
              </ul>
              <h5 className="mt-4">ðŸ“ˆ Grafice disponibile</h5>
              <ul>
                <li><strong>Trend Food Cost (30 Zile)</strong> - EvoluÈ›ia food cost-ului pe ultimele 30 de zile</li>
                <li><strong>DistribuÈ›ie pe Categorii</strong> - AnalizÄƒ profitabilitate pe categorii de produse</li>
              </ul>
              <h5 className="mt-4">ðŸ“… Perioade disponibile</h5>
              <ul>
                <li><strong>"AstÄƒzi"</strong> - AnalizÄƒ pentru ziua curentÄƒ</li>
                <li><strong>Ultimele 7 Zile</strong> - AnalizÄƒ pentru ultima sÄƒptÄƒmÃ¢nÄƒ</li>
                <li><strong>"luna curenta"</strong> - AnalizÄƒ pentru luna curentÄƒ</li>
              </ul>
              <div className="alert alert-info mt-4">
                <strong>ðŸ’¡ Sfat:</strong> Food Cost-ul ideal pentru restaurante este Ã®ntre 25-35%. 
                MonitorizeazÄƒ regulat pentru a identifica oportunitÄƒÈ›i de optimizare.
              </div>
            </div>
          }
        />
      </div>

      {/* Period Selector */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <div className="btn-group" role="group">
            <Button
              variant={period === 'today' ? 'primary' : 'outline-primary'}
              onClick={() => setPeriod('today')}
            >"AstÄƒzi"</Button>
            <Button
              variant={period === 'week' ? 'primary' : 'outline-primary'}
              onClick={() => setPeriod('week')}
            >
              Ultimele 7 Zile
            </Button>
            <Button
              variant={period === 'month' ? 'primary' : 'outline-primary'}
              onClick={() => setPeriod('month')}
            >"luna curenta"</Button>
          </div>
          <Button variant="outline-secondary" onClick={handleRefresh} disabled={loading}>
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} me-1`}></i>"ReÃ®ncarcÄƒ"</Button>
        </Card.Header>
      </Card>

      {/* Period KPI Cards */}
      <Row className="mb-4">
        <Col md={12} lg={2.4}>
          <Card className="period-kpi-card">
            <Card.Body>
              <h6 className="text-muted mb-2">Food Cost</h6>
              <h3
                style={{
                  color: getStatusColor(periodKpi.foodCost),
                }}
              >
                {periodKpi.foodCost.toFixed(1)}%
              </h3>
              <small className="text-muted">"medie perioada"</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={2.4}>
          <Card className="period-kpi-card">
            <Card.Body>
              <h6 className="text-muted mb-2">Venituri</h6>
              <h3>{periodKpi.revenue.toFixed(2)} RON</h3>
              <small className="text-muted">Total</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={2.4}>
          <Card className="period-kpi-card">
            <Card.Body>
              <h6 className="text-muted mb-2">Costuri</h6>
              <h3>{periodKpi.cost.toFixed(2)} RON</h3>
              <small className="text-muted">COGS Total</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={2.4}>
          <Card className="period-kpi-card">
            <Card.Body>
              <h6 className="text-muted mb-2">Profit</h6>
              <h3 className="text-success">{periodKpi.profit.toFixed(2)} RON</h3>
              <small className="text-muted">Profit Brut</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={2.4}>
          <Card className="period-kpi-card">
            <Card.Body>
              <h6 className="text-muted mb-2">Ticket Mediu</h6>
              <h3>{periodKpi.avgTicket.toFixed(2)} RON</h3>
              <small className="text-muted">"per zi"</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        <Col md={12} lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0" style={{ color: '#000000', fontWeight: 600 }}>Trend Food Cost (30 Zile)</h5>
            </Card.Header>
            <Card.Body>
              <DailyCogsTimelineChart data={chartData} loading={loading} height={300} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0" style={{ color: '#000000', fontWeight: 600 }}>DistribuÈ›ie pe Categorii</h5>
            </Card.Header>
            <Card.Body>
              <CategoryProfitabilityChart data={pieChartData} loading={loading} height={300} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      <Row>
        <Col md={12}>
          <ProfitabilityAlertCard alerts={alerts} loading={loading} maxAlerts={10} />
        </Col>
      </Row>
    </div>
  );
};





