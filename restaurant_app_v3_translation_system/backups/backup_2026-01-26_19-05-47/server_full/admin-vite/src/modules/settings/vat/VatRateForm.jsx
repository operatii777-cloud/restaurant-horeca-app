import { useState } from "react";

export default function VatRateForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [code, setCode] = useState("");
  const [isDefaultSales, setIsDefaultSales] = useState(false);
  const [isDefaultPurchases, setIsDefaultPurchases] = useState(false);

  function handleAdd() {
    if (!name || rate === "") return;
    onSubmit?.({
      name,
      code: code || null,
      rate: Number(rate),
      is_default_sales: isDefaultSales,
      is_default_purchases: isDefaultPurchases,
      active: 1,
    });
    setName("");
    setRate("");
    setCode("");
    setIsDefaultSales(false);
    setIsDefaultPurchases(false);
  }

  return (
    <div className="flex flex-wrap gap-2 items-end p-3 border rounded bg-white">
      <div className="flex flex-col">
        <label className="text-sm text-neutral-600">Cod</label>
        <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ex: FOOD11" />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-neutral-600">Denumire</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mâncare / Horeca" />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-neutral-600">Cotă (%)</label>
        <input className="input" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="ex: 5, 9, 19" />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm"><input type="checkbox" checked={isDefaultSales} onChange={(e) => setIsDefaultSales(e.target.checked)} /> Default vânzări</label>
        <label className="text-sm"><input type="checkbox" checked={isDefaultPurchases} onChange={(e) => setIsDefaultPurchases(e.target.checked)} /> Default achiziții</label>
      </div>
      <button className="btn btn-primary" onClick={handleAdd}>Adaugă</button>
    </div>
  );
}


