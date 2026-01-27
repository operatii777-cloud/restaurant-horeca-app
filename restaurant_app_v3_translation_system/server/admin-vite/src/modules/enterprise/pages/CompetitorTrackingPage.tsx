// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 🔍 COMPETITOR PRICE TRACKING PAGE
 */

import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import './CompetitorTrackingPage.css';

interface Competitor {
  id: number;
  name: string;
  location: string;
  website: string;
  category: string;
  products_tracked: number;
  avg_price: number;
}

interface CompetitorPrice {
  id: number;
  competitor_id: number;
  product_name: string;
  price: number;
  our_product_name: string;
  our_price: number;
  price_diff_percent: number;
  category: string;
}

interface ComparisonStats {
  total_products_tracked: number;
  we_are_cheaper: number;
  we_are_same: number;
  we_are_more_expensive: number;
  avg_price_diff: string;
}

interface Insight {
  type: string;
  icon: string;
  message: string;
}

export const CompetitorTrackingPage = () => {
//   const { t } = useTranslation();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState<number | null>(null);
  const [prices, setPrices] = useState<CompetitorPrice[]>([]);
  const [comparison, setComparison] = useState<{
    stats: ComparisonStats;
    insights: Insight[];
    comparison: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddPriceModal, setShowAddPriceModal] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({ name: '', location: '', website: '', category: 'Restaurant' });
  const [newPrice, setNewPrice] = useState({ product_name: '', price: '', category: '' });

  const loadCompetitors = async () => {
    try {
      const res = await fetch('/api/competitors');
      const data = await res.json();
      if (data.success) {
        setCompetitors(data.competitors);
      }
    } catch (err) {
      console.error('Error loading competitors:', err);
    }
  };

  const loadComparison = async () => {
    try {
      const res = await fetch('/api/competitors/comparison');
      const data = await res.json();
      if (data.success) {
        setComparison(data);
      }
    } catch (err) {
      console.error('Error loading comparison:', err);
    }
  };

  const loadPrices = async (competitorId: number) => {
    try {
      const res = await fetch(`/api/competitors/${competitorId}/prices`);
      const data = await res.json();
      if (data.success) {
        setPrices(data.prices);
      }
    } catch (err) {
      console.error('Error loading prices:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadCompetitors();
      await loadComparison();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedCompetitor) {
      loadPrices(selectedCompetitor);
    }
  }, [selectedCompetitor]);

  const handleAddCompetitor = async () => {
    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompetitor),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewCompetitor({ name: '', location: '', website: '', category: 'Restaurant' });
        loadCompetitors();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddPrice = async () => {
    if (!selectedCompetitor) return;
    try {
      const res = await fetch(`/api/competitors/${selectedCompetitor}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPrice,
          price: parseFloat(newPrice.price),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddPriceModal(false);
        setNewPrice({ product_name: '', price: '', category: '' });
        loadPrices(selectedCompetitor);
        loadComparison();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getPriceDiffClass = (diff: number) => {
    if (diff > 10) return 'more-expensive';
    if (diff < -10) return 'cheaper';
    return 'same';
  };

  if (loading) {
    return (
      <div className="competitor-tracking-page">
        <PageHeader title='🔍 competitor tracking' description='Se încarcă...' />
        <div className="loading">⏳ Se încarcă datele...</div>
      </div>
    );
  }

  return (
    <div className="competitor-tracking-page" data-page-ready="true">
      <PageHeader
        title='🔍 competitor price tracking'
        description="Monitorizare prețuri competitori și analiză poziționare piață"
        actions={[
          { label: '➕ Adaugă Competitor', variant: 'primary', onClick: () => setShowAddModal(true) },
          { label: '🔄 Refresh', variant: 'secondary', onClick: () => { loadCompetitors(); loadComparison(); } },
        ]}
      />

      {/* Stats Overview */}
      {comparison?.stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{comparison.stats.total_products_tracked}</div>
            <div className="stat-label">Produse Monitorizate</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">{comparison.stats.we_are_cheaper}</div>
            <div className="stat-label">"noi mai ieftini"</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-value">{comparison.stats.we_are_more_expensive}</div>
            <div className="stat-label">"noi mai scumpi"</div>
          </div>
          <div className="stat-card info">
            <div className="stat-value">{comparison.stats.avg_price_diff}%</div>
            <div className="stat-label">"diferenta medie"</div>
          </div>
        </div>
      )}

      {/* Insights */}
      {comparison?.insights && comparison.insights.length > 0 && (
        <div className="insights-section">
          {comparison.insights.map((insight, i) => (
            <div key={i} className={`insight-card ${insight.type}`}>
              <span className="insight-icon">{insight.icon}</span>
              <span className="insight-message">{insight.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="main-content">
        {/* Competitors List */}
        <div className="competitors-panel">
          <h2>🏪 Competitori</h2>
          {competitors.length === 0 ? (
            <div className="no-data">"nu aveti competitori adaugati"<button onClick={() => setShowAddModal(true)}>➕ Adaugă primul competitor</button>
            </div>
          ) : (
            <div className="competitors-list">
              {competitors.map((comp) => (
                <div
                  key={comp.id}
                  className={`competitor-item ${selectedCompetitor === comp.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCompetitor(comp.id)}
                >
                  <div className="comp-name">{comp.name}</div>
                  <div className="comp-details">
                    <span className="comp-location">📍 {comp.location || 'N/A'}</span>
                    <span className="comp-products">{comp.products_tracked} produse</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prices Panel */}
        <div className="prices-panel">
          {selectedCompetitor ? (
            <>
              <div className="prices-header">
                <h2>💰 Prețuri {competitors.find(c => c.id === selectedCompetitor)?.name}</h2>
                <button className="btn-add-price" onClick={() => setShowAddPriceModal(true)}>
                  ➕ Adaugă Preț
                </button>
              </div>
              {prices.length === 0 ? (
                <div className="no-data">"nu sunt preturi inregistrate pentru acest competit"</div>
              ) : (
                <table className="prices-table">
                  <thead>
                    <tr>
                      <th>"produs competitor"</th>
                      <th>"pret competitor"</th>
                      <th>Produsul Nostru</th>
                      <th>"pretul nostru"</th>
                      <th>Diferență</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((price) => (
                      <tr key={price.id}>
                        <td><strong>{price.product_name}</strong></td>
                        <td className="price-cell">{price.price} RON</td>
                        <td>{price.our_product_name || '—'}</td>
                        <td className="price-cell">{price.our_price ? `${price.our_price} RON` : '—'}</td>
                        <td>
                          {price.price_diff_percent != null ? (
                            <span className={`diff-badge ${getPriceDiffClass(price.price_diff_percent)}`}>
                              {price.price_diff_percent > 0 ? '+' : ''}{price.price_diff_percent}%
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <div className="no-selection">
              👈 Selectați un competitor pentru a vedea prețurile
            </div>
          )}
        </div>
      </div>

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>➕ Adaugă Competitor</h3>
            <div className="form-group">
              <label>Nume *</label>
              <input
                type="text"
                value={newCompetitor.name}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                placeholder="restaurant xyz"
              />
            </div>
            <div className="form-group">
              <label>Locație</label>
              <input
                type="text"
                value={newCompetitor.location}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, location: e.target.value })}
                placeholder={t('$([bucuresti_sector_1] -replace "\[|\]")')}
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="text"
                value={newCompetitor.website}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="form-group">
              <label>Categorie</label>
              <select
                value={newCompetitor.category}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, category: e.target.value })}
              >
                <option value="Restaurant">"Restaurant"</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Pizzerie">Pizzerie</option>
                <option value="Cafenea">Cafenea</option>
                <option value="Bar">Bar</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>"Anulează"</button>
              <button className="btn-save" onClick={handleAddCompetitor}>Salvează</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Price Modal */}
      {showAddPriceModal && (
        <div className="modal-overlay" onClick={() => setShowAddPriceModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>➕ Adaugă Preț Competitor</h3>
            <div className="form-group">
              <label>Nume Produs *</label>
              <input
                type="text"
                value={newPrice.product_name}
                onChange={(e) => setNewPrice({ ...newPrice, product_name: e.target.value })}
                placeholder="Pizza Margherita"
              />
            </div>
            <div className="form-group">
              <label>Preț (RON) *</label>
              <input
                type="number"
                step="0.01"
                value={newPrice.price}
                onChange={(e) => setNewPrice({ ...newPrice, price: e.target.value })}
                placeholder="35.00"
              />
            </div>
            <div className="form-group">
              <label>Categorie</label>
              <input
                type="text"
                value={newPrice.category}
                onChange={(e) => setNewPrice({ ...newPrice, category: e.target.value })}
                placeholder="Pizza"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAddPriceModal(false)}>"Anulează"</button>
              <button className="btn-save" onClick={handleAddPrice}>Salvează</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorTrackingPage;





