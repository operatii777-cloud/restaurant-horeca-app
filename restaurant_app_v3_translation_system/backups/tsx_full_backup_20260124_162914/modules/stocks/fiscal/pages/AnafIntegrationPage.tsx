// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect } from 'react';
import { Card, Button, Alert, Form, Badge, Table } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './AnafIntegrationPage.css';

interface AnafConfig {
  company_name: string;
  cui: string;
  invoice_series: string;
  invoice_current_number: number;
  anaf_enabled: boolean;
  anaf_test_mode: boolean;
}

interface TransmissionLog {
  id: number;
  transmission_type: string;
  transmission_date: string;
  status_message: string;
  request_xml?: string;
}

export const AnafIntegrationPage = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<AnafConfig | null>(null);
  const [transmissionLog, setTransmissionLog] = useState<TransmissionLog[]>([]);
  const [cuiInput, setCuiInput] = useState('');
  const [cuiResult, setCuiResult] = useState<any>(null);
  const [validatingCui, setValidatingCui] = useState(false);
  const [raportZDate, setRaportZDate] = useState(new Date().toISOString().split('T')[0]);
  const [transmitting, setTransmitting] = useState(false);
  const [transmissionResult, setTransmissionResult] = useState<any>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  useEffect(() => {
    loadAnafConfig();
    loadTransmissionLog();
  }, []);

  const loadAnafConfig = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/anaf/config');
      if (response.data?.success) {
        setConfig(response.data.data);
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea configurației ANAF:', error);
      // Fallback pentru development
      setConfig({
        company_name: 'Restaurant Demo',
        cui: 'RO12345678',
        invoice_series: 'FAC',
        invoice_current_number: 1,
        anaf_enabled: false,
        anaf_test_mode: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTransmissionLog = async () => {
    try {
      const response = await httpClient.get('/api/anaf/transmission-log', {
        params: { limit: 10 },
      });
      if (response.data?.success && Array.isArray(response.data.data)) {
        setTransmissionLog(response.data.data);
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea istoricului transmisiilor:', error);
    }
  };

  const validateCUI = async () => {
    if (!cuiInput.trim()) {
      setFeedback({ type: 'error', message: 'Introduceți un CUI' });
      return;
    }

    setValidatingCui(true);
    setCuiResult(null);
    try {
      const response = await httpClient.get(`/api/anaf/validate-cui/${cuiInput.trim()}`);
      if (response.data?.success) {
        setCuiResult(response.data);
        if (response.data.valid) {
          setFeedback({ type: 'success', message: 'CUI valid!' });
        } else {
          setFeedback({ type: 'warning', message: 'CUI invalid sau nu există în baza ANAF' });
        }
      } else {
        setFeedback({ type: 'error', message: response.data?.error || 'Eroare la validare' });
      }
    } catch (error: any) {
      console.error('❌ Eroare la validarea CUI:', error);
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la validarea CUI' });
    } finally {
      setValidatingCui(false);
    }
  };

  const transmitRaportZ = async () => {
    if (!raportZDate) {
      setFeedback({ type: 'error', message: 'Selectați data raportului' });
      return;
    }

    setTransmitting(true);
    setTransmissionResult(null);
    try {
      const response = await httpClient.post('/api/anaf/transmit-raport-z', {
        date: raportZDate,
      });
      if (response.data?.success) {
        setTransmissionResult(response.data);
        if (response.data.simulated) {
          setFeedback({ type: 'warning', message: 'Transmisie SIMULATĂ (mod sandbox activ)' });
        } else {
          setFeedback({ type: 'success', message: 'Raport Z transmis cu succes!' });
        }
        loadTransmissionLog();
      } else {
        setFeedback({ type: 'error', message: response.data?.error || 'Eroare la transmitere' });
      }
    } catch (error: any) {
      console.error('❌ Eroare la transmiterea raportului Z:', error);
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la transmiterea raportului Z' });
    } finally {
      setTransmitting(false);
    }
  };

  const getStatusBadge = () => {
    if (!config) return null;
    return config.anaf_enabled ? (
      <Badge bg="success" className="p-2">
        <i className="fas fa-check-circle me-2"></i>"PRODUCȚIE"</Badge>
    ) : (
      <Badge bg="warning" className="p-2">
        <i className="fas fa-flask me-2"></i>SANDBOX
      </Badge>
    );
  };

  const getTransmissionStatusBadge = (status: string) => {
    if (status?.includes('SIMULATĂ')) {
      return <Badge bg="warning">"SIMULATĂ"</Badge>;
    } else if (status?.includes('ACCEPTED') || status?.includes('ACCEPTAT')) {
      return <Badge bg="success">ACCEPTAT</Badge>;
    } else if (status?.includes('REJECTED') || status?.includes('RESPINS')) {
      return <Badge bg="danger">RESPINS</Badge>;
    }
    return <Badge bg="secondary">{status || 'Unknown'}</Badge>;
  };

  return (
    <div className="anaf-integration-page">
      <PageHeader
        title="🏛️ ANAF Integration"
        description="Integrare completă cu ANAF: validare CUI, transmitere rapoarte, configurare"
      />

      {feedback && (
        <Alert
          variant={feedback.type === 'error' ? 'danger' : feedback.type === 'success' ? 'success' : 'warning'}
          dismissible
          onClose={() => setFeedback(null)}
          className="mt-3"
        >
          {feedback.message}
        </Alert>
      )}

      {/* Status Card */}
      <Alert variant="warning" className="mt-3">
        <h5 className="alert-heading">
          <i className="fas fa-info-circle me-2"></i>Mod Sandbox Activ
        </h5>
        <p className="mb-2">"anaf integration este in"<strong>MOD SANDBOX</strong> (test mode).</p>
        <ul className="mb-0">
          <li><strong>✅ Validare CUI:</strong> Funcțională (API public ANAF fără certificat)</li>
          <li><strong>⚠️ Transmitere Rapoarte:</strong> SIMULATĂ (nu se transmit real la ANAF)</li>
          <li><strong>📄 eFatura:</strong> Generare XML (nu se transmite fără certificat digital)</li>
        </ul>
        <hr />
        <p className="mb-0">
          <strong>"pentru productie"</strong> Este necesar certificat digital calificat de la ANAF + configurare OAuth2.
        </p>
      </Alert>

      {/* Validare CUI */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="fas fa-building me-2"></i>Validare CUI (LIVE - API ANAF Public)
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <Form.Control
                  type="text"
                  value={cuiInput}
                  onChange={(e) => setCuiInput(e.target.value)}
                  placeholder={t('$([ex_ro12345678_sau_12345678] -replace "\[|\]")')}
                />
                <Button variant="primary" onClick={validateCUI} disabled={validatingCui}>
                  <i className={`fas ${validatingCui ? 'fa-spinner fa-spin' : 'fa-search'} me-2`}></i>"valideaza cui"</Button>
              </div>
            </div>
          </div>
          {cuiResult && (
            <div className="mt-3">
              {cuiResult.valid ? (
                <Alert variant="success">
                  <h5 className="alert-heading">
                    <i className="fas fa-check-circle me-2"></i>"cui valid"</h5>
                  {cuiResult.data && (
                    <>
                      <p className="mb-1"><strong>"Denumire:"</strong> {cuiResult.data.denumire}</p>
                      <p className="mb-1"><strong>"CUI:"</strong> {cuiResult.data.cui}</p>
                      <p className="mb-1"><strong>"Adresă:"</strong> {cuiResult.data.adresa || '-'}</p>
                      <p className="mb-0"><strong>"platitor tva"</strong> {cuiResult.data.scpTVA ? '✅ DA' : '❌ NU'}</p>
                    </>
                  )}
                </Alert>
              ) : (
                <Alert variant="danger">
                  <i className="fas fa-times-circle me-2"></i>
                  <strong>"cui invalid sau nu exista in baza anaf"</strong>
                </Alert>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Transmisii Simulate */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="fas fa-paper-plane me-2"></i>Transmisii ANAF (SIMULATE)
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-6">
              <Form.Label>"data raport z"</Form.Label>
              <div className="input-group">
                <Form.Control
                  type="date"
                  value={raportZDate}
                  onChange={(e) => setRaportZDate(e.target.value)}
                />
                <Button
                  variant="warning"
                  onClick={transmitRaportZ}
                  disabled={transmitting}
                >
                  <i className={`fas ${transmitting ? 'fa-spinner fa-spin' : 'fa-file-invoice'} me-2`}></i>
                  Transmite Raport Z (Simulate)
                </Button>
              </div>
            </div>
          </div>
          {transmissionResult && (
            <div className="mt-3">
              {transmissionResult.simulated ? (
                <Alert variant="warning">
                  <h5 className="alert-heading">
                    <i className="fas fa-flask me-2"></i>"transmisie simulata"</h5>
                  <p className="mb-1"><strong>Upload ID:</strong> {transmissionResult.upload_id}</p>
                  <p className="mb-1"><strong>Status:</strong> {transmissionResult.status}</p>
                  <p className="mb-0">{transmissionResult.message}</p>
                </Alert>
              ) : (
                <Alert variant={transmissionResult.success ? 'success' : 'danger'}>
                  {transmissionResult.message || transmissionResult.error}
                </Alert>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Istoric Transmisii */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="fas fa-history me-2"></i>Istoric Transmisii ANAF
          </h5>
        </Card.Header>
        <Card.Body>
          {transmissionLog.length === 0 ? (
            <p className="text-muted text-center">"nicio transmisie inregistrata"</p>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Tip</th>
                  <th>Dată</th>
                  <th>Status</th>
                  <th>XML</th>
                </tr>
              </thead>
              <tbody>
                {transmissionLog.map((log) => (
                  <tr key={log.id}>
                    <td>{log.transmission_type}</td>
                    <td>{new Date(log.transmission_date).toLocaleString('ro-RO')}</td>
                    <td>{getTransmissionStatusBadge(log.status_message)}</td>
                    <td>
                      {log.request_xml ? (
                        <small className="text-muted">{log.request_xml.substring(0, 100)}...</small>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Configurare ANAF */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-cog me-2"></i>Configurare ANAF
          </h5>
          {getStatusBadge()}
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Se încarcă...</span>
              </div>
            </div>
          ) : config ? (
            <div className="row">
              <div className="col-md-6">
                <p className="mb-2"><strong>Companie:</strong> {config.company_name}</p>
              </div>
              <div className="col-md-6">
                <p className="mb-2"><strong>"CUI:"</strong> {config.cui}</p>
              </div>
              <div className="col-md-6">
                <p className="mb-2"><strong>Serie Facturi:</strong> {config.invoice_series}</p>
              </div>
              <div className="col-md-6">
                <p className="mb-2"><strong>"nr curent"</strong> {config.invoice_current_number}</p>
              </div>
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>ANAF Enabled:</strong> {config.anaf_enabled ? '✅ DA' : '❌ NU (Sandbox)'}
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>"test mode"</strong> {config.anaf_test_mode ? '✅ DA' : '❌ NU'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted">"nu s au putut incarca datele de configurare"</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};





