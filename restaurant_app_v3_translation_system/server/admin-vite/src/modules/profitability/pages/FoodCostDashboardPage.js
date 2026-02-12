"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S14 - FoodCostDashboardPage PRO Version
 * Dashboard Food Cost cu date din S13 Engine
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodCostDashboardPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var PageHeader_1 = require("@/shared/components/PageHeader");
var HelpButton_1 = require("@/shared/components/HelpButton");
var useDailyCogsSummary_1 = require("../hooks/useDailyCogsSummary");
var useCategoryProfitability_1 = require("../hooks/useCategoryProfitability");
var ProfitabilityAlertCard_1 = require("../components/ProfitabilityAlertCard");
var CategoryProfitabilityChart_1 = require("../components/CategoryProfitabilityChart");
var DailyCogsTimelineChart_1 = require("../components/DailyCogsTimelineChart");
var profitabilityMappers_1 = require("../utils/profitabilityMappers");
var useProductProfitability_1 = require("../hooks/useProductProfitability");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./FoodCostDashboardPage.css");
var FoodCostDashboardPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)('month'), period = _a[0], setPeriod = _a[1];
    // Calculează datele pentru perioada selectată
    var dateRange = (0, react_1.useMemo)(function () {
        var endDate = new Date();
        var startDate = new Date();
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
    var dailyFilters = (0, react_1.useMemo)(function () { return ({
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
    }); }, [dateRange]);
    var _b = (0, useDailyCogsSummary_1.useDailyCogsSummary)(dailyFilters), dailyData = _b.data, chartData = _b.chartData, kpiBlocks = _b.kpiBlocks, dailyLoading = _b.loading, refetchDaily = _b.refetch;
    var _c = (0, useCategoryProfitability_1.useCategoryProfitability)(dailyFilters), categoryData = _c.data, pieChartData = _c.pieChartData, categoryLoading = _c.loading, refetchCategory = _c.refetch;
    var _d = (0, useProductProfitability_1.useProductProfitability)(dailyFilters), productData = _d.data, productLoading = _d.loading;
    // Calculează KPI-uri pentru perioada selectată
    var periodKpi = (0, react_1.useMemo)(function () {
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
        var totalRevenue = dailyData.reduce(function (sum, d) { return sum + (d.revenue || 0); }, 0);
        var totalCogs = dailyData.reduce(function (sum, d) { return sum + (d.cogsTotal || 0); }, 0);
        var avgFoodCost = dailyData.reduce(function (sum, d) { return sum + (d.foodCostPercent || 0); }, 0) / dailyData.length;
        return {
            foodCost: avgFoodCost,
            revenue: totalRevenue,
            cost: totalCogs,
            profit: totalRevenue - totalCogs,
            orders: dailyData.length, // Aproximare - ar putea fi calculat din orders
            avgTicket: dailyData.length > 0 ? totalRevenue / dailyData.length : 0,
        };
    }, [dailyData]);
    // Generează alerts
    var alerts = (0, react_1.useMemo)(function () {
        return (0, profitabilityMappers_1.computeAlerts)(productData, categoryData, dailyData);
    }, [productData, categoryData, dailyData]);
    var loading = dailyLoading || categoryLoading || productLoading;
    var handleRefresh = function () {
        refetchDaily();
        refetchCategory();
    };
    var getStatusColor = function (foodCostPercent, target) {
        if (target === void 0) { target = 30; }
        if (foodCostPercent <= target)
            return '#22c55e'; // Green
        if (foodCostPercent <= target + 5)
            return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };
    return (<div className="food-cost-dashboard-page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <PageHeader_1.PageHeader title="📊 Food Cost Dashboard" description="Analiză costuri alimentare în timp real cu S13 COGS Engine"/>
        <HelpButton_1.HelpButton title="Ajutor - Food Cost Dashboard" content={<div>
              <h5>📊 Ce este Food Cost Dashboard?</h5>
              <p>
                Food Cost Dashboard oferă o analiză completă a costurilor alimentare în timp real,
                folosind S13 COGS Engine pentru calcularea precisă a costurilor.
              </p>
              <h5 className="mt-4">📈 KPIs disponibile</h5>
              <ul>
                <li><strong>Food Cost %</strong> - Procentul costurilor alimentare față de vânzări</li>
                <li><strong>Profit Margin</strong> - Marja de profit</li>
                <li><strong>Contribution Margin</strong> - Marja de contribuție</li>
                <li><strong>Target vs Actual</strong> - Comparație între țintă și realitate</li>
              </ul>
              <h5 className="mt-4">📉 Grafice disponibile</h5>
              <ul>
                <li><strong>Trend Food Cost (30 Zile)</strong> - Evoluția food cost-ului pe ultimele 30 de zile</li>
                <li><strong>Distribuție pe Categorii</strong> - Analiză profitabilitate pe categorii de produse</li>
              </ul>
              <h5 className="mt-4">📅 Perioade disponibile</h5>
              <ul>
                <li><strong>Astăzi</strong> - Analiză pentru ziua curentă</li>
                <li><strong>Ultimele 7 Zile</strong> - Analiză pentru ultima săptămână</li>
                <li><strong>Luna Curentă</strong> - Analiză pentru luna curentă</li>
              </ul>
              <div className="alert alert-info mt-4">
                <strong>💡 Sfat:</strong> Food Cost-ul ideal pentru restaurante este între 25-35%.
                Monitorizează regulat pentru a identifica oportunități de optimizare.
              </div>
            </div>}/>
      </div>

      {/* Period Selector */}
      <react_bootstrap_1.Card className="shadow-sm mb-4">
        <react_bootstrap_1.Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <div className="btn-group" role="group">
            <react_bootstrap_1.Button variant={period === 'today' ? 'primary' : 'outline-primary'} onClick={function () { return setPeriod('today'); }}>Astăzi</react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant={period === 'week' ? 'primary' : 'outline-primary'} onClick={function () { return setPeriod('week'); }}>
              Ultimele 7 Zile
            </react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant={period === 'month' ? 'primary' : 'outline-primary'} onClick={function () { return setPeriod('month'); }}>
              Luna Curentă
            </react_bootstrap_1.Button>
          </div>
          <react_bootstrap_1.Button variant="outline-secondary" onClick={handleRefresh} disabled={loading}>
            <i className={"fas ".concat(loading ? 'fa-spinner fa-spin' : 'fa-sync-alt', " me-1")}></i>Reîncarcă</react_bootstrap_1.Button>
        </react_bootstrap_1.Card.Header>
      </react_bootstrap_1.Card>

      {/* Period KPI Cards */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={12} lg={2.4}>
          <react_bootstrap_1.Card className="period-kpi-card">
            <react_bootstrap_1.Card.Body>
              <h6 className="text-muted mb-2">Food Cost</h6>
              <h3 style={{
            color: getStatusColor(periodKpi.foodCost),
        }}>
                {periodKpi.foodCost.toFixed(1)}%
              </h3>
              <small className="text-muted">Medie perioadă</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={12} lg={2.4}>
          <react_bootstrap_1.Card className="period-kpi-card">
            <react_bootstrap_1.Card.Body>
              <h6 className="text-muted mb-2">Venituri</h6>
              <h3>{periodKpi.revenue.toFixed(2)} RON</h3>
              <small className="text-muted">Total</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={12} lg={2.4}>
          <react_bootstrap_1.Card className="period-kpi-card">
            <react_bootstrap_1.Card.Body>
              <h6 className="text-muted mb-2">Costuri</h6>
              <h3>{periodKpi.cost.toFixed(2)} RON</h3>
              <small className="text-muted">COGS Total</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={12} lg={2.4}>
          <react_bootstrap_1.Card className="period-kpi-card">
            <react_bootstrap_1.Card.Body>
              <h6 className="text-muted mb-2">Profit</h6>
              <h3 className="text-success">{periodKpi.profit.toFixed(2)} RON</h3>
              <small className="text-muted">Profit Brut</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={12} lg={2.4}>
          <react_bootstrap_1.Card className="period-kpi-card">
            <react_bootstrap_1.Card.Body>
              <h6 className="text-muted mb-2">Ticket Mediu</h6>
              <h3>{periodKpi.avgTicket.toFixed(2)} RON</h3>
              <small className="text-muted">Per zi</small>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Charts Row */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={12} lg={8}>
          <react_bootstrap_1.Card className="shadow-sm">
            <react_bootstrap_1.Card.Header className="bg-white">
              <h5 className="mb-0" style={{ color: '#000000', fontWeight: 600 }}>Trend Food Cost (30 Zile)</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <DailyCogsTimelineChart_1.DailyCogsTimelineChart data={chartData} loading={loading} height={300}/>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={12} lg={4}>
          <react_bootstrap_1.Card className="shadow-sm">
            <react_bootstrap_1.Card.Header className="bg-white">
              <h5 className="mb-0" style={{ color: '#000000', fontWeight: 600 }}>Distribuție pe Categorii</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <CategoryProfitabilityChart_1.CategoryProfitabilityChart data={pieChartData} loading={loading} height={300}/>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Alerts */}
      <react_bootstrap_1.Row>
        <react_bootstrap_1.Col md={12}>
          <ProfitabilityAlertCard_1.ProfitabilityAlertCard alerts={alerts} loading={loading} maxAlerts={10}/>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>
    </div>);
};
exports.FoodCostDashboardPage = FoodCostDashboardPage;
