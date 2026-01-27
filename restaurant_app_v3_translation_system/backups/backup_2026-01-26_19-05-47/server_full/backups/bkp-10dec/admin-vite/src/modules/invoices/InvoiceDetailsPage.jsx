// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React from "react";
import { useParams } from "react-router-dom";
import { useGenerateUblForInvoice, useInvoice } from "./useInvoices";

export default function InvoiceDetailsPage() {
	const { id } = useParams();
	const { data, isLoading, error } = useInvoice(id);
	const genUbl = useGenerateUblForInvoice();

	if (isLoading) return <div>Se încarcă factura...</div>;
	if (error) return <div>Eroare la încărcarea facturii.</div>;

	const { invoice, items } = data || {};
	if (!invoice) return <div>Factura nu există.</div>;

	function handleGenerateUbl() {
		genUbl.mutate(invoice.id);
	}

	return (
		<div className="p-4 flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">
						Factura {`${invoice.series || ""}${invoice.number || ""}`}
					</h1>
					<div className="text-xs text-gray-500">
						Data: {invoice.issue_date?.slice(0, 10)} | Status:{" "}
						<span className="font-semibold">{invoice.status}</span>
					</div>
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
						onClick={handleGenerateUbl}
						disabled={genUbl.isPending}
					>
						{genUbl.isPending ? "Generează UBL..." : "Generează UBL"}
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
				<div className="border rounded-xl p-3">
					<div className="font-semibold mb-1">Client</div>
					<div>{invoice.customer_name}</div>
					{invoice.customer_vat_code && (
						<div className="text-xs text-gray-600">CUI: {invoice.customer_vat_code}</div>
					)}
					{invoice.customer_reg_com && (
						<div className="text-xs text-gray-600">Reg. Com: {invoice.customer_reg_com}</div>
					)}
					{invoice.customer_address && (
						<div className="text-xs text-gray-600">Adresă: {invoice.customer_address}</div>
					)}
				</div>
				<div className="border rounded-xl p-3">
					<div className="font-semibold mb-1">Total</div>
					<div className="text-sm">Net: {Number(invoice.total_net || 0).toFixed(2)} RON</div>
					<div className="text-sm">TVA: {Number(invoice.total_vat || 0).toFixed(2)} RON</div>
					<div className="text-lg font-semibold">
						Total: {Number(invoice.total_gross || 0).toFixed(2)} RON
					</div>
				</div>
			</div>

			<div className="border rounded-xl overflow-hidden">
				<table className="w-full text-xs md:text-sm">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-2 py-1 text-left">#</th>
							<th className="px-2 py-1 text-left">Produs</th>
							<th className="px-2 py-1 text-right">Cant.</th>
							<th className="px-2 py-1 text-right">Preț</th>
							<th className="px-2 py-1 text-right">Net</th>
							<th className="px-2 py-1 text-right">TVA</th>
							<th className="px-2 py-1 text-right">Total</th>
						</tr>
					</thead>
					<tbody>
						{items?.map((it) => (
							<tr key={it.id}>
								<td className="px-2 py-1">{it.line_no}</td>
								<td className="px-2 py-1">{it.name}</td>
								<td className="px-2 py-1 text-right">
									{Number(it.qty || 0).toFixed(2)} {it.unit}
								</td>
								<td className="px-2 py-1 text-right">{Number(it.unit_price || 0).toFixed(2)}</td>
								<td className="px-2 py-1 text-right">{Number(it.net_amount || 0).toFixed(2)}</td>
								<td className="px-2 py-1 text-right">
									{Number(it.vat_amount || 0).toFixed(2)} ({it.vat_rate}%)
								</td>
								<td className="px-2 py-1 text-right">{Number(it.gross_amount || 0).toFixed(2)}</td>
							</tr>
						))}
						{!items?.length && (
							<tr>
								<td className="px-3 py-3 text-center text-gray-500" colSpan={7}>
									Nicio linie de factură.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{invoice.ubl_xml && (
				<div className="border rounded-xl p-3 text-xs bg-gray-50">
					<div className="font-semibold mb-1">UBL generat</div>
					<div className="text-gray-600">
						XML-ul UBL este salvat în baza de date. Poți adăuga aici buton de „Descarcă XML” sau
						„Trimite către ANAF”.
					</div>
				</div>
			)}
		</div>
	);
}


