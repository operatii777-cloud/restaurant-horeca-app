import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/risk';

const RiskPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [fraud, setFraud] = useState<any>(null);
  const [shrinkage, setShrinkage] = useState<any>(null);
  const [collusion, setCollusion] = useState<any[]>([]);
  const [fakeReservations, setFakeReservations] = useState<any>(null);
  const [eventForm, setEventForm] = useState({ type: 'REFUND', amount: '', employeeId: '', location: 'LocationA', description: '' });
  const [msg, setMsg] = useState('');

  const load = () => {
    axios.get(`${API}/summary`).then(r => setSummary(r.data)).catch(() => {});
    axios.get(`${API}/events`).then(r => setEvents(r.data.events || [])).catch(() => {});
    axios.get(`${API}/fraud-detection`).then(r => setFraud(r.data)).catch(() => {});
    axios.get(`${API}/shrinkage`).then(r => setShrinkage(r.data)).catch(() => {});
    axios.get(`${API}/collusion`).then(r => setCollusion(r.data.patterns || [])).catch(() => {});
    axios.get(`${API}/fake-reservations`).then(r => setFakeReservations(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const reportEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`${API}/events`, { ...eventForm, amount: parseFloat(eventForm.amount) });
    setMsg(`✅ Risk event reported`);
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🔒 Predictive Risk Engine</h1>
        <p className="page-subtitle">Internal fraud detection · Shrinkage monitoring · Staff collusion · Suspicious refund clusters · Fake reservations</p>
      </div>

      {msg && <div className="alert alert-blue">{msg}</div>}
      {summary?.refundSpike && <div className="alert alert-red">🚨 REFUND SPIKE DETECTED</div>}
      {summary?.voidSpike && <div className="alert alert-yellow">⚡ VOID SPIKE DETECTED</div>}

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Overall Risk</div>
          <div className={`stat-value ${summary?.overallRiskLevel === 'HIGH' ? 'stat-down' : summary?.overallRiskLevel === 'MEDIUM' ? '' : 'stat-up'}`}>
            {summary?.overallRiskLevel || '-'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Events</div>
          <div className="stat-value">{summary?.totalEvents || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">High Risk Events</div>
          <div className="stat-value stat-down">{summary?.highRiskEvents || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Suspects</div>
          <div className="stat-value stat-down">{fraud?.suspects?.length || 0}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">🔍 Fraud Detection — Suspect Employees</div>
          {(fraud?.suspects || []).length === 0
            ? <p style={{ color: '#48bb78' }}>✅ No fraud suspects detected</p>
            : fraud.suspects.map((s: any) => (
              <div key={s.employeeId} className={`alert ${s.riskLevel === 'HIGH' ? 'alert-red' : 'alert-yellow'}`} style={{ marginBottom: 8 }}>
                <strong>{s.employeeId}</strong> — {s.refunds} refunds · {s.voids} voids · {s.discounts} discounts
                <span className={`badge ${s.riskLevel === 'HIGH' ? 'badge-red' : 'badge-yellow'}`} style={{ marginLeft: 8 }}>{s.riskLevel}</span>
              </div>
            ))
          }
        </div>

        <div className="card">
          <div className="card-title">📦 Shrinkage Detection</div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: '#718096' }}>Total Shrinkage:</span>
            <strong className="stat-down" style={{ marginLeft: 8, fontSize: '1.2rem' }}>{shrinkage?.totalShrinkage || 0} RON</strong>
            {shrinkage?.alert && <span className="badge badge-red" style={{ marginLeft: 8 }}>ALERT</span>}
          </div>
          {shrinkage?.events?.length === 0
            ? <p style={{ color: '#48bb78' }}>✅ No shrinkage events detected</p>
            : shrinkage?.events?.map((e: any) => (
              <div key={e.id} style={{ padding: '6px 10px', background: '#1e2a40', borderRadius: 6, marginBottom: 4, fontSize: '0.85rem' }}>
                {e.amount} RON — {e.location} — {new Date(e.ts).toLocaleDateString()}
              </div>
            ))
          }
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">🤝 Staff Collusion Patterns</div>
          {collusion.length === 0
            ? <p style={{ color: '#48bb78' }}>✅ No collusion patterns detected</p>
            : collusion.map((p, i) => (
              <div key={i} className="alert alert-yellow">
                <strong>Employees:</strong> {p.employees.join(' + ')}
                <div style={{ fontSize: '0.82rem', marginTop: 4 }}>{p.pattern}</div>
                <span className={`badge badge-yellow`} style={{ marginTop: 4 }}>{p.riskLevel}</span>
              </div>
            ))
          }
        </div>

        <div className="card">
          <div className="card-title">📅 Fake Reservation Detection</div>
          {(fakeReservations?.suspiciousPatterns || []).map((p: any, i: number) => (
            <div key={i} className={`alert ${p.riskLevel === 'HIGH' ? 'alert-red' : 'alert-yellow'}`} style={{ marginBottom: 8 }}>
              {p.pattern} (×{p.count})
              <span className={`badge ${p.riskLevel === 'HIGH' ? 'badge-red' : 'badge-yellow'}`} style={{ marginLeft: 8 }}>{p.riskLevel}</span>
            </div>
          ))}
          <div style={{ color: '#718096', fontSize: '0.82rem' }}>Total flagged: {fakeReservations?.totalFlagged || 0}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📝 Report Risk Event</div>
        <form onSubmit={reportEvent}>
          <div className="form-group">
            <div className="form-row" style={{ flex: 1 }}>
              <label>Type</label>
              <select value={eventForm.type} onChange={e => setEventForm(f => ({ ...f, type: e.target.value }))}>
                {['REFUND', 'VOID', 'DISCOUNT', 'SHRINKAGE', 'FRAUD', 'OTHER'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-row" style={{ flex: 1 }}>
              <label>Amount</label>
              <input type="number" value={eventForm.amount} onChange={e => setEventForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="form-row" style={{ flex: 1 }}>
              <label>Employee ID</label>
              <input value={eventForm.employeeId} onChange={e => setEventForm(f => ({ ...f, employeeId: e.target.value }))} placeholder="EMP-1" />
            </div>
            <div className="form-row" style={{ flex: 2 }}>
              <label>Description</label>
              <input value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">Report Event</button>
        </form>

        <div style={{ marginTop: 16 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Employee</th><th>Location</th><th>Risk</th><th>Time</th></tr></thead>
              <tbody>
                {events.slice(-10).reverse().map(e => (
                  <tr key={e.id}>
                    <td style={{ fontSize: '0.72rem' }}>{e.id}</td>
                    <td>{e.type}</td>
                    <td>{e.amount} RON</td>
                    <td>{e.employeeId || '-'}</td>
                    <td>{e.location}</td>
                    <td><span className={`risk-${e.riskLevel}`}>{e.riskLevel}</span></td>
                    <td style={{ fontSize: '0.75rem' }}>{new Date(e.ts).toLocaleString()}</td>
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

export default RiskPage;
