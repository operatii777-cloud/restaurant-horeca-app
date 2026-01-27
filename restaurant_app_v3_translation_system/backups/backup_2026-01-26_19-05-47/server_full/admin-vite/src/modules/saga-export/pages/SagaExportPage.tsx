// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col, Table } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { httpClient } from '@/shared/api/httpClient';
import './SagaExportPage.css';

export function SagaExportPage() {
//   const { t } = useTranslation();
  const [exportType, setExportType] = useState<'nir' | 'sales'>('nir');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [debitAccount, setDebitAccount] = useState('371');
  const [creditAccount, setCreditAccount] = useState('401');
  const [defaultVatRate, setDefaultVatRate] = useState(9);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportHistory, setExportHistory] = useState<Array<{
    id: number;
    type: string;
    start_date: string;
    end_date: string;
    exported_at: string;
    exported_by: string;
    rows_count: number;
  }>>([]);
  const [brandConfig, setBrandConfig] = useState({
    unitName: '',
    cui: '',
    address: '',
    gestion: ''
  });
  const [showBrandConfig, setShowBrandConfig] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await httpClient.post('/api/saga/export', {
        type: exportType,
        startDate,
        endDate,
        debitAccount,
        creditAccount,
        defaultVatRate,
        brand: brandConfig,
      }, {
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `saga-${exportType}-${startDate}-${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(`Export finalizat cu succes! Fișier: saga-${exportType}-${startDate}-${endDate}.csv`);
      loadExportHistory();
    } catch (err: any) {
      console.error('SAGA export error:', err);
      setError(err.response?.data?.error || 'Eroare la exportul SAGA.');
    } finally {
      setLoading(false);
    }
  };

  const loadExportHistory = async () => {
    try {
      const response = await httpClient.get('/api/saga/history');
      if (response.data.success) {
        setExportHistory(response.data.history || []);
      }
    } catch (err) {
      console.error('Error loading export history:', err);
    }
  };

  const loadBrandConfig = async () => {
    try {
      const response = await httpClient.get('/api/saga/brand-config');
      if (response.data.success && response.data.config) {
        setBrandConfig(response.data.config);
      }
    } catch (err) {
      console.error('Error loading brand config:', err);
    }
  };

  const saveBrandConfig = async () => {
    try {
      await httpClient.post('/api/saga/brand-config', brandConfig);
      setSuccess('Configurare brand salvată cu succes!');
      setShowBrandConfig(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Eroare la salvarea configurației brand.');
    }
  };

  useEffect(() => {
    loadExportHistory();
    loadBrandConfig();
  }, []);

  return (
    <div className="saga-export-page">
      <PageHeader
        title="📊 Export SAGA"
        description="Export date pentru sistemul SAGA (NIR și Vânzări)"
      />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          <i className="fas fa-check-circle me-2"></i>
          {success}
        </Alert>
      )}

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Configurare Export</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Tip Export</Form.Label>
                  <Form.Select
                    value={exportType}
                    onChange={(e) => setExportType(e.target.value as 'nir' | 'sales')}
                  >
                    <option value="nir">NIR (Notă Intrare-Recepție)</option>
                    <option value="sales">"Vânzări"</option>
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Data Start</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Data End</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>"cont debit"</Form.Label>
                      <Form.Control
                        type="text"
                        value={debitAccount}
                        onChange={(e) => setDebitAccount(e.target.value)}
                        placeholder="371"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cont Credit</Form.Label>
                      <Form.Control
                        type="text"
                        value={creditAccount}
                        onChange={(e) => setCreditAccount(e.target.value)}
                        placeholder="401"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Cota TVA Implicită (%)</Form.Label>
                  <Form.Control
                    type="number"
                    value={defaultVatRate}
                    onChange={(e) => setDefaultVatRate(parseFloat(e.target.value) || 9)}
                    min="0"
                    max="25"
                    step="0.1"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  onClick={handleExport}
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>"se genereaza"</>
                  ) : (
                    <>
                      <i className="fas fa-download me-2"></i>
                      Export CSV
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Configurare Brand</h5>
              <Button variant="link" size="sm" onClick={() => setShowBrandConfig(!showBrandConfig)}>
                <i className={`fas fa-${showBrandConfig ? 'chevron-up' : 'chevron-down'}`}></i>
              </Button>
            </Card.Header>
            {showBrandConfig && (
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Nume Unitate</Form.Label>
                    <Form.Control
                      type="text"
                      value={brandConfig.unitName}
                      onChange={(e) => setBrandConfig({ ...brandConfig, unitName: e.target.value })}
                      placeholder="nume unitate"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>CUI</Form.Label>
                    <Form.Control
                      type="text"
                      value={brandConfig.cui}
                      onChange={(e) => setBrandConfig({ ...brandConfig, cui: e.target.value })}
                      placeholder="CUI"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Adresă</Form.Label>
                    <Form.Control
                      type="text"
                      value={brandConfig.address}
                      onChange={(e) => setBrandConfig({ ...brandConfig, address: e.target.value })}
                      placeholder="Adresă"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Gestiune</Form.Label>
                    <Form.Control
                      type="text"
                      value={brandConfig.gestion}
                      onChange={(e) => setBrandConfig({ ...brandConfig, gestion: e.target.value })}
                      placeholder="Gestiune"
                    />
                  </Form.Group>
                  <Button variant="primary" size="sm" onClick={saveBrandConfig} className="w-100">
                    <i className="fas fa-save me-2"></i>"salveaza configurare"</Button>
                </Form>
              </Card.Body>
            )}
          </Card>

          <Card>
            <Card.Header>
              <h5>Istoric Exporturi</h5>
            </Card.Header>
            <Card.Body>
              {exportHistory.length === 0 ? (
                <p className="text-muted text-center">"nu exista exporturi inregistrate"</p>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Tip</th>
                        <th>Perioadă</th>
                        <th>Linii</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exportHistory.slice(0, 10).map((item) => (
                        <tr key={item.id}>
                          <td>{item.type.toUpperCase()}</td>
                          <td>
                            {new Date(item.start_date).toLocaleDateString('ro-RO')} -' '
                            {new Date(item.end_date).toLocaleDateString('ro-RO')}
                          </td>
                          <td>{item.rows_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}




