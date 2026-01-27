export async function fetchInvoices() {
	const r = await fetch("/api/admin/invoices");
	if (!r.ok) throw new Error("Eroare la încărcarea facturilor");
	const data = await r.json();
	return data?.invoices || [];
}

export async function fetchInvoice(id) {
	const r = await fetch(`/api/admin/invoices/${Number(id)}`);
	if (!r.ok) throw new Error("Eroare la încărcarea facturii");
	return r.json();
}

export async function createInvoiceFromPosOrder(orderId) {
	const r = await fetch(`/api/admin/invoices/from-pos-order/${Number(orderId)}`, {
		method: "POST",
	});
	if (!r.ok) throw new Error("Eroare la generarea facturii din comandă POS");
	return r.json(); // { invoice_id }
}

export async function generateUblForInvoice(id) {
	const r = await fetch(`/api/admin/invoices/${Number(id)}/ubl`, {
		method: "POST",
	});
	if (!r.ok) throw new Error("Eroare la generarea UBL");
	return r.json(); // { ok, xml }
}


