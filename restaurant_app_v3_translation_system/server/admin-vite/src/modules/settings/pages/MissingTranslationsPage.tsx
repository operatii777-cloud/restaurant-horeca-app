// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { httpClient } from '@/shared/api/httpClient';
import './MissingTranslationsPage.css';

interface MissingTranslation {
  key: string;
  page?: string;
  status: 'reported' | 'in_progress' | 'completed';
  timestamp: string;
}

interface MissingTranslationsResponse {
  success: boolean;
  translations: MissingTranslation[];
}

export const MissingTranslationsPage: React.FC = () => {
//   const { t } = useTranslation();
  const [translations, setTranslations] = useState<MissingTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await httpClient.get<MissingTranslationsResponse>('/api/missing-translations');
      if (response.data.success) {
        setTranslations(response.data.translations);
      } else {
        setError('Eroare la încărcarea traducerilor');
      }
    } catch (err: any) {
      console.error('Error loading missing translations:', err);
      setError(err?.response?.data?.error || 'Eroare la încărcarea traducerilor');
    } finally {
      setLoading(false);
    }
  }, []);

  const markInProgress = async (key: string) => {
    try {
      setUpdating(key);
      await httpClient.put(`/api/missing-translations/${encodeURIComponent(key)}`, {
        status: 'in_progress',
      });
      await loadTranslations();
    } catch (err: any) {
      console.error('Error updating translation:', err);
      setError('Eroare la actualizarea traducerii');
    } finally {
      setUpdating(null);
    }
  };

  const markCompleted = async (key: string) => {
    try {
      setUpdating(key);
      await httpClient.delete(`/api/missing-translations/${encodeURIComponent(key)}`);
      await loadTranslations();
    } catch (err: any) {
      console.error('Error deleting translation:', err);
      setError('Eroare la ștergerea traducerii');
    } finally {
      setUpdating(null);
    }
  };

  const translationsByStatus = {
    reported: translations.filter((t) => t.status === 'reported'),
    in_progress: translations.filter((t) => t.status === 'in_progress'),
  };

  const getFileName = (page: string | undefined) => {
    if (!page) return 'N/A';
    return page.split('/').pop() || page;
  };

  if (loading) {
    return (
      <div className="missing-translations-page">
        <PageHeader title='Traduceri în așteptare' />
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Se încarcă traducerile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="missing-translations-page">
      <PageHeader
        title='Traduceri în așteptare'
        description="Gestionare traduceri în așteptare"
        actions={[
          {
            label: '[Reload] Reîncarcă',
            variant: 'secondary',
            onClick: loadTranslations,
          },
        ]}
      />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Alert variant="info" className="mt-4">
        <strong>[Info] Informații:</strong>
        <ul className="mb-0 mt-2">
          <li>Această secțiune afișează DOAR termenii care necesită traducere (Noi sau În Lucru).</li>
          <li>
            <strong>[Check] Când marchezi ca "Finalizat":</strong> Termenul dispare automat din listă</li>
          <li>
            <strong>[Warning] False-positives:</strong> Dacă un termen e deja tradus sau nu necesită traducere,
            apasă "[Check] E Deja Tradus" pentru a-l șterge din listă.
          </li>
        </ul>
      </Alert>

      {/* Reported (New) Translations */}
      {translationsByStatus.reported.length > 0 && (
        <Card className="mt-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              Noi
              <Badge bg="primary" className="ms-2">
                {translationsByStatus.reported.length}
              </Badge>
            </h5>
          </Card.Header>
          <Card.Body>
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Termen românesc</th>
                  <th>Fișier sursă</th>
                  <th>Data raportării</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {translationsByStatus.reported.map((translation) => (
                  <tr key={translation.key}>
                    <td><code>{translation.key}</code></td>
                    <td>{getFileName(translation.page)}</td>
                    <td>{new Date(translation.timestamp).toLocaleDateString()}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => markInProgress(translation.key)}
                        disabled={updating === translation.key}
                        className="me-2"
                      >
                        {updating === translation.key ? 'Se actualizează...' : 'Se lucrează'}
                      </Button>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => markCompleted(translation.key)}
                        disabled={updating === translation.key}
                      >
                        {updating === translation.key ? 'Se finalizează...' : 'E Deja Tradus'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* In Progress Translations */}
      {translationsByStatus.in_progress.length > 0 && (
        <Card className="mt-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              În Lucru
              <Badge bg="warning" className="ms-2">
                {translationsByStatus.in_progress.length}
              </Badge>
            </h5>
          </Card.Header>
          <Card.Body>
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Termen românesc</th>
                  <th>Fișier sursă</th>
                  <th>Data raportării</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {translationsByStatus.in_progress.map((translation) => (
                  <tr key={translation.key}>
                    <td><code>{translation.key}</code></td>
                    <td>{getFileName(translation.page)}</td>
                    <td>{new Date(translation.timestamp).toLocaleDateString()}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => markCompleted(translation.key)}
                        disabled={updating === translation.key}
                      >
                        {updating === translation.key ? 'Se finalizează...' : 'Finalizează'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Empty State */}
      {translationsByStatus.reported.length === 0 && translationsByStatus.in_progress.length === 0 && (
        <Alert variant="success" className="mt-4">
          Nu există traduceri în așteptare. Felicitări!
        </Alert>
      )}
    </div>
  );
};




