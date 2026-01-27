// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { httpClient } from '@/shared/api/httpClient';
import './ProductDisplayPage.css';

interface ProductDisplaySetting {
  autoManageDisplay: boolean;
  description?: string;
}

export const ProductDisplayPage: React.FC = () => {
//   const { t } = useTranslation();
  const [setting, setSetting] = useState<ProductDisplaySetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSetting();
  }, []);

  const loadSetting = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await httpClient.get<ProductDisplaySetting>('/api/admin/product-display-setting');
      setSetting(response.data);
    } catch (err: any) {
      console.error('Error loading product display setting:', err);
      setError(err?.response?.data?.error || 'Eroare la încărcarea setării');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!setting) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await httpClient.put<{ success: boolean; message: string }>(
        '/api/admin/product-display-setting',
        { autoManageDisplay: setting.autoManageDisplay }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        await loadSetting();
      } else {
        setError('Eroare la actualizarea setării');
      }
    } catch (err: any) {
      console.error('Error updating product display setting:', err);
      setError(err?.response?.data?.error || 'Eroare la actualizarea setării');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="product-display-page">
        <PageHeader title='🛍️ gestionare afisare produse' />
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">"se incarca setarile"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-display-page">
      <PageHeader
        title='🛍️ gestionare afisare produse'
        description="Control afișare produse în meniul clientului"
        actions={[
          {
            label: '🔄 Actualizează',
            variant: 'secondary',
            onClick: loadSetting,
          },
        ]}
      />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">"control afisare produse in meniul clientului"</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>"mod de afisare produse"</Form.Label>
              <Form.Select
                value={setting?.autoManageDisplay ? 'true' : 'false'}
                onChange={(e) =>
                  setSetting({
                    ...setting!,
                    autoManageDisplay: e.target.value === 'true',
                  })
                }
                disabled={saving}
              >
                <option value="false">Toate produsele afișate (recomandat)</option>
                <option value="true">Doar produsele cu stoc &gt; 0</option>
              </Form.Select>
              <Form.Text className="text-muted">
                {setting?.autoManageDisplay
                  ? 'Produsele fără stoc vor fi ascunse automat din meniul clientului'
                  : 'Toate produsele vor fi afișate în meniul clientului, indiferent de stoc'}
              </Form.Text>
            </Form.Group>

            {setting?.description && (
              <Alert
                variant={setting.autoManageDisplay ? 'warning' : 'success'}
                className="mt-3"
              >
                {setting.description}
              </Alert>
            )}

            <div className="d-flex gap-2 mt-4">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving || !setting}
              >
                {saving ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                    />"se salveaza"</>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>"salveaza setarea"</>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};




