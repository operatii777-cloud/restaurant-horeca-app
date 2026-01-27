/**
 * PHASE S5.2 - Tipizate PDF Preview Modal
 * Modal component for previewing and downloading PDF documents
 */

import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { tipizateApi } from '../api/tipizateApi';
import { TipizatType } from '../api/types';

interface TipizatePdfPreviewModalProps {
  docType: TipizatType;
  docId: number | null;
  show: boolean;
  onHide: () => void;
  documentNumber?: string;
  pdfUrl?: string | null; // Optional: if provided, use this URL instead of fetching
}

export const TipizatePdfPreviewModal: React.FC<TipizatePdfPreviewModalProps> = ({
  docType,
  docId,
  show,
  onHide,
  documentNumber,
  pdfUrl: externalPdfUrl,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && docId) {
      if (externalPdfUrl) {
        // Use provided URL
        setPdfUrl(externalPdfUrl);
        setLoading(false);
        setError(null);
      } else {
        // Fetch PDF
        loadPdf();
      }
    } else {
      setPdfUrl(null);
      setError(null);
    }
  }, [show, docId, docType, externalPdfUrl]);

  const loadPdf = async () => {
    if (!docId) return;

    setLoading(true);
    setError(null);

    try {
      const blob = await tipizateApi.pdf(docId, docType);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: any) {
      setError(err.message || 'Eroare la încărcarea PDF-ului');
      console.error('PDF load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl || !docId) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${docType}-${docId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!pdfUrl) return;

    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleClose = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Preview PDF - {docType}
          {documentNumber && ` (${documentNumber})`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ minHeight: '500px', padding: 0 }}>
        {loading && (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '500px' }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Se încarcă PDF-ul...</span>
            </Spinner>
          </div>
        )}

        {error && (
          <div className="alert alert-danger m-3">
            <strong>Eroare:</strong> {error}
            <Button variant="outline-danger" size="sm" className="ms-2" onClick={loadPdf}>
              Reîncearcă
            </Button>
          </div>
        )}

        {pdfUrl && !loading && !error && (
          <iframe
            src={pdfUrl}
            style={{
              width: '100%',
              height: '600px',
              border: 'none',
            }}
            title="PDF Preview"
          />
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Închide
        </Button>
        {pdfUrl && (
          <>
            <Button variant="outline-primary" onClick={handleDownload}>
              <i className="bi bi-download me-1"></i>
              Descarcă
            </Button>
            <Button variant="outline-primary" onClick={handlePrint}>
              <i className="bi bi-printer me-1"></i>
              Tipărește
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

