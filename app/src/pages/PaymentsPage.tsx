import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/payments';

const PaymentsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [pspConfig, setPspConfig] = useState<any>({});
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chargeForm, setChargeForm] = useState({ amount: '', currency: 'RON', method: 'card', guestId: '', bnpl: false });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    axios.get(`${API}/analytics`).then(r => setAnalytics(r.data)).catch(() => {});
    axios.get(`${API}/psp-config`).then(r => setPspConfig(r.data)).catch(() => {});
    axios.get(`${API}/transactions`).then(r => setTransactions(r.data.transactions || [])).catch(() => {});
  }, []);

  const handleCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/charge`, { ...chargeForm, amount: parseFloat(chargeForm.amount) });
      setMsg(`✅ Payment processed via ${res.data.psp} | TXN: ${res.data.id}`);
      setTransactions(t => [res.data, ...t]);
    } catch (err: any) {
      setMsg(`❌ ${err.response?.data?.error || 'Error'}`);
    }
  };

  const handleGiftCard = async () => {
    const res = await axios.post(`${API}/gift-card`, { amount: 100, currency: 'RON', guestId: 'DEMO' });
    setMsg(`🎁 Gift Card issued: ${res.data.code} | ${res.data.amount} ${res.data.currency}`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">💳 Global Payment Orchestration Engine</h1>
        <p className="page-subtitle">Multi-PSP smart routing · Fraud scoring AI · BNPL · Gift card wallet · Failover PSP</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{analytics?.totalRevenue?.toFixed(0) || 0} RON</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Transactions</div>
          <div className="stat-value">{analytics?.totalTransactions || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Refunds</div>
          <div className="stat-value stat-down">{analytics?.refundCount || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active PSPs</div>
          <div className="stat-value">{Object.keys(pspConfig).length}</div>
        </div>
      </div>

      {msg && <div className="alert alert-blue" style={{ marginBottom: 16 }}>{msg}</div>}

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">Process Payment (Smart Routing)</div>
          <form onSubmit={handleCharge}>
            <div className="form-group">
              <div className="form-row" style={{ flex: 2 }}>
                <label>Amount</label>
                <input type="number" value={chargeForm.amount} onChange={e => setChargeForm(f => ({ ...f, amount: e.target.value }))} required />
              </div>
              <div className="form-row" style={{ flex: 1 }}>
                <label>Currency</label>
                <select value={chargeForm.currency} onChange={e => setChargeForm(f => ({ ...f, currency: e.target.value }))}>
                  <option>RON</option><option>EUR</option><option>USD</option><option>GBP</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <div className="form-row" style={{ flex: 1 }}>
                <label>Method</label>
                <select value={chargeForm.method} onChange={e => setChargeForm(f => ({ ...f, method: e.target.value }))}>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="wallet">Digital Wallet</option>
                </select>
              </div>
              <div className="form-row" style={{ flex: 2 }}>
                <label>Guest ID (optional)</label>
                <input value={chargeForm.guestId} onChange={e => setChargeForm(f => ({ ...f, guestId: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <label>
                <input type="checkbox" checked={chargeForm.bnpl} onChange={e => setChargeForm(f => ({ ...f, bnpl: e.target.checked }))} style={{ width: 'auto', marginRight: 8 }} />
                BNPL (Buy Now Pay Later)
              </label>
            </div>
            <div className="form-group">
              <button className="btn btn-primary" type="submit">⚡ Process Payment</button>
              <button className="btn btn-outline" type="button" onClick={handleGiftCard}>🎁 Issue Gift Card</button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-title">PSP Configuration & Smart Routing</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>PSP</th><th>Fee %</th><th>Priority</th><th>Status</th></tr></thead>
              <tbody>
                {Object.entries(pspConfig).map(([name, cfg]: any) => (
                  <tr key={name}>
                    <td style={{ fontWeight: 600 }}>{name.toUpperCase()}</td>
                    <td>{(cfg.fee * 100).toFixed(1)}%</td>
                    <td>{cfg.priority}</td>
                    <td><span className={`badge ${cfg.enabled ? 'badge-green' : 'badge-red'}`}>{cfg.enabled ? 'ACTIVE' : 'DISABLED'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {analytics?.pspStats && (
            <div style={{ marginTop: 12 }}>
              <div className="card-title" style={{ fontSize: '0.85rem', marginBottom: 8 }}>PSP Usage Stats</div>
              {Object.entries(analytics.pspStats).map(([psp, stats]: any) => (
                <div key={psp} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                  <span>{psp}</span>
                  <span>{stats.count} txns | {stats.total.toFixed(0)} RON | Fees: {stats.fees.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Recent Transactions</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Amount</th><th>Currency</th><th>PSP</th><th>Method</th><th>Fraud Score</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              {transactions.slice(0, 15).map((t, i) => (
                <tr key={t.id || i}>
                  <td style={{ fontSize: '0.72rem', color: '#718096' }}>{t.id}</td>
                  <td>{t.amount}</td>
                  <td>{t.currency}</td>
                  <td>{t.psp || '-'}</td>
                  <td>{t.method}</td>
                  <td><span className={`badge ${(t.fraudScore || 0) >= 50 ? 'badge-red' : 'badge-green'}`}>{t.fraudScore || 0}</span></td>
                  <td><span className={`badge ${t.status === 'COMPLETED' ? 'badge-green' : t.status === 'REFUNDED' ? 'badge-yellow' : 'badge-gray'}`}>{t.status}</span></td>
                  <td style={{ fontSize: '0.75rem' }}>{t.ts ? new Date(t.ts).toLocaleTimeString() : '-'}</td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: '#718096' }}>No transactions yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
