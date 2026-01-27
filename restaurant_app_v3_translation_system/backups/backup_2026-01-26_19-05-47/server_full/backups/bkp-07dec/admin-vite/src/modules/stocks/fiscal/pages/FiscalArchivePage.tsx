import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './FiscalArchivePage.css';

interface FiscalDocument {
  id: number;
  document_type: 'invoice' | 'receipt' | 'fiscal_report' | 'monthly_report' | 'other';
  document_number: string;
  document_date: string;
  amount: number;
  tax_amount: number;
  status: 'draft' | 'issued' | 'cancelled' | 'archived';
  file_url?: string;
  created_at: string;
}

export const FiscalArchivePage = () => {
  const [documents, setDocuments] = useState<FiscalDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [filterType, filterStatus, filterDateFrom, filterDateTo]);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/fiscal/archive', {
        params: {
          document_type: filterType || undefined,
          status: filterStatus || undefined,
          date_from: filterDateFrom || undefined,
          date_to: filterDateTo || undefined,
          search: searchTerm || undefined,
        },
      });
      if (response.data?.success) {
        setDocuments(response.data.data || []);
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea documentelor:', error);
      // Fallback pentru development
      setDocuments([
        {
          id: 1,
          document_type: 'invoice',
          document_number: 'INV-001',
          document_date: '2025-01-15',
          amount: 1250.0,
          tax_amount: 237.5,
          status: 'issued',
          file_url: '/files/invoices/INV-001.pdf',
          created_at: '2025-01-15T10:00:00Z',
        },
        {
          id: 2,
          document_type: 'receipt',
          document_number: 'RC-001',
          document_date: '2025-01-15',
          amount: 150.0,
          tax_amount: 28.5,
          status: 'issued',
          file_url: '/files/receipts/RC-001.pdf',
          created_at: '2025-01-15T11:00:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, filterDateFrom, filterDateTo, searchTerm]);

  const handleDownload = (document: FiscalDocument) => {
    if (document.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  const handleExportArchive = async (format: 'excel' | 'pdf') => {
    try {
      const url = `/api/fiscal/archive/export/${format}?${new URLSearchParams({
        document_type: filterType || '',
        status: filterStatus || '',
        date_from: filterDateFrom || '',
        date_to: filterDateTo || '',
      }).toString()}`;
      const baseUrl = (httpClient.defaults.baseURL ?? '').replace(/\/$/, '');
      const fullUrl = `${baseUrl}${url}`;

      if (format === 'excel') {
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = `arhiva_fiscala_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(fullUrl, '_blank');
      }
    } catch (error) {
      console.error('❌ Eroare la exportul arhivei:', error);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      invoice: 'Factură',
      receipt: 'Bon Fiscal',
      fiscal_report: 'Raport Fiscal',
      monthly_report: 'Raport Lunar',
      other: 'Altul',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; label: string }> = {
      draft: { bg: 'secondary', label: 'Ciornă' },
      issued: { bg: 'success', label: 'Emis' },
      cancelled: { bg: 'danger', label: 'Anulat' },
      archived: { bg: 'info', label: 'Arhivat' },
    };
    const badge = badges[status] || badges.draft;
    return <span className={`badge bg-${badge.bg}`}>{badge.label}</span>;
  };

  const filteredDocuments = documents.filter((doc) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        doc.document_number.toLowerCase().includes(searchLower) ||
        doc.document_type.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="fiscal-archive-page">
      <h2 className="mb-4">Arhiva Documente Fiscale</h2>

      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-archive me-2"></i>Arhiva Documente Fiscale
          </h5>
          <div>
            <Button variant="light" size="sm" className="me-2" onClick={() => handleExportArchive('excel')}>
              <i className="fas fa-file-excel me-1"></i>Export Excel
            </Button>
            <Button variant="light" size="sm" onClick={() => handleExportArchive('pdf')}>
              <i className="fas fa-file-pdf me-1"></i>Export PDF
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Filtre */}
          <Row className="mb-3">
            <Col md={3}>
              <Form.Label>Tip Document</Form.Label>
              <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">Toate</option>
                <option value="invoice">Factură</option>
                <option value="receipt">Bon Fiscal</option>
                <option value="fiscal_report">Raport Fiscal</option>
                <option value="monthly_report">Raport Lunar</option>
                <option value="other">Altul</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Status</Form.Label>
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Toate</option>
                <option value="draft">Ciornă</option>
                <option value="issued">Emis</option>
                <option value="cancelled">Anulat</option>
                <option value="archived">Arhivat</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Data De La</Form.Label>
              <Form.Control
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Data Până La</Form.Label>
              <Form.Control
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </Col>
          </Row>

          {/* Căutare */}
          <Row className="mb-3">
            <Col md={12}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Caută după număr document sau tip..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="secondary" onClick={loadDocuments}>
                  <i className="fas fa-sync-alt"></i>
                </Button>
              </InputGroup>
            </Col>
          </Row>

          {/* Tabel Documente */}
          {loading ? (
            <div className="text-center py-4">
              <i className="fas fa-spinner fa-spin fa-2x text-info"></i>
              <p className="mt-2">Se încarcă documentele...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover size="sm">
                <thead>
                  <tr>
                    <th>Tip</th>
                    <th>Număr Document</th>
                    <th>Data</th>
                    <th>Valoare</th>
                    <th>TVA</th>
                    <th>Status</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments
                      .sort((a, b) => new Date(b.document_date).getTime() - new Date(a.document_date).getTime())
                      .map((document) => (
                        <tr key={document.id}>
                          <td>
                            <span className="badge bg-primary">{getDocumentTypeLabel(document.document_type)}</span>
                          </td>
                          <td>
                            <strong>{document.document_number}</strong>
                          </td>
                          <td>{new Date(document.document_date).toLocaleDateString('ro-RO')}</td>
                          <td>{document.amount.toFixed(2)} RON</td>
                          <td>{document.tax_amount.toFixed(2)} RON</td>
                          <td>{getStatusBadge(document.status)}</td>
                          <td>
                            {document.file_url && (
                              <Button variant="link" size="sm" onClick={() => handleDownload(document)}>
                                <i className="fas fa-download"></i>
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted">
                        Nu există documente în arhivă pentru filtrele selectate.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}

          {/* Statistici */}
          {filteredDocuments.length > 0 && (
            <Card className="mt-4">
              <Card.Header>
                <h6 className="mb-0">Statistici Arhivă</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <strong>Total Documente:</strong> {filteredDocuments.length}
                  </Col>
                  <Col md={3}>
                    <strong>Valoare Totală:</strong>{' '}
                    {filteredDocuments.reduce((sum, doc) => sum + doc.amount, 0).toFixed(2)} RON
                  </Col>
                  <Col md={3}>
                    <strong>TVA Total:</strong>{' '}
                    {filteredDocuments.reduce((sum, doc) => sum + doc.tax_amount, 0).toFixed(2)} RON
                  </Col>
                  <Col md={3}>
                    <strong>Valoare cu TVA:</strong>{' '}
                    {filteredDocuments
                      .reduce((sum, doc) => sum + doc.amount + doc.tax_amount, 0)
                      .toFixed(2)}{' '}
                    RON
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

