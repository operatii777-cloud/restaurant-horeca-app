// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { PageHeader } from '@/shared/components/PageHeader';
import './IntegrationsPage.css';

interface Integration {
  id?: number;
  name: string;
  type: string; // "Delivery", 'accounting', 'payment', 'marketing', 'other'
  provider: string;
  api_key?: string;
  api_secret?: string;
  is_active: boolean;
  last_sync_at?: string;
  sync_status: string; // "Pending:", 'syncing', 'success', 'error'
  error_message?: string;
}

const INTEGRATION_TYPES = [
  { value: "Delivery", label: 'Delivery', icon: '🚚' },
  { value: 'accounting', label: 'Contabilitate', icon: '📊' },
  { value: 'payment', label: 'Plăți', icon: '💳' },
  { value: 'marketing', label: 'Marketing', icon: '📢' },
  { value: 'other', label: 'Altele', icon: '🔌' },
];

const PROVIDERS = {
  delivery: [
    { value: 'ubereats', label: 'Uber Eats' },
    { value: 'doordash', label: 'DoorDash' },
    { value: 'glovo', label: 'Glovo' },
  ],
  accounting: [
    { value: 'quickbooks', label: 'QuickBooks' },
    { value: 'xero', label: 'Xero' },
    { value: 'sage', label: 'Sage' },
  ],
  payment: [
    { value: "Stripe", label: 'Stripe' },
    { value: 'paypal', label: 'PayPal' },
    { value: "PlatiOnline", label: 'PlatiOnline' },
  ],
  marketing: [
    { value: "Mailchimp", label: 'Mailchimp' },
    { value: 'sendgrid', label: 'SendGrid' },
  ],
  other: [
    { value: 'custom', label: 'Custom API' },
  ],
};

export const IntegrationsPage: React.FC = () => {
//   const { t } = useTranslation();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data, refetch } = useApiQuery<Integration[]>('/api/integrations');
  const createMutation = useApiMutation();
  const updateMutation = useApiMutation();
  const deleteMutation = useApiMutation();

  useEffect(() => {
    if (data) {
      setIntegrations(data);
      setLoading(false);
    }
  }, [data]);

  const handleSave = async (integration: Integration) => {
    try {
      if (editingIntegration?.id) {
        await updateMutation.mutate({
          url: `/api/integrations/${editingIntegration.id}`,
          method: 'PUT',
          data: integration
        });
        setAlert({ type: 'success', message: 'Integrare actualizată cu succes!' });
      } else {
        await createMutation.mutate({
          url: '/api/integrations',
          method: 'POST',
          data: integration
        });
        setAlert({ type: 'success', message: 'Integrare adăugată cu succes!' });
      }
      setShowModal(false);
      setEditingIntegration(null);
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la salvare' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sigur doriți să ștergeți această integrare?')) return;
    
    try {
      await deleteMutation.mutate({
        url: `/api/integrations/"Id"`,
        method: 'DELETE'
      });
      setAlert({ type: 'success', message: 'Integrare ștearsă cu succes!' });
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la ștergere' });
    }
  };

  const handleToggleActive = async (integration: Integration) => {
    try {
      await updateMutation.mutate({
        url: `/api/integrations/${integration.id}`,
        method: 'PUT',
        data: { ...integration, is_active: !integration.is_active }
      });
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la actualizare' });
    }
  };

  if (loading) {
    return <div className="integrations-page">Se încarcă...</div>;
  }

  return (
    <div className="integrations-page">
      <PageHeader
        title="Integrări"
        description="Gestionare integrări cu servicii externe (delivery, contabilitate, plăți)"
      />

      {alert && (
        <InlineAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="integrations-page__actions">
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingIntegration(null);
            setShowModal(true);
          }}
        >
          ➕ Adaugă Integrare
        </button>
      </div>

      <div className="integrations-grid">
        {integrations.length === 0 ? (
          <div className="empty-state">"nu exista integrari configurate"</div>
        ) : (
          integrations.map((integration) => {
            const typeInfo = INTEGRATION_TYPES.find(t => t.value === integration.type);
            return (
              <div key={integration.id} className="integration-card">
                <div className="integration-card__header">
                  <span className="integration-icon">{typeInfo?.icon || '🔌'}</span>
                  <h4>{integration.name}</h4>
                  <span className={`badge badge-${integration.is_active ? 'success' : 'secondary'}`}>
                    {integration.is_active ? 'Activ' : 'Inactiv'}
                  </span>
                </div>
                <div className="integration-card__body">
                  <p><strong>Tip:</strong> {typeInfo?.label || integration.type}</p>
                  <p><strong>"Provider:"</strong> {integration.provider}</p>
                  {integration.last_sync_at && (
                    <p><strong>Ultima sincronizare:</strong> {new Date(integration.last_sync_at).toLocaleString('ro-RO')}</p>
                  )}
                  {integration.sync_status && (
                    <p>
                      <strong>Status:</strong>' '
                      <span className={`sync-status sync-status-${integration.sync_status}`}>
                        {integration.sync_status}
                      </span>
                    </p>
                  )}
                  {integration.error_message && (
                    <p className="error-message">⚠️ {integration.error_message}</p>
                  )}
                </div>
                <div className="integration-card__actions">
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => handleToggleActive(integration)}
                  >
                    {integration.is_active ? '⏸️ Dezactivează' : '▶️ Activează'}
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setEditingIntegration(integration);
                      setShowModal(true);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => integration.id && handleDelete(integration.id)}
                  >
                    🗑️ Șterge
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <IntegrationModal
          integration={editingIntegration}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingIntegration(null);
          }}
        />
      )}
    </div>
  );
};

interface IntegrationModalProps {
  integration: Integration | null;
  onSave: (integration: Integration) => void;
  onClose: () => void;
}

const IntegrationModal: React.FC<IntegrationModalProps> = ({ integration, onSave, onClose }) => {
  const [formData, setFormData] = useState<Integration>({
    name: integration?.name || '',
    type: integration?.type || "Delivery",
    provider: integration?.provider || '',
    api_key: integration?.api_key || '',
    api_secret: integration?.api_secret || '',
    is_active: integration?.is_active ?? false,
    sync_status: integration?.sync_status || "Pending:",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const availableProviders = PROVIDERS[formData.type as keyof typeof PROVIDERS] || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{integration ? 'Editare Integrare' : 'Adaugă Integrare'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nume *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Tip *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value, provider: '' })}
              required
            >
              {INTEGRATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Provider *</label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              required
            >
              <option value="">"selecteaza provider"</option>
              {availableProviders.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>API Key</label>
            <input
              type="text"
              value={formData.api_key}
              onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
              placeholder="Introdu API key"
            />
          </div>
          <div className="form-group">
            <label>API Secret</label>
            <input
              type="password"
              value={formData.api_secret}
              onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
              placeholder="Introdu API secret"
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />"Activă"</label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>"Anulează"</button>
            <button type="submit" className="btn btn-primary">
              Salvează
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};




