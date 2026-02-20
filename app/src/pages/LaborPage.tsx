import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/labor';

const LaborPage: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [overtime, setOvertime] = useState<any[]>([]);
  const [burnout, setBurnout] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [costTracking, setCostTracking] = useState<any>(null);
  const [shiftSuggestions, setShiftSuggestions] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`${API}/staff`).then(r => setStaff(r.data.staff || [])).catch(() => {});
    axios.get(`${API}/forecast`).then(r => setForecast(r.data.forecast?.slice(0, 24) || [])).catch(() => {});
    axios.get(`${API}/overtime-risk`).then(r => setOvertime(r.data.overtimeRisks || [])).catch(() => {});
    axios.get(`${API}/burnout`).then(r => setBurnout(r.data.burnoutRisk || [])).catch(() => {});
    axios.get(`${API}/performance`).then(r => setPerformance(r.data.performance || [])).catch(() => {});
    axios.get(`${API}/cost-tracking`).then(r => setCostTracking(r.data)).catch(() => {});
    axios.get(`${API}/shift-suggestions`).then(r => setShiftSuggestions(r.data.suggestions || [])).catch(() => {});
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">👥 Labor Optimization AI</h1>
        <p className="page-subtitle">15-min traffic forecast · Auto shift suggestions · Overtime risk · Burnout detection · Performance benchmarking</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total Staff</div>
          <div className="stat-value">{staff.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overtime Risk</div>
          <div className="stat-value stat-down">{overtime.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Burnout Risk</div>
          <div className="stat-value stat-down">{burnout.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Labor Cost %</div>
          <div className={`stat-value ${costTracking?.onTarget ? 'stat-up' : 'stat-down'}`}>
            {costTracking?.laborCostPct || '-'}%
          </div>
          <div className="stat-sub">Target: {costTracking?.target || 30}%</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">📊 Traffic Forecast (Next 24h)</div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {forecast.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ width: 55, fontSize: '0.75rem', color: '#718096' }}>
                  {new Date(f.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-fill progress-blue" style={{ width: `${Math.min(100, (f.expectedCovers / 35) * 100)}%` }} />
                </div>
                <span style={{ width: 70, fontSize: '0.78rem', textAlign: 'right' }}>
                  {f.expectedCovers} covers · {f.suggestedStaff} staff
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">🕐 Auto Shift Suggestions</div>
          {shiftSuggestions.map((s, i) => (
            <div key={i} style={{ padding: '10px 12px', background: '#1e2a40', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{s.shift}</div>
              <div style={{ fontSize: '0.82rem', color: '#a0aec0' }}>{s.roles.join(' · ')}</div>
              <div style={{ fontSize: '0.78rem', color: '#718096', marginTop: 4 }}>Staff needed: {s.staffNeeded}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">⚠️ Overtime Risk</div>
          {overtime.length === 0
            ? <p style={{ color: '#48bb78' }}>✅ No overtime risk detected</p>
            : overtime.map((r, i) => (
              <div key={i} className="alert alert-yellow" style={{ marginBottom: 8 }}>
                <strong>{r.employee?.name}</strong> — {r.hoursThisWeek}h this week (+{r.overtimeHours}h overtime)
              </div>
            ))
          }
        </div>

        <div className="card">
          <div className="card-title">🔥 Burnout Detection</div>
          {burnout.length === 0
            ? <p style={{ color: '#48bb78' }}>✅ No burnout risk detected</p>
            : burnout.map((e, i) => (
              <div key={i} className="alert alert-red" style={{ marginBottom: 8 }}>
                <strong>{e.name}</strong> ({e.role}) — {e.hoursThisWeek}h this week
                <span className={`badge badge-red`} style={{ marginLeft: 8 }}>{e.burnoutRisk}</span>
              </div>
            ))
          }
        </div>
      </div>

      <div className="card">
        <div className="card-title">🏆 Staff Performance Benchmarking</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Employee</th><th>Role</th><th>Location</th><th>Score</th><th>Progress</th><th>Benchmark</th></tr></thead>
            <tbody>
              {performance.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.role}</td>
                  <td>{p.location}</td>
                  <td>{p.score}</td>
                  <td>
                    <div className="progress-bar" style={{ width: 100 }}>
                      <div className={`progress-fill ${p.score >= 85 ? 'progress-green' : p.score >= 70 ? 'progress-blue' : 'progress-red'}`}
                        style={{ width: `${p.score}%` }} />
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${p.benchmark === 'TOP' ? 'badge-green' : p.benchmark === 'AVERAGE' ? 'badge-blue' : 'badge-red'}`}>
                      {p.benchmark}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LaborPage;
