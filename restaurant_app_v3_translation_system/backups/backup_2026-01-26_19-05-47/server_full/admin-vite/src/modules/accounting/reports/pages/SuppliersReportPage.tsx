// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Suppliers Report Page
 * 
 * Raport Furnizori:
 * - Datorii la Furnizori
 * - Evaluare Furnizori
 * - Prețuri Medii
 */

import React, { useState, useCallback } from 'react';
import { Card, Button, Form, Alert, Row, Col, Table, Badge } from 'react-bootstrap';
import { fetchSuppliersReport, type SupplierReportFilters, type SupplierReportData } from '../api/accountingReportsApi';
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
import './SuppliersReportPage.css';

export const SuppliersReportPage: React.FC = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SupplierReportData | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: SupplierReportFilters = {
        dateFrom: startDate,
        dateTo: endDate,
      };
      const result = await fetchSuppliersReport(filters);
      setData(result);
    } catch (err: any) {
      console.error('SuppliersReportPage Error:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea raportului');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  React.useEffect(() => {
    loadReport();
  }, [loadReport]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
    }).format(value);
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fas fa-star ${i <= rating ? 'text-warning' : 'text-muted'}`}
        ></i>
      );
    }
    return stars;
  };

  return (
    <div className="suppliers-report-page">
      <div className="page-header">
        <h1>🏢 Raport Furnizori</h1>
        <p>"raport furnizori datorii evaluare furnizori si ana"</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3">
          {error}
        </Alert>
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
                <Button variant="primary" onClick={loadReport} disabled={loading}>
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync'} me-2`}></i>
                  {loading ? 'Se încarcă...' : 'Actualizează'}
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {data && (
        <>
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-muted">Total Furnizori</h5>
                  <h3>{data.summary?.totalSuppliers ?? 0}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-muted">Total Datorii</h5>
                  <h3 className="text-danger">{formatCurrency(data.summary?.totalDebt ?? 0)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-muted">Preț Mediu</h5>
                  <h3>{formatCurrency(data.summary?.averagePrice ?? 0)}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Suppliers Table */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">"datorii la furnizori"</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Furnizor</th>
                    <th>CUI</th>
                    <th className="text-end">"datorie totala"</th>
                    <th className="text-end">"numar facturi"</th>
                    <th className="text-end">Preț Mediu</th>
                    <th>"ultima comanda"</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.suppliers && Array.isArray(data.suppliers) && data.suppliers.length > 0) ? (
                    data.suppliers.map((supplier) => (
                      <tr key={supplier.supplierId}>
                        <td><strong>{supplier.supplierName ?? '-'}</strong></td>
                        <td>{supplier.supplierCUI ?? '-'}</td>
                        <td className="text-end">
                          <span className={(supplier.totalDebt ?? 0) > 0 ? 'text-danger' : 'text-success'}>
                            {formatCurrency(supplier.totalDebt ?? 0)}
                          </span>
                        </td>
                        <td className="text-end">{supplier.invoicesCount ?? 0}</td>
                        <td className="text-end">{formatCurrency(supplier.averagePrice ?? 0)}</td>
                        <td>{supplier.lastOrderDate ? new Date(supplier.lastOrderDate).toLocaleDateString('ro-RO') : '-'}</td>
                        <td>{getRatingStars(supplier.rating ?? 0)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted">"nu exista furnizori in perioada selectata"</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Price Analysis */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">"analiza preturi medii"</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Produs</th>
                    <th>Furnizor</th>
                    <th className="text-end">Preț Mediu</th>
                    <th className="text-end">"pret min"</th>
                    <th className="text-end">"pret max"</th>
                    <th className="text-end">"Variație"</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.priceAnalysis && Array.isArray(data.priceAnalysis) && data.priceAnalysis.length > 0) ? (
                    data.priceAnalysis.map((item, index) => (
                      <tr key={index}>
                        <td><strong>{item.productName ?? '-'}</strong></td>
                        <td>{item.supplierName ?? '-'}</td>
                        <td className="text-end">{formatCurrency(item.averagePrice ?? 0)}</td>
                        <td className="text-end text-success">{formatCurrency(item.minPrice ?? 0)}</td>
                        <td className="text-end text-danger">{formatCurrency(item.maxPrice ?? 0)}</td>
                        <td className="text-end">
                          <Badge bg={(item.priceVariance ?? 0) > 20 ? 'danger' : (item.priceVariance ?? 0) > 10 ? 'warning' : 'success'}>
                            {(item.priceVariance ?? 0).toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-muted">"nu exista date de analiza preturi"</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};





