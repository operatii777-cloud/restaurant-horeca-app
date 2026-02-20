import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/infrastructure';

const InfrastructurePage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [system, setSystem] = useState<any>(null);
  const [scaling, setScaling] = useState<any>(null);
  const [breakers, setBreakers] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  const refresh = () => {
    axios.get(`${API}/health`).then(r => setHealth(r.data)).catch(() => {});
    axios.get(`${API}/system`).then(r => setSystem(r.data)).catch(() => {});
    axios.get(`${API}/scaling`).then(r => setScaling(r.data)).catch(() => {});
    axios.get(`${API}/circuit-breakers`).then(r => setBreakers(r.data.circuitBreakers || [])).catch(() => {});
  };

  useEffect(() => { refresh(); }, []);

  const restartService = async (name: string) => {
    await axios.post(`${API}/services/${name}/restart`);
    setMsg(`🔄 Restarting ${name}...`);
    setTimeout(refresh, 3500);
  };

  const tripBreaker = async (name: string) => {
    await axios.post(`${API}/circuit-breakers/${name}/trip`);
    setMsg(`⚡ Circuit breaker tripped for ${name}`);
    refresh();
  };

  const resetBreaker = async (name: string) => {
    await axios.post(`${API}/circuit-breakers/${name}/reset`);
    setMsg(`✅ Circuit breaker reset for ${name}`);
    refresh();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🛠️ Self-Healing Infrastructure</h1>
        <p className="page-subtitle">Health checks · Auto-restart · Circuit breakers · Predictive auto-scaling · Cross-region failover</p>
      </div>

      {msg && <div className="alert alert-blue">{msg}</div>}

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">System Status</div>
          <div className={`stat-value ${health?.overall === 'healthy' ? 'stat-up' : 'stat-down'}`}>
            {health?.overall === 'healthy' ? '✅' : '⚠️'} {health?.overall || '...'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Healthy Services</div>
          <div className="stat-value stat-up">
            {health?.services?.filter((s: any) => s.status === 'healthy').length || 0} / {health?.services?.length || 0}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Memory Used</div>
          <div className="stat-value">{system?.memoryUsedPct || '-'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Instances</div>
          <div className="stat-value">{scaling?.currentInstances || '-'}</div>
          <div className="stat-sub">Target CPU: {scaling?.targetCpuPct}%</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">🔧 Services Health</div>
          {(health?.services || []).map((s: any) => (
            <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '8px 12px', background: '#1e2a40', borderRadius: 8 }}>
              <div>
                <span style={{ fontWeight: 600 }}>{s.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#718096', marginLeft: 8 }}>restarts: {s.restarts}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${s.status === 'healthy' ? 'badge-green' : s.status === 'restarting' ? 'badge-yellow' : 'badge-red'}`}>
                  {s.status}
                </span>
                <button className="btn btn-outline btn-sm" onClick={() => restartService(s.name)}>🔄</button>
              </div>
            </div>
          ))}
          <button className="btn btn-primary btn-sm" onClick={refresh} style={{ marginTop: 8 }}>🔍 Run Health Check</button>
        </div>

        <div className="card">
          <div className="card-title">⚡ Circuit Breakers</div>
          {breakers.map(b => (
            <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '8px 12px', background: '#1e2a40', borderRadius: 8 }}>
              <div>
                <span style={{ fontWeight: 600 }}>{b.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#718096', marginLeft: 8 }}>failures: {b.failures}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className={`badge ${b.state === 'CLOSED' ? 'badge-green' : 'badge-red'}`}>{b.state}</span>
                {b.state === 'CLOSED'
                  ? <button className="btn btn-danger btn-sm" onClick={() => tripBreaker(b.name)}>Trip</button>
                  : <button className="btn btn-success btn-sm" onClick={() => resetBreaker(b.name)}>Reset</button>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">📊 System Metrics</div>
          {system && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.88rem' }}>
              <div><span style={{ color: '#718096' }}>Platform:</span> {system.platform}</div>
              <div><span style={{ color: '#718096' }}>CPUs:</span> {system.cpus}</div>
              <div><span style={{ color: '#718096' }}>Memory Total:</span> {system.memoryTotal}</div>
              <div><span style={{ color: '#718096' }}>Memory Free:</span> {system.memoryFree}</div>
              <div><span style={{ color: '#718096' }}>Uptime:</span> {Math.floor(system.uptime / 3600)}h</div>
              <div><span style={{ color: '#718096' }}>Load Avg:</span> {system.loadAvg?.map((l: number) => l.toFixed(2)).join(', ')}</div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">⚖️ Auto-Scaling</div>
          {scaling && (
            <div style={{ fontSize: '0.88rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div><span style={{ color: '#718096' }}>Current CPU:</span> {scaling.currentCpuPct}%</div>
                <div><span style={{ color: '#718096' }}>Policy:</span> {scaling.scalingPolicy}</div>
                <div><span style={{ color: '#718096' }}>Min Instances:</span> {scaling.minInstances}</div>
                <div><span style={{ color: '#718096' }}>Max Instances:</span> {scaling.maxInstances}</div>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${scaling.currentCpuPct > 80 ? 'progress-red' : scaling.currentCpuPct > 60 ? 'progress-yellow' : 'progress-green'}`}
                  style={{ width: `${scaling.currentCpuPct}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#718096', marginTop: 4 }}>
                <span>0%</span>
                <span>Target: {scaling.targetCpuPct}%</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfrastructurePage;
