// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Entries by VAT and Accounting Account Report Page
 * 
 * Raport Intrări după TVA și Cont Contabil:
 * - Rezumat per Cota TVA
 * - Detalii Intrări per Cont Contabil
 * - Grafice distribuție TVA
 */

import React, { useState, useCallback } from 'react';
import { Card, Button, Form, Alert, Row, Col, Table, Badge, Tabs, Tab, Collapse } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { fetchEntriesByVatReport, type EntriesByVatFilters, type EntriesByVatData } from '../api/accountingReportsApi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
import './EntriesByVatReportPage.css';

interface VatSummary {
  id: number;
  vat_percentage: number;
  total_base_value: number;
  total_vat_value: number;
  total_with_vat: number;
}

interface EntryDetail {
  id: number;
  nomenclature: string;
  quantity_entered: number;
  average_cost_per_unit: number;
  base_value: number;
  vat_percentage: number;
  vat_value: number;
  total_value: number;
  document_type: string;
  document_number: string;
  document_date: string;
  supplier_name?: string;
}

interface AccountEntry {
  id: number;
  account_code: string;
  account_name: string;
  total_base_value: number;
  total_vat_value: number;
  total_with_vat: number;
  document_count: number;
  entries?: EntryDetail[];
}

interface EntriesByVatData {
  vat_summary: VatSummary[];
  entries_by_account: AccountEntry[];
  totals: {
    total_base_value: number;
    total_vat_value: number;
    total_with_vat: number;
  };
}

