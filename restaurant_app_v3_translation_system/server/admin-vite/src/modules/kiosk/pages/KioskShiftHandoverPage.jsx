import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { checkKioskSession } from '../api/KioskApi';
import { useKioskTheme, ThemeToggleButton } from '../context/KioskThemeContext';

/**
 * Jurnal Tură Complet (Shift Handover)
 * Pagină pentru KIOSK - raport de închidere tură
 */
export const KioskShiftHandoverPage = () => {
  const navigate = useNavigate();
  const { theme, isDarkTheme } = useKioskTheme();
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('new');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    shift: 'Dinner',
    notes: '',
    issues: '',
    weather: '',
    staffRating: 5,
    sales: 0,
    checklist: [
      { task: 'Verificare casă de marcat - bani și raport Z', done: false },
      { task: 'Închidere lumini și AC', done: false },
      { task: 'Verificare încuietori și alarmă', done: false },
      { task: 'Curățenie generală efectuată', done: false },
      { task: 'Inventar rapid bar finalizat', done: false },
      { task: 'Comenzi restante predate următorului schimb', done: false }
    ]
  });

  useEffect(() => {
    const kioskSession = checkKioskSession();
    setSession(kioskSession);
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const salesRes = await axios.get('/api/admin/dashboard/metrics');
      if (salesRes.data) {
        setFormData(prev => ({ ...prev, sales: salesRes.data.totalSales || salesRes.data.total || 0 }));
      }
      const historyRes = await axios.get('/api/shift-handover?limit=30');
      if (historyRes.data) setEntries(historyRes.data);
    } catch (error) {
      console.error('Eroare la încărcarea datelor:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.notes) { alert('Adaugă notele de serviciu.'); return; }
    const incompleteChecks = formData.checklist.filter(c => !c.done).length;
    if (incompleteChecks > 0 && !window.confirm(`Ai ${incompleteChecks} task-uri necompletate. Continui?`)) return;

    setSaving(true);
    try {
      await axios.post('/api/shift-handover', {
        date: new Date().toISOString(),
        managerName: session?.username || 'Necunoscut',
        ...formData
      });
      alert('✅ Raportul de tură a fost salvat!');
      setFormData(prev => ({ ...prev, notes: '', issues: '', checklist: prev.checklist.map(c => ({ ...c, done: false })) }));
      loadData();
      setActiveTab('history');
    } catch (error) {
      console.error('Eroare:', error);
      alert('❌ Eroare la salvare.');
    }
    setSaving(false);
  };

  const toggleCheck = (idx) => {
    const newChecklist = [...formData.checklist];
    newChecklist[idx].done = !newChecklist[idx].done;
    setFormData({ ...formData, checklist: newChecklist });
  };

  // Dynamic styles based on theme
  const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: theme.textMuted };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: '14px' };

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/kiosk/tables')} style={{ background: theme.surfaceLight, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold', color: theme.text }}>
            ← Înapoi
          </button>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: theme.text, margin: 0 }}>📓 Jurnal Tură</h1>
            <p style={{ color: theme.textMuted, margin: '4px 0 0 0' }}>Documentează și predă tura</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <ThemeToggleButton size="lg" />
          <button onClick={() => setActiveTab('new')} style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: activeTab === 'new' ? theme.accent : theme.surface, color: activeTab === 'new' ? '#fff' : theme.textMuted }}>➕ Raport Nou</button>
          <button onClick={() => setActiveTab('history')} style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: activeTab === 'history' ? theme.accent : theme.surface, color: activeTab === 'history' ? '#fff' : theme.textMuted }}>📚 Istoric</button>
        </div>
      </div>

      {activeTab === 'new' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', maxWidth: '1200px' }}>
          {/* Coloana principală */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Tura</label>
                <select value={formData.shift} onChange={e => setFormData({ ...formData, shift: e.target.value })} style={inputStyle}>
                  <option value="Breakfast">☀️ Breakfast</option>
                  <option value="Lunch">🌤️ Lunch</option>
                  <option value="Dinner">🌙 Dinner</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Vânzări (până acum)</label>
                <input type="text" value={`${formData.sales.toLocaleString('ro-RO')} RON`} disabled style={{ ...inputStyle, backgroundColor: '#f8fafc' }} />
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>✅ Sumar Service (Ce a mers bine)</label>
              <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="VIP-uri servite, feedback pozitiv..." style={{ ...inputStyle, height: '100px', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ ...labelStyle, color: '#dc2626' }}>⚠️ Probleme / Plângeri</label>
              <textarea value={formData.issues} onChange={e => setFormData({ ...formData, issues: e.target.value })} placeholder="Clienți nemulțumiți, echipamente stricate..." style={{ ...inputStyle, height: '100px', resize: 'vertical', backgroundColor: '#fef2f2' }} />
            </div>
          </div>

          {/* Coloana laterală */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Checklist */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>☑️ Checklist Închidere</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formData.checklist.map((item, idx) => (
                  <div key={idx} onClick={() => toggleCheck(idx)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '8px', backgroundColor: item.done ? '#f0fdf4' : 'transparent' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: item.done ? 'none' : '2px solid #cbd5e1', backgroundColor: item.done ? '#22c55e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px' }}>{item.done && '✓'}</div>
                    <span style={{ color: item.done ? '#9ca3af' : '#1e293b', textDecoration: item.done ? 'line-through' : 'none', fontSize: '14px' }}>{item.task}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}><span>Progres</span><span>{formData.checklist.filter(c => c.done).length}/{formData.checklist.length}</span></div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: '#22c55e', width: `${(formData.checklist.filter(c => c.done).length / formData.checklist.length) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Rating */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <label style={labelStyle}>⭐ Rating Echipă</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setFormData({ ...formData, staffRating: s })} style={{ width: '48px', height: '48px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', backgroundColor: s <= formData.staffRating ? '#fbbf24' : '#f1f5f9', color: s <= formData.staffRating ? '#fff' : '#94a3b8' }}>{s}</button>
                ))}
              </div>
            </div>

            <button onClick={handleSubmit} disabled={saving} style={{ padding: '16px', backgroundColor: saving ? '#94a3b8' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? '⏳ Se salvează...' : '💾 Salvează Jurnal'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {loading ? (<div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>⏳ Se încarcă...</div>) : entries.length === 0 ? (<div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>📭 Nu există înregistrări</div>) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={thStyle}>Data</th><th style={thStyle}>Tura</th><th style={thStyle}>Manager</th><th style={thStyle}>Vânzări</th><th style={thStyle}>Rating</th><th style={thStyle}>Note</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}>{new Date(entry.date).toLocaleDateString('ro-RO')}</td>
                    <td style={tdStyle}>{entry.shift}</td>
                    <td style={tdStyle}>{entry.managerName}</td>
                    <td style={tdStyle}>{entry.sales?.toLocaleString('ro-RO')} RON</td>
                    <td style={tdStyle}>{'⭐'.repeat(entry.staffRating || 0)}</td>
                    <td style={{ ...tdStyle, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default KioskShiftHandoverPage;
