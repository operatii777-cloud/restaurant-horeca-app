// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 🤖 SMART RESTOCK PAGE - Comenzi automate cu ML
 */

import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import './SmartRestockPage.css';

interface RestockPrediction {
  id: number;
  ingredient_name: string;
  current_stock: number;
  min_stock_alert: number;
  unit: string;
  cost_per_unit: number;
  supplier_name: string;
  daily_consumption: string;
  days_until_stockout: number;
  recommended_order_qty: number;
  estimated_cost: string;
  urgency: number;
  urgency_label: string;
}

interface SupplierOrder {
  supplier_id: string;
  supplier_name: string;
  items: RestockPrediction[];
  total_cost: number;
  max_urgency: number;
}

interface AnalysisData {
  analysis_period_days: number;
  generated_at: string;
  summary: {
    total_low_stock_items: number;
    items_needing_reorder: number;
    critical_items: number;
    total_estimated_cost: string;
    suppliers_to_contact: number;
    // Pure sales-based metrics
    sales_reorder_count: number;
    sales_low_count: number;
    sales_critical_count: number;
    sales_total_cost: string;
  };
  predictions: RestockPrediction[];
  supplier_orders: SupplierOrder[];
}

export const SmartRestockPage = () => {
  //   const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [periodDays, setPeriodDays] = useState(30);
  const [generatingOrder, setGeneratingOrder] = useState<string | null>(null);

  const loadAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      // Folosește API V2 - bazat pe produse best-seller
      const response = await fetch(`/api/smart-restock-v2/analysis?days=${periodDays}&forecast_days=14`);
      const result = await response.json();
      if (result.success) {
        // Ensure supplier_orders is always an array
        const normalizedData = {
          ...result,
          supplier_orders: result.supplier_orders || [],
          predictions: result.predictions || [],
          summary: result.summary || {
            total_low_stock_items: 0,
            items_needing_reorder: 0,
            critical_items: 0,
            total_estimated_cost: '0.00',
            suppliers_to_contact: 0,
            sales_reorder_count: 0,
            sales_low_count: 0,
            sales_critical_count: 0,
            sales_total_cost: '0.00',
          },
        };
        setData(normalizedData);
      } else {
        setError(result.error || 'Eroare la încărcare');
      }
    } catch (err: any) {
      setError(err.message);
      // Set empty data structure on error to prevent crashes
      setData({
        analysis_period_days: periodDays,
        generated_at: new Date().toISOString(),
        summary: {
          total_low_stock_items: 0,
          items_needing_reorder: 0,
          critical_items: 0,
          total_estimated_cost: '0.00',
          suppliers_to_contact: 0,
          sales_reorder_count: 0,
          sales_low_count: 0,
          sales_critical_count: 0,
          sales_total_cost: '0.00',
        },
        predictions: [],
        supplier_orders: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, [periodDays]);

  const handleGenerateOrder = async (supplierOrder: SupplierOrder) => {
    setGeneratingOrder(supplierOrder.supplier_id);
    try {
      // Folosește API V2
      const response = await fetch('/api/smart-restock-v2/generate-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: supplierOrder.supplier_id,
          items: supplierOrder.items.map(item => ({
            ingredient_id: item.id,
            quantity: item.recommended_order_qty,
            cost_per_unit: item.cost_per_unit,
          })),
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert(`✅ Comandă ${result.order_id} creată cu succes!`);
        loadAnalysis();
      } else {
        alert(`❌ Eroare: ${result.error}`);
      }
    } catch (err: any) {
      alert(`❌ Eroare: ${err.message}`);
    } finally {
      setGeneratingOrder(null);
    }
  };

  const getUrgencyClass = (urgency: number) => {
    if (urgency >= 4) return 'urgency-critical';
    if (urgency >= 3) return 'urgency-high';
    if (urgency >= 2) return 'urgency-medium';
    return 'urgency-low';
  };

  if (loading) {
    return (
      <div className="smart-restock-page">
        <PageHeader title="🤖 Smart Restock" description="Se analizează datele..." />
        <div className="loading-spinner">⏳ Analiză în curs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="smart-restock-page">
        <PageHeader title="🤖 Smart Restock" description="Eroare la încărcare" />
        <div className="error-message">❌ {error}</div>
        <button onClick={loadAnalysis} className="btn-retry">"Reîncearcă"</button>
      </div>
    );
  }

  return (
    <div className="smart-restock-page" data-page-ready="true">
      <PageHeader
        title='🤖 smart restock comenzi automate ml'
        description={`Analiză bazată pe ultimele ${periodDays} zile. Generat: ${data?.generated_at ? new Date(data.generated_at).toLocaleString('ro-RO') : ''}`}
        actions={[
          { label: '🔄 Refresh', variant: 'secondary', onClick: loadAnalysis },
        ]}
      >
        {data?.summary && (
          <div className="suppliers-header-badge">
            <span className="badge-icon">🏪</span>
            <span className="badge-value">{data.summary.suppliers_to_contact}</span>
            <span className="badge-label">Furnizori</span>
          </div>
        )}
      </PageHeader>

      {/* Period Selector */}
      <div className="period-selector">
        <label>Perioada analiză:</label>
        <select value={periodDays} onChange={(e) => setPeriodDays(Number(e.target.value))}>
          <option value={7}>7 zile</option>
          <option value={14}>14 zile</option>
          <option value={30}>30 zile</option>
          <option value={60}>60 zile</option>
          <option value={90}>90 zile</option>
        </select>
      </div>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="summary-grid">
          {/* Group 1: Consolidated / Real-time Stock Needs */}
          <div className="summary-card">
            <div className="summary-value">{data.summary.total_low_stock_items}</div>
            <div className="summary-label">Stoc Scăzut (Total)</div>
          </div>
          <div className="summary-card warning">
            <div className="summary-value">{data.summary.items_needing_reorder}</div>
            <div className="summary-label">Necesită Comandă</div>
          </div>
          <div className="summary-card danger">
            <div className="summary-value">{data.summary.critical_items}</div>
            <div className="summary-label">Critice (Real)</div>
          </div>
          <div className="summary-card info">
            <div className="summary-value">{data.summary.total_estimated_cost} RON</div>
            <div className="summary-label">Cost Estimat Total</div>
          </div>

          {/* Group 2: Pure Sales Predictions (Logica Inițială) */}
          <div className="summary-card alt">
            <div className="summary-value">{data.summary.sales_reorder_count}</div>
            <div className="summary-label">Analiză Vânzări</div>
          </div>
          <div className="summary-card alt warning">
            <div className="summary-value">{data.summary.sales_low_count}</div>
            <div className="summary-label">Cerere Prognozată</div>
          </div>
          <div className="summary-card alt danger">
            <div className="summary-value">{data.summary.sales_critical_count}</div>
            <div className="summary-label">Urgențe Vânzări</div>
          </div>
          <div className="summary-card alt info">
            <div className="summary-value">{data.summary.sales_total_cost} RON</div>
            <div className="summary-label">Cost Prognozat</div>
          </div>

        </div>
      )}

      {/* Supplier Orders */}
      <section className="supplier-orders-section">
        <h2>📦 Comenzi Sugerate pe Furnizori</h2>
        {!data?.supplier_orders || data.supplier_orders.length === 0 ? (
          <p className="no-data">✅ Toate stocurile sunt OK! Nu sunt necesare comenzi.</p>
        ) : (
          <div className="supplier-orders-grid">
            {data.supplier_orders.map((order) => (
              <div key={order.supplier_id} className={`supplier-order-card ${getUrgencyClass(order.max_urgency)}`}>
                <div className="supplier-header">
                  <h3>🏪 {order.supplier_name}</h3>
                  <span className={`urgency-badge ${getUrgencyClass(order.max_urgency)}`}>
                    {order.max_urgency >= 4 ? '🔴 URGENT' : order.max_urgency >= 3 ? '🟠 HIGH' : '🟡 MEDIUM'}
                  </span>
                </div>

                <div className="supplier-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="supplier-item">
                      <span className="item-name">{item.ingredient_name}</span>
                      <span className="item-qty">
                        {item.recommended_order_qty} {item.unit}
                      </span>
                      <span className="item-cost">{item.estimated_cost} RON</span>
                      <span className={`item-days ${item.days_until_stockout <= 3 ? 'critical' : ''}`}>
                        {item.days_until_stockout} zile
                      </span>
                    </div>
                  ))}
                </div>

                <div className="supplier-footer">
                  <span className="total-cost">
                    Total: <strong>{order.total_cost.toFixed(2)} RON</strong>
                  </span>
                  <button
                    className="btn-generate-order"
                    onClick={() => handleGenerateOrder(order)}
                    disabled={generatingOrder === order.supplier_id}
                  >
                    {generatingOrder === order.supplier_id ? '⏳ Se generează...' : '📝 Generează Comandă'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Detailed Predictions Table */}
      <section className="predictions-section">
        <h2>📊 Detalii Predicții</h2>
        <table className="predictions-table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Stoc Actual</th>
              <th>Minim</th>
              <th>Consum/zi</th>
              <th>Zile Rămase</th>
              <th>Recomandare</th>
              <th>Cost Est.</th>
              <th>Urgență</th>
            </tr>
          </thead>
          <tbody>
            {data?.predictions.map((pred) => (
              <tr key={pred.id} className={getUrgencyClass(pred.urgency)}>
                <td><strong>{pred.ingredient_name}</strong></td>
                <td>{pred.current_stock} {pred.unit}</td>
                <td>{pred.min_stock_alert} {pred.unit}</td>
                <td>{pred.daily_consumption} {pred.unit}</td>
                <td className={pred.days_until_stockout <= 3 ? 'critical' : ''}>
                  {pred.days_until_stockout === 999 ? '∞' : pred.days_until_stockout}
                </td>
                <td>{pred.recommended_order_qty} {pred.unit}</td>
                <td>{pred.estimated_cost} RON</td>
                <td>
                  <span className={`urgency-badge ${getUrgencyClass(pred.urgency)}`}>
                    {pred.urgency_label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default SmartRestockPage;




