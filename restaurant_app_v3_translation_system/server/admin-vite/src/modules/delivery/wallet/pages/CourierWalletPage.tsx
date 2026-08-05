import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';

interface WalletRow {
  id: number;
  courier_id: number;
  courier_name?: string;
  balance: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
  updated_at: string;
}

interface CashbackRule {
  id: number;
  name: string;
  percent: number;
  fixed_amount: number;
  min_delivery_fee: number;
  is_active: number;
}

export const CourierWalletPage: React.FC = () => {
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [rules, setRules] = useState<CashbackRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourier, setSelectedCourier] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [creditAmount, setCreditAmount] = useState('5');
  const [ruleForm, setRuleForm] = useState({ name: 'Cashback standard', percent: '5', fixed_amount: '0', min_delivery_fee: '0' });

  const load = async () => {
    setLoading(true);
    try {
      const [wRes, rRes] = await Promise.all([
        fetch('/api/courier-wallet'),
        fetch('/api/courier-wallet/rules'),
      ]);
      const wData = await wRes.json();
      const rData = await rRes.json();
      if (wData.success) setWallets(wData.data || []);
      if (rData.success) setRules(rData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (courierId: number) => {
    setSelectedCourier(courierId);
    const res = await fetch(`/api/courier-wallet/${courierId}`);
    const data = await res.json();
    if (data.success) setTransactions(data.data.transactions || []);
  };

  const credit = async () => {
    if (!selectedCourier) return;
    const res = await fetch(`/api/courier-wallet/${selectedCourier}/credit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(creditAmount), description: 'Credit manual admin' }),
    });
    const data = await res.json();
    if (!data.success) alert(data.error || 'Eroare credit');
    await load();
    await loadDetail(selectedCourier);
  };

  const createRule = async () => {
    const res = await fetch('/api/courier-wallet/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: ruleForm.name,
        percent: Number(ruleForm.percent),
        fixed_amount: Number(ruleForm.fixed_amount),
        min_delivery_fee: Number(ruleForm.min_delivery_fee),
        is_active: 1,
      }),
    });
    const data = await res.json();
    if (!data.success) alert(data.error || 'Eroare regulă');
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="padding-20">
      <PageHeader title="Wallet cashback curieri" description="Solduri, tranzacții și reguli cashback" />

      <div className="row mb-4">
        <div className="col-md-7">
          <h5>Wallet-uri</h5>
          {loading ? (
            <p>Se încarcă...</p>
          ) : (
            <table className="table table-sm table-striped">
              <thead>
                <tr>
                  <th>Curier</th>
                  <th>Sold</th>
                  <th>Câștigat</th>
                  <th>Redeem</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((w) => (
                  <tr key={w.id}>
                    <td>{w.courier_name || `#${w.courier_id}`}</td>
                    <td>{Number(w.balance).toFixed(2)} RON</td>
                    <td>{Number(w.lifetime_earned).toFixed(2)}</td>
                    <td>{Number(w.lifetime_redeemed).toFixed(2)}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => loadDetail(w.courier_id)}>
                        Detalii
                      </button>
                    </td>
                  </tr>
                ))}
                {wallets.length === 0 && (
                  <tr>
                    <td colSpan={5}>Niciun wallet încă. Se creează la primul credit/cashback.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="col-md-5">
          <h5>Reguli cashback</h5>
          <ul className="list-group mb-3">
            {rules.map((r) => (
              <li key={r.id} className="list-group-item d-flex justify-content-between">
                <span>
                  {r.name} — {r.percent}% + {r.fixed_amount} RON
                  {!r.is_active ? ' (inactiv)' : ''}
                </span>
              </li>
            ))}
            {rules.length === 0 && <li className="list-group-item">Nicio regulă. Creează una mai jos.</li>}
          </ul>
          <div className="card p-3">
            <div className="mb-2">
              <input className="form-control" placeholder="Nume" value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} />
            </div>
            <div className="row g-2 mb-2">
              <div className="col">
                <input className="form-control" placeholder="%" value={ruleForm.percent} onChange={(e) => setRuleForm({ ...ruleForm, percent: e.target.value })} />
              </div>
              <div className="col">
                <input className="form-control" placeholder="Fix RON" value={ruleForm.fixed_amount} onChange={(e) => setRuleForm({ ...ruleForm, fixed_amount: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-success btn-sm" onClick={createRule}>
              Adaugă regulă
            </button>
          </div>
        </div>
      </div>

      {selectedCourier && (
        <div className="card p-3">
          <h5>Curier #{selectedCourier}</h5>
          <div className="d-flex gap-2 mb-3 align-items-center">
            <input className="form-control" style={{ maxWidth: 120 }} value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} />
            <button className="btn btn-primary btn-sm" onClick={credit}>
              Credit manual
            </button>
          </div>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Tip</th>
                <th>Sumă</th>
                <th>Sold după</th>
                <th>Descriere</th>
                <th>Când</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.type}</td>
                  <td>{Number(t.amount).toFixed(2)}</td>
                  <td>{Number(t.balance_after).toFixed(2)}</td>
                  <td>{t.description}</td>
                  <td>{t.created_at ? new Date(t.created_at).toLocaleString('ro-RO') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CourierWalletPage;
