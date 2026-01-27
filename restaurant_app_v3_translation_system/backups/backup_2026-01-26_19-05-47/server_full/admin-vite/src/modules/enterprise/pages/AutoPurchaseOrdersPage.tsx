// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 📦 AUTO PURCHASE ORDERS PAGE - Comenzi automate furnizori
 */

import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import './AutoPurchaseOrdersPage.css';

interface Order {
  id: number;
  order_id?: string;
  supplier_id: number;
  supplier_name?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'received';
  total_value?: number;
  auto_generated: number;
  created_at: string;
}

export const AutoPurchaseOrdersPage = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/purchase-orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err: any) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCheckReorder = async () => {
    try {
      // Folosește Smart Restock V2 pentru analiză inteligentă
      const analysisRes = await fetch('/api/smart-restock-v2/analysis?days=30&forecast_days=14');
      const analysisData = await analysisRes.json();
      
      if (!analysisData.success || !analysisData.supplier_orders || analysisData.supplier_orders.length === 0) {
        alert('Nu sunt necesare comenzi în acest moment.');
        return;
      }
      
      // Generează comenzi automate pentru fiecare furnizor cu urgență >= 3
      const criticalSuppliers = analysisData.supplier_orders.filter((s: any) => s.max_urgency >= 3);
      
      if (criticalSuppliers.length === 0) {
        alert(`Analiză completă: ${analysisData.supplier_orders.length} furnizori identificați, dar niciun ingredient critic.`);
        return;
      }
      
      let created = 0;
      for (const supplier of criticalSuppliers) {
        try {
          const res = await fetch('/api/smart-restock-v2/generate-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              supplier_id: supplier.supplier_id,
              items: supplier.items
            })
          });
          const data = await res.json();
          if (data.success) {
            created++;
          }
        } catch (err) {
          console.error('Error generating order:', err);
        }
      }
      
      alert(`✅ Generate "Created" comenzi automate bazate pe Smart Restock ML!`);
      loadOrders();
      
    } catch (err: any) {
      console.error('Error checking reorder:', err);
      alert('Eroare la verificare: ' + err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#6b7280';
      case 'pending_approval': return '#f59e0b';
      case 'approved': return '#22c55e';
      case 'ordered': return '#3b82f6';
      case 'received': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="auto-purchase-orders-page">
        <PageHeader title='📦 auto purchase orders' description="se incarca" />
        <div className="loading">⏳ Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="auto-purchase-orders-page">
      <PageHeader 
        title='📦 auto purchase orders' 
        description="Comenzi automate către furnizori"
      />

      <div className="orders-header">
        <button onClick={handleCheckReorder} className="btn-check">
          🔍 Verifică Necesarul de Recomandă
        </button>
        <button onClick={loadOrders} className="btn-refresh">
          🔄 Actualizează
        </button>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Furnizor</th>
              <th>Status</th>
              <th>Total</th>
              <th>"auto generata"</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><strong>#{order.id}</strong></td>
                <td>{order.supplier_name || `Furnizor ${order.supplier_id}`}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.toUpperCase().replace('_', ' ')}
                  </span>
                </td>
                <td>{order.total_value ? `${order.total_value.toFixed(2)} RON` : '-'}</td>
                <td>{order.auto_generated ? '✅ Da' : 'Manual'}</td>
                <td>{new Date(order.created_at).toLocaleDateString('ro-RO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && !loading && (
        <div className="empty-state">
          <p>"nu exista comenzi automate create"</p>
          <p>Apasă "Verifică Necesarul" pentru a genera comenzi automate bazate pe reguli de recomandă.</p>
        </div>
      )}
    </div>
  );
};




