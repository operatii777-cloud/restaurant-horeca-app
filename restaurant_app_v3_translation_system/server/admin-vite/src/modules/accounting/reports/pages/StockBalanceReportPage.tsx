// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Stock Balance Report Page
 * 
 * Raport Balanța Stocurilor:
 * - Stoc inițial, intrări, consumuri, stoc final
 * - Analiza diferențelor (variance)
 * - Grafic compoziție stocuri
 */

import React, { useState, useCallback } from 'react';
import { Card, Button, Form, Alert, Row, Col, Table, Badge } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
import './StockBalanceReportPage.css';

interface StockBalanceItem {
  id: number;
  ingredient_id: number;
  nomenclature: string;
  unit: string;
  opening_stock: number;
  opening_value: number;
  entries_qty: number;
  entries_value: number;
  consumption_qty: number;
  consumption_value: number;
  waste_qty: number;
  waste_value: number;
  closing_stock: number;
  closing_value: number;
}

interface StockBalanceData {
  snapshot_id: number;
  report_id: string;
  report_date: string;
  location_id: number;
  items: StockBalanceItem[];
  totals: {
    opening_value: number;
    entries_value: number;
    consumption_value: number;
    waste_value: number;
    closing_value: number;
  };
}

interface StockVarianceItem {
  id: number;
  ingredient_id: number;
  nomenclature: string;
  theoretical_stock: number;
  physical_stock: number;
  variance_qty: number;
  variance_percentage: number;
  variance_type: 'shortage' | 'surplus';
  variance_reason?: string;
}

