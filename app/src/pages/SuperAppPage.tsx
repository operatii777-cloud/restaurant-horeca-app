import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/superapp';

const SuperAppPage: React.FC = () => {
  const [guestId, setGuestId] = useState('DEMO-GUEST-001');
  const [loyalty, setLoyalty] = useState<any>(null);
  const [gamification, setGamification] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState('home');
  const [msg, setMsg] = useState('');

  const [resForm, setResForm] = useState({ date: '', time: '19:00', covers: '2', specialRequests: '' });
  const [tipForm, setTipForm] = useState({ amount: '10', message: '' });
  const [reviewForm, setReviewForm] = useState({ rating: '5', comment: '' });

  const load = () => {
    if (!guestId) return;
    axios.get(`${API}/loyalty/${guestId}`).then(r => setLoyalty(r.data)).catch(() => {});
    axios.get(`${API}/gamification/${guestId}`).then(r => setGamification(r.data)).catch(() => {});
    axios.get(`${API}/offers/${guestId}`).then(r => setOffers(r.data.offers || [])).catch(() => {});
    axios.get(`${API}/reservations/${guestId}`).then(r => setReservations(r.data.reservations || [])).catch(() => {});
    axios.get(`${API}/orders/${guestId}`).then(r => setOrders(r.data.orders || [])).catch(() => {});
  };

  useEffect(() => { load(); }, [guestId]);

  const makeReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`${API}/reserve`, { guestId, restaurantId: 'REST-001', ...resForm, covers: parseInt(resForm.covers) });
    setMsg('✅ Reservation confirmed!');
    load();
  };

  const placeOrder = async () => {
    await axios.post(`${API}/order`, { guestId, restaurantId: 'REST-001', items: [{ name: 'Pizza Margherita', price: 42, qty: 1 }], channel: 'APP' });
    setMsg('🍕 Order placed!');
    load();
  };

  const sendTip = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`${API}/tip`, { guestId, staffId: 'EMP-1', amount: parseFloat(tipForm.amount), message: tipForm.message });
    setMsg('💸 Tip sent!');
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`${API}/review`, { guestId, restaurantId: 'REST-001', rating: parseInt(reviewForm.rating), comment: reviewForm.comment });
    setMsg('⭐ Review submitted!');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📱 Hospitality SuperApp Mode</h1>
        <p className="page-subtitle">Reserve · Order · Pay · Loyalty · AI Offers · Review · Tip · Gamification — Everything in one ecosystem</p>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <label style={{ minWidth: 80 }}>Guest ID:</label>
        <input style={{ maxWidth: 250 }} value={guestId} onChange={e => setGuestId(e.target.value)} />
        <button className="btn btn-outline" onClick={load}>Load</button>
      </div>

      {msg && <div className="alert alert-blue">{msg}</div>}

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {['home', 'reserve', 'order', 'loyalty', 'offers', 'review', 'tip', 'gamification'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>
            {{ home: '🏠', reserve: '📅', order: '🍽️', loyalty: '⭐', offers: '🎁', review: '💬', tip: '💸', gamification: '🎮' }[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'home' && loyalty && (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-title">Welcome Back! 👋</div>
            <div style={{ fontSize: '1.1rem', marginBottom: 8 }}>Guest: <strong>{guestId}</strong></div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#718096' }}>Loyalty Points</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f6ad55' }}>{loyalty.points}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#718096' }}>Tier</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: loyalty.tier === 'GOLD' ? '#f6e05e' : loyalty.tier === 'SILVER' ? '#e2e8f0' : '#cd7f32' }}>
                  {loyalty.tier === 'GOLD' ? '🥇' : loyalty.tier === 'SILVER' ? '🥈' : '🥉'} {loyalty.tier}
                </div>
              </div>
            </div>
            {loyalty.nextTierPoints && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: 4 }}>{loyalty.nextTierPoints} points to next tier</div>
                <div className="progress-bar">
                  <div className="progress-fill progress-yellow" style={{ width: `${Math.min(100, 100 - loyalty.nextTierPoints / 10)}%` }} />
                </div>
              </div>
            )}
          </div>
          <div className="card">
            <div className="card-title">🏆 Your Activity</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ padding: '10px', background: '#1e2a40', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{reservations.length}</div>
                <div style={{ fontSize: '0.78rem', color: '#718096' }}>Reservations</div>
              </div>
              <div style={{ padding: '10px', background: '#1e2a40', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{orders.length}</div>
                <div style={{ fontSize: '0.78rem', color: '#718096' }}>Orders</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'reserve' && (
        <div className="card">
          <div className="card-title">📅 Make a Reservation</div>
          <form onSubmit={makeReservation}>
            <div className="form-group">
              <div className="form-row" style={{ flex: 1 }}>
                <label>Date</label>
                <input type="date" value={resForm.date} onChange={e => setResForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="form-row" style={{ flex: 1 }}>
                <label>Time</label>
                <input type="time" value={resForm.time} onChange={e => setResForm(f => ({ ...f, time: e.target.value }))} />
              </div>
              <div className="form-row" style={{ flex: 1 }}>
                <label>Covers</label>
                <input type="number" value={resForm.covers} onChange={e => setResForm(f => ({ ...f, covers: e.target.value }))} min="1" max="20" />
              </div>
            </div>
            <div className="form-row">
              <label>Special Requests</label>
              <input value={resForm.specialRequests} onChange={e => setResForm(f => ({ ...f, specialRequests: e.target.value }))} placeholder="Birthday, allergies, etc." />
            </div>
            <button className="btn btn-primary" type="submit">Confirm Reservation</button>
          </form>
          {reservations.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="card-title" style={{ fontSize: '0.85rem' }}>Your Reservations</div>
              {reservations.map(r => (
                <div key={r.id} style={{ padding: '8px 12px', background: '#1e2a40', borderRadius: 8, marginBottom: 6, fontSize: '0.85rem' }}>
                  📅 {r.date} {r.time} · {r.covers} covers · Code: <strong>{r.confirmationCode}</strong>
                  <span className="badge badge-green" style={{ marginLeft: 8 }}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'order' && (
        <div className="card">
          <div className="card-title">🍽️ Order Food</div>
          <div style={{ padding: '16px', background: '#1e2a40', borderRadius: 8, marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Pizza Margherita</div>
            <div style={{ color: '#718096', fontSize: '0.85rem' }}>Classic tomato sauce, mozzarella, basil</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#48bb78' }}>42 RON</span>
              <button className="btn btn-primary btn-sm" onClick={placeOrder}>Add & Order</button>
            </div>
          </div>
          {orders.length > 0 && (
            <div>
              <div className="card-title" style={{ fontSize: '0.85rem' }}>Recent Orders</div>
              {orders.slice(-5).map(o => (
                <div key={o.id} style={{ padding: '8px 12px', background: '#1e2a40', borderRadius: 8, marginBottom: 6, fontSize: '0.85rem' }}>
                  🍽️ Order {o.id} · {o.total} RON · ~{o.estimatedTime}min
                  <span className="badge badge-yellow" style={{ marginLeft: 8 }}>{o.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'loyalty' && loyalty && (
        <div className="card">
          <div className="card-title">⭐ Rewards Catalog</div>
          {loyalty.rewards?.map((r: any) => (
            <div key={r.id} style={{ padding: '12px', background: '#1e2a40', borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: '0.82rem', color: '#718096' }}>{r.pointsCost} points</div>
              </div>
              <button className={`btn btn-sm ${r.available ? 'btn-success' : 'btn-outline'}`} disabled={!r.available}>
                {r.available ? '🎁 Redeem' : '🔒 Locked'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'offers' && (
        <div className="card">
          <div className="card-title">🤖 AI-Personalized Offers for You</div>
          {offers.map(o => (
            <div key={o.id} style={{ padding: '14px', background: 'linear-gradient(135deg, #1a365d, #1e2a40)', borderRadius: 10, marginBottom: 10, border: '1px solid #2b6cb0' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{o.title}</div>
              {o.discount > 0 && <div style={{ color: '#48bb78', fontWeight: 600 }}>{o.discount * 100}% OFF</div>}
              {o.pointsMultiplier && <div style={{ color: '#f6ad55', fontWeight: 600 }}>×{o.pointsMultiplier} Loyalty Points</div>}
              {o.minSpend > 0 && <div style={{ fontSize: '0.78rem', color: '#718096' }}>Min spend: {o.minSpend} RON</div>}
              <div style={{ fontSize: '0.72rem', color: '#4299e1', marginTop: 4 }}>🤖 AI Generated</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'review' && (
        <div className="card">
          <div className="card-title">💬 Leave a Review</div>
          <form onSubmit={submitReview}>
            <div className="form-row">
              <label>Rating (1-5)</label>
              <input type="number" value={reviewForm.rating} onChange={e => setReviewForm(f => ({ ...f, rating: e.target.value }))} min="1" max="5" required />
            </div>
            <div className="form-row">
              <label>Comment</label>
              <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} rows={3} />
            </div>
            <button className="btn btn-primary" type="submit">Submit Review</button>
          </form>
        </div>
      )}

      {tab === 'tip' && (
        <div className="card">
          <div className="card-title">💸 Send a Tip</div>
          <form onSubmit={sendTip}>
            <div className="form-row">
              <label>Amount (RON)</label>
              <input type="number" value={tipForm.amount} onChange={e => setTipForm(f => ({ ...f, amount: e.target.value }))} min="1" required />
            </div>
            <div className="form-row">
              <label>Message (optional)</label>
              <input value={tipForm.message} onChange={e => setTipForm(f => ({ ...f, message: e.target.value }))} placeholder="Great service!" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {[5, 10, 20, 50].map(a => <button type="button" key={a} className="btn btn-outline btn-sm" onClick={() => setTipForm(f => ({ ...f, amount: String(a) }))}>+{a} RON</button>)}
            </div>
            <button className="btn btn-success" type="submit">💸 Send Tip</button>
          </form>
        </div>
      )}

      {tab === 'gamification' && gamification && (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-title">🎮 Your Game Status</div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#f6ad55' }}>LVL {gamification.level}</div>
              <div style={{ fontSize: '0.85rem', color: '#718096' }}>🔥 {gamification.streak} day streak</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div className="card-title" style={{ fontSize: '0.82rem' }}>🏅 Badges</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(gamification.badges || []).map((b: string, i: number) => (
                  <span key={i} className="badge badge-yellow">{b}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">🎯 Active Challenges</div>
            {(gamification.challenges || []).map((c: any, i: number) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem' }}>
                  <span>{c.name}</span>
                  <span style={{ color: '#f6ad55' }}>{c.reward}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill progress-yellow" style={{ width: `${(c.progress / c.target) * 100}%` }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: 2 }}>{c.progress}/{c.target}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAppPage;
