import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Row, Col, Button, Form, Nav, Tab } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './PortionControlPage.css';

interface PortionStandard {
  id: number;
  product_name: string;
  ingredient_name: string;
  standard_quantity: number;
  tolerance_percent: number;
  status: 'active' | 'inactive';
}

interface ComplianceReport {
  id: number;
  date: string;
  order_id: number;
  product_name: string;
  ingredient_name: string;
  expected: number;
  actual: number;
  variance: number;
  status: 'compliant' | 'warning' | 'critical';
}

interface TopDeviation {
  product_name: string;
  ingredient_name: string;
  deviation_percent: number;
  occurrences: number;
  avg_variance: number;
}

interface PortionControlStats {
  compliantCount: number;
  warningCount: number;
  criticalCount: number;
  totalCount: number;
}

export const PortionControlPage = () => {
  const [activeTab, setActiveTab] = useState('standards');
  const [stats, setStats] = useState<PortionControlStats>({
    compliantCount: 0,
    warningCount: 0,
    criticalCount: 0,
    totalCount: 0,
  });
  const [standards, setStandards] = useState<PortionStandard[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [topDeviations, setTopDeviations] = useState<TopDeviation[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterProduct, setFilterProduct] = useState('');
  const [filterIngredient, setFilterIngredient] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportStatus, setReportStatus] = useState('');

  useEffect(() => {
    loadStats();
    if (activeTab === 'standards') {
      loadPortionStandards();
    } else if (activeTab === 'reports') {
      loadComplianceReports();
    } else if (activeTab === 'deviations') {
      loadTopDeviations();
    }
  }, [activeTab, filterProduct, filterIngredient, filterStatus, reportStartDate, reportEndDate, reportStatus]);

  const loadStats = useCallback(async () => {
    try {
      const response = await httpClient.get('/api/admin/portion-control/stats');
      if (response.data) {
        setStats({
          compliantCount: response.data.compliant_count || 0,
          warningCount: response.data.warning_count || 0,
          criticalCount: response.data.critical_count || 0,
          totalCount: response.data.total_count || 0,
        });
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea statisticilor:', error);
      // Fallback pentru development
      setStats({
        compliantCount: 45,
        warningCount: 12,
        criticalCount: 3,
        totalCount: 60,
      });
    }
  }, []);

  const loadPortionStandards = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/admin/portion-control/standards', {
        params: {
          product: filterProduct || undefined,
          ingredient: filterIngredient || undefined,
          status: filterStatus || undefined,
        },
      });
      if (response.data?.success) {
        setStandards(response.data.data || []);
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea standardelor:', error);
      // Fallback pentru development
      setStandards([
        {
          id: 1,
          product_name: 'Pizza Margherita',
          ingredient_name: 'Mozzarella',
          standard_quantity: 150,
          tolerance_percent: 10,
          status: 'active',
        },
        {
          id: 2,
          product_name: 'Pizza Margherita',
          ingredient_name: 'Sos roșii',
          standard_quantity: 100,
          tolerance_percent: 15,
          status: 'active',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [filterProduct, filterIngredient, filterStatus]);

  const loadComplianceReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/admin/portion-control/reports', {
        params: {
          start_date: reportStartDate || undefined,
          end_date: reportEndDate || undefined,
          status: reportStatus || undefined,
        },
      });
      if (response.data?.success) {
        setReports(response.data.data || []);
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea rapoartelor:', error);
      // Fallback pentru development
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [reportStartDate, reportEndDate, reportStatus]);

  const loadTopDeviations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/admin/portion-control/top-deviations');
      if (response.data?.success) {
        setTopDeviations(response.data.data || []);
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea deviațiilor:', error);
      // Fallback pentru development
      setTopDeviations([
        {
          product_name: 'Pizza Margherita',
          ingredient_name: 'Mozzarella',
          deviation_percent: 25,
          occurrences: 12,
          avg_variance: 37.5,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExportExcel = async () => {
    try {
      const url = `/api/admin/portion-control/export/excel`;
      const baseUrl = (httpClient.defaults.baseURL ?? '').replace(/\/$/, '');
      const fullUrl = `${baseUrl}${url}`;
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = `portion_control_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('❌ Eroare la exportul Excel:', error);
    }
  };

  const handleRefresh = () => {
    loadStats();
    if (activeTab === 'standards') {
      loadPortionStandards();
    } else if (activeTab === 'reports') {
      loadComplianceReports();
    } else if (activeTab === 'deviations') {
      loadTopDeviations();
    }
  };

  return (
    <div className="portion-control-page">
      <h2 className="mb-4">Portion Control & Conformitate</h2>
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-balance-scale me-2"></i>Portion Control & Conformitate
          </h5>
          <div>
            <Button variant="success" size="sm" className="me-2" onClick={handleExportExcel}>
              <i className="fas fa-file-excel me-1"></i>Export Excel
            </Button>
            <Button variant="light" size="sm" onClick={handleRefresh}>
              <i className="fas fa-sync-alt me-1"></i>Reîmprospătare
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Statistici Conformitate */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-white bg-success">
                <Card.Body>
                  <h4>{stats.compliantCount}</h4>
                  <small>Conforme</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-white bg-warning">
                <Card.Body>
                  <h4>{stats.warningCount}</h4>
                  <small>Avertismente</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-white bg-danger">
                <Card.Body>
                  <h4>{stats.criticalCount}</h4>
                  <small>Critice</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-white bg-info">
                <Card.Body>
                  <h4>{stats.totalCount}</h4>
                  <small>Total Măsurători</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tabs */}
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'standards')}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="standards">
                  <i className="fas fa-ruler me-1"></i>Standarde Porții
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="reports">
                  <i className="fas fa-file-alt me-1"></i>Rapoarte Conformitate
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="deviations">
                  <i className="fas fa-exclamation-triangle me-1"></i>Top Deviații
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* Tab Standarde Porții */}
              <Tab.Pane eventKey="standards">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Lista Standarde Porții</h6>
                  <Button variant="primary" size="sm">
                    <i className="fas fa-plus me-1"></i>Standard Nou
                  </Button>
                </div>

                {/* Filtre */}
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Select
                      size="sm"
                      value={filterProduct}
                      onChange={(e) => setFilterProduct(e.target.value)}
                    >
                      <option value="">Toate Produsele</option>
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      size="sm"
                      value={filterIngredient}
                      onChange={(e) => setFilterIngredient(e.target.value)}
                    >
                      <option value="">Toate Ingredientele</option>
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      size="sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="active">Doar Active</option>
                      <option value="all">Toate</option>
                    </Form.Select>
                  </Col>
                </Row>

                {/* Tabel Standarde */}
                <div className="table-responsive">
                  <Table hover size="sm">
                    <thead>
                      <tr>
                        <th>Produs</th>
                        <th>Ingredient</th>
                        <th>Cantitate Standard</th>
                        <th>Toleranță (%)</th>
                        <th>Status</th>
                        <th>Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="text-center">
                            <i className="fas fa-spinner fa-spin me-2"></i>Se încarcă...
                          </td>
                        </tr>
                      ) : standards.length > 0 ? (
                        standards.map((standard) => (
                          <tr key={standard.id}>
                            <td>{standard.product_name}</td>
                            <td>{standard.ingredient_name}</td>
                            <td>{standard.standard_quantity}</td>
                            <td>{standard.tolerance_percent}%</td>
                            <td>
                              <span
                                className={`badge bg-${standard.status === 'active' ? 'success' : 'secondary'}`}
                              >
                                {standard.status === 'active' ? 'Activ' : 'Inactiv'}
                              </span>
                            </td>
                            <td>
                              <Button variant="link" size="sm" className="p-0 me-2">
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button variant="link" size="sm" className="p-0 text-danger">
                                <i className="fas fa-trash"></i>
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center text-muted">
                            Nu există standarde definite.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Tab.Pane>

              {/* Tab Rapoarte Conformitate */}
              <Tab.Pane eventKey="reports">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Istoric Conformitate</h6>
                  <Button variant="danger" size="sm">
                    <i className="fas fa-file-pdf me-1"></i>Export PDF
                  </Button>
                </div>

                {/* Filtre Rapoarte */}
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Control
                      type="date"
                      size="sm"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="date"
                      size="sm"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      size="sm"
                      value={reportStatus}
                      onChange={(e) => setReportStatus(e.target.value)}
                    >
                      <option value="">Toate Statusurile</option>
                      <option value="compliant">Conform</option>
                      <option value="warning">Avertisment</option>
                      <option value="critical">Critic</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select size="sm">
                      <option value="">Toate Locațiile</option>
                    </Form.Select>
                  </Col>
                </Row>

                {/* Tabel Rapoarte */}
                <div className="table-responsive">
                  <Table hover size="sm">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Comandă</th>
                        <th>Produs</th>
                        <th>Ingredient</th>
                        <th>Așteptat</th>
                        <th>Real</th>
                        <th>Varianță</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="text-center">
                            <i className="fas fa-spinner fa-spin me-2"></i>Se încarcă...
                          </td>
                        </tr>
                      ) : reports.length > 0 ? (
                        reports.map((report) => (
                          <tr key={report.id}>
                            <td>{new Date(report.date).toLocaleDateString('ro-RO')}</td>
                            <td>#{report.order_id}</td>
                            <td>{report.product_name}</td>
                            <td>{report.ingredient_name}</td>
                            <td>{report.expected}</td>
                            <td>{report.actual}</td>
                            <td>{report.variance.toFixed(2)}</td>
                            <td>
                              <span
                                className={`badge bg-${
                                  report.status === 'compliant'
                                    ? 'success'
                                    : report.status === 'warning'
                                      ? 'warning'
                                      : 'danger'
                                }`}
                              >
                                {report.status === 'compliant'
                                  ? 'Conform'
                                  : report.status === 'warning'
                                    ? 'Avertisment'
                                    : 'Critic'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="text-center text-muted">
                            Nu există rapoarte pentru perioada selectată.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Tab.Pane>

              {/* Tab Top Deviații */}
              <Tab.Pane eventKey="deviations">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Top Deviații (Ultimele 30 zile)</h6>
                </div>

                {loading ? (
                  <div className="text-center">
                    <i className="fas fa-spinner fa-spin me-2"></i>Se încarcă...
                  </div>
                ) : topDeviations.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover size="sm">
                      <thead>
                        <tr>
                          <th>Produs</th>
                          <th>Ingredient</th>
                          <th>Deviație (%)</th>
                          <th>Apariții</th>
                          <th>Varianță Medie</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topDeviations.map((deviation, index) => (
                          <tr key={index}>
                            <td>{deviation.product_name}</td>
                            <td>{deviation.ingredient_name}</td>
                            <td>
                              <span className="badge bg-danger">{deviation.deviation_percent}%</span>
                            </td>
                            <td>{deviation.occurrences}</td>
                            <td>{deviation.avg_variance.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center text-muted">Nu există deviații înregistrate.</div>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </div>
  );
};