export const EntriesByVatReportPage: React.FC = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EntriesByVatData | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<string>('by-account');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [locationId, setLocationId] = useState<number | null>(null);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: EntriesByVatFilters = {
        locationId,
        periodStart: startDate,
        periodEnd: endDate,
      };
      const result = await fetchEntriesByVatReport(filters);
      setData(result);
    } catch (err: any) {
      console.error('EntriesByVatReportPage Error:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea raportului');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, locationId]);

  React.useEffect(() => {
    loadReport();
  }, [loadReport]);

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
    }).format(value);
  };

  return (
    <div className="entries-by-vat-report-page">
      <div className="page-header">
        <h1>📊 Situația Intrărilor după TVA și Cont Contabil</h1>
        <p>"raport intrari rezumat per cota tva si detalii per"</p>
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
            <Col md={3}>
              <Form.Label>Data Start</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Data End</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Locație</Form.Label>
              <Form.Select
                value={locationId || ''}
                onChange={(e) => setLocationId(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">"toate locatiile"</option>
                <option value="1">Restaurant 1</option>
                <option value="2">Restaurant 2</option>
              </Form.Select>
            </Col>
            <Col md={3}>
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
          {/* VAT Summary Cards */}
          {data.vat_summary && Array.isArray(data.vat_summary) && data.vat_summary.length > 0 && (
            <Row className="mb-4">
              {data.vat_summary.map((vat) => (
                <Col md={3} key={vat.id}>
                  <Card className="text-center">
                    <Card.Body>
                      <h5 className="text-muted">TVA {(vat.vat_percentage ?? 0).toFixed(2)}%</h5>
                      <p className="mb-1">
                        <small>Bază: {formatCurrency(vat.total_base_value ?? 0)}</small>
                      </p>
                      <p className="mb-1">
                        <small style={{ color: '#d32f2f' }}>TVA: {formatCurrency(vat.total_vat_value ?? 0)}</small>
                      </p>
                      <h4>{formatCurrency(vat.total_with_vat ?? 0)}</h4>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Grand Totals */}
          <Card className="mb-4 border-primary">
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="text-center">
                    <h6 className="text-muted">"total valoare baza"</h6>
                    <h3>{formatCurrency(data.totals?.total_base_value ?? 0)}</h3>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <h6 className="text-muted">"total tva recuperabil"</h6>
                    <h3 style={{ color: '#d32f2f' }}>{formatCurrency(data.totals?.total_vat_value ?? 0)}</h3>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <h6 className="text-muted">TOTAL CU TVA</h6>
                    <h3>{formatCurrency(data.totals?.total_with_vat ?? 0)}</h3>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Tabs */}
          <Tabs activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)} className="mb-4">
            <Tab eventKey="by-account" title="dupa cont contabil">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">"detalii intrari per cont contabil"</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}></th>
                        <th>Cont Contabil</th>
                        <th className="text-end">"valoare baza"</th>
                        <th className="text-end">TVA</th>
                        <th className="text-end">Total + TVA</th>
                        <th className="text-center">"nr documente"</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.entries_by_account && Array.isArray(data.entries_by_account) && data.entries_by_account.length > 0) ? (
                        data.entries_by_account.map((account) => (
                          <React.Fragment key={account.id}>
                            <tr>
                              <td>
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => toggleRow(account.id)}
                                  className="p-0"
                                >
                                  <i className={`fas ${expandedRows.has(account.id) ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                </Button>
                              </td>
                              <td>
                                <strong>{account.account_code ?? '-'}</strong> - {account.account_name ?? '-'}
                              </td>
                              <td className="text-end">{formatCurrency(account.total_base_value ?? 0)}</td>
                              <td className="text-end">{formatCurrency(account.total_vat_value ?? 0)}</td>
                              <td className="text-end">
                                <strong>{formatCurrency(account.total_with_vat ?? 0)}</strong>
                              </td>
                              <td className="text-center">{account.document_count ?? 0}</td>
                            </tr>

                            {/* Expanded Details */}
                            {expandedRows.has(account.id) && account.entries && account.entries.length > 0 && (
                              <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <td colSpan={6}>
                                  <Collapse in={true}>
                                    <div className="p-3">
                                      <h6>"detalii intrari"</h6>
                                      <Table size="sm" striped>
                                        <thead>
                                          <tr>
                                            <th>"Nomenclator"</th>
                                            <th className="text-end">Cantitate</th>
                                            <th className="text-end">Cost/U</th>
                                            <th className="text-end">"valoare baza"</th>
                                            <th className="text-end">TVA %</th>
                                            <th className="text-end">Total</th>
                                            <th>"Document"</th>
                                            <th>Furnizor</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {account.entries.map((entry) => (
                                            <tr key={entry.id}>
                                              <td>{entry.nomenclature ?? '-'}</td>
                                              <td className="text-end">{(entry.quantity_entered ?? 0).toFixed(3)}</td>
                                              <td className="text-end">{(entry.average_cost_per_unit ?? 0).toFixed(4)} RON</td>
                                              <td className="text-end">{formatCurrency(entry.base_value ?? 0)}</td>
                                              <td className="text-end">{(entry.vat_percentage ?? 0).toFixed(2)}%</td>
                                              <td className="text-end">{formatCurrency(entry.total_value ?? 0)}</td>
                                              <td>
                                                {entry.document_type ?? '-'} {entry.document_number ?? '-'}
                                                <br />
                                                <small className="text-muted">
                                                  {entry.document_date ? new Date(entry.document_date).toLocaleDateString('ro-RO') : '-'}
                                                </small>
                                              </td>
                                              <td>{entry.supplier_name || '-'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </Table>
                                    </div>
                                  </Collapse>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center text-muted">"nu exista intrari in perioada selectata"</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="by-vat" title="dupa tva">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">"rezumat per cota tva"</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Cota TVA</th>
                        <th className="text-end">"valoare baza"</th>
                        <th className="text-end">Valoare TVA</th>
                        <th className="text-end">"total cu tva"</th>
                        <th className="text-end">% din Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.vat_summary && Array.isArray(data.vat_summary) && data.vat_summary.length > 0) ? (
                        data.vat_summary.map((vat) => (
                          <tr key={vat.id}>
                            <td><strong>{(vat.vat_percentage ?? 0).toFixed(2)}%</strong></td>
                            <td className="text-end">{formatCurrency(vat.total_base_value ?? 0)}</td>
                            <td className="text-end" style={{ color: '#d32f2f' }}>
                              {formatCurrency(vat.total_vat_value ?? 0)}
                            </td>
                            <td className="text-end">{formatCurrency(vat.total_with_vat ?? 0)}</td>
                            <td className="text-end">
                              {(data.totals?.total_with_vat ?? 0) > 0
                                ? (((vat.total_with_vat ?? 0) / (data.totals?.total_with_vat ?? 1)) * 100).toFixed(2)
                                : '0.00'}%
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center text-muted">"nu exista date tva in perioada selectata"</td>
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





