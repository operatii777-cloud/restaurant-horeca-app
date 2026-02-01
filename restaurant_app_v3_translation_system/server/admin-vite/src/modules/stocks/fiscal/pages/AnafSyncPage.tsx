// ﻿import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './AnafSyncPage.css';

interface AnafSyncStatus {
  status: 'synced' | 'pending' | 'error' | 'unknown';
  sent_reports: number;
  pending_reports: number;
  last_sync: string | null;
  next_sync: string | null;
  message?: string;
}

export const AnafSyncPage = () => {
  //   const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [retransmitting, setRetransmitting] = useState(false);
  const [status, setStatus] = useState<AnafSyncStatus | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  useEffect(() => {
    checkAnafSyncStatus();
  }, []);

  const checkAnafSyncStatus = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/fiscal/anaf-sync-status');

      if (response.data) {
        setStatus({
          status: response.data.status || 'unknown',
          sent_reports: response.data.sent_reports || 0,
          pending_reports: response.data.pending_reports || 0,
          last_sync: response.data.last_sync || null,
          next_sync: response.data.next_sync || null,
          message: response.data.message,
        });
      }
    } catch (error) {
      console.error('❌ Eroare la verificarea stării ANAF:', error);
      // Fallback status
      setStatus({
        status: 'unknown',
        sent_reports: 0,
        pending_reports: 0,
        last_sync: null,
        next_sync: null,
        message: 'Nu s-a putut verifica starea',
      });
    } finally {
      setLoading(false);
    }
  };

  const retransmitMonthlyReport = async () => {
    if (!confirm('Ești sigur că vrei să retransmiți raportul lunar?')) {
      return;
    }

    setRetransmitting(true);
    setFeedback(null);

    try {
      const response = await httpClient.post('/api/fiscal/retransmit-monthly');

      if (response.data?.success) {
        setFeedback({
          type: 'success',
          message: 'Raportul lunar a fost retransmis cu succes!',
        });
        checkAnafSyncStatus(); // Actualizează starea
      } else {
        setFeedback({
          type: 'error',
          message: response.data?.error || 'Eroare la retransmiterea raportului.',
        });
      }
    } catch (error: any) {
      console.error('❌ Eroare la retransmiterea raportului:', error);
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || 'Eroare la retransmiterea raportului.',
      });
    } finally {
      setRetransmitting(false);
    }
  };

  const syncAllReports = async () => {
    if (!confirm('Ești sigur că vrei să sincronizezi toate rapoartele cu ANAF?')) {
      return;
    }

    setSyncing(true);
    setFeedback(null);

    try {
      const response = await httpClient.post('/api/fiscal/sync-all');

      if (response.data?.success) {
        setFeedback({
          type: 'success',
          message: 'Toate rapoartele au fost sincronizate cu succes!',
        });
        checkAnafSyncStatus(); // Actualizează starea
      } else {
        setFeedback({
          type: 'error',
          message: response.data?.error || 'Eroare la sincronizarea rapoartelor.',
        });
      }
    } catch (error: any) {
      console.error('❌ Eroare la sincronizarea rapoartelor:', error);
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || 'Eroare la sincronizarea rapoartelor.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusAlert = () => {
    if (!status) {
      return (
        <Alert variant="info">
          <i className="fas fa-info-circle me-2"></i>Se încarcă starea transmiterii...</Alert>
      );
    }

    let variant: 'success' | 'warning' | 'danger' | 'info' = 'info';
    let icon = 'fas fa-info-circle';
    let text = 'Stare necunoscută';

    if (status.status === 'synced') {
      variant = 'success';
      icon = 'fas fa-check-circle';
      text = 'Toate rapoartele sunt transmise';
    } else if (status.status === 'pending') {
      variant = 'warning';
      icon = 'fas fa-clock';
      text = 'Există rapoarte în așteptare';
    } else if (status.status === 'error') {
      variant = 'danger';
      icon = 'fas fa-exclamation-triangle';
      text = 'Eroare la transmitere';
    }

    return (
      <Alert variant={variant}>
        <i className={`${icon} me-2`}></i>
        <strong>Stare Transmitere:</strong> {text}
        {status.message && (
          <>
            <br />
            <small>{status.message}</small>
          </>
        )}
      </Alert>
    );
  };

  return (
    <div className="anaf-sync-page">
      <Card className="shadow-sm">
        <Card.Header className="bg-warning text-dark">
          <i className="fas fa-sync-alt me-1"></i> Sincronizare / Transmitere ANAF
        </Card.Header>
        <Card.Body>
          {feedback && (
            <Alert
              variant={feedback.type === 'success' ? 'success' : feedback.type === 'warning' ? 'warning' : 'danger'}
              dismissible
              onClose={() => setFeedback(null)}
            >
              {feedback.message}
            </Alert>
          )}

          <div className="row">
            <div className="col-md-6">
              <h6>Vizualizare stare transmitere rapoarte</h6>
              <div className="mb-3">
                {loading ? (
                  <Alert variant="info">
                    <i className="fas fa-spinner fa-spin me-2"></i>Se încarcă starea transmiterii...</Alert>
                ) : (
                  getStatusAlert()
                )}

                {status && (
                  <>
                    <div className="row mt-3">
                      <div className="col-6">
                        <strong>Rapoarte Transmise:</strong> {status.sent_reports}
                      </div>
                      <div className="col-6">
                        <strong>Rapoarte în așteptare:</strong> {status.pending_reports}
                      </div>
                    </div>
                    <div className="row mt-2">
                      <div className="col-6">
                        <strong>Ultima Sincronizare:</strong> {status.last_sync || 'Niciodată'}
                      </div>
                      <div className="col-6">
                        <strong>Următoarea sincronizare:</strong> {status.next_sync || 'Nu este programată'}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <Button variant="warning" onClick={checkAnafSyncStatus} disabled={loading}>
                <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync'} me-1`}></i>
                {loading ? 'Se verifică...' : 'Verifică Stare Transmitere'}
              </Button>
            </div>

            <div className="col-md-6">
              <h6>Acțiuni disponibile</h6>
              <div className="d-grid gap-2">
                <Button variant="danger" onClick={retransmitMonthlyReport} disabled={retransmitting}>
                  <i className={`fas ${retransmitting ? 'fa-spinner fa-spin' : 'fa-redo'} me-1`}></i>
                  {retransmitting ? 'Se retransmite...' : 'Retransmite raport lunar'}
                </Button>
                <Button variant="info" onClick={syncAllReports} disabled={syncing}>
                  <i className={`fas ${syncing ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'} me-1`}></i>
                  {syncing ? 'Se sincronizează...' : 'Sincronizează toate rapoartele'}
                </Button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};






