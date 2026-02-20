import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/revenue';

const RevenuePage: React.FC = () => {
  const [menuEngineering, setMenuEngineering] = useState<any>(null);
  const [cannibalization, setCannibalization] = useState<any[]>([]);
  const [margins, setMargins] = useState<any>(null);
  const [elasticity, setElasticity] = useState<any[]>([]);
  const [abTests, setAbTests] = useState<any[]>([]);
  const [removals, setRemovals] = useState<any[]>([]);
  const [abForm, setAbForm] = useState({ itemId: '', priceA: '', priceB: '', duration: '7' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    axios.get(`${API}/menu-engineering`).then(r => setMenuEngineering(r.data)).catch(() => {});
    axios.get(`${API}/cannibalization`).then(r => setCannibalization(r.data.pairs || [])).catch(() => {});
    axios.get(`${API}/margins`).then(r => setMargins(r.data)).catch(() => {});
    axios.get(`${API}/elasticity`).then(r => setElasticity(r.data.elasticity || [])).catch(() => {});
    axios.get(`${API}/ab-tests`).then(r => setAbTests(r.data.tests || [])).catch(() => {});
    axios.get(`${API}/remove-suggestions`).then(r => setRemovals(r.data.suggestions || [])).catch(() => {});
  }, []);

  const startAbTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await axios.post(`${API}/ab-test`, { ...abForm, priceA: parseFloat(abForm.priceA), priceB: parseFloat(abForm.priceB) });
    setMsg(`✅ A/B test started for ${res.data.itemName}`);
    setAbTests(t => [res.data, ...t]);
  };

  const catBadge = (cat: string) => {
    const map: any = { STAR: '⭐ STAR', PLOWHORSE: '🐴 PLOWHORSE', PUZZLE: '🧩 PUZZLE', DOG: '🐕 DOG' };
    return map[cat] || cat;
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📈 Revenue Science Layer</h1>
        <p className="page-subtitle">Menu engineering AI · Price elasticity · Cannibalization detection · Real-time margins · A/B price testing</p>
      </div>

      {msg && <div className="alert alert-blue">{msg}</div>}

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{margins?.totalRevenue?.toLocaleString() || '-'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Gross Margin</div>
          <div className="stat-value stat-up">{margins?.overallMargin || '-'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Stars 🌟</div>
          <div className="stat-value stat-up">{menuEngineering?.summary?.stars || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dogs 🐕</div>
          <div className="stat-value stat-down">{menuEngineering?.summary?.dogs || 0}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">🍽️ Menu Engineering Matrix (Stars / Dogs / Puzzles / Plowhorses)</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Cost</th><th>Sales</th><th>Margin %</th><th>Classification</th></tr></thead>
            <tbody>
              {(menuEngineering?.items || []).map((item: any) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.price} RON</td>
                  <td>{item.cost} RON</td>
                  <td>{item.sales}</td>
                  <td>{item.margin}%</td>
                  <td><span className={`cat-${item.menuCategory}`}>{catBadge(item.menuCategory)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">⚠️ Cannibalization Detection</div>
          {cannibalization.length === 0
            ? <p style={{ color: '#48bb78' }}>✅ No cannibalization detected</p>
            : cannibalization.map((pair, i) => (
              <div key={i} className="alert alert-yellow">
                <strong>{pair.item1}</strong> vs <strong>{pair.item2}</strong> — price diff {pair.priceDiff}
                <span className="badge badge-red" style={{ marginLeft: 8 }}>{pair.risk} RISK</span>
              </div>
            ))
          }
        </div>

        <div className="card">
          <div className="card-title">📉 Remove Suggestions (DOG items)</div>
          {removals.length === 0
            ? <p style={{ color: '#48bb78' }}>✅ No items recommended for removal</p>
            : removals.map((item: any) => (
              <div key={item.id} className="alert alert-red">
                <strong>{item.name}</strong> — {item.reason}
                <div style={{ fontSize: '0.78rem', marginTop: 4 }}>Sales: {item.sales} | Margin: {item.margin}%</div>
              </div>
            ))
          }
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">🔬 A/B Price Test</div>
          <form onSubmit={startAbTest}>
            <div className="form-group">
              <div className="form-row" style={{ flex: 2 }}>
                <label>Item ID</label>
                <select value={abForm.itemId} onChange={e => setAbForm(f => ({ ...f, itemId: e.target.value }))} required>
                  <option value="">Select item</option>
                  {(menuEngineering?.items || []).map((item: any) => (
                    <option key={item.id} value={item.id}>{item.name} ({item.price} RON)</option>
                  ))}
                </select>
              </div>
              <div className="form-row" style={{ flex: 1 }}>
                <label>Price A</label>
                <input type="number" value={abForm.priceA} onChange={e => setAbForm(f => ({ ...f, priceA: e.target.value }))} required />
              </div>
              <div className="form-row" style={{ flex: 1 }}>
                <label>Price B</label>
                <input type="number" value={abForm.priceB} onChange={e => setAbForm(f => ({ ...f, priceB: e.target.value }))} required />
              </div>
            </div>
            <button className="btn btn-primary" type="submit">🚀 Start Test</button>
          </form>
          {abTests.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {abTests.map(t => (
                <div key={t.id} style={{ padding: '8px 12px', background: '#1e2a40', borderRadius: 8, marginBottom: 6, fontSize: '0.85rem' }}>
                  <span className="badge badge-yellow">{t.status}</span>
                  <strong style={{ marginLeft: 8 }}>{t.itemName}</strong>: {t.priceA} vs {t.priceB} RON
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">📊 Price Elasticity Detection</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Item</th><th>Elasticity</th><th>Suggestion</th></tr></thead>
              <tbody>
                {elasticity.map((e: any) => (
                  <tr key={e.id}>
                    <td>{e.name}</td>
                    <td>{e.elasticity}</td>
                    <td style={{ fontSize: '0.78rem', color: '#a0aec0' }}>{e.suggestion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;
