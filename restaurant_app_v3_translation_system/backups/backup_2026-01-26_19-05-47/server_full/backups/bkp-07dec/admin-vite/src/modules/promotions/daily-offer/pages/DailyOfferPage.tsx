import React, { useState, useEffect } from 'react';

interface DailyOffer {
  id?: number;
  title: string;
  description: string;
  title_en?: string;
  description_en?: string;
  is_active: boolean;
  conditions: Array<{ category: string; quantity: number }>;
  benefit_type: 'category' | 'specific';
  benefit_category?: string;
  benefit_quantity?: number;
  benefit_products?: number[];
}

export const DailyOfferPage: React.FC = () => {
  const [offer, setOffer] = useState<DailyOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Array<{ id: number; name: string; price: number }>>([]);

  useEffect(() => {
    loadOffer();
    loadProducts();
  }, []);

  const loadOffer = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/daily-offer');
      if (response.ok) {
        const data = await response.json();
        setOffer(data.offer || null);
      }
    } catch (error) {
      console.error('Error loading offer:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/menu/all');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleSave = async () => {
    if (!offer) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/daily-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offer)
      });

      if (response.ok) {
        alert('Oferta a fost salvată cu succes!');
        loadOffer();
      } else {
        alert('Eroare la salvarea ofertei');
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Eroare la salvarea ofertei');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Se încarcă...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h1><i className="fas fa-star me-2"></i>Oferta Zilei</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <i className="fas fa-save me-1"></i>Salvează
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Titlu (RO):</label>
            <input
              type="text"
              className="form-control"
              value={offer?.title || ''}
              onChange={(e) => setOffer({ ...offer!, title: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Descriere (RO):</label>
            <textarea
              className="form-control"
              value={offer?.description || ''}
              onChange={(e) => setOffer({ ...offer!, description: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Titlu (EN):</label>
            <input
              type="text"
              className="form-control"
              value={offer?.title_en || ''}
              onChange={(e) => setOffer({ ...offer!, title_en: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Descriere (EN):</label>
            <textarea
              className="form-control"
              value={offer?.description_en || ''}
              onChange={(e) => setOffer({ ...offer!, description_en: e.target.value })}
            />
          </div>
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={offer?.is_active || false}
              onChange={(e) => setOffer({ ...offer!, is_active: e.target.checked })}
            />
            <label className="form-check-label">Ofertă Activă</label>
          </div>
        </div>
      </div>

      <div className="alert alert-info mt-3">
        <i className="fas fa-info-circle me-2"></i>
        Funcționalitatea completă pentru condiții și beneficii va fi disponibilă în curând.
      </div>
    </div>
  );
};

