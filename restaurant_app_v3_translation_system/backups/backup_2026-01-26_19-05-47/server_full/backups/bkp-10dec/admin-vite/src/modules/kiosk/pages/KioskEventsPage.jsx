import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useKioskTheme, ThemeToggleButton } from '../context/KioskThemeContext';

/**
 * Management Evenimente (Nunți, Corporate, Conferințe)
 * Cu Kanban + BEO (Banquet Event Order)
 */
export const KioskEventsPage = () => {
  const navigate = useNavigate();
  const { theme } = useKioskTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBEO, setShowBEO] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const printRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Wedding',
    clientName: '',
    clientPhone: '',
    date: '',
    startTime: '12:00',
    endTime: '20:00',
    pax: 50,
    budgetPerPax: 150,
    depositPaid: 0,
    location: 'Salon Principal',
    notes: '',
    setupDetails: 'Setup standard. Mese rotunde de 10 persoane.'
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/events');
      if (res.data) {
        setEvents(res.data);
      }
    } catch (error) {
      console.error('Eroare la încărcarea evenimentelor:', error);
      // Date demo
      setEvents([
        {
          id: '1', name: 'Nunta Popescu', type: 'Wedding', clientName: 'Ion Popescu',
          clientPhone: '0722 123 456', date: '2025-06-15', startTime: '14:00', endTime: '23:00',
          pax: 120, budgetPerPax: 200, totalBudget: 24000, depositPaid: 5000,
          status: 'Confirmed', beoNumber: 'BEO-2025-001'
        },
        {
          id: '2', name: 'Conferință TechCorp', type: 'Corporate', clientName: 'Maria Tech',
          clientPhone: '0733 456 789', date: '2025-02-20', startTime: '09:00', endTime: '17:00',
          pax: 80, budgetPerPax: 100, totalBudget: 8000, depositPaid: 2000,
          status: 'OfferSent', beoNumber: 'BEO-2025-002'
        }
      ]);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.clientName || !formData.date) {
      alert('Completează numele evenimentului, clientul și data!');
      return;
    }

    const totalBudget = formData.pax * formData.budgetPerPax;
    const newEvent = {
      ...formData,
      id: Date.now().toString(),
      totalBudget,
      status: 'Lead',
      beoNumber: `BEO-${new Date().getFullYear()}-${String(events.length + 1).padStart(3, '0')}`
    };

    try {
      await axios.post('/api/events', newEvent);
    } catch (error) {
      console.warn('API events nu există, salvare locală');
    }

    setEvents([...events, newEvent]);
    setShowModal(false);
    setFormData({
      name: '', type: 'Wedding', clientName: '', clientPhone: '', date: '',
      startTime: '12:00', endTime: '20:00', pax: 50, budgetPerPax: 150,
      depositPaid: 0, location: 'Salon Principal', notes: '',
      setupDetails: 'Setup standard. Mese rotunde de 10 persoane.'
    });
  };

  const updateStatus = async (id, newStatus) => {
    try { await axios.patch(`/api/events/${id}`, { status: newStatus }); } catch {}
    setEvents(events.map(e => e.id === id ? { ...e, status: newStatus } : e));
  };

  const getNextStatus = (current) => {
    const flow = ['Lead', 'OfferSent', 'Confirmed', 'InProgress', 'Completed'];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : current;
  };

  const openBEO = (event) => {
    setSelectedEvent(event);
    setShowBEO(true);
  };

  const KanbanColumn = ({ status, title, icon }) => {
    const items = events.filter(e => e.status === status);
    return (
      <div style={{
        flex: '1 1 280px', minWidth: '280px', background: theme.surface,
        borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column',
        border: `1px solid ${theme.border}`, maxHeight: 'calc(100vh - 250px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: theme.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {icon} {title}
          </h3>
          <span style={{ background: theme.surfaceLight, padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: theme.textMuted }}>{items.length}</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map(ev => (
            <div key={ev.id} onClick={() => openBEO(ev)}
              style={{ background: theme.cardBg, padding: '16px', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, cursor: 'pointer', transition: 'all 0.2s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: theme.text, fontSize: '14px' }}>{ev.name}</span>
                <span style={{ fontSize: '10px', color: theme.textMuted, fontFamily: 'monospace' }}>{new Date(ev.date).toLocaleDateString('ro-RO')}</span>
              </div>
              <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '12px' }}>{ev.clientName} • {ev.pax} Pax</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: `1px solid ${theme.borderLight}` }}>
                <span style={{ fontWeight: 'bold', color: theme.success, fontSize: '14px' }}>{ev.totalBudget?.toLocaleString('ro-RO')} RON</span>
                {status !== 'Completed' && status !== 'Cancelled' && (
                  <button onClick={(e) => { e.stopPropagation(); updateStatus(ev.id, getNextStatus(status)); }}
                    style={{ backgroundColor: 'transparent', border: 'none', color: theme.accent, cursor: 'pointer', padding: '4px 8px' }}>→</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, padding: '24px' }}>
      {/* Header cu buton înapoi */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/kiosk/tables')} 
            style={{ background: theme.surfaceLight, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold', color: theme.text }}>
            ← Înapoi
          </button>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: theme.text, margin: 0 }}>🎉 Management Evenimente</h1>
            <p style={{ color: theme.textMuted, margin: '4px 0 0 0' }}>Nunți, conferințe, catering</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <ThemeToggleButton size="lg" />
          <button onClick={() => setShowModal(true)}
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            ➕ Eveniment Nou
          </button>
        </div>
      </div>

      {/* Kanban */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: theme.textMuted }}>⏳ Se încarcă...</div>
      ) : (
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
          <KanbanColumn status="Lead" title="Solicitări Noi" icon="👥" />
          <KanbanColumn status="OfferSent" title="Ofertă Trimisă" icon="📄" />
          <KanbanColumn status="Confirmed" title="Confirmat" icon="✅" />
          <KanbanColumn status="InProgress" title="În Desfășurare" icon="⏰" />
          <KanbanColumn status="Completed" title="Finalizat" icon="💰" />
        </div>
      )}

      {/* Modal Creare */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowModal(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 24px 0' }}>🎊 Eveniment Nou</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="Nume eveniment" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={inputStyle}>
                <option value="Wedding">💒 Nuntă</option>
                <option value="Corporate">🏢 Corporate</option>
                <option value="Birthday">🎂 Aniversare</option>
                <option value="Conference">🎤 Conferință</option>
              </select>
              <input type="text" placeholder="Client" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} style={inputStyle} />
              <input type="tel" placeholder="Telefon" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} style={inputStyle} />
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={inputStyle} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <input type="number" placeholder="Nr. Pax" value={formData.pax} onChange={e => setFormData({...formData, pax: Number(e.target.value)})} style={{...inputStyle, flex: 1}} />
                <input type="number" placeholder="Buget/Pax" value={formData.budgetPerPax} onChange={e => setFormData({...formData, budgetPerPax: Number(e.target.value)})} style={{...inputStyle, flex: 1}} />
              </div>
              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#15803d' }}>Total Estimat</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669' }}>{(formData.pax * formData.budgetPerPax).toLocaleString('ro-RO')} RON</div>
              </div>
              <button onClick={handleCreate} style={{ backgroundColor: '#1e293b', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                Creează Eveniment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BEO Modal */}
      {showBEO && selectedEvent && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowBEO(false)}>
          <div ref={printRef} style={{ backgroundColor: '#fff', borderRadius: '20px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto', padding: '48px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #1e293b', paddingBottom: '24px', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '4px', margin: 0 }}>Function Sheet</h1>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>{selectedEvent.beoNumber}</p>
              </div>
              <button onClick={() => window.print()} style={{ backgroundColor: '#1e293b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ Print</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
              <div><strong>Eveniment:</strong> {selectedEvent.name}</div>
              <div><strong>Client:</strong> {selectedEvent.clientName}</div>
              <div><strong>Data:</strong> {new Date(selectedEvent.date).toLocaleDateString('ro-RO')}</div>
              <div><strong>Telefon:</strong> {selectedEvent.clientPhone}</div>
              <div><strong>Ora:</strong> {selectedEvent.startTime} - {selectedEvent.endTime}</div>
              <div><strong>Nr. Persoane:</strong> {selectedEvent.pax}</div>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', marginBottom: '32px' }}>
              <h3 style={{ margin: '0 0 16px 0' }}>💰 Detalii Financiare</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Buget/Persoană:</span><span>{selectedEvent.budgetPerPax} RON</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Total:</span><span style={{ fontWeight: 'bold' }}>{selectedEvent.totalBudget?.toLocaleString('ro-RO')} RON</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#059669' }}><span>Avans plătit:</span><span>-{selectedEvent.depositPaid?.toLocaleString('ro-RO')} RON</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', borderTop: '2px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                <span>Rest de plată:</span><span style={{ color: '#dc2626' }}>{((selectedEvent.totalBudget || 0) - (selectedEvent.depositPaid || 0)).toLocaleString('ro-RO')} RON</span>
              </div>
            </div>
            <button onClick={() => setShowBEO(false)} style={{ width: '100%', backgroundColor: '#e2e8f0', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Închide</button>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' };

export default KioskEventsPage;
