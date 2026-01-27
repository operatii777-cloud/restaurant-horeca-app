// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 💹 FOOD COST DASHBOARD PAGE - Real-time Food Cost Analysis
 */

import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import './FoodCostDashboardPage.css';

interface FoodCostData {
  revenue: number;
  cost: number;
  orders: number;
  cost_pct: string;
  profit: number;
  avg_ticket: string;
}

interface DashboardData {
  target: number;
  today: FoodCostData;
  week: FoodCostData;
  month: FoodCostData;
}

interface CategoryData {
  category: string;
  products: number;
  total_price: number;
  total_cost: number;
  avg_cost_pct: string;
}

export const FoodCostDashboardPage = () => {
//   const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [trends, setTrends] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load real-time dashboard
      const dashboardRes = await fetch('/api/food-cost/realtime');
      const dashboardData = await dashboardRes.json();
      if (dashboardData.success) {
        setDashboard(dashboardData);
      }

      // Load by category
      const categoryRes = await fetch('/api/food-cost/by-category');
      const categoryData = await categoryRes.json();
      if (categoryData.success) {
        setCategories(categoryData.categories || []);
      }

      // Load trends
      const trendsRes = await fetch('/api/food-cost/trends?days=30');
      const trendsData = await trendsRes.json();
      if (trendsData.success) {
        setTrends(trendsData.trends || []);
      }
    } catch (err: any) {
      console.error('Error loading food cost data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (costPct: number, target: number) => {
    if (costPct <= target) return '#22c55e'; // Green
    if (costPct <= target + 5) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  if (loading && !dashboard) {
    return (
      <div className="food-cost-dashboard-page">
        <PageHeader title="💹 Food Cost Dashboard" description="Se încarcă datele..." />
        <div className="loading">⏳ Se analizează costurile...</div>
      </div>
    );
  }

  return (
    <div className="food-cost-dashboard-page">
      <PageHeader 
        title="💹 Food Cost Dashboard" 
        description="Analiză costuri alimentare în timp real"
      />

      {/* Target & Summary */}
      {dashboard && (
        <div className="target-section">
          <div className="target-card">
            <h3>Target Food Cost</h3>
            <p className="target-value">{dashboard.target}%</p>
          </div>
          <button onClick={loadData} className="btn-refresh">
            🔄 Actualizează
          </button>
        </div>
      )}

      {/* Period Cards */}
      {dashboard && (
        <div className="period-cards">
          <div className="period-card">
            <h3>"Astăzi"</h3>
            <div className="period-stats">
              <div className="stat-item">
                <span className="stat-label">Food Cost:</span>
                <span
                  className="stat-value"
                  style={{ color: getStatusColor(parseFloat(dashboard.today.cost_pct), dashboard.target) }}
                >
                  {dashboard.today.cost_pct}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Venituri:</span>
                <span className="stat-value">{dashboard.today.revenue.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Costuri:</span>
                <span className="stat-value">{dashboard.today.cost.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Profit:</span>
                <span className="stat-value profit">{dashboard.today.profit.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Comenzi:</span>
                <span className="stat-value">{dashboard.today.orders}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Ticket Mediu:</span>
                <span className="stat-value">{dashboard.today.avg_ticket} RON</span>
              </div>
            </div>
          </div>

          <div className="period-card">
            <h3>Ultimele 7 Zile</h3>
            <div className="period-stats">
              <div className="stat-item">
                <span className="stat-label">Food Cost:</span>
                <span
                  className="stat-value"
                  style={{ color: getStatusColor(parseFloat(dashboard.week.cost_pct), dashboard.target) }}
                >
                  {dashboard.week.cost_pct}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Venituri:</span>
                <span className="stat-value">{dashboard.week.revenue.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Costuri:</span>
                <span className="stat-value">{dashboard.week.cost.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Profit:</span>
                <span className="stat-value profit">{dashboard.week.profit.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Comenzi:</span>
                <span className="stat-value">{dashboard.week.orders}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Ticket Mediu:</span>
                <span className="stat-value">{dashboard.week.avg_ticket} RON</span>
              </div>
            </div>
          </div>

          <div className="period-card">
            <h3>"luna curenta"</h3>
            <div className="period-stats">
              <div className="stat-item">
                <span className="stat-label">Food Cost:</span>
                <span
                  className="stat-value"
                  style={{ color: getStatusColor(parseFloat(dashboard.month.cost_pct), dashboard.target) }}
                >
                  {dashboard.month.cost_pct}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Venituri:</span>
                <span className="stat-value">{dashboard.month.revenue.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Costuri:</span>
                <span className="stat-value">{dashboard.month.cost.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Profit:</span>
                <span className="stat-value profit">{dashboard.month.profit.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Comenzi:</span>
                <span className="stat-value">{dashboard.month.orders}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Ticket Mediu:</span>
                <span className="stat-value">{dashboard.month.avg_ticket} RON</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* By Category */}
      {categories.length > 0 && (
        <div className="category-section">
          <h3>"food cost pe categorii"</h3>
          <div className="category-table-container">
            <table className="category-table">
              <thead>
                <tr>
                  <th>Categorie</th>
                  <th>Produse</th>
                  <th>Preț Total</th>
                  <th>Cost Total</th>
                  <th>Food Cost %</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={idx}>
                    <td><strong>{cat.category || 'Necategorizat'}</strong></td>
                    <td>{cat.products}</td>
                    <td>{cat.total_price.toFixed(2)} RON</td>
                    <td>{cat.total_cost.toFixed(2)} RON</td>
                    <td>
                      <span
                        className="cost-pct-badge"
                        style={{
                          color: getStatusColor(parseFloat(cat.avg_cost_pct), dashboard?.target || 30)
                        }}
                      >
                        {cat.avg_cost_pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};




