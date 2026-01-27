import { useEffect } from "react";
import { useVatRates } from "./useVatRates";
import VatRatesGrid from "./VatRatesGrid";
import VatRateForm from "./VatRateForm";

export default function VatRatesPage() {
  const { rates, loading, error, addRate, saveRate, removeRate, reload } = useVatRates();

  useEffect(() => {
    // could preload additional data if needed
  }, []);

  return (
    <div className="page space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="page-title">Setări TVA & Fiscalitate</h1>
        <button className="btn btn-ghost" onClick={reload}>⟳ Reîmprospătează</button>
      </header>

      <VatRateForm onSubmit={addRate} />

      {error ? <div className="text-red-600 text-sm">{error}</div> : null}
      {loading ? <div>Se încarcă...</div> : <VatRatesGrid rates={rates} onSave={saveRate} onDelete={removeRate} />}
    </div>
  );
}


