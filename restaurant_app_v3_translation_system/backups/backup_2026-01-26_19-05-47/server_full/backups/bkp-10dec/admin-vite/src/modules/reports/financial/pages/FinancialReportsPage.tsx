import React, { useState } from 'react';
import { Card, Button, Form, Alert, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { ProfitLossPage } from '@/modules/reports/pages/ProfitLossPage';
import {
  useDailyFinancialSummary,
  usePnl,
  useCashflow,
  useCategoryMix,
} from '@/modules/reports/hooks/useFinancialReports';
import { FinancialKpiCard } from '@/modules/reports/components/financial/FinancialKpiCard';
import { FinancialPnlChart } from '@/modules/reports/components/financial/FinancialPnlChart';
import { FinancialCashflowChart } from '@/modules/reports/components/financial/FinancialCashflowChart';
import { CategoryMixChart } from '@/modules/reports/components/financial/CategoryMixChart';
import { DailySummaryTable } from '@/modules/reports/components/financial/DailySummaryTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './FinancialReportsPage.css';

export const FinancialReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // S15 Hooks - using new financial API
  const filters = { dateFrom: startDate, dateTo: endDate };
  const dailySummary = useDailyFinancialSummary(filters);
  const pnl = usePnl(filters);
  const cashflow = useCashflow(filters);
  const categoryMix = useCategoryMix(filters);

  // Combined loading state
  const isLoading =
    dailySummary.isLoading ||
    pnl.isLoading ||
    cashflow.isLoading ||
    categoryMix.isLoading;

  // Combined error state
  const error =
    dailySummary.error ||
    pnl.error ||
    cashflow.error ||
    categoryMix.error;

  const handleRefresh = () => {
    dailySummary.refetch();
    pnl.refetch();
    cashflow.refetch();
    categoryMix.refetch();
  };

  return (
    <div className="financial-reports-page">
      <PageHeader
        title="💰 Rapoarte Financiare"
        description="Rapoarte financiare complete: Profit & Loss, TVA, venituri și analiză financiară"
      />

      {error && (
        <Alert variant="danger" dismissible onClose={() => {}} className="mt-3">
          {error}
        </Alert>
      )}

      {/* KPI Row */}
      {pnl.data && (
        <Row className="mb-4">
          <Col md={3}>
            <FinancialKpiCard
              title="Total Revenue"
              value={pnl.data.revenue}
              variant="success"
              format="currency"
            />
          </Col>
          <Col md={3}>
            <FinancialKpiCard
              title="Total COGS"
              value={pnl.data.cogsTotal}
              variant="danger"
              format="currency"
            />
          </Col>
          <Col md={3}>
            <FinancialKpiCard
              title="Gross Profit"
              value={pnl.data.grossProfit}
              variant="success"
              format="currency"
            />
          </Col>
          <Col md={3}>
            <FinancialKpiCard
              title="Food Cost %"
              value={pnl.data.foodCostPercent}
              variant={pnl.data.foodCostPercent > 40 ? 'danger' : pnl.data.foodCostPercent > 30 ? 'warning' : 'success'}
              format="percent"
            />
          </Col>
        </Row>
      )}

      {pnl.data && (
        <Row className="mb-4">
          <Col md={3}>
            <FinancialKpiCard
              title="Net Profit"
              value={pnl.data.netProfit}
              variant={pnl.data.netProfit >= 0 ? 'success' : 'danger'}
              format="currency"
              subtitle={pnl.data.operatingExpenses > 0 ? 'After operating expenses' : 'Estimated (no operating expenses)'}
            />
          </Col>
          <Col md={3}>
            <FinancialKpiCard
              title="Margin %"
              value={pnl.data.marginPercent}
              variant={pnl.data.marginPercent > 60 ? 'success' : pnl.data.marginPercent > 40 ? 'warning' : 'danger'}
              format="percent"
            />
          </Col>
          {cashflow.data && (
            <>
              <Col md={3}>
                <FinancialKpiCard
                  title="Net Cashflow"
                  value={cashflow.data.netCashflow}
                  variant={cashflow.data.netCashflow >= 0 ? 'success' : 'danger'}
                  format="currency"
                />
              </Col>
              <Col md={3}>
                <FinancialKpiCard
                  title="Total Inflows"
                  value={cashflow.data.inflows.total}
                  variant="primary"
                  format="currency"
                />
              </Col>
            </>
          )}
        </Row>
      )}

      {/* Filters */}
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
                <Button variant="primary" onClick={handleRefresh} disabled={isLoading}>
                  <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-sync'} me-2`}></i>
                  {isLoading ? 'Se încarcă...' : 'Actualizează'}
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)} className="mb-4">
        <Tab eventKey="overview" title="📊 Overview">
          <Row className="mb-4">
            <Col md={12}>
              {dailySummary.data && dailySummary.data.length > 0 && (
                <FinancialPnlChart
                  data={dailySummary.data}
                  chartType="bar"
                  title="Profit & Loss Timeline"
                />
              )}
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              {cashflow.data && (
                <FinancialCashflowChart
                  data={cashflow.data}
                  title="Cashflow Analysis"
                />
              )}
            </Col>
            <Col md={6}>
              {categoryMix.data && categoryMix.data.categories.length > 0 && (
                <CategoryMixChart
                  categories={categoryMix.data.categories}
                  chartType="pie"
                  title="Category Mix"
                />
              )}
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="daily" title="📅 Daily Summary">
          {dailySummary.data && dailySummary.data.length > 0 ? (
            <DailySummaryTable
              data={dailySummary.data}
              title="Daily Financial Summary"
            />
          ) : (
            <Alert variant="info">Nu există date pentru perioada selectată</Alert>
          )}
        </Tab>

        <Tab eventKey="category-mix" title="📊 Category Mix">
          <Row>
            <Col md={12}>
              {categoryMix.data && categoryMix.data.categories.length > 0 && (
                <>
                  <CategoryMixChart
                    categories={categoryMix.data.categories}
                    chartType="bar"
                    title="Category Mix - Revenue Share"
                  />
                  <Card className="mt-4">
                    <Card.Header>
                      <h5 className="mb-0">Category Details</h5>
                    </Card.Header>
                    <Card.Body>
                      <Table striped hover responsive>
                        <thead>
                          <tr>
                            <th>Categorie</th>
                            <th className="text-end">Venituri</th>
                            <th className="text-end">COGS</th>
                            <th className="text-end">Profit Brut</th>
                            <th className="text-end">Food Cost %</th>
                            <th className="text-end">Margin %</th>
                            <th className="text-end">Share of Revenue %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoryMix.data.categories
                            .sort((a, b) => b.shareOfRevenue - a.shareOfRevenue)
                            .map((cat, index) => (
                              <tr key={index}>
                                <td>
                                  <strong>{cat.categoryName}</strong>
                                </td>
                                <td className="text-end">{cat.revenue.toFixed(2)} RON</td>
                                <td className="text-end">{cat.cogsTotal.toFixed(2)} RON</td>
                                <td className="text-end">
                                  <strong className={cat.grossProfit >= 0 ? 'text-success' : 'text-danger'}>
                                    {cat.grossProfit.toFixed(2)} RON
                                  </strong>
                                </td>
                                <td className="text-end">
                                  <span
                                    className={
                                      cat.foodCostPercent > 40
                                        ? 'text-danger'
                                        : cat.foodCostPercent > 30
                                        ? 'text-warning'
                                        : 'text-success'
                                    }
                                  >
                                    {cat.foodCostPercent.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="text-end">
                                  <span
                                    className={
                                      cat.marginPercent > 60
                                        ? 'text-success'
                                        : cat.marginPercent > 40
                                        ? 'text-warning'
                                        : 'text-danger'
                                    }
                                  >
                                    {cat.marginPercent.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="text-end">
                                  <strong>{cat.shareOfRevenue.toFixed(1)}%</strong>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </>
              )}
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="profit-loss" title="💰 Profit & Loss">
          <ProfitLossPage />
        </Tab>
      </Tabs>
    </div>
  );
};

