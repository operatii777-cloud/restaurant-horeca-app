import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/data-network';

const DataNetworkPage: React.FC = () => {
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [ingredientCosts, setIngredientCosts] = useState<any[]>([]);
  const [networkStats, setNetworkStats] = useState<any>(null);

  useEffect(() => {
    axios.get(`${API}/benchmark`).then(r => setBenchmarks(r.data.benchmarks || [])).catch(() => {});
    axios.get(`${API}/peak-hours`).then(r => setPeakHours(r.data.peakHours || [])).catch(() => {});
    axios.get(`${API}/food-trends`).then(r => setTrends(r.data.trends || [])).catch(() => {});
    axios.get(`${API}/ingredient-costs`).then(r => setIngredientCosts(r.data.costs || [])).catch(() => {});
    axios.get(`${API}/network-stats`).then(r => setNetworkStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🌐 Global Data Network Effect</h1>
        <p className="page-subtitle">Anonymous benchmarking · Peak hour by region · Food trend detection · Ingredient cost intel · Network analytics</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Network Restaurants</div>
          <div className="stat-value">{networkStats?.totalRestaurants || 0}</div>
          <div className="stat-sub stat-up">{networkStats?.networkGrowthMoM}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cities</div>
          <div className="stat-value">{networkStats?.totalCities || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Data Points Today</div>
          <div className="stat-value">{(networkStats?.dataPointsToday || 0).toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Countries</div>
          <div className="stat-value">{networkStats?.totalCountries || 0}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📊 Anonymous Industry Benchmark by City</div>
        <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: 12 }}>Data anonymized and aggregated. Minimum 5 restaurants per city for inclusion.</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>City</th><th>Avg Gross Margin</th><th>Avg Labor Cost %</th><th>Avg Rev/Cover</th><th>Peak Hour</th><th>Top Trend</th><th>Restaurants</th></tr></thead>
            <tbody>
              {benchmarks.map((b, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{b.city}</td>
                  <td className="stat-up">{b.avgGrossMargin}</td>
                  <td>{b.avgLaborCostPct}</td>
                  <td>{b.avgRevenuePerCover} RON</td>
                  <td>{b.peakHour}</td>
                  <td><span className="badge badge-blue">{b.topTrend}</span></td>
                  <td>{b.participatingRestaurants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">🍕 Food Trend Detection</div>
          {trends.map((t, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '10px 12px', background: '#1e2a40', borderRadius: 8 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{t.trend}</div>
                <div style={{ fontSize: '0.78rem', color: '#718096' }}>{t.region}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="stat-up" style={{ fontWeight: 700, fontSize: '1rem' }}>{t.growth}</span>
                <span className={`badge ${t.confidence === 'HIGH' ? 'badge-green' : 'badge-yellow'}`}>{t.confidence}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">🥩 Ingredient Cost Trends</div>
          {ingredientCosts.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '8px 12px', background: '#1e2a40', borderRadius: 8 }}>
              <span style={{ fontWeight: 600 }}>{c.ingredient}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: c.trend.startsWith('+') ? '#fc8181' : '#48bb78' }}>{c.trend}</span>
                <span style={{ fontSize: '0.75rem', color: '#718096' }}>{c.period}</span>
                {c.alert && <span className="badge badge-red">⚠️ ALERT</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">🕐 Peak Hour Benchmarks by Region</div>
        <div className="grid grid-3">
          {peakHours.map((r, i) => (
            <div key={i} style={{ padding: '12px', background: '#1e2a40', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{r.region}</div>
              <div style={{ fontSize: '0.82rem', color: '#a0aec0' }}>🍽️ Lunch: {r.peakLunch}</div>
              <div style={{ fontSize: '0.82rem', color: '#a0aec0' }}>🌙 Dinner: {r.peakDinner}</div>
              <div style={{ fontSize: '0.82rem', color: '#a0aec0' }}>📅 Busiest: {r.busiest_day}</div>
              <div style={{ fontSize: '0.78rem', color: '#718096', marginTop: 4 }}>~{r.avgCoversPerDay} covers/day avg</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataNetworkPage;
