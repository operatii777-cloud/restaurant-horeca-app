import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/dark-kitchen';

const DarkKitchenPage: React.FC = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [brandForm, setBrandForm] = useState({ name: '', platform: 'Glovo', kitchen: 'Kitchen-Central' });

  const load = () => {
    axios.get(`${API}/brands`).then(r => setBrands(r.data.brands || [])).catch(() => {});
    axios.get(`${API}/kitchens`).then(r => setKitchens(r.data.kitchens || [])).catch(() => {});
    axios.get(`${API}/performance`).then(r => setPerformance(r.data.performance || [])).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const createBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`${API}/brands`, brandForm);
    setMsg(`✅ Virtual brand "${brandForm.name}" created`);
    setBrandForm({ name: '', platform: 'Glovo', kitchen: 'Kitchen-Central' });
    load();
  };

  const toggleBrand = async (b: any) => {
    await axios.put(`${API}/brands/${b.id}`, { active: !b.active });
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🍳 Dark Kitchen + Cloud Kitchen Mode</h1>
        <p className="page-subtitle">Virtual brands · Ghost menus · Shared kitchen logic · Cost allocation · Performance per brand</p>
      </div>

      {msg && <div className="alert alert-blue">{msg}</div>}

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Virtual Brands</div>
          <div className="stat-value">{brands.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value stat-up">{brands.filter(b => b.active).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{brands.reduce((s, b) => s + b.revenue, 0).toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{brands.reduce((s, b) => s + b.orders, 0)}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">➕ Create Virtual Brand</div>
          <form onSubmit={createBrand}>
            <div className="form-row">
              <label>Brand Name</label>
              <input value={brandForm.name} onChange={e => setBrandForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. BurgerDrop" />
            </div>
            <div className="form-group">
              <div className="form-row" style={{ flex: 1 }}>
                <label>Delivery Platform</label>
                <select value={brandForm.platform} onChange={e => setBrandForm(f => ({ ...f, platform: e.target.value }))}>
                  <option>Glovo</option><option>Bolt Food</option><option>Tazz</option><option>Wolt</option><option>Uber Eats</option>
                </select>
              </div>
              <div className="form-row" style={{ flex: 1 }}>
                <label>Kitchen</label>
                <select value={brandForm.kitchen} onChange={e => setBrandForm(f => ({ ...f, kitchen: e.target.value }))}>
                  {kitchens.map(k => <option key={k.id} value={k.id}>{k.id}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" type="submit">Create Virtual Brand</button>
          </form>
        </div>

        <div className="card">
          <div className="card-title">🏭 Shared Kitchens</div>
          {kitchens.map(k => (
            <div key={k.id} style={{ padding: '10px 12px', background: '#1e2a40', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{k.id}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '0.8rem', color: '#718096' }}>Capacity:</span>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className={`progress-fill ${k.currentLoad > 80 ? 'progress-red' : k.currentLoad > 60 ? 'progress-yellow' : 'progress-green'}`}
                    style={{ width: `${k.currentLoad}%` }} />
                </div>
                <span style={{ fontSize: '0.82rem' }}>{k.currentLoad}%</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#718096' }}>{k.brands?.length || 0} brands assigned</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">📊 Virtual Brands Performance</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Brand</th><th>Platform</th><th>Kitchen</th><th>Orders</th><th>Revenue</th><th>Avg Order</th><th>Status</th><th>Toggle</th></tr></thead>
            <tbody>
              {brands.map(b => {
                const perf = performance.find(p => p.brandId === b.id);
                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.name}</td>
                    <td>{b.platform}</td>
                    <td>{b.kitchen}</td>
                    <td>{b.orders}</td>
                    <td>{b.revenue.toLocaleString()} RON</td>
                    <td>{perf?.avgOrderValue || '-'} RON</td>
                    <td><span className={`badge ${b.active ? 'badge-green' : 'badge-gray'}`}>{b.active ? 'ACTIVE' : 'PAUSED'}</span></td>
                    <td>
                      <button className={`btn btn-sm ${b.active ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleBrand(b)}>
                        {b.active ? 'Pause' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DarkKitchenPage;
