// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { PageHeader } from '@/shared/components/PageHeader';
import './PaymentMethodsPage.css';

interface PaymentMethod {
  id?: number;
  name: string;
  code: string;
  display_name: string;
  display_name_en?: string;
  icon?: string;
  is_active: boolean;
  fee_percentage: number;
  fee_fixed: number;
  requires_change: boolean;
  requires_receipt: boolean;
  sort_order: number;
  location_id?: number;
}

export const PaymentMethodsPage: React.FC = () => {
//   const { t } = useTranslation();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data, refetch } = useApiQuery<PaymentMethod[]>('/api/settings/payment-methods');
  const createMutation = useApiMutation();
  const updateMutation = useApiMutation();
  const deleteMutation = useApiMutation();

  useEffect(() => {
    if (data) {
      setMethods(data);
      setLoading(false);
    }
  }, [data]);

  const handleSave = async (method: PaymentMethod) => {
    try {
      if (editingMethod?.id) {
        await updateMutation.mutate({ 
          url: `/api/settings/payment-methods/${editingMethod.id}`, 
          method: 'PUT',
          data: method 
        });
        setAlert({ type: 'success', message: 'Metodă de plată actualizată cu succes!' });
      } else {
        await createMutation.mutate({ 
          url: '/api/settings/payment-methods', 
          method: 'POST',
          data: method 
        });
        setAlert({ type: 'success', message: 'Metodă de plată creată cu succes!' });
      }
      setShowModal(false);
      setEditingMethod(null);
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la salvare' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sigur doriți să ștergeți această metodă de plată?')) return;
    
    try {
      await deleteMutation.mutate({ 
        url: `/api/settings/payment-methods/"Id"`, 
        method: 'DELETE' 
      });
      setAlert({ type: 'success', message: 'Metodă de plată ștearsă cu succes!' });
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la ștergere' });
    }
  };

  const handleToggleActive = async (method: PaymentMethod) => {
    try {
      await updateMutation.mutate({ 
        url: `/api/settings/payment-methods/${method.id}`, 
        method: 'PUT',
        data: { ...method, is_active: !method.is_active } 
      });
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la actualizare' });
    }
  };

  if (loading) {
    return <div className="payment-methods-page">Se încarcă...</div>;
  }

  return (
    <div className="payment-methods-page">
      <PageHeader
        title="metode de plata"
        description="Gestionare metode de plată acceptate în restaurant"
      />

      {alert && (
        <InlineAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="payment-methods-page__actions">
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingMethod(null);
            setShowModal(true);
          }}
        >
          ➕ Adaugă Metodă de Plată
        </button>
      </div>

      <div className="payment-methods-page__table">
        <table className="table">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Nume</th>
              <th>Cod</th>
              <th>Comision %</th>
              <th>Comision Fix</th>
              <th>Status</th>
              <th>"Acțiuni"</th>
            </tr>
          </thead>
          <tbody>
            {methods.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">"nu exista metode de plata configurate"</td>
              </tr>
            ) : (
              methods.map((method) => (
                <tr key={method.id}>
                  <td>{method.icon || '💳'}</td>
                  <td>{method.display_name}</td>
                  <td><code>{method.code}</code></td>
                  <td>{method.fee_percentage}%</td>
                  <td>{method.fee_fixed.toFixed(2)} RON</td>
                  <td>
                    <span className={`badge ${method.is_active ? 'badge-success' : 'badge-secondary'}`}>
                      {method.is_active ? 'Activ' : 'Inactiv'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setEditingMethod(method);
                        setShowModal(true);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleToggleActive(method)}
                    >
                      {method.is_active ? '⏸️ Dezactivează' : '▶️ Activează'}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => method.id && handleDelete(method.id)}
                    >
                      🗑️ Șterge
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <PaymentMethodModal
          method={editingMethod}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingMethod(null);
          }}
        />
      )}
    </div>
  );
};

interface PaymentMethodModalProps {
  method: PaymentMethod | null;
  onSave: (method: PaymentMethod) => void;
  onClose: () => void;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ method, onSave, onClose }) => {
  const [formData, setFormData] = useState<PaymentMethod>({
    name: method?.name || '',
    code: method?.code || '',
    display_name: method?.display_name || '',
    display_name_en: method?.display_name_en || '',
    icon: method?.icon || '💳',
    is_active: method?.is_active ?? true,
    fee_percentage: method?.fee_percentage || 0,
    fee_fixed: method?.fee_fixed || 0,
    requires_change: method?.requires_change || false,
    requires_receipt: method?.requires_receipt ?? true,
    sort_order: method?.sort_order || 0,
    location_id: method?.location_id,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{method ? 'Editare Metodă de Plată' : 'Adaugă Metodă de Plată'}</h3>
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
            <label>Cod *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              placeholder="cash, card, voucher"
            />
          </div>
          <div className="form-group">
            <label>Nume Afișare *</label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Icon</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="💳"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Comision %</label>
              <input
                type="number"
                step="0.01"
                value={formData.fee_percentage}
                onChange={(e) => setFormData({ ...formData, fee_percentage: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label>Comision Fix (RON)</label>
              <input
                type="number"
                step="0.01"
                value={formData.fee_fixed}
                onChange={(e) => setFormData({ ...formData, fee_fixed: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.requires_change}
                onChange={(e) => setFormData({ ...formData, requires_change: e.target.checked })}
              />
              Necesită rest (cash)
            </label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.requires_receipt}
                onChange={(e) => setFormData({ ...formData, requires_receipt: e.target.checked })}
              />"necesita bon fiscal"</label>
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




