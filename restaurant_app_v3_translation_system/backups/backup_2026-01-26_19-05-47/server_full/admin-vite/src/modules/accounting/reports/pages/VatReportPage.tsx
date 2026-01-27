// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - VAT Report Page
 * 
 * Raport TVA complet:
 * - TVA de Plată
 * - TVA Deductibil
 * - Reconciliare
 * - Declarație TVA
 */

import React, { useState, useCallback } from 'react';
import { Card, Button, Form, Alert, Row, Col, Table, Tabs, Tab, Badge } from 'react-bootstrap';
import { fetchVatReport, exportVatReport, type VatReportFilters, type VatReportData } from '../api/accountingReportsApi';
import { HelpButton } from '@/shared/components/HelpButton';
// Removed: Bootstrap and FontAwesome CSS imports - already loaded globally
// // Removed: Bootstrap CSS import - already loaded globally
// // Removed: FontAwesome CSS import - already loaded globally
import './VatReportPage.css';

export const VatReportPage: React.FC = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VatReportData | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: VatReportFilters = {
        dateFrom: startDate,
        dateTo: endDate,
      };
      const result = await fetchVatReport(filters);
      setData(result);
    } catch (err: any) {
      console.error('VatReportPage Error:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea raportului TVA');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const filters: VatReportFilters = {
        dateFrom: startDate,
        dateTo: endDate,
      };
      const blob = await exportVatReport(filters, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raport-tva-${startDate}-${endDate}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Eroare la export');
    }
  };

  React.useEffect(() => {
    loadReport();
  }, [loadReport]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
    }).format(value);
  };

  return (
    <div className="vat-report-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>🧾 Raport TVA</h1>
          <p>"raport tva complet tva de plata tva deductibil rec"</p>
        </div>
        <HelpButton
          title="Ajutor - Raport TVA"
          content={
            <div>
              <h5>📊 Ce este Raportul TVA?</h5>
              <p>
                Raportul TVA oferă o vedere completă asupra TVA-ului colectat și deductibil pentru 
                o perioadă selectată, necesar pentru declarația TVA lunară.
              </p>
              <h5 className="mt-4">🔍 Secțiuni raport</h5>
              <ul>
                <li><strong>"tva de plata"</strong> - TVA colectat din vânzări (TVA de încasat de la ANAF)</li>
                <li><strong>"tva deductibil"</strong> - TVA plătit la achiziții (TVA de dedus)</li>
                <li><strong>Reconciliare</strong> - Diferența între TVA colectat și deductibil</li>
                <li><strong>"declaratie tva"</strong> - Export pentru declarația ANAF</li>
              </ul>
              <h5 className="mt-4">📅 Filtre disponibile</h5>
              <ul>
                <li><strong>"data de la"</strong> - Data de început a perioadei</li>
                <li><strong>"data pana la"</strong> - Data de sfârșit a perioadei</li>
              </ul>
              <div className="alert alert-info mt-4">
                <strong>💡 Sfat:</strong> Raportul poate fi exportat în Excel sau PDF pentru 
                trimitere către contabil sau ANAF.
              </div>
            </div>
          }
        />
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
                <Button variant="primary" onClick={loadReport} disabled={loading} className="me-2">
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync'} me-2`}></i>
                  {loading ? 'Se încarcă...' : 'Actualizează'}
                </Button>
                {data && (
                  <>
                    <Button variant="success" onClick={() => handleExpor[excel]} className="me-2">
                      <i className="fas fa-file-excel me-2"></i>
                      Export Excel
                    </Button>
                    <Button variant="danger" onClick={() => handleExpor[pdf]}>
                      <i className="fas fa-file-pdf me-2"></i>
                      Export PDF
                    </Button>
                  </>
                )}
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
                  <h5 className="text-muted">"tva de plata"</h5>
                  <h3 className="text-danger">{formatCurrency(data.vatToPay?.total ?? 0)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-muted">"tva deductibil"</h5>
                  <h3 className="text-success">{formatCurrency(data.vatDeductible?.total ?? 0)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-muted">"tva net de plata"</h5>
                  <h3 className={(data.reconciliation?.netVatToPay ?? 0) >= 0 ? 'text-danger' : 'text-success'}>
                    {formatCurrency(data.reconciliation?.netVatToPay ?? 0)}
                  </h3>
                  <Badge bg={data.reconciliation?.status === 'ok' ? 'success' : data.reconciliation?.status === 'warning' ? 'warning' : 'danger'}>
                    {data.reconciliation?.status === 'ok' ? 'OK' : data.reconciliation?.status === 'warning' ? 'Atenție' : 'N/A'}
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tabs */}
          <Tabs defaultActiveKey="vat-to-pay" className="mb-4">
            <Tab eventKey="vat-to-pay" title="tva de plata">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">TVA de Plată (Vânzări)</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Cota TVA</th>
                        <th className="text-end">"baza impozabila"</th>
                        <th className="text-end">TVA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>11%</td>
                        <td className="text-end">{formatCurrency(data.vatToPay?.vat9?.base ?? data.vatToPay?.vat11?.base ?? 0)}</td>
                        <td className="text-end">{formatCurrency(data.vatToPay?.vat9?.amount ?? data.vatToPay?.vat11?.amount ?? 0)}</td>
                      </tr>
                      <tr>
                        <td>21%</td>
                        <td className="text-end">{formatCurrency(data.vatToPay?.vat19?.base ?? data.vatToPay?.vat21?.base ?? 0)}</td>
                        <td className="text-end">{formatCurrency(data.vatToPay?.vat19?.amount ?? data.vatToPay?.vat21?.amount ?? 0)}</td>
                      </tr>
                      <tr>
                        <td>5%</td>
                        <td className="text-end">{formatCurrency(data.vatToPay?.vat24?.base ?? data.vatToPay?.vat5?.base ?? 0)}</td>
                        <td className="text-end">{formatCurrency(data.vatToPay?.vat24?.amount ?? data.vatToPay?.vat5?.amount ?? 0)}</td>
                      </tr>
                      <tr className="table-primary">
                        <td><strong>TOTAL</strong></td>
                        <td className="text-end">
                          <strong>
                            {formatCurrency(
                              (data.vatToPay?.vat9?.base ?? data.vatToPay?.vat11?.base ?? 0) + 
                              (data.vatToPay?.vat19?.base ?? data.vatToPay?.vat21?.base ?? 0) + 
                              (data.vatToPay?.vat24?.base ?? data.vatToPay?.vat5?.base ?? 0)
                            )}
                          </strong>
                        </td>
                        <td className="text-end">
                          <strong>{formatCurrency(data.vatToPay?.total ?? 0)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="vat-deductible" title="tva deductibil">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">TVA Deductibil (Achiziții)</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Cota TVA</th>
                        <th className="text-end">"baza impozabila"</th>
                        <th className="text-end">TVA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>11%</td>
                        <td className="text-end">{formatCurrency(data.vatDeductible?.vat9?.base ?? data.vatDeductible?.vat11?.base ?? 0)}</td>
                        <td className="text-end">{formatCurrency(data.vatDeductible?.vat9?.amount ?? data.vatDeductible?.vat11?.amount ?? 0)}</td>
                      </tr>
                      <tr>
                        <td>21%</td>
                        <td className="text-end">{formatCurrency(data.vatDeductible?.vat19?.base ?? data.vatDeductible?.vat21?.base ?? 0)}</td>
                        <td className="text-end">{formatCurrency(data.vatDeductible?.vat19?.amount ?? data.vatDeductible?.vat21?.amount ?? 0)}</td>
                      </tr>
                      <tr>
                        <td>5%</td>
                        <td className="text-end">{formatCurrency(data.vatDeductible?.vat24?.base ?? data.vatDeductible?.vat5?.base ?? 0)}</td>
                        <td className="text-end">{formatCurrency(data.vatDeductible?.vat24?.amount ?? data.vatDeductible?.vat5?.amount ?? 0)}</td>
                      </tr>
                      <tr className="table-success">
                        <td><strong>TOTAL</strong></td>
                        <td className="text-end">
                          <strong>
                            {formatCurrency(
                              (data.vatDeductible?.vat9?.base ?? data.vatDeductible?.vat11?.base ?? 0) + 
                              (data.vatDeductible?.vat19?.base ?? data.vatDeductible?.vat21?.base ?? 0) + 
                              (data.vatDeductible?.vat24?.base ?? data.vatDeductible?.vat5?.base ?? 0)
                            )}
                          </strong>
                        </td>
                        <td className="text-end">
                          <strong>{formatCurrency(data.vatDeductible?.total ?? 0)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="reconciliation" title="Reconciliare">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Reconciliare TVA</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Card className="mb-3">
                        <Card.Body>
                          <h6>TVA de Plată (Vânzări)</h6>
                          <h4 className="text-danger">{formatCurrency(data.vatToPay?.total ?? 0)}</h4>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="mb-3">
                        <Card.Body>
                          <h6>TVA Deductibil (Achiziții)</h6>
                          <h4 className="text-success">{formatCurrency(data.vatDeductible?.total ?? 0)}</h4>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  <Card className={(data.reconciliation?.netVatToPay ?? 0) >= 0 ? 'border-danger' : 'border-success'}>
                    <Card.Body className="text-center">
                      <h5>"tva net de plata"</h5>
                      <h2 className={(data.reconciliation?.netVatToPay ?? 0) >= 0 ? 'text-danger' : 'text-success'}>
                        {formatCurrency(data.reconciliation?.netVatToPay ?? 0)}
                      </h2>
                      <p className="text-muted">
                        {(data.reconciliation?.netVatToPay ?? 0) >= 0
                          ? 'Sumă de plată către ANAF'
                          : 'Sumă de recuperat de la ANAF'}
                      </p>
                    </Card.Body>
                  </Card>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="breakdown" title="Detalii">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">"detalii documente"</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Tip Document</th>
                        <th>"numar document"</th>
                        <th>Cota TVA</th>
                        <th className="text-end">Baza</th>
                        <th className="text-end">TVA</th>
                        <th>Tip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.breakdown && Array.isArray(data.breakdown) && data.breakdown.length > 0) ? (
                        data.breakdown.map((item, index) => (
                          <tr key={index}>
                            <td>{item.date ? new Date(item.date).toLocaleDateString('ro-RO') : '-'}</td>
                            <td>{item.documentType ?? '-'}</td>
                            <td>{item.documentNumber ?? '-'}</td>
                            <td>{item.vatRate ?? 0}%</td>
                            <td className="text-end">{formatCurrency(item.baseAmount ?? 0)}</td>
                            <td className="text-end">{formatCurrency(item.vatAmount ?? 0)}</td>
                            <td>
                              <Badge bg={item.type === 'sale' ? 'danger' : 'success'}>
                                {item.type === 'sale' ? 'Vânzare' : 'Achiziție'}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center text-muted">"nu exista documente in perioada selectata"</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </>
      )}
    </div>
  );
};





