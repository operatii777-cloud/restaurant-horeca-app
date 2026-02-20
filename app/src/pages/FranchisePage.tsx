import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/franchise';

const FranchisePage: React.FC = () => {
  const [franchises, setFranchises] = useState<any[]>([]);
  const [royalties, setRoyalties] = useState<any>(null);
  const [compliance, setCompliance] = useState<any[]>([]);
  const [kpiResults, setKpiResults] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [mysteryShopper, setMysteryShopper] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  const load = () => {
    axios.get(`${API}/list`).then(r => setFranchises(r.data.franchises || [])).catch(() => {});
    axios.get(`${API}/royalties/calculate`).then(r => setRoyalties(r.data)).catch(() => {});
    axios.get(`${API}/compliance/scores`).then(r => setCompliance(r.data.scores || [])).catch(() => {});
    axios.get(`${API}/kpi/penalties`).then(r => setKpiResults(r.data.results || [])).catch(() => {});
    axios.get(`${API}/audits/list`).then(r => setAudits(r.data.audits || [])).catch(() => {});
    axios.get(`${API}/mystery-shopper`).then(r => setMysteryShopper(r.data.mysteryShopperVisits || [])).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const payRoyalty = async (id: string) => {
    await axios.post(`${API}/royalties/${id}/pay`);
    setMsg('✅ Royalty marked as paid');
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🏪 Franchise Domination System</h1>
        <p className="page-subtitle">Royalty auto-calc · Compliance scoring · Brand enforcement · Audit automation · Mystery shopper · KPI rewards</p>
      </div>

      {msg && <div className="alert alert-blue">{msg}</div>}

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Franchises</div>
          <div className="stat-value">{franchises.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Royalties Due</div>
          <div className="stat-value">{royalties?.totalDue || 0} RON</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Compliant</div>
          <div className="stat-value stat-up">{compliance.filter(c => c.status === 'COMPLIANT').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Non-Compliant</div>
          <div className="stat-value stat-down">{compliance.filter(c => c.status === 'NON_COMPLIANT').length}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">💰 Royalty Auto-Calculation</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Franchise</th><th>Revenue</th><th>Rate</th><th>Due</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {(royalties?.royalties || []).map((r: any) => (
                  <tr key={r.franchiseId}>
                    <td>{r.name}</td>
                    <td>{r.revenue.toLocaleString()}</td>
                    <td>{(r.royaltyRate * 100).toFixed(0)}%</td>
                    <td style={{ fontWeight: 600 }}>{r.royaltyAmount} RON</td>
                    <td><span className={`badge ${r.paid ? 'badge-green' : 'badge-yellow'}`}>{r.paid ? 'PAID' : 'PENDING'}</span></td>
                    <td>
                      {!r.paid && <button className="btn btn-success btn-sm" onClick={() => payRoyalty(r.franchiseId)}>Pay</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title">✅ Compliance Scores</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Franchise</th><th>City</th><th>Score</th><th>KPI</th><th>Violations</th><th>Status</th></tr></thead>
              <tbody>
                {compliance.map(c => (
                  <tr key={c.franchiseId}>
                    <td>{c.name}</td>
                    <td>{c.city}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className={`progress-fill ${c.complianceScore >= 80 ? 'progress-green' : c.complianceScore >= 60 ? 'progress-yellow' : 'progress-red'}`}
                            style={{ width: `${c.complianceScore}%` }} />
                        </div>
                        <span>{c.complianceScore}</span>
                      </div>
                    </td>
                    <td>{c.kpiScore}</td>
                    <td>{c.violations}</td>
                    <td><span className={`badge ${c.status === 'COMPLIANT' ? 'badge-green' : c.status === 'WARNING' ? 'badge-yellow' : 'badge-red'}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">🎯 KPI Penalties & Rewards</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Franchise</th><th>KPI Score</th><th>Penalty</th><th>Reward</th></tr></thead>
              <tbody>
                {kpiResults.map(r => (
                  <tr key={r.franchiseId}>
                    <td>{r.name}</td>
                    <td>{r.kpiScore}</td>
                    <td className="stat-down">{parseFloat(r.penalty) > 0 ? `-${r.penalty} RON` : '-'}</td>
                    <td className="stat-up">{parseFloat(r.reward) > 0 ? `+${r.reward} RON` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title">🕵️ Mystery Shopper Reports</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Franchise</th><th>Last Visit</th><th>Score</th><th>Areas</th></tr></thead>
              <tbody>
                {mysteryShopper.map(v => (
                  <tr key={v.franchiseId}>
                    <td>{v.name}</td>
                    <td style={{ fontSize: '0.78rem' }}>{new Date(v.lastVisit).toLocaleDateString()}</td>
                    <td><span className={`badge ${v.score >= 80 ? 'badge-green' : v.score >= 60 ? 'badge-yellow' : 'badge-red'}`}>{v.score}</span></td>
                    <td style={{ fontSize: '0.75rem', color: '#718096' }}>{v.areas?.join(', ')}</td>
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

export default FranchisePage;
