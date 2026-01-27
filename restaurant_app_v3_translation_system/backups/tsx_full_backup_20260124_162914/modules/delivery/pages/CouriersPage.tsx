// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 🚚 COURIERS MANAGEMENT PAGE
 */

import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import './CouriersPage.css';

interface Courier {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  vehicle_type: string;
  vehicle_number: string;
  status: string;
  rating: number;
  active_deliveries: number;
  today_deliveries: number;
  is_active: number;
}

export const CouriersPage = () => {
//   const { t } = useTranslation();
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourier, setNewCourier] = useState({
    name: '', phone: '', email: '', vehicle_type: 'scooter', vehicle_number: '', commission_rate: 0,
  });

  const loadCouriers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/couriers');
      const data = await res.json();
      if (data.success) setCouriers(data.couriers);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCouriers(); }, []);

  const handleAddCourier = async () => {
    if (!newCourier.name || !newCourier.phone) {
      alert('Nume și telefon obligatorii!');
      return;
    }
    try {
      const res = await fetch('/api/couriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourier),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewCourier({ name: '', phone: '', email: '', vehicle_type: 'scooter', vehicle_number: '', commission_rate: 0 });
        loadCouriers();
        alert(`✅ Curier creat! Cod: ${data.code}`);
      }
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  const handleToggleStatus = async (courier: Courier) => {
    const newStatus = courier.status === 'offline' ? 'online' : 'offline';
    try {
      await fetch(`/api/couriers/${courier.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadCouriers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndShift = async (id: number) => {
    if (!window.confirm('Încheie tura și decontează?')) return;
    try {
      const res = await fetch(`/api/couriers/"Id"/shift/end`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Tură încheiată! Cash: ${data.cash_collected} RON`);
        loadCouriers();
      }
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  const handleDeleteCourier = async (id: number, name: string) => {
    if (!window.confirm(`❌ Ștergi curierul ""Name""?\n\nAceastă acțiune este DEFINITIVĂ!`)) return;
    try {
      const res = await fetch(`/api/couriers/"Id"`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Curier șters cu succes!`);
        loadCouriers();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  const getVehicleIcon = (type: string) => {
    const icons: Record<string, string> = { scooter: '🛵', car: '🚗', bicycle: '🚴', motorcycle: '🏍️', walk: '🚶' };
    return icons[type] || '🚗';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      online: { class: 'online', label: '🟢 Online' },
      offline: { class: 'offline', label: '⚫ Offline' },
      busy: { class: 'busy', label: '🔴 În livrare' },
      break: { class: 'break', label: '🟡 Pauză' },
    };
    return badges[status] || badges.offline;
  };

  return (
    <div className="couriers-page" data-page-ready="true">
      <PageHeader
        title='🚚 gestiune curieri'
        description="Administrează curierii proprii"
        actions={[
          { label: '➕ Adaugă Curier', variant: 'primary', onClick: () => setShowAddModal(true) },
          { label: '🔄 Refresh', variant: 'secondary', onClick: loadCouriers },
        ]}
      />

      <div className="couriers-summary">
        <div className="summary-item"><span className="summary-value">{couriers.length}</span><span className="summary-label">Total</span></div>
        <div className="summary-item online"><span className="summary-value">{couriers.filter(c => c.status === 'online').length}</span><span className="summary-label">Online</span></div>
        <div className="summary-item busy"><span className="summary-value">{couriers.filter(c => c.status === 'busy').length}</span><span className="summary-label">"in livrare"</span></div>
        <div className="summary-item"><span className="summary-value">{couriers.reduce((sum, c) => sum + (c.today_deliveries || 0), 0)}</span><span className="summary-label">"livrari azi"</span></div>
      </div>

      {loading ? (
        <div className="loading">⏳ Se încarcă...</div>
      ) : (
        <div className="couriers-grid">
          {couriers.map((courier) => {
            const badge = getStatusBadge(courier.status);
            return (
              <div key={courier.id} className="courier-card">
                <div className="courier-header">
                  <span className="courier-vehicle">{getVehicleIcon(courier.vehicle_type)}</span>
                  <div className="courier-info">
                    <h3>{courier.name}</h3>
                    <span className="courier-code">{courier.code} • ID: {courier.id}</span>
                  </div>
                  <span className={`status-badge ${badge.class}`}>{badge.label}</span>
                </div>
                <div className="courier-contact">📞 {courier.phone}</div>
                <div className="courier-stats">
                  <div className="stat"><span className="stat-value">{courier.today_deliveries || 0}</span><span className="stat-label">Azi</span></div>
                  <div className="stat"><span className="stat-value">{courier.active_deliveries || 0}</span><span className="stat-label">Active</span></div>
                  <div className="stat"><span className="stat-value">⭐ {courier.rating?.toFixed(1) || '5.0'}</span><span className="stat-label">Rating</span></div>
                </div>
                <div className="courier-actions">
                  <button className={`btn-status ${courier.status === 'offline' ? 'btn-online' : 'btn-offline'}`} onClick={() => handleToggleStatus(courier)}>
                    {courier.status === 'offline' ? '▶️ Start' : '⏹️ Stop'}
                  </button>
                  {courier.status !== 'offline' && (
                    <button className="btn-end-shift" onClick={() => handleEndShift(courier.id)}>💰 Decontează</button>
                  )}
                  {courier.status === 'offline' && (
                    <button className="btn-delete" onClick={() => handleDeleteCourier(courier.id, courier.name)}>🗑️ Șterge</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>➕ Adaugă Curier</h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddCourier(); }}>
              <div className="form-group">
                <label>Nume *</label>
                <input type="text" value={newCourier.name} onChange={(e) => setNewCourier({ ...newCourier, name: e.target.value })} placeholder="ion popescu" />
              </div>

              <div className="form-group">
                <label>Telefon *</label>
                <input type="tel" value={newCourier.phone} onChange={(e) => setNewCourier({ ...newCourier, phone: e.target.value })} placeholder="0722123456" />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" value={newCourier.email} onChange={(e) => setNewCourier({ ...newCourier, email: e.target.value })} placeholder='[ion@emailcom]' />
              </div>

              <div className="form-group">
                <label>"Vehicul"</label>
                <select value={newCourier.vehicle_type} onChange={(e) => setNewCourier({ ...newCourier, vehicle_type: e.target.value })} title="Vehicul">
                  <option value="scooter">🛵 Scooter</option>
                  <option value="motorcycle">🏍️ Motocicletă</option>
                  <option value="car">🚗 Mașină</option>
                  <option value="bicycle">🚴 Bicicletă</option>
                </select>
              </div>

              <div className="form-group">
                <label>"nr vehicul"</label>
                <input type="text" value={newCourier.vehicle_number} onChange={(e) => setNewCourier({ ...newCourier, vehicle_number: e.target.value })} placeholder="B-123-ABC" />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>"Anulează"</button>
                <button type="submit" className="btn-save">💾 Salvează</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouriersPage;



