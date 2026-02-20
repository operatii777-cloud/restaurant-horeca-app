import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/financial';

const FinancialPage: React.FC = () => {
  const [pl, setPl] = useState<any>(null);
  const [weekly, setWeekly] = useState<any>(null);
  const [cashRecon, setCashRecon] = useState<any>(null);
  const [cogs, setCogs] = useState<any>(null);
  const [ebitda, setEbitda] = useState<any>(null);
  const [tax, setTax] = useState<any>(null);
  const [accruals, setAccruals] = useState<any>(null);

  useEffect(() => {
    axios.get(`${API}/pl`).then(r => setPl(r.data)).catch(() => {});
    axios.get(`${API}/pl/weekly`).then(r => setWeekly(r.data)).catch(() => {});
    axios.get(`${API}/cash-reconciliation`).then(r => setCashRecon(r.data)).catch(() => {});
    axios.get(`${API}/cogs`).then(r => setCogs(r.data)).catch(() => {});
    axios.get(`${API}/ebitda-projection`).then(r => setEbitda(r.data)).catch(() => {});
    axios.get(`${API}/tax-forecast`).then(r => setTax(r.data)).catch(() => {});
    axios.get(`${API}/accruals`).then(r => setAccruals(r.data)).catch(() => {});
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">💰 Financial Control Layer — CFO Mode</h1>
        <p className="page-subtitle">Cash reconciliation AI · Daily P&L · Accrual tracking · COGS live · EBITDA projection · Tax forecast</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Revenue (Weekly)</div>
          <div className="stat-value">{pl?.revenue?.toLocaleString() || '-'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Gross Margin</div>
          <div className="stat-value stat-up">{pl?.grossMargin || '-'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">EBITDA</div>
          <div className="stat-value stat-up">{pl?.ebitda?.toLocaleString() || '-'}</div>
          <div className="stat-sub">{pl?.ebitdaMargin}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net Profit</div>
          <div className="stat-value">{pl?.netProfit?.toLocaleString() || '-'}</div>
          <div className="stat-sub">{pl?.netMargin}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">📊 Daily P&L — Auto Generated</div>
          {pl && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.88rem' }}>
                {[
                  ['Revenue', pl.revenue?.toLocaleString()],
                  ['COGS', pl.cogs?.toLocaleString()],
                  ['Gross Profit', pl.grossProfit?.toLocaleString()],
                  ['Gross Margin', pl.grossMargin],
                  ['Labor', pl.labor?.toLocaleString()],
                  ['Overhead', pl.overhead?.toLocaleString()],
                  ['EBITDA', pl.ebitda?.toLocaleString()],
                  ['EBITDA Margin', pl.ebitdaMargin],
                  ['Net Profit', pl.netProfit?.toLocaleString()],
                  ['Net Margin', pl.netMargin],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: '6px 0', borderBottom: '1px solid #2d3748' }}>
                    <span style={{ color: '#718096' }}>{label}:</span>
                    <span style={{ float: 'right', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">🏦 Cash Reconciliation AI</div>
          {cashRecon && (
            <div>
              <div className={`alert ${cashRecon.status === 'OK' ? 'alert-green' : 'alert-red'}`} style={{ marginBottom: 12 }}>
                🤖 AI: {cashRecon.aiInsight}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.88rem' }}>
                <div><span style={{ color: '#718096' }}>Expected:</span> <strong>{cashRecon.expectedCash} RON</strong></div>
                <div><span style={{ color: '#718096' }}>Actual:</span> <strong>{cashRecon.actualCash} RON</strong></div>
                <div><span style={{ color: '#718096' }}>Discrepancy:</span>
                  <strong className={parseFloat(cashRecon.discrepancy) < 0 ? 'stat-down' : ''}> {cashRecon.discrepancy} RON</strong>
                </div>
                <div><span style={{ color: '#718096' }}>Variance:</span> <strong>{cashRecon.discrepancyPct}</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">📈 EBITDA Projection</div>
          {ebitda && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.88rem', marginBottom: 12 }}>
                <div><span style={{ color: '#718096' }}>Monthly:</span> <strong>{ebitda.projectedMonthly?.toLocaleString()} RON</strong></div>
                <div><span style={{ color: '#718096' }}>Annual:</span> <strong>{ebitda.projectedAnnual?.toLocaleString()} RON</strong></div>
                <div><span style={{ color: '#718096' }}>Growth:</span> <strong className="stat-up">{ebitda.growthRate}</strong></div>
                <div><span style={{ color: '#718096' }}>Trend:</span> <strong className="stat-up">{ebitda.trend}</strong></div>
              </div>
              <div className="card-title" style={{ fontSize: '0.82rem', marginBottom: 6 }}>Annual Scenarios</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {Object.entries(ebitda.scenarios || {}).map(([k, v]: any) => (
                  <div key={k} style={{ flex: 1, padding: '8px', background: '#1e2a40', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'capitalize' }}>{k}</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{parseInt(v).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">🧾 Tax Liability Forecast</div>
          {tax && (
            <div style={{ fontSize: '0.88rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><span style={{ color: '#718096' }}>Annual Revenue:</span> <strong>{parseInt(tax.annualRevenue).toLocaleString()}</strong></div>
                <div><span style={{ color: '#718096' }}>VAT Rate:</span> <strong>{tax.vatRate}</strong></div>
                <div><span style={{ color: '#718096' }}>VAT Liability:</span> <strong>{parseInt(tax.vatLiability).toLocaleString()}</strong></div>
                <div><span style={{ color: '#718096' }}>Corporate Tax:</span> <strong>{parseInt(tax.corporateTax).toLocaleString()}</strong></div>
              </div>
              <div style={{ marginTop: 12, padding: '10px', background: '#742a2a', borderRadius: 8 }}>
                <div style={{ fontSize: '0.75rem', color: '#fc8181' }}>TOTAL TAX LIABILITY</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fc8181' }}>{parseInt(tax.totalTaxLiability).toLocaleString()} RON</div>
                <div style={{ fontSize: '0.78rem', color: '#a0aec0', marginTop: 4 }}>Next payment: {tax.nextPaymentDue}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">📉 COGS Live Tracking</div>
          {cogs && (
            <div>
              <div style={{ marginBottom: 12, fontSize: '0.82rem', color: '#718096' }}>Daily Revenue: <strong style={{ color: '#fff' }}>{cogs.totalRevenue?.toLocaleString()} RON</strong></div>
              {(cogs.categories || []).map((c: any) => (
                <div key={c.category} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem' }}>
                    <span>{c.category}</span>
                    <span style={{ color: c.alert ? '#fc8181' : '#48bb78' }}>
                      {(c.revenueShare * 100).toFixed(0)}% (target: {(c.target * 100).toFixed(0)}%)
                      {c.alert && ' ⚠️'}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${c.alert ? 'progress-red' : 'progress-green'}`}
                      style={{ width: `${Math.min(100, c.revenueShare * 100 / c.target * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">📋 Accrual Tracking</div>
          {(accruals?.accruals || []).map((a: any, i: number) => (
            <div key={i} style={{ padding: '10px 12px', background: '#1e2a40', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{a.item}</span>
                <span style={{ fontWeight: 700, color: '#fc8181' }}>{a.amount.toLocaleString()} RON</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.78rem', color: '#718096' }}>
                <span>Due: {a.dueDate}</span>
                <span className={`badge badge-yellow`}>{a.status}</span>
              </div>
            </div>
          ))}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #2d3748', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#718096' }}>Total Accrued:</span>
            <span style={{ fontWeight: 700, color: '#fc8181' }}>{accruals?.totalAccrued?.toLocaleString()} RON</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialPage;
