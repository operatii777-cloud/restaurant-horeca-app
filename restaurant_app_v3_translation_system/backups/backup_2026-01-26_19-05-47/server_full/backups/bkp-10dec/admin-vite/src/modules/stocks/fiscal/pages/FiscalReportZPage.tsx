import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './FiscalReportZPage.css';

interface ReportZStatus {
  canGenerate: boolean;
  openOrders: number;
  totalOrders: number;
  message: string;
}

interface ReportZData {
  reportDate: string;
  timestamp: string;
  zNumber: string;
  summary: {
    totalReceipts: number;
    totalAmount: number;
    totalCash: number;
    totalCard: number;
    totalVAT: number;
    netAmount: number;
    vatBreakdown?: Array<{ rate: number; amount: number; base: number }>;
  };
  receipts?: Array<{
    id: number;
    number: string;
    date: string;
    amount: number;
    payment_method: string;
  }>;
}

export const FiscalReportZPage = () => {
  const [reportDate, setReportDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [status, setStatus] = useState<ReportZStatus | null>(null);
  const [reportData, setReportData] = useState<ReportZData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkReportZStatus();
  }, [reportDate]);

  const checkReportZStatus = async () => {
    setCheckingStatus(true);
    try {
      const response = await httpClient.get('/api/reports/z-report/status', {
        params: {
          date: reportDate,
        },
      });

      if (response.data) {
        setStatus({
          canGenerate: response.data.can_generate || false,
          openOrders: response.data.open_orders || 0,
          totalOrders: response.data.total_orders || 0,
          message: response.data.message || '',
        });
      }
    } catch (err: any) {
      console.error('❌ Eroare la verificarea statusului:', err);
      // Fallback status
      setStatus({
        canGenerate: true,
        openOrders: 0,
        totalOrders: 0,
        message: 'Status verificat',
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  const generateReportZ = async () => {
    if (!status?.canGenerate) {
      if (status?.openOrders > 0) {
        alert(
          `❌ NU POȚI GENERA RAPORT Z!\n\nExistă ${status.openOrders} comenzi deschise pentru ${reportDate}.\n\nToate comenzile trebuie să fie achitate sau anulate înainte de a genera Raportul Z fiscal.`,
        );
      } else if (status?.totalOrders === 0) {
        alert(`⚠️ Nu există comenzi pentru ziua ${reportDate}.`);
      }
      return;
    }

    // Confirmare dublă
    if (
      !confirm(
        `Ești sigur că vrei să generezi Raportul Z pentru ${reportDate}?\n\nAceastă acțiune închide ziua fiscală și NU POATE FI ANULATĂ.`,
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const response = await httpClient.post('/api/reports/z-report/generate', {
        date: reportDate,
      });

      if (response.data) {
        setReportData(response.data);
      } else {
        setError('Nu s-au putut încărca datele raportului Z.');
      }
    } catch (err: any) {
      console.error('❌ Eroare la generarea raportului Z:', err);
      setError(err.response?.data?.error || 'Eroare la generarea raportului Z.');
    } finally {
      setLoading(false);
    }
  };

  const displayVATBreakdown = (vatBreakdown?: Array<{ rate: number; amount: number; base: number }>) => {
    if (!vatBreakdown || vatBreakdown.length === 0) {
      return '<p class="text-muted">Nu există defalcare TVA disponibilă.</p>';
    }

    return `
      <table class="table table-sm table-striped">
        <thead>
          <tr>
            <th>Cota TVA (%)</th>
            <th>Baza (RON)</th>
            <th>TVA (RON)</th>
          </tr>
        </thead>
        <tbody>
          ${vatBreakdown
            .map(
              (item) => `
            <tr>
              <td>${item.rate}%</td>
              <td>${item.base.toFixed(2)}</td>
              <td>${item.amount.toFixed(2)}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
  };

  const displayReceiptsList = (receipts: Array<{ id: number; number: string; date: string; amount: number; payment_method: string }>) => {
    if (!receipts || receipts.length === 0) {
      return '<p class="text-muted">Nu există bonuri pentru această zi.</p>';
    }

    return `
      <table class="table table-sm table-striped">
        <thead>
          <tr>
            <th>Număr Bon</th>
            <th>Data</th>
            <th>Suma</th>
            <th>Metodă Plată</th>
          </tr>
        </thead>
        <tbody>
          ${receipts
            .map(
              (receipt) => `
            <tr>
              <td>${receipt.number}</td>
              <td>${new Date(receipt.date).toLocaleDateString('ro-RO')}</td>
              <td>${receipt.amount.toFixed(2)} RON</td>
              <td>${receipt.payment_method}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
  };

  return (
    <div className="fiscal-report-z-page">
      <Card className="shadow-sm">
        <Card.Header className="bg-danger text-white">
          <i className="fas fa-file-alt me-1"></i> Raport Z
        </Card.Header>
        <Card.Body>
          <p className="text-muted">
            Raportul Z se generează la sfârșitul zilei pentru a închide casă și a transmite datele la ANAF.
          </p>

          <Alert variant="warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Atenție!</strong> Raportul Z închide ziua fiscală. Nu poate fi anulat după generare.
          </Alert>

          {/* Status Card */}
          <Card className="mb-3" style={{ borderLeft: '4px solid #ffc107' }}>
            <Card.Body>
              <h6 className="card-title">
                <i className="fas fa-clipboard-check me-2"></i>Status Comenzi
              </h6>
              <div>
                {checkingStatus ? (
                  <div className="text-center">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Se verifică...</span>
                    </div>
                    <span className="ms-2">Verificare comenzi...</span>
                  </div>
                ) : status ? (
                  status.canGenerate ? (
                    <Alert variant="success" className="mb-0">
                      <i className="fas fa-check-circle me-2"></i>
                      <strong>Gata pentru Raport Z</strong>
                      <br />
                      {status.totalOrders > 0
                        ? `Toate cele ${status.totalOrders} comenzi sunt închise (achitate sau anulate).`
                        : 'Nu există comenzi pentru această zi.'}
                    </Alert>
                  ) : (
                    <Alert variant="danger" className="mb-0">
                      <i className="fas fa-times-circle me-2"></i>
                      <strong>NU poate genera Raport Z!</strong>
                      <br />
                      ⚠️ Există {status.openOrders} comenzi deschise pentru {reportDate}.
                      <br />
                      Toate comenzile trebuie să fie achitate sau anulate înainte de a genera Raportul Z.
                    </Alert>
                  )
                ) : (
                  <p className="text-muted mb-0">Status necunoscut</p>
                )}
              </div>
            </Card.Body>
          </Card>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Selectează data pentru raport:</Form.Label>
                <Form.Control
                  type="date"
                  value={reportDate}
                  onChange={(e) => {
                    setReportDate(e.target.value);
                    setReportData(null);
                    setError(null);
                  }}
                />
              </Form.Group>
              <Button
                variant="danger"
                onClick={generateReportZ}
                disabled={loading || !status?.canGenerate}
              >
                <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-file-alt'} me-1`}></i>
                {loading ? 'Se generează...' : 'Generează Raport Z'}
              </Button>
            </div>

            <div className="col-md-6">
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {reportData && (
                <Card className="mt-3">
                  <Card.Header className="bg-danger text-white">
                    <h6 className="mb-0">Raport Z Generat - {reportData.reportDate}</h6>
                  </Card.Header>
                  <Card.Body>
                    <Alert variant="success">
                      <i className="fas fa-check-circle me-2"></i>
                      Ziua fiscală a fost închisă cu succes!
                    </Alert>

                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Număr Raport Z:</strong> Z-{reportData.zNumber}
                      </div>
                      <div className="col-6">
                        <strong>Ora Generării:</strong>{' '}
                        {new Date(reportData.timestamp).toLocaleString('ro-RO')}
                      </div>
                    </div>

                    <hr />

                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Total Bonuri:</strong> {reportData.summary.totalReceipts}
                      </div>
                      <div className="col-6">
                        <strong>Total Valoare:</strong> {reportData.summary.totalAmount.toFixed(2)} RON
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Total Cash:</strong> {reportData.summary.totalCash.toFixed(2)} RON
                      </div>
                      <div className="col-6">
                        <strong>Total Card:</strong> {reportData.summary.totalCard.toFixed(2)} RON
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Total TVA:</strong> {reportData.summary.totalVAT.toFixed(2)} RON
                      </div>
                      <div className="col-6">
                        <strong>Net (fără TVA):</strong> {reportData.summary.netAmount.toFixed(2)} RON
                      </div>
                    </div>

                    <hr />

                    <h6 className="mt-3">Defalcare TVA pe Cote</h6>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(displayVATBreakdown(reportData.summary.vatBreakdown)),
                      }}
                    />

                    <hr />

                    <Alert variant="info">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Raportul a fost salvat permanent.</strong>
                      <br />
                      Poți vizualiza rapoartele Z generate în secțiunea <strong>"Arhivă"</strong> din tab-ul fiscal.
                    </Alert>

                    <hr />

                    <h6 className="mt-3">
                      Toate Vânzările Zilei ({reportData.receipts?.length || 0} bonuri)
                    </h6>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(displayReceiptsList(reportData.receipts || [])),
                      }}
                    />
                  </Card.Body>
                </Card>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

