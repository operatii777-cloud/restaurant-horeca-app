import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/guests';

const GuestIdentityPage: React.FC = () => {
  const [guests, setGuests] = useState<any[]>([]);
  const [form, setForm] = useState({ email: '', name: '', phone: '', brand: '', country: 'RO', gdprConsent: false });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const loadGuests = () => {
    axios.get(API).then(r => setGuests(r.data.guests || [])).catch(() => {});
  };

  useEffect(() => { loadGuests(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(API, form);
      setMsg('Guest created/updated successfully');
      setForm({ email: '', name: '', phone: '', brand: '', country: 'RO', gdprConsent: false });
      loadGuests();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Error');
    }
    setLoading(false);
  };

  const handleErase = async (id: string) => {
    if (!window.confirm('GDPR erasure - are you sure?')) return;
    await axios.delete(`${API}/${id}/gdpr`);
    loadGuests();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🪪 Hospitality Digital Identity Layer</h1>
        <p className="page-subtitle">Universal Guest ID · GDPR-aware consent · Unified loyalty wallet · Cross-brand analytics · Lifetime Value · Risk Score</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total Guests</div>
          <div className="stat-value">{guests.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">GDPR Consent</div>
          <div className="stat-value">{guests.filter(g => g.gdprConsent).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">High Risk</div>
          <div className="stat-value stat-down">{guests.filter(g => g.riskScore >= 50).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Multi-Brand</div>
          <div className="stat-value">{guests.filter(g => g.brands?.length > 1).length}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">Create / Lookup Guest (Hospitality Passport)</div>
          {msg && <div className="alert alert-blue" style={{ marginBottom: 12 }}>{msg}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <div className="form-row" style={{ flex: 1 }}>
                <label>Email *</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-row" style={{ flex: 1 }}>
                <label>Full Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <div className="form-row" style={{ flex: 1 }}>
                <label>Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="form-row" style={{ flex: 1 }}>
                <label>Brand</label>
                <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="e.g. PizzaChain" />
              </div>
              <div className="form-row" style={{ flex: 1 }}>
                <label>Country</label>
                <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                  <option>RO</option><option>DE</option><option>FR</option><option>IT</option><option>ES</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <label>
                <input type="checkbox" checked={form.gdprConsent} onChange={e => setForm(f => ({ ...f, gdprConsent: e.target.checked }))} style={{ width: 'auto', marginRight: 8 }} />
                GDPR Consent given
              </label>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : null} Create / Lookup Passport
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-title">Guest Passport Registry</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Email</th><th>Points</th>
                  <th>GDPR</th><th>Risk</th><th>Brands</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {guests.map(g => (
                  <tr key={g.id}>
                    <td style={{ fontSize: '0.72rem', color: '#718096' }}>{g.id}</td>
                    <td>{g.name || '-'}</td>
                    <td>{g.email}</td>
                    <td>{g.loyaltyPoints}</td>
                    <td>
                      <span className={`badge ${g.gdprConsent ? 'badge-green' : 'badge-red'}`}>
                        {g.gdprConsent ? '✓ OK' : '✗ No'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${g.riskScore >= 50 ? 'badge-red' : g.riskScore >= 20 ? 'badge-yellow' : 'badge-green'}`}>
                        {g.riskScore}
                      </span>
                    </td>
                    <td>{(g.brands || []).join(', ')}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleErase(g.id)}>
                        🗑️ Erase
                      </button>
                    </td>
                  </tr>
                ))}
                {guests.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#718096' }}>No guests yet. Create one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestIdentityPage;
