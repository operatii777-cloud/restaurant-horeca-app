import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/supply-chain';

const SupplyChainPage: React.FC = () => {
  const [inventory, setInventory] = useState<any>({});
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [pos, setPOs] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [poForm, setPoForm] = useState({ supplier: '', location: 'LocationA', items: '' });

  const load = () => {
    axios.get(`${API}/inventory`).then(r => setInventory(r.data)).catch(() => {});
    axios.get(`${API}/transfer-suggestions`).then(r => setSuggestions(r.data.suggestions || [])).catch(() => {});
    axios.get(`${API}/suppliers`).then(r => setSuppliers(r.data.suppliers || [])).catch(() => {});
    axios.get(`${API}/purchase-orders`).then(r => setPOs(r.data.purchaseOrders || [])).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleTransfer = async (s: any) => {
    await axios.post(`${API}/transfer`, s);
    setMsg(`✅ Transferred ${s.qty} ${s.item} from ${s.from} to ${s.to}`);
    load();
  };

  const handlePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/purchase-order`, { ...poForm, items: poForm.items.split(',').map(i => i.trim()) });
      setMsg('✅ Purchase Order created');
      load();
    } catch { setMsg('❌ Error creating PO'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📦 Real-Time Supply Chain Network</h1>
        <p className="page-subtitle">Cross-location procurement intelligence · Surplus detection · Smart transfers · Supplier scoring · Central procurement</p>
      </div>

      {msg && <div className="alert alert-blue">{msg}</div>}

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        {Object.entries(inventory).map(([loc, stock]: any) => (
          <div className="card" key={loc}>
            <div className="card-title">📍 {loc}</div>
            {Object.entries(stock).map(([item, qty]: any) => (
              <div key={item} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ textTransform: 'capitalize' }}>{item.replace('_', ' ')}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="progress-bar" style={{ width: 80 }}>
                    <div className={`progress-fill ${qty > 80 ? 'progress-green' : qty > 30 ? 'progress-blue' : 'progress-red'}`}
                      style={{ width: `${Math.min(100, qty)}%` }} />
                  </div>
                  <span style={{ fontWeight: 600, minWidth: 30 }}>{qty}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">🔄 Smart Transfer Suggestions</div>
          {suggestions.length === 0
            ? <p style={{ color: '#718096' }}>No transfer suggestions needed.</p>
            : suggestions.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '8px 12px', background: '#1e2a40', borderRadius: 8 }}>
                <span><strong>{s.qty}</strong> {s.item}: {s.from} → {s.to}</span>
                <button className="btn btn-success btn-sm" onClick={() => handleTransfer(s)}>Execute</button>
              </div>
            ))
          }
        </div>

        <div className="card">
          <div className="card-title">🏭 Supplier Reliability Scores</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Supplier</th><th>Reliability</th><th>Avg Delivery</th><th>Price Trend</th></tr></thead>
              <tbody>
                {suppliers.map(s => (
                  <tr key={s.name}>
                    <td>{s.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className={`progress-fill ${s.reliabilityScore >= 85 ? 'progress-green' : 'progress-yellow'}`}
                            style={{ width: `${s.reliabilityScore}%` }} />
                        </div>
                        <span>{s.reliabilityScore}%</span>
                      </div>
                    </td>
                    <td>{s.avgDeliveryDays} days</td>
                    <td><span className={`badge ${s.priceTrend === 'stable' ? 'badge-green' : 'badge-yellow'}`}>{s.priceTrend}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📋 Create Purchase Order</div>
        <form onSubmit={handlePO}>
          <div className="form-group">
            <div className="form-row" style={{ flex: 1 }}>
              <label>Supplier</label>
              <select value={poForm.supplier} onChange={e => setPoForm(f => ({ ...f, supplier: e.target.value }))} required>
                <option value="">Select supplier</option>
                {suppliers.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-row" style={{ flex: 1 }}>
              <label>Delivery Location</label>
              <select value={poForm.location} onChange={e => setPoForm(f => ({ ...f, location: e.target.value }))}>
                {Object.keys(inventory).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-row" style={{ flex: 2 }}>
              <label>Items (comma separated)</label>
              <input value={poForm.items} onChange={e => setPoForm(f => ({ ...f, items: e.target.value }))} placeholder="tomatoes, chicken, flour" required />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">📨 Create PO</button>
        </form>
        {pos.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: 8 }}>Recent Purchase Orders</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>PO ID</th><th>Supplier</th><th>Location</th><th>Items</th><th>Status</th><th>Expected Delivery</th></tr></thead>
                <tbody>
                  {pos.slice(-10).reverse().map(po => (
                    <tr key={po.id}>
                      <td style={{ fontSize: '0.72rem' }}>{po.id}</td>
                      <td>{po.supplier}</td>
                      <td>{po.location}</td>
                      <td>{Array.isArray(po.items) ? po.items.join(', ') : po.items}</td>
                      <td><span className="badge badge-yellow">{po.status}</span></td>
                      <td style={{ fontSize: '0.75rem' }}>{po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplyChainPage;
