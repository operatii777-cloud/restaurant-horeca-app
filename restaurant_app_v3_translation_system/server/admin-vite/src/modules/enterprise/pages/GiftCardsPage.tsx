// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 🎁 GIFT CARDS PAGE - Gestionare carduri cadou
 */

import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import './GiftCardsPage.css';

interface GiftCard {
  id: number;
  code: string;
  initial_value: number;
  current_balance: number;
  recipient_name?: string;
  recipient_email?: string;
  purchaser_name?: string;
  purchaser_email?: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  expiry_date?: string;
  created_at: string;
}

export const GiftCardsPage = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    initial_value: '',
    recipient_name: '',
    recipient_email: '',
    purchaser_name: '',
    purchaser_email: '',
    message: '',
    expiry_days: '365'
  });

  const loadCards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gift-cards');
      const data = await res.json();
      if (data.success) {
        setCards(data.giftCards || []);
      }
    } catch (err: any) {
      console.error('Error loading gift cards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          initial_value: parseFloat(formData.initial_value),
          expiry_days: parseInt(formData.expiry_days)
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setFormData({
          initial_value: '',
          recipient_name: '',
          recipient_email: '',
          purchaser_name: '',
          purchaser_email: '',
          message: '',
          expiry_days: '365'
        });
        loadCards();
      }
    } catch (err: any) {
      console.error('Error creating gift card:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'used': return '#6b7280';
      case 'expired': return '#ef4444';
      case 'cancelled': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (loading && cards.length === 0) {
    return (
      <div className="gift-cards-page">
        <PageHeader title="🎁 Gift Cards" description="Se încarcă cardurile..." />
        <div className="loading">⏳ Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="gift-cards-page">
      <PageHeader 
        title="🎁 Gift Cards" 
        description="Gestionare carduri cadou"
      />

      <div className="gift-cards-header">
        <button
          className="btn-create"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Creează Card Cadou
        </button>
        <button onClick={loadCards} className="btn-refresh">
          🔄 Actualizează
        </button>
      </div>

      {/* Cards Grid */}
      <div className="gift-cards-grid">
        {cards.map((card) => (
          <div key={card.id} className="gift-card-item">
            <div className="card-header">
              <h3>{card.code}</h3>
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(card.status) }}
              >
                {card.status.toUpperCase()}
              </span>
            </div>
            <div className="card-body">
              <div className="card-stat">
                <span className="stat-label">"valoare initiala"</span>
                <span className="stat-value">{card.initial_value.toFixed(2)} RON</span>
              </div>
              <div className="card-stat">
                <span className="stat-label">"sold curent"</span>
                <span className="stat-value balance">{card.current_balance.toFixed(2)} RON</span>
              </div>
              {card.recipient_name && (
                <div className="card-stat">
                  <span className="stat-label">"Destinatar:"</span>
                  <span className="stat-value">{card.recipient_name}</span>
                </div>
              )}
              {card.expiry_date && (
                <div className="card-stat">
                  <span className="stat-label">"Expiră:"</span>
                  <span className="stat-value">
                    {new Date(card.expiry_date).toLocaleDateString('ro-RO')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>➕ Creează Card Cadou</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Valoare Inițială (RON):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.initial_value}
                  onChange={(e) => setFormData({ ...formData, initial_value: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>"nume destinatar"</label>
                <input
                  type="text"
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>"email destinatar"</label>
                <input
                  type="email"
                  value={formData.recipient_email}
                  onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>"nume cumparator"</label>
                <input
                  type="text"
                  value={formData.purchaser_name}
                  onChange={(e) => setFormData({ ...formData, purchaser_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>"zile valabilitate"</label>
                <input
                  type="number"
                  value={formData.expiry_days}
                  onChange={(e) => setFormData({ ...formData, expiry_days: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">"Creează"</button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >"Anulează"</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};