export const StockBalanceReportPage: React.FC = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StockBalanceData | null>(null);
  const [varianceData, setVarianceData] = useState<StockVarianceItem[]>([]);
  const [showVariance, setShowVariance] = useState(false);
  const [reportDate, setReportDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [locationId, setLocationId] = useState<number | null>(1);
  const [subcategory, setSubcategory] = useState<string>('');

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.post('/api/accounting/stock-balance', {
        locationId,
        reportDate,
        subcategory: subcategory || undefined
      });
      
      if (response.data.success) {
        setData(response.data.data);
        
        // Încarcă variance dacă există snapshot_id
        if (response.data.data.snapshot_id) {
          try {
            const varianceResponse = await httpClient.get(
              `/api/accounting/stock-variance/${response.data.data.snapshot_id}`
            );
            if (varianceResponse.data.success) {
              setVarianceData(varianceResponse.data.data || []);
            }
          } catch (varianceErr) {
            console.warn('Variance data not available:', varianceErr);
          }
        }
      } else {
        setError(response.data.error || 'Eroare la încărcarea raportului');
      }
    } catch (err: any) {
      console.error('StockBalanceReportPage Error:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea raportului');
    } finally {
      setLoading(false);
    }
  }, [reportDate, locationId, subcategory]);

  React.useEffect(() => {
    if (locationId && reportDate) {
      loadReport();
    }
  }, [loadReport]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('ro-RO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  return (
    <div className="stock-balance-report-page">
      <div className="page-header">
        <h1>📊 Balanța Stocurilor</h1>
        <p>"raport detaliat al stocurilor stoc initial intrari"</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Data Raport</Form.Label>
                <Form.Control
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Locație</Form.Label>
                <Form.Control
                  as="select"
                  value={locationId || ''}
                  onChange={(e) => setLocationId(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">"selecteaza locatia"</option>
                  <option value="1">"restaurant best center"</option>
                  <option value="2">"restaurant best mall"</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Categorie (opțional)</Form.Label>
                <Form.Control
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="filtreaza dupa categorie"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Button onClick={loadReport} disabled={loading} className="w-100">
                {loading ? (
                  <><i className="fas fa-spinner fa-spin me-2"></i>Se încarcă...</>
                ) : (
                  <><i className="fas fa-sync-alt me-2"></i>"actualizeaza raport"</>
                )}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {data && (
        <>
          <Card className="mb-4">
            <Card.Header>
              <h5>"detalii balanta stocuri"</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive className="stock-balance-table">
                <thead>
                  <tr>
                    <th>"Nomenclator"</th>
                    <th className="text-center">UM</th>
                    <th className="text-end">"stoc initial"</th>
                    <th className="text-end">Valoare Inițială</th>
                    <th className="text-end">"intrari cant"</th>
                    <th className="text-end">"intrari val"</th>
                    <th className="text-end">Consum Cant.</th>
                    <th className="text-end">Consum Val.</th>
                    <th className="text-end">Waste Cant.</th>
                    <th className="text-end">Waste Val.</th>
                    <th className="text-end">Stoc Final</th>
                    <th className="text-end">"valoare finala"</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.items && Array.isArray(data.items) && data.items.length > 0) ? (
                    data.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.nomenclature ?? '-'}</td>
                        <td className="text-center">{item.unit ?? '-'}</td>
                        <td className="text-end">{formatNumber(item.opening_stock ?? 0, 3)}</td>
                        <td className="text-end">{formatCurrency(item.opening_value ?? 0)}</td>
                        <td className="text-end">{formatNumber(item.entries_qty ?? 0, 3)}</td>
                        <td className="text-end">{formatCurrency(item.entries_value ?? 0)}</td>
                        <td className="text-end" style={{ color: '#d32f2f' }}>
                          {formatNumber(item.consumption_qty ?? 0, 3)}
                        </td>
                        <td className="text-end" style={{ color: '#d32f2f' }}>
                          {formatCurrency(item.consumption_value ?? 0)}
                        </td>
                        <td className="text-end" style={{ color: '#ff9800' }}>
                          {formatNumber(item.waste_qty ?? 0, 3)}
                        </td>
                        <td className="text-end" style={{ color: '#ff9800' }}>
                          {formatCurrency(item.waste_value ?? 0)}
                        </td>
                        <td className="text-end"><strong>{formatNumber(item.closing_stock ?? 0, 3)}</strong></td>
                        <td className="text-end"><strong>{formatCurrency(item.closing_value ?? 0)}</strong></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} className="text-center text-muted">"nu exista date de stoc pentru perioada selectata"</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="table-primary">
                    <th colSpan={3} className="text-end"><strong>TOTAL:</strong></th>
                    <th className="text-end">{formatCurrency(data.totals?.opening_value ?? 0)}</th>
                    <th></th>
                    <th className="text-end">{formatCurrency(data.totals?.entries_value ?? 0)}</th>
                    <th></th>
                    <th className="text-end">{formatCurrency(data.totals?.consumption_value ?? 0)}</th>
                    <th></th>
                    <th className="text-end">{formatCurrency(data.totals?.waste_value ?? 0)}</th>
                    <th></th>
                    <th className="text-end">{formatCurrency(data.totals?.closing_value ?? 0)}</th>
                  </tr>
                </tfoot>
              </Table>
            </Card.Body>
          </Card>

          {varianceData.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5>Analiza Diferențelor (Variance)</h5>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowVariance(!showVariance)}
                  >
                    {showVariance ? (
                      <><i className="fas fa-eye-slash me-2"></i>"Ascunde"</>
                    ) : (
                      <><i className="fas fa-eye me-2"></i>"Arată"</>
                    )}
                  </Button>
                </div>
              </Card.Header>
              {showVariance && (
                <Card.Body>
                  <Table striped bordered hover responsive className="variance-table">
                    <thead>
                      <tr>
                        <th>"Nomenclator"</th>
                        <th className="text-end">Stoc Teoretic</th>
                        <th className="text-end">Stoc Fizic</th>
                        <th className="text-end">Diferență</th>
                        <th className="text-end">% Diferență</th>
                        <th className="text-center">Tip</th>
                        <th>Motiv</th>
                      </tr>
                    </thead>
                    <tbody>
                      {varianceData.map((item) => (
                        <tr
                          key={item.id}
                          style={{
                            backgroundColor: item.variance_type === 'shortage' ? '#ffebee' : '#e8f5e9'
                          }}
                        >
                          <td>{item.nomenclature}</td>
                          <td className="text-end">{formatNumber(item.theoretical_stock, 3)}</td>
                          <td className="text-end">{formatNumber(item.physical_stock, 3)}</td>
                          <td className="text-end">
                            <strong style={{
                              color: item.variance_type === 'shortage' ? '#d32f2f' : '#2e7d32'
                            }}>
                              {item.variance_qty > 0 ? '+' : ''}{formatNumber(item.variance_qty, 3)}
                            </strong>
                          </td>
                          <td className="text-end">{formatNumber(item.variance_percentage, 2)}%</td>
                          <td className="text-center">
                            <Badge bg={item.variance_type === 'shortage' ? 'danger' : 'success'}>
                              {item.variance_type === 'shortage' ? 'Lipsă' : 'Surplus'}
                            </Badge>
                          </td>
                          <td>{item.variance_reason || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              )}
            </Card>
          )}

          <Card>
            <Card.Header>
              <h5>Grafic Compoziție Stocuri (Valoare)</h5>
            </Card.Header>
            <Card.Body>
              {(data.items && data.items.length > 0) ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.items.slice(0, 20)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="nomenclature"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="opening_value" stackId="a" fill="#2196f3" name="stoc initial" />
                    <Bar dataKey="entries_value" stackId="a" fill="#4caf50" name="Intrări" />
                    <Bar dataKey="consumption_value" stackId="b" fill="#f44336" name="Consum" />
                    <Bar dataKey="waste_value" stackId="b" fill="#ff9800" name="Waste" />
                    <Bar dataKey="closing_value" fill="#9c27b0" name="Stoc Final" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="fas fa-chart-bar fa-3x mb-3"></i>
                  <p>"nu exista date pentru a genera graficul"</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};





