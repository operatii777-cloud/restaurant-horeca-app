import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/war-room';

const WarRoomPage: React.FC = () => {
  const [live, setLive] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [locations, setLocations] = useState<any>({});
  const [orderForm, setOrderForm] = useState({ location: 'LocationA', tableNumber: '', channel: 'POS' });
  const intervalRef = useRef<any>(null);

  const refresh = () => {
    axios.get(`${API}/live`).then(r => {
      setLive(r.data.metrics);
      setAlerts(r.data.activeAlerts || []);
    }).catch(() => {});
    axios.get(`${API}/orders`).then(r => setOrders(r.data.orders || [])).catch(() => {});
    axios.get(`${API}/locations`).then(r => setLocations(r.data.locations || {})).catch(() => {});
  };

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`${API}/orders`, { ...orderForm, items: [{ name: 'Demo Item', qty: 1 }] });
    refresh();
  };

  const updateStatus = async (id: string, status: string) => {
    await axios.put(`${API}/orders/${id}/status`, { status });
    refresh();
  };

  const triggerAlert = async () => {
    await axios.post(`${API}/alerts/trigger`, { type: 'MANUAL_TEST', message: 'Manual test alert from War Room', severity: 'MEDIUM' });
    refresh();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">🖥️ Live Operation Control Center — HQ War Room</h1>
            <p className="page-subtitle">Real-time orders · Kitchen delays · Auto alerts · SLA delivery · 200 locations live</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-green">🟢 LIVE</span>
            <button className="btn btn-outline btn-sm" onClick={triggerAlert}>🚨 Test Alert</button>
          </div>
        </div>
      </div>

      {alerts.filter(a => a.severity === 'HIGH').map((a, i) => (
        <div key={i} className="alert alert-red">⚠️ <strong>{a.type}</strong>: {a.message}</div>
      ))}
      {alerts.filter(a => a.severity === 'MEDIUM').map((a, i) => (
        <div key={i} className="alert alert-yellow">⚡ <strong>{a.type}</strong>: {a.message}</div>
      ))}

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Active Orders</div>
          <div className="stat-value">{live?.activeOrders || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Prep Time</div>
          <div className="stat-value">{live?.avgPrepTime || 0} min</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Delivery SLA</div>
          <div className="stat-value stat-up">{live?.deliverySLA || 0}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Revenue Today</div>
          <div className="stat-value">{(live?.revenueToday || 0).toLocaleString()} RON</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">📍 All Locations — Live Overview</div>
        <div className="grid grid-3">
          {Object.entries(locations).map(([loc, data]: any) => (
            <div key={loc} style={{ padding: '12px 16px', background: '#1e2a40', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{loc}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.82rem' }}>
                <div><span style={{ color: '#718096' }}>Orders:</span> <strong>{data.activeOrders}</strong></div>
                <div><span style={{ color: '#718096' }}>Revenue:</span> <strong>{data.revenue?.toLocaleString()}</strong></div>
                <div><span style={{ color: '#718096' }}>Prep:</span> <strong>{data.avgPrepTime}m</strong></div>
                <div><span style={{ color: '#718096' }}>Staff:</span> <strong>{data.staffOnDuty}</strong></div>
              </div>
              {data.criticalStock && <div className="badge badge-red" style={{ marginTop: 6 }}>⚠️ Critical Stock</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">➕ Create New Order</div>
          <form onSubmit={placeOrder}>
            <div className="form-group">
              <div className="form-row" style={{ flex: 1 }}>
                <label>Location</label>
                <select value={orderForm.location} onChange={e => setOrderForm(f => ({ ...f, location: e.target.value }))}>
                  {Object.keys(locations).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-row" style={{ flex: 1 }}>
                <label>Table</label>
                <input value={orderForm.tableNumber} onChange={e => setOrderForm(f => ({ ...f, tableNumber: e.target.value }))} placeholder="Table #" />
              </div>
              <div className="form-row" style={{ flex: 1 }}>
                <label>Channel</label>
                <select value={orderForm.channel} onChange={e => setOrderForm(f => ({ ...f, channel: e.target.value }))}>
                  <option>POS</option><option>DELIVERY</option><option>KIOSK</option><option>APP</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" type="submit">Create Order</button>
          </form>
        </div>

        <div className="card">
          <div className="card-title">🚨 Recent Alerts</div>
          <div style={{ maxHeight: 160, overflowY: 'auto' }}>
            {alerts.slice(-8).reverse().map((a, i) => (
              <div key={i} style={{ padding: '6px 10px', marginBottom: 4, borderRadius: 6, fontSize: '0.82rem',
                background: a.severity === 'HIGH' ? '#742a2a' : a.severity === 'MEDIUM' ? '#744210' : '#1c4532' }}>
                <span style={{ fontWeight: 600 }}>{a.type}</span>: {a.message}
                <span style={{ float: 'right', color: '#718096' }}>{a.ts ? new Date(a.ts).toLocaleTimeString() : ''}</span>
              </div>
            ))}
            {alerts.length === 0 && <p style={{ color: '#48bb78' }}>✅ No alerts</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📋 Live Order Feed</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order ID</th><th>Location</th><th>Table</th><th>Channel</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.slice(-15).reverse().map(o => (
                <tr key={o.id}>
                  <td style={{ fontSize: '0.72rem' }}>{o.id}</td>
                  <td>{o.location}</td>
                  <td>{o.tableNumber || '-'}</td>
                  <td>{o.channel}</td>
                  <td><span className={`badge ${o.status === 'COMPLETED' ? 'badge-green' : o.status === 'PREPARING' ? 'badge-yellow' : 'badge-blue'}`}>{o.status}</span></td>
                  <td style={{ fontSize: '0.75rem' }}>{new Date(o.createdAt).toLocaleTimeString()}</td>
                  <td>
                    {o.status === 'RECEIVED' && <button className="btn btn-outline btn-sm" onClick={() => updateStatus(o.id, 'PREPARING')}>🍳 Prep</button>}
                    {o.status === 'PREPARING' && <button className="btn btn-success btn-sm" onClick={() => updateStatus(o.id, 'COMPLETED')}>✅ Done</button>}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#718096' }}>No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WarRoomPage;
