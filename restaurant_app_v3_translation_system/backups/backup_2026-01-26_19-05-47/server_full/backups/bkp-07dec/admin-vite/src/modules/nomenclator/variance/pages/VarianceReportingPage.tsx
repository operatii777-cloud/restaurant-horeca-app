import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Row, Col, Button, Form } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './VarianceReportingPage.css';

interface VarianceReport {
  id: number;
  report_number: string;
  start_date: string;
  end_date: string;
  location_name: string | null;
  ingredients_count: number;
  critical_count: number;
  total_variance: number;
  status: 'draft' | 'completed' | 'approved';
  created_by: string;
  created_at: string;
}

interface VarianceStats {
  totalReports: number;
  totalIngredients: number;
  criticalCount: number;
  totalValue: number;
}

export const VarianceReportingPage = () => {
  const [stats, setStats] = useState<VarianceStats>({
    totalReports: 0,
    totalIngredients: 0,
    criticalCount: 0,
    totalValue: 0,
  });
  const [reports, setReports] = useState<VarianceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCreatedBy, setNewCreatedBy] = useState('Administrator');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    loadStats();
    loadVarianceReports();
  }, [filterStatus, filterLocation, filterStartDate, filterEndDate]);

  const loadStats = useCallback(async () => {
    try {
      const response = await httpClient.get('/api/admin/variance/stats');
      if (response.data) {
        setStats({
          totalReports: response.data.total_reports || 0,
          totalIngredients: response.data.total_ingredients || 0,
          criticalCount: response.data.critical_count || 0,
          totalValue: response.data.total_value || 0,
        });
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea statisticilor:', error);
      // Fallback pentru development
      setStats({
        totalReports: 12,
        totalIngredients: 45,
        criticalCount: 8,
        totalValue: 1250.75,
      });
    }
  }, []);

  const loadVarianceReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/admin/variance/reports', {
        params: {
          status: filterStatus || undefined,
          location: filterLocation || undefined,
          start_date: filterStartDate || undefined,
          end_date: filterEndDate || undefined,
        },
      });
      if (response.data?.success) {
        setReports(response.data.data || []);
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea rapoartelor:', error);
      // Fallback pentru development
      setReports([
        {
          id: 1,
          report_number: 'VR-2025-001',
          start_date: '2025-01-01',
          end_date: '2025-01-31',
          location_name: 'Bucătărie Principală',
          ingredients_count: 25,
          critical_count: 3,
          total_variance: 450.25,
          status: 'completed',
          created_by: 'Administrator',
          created_at: '2025-01-31T10:00:00',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterLocation, filterStartDate, filterEndDate]);

  const handleGenerateReport = async () => {
    if (!newStartDate || !newEndDate) {
      alert('Vă rugăm completați data început și data sfârșit.');
      return;
    }

    setLoading(true);
    try {
      const response = await httpClient.post('/api/admin/variance/generate', {
        start_date: newStartDate,
        end_date: newEndDate,
        location: newLocation || null,
        created_by: newCreatedBy,
        notes: newNotes || null,
      });

      if (response.data?.success) {
        alert(`Raport generat cu succes! Număr: ${response.data.report_number}`);
        setNewStartDate('');
        setNewEndDate('');
        setNewLocation('');
        setNewNotes('');
        loadStats();
        loadVarianceReports();
      } else {
        alert(response.data?.error || 'Eroare la generarea raportului.');
      }
    } catch (error: any) {
      console.error('❌ Eroare la generarea raportului:', error);
      alert(error.response?.data?.error || 'Eroare la generarea raportului.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const url = `/api/admin/variance/export/excel`;
      const baseUrl = (httpClient.defaults.baseURL ?? '').replace(/\/$/, '');
      const fullUrl = `${baseUrl}${url}`;
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = `variance_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('❌ Eroare la exportul Excel:', error);
    }
  };

  const handleRefresh = () => {
    loadStats();
    loadVarianceReports();
  };

  const handleViewReport = (reportId: number) => {
    // Navigate to report details page
    window.location.href = `/nomenclator/variance/${reportId}`;
  };

  return (
    <div className="variance-reporting-page">
      <h2 className="mb-4">Variance Reporting - Analiza Abaterilor</h2>
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-chart-area me-2"></i>Variance Reporting - Analiza Abaterilor
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
          {/* Statistici Generale */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-white bg-info">
                <Card.Body>
                  <h4>{stats.totalReports}</h4>
                  <small>Total Rapoarte</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-white bg-warning">
                <Card.Body>
                  <h4>{stats.totalIngredients}</h4>
                  <small>Ingrediente Analizate</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-white bg-danger">
                <Card.Body>
                  <h4>{stats.criticalCount}</h4>
                  <small>Abateri Critice</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-white bg-secondary">
                <Card.Body>
                  <h4>{stats.totalValue.toFixed(2)} RON</h4>
                  <small>Valoare Totală Varianță</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Generare Raport Nou */}
          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">
                <i className="fas fa-plus-circle me-2"></i>Generare Raport Varianță Nou
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Label>Data Început *</Form.Label>
                  <Form.Control
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    required
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Data Sfârșit *</Form.Label>
                  <Form.Control
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    required
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Locație (Opțional)</Form.Label>
                  <Form.Select value={newLocation} onChange={(e) => setNewLocation(e.target.value)}>
                    <option value="">Toate Locațiile</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Label>&nbsp;</Form.Label>
                  <Button variant="primary" className="w-100" onClick={handleGenerateReport} disabled={loading}>
                    <i className="fas fa-chart-line me-1"></i>Generează Raport
                  </Button>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={6}>
                  <Form.Label>Creat de</Form.Label>
                  <Form.Control
                    type="text"
                    value={newCreatedBy}
                    onChange={(e) => setNewCreatedBy(e.target.value)}
                    placeholder="Nume manager"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Note (Opțional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Ex: Raport lunar octombrie 2025"
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Lista Rapoarte */}
          <Card>
            <Card.Header className="bg-secondary text-white">
              <h6 className="mb-0">
                <i className="fas fa-list me-2"></i>Istoric Rapoarte Varianță
              </h6>
            </Card.Header>
            <Card.Body>
              {/* Filtre */}
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Select
                    size="sm"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">Toate Statusurile</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completat</option>
                    <option value="approved">Aprobat</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    size="sm"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                  >
                    <option value="">Toate Locațiile</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="date"
                    size="sm"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="date"
                    size="sm"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                  />
                </Col>
              </Row>

              {/* Tabel Rapoarte */}
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Nr. Raport</th>
                      <th>Perioadă</th>
                      <th>Locație</th>
                      <th>Ingrediente</th>
                      <th>Critice</th>
                      <th>Varianță Totală</th>
                      <th>Status</th>
                      <th>Creat de</th>
                      <th>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="text-center">
                          <i className="fas fa-spinner fa-spin me-2"></i>Se încarcă...
                        </td>
                      </tr>
                    ) : reports.length > 0 ? (
                      reports.map((report) => (
                        <tr key={report.id}>
                          <td>{report.report_number}</td>
                          <td>
                            {new Date(report.start_date).toLocaleDateString('ro-RO')} -{' '}
                            {new Date(report.end_date).toLocaleDateString('ro-RO')}
                          </td>
                          <td>{report.location_name || 'Toate'}</td>
                          <td>{report.ingredients_count}</td>
                          <td>
                            <span className="badge bg-danger">{report.critical_count}</span>
                          </td>
                          <td>{report.total_variance.toFixed(2)} RON</td>
                          <td>
                            <span
                              className={`badge bg-${
                                report.status === 'approved'
                                  ? 'success'
                                  : report.status === 'completed'
                                    ? 'primary'
                                    : 'secondary'
                              }`}
                            >
                              {report.status === 'approved'
                                ? 'Aprobat'
                                : report.status === 'completed'
                                  ? 'Completat'
                                  : 'Draft'}
                            </span>
                          </td>
                          <td>{report.created_by}</td>
                          <td>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0"
                              onClick={() => handleViewReport(report.id)}
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center text-muted">
                          Nu există rapoarte generate.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </div>
  );
};

