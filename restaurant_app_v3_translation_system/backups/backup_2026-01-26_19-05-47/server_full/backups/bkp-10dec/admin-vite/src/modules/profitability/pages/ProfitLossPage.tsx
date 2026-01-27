/**
 * S14 - ProfitLossPage PRO Version
 * Raport Profit & Loss cu COGS din S13 Engine
 */

import { useState, useMemo } from 'react';
import { Card, Table, Row, Col, Button } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { useDailyCogsSummary } from '../hooks/useDailyCogsSummary';
import { ProfitabilityKpiCard } from '../components/ProfitabilityKpiCard';
import { DailyCogsTimelineChart } from '../components/DailyCogsTimelineChart';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './ProfitLossPage.css';

export const ProfitLossPage = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // Ultima lună
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const filters = useMemo(
    () => ({
      dateFrom: startDate,
      dateTo: endDate,
    }),
    [startDate, endDate]
  );

  const { data, chartData, kpiBlocks, loading, error, refetch } = useDailyCogsSummary(filters);

  const handleDateChange = () => {
    refetch();
  };

  return (
    <div className="profit-loss-page">
      <PageHeader
        title="💰 Raport Profit & Loss (P&L)"
        description="Analiză profitabilitate zilnică cu COGS din S13 Engine"
      />

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Filtre Perioadă</h5>
          <div className="d-flex gap-2">
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={handleDateChange}
              style={{ width: 'auto' }}
            />
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={handleDateChange}
              style={{ width: 'auto' }}
            />
            <Button variant="primary" onClick={refetch} disabled={loading}>
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} me-1`}></i>
              {loading ? 'Se încarcă...' : 'Reîmprospătează'}
            </Button>
          </div>
        </Card.Header>
      </Card>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={12} lg={2.4}>
          <ProfitabilityKpiCard kpi={kpiBlocks.totalRevenue} loading={loading} />
        </Col>
        <Col md={12} lg={2.4}>
          <ProfitabilityKpiCard kpi={kpiBlocks.totalCogs} loading={loading} />
        </Col>
        <Col md={12} lg={2.4}>
          <ProfitabilityKpiCard kpi={kpiBlocks.grossProfit} loading={loading} />
        </Col>
        <Col md={12} lg={2.4}>
          <ProfitabilityKpiCard kpi={kpiBlocks.avgFoodCostPercent} loading={loading} />
        </Col>
        <Col md={12} lg={2.4}>
          <ProfitabilityKpiCard kpi={kpiBlocks.avgMarginPercent} loading={loading} />
        </Col>
      </Row>

      {/* Timeline Chart */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Evoluție Zilnică: Venituri, COGS, Profit</h5>
        </Card.Header>
        <Card.Body>
          <DailyCogsTimelineChart data={chartData} loading={loading} height={400} />
        </Card.Body>
      </Card>

      {/* Details Table */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Detalii Zilnice</h5>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive className="table-sm">
            <thead>
              <tr>
                <th>Data</th>
                <th>Venituri</th>
                <th>COGS</th>
                <th>Profit</th>
                <th>Food Cost %</th>
                <th>Marjă %</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Se încarcă datele...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    Nu există date pentru perioada selectată.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={index}>
                    <td>{new Date(item.day).toLocaleDateString('ro-RO')}</td>
                    <td>{item.revenue.toFixed(2)} RON</td>
                    <td>{item.cogsTotal.toFixed(2)} RON</td>
                    <td>
                      <strong>{item.profit.toFixed(2)} RON</strong>
                    </td>
                    <td>
                      {item.foodCostPercent !== null ? (
                        <span
                          className={
                            item.foodCostPercent > 35
                              ? 'text-danger'
                              : item.foodCostPercent > 30
                              ? 'text-warning'
                              : 'text-success'
                          }
                        >
                          {item.foodCostPercent.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {item.marginPercent !== null ? (
                        <span
                          className={
                            item.marginPercent < 50 ? 'text-warning' : 'text-success'
                          }
                        >
                          {item.marginPercent.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

