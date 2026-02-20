import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/api-economy';

const ApiEconomyPage: React.FC = () => {
  const [docs, setDocs] = useState<any>(null);
  const [plugins, setPlugins] = useState<any[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  const [usage, setUsage] = useState<any>(null);
  const [revenueShare, setRevenueShare] = useState<any>(null);
  const [keyForm, setKeyForm] = useState({ appName: '', email: '', tier: 'Free' });
  const [pluginForm, setPluginForm] = useState({ name: '', author: '', price: '', category: 'Marketing', description: '' });
  const [msg, setMsg] = useState('');

  const load = () => {
    axios.get(`${API}/docs`).then(r => setDocs(r.data)).catch(() => {});
    axios.get(`${API}/plugins`).then(r => setPlugins(r.data.plugins || [])).catch(() => {});
    axios.get(`${API}/keys`).then(r => setKeys(r.data.keys || [])).catch(() => {});
    axios.get(`${API}/usage`).then(r => setUsage(r.data)).catch(() => {});
    axios.get(`${API}/revenue-share`).then(r => setRevenueShare(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const generateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await axios.post(`${API}/keys`, keyForm);
    setMsg(`✅ API key generated for ${res.data.appName}: ${res.data.key}`);
    load();
  };

  const submitPlugin = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`${API}/plugins`, { ...pluginForm, price: parseFloat(pluginForm.price) });
    setMsg(`✅ Plugin "${pluginForm.name}" submitted for review`);
    setPluginForm({ name: '', author: '', price: '', category: 'Marketing', description: '' });
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">⚙️ API Economy Mode</h1>
        <p className="page-subtitle">Public developer portal · API monetization · Plugin marketplace · Revenue share · App store</p>
      </div>

      {msg && <div className="alert alert-blue">{msg}</div>}

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">API Keys</div>
          <div className="stat-value">{usage?.totalKeys || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Requests</div>
          <div className="stat-value">{(usage?.totalRequests || 0).toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly API Revenue</div>
          <div className="stat-value">${usage?.monthlyRevenue || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Plugins</div>
          <div className="stat-value">{plugins.length}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">🔑 Generate API Key</div>
          <form onSubmit={generateKey}>
            <div className="form-row">
              <label>App Name</label>
              <input value={keyForm.appName} onChange={e => setKeyForm(f => ({ ...f, appName: e.target.value }))} required />
            </div>
            <div className="form-row">
              <label>Developer Email</label>
              <input type="email" value={keyForm.email} onChange={e => setKeyForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-row">
              <label>Tier</label>
              <select value={keyForm.tier} onChange={e => setKeyForm(f => ({ ...f, tier: e.target.value }))}>
                {(docs?.pricingTiers || []).map((t: any) => <option key={t.name} value={t.name}>{t.name} — {t.requests} req/mo — ${t.price}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" type="submit">Generate Key</button>
          </form>
        </div>

        <div className="card">
          <div className="card-title">📖 API Documentation Summary</div>
          {docs && (
            <>
              <div style={{ marginBottom: 12, fontSize: '0.88rem' }}>
                <strong>{docs.title}</strong> v{docs.version}
                <div style={{ color: '#a0aec0', marginTop: 4 }}>{docs.description}</div>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#718096', marginBottom: 8 }}>Auth: {docs.authentication} · Rate: {docs.rateLimit}</div>
              <div>
                {(docs.endpoints || []).map((ep: any, i: number) => (
                  <div key={i} style={{ padding: '4px 8px', background: '#1e2a40', borderRadius: 4, marginBottom: 4, fontSize: '0.8rem' }}>
                    <span className="badge badge-blue" style={{ marginRight: 6 }}>{ep.method}</span>
                    <span style={{ color: '#63b3ed' }}>{ep.path}</span>
                    <span style={{ color: '#718096', marginLeft: 8 }}>{ep.description}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">🧩 Plugin Marketplace</div>
          {plugins.map(p => (
            <div key={p.id} style={{ padding: '10px 12px', background: '#1e2a40', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#718096' }}>by {p.author} · {p.category}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#63b3ed' }}>${p.price}/mo</div>
                  <div style={{ fontSize: '0.75rem', color: '#718096' }}>{p.installs} installs</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">🚀 Submit Plugin</div>
          <form onSubmit={submitPlugin}>
            <div className="form-group">
              <div className="form-row" style={{ flex: 1 }}>
                <label>Plugin Name</label>
                <input value={pluginForm.name} onChange={e => setPluginForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-row" style={{ flex: 1 }}>
                <label>Author</label>
                <input value={pluginForm.author} onChange={e => setPluginForm(f => ({ ...f, author: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group">
              <div className="form-row" style={{ flex: 1 }}>
                <label>Price ($/mo)</label>
                <input type="number" value={pluginForm.price} onChange={e => setPluginForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="form-row" style={{ flex: 1 }}>
                <label>Category</label>
                <select value={pluginForm.category} onChange={e => setPluginForm(f => ({ ...f, category: e.target.value }))}>
                  <option>Marketing</option><option>Operations</option><option>Analytics</option><option>Payments</option><option>General</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" type="submit">Submit Plugin</button>
          </form>

          {revenueShare && (
            <div style={{ marginTop: 16, padding: '12px', background: '#1e2a40', borderRadius: 8 }}>
              <div className="card-title" style={{ fontSize: '0.85rem' }}>💸 Revenue Share Model</div>
              <div style={{ fontSize: '0.85rem', color: '#a0aec0' }}>{revenueShare.shareModel}</div>
              <div style={{ fontSize: '0.82rem', marginTop: 4 }}>
                Total Plugin Revenue: <strong>{revenueShare.totalPluginRevenue} RON</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiEconomyPage;
