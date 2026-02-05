// import { useTranslation } from '@/i18n/I18nContext';
import { useState } from 'react';
import DOMPurify from 'dompurify';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './FiscalReportXPage.css';

interface ReportXData {
  reportDate: string;
  timestamp: string;
  xNumber: string;
  note: string;
  summary: {
    totalReceipts: number;
    totalAmount: number;
    totalCash: number;
    totalCard: number;
    totalVAT: number;
    netAmount: number;
    vatBreakdown?: Array<{ rate: number; amount: number; base: number }>;
  };
}

export const FiscalReportXPage = () => {
  //   const { t } = useTranslation();
  const [reportDate, setReportDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportXData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReportX = async () => {
    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const response = await httpClient.get('/api/fiscal/x-report', {
        params: {
          date: reportDate,
        },
      });

      if (response.data) {
        setReportData(response.data);
      } else {
        setError('Nu s-au putut încărca datele raportului X.');
      }
    } catch (err: any) {
      console.error('❌ Eroare la generarea raportului X:', err);
      setError(err.response?.data?.error || 'Eroare la generarea raportului X.');
    } finally {
      setLoading(false);
    }
  };

  const displayVATBreakdown = (vatBreakdown?: Array<{ rate: number; amount: number; base: number }>) => {
    if (!vatBreakdown || vatBreakdown.length === 0) {
      return `<p class="text-muted">Nu există defalcare TVA disponibilă</p>`;
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

  return (
    <div className="fiscal-report-x-page">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <i className="fas fa-file-alt me-1"></i> Raport X
        </Card.Header>
        <Card.Body>
          <p className="text-muted">Raportul X se generează pentru a afișa totalurile intermediare.</p>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Selectează data pentru raport</Form.Label>
                <Form.Control
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" onClick={generateReportX} disabled={loading}>
                <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-file-alt'} me-1`}></i>
                {loading ? 'Se generează...' : 'Generează Raport X'}
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
                  <Card.Header className="bg-primary text-white">
                    <h6 className="mb-0">Rezultate Raport X - {reportData.reportDate}</h6>
                  </Card.Header>
                  <Card.Body>
                    <Alert variant="info">
                      <i className="fas fa-info-circle me-2"></i>
                      {reportData.note || 'Raport X - Intermediar'}
                    </Alert>

                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Număr raport X</strong> X-{reportData.xNumber}
                      </div>
                      <div className="col-6">
                        <strong>Ora generării</strong>' '
                        {new Date(reportData.timestamp).toLocaleString('ro-RO')}
                      </div>
                    </div>

                    <hr />

                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Total bonuri fiscale</strong> {reportData.summary.totalReceipts}
                      </div>
                      <div className="col-6">
                        <strong>Total Valoare:</strong> {reportData.summary.totalAmount.toFixed(2)} RON
                      </div>
                    </div>

                    <hr />

                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Total intrări cash</strong> {reportData.summary.totalCash.toFixed(2)} RON
                      </div>
                      <div className="col-6">
                        <strong>Total intrări card</strong> {reportData.summary.totalCard.toFixed(2)} RON
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

                    <h6 className="mt-3">Defalcare TVA pe cote</h6>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(displayVATBreakdown(reportData.summary.vatBreakdown)),
                      }}
                    />

                    <hr />

                    <Alert variant="info">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Raportul a fost salvat permanent.</strong>
                      <br />Poți vizualiza rapoartele X generate în secțiunea <strong>Arhivă</strong> din tab-ul fiscal.
                    </Alert>
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




