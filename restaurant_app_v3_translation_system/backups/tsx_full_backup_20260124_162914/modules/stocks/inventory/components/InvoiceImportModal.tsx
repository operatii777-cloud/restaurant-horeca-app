// import { useTranslation } from '@/i18n/I18nContext';
import { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

interface InvoiceImportModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
}

export const InvoiceImportModal = ({ show, onHide, onSuccess }: InvoiceImportModalProps) => {
//   const { t } = useTranslation();
  const [fileType, setFileType] = useState<'pdf' | 'xml'>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!file) {
      setError('Vă rugăm selectați un fișier.');
      return;
    }

    if (!invoiceNumber || !supplier || !invoiceDate || !totalValue) {
      setError('Vă rugăm completați toate câmpurile obligatorii.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', fileType);
      formData.append('invoice_number', invoiceNumber);
      formData.append('supplier', supplier);
      formData.append('invoice_date', invoiceDate);
      formData.append('total_value', totalValue);

      const response = await httpClient.post('/api/admin/inventory/import-invoice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
          if (onSuccess) {
            onSuccess();
          }
        }, 1500);
      } else {
        setError(response.data?.error || 'Eroare la importul facturii.');
      }
    } catch (err: any) {
      console.error('❌ Eroare la importul facturii:', err);
      setError(err.response?.data?.error || 'Eroare la importul facturii.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setInvoiceNumber('');
    setSupplier('');
    setInvoiceDate('');
    setTotalValue('');
    setError(null);
    setSuccess(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          <i className="fas fa-file-upload me-2"></i>"import factura"</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">"factura a fost importata cu succes"</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tip Fișier *</Form.Label>
            <Form.Select value={fileType} onChange={(e) => setFileType(e.target.value as 'pdf' | 'xml')} required>
              <option value="">"selecteaza tipul"</option>
              <option value="pdf">PDF</option>
              <option value="xml">XML</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fișier Factură *</Form.Label>
            <Form.Control
              type="file"
              accept={fileType === 'pdf' ? '.pdf' : '.xml'}
              onChange={handleFileChange}
              required
            />
            {file && <small className="text-muted">Fișier selectat: {file.name}</small>}
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Număr Factură *</Form.Label>
                <Form.Control
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Furnizor *</Form.Label>
                <Form.Control
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Data Factură *</Form.Label>
                <Form.Control
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Valoare Totală *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose} disabled={loading}>"Anulează"</Button>
            <Button variant="success" type="submit" disabled={loading || success}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-1"></i>"se importa"</>
              ) : (
                <>
                  <i className="fas fa-upload me-1"></i>"importa factura"</>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};




