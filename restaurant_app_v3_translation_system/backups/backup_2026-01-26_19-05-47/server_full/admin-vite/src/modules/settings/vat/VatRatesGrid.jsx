export default function VatRatesGrid({ rates, onSave, onDelete }) {
  return (
    <div className="mt-4">
      <table className="min-w-full border bg-white">
        <thead className="bg-neutral-100">
          <tr>
            <th className="text-left p-2 border-b">ID</th>
            <th className="text-left p-2 border-b">Cod</th>
            <th className="text-left p-2 border-b">Denumire</th>
            <th className="text-left p-2 border-b">Cotă (%)</th>
            <th className="text-left p-2 border-b">Activ</th>
            <th className="text-left p-2 border-b">Default vânzări</th>
            <th className="text-left p-2 border-b">Default achiziții</th>
            <th className="text-left p-2 border-b"></th>
          </tr>
        </thead>
        <tbody>
          {rates.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="p-2">{r.id}</td>
              <td className="p-2">{r.code || "-"}</td>
              <td className="p-2">{r.name}</td>
              <td className="p-2">{r.rate}</td>
              <td className="p-2">{r.active ? "Da" : "Nu"}</td>
              <td className="p-2">{r.is_default_sales ? "Da" : "Nu"}</td>
              <td className="p2">{r.is_default_purchases ? "Da" : "Nu"}</td>
              <td className="p-2">
                <button className="btn btn-ghost" onClick={() => onDelete?.(r.id)}>Dezactivează</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


