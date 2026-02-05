// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 📊 MENU ENGINEERING PAGE - Analiză profitabilitate produse
 */

import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import './MenuEngineeringPage.css';

interface Product {
  product_id: number;
  product_name: string;
  category: string;
  selling_price: number;
  quantity_sold: number;
  revenue: number;
  food_cost: number;
  contribution_margin: number;
  cm_per_unit: number;
  cm_percentage: number;
  classification: 'star' | 'puzzle' | 'plowhorse' | 'dog';
  recommendation: string;
  popularity_index: number;
  profitability_index: number;
}

interface Summary {
  period: { start: string; end: string };
  total_products: number;
  total_revenue: number;
  total_food_cost: number;
  total_contribution: number;
  avg_food_cost_percent: number;
  classification_counts: {
    star: number;
    puzzle: number;
    plowhorse: number;
    dog: number;
  };
}

export const MenuEngineeringPage = () => {
  //   const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState<string>('all');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(category !== 'all' && { category })
      });
      const res = await fetch(`/api/menu-engineering/analysis?"Params"`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setSummary(data.summary);
      }
    } catch (err: any) {
      console.error('Error loading analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, [startDate, endDate, category]);

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'star': return '⭐';
      case 'puzzle': return '🧩';
      case 'plowhorse': return '🐴';
      case 'dog': return '🐕';
      default: return '❓';
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'star': return '#22c55e';
      case 'puzzle': return '#3b82f6';
      case 'plowhorse': return '#f59e0b';
      case 'dog': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredProducts = selectedClassification === 'all'
    ? products
    : products.filter(p => p.classification === selectedClassification);

  if (loading && !summary) {
    return (
      <div className="menu-engineering-page">
        <PageHeader title='📊 menu engineering' description="Se încarcă analiza..." />
        <div className="loading">⏳ Se analizează produsele...</div>
      </div>
    );
  }

  return (
    <div className="menu-engineering-page">
      <PageHeader
        title='📊 menu engineering'
        description="Analiză profitabilitate și popularitate produse"
      />

      {/* Filters */}
      <div className="menu-engineering-filters">
        <div className="filter-group">
          <label>Perioadă:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span>→</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Categorie:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">Toate</option>
            <option value="Pizza">Pizza</option>
            <option value="Bauturi">Bauturi</option>
            <option value="Desert">Desert</option>
          </select>
        </div>
        <button onClick={loadAnalysis} className="btn-refresh">
          🔄 Actualizează
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="menu-engineering-summary">
          <div className="summary-card">
            <h3>Total Produse</h3>
            <p className="summary-value">{summary.total_products}</p>
          </div>
          <div className="summary-card">
            <h3>Venituri Totale</h3>
            <p className="summary-value">{summary.total_revenue.toFixed(2)} RON</p>
          </div>
          <div className="summary-card">
            <h3>Food Cost %</h3>
            <p className="summary-value">{summary.avg_food_cost_percent.toFixed(1)}%</p>
          </div>
          <div className="summary-card">
            <h3>Profit Total</h3>
            <p className="summary-value">{summary.total_contribution.toFixed(2)} RON</p>
          </div>
        </div>
      )}

      {/* Classification Tabs */}
      <div className="classification-tabs">
        <button
          className={selectedClassification === 'all' ? 'active' : ''}
          onClick={() => setSelectedClassification('all')}
        >
          Toate ({products.length})
        </button>
        <button
          className={selectedClassification === 'star' ? 'active' : ''}
          onClick={() => setSelectedClassification('star')}
          style={{ color: getClassificationColor('star') }}
        >
          ⭐ Stars ({summary?.classification_counts.star || 0})
        </button>
        <button
          className={selectedClassification === 'puzzle' ? 'active' : ''}
          onClick={() => setSelectedClassification('puzzle')}
          style={{ color: getClassificationColor('puzzle') }}
        >
          🧩 Puzzles ({summary?.classification_counts.puzzle || 0})
        </button>
        <button
          className={selectedClassification === 'plowhorse' ? 'active' : ''}
          onClick={() => setSelectedClassification('plowhorse')}
          style={{ color: getClassificationColor('plowhorse') }}
        >
          🐴 Plowhorses ({summary?.classification_counts.plowhorse || 0})
        </button>
        <button
          className={selectedClassification === 'dog' ? 'active' : ''}
          onClick={() => setSelectedClassification('dog')}
          style={{ color: getClassificationColor('dog') }}
        >
          🐕 Dogs ({summary?.classification_counts.dog || 0})
        </button>
      </div>

      {/* Products Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Clasificare</th>
              <th>Produs</th>
              <th>Categorie</th>
              <th>Preț</th>
              <th>Cantitate</th>
              <th>Venituri</th>
              <th>Food Cost</th>
              <th>Profit</th>
              <th>CM %</th>
              <th>Recomandare</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.product_id}>
                <td>
                  <span
                    className="classification-badge"
                    style={{ backgroundColor: getClassificationColor(product.classification) }}
                  >
                    {getClassificationIcon(product.classification)} {product.classification.toUpperCase()}
                  </span>
                </td>
                <td><strong>{product.product_name}</strong></td>
                <td>{product.category}</td>
                <td>{product.selling_price.toFixed(2)} RON</td>
                <td>{product.quantity_sold}</td>
                <td>{product.revenue.toFixed(2)} RON</td>
                <td>{product.food_cost.toFixed(2)} RON</td>
                <td><strong>{product.contribution_margin.toFixed(2)} RON</strong></td>
                <td>{product.cm_percentage.toFixed(1)}%</td>
                <td className="recommendation-cell">
                  <small>{product.recommendation}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Matrix Explanation */}
      <div className="matrix-explanation">
        <h3>📊 Matrix Menu Engineering</h3>
        <div className="matrix-grid">
          <div className="matrix-cell" style={{ borderColor: '#3b82f6' }}>
            <strong>🧩 PUZZLE</strong>
            <p>Profitabile dar nu populare</p>
            <p>→ Crește vizibilitatea</p>
          </div>
          <div className="matrix-cell" style={{ borderColor: '#22c55e' }}>
            <strong>⭐ STARS</strong>
            <p>Profitabile și populare</p>
            <p>→ Menține și promovează</p>
          </div>
          <div className="matrix-cell" style={{ borderColor: '#ef4444' }}>
            <strong>🐕 DOGS</strong>
            <p>Nici profitabile nici populare</p>
            <p>→ Consideră eliminarea</p>
          </div>
          <div className="matrix-cell" style={{ borderColor: '#f59e0b' }}>
            <strong>🐴 PLOWHORSES</strong>
            <p>Populare dar profit mic</p>
            <p>→ Crește prețul sau reduce costurile</p>
          </div>
        </div>
      </div>
    </div>
  );
};




