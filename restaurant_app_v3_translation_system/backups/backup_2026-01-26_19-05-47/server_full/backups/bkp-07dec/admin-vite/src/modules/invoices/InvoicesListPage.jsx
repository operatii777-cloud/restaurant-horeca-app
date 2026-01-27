import React from "react";
import { useNavigate } from "react-router-dom";
import { useInvoicesList } from "./useInvoices";

export default function InvoicesListPage() {
	const navigate = useNavigate();
	const { data: invoices, isLoading, error } = useInvoicesList();

	if (isLoading) return <div>Se încarcă facturile...</div>;
	if (error) return <div>Eroare la încărcarea facturilor.</div>;

	return (
		<div className="p-4 flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Facturi</h1>
			</div>
			<div className="border rounded-xl overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-3 py-2 text-left">Serie/Număr</th>
							<th className="px-3 py-2 text-left">Data</th>
							<th className="px-3 py-2 text-left">Client</th>
							<th className="px-3 py-2 text-right">Total</th>
							<th className="px-3 py-2 text-left">Status</th>
							<th className="px-3 py-2 text-left">Sursă</th>
						</tr>
					</thead>
					<tbody>
						{invoices?.map((inv) => (
							<tr
								key={inv.id}
								className="hover:bg-gray-50 cursor-pointer"
								onClick={() => navigate(`/invoices/${inv.id}`)}
							>
								<td className="px-3 py-2">{`${inv.series || ""}${inv.number || ""}`}</td>
								<td className="px-3 py-2">{inv.issue_date?.slice(0, 10)}</td>
								<td className="px-3 py-2">{inv.customer_name}</td>
								<td className="px-3 py-2 text-right">
									{Number(inv.total_gross || 0).toFixed(2)} RON
								</td>
								<td className="px-3 py-2">{inv.status}</td>
								<td className="px-3 py-2">
									{inv.source_type === "POS_ORDER" ? "Comandă POS" : inv.source_type}
								</td>
							</tr>
						))}
						{!invoices?.length && (
							<tr>
								<td className="px-3 py-3 text-center text-gray-500" colSpan={6}>
									Nu există facturi încă.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}


