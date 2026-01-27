// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { Button, Card, Alert, Table, Badge, Modal, Form, Row, Col, Spinner, ProgressBar } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { Upload, FileText, FileCode, Download, Trash2, CheckCircle, AlertCircle, Clock, Package } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './InventoryImportPage.css';

interface ImportRecord {
  id: number;
  invoice_number: string;
  supplier_name: string;
  invoice_date: string;
  total_value: number;
  file_type: 'pdf' | 'xml' | 'manual';
  file_path: string | null;
  nir_id: number;
  status: 'draft' | 'imported' | 'processed' | 'error';
  items_count: number;
  created_at: string;
}

export const InventoryImportPage = () => {
//   const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [fileType, setFileType] = useState<'pdf' | 'xml' | 'manual'>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalValue, setTotalValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [history, setHistory] = useState<ImportRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    imported: 0,
    processed: 0,
    draft: 0
  });

  useEffect(() => {
    loadImportHistory();
  }, []);

  const loadImportHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await httpClient.get('/api/admin/inventory/import-history');
      if (response.data?.success) {
        setHistory(response.data.data || []);
        
        // Calculate stats
        const records = response.data.data || [];
        setStats({
          total: records.length,
          imported: records.filter((r: ImportRecord) => r.status === 'imported').length,
          processed: records.filter((r: ImportRecord) => r.status === 'processed').length,
          draft: records.filter((r: ImportRecord) => r.status === 'draft').length
        });
      }
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea istoricului:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Auto-detect file type
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') {
        setFileType('pdf');
      } else if (ext === 'xml') {
        setFileType('xml');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    // Validate required fields
    if (!invoiceNumber || !supplier || !invoiceDate || !totalValue) {
      setError('Vă rugăm completați toate câmpurile obligatorii.');
      return;
    }

    if (fileType !== 'manual' && !file) {
      setError('Vă rugăm selectați un fișier pentru import.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('file_type', fileType);
      formData.append('invoice_number', invoiceNumber);
      formData.append('supplier', supplier);
      formData.append('invoice_date', invoiceDate);
      formData.append('total_value', totalValue);

      const response = await httpClient.post('/api/admin/inventory/import-invoice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });

      if (response.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          handleCloseModal();
          loadImportHistory(); // Reload history
        }, 1500);
      } else {
        setError(response.data?.error || 'Eroare la importul facturii.');
      }
    } catch (err: any) {
      console.error('❌ Eroare la importul facturii:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la importul facturii.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFile(null);
    setInvoiceNumber('');
    setSupplier('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setTotalValue('');
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    setFileType('pdf');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Sigur doriți să ștergeți acest import?')) {
      return;
    }

    try {
      const response = await httpClient.delete(`/api/admin/inventory/import/"Id"`);
      if (response.data?.success) {
        loadImportHistory();
      } else {
        alert('Eroare la ștergerea importului: ' + (response.data?.error || 'Eroare necunoscută'));
      }
    } catch (err: any) {
      console.error('❌ Eroare la ștergerea importului:', err);
      alert('Eroare la ștergerea importului: ' + (err.response?.data?.error || err.message));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { variant: 'secondary', icon: Clock, label: 'Draft' },
      imported: { variant: 'success', icon: CheckCircle, label: 'Importat' },
      processed: { variant: 'primary', icon: Package, label: 'Procesat' },
      error: { variant: 'danger', icon: AlertCircle, label: 'Eroare' }
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    const Icon = config.icon;

    return (
      <Badge bg={config.variant}>
        <Icon size={14} className="me-1" style={{ verticalAlign: 'middle' }} />
        {config.label}
      </Badge>
    );
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText size={18} className="text-danger" />;
      case 'xml':
        return <FileCode size={18} className="text-primary" />;
      case 'manual':
        return <FileText size={18} className="text-secondary" />;
      default:
        return <FileText size={18} />;
    }
  };

  return (
    <div className="inventory-import-page p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <Upload size={32} className="me-2" style={{ verticalAlign: 'middle' }} />
            Import Facturi
          </h2>
          <p className="text-muted mb-0">Import facturi furnizori (PDF, XML) și creare automată NIR</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowModal(true)}
          className="d-flex align-items-center"
        >
          <Upload size={20} className="me-2" />"importa factura"</Button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="mb-2">{stats.total}</h3>
              <p className="text-muted mb-0">Total Importuri</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-success">
            <Card.Body>
              <h3 className="mb-2 text-success">{stats.imported}</h3>
              <p className="text-muted mb-0">Importate</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-primary">
            <Card.Body>
              <h3 className="mb-2 text-primary">{stats.processed}</h3>
              <p className="text-muted mb-0">Procesate</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-secondary">
            <Card.Body>
              <h3 className="mb-2 text-secondary">{stats.draft}</h3>
              <p className="text-muted mb-0">Draft</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Import History */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <Clock size={20} className="me-2" style={{ verticalAlign: 'middle' }} />
            Istoric Importuri
          </h5>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={loadImportHistory}
            disabled={historyLoading}
          >
            {historyLoading ? <Spinner animation="border" size="sm" /> : 'Reîmprospătează'}
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          {historyLoading ? (
            <div className="text-center p-5">
              <Spinner animation="border" />
              <p className="mt-3 text-muted">"se incarca istoric"</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center p-5">
              <AlertCircle size={48} className="text-muted mb-3" />
              <p className="text-muted">"nu exista importuri in istoric"</p>
              <Button variant="primary" onClick={() => setShowModal(true)}>"importa prima factura"</Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>"nr factura"</th>
                    <th>Furnizor</th>
                    <th>Data</th>
                    <th className="text-end">Valoare</th>
                    <th>Tip</th>
                    <th>Status</th>
                    <th>NIR ID</th>
                    <th>Articole</th>
                    <th>"importat la"</th>
                    <th className="text-end">"Acțiuni"</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <tr key={record.id}>
                      <td>{getFileTypeIcon(record.file_type)}</td>
                      <td><strong>{record.invoice_number}</strong></td>
                      <td>{record.supplier_name}</td>
                      <td>{new Date(record.invoice_date).toLocaleDateString('ro-RO')}</td>
                      <td className="text-end">
                        <strong>{record.total_value.toFixed(2)} RON</strong>
                      </td>
                      <td>
                        <Badge bg="light" text="dark">
                          {record.file_type.toUpperCase()}
                        </Badge>
                      </td>
                      <td>{getStatusBadge(record.status)}</td>
                      <td>
                        {record.nir_id ? (
                          <Badge bg="info">NIR #{record.nir_id}</Badge>
                        ) : (
                          <Badge bg="secondary">-</Badge>
                        )}
                      </td>
                      <td>
                        <Badge bg="light" text="dark">
                          {record.items_count || 0} articole
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(record.created_at).toLocaleString('ro-RO')}
                        </small>
                      </td>
                      <td className="text-end">
                        {record.file_path && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => window.open(`/uploads/invoices/${record.file_path}`, '_blank')}
                          >
                            <Download size={14} />
                          </Button>
                        )}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Import Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        size="xl" 
        backdrop="static"
        dialogClassName="inventory-import-modal-custom"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <Upload size={24} className="me-2" style={{ verticalAlign: 'middle' }} />"importa factura"</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">✅ Factura a fost importată cu succes!</Alert>}

          {loading && (
            <div className="mb-3">
              <ProgressBar 
                now={uploadProgress} 
                label={`${uploadProgress}%`}
                animated
                striped
              />
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            {/* File Type Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Tip Import *</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  label={
                    <span>
                      <FileText size={18} className="me-2 text-danger" style={{ verticalAlign: 'middle' }} />
                      PDF
                    </span>
                  }
                  name="fileType"
                  value="pdf"
                  checked={fileType === 'pdf'}
                  onChange={(e) => setFileType('pdf')}
                />
                <Form.Check
                  type="radio"
                  label={
                    <span>
                      <FileCode size={18} className="me-2 text-primary" style={{ verticalAlign: 'middle' }} />
                      XML (e-Factura)
                    </span>
                  }
                  name="fileType"
                  value="xml"
                  checked={fileType === 'xml'}
                  onChange={(e) => setFileType('xml')}
                />
                <Form.Check
                  type="radio"
                  label={
                    <span>
                      <FileText size={18} className="me-2 text-secondary" style={{ verticalAlign: 'middle' }} />Manual</span>
                  }
                  name="fileType"
                  value="manual"
                  checked={fileType === 'manual'}
                  onChange={(e) => setFileType('manual')}
                />
              </div>
            </Form.Group>

            {/* File Upload */}
            {fileType !== 'manual' && (
              <Form.Group className="mb-3">
                <Form.Label>Fișier Factură *</Form.Label>
                <Form.Control
                  type="file"
                  accept={fileType === 'pdf' ? '.pdf' : '.xml'}
                  onChange={handleFileChange}
                  required={fileType !== 'manual'}
                />
                {file && (
                  <Form.Text className="text-success">
                    <CheckCircle size={14} className="me-1" style={{ verticalAlign: 'middle' }} />
                    Fișier selectat: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </Form.Text>
                )}
              </Form.Group>
            )}

            <hr />

            {/* Invoice Details */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Număr Factură *</Form.Label>
                  <Form.Control
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Ex: FAC-2026-001"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Furnizor *</Form.Label>
                  <Form.Control
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Ex: Metro Cash & Carry"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data Factură *</Form.Label>
                  <Form.Control
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valoare Totală (RON) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Info Box */}
            <Alert variant="info" className="mb-0">
              <AlertCircle size={18} className="me-2" style={{ verticalAlign: 'middle' }} />
              <strong>"ce se intampla dupa import"</strong>
              <ul className="mb-0 mt-2">
                <li>Se creează automat un document NIR (Notă de Intrare Recepție)</li>
                <li>Se generează mișcări de stoc (RECEIVE) pentru toate articolele</li>
                <li>"fisierul original este salvat si poate fi descarca"</li>
              </ul>
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>"Anulează"</Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit as any} 
            disabled={loading || success}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />"se importa"</>
            ) : success ? (
              <>
                <CheckCircle size={18} className="me-2" style={{ verticalAlign: 'middle' }} />"importat cu succes"</>
            ) : (
              <>
                <Upload size={18} className="me-2" style={{ verticalAlign: 'middle' }} />"importa factura"</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};



