// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Digital Signatures Page
 * 
 * Gestionare Semnături Digitale pentru Documente Contabile:
 * - Lista semnături
 * - Verificare semnături
 * - Detalii semnătură
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Alert, Badge, Modal, Form } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
// Removed: Bootstrap CSS import - already loaded globally
// Removed: FontAwesome CSS import - already loaded globally
import './DigitalSignaturesPage.css';

interface DigitalSignature {
  id: number;
  document_type: string;
  document_id: number;
  document_number?: string;
  signed_by: string;
  signature_hash: string;
  signature_time: string;
  signature_method: string;
  certificate_info?: string;
  is_valid: boolean;
  verified_at?: string;
  verified_by?: string;
}

export const DigitalSignaturesPage: React.FC = () => {
//   const { t } = useTranslation();
  const [signatures, setSignatures] = useState<DigitalSignature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSignature, setSelectedSignature] = useState<DigitalSignature | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadSignatures();
  }, []);

  const loadSignatures = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get('/api/accounting/audit/signatures');
      console.log('DigitalSignaturesPage Response:', response.data);
      
      let signaturesList: DigitalSignature[] = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        signaturesList = response.data.data;
      } else if (Array.isArray(response.data)) {
        signaturesList = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        signaturesList = response.data.data;
      }
      
      if (!Array.isArray(signaturesList)) {
        console.warn('DigitalSignaturesPage signaturesList is not an array, setting to empty array');
        signaturesList = [];
      }
      
      console.log('DigitalSignaturesPage Loaded signatures:', signaturesList.length);
      setSignatures(signaturesList);
    } catch (err: any) {
      console.error('DigitalSignaturesPage Error:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea semnăturilor');
      setSignatures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignature = async (id: number) => {
    try {
      const response = await httpClient.post(`/api/accounting/audit/signatures/"Id"/verify`);
      if (response.data.success) {
        loadSignatures(); // Reload to get updated status
      } else {
        alert('Eroare la verificare: ' + (response.data.error || 'Eroare necunoscută'));
      }
    } catch (err: any) {
      alert('Eroare la verificare: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleViewDetails = (signature: DigitalSignature) => {
    setSelectedSignature(signature);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('ro-RO');
    } catch {
      return dateString;
    }
  };

  const getDocumentTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; label: string }> = {
      'invoice': { bg: 'primary', label: 'Factură' },
      'receipt': { bg: 'success', label: 'Bon Fiscal' },
      'report': { bg: 'info', label: 'Raport' },
      'export': { bg: 'warning', label: 'Export' },
      'other': { bg: 'secondary', label: 'Altul' }
    };
    const badge = badges[type] || badges['other'];
    return <Badge bg={badge.bg}>{badge.label}</Badge>;
  };

  return (
    <div className="digital-signatures-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>âœï¸ Semnături Digitale</h1>
          <p>"gestionare si verificare semnaturi digitale pentru"</p>
        </div>
        <HelpButton
          title="ajutor semnaturi digitale"
          content={
            <div>
              <h5>âœï¸ Ce sunt semnăturile digitale?</h5>
              <p>
                Semnăturile digitale asigură integritatea și autenticitatea documentelor contabile. 
                Fiecare document important (facturi, rapoarte Z, etc.) poate fi semnat digital.
              </p>
              <h5 className="mt-4">ðŸ” Funcționalități</h5>
              <ul>
                <li><strong>"generare semnatura"</strong> - Creează o semnătură digitală pentru un document</li>
                <li><strong>"verificare semnatura"</strong> - Verifică dacă un document a fost modificat</li>
                <li><strong>Istoric</strong> - Vezi toate semnăturile generate</li>
                <li><strong>"Detalii"</strong> - Vezi informații despre semnătură (hash, timestamp, etc.)</li>
              </ul>
              <h5 className="mt-4">ðŸ”’ Securitate</h5>
              <p>
                Semnăturile digitale folosesc algoritmi criptografici pentru a asigura că documentul 
                nu a fost modificat după semnare. Orice modificare va invalida semnătura.
              </p>
              <div className="alert alert-warning mt-4">
                <strong>âš ï¸ Important:</strong> Semnăturile digitale nu înlocuiesc semnăturile legale. 
                Consultă întotdeauna un avocat pentru aspecte legale.
              </div>
            </div>
          }
        />
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3">
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">"lista semnaturi"</h5>
          <Button variant="outline-primary" onClick={loadSignatures}>
            <i className="fas fa-sync me-2"></i>"Reîncarcă"</Button>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <i className="fas fa-spinner fa-spin fa-2x"></i>
            </div>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>"Document"</th>
                  <th>Tip Document</th>
                  <th>"semnat de"</th>
                  <th>"data semnatura"</th>
                  <th>Metodă</th>
                  <th>Status</th>
                  <th>"Acțiuni"</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const safeSignatures = Array.isArray(signatures) ? signatures : [];
                  if (safeSignatures.length > 0) {
                    return safeSignatures.map((signature) => (
                      <tr key={signature.id}>
                        <td>
                          <strong>#{signature.document_id}</strong>
                          {signature.document_number && (
                            <div className="text-muted small">{signature.document_number}</div>
                          )}
                        </td>
                        <td>{getDocumentTypeBadge(signature.document_type)}</td>
                        <td>{signature.signed_by}</td>
                        <td>{formatDate(signature.signature_time)}</td>
                        <td>
                          <Badge bg="secondary">{signature.signature_method}</Badge>
                        </td>
                        <td>
                          <Badge bg={signature.is_valid ? 'success' : 'danger'}>
                            {signature.is_valid ? 'Validă' : 'Invalidă'}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleViewDetails(signature)}
                            className="me-2"
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                          {!signature.is_valid && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleVerifySignature(signature.id)}
                            >
                              <i className="fas fa-check-circle"></i>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ));
                  } else {
                    return (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">"nu exista semnaturi digitale semnaturile vor apare"</td>
                      </tr>
                    );
                  }
                })()}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-info-circle me-2"></i>"detalii semnatura digitala"</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSignature && (
            <div>
              <Form.Group className="mb-3">
                <Form.Label><strong>"id semnatura"</strong></Form.Label>
                <Form.Control type="text" value={selectedSignature.id} readOnly />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label><strong>Tip Document</strong></Form.Label>
                <div>{getDocumentTypeBadge(selectedSignature.document_type)}</div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label><strong>"id document"</strong></Form.Label>
                <Form.Control type="text" value={selectedSignature.document_id} readOnly />
              </Form.Group>
              {selectedSignature.document_number && (
                <Form.Group className="mb-3">
                  <Form.Label><strong>"numar document"</strong></Form.Label>
                  <Form.Control type="text" value={selectedSignature.document_number} readOnly />
                </Form.Group>
              )}
              <Form.Group className="mb-3">
                <Form.Label><strong>"semnat de"</strong></Form.Label>
                <Form.Control type="text" value={selectedSignature.signed_by} readOnly />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label><strong>"data semnatura"</strong></Form.Label>
                <Form.Control type="text" value={formatDate(selectedSignature.signature_time)} readOnly />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label><strong>"metoda semnatura"</strong></Form.Label>
                <Form.Control type="text" value={selectedSignature.signature_method} readOnly />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label><strong>"hash semnatura"</strong></Form.Label>
                <Form.Control 
                  type="text" 
                  value={selectedSignature.signature_hash} 
                  readOnly 
                  className="font-monospace small"
                />
              </Form.Group>
              {selectedSignature.certificate_info && (
                <Form.Group className="mb-3">
                  <Form.Label><strong>"informatii certificat"</strong></Form.Label>
                  <Form.Control 
                    type="text" 
                    value={selectedSignature.certificate_info} 
                    readOnly 
                  />
                </Form.Group>
              )}
              <Form.Group className="mb-3">
                <Form.Label><strong>Status</strong></Form.Label>
                <div>
                  <Badge bg={selectedSignature.is_valid ? 'success' : 'danger'}>
                    {selectedSignature.is_valid ? 'Validă' : 'Invalidă'}
                  </Badge>
                </div>
              </Form.Group>
              {selectedSignature.verified_at && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label><strong>"verificat la"</strong></Form.Label>
                    <Form.Control type="text" value={formatDate(selectedSignature.verified_at)} readOnly />
                  </Form.Group>
                  {selectedSignature.verified_by && (
                    <Form.Group className="mb-3">
                      <Form.Label><strong>"verificat de"</strong></Form.Label>
                      <Form.Control type="text" value={selectedSignature.verified_by} readOnly />
                    </Form.Group>
                  )}
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>"ÃŽnchide"</Button>
          {selectedSignature && !selectedSignature.is_valid && (
            <Button variant="warning" onClick={() => {
              handleVerifySignature(selectedSignature.id);
              setShowDetailsModal(false);
            }}>
              <i className="fas fa-check-circle me-2"></i>"verifica semnatura"</Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};






