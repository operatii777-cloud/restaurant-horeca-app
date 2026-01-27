// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React, { useMemo, useState } from "react";
import { usePosStore } from "../posStore";
import { computeRemaining } from "../utils/paymentHelpers";

export default function PosFooter({ pos }) {
	const order = usePosStore((s) => s.order);
	const payments = usePosStore((s) => s.payments);
	const fiscalReceipt = usePosStore((s) => s.fiscalReceipt);

	const [isFiscalizing, setIsFiscalizing] = useState(false);
	const [error, setError] = useState(null);

	const remaining = useMemo(
		() => computeRemaining(order?.total || 0, payments || []),
		[order, payments]
	);
	const canFiscalize = !isFiscalizing && !fiscalReceipt && remaining === 0;

	async function handleFiscalize() {
		setError(null);
		if (!order) {
			setError("Nu există o comandă încărcată.");
			window.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}
		if (remaining > 0) {
			setError("Nu poți emite bonul fiscal: există sumă neîncasată.");
			window.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}
		try {
			setIsFiscalizing(true);
			await pos.fiscalize();
		} catch (e) {
			setError(e?.message || "A apărut o eroare la fiscalizare.");
			window.scrollTo({ top: 0, behavior: "smooth" });
		} finally {
			setIsFiscalizing(false);
		}
	}

	const lockAll = isFiscalizing || !!fiscalReceipt;

	return (
		<div className="border-t pt-3 mt-4 relative">
			{/* Info bon fiscal */}
			{fiscalReceipt && (
				<div className="mb-4 border border-green-300 bg-green-50 p-3 rounded-xl">
					<div className="text-sm font-semibold text-green-700">Bon fiscal emis</div>
					<div className="text-xs text-green-600 mt-1">
						Număr bon:{" "}
						<span className="font-semibold">
							{fiscalReceipt.receipt_number || fiscalReceipt.receiptNo || "-"}
						</span>
					</div>
					<div className="text-xs text-green-600">
						Data: <span className="font-semibold">{fiscalReceipt.date || fiscalReceipt.created_at || "-"}</span>
					</div>
					<div className="text-xs text-green-600">
						Total:{" "}
						<span className="font-semibold">
							{Number(fiscalReceipt.total || order?.total || 0).toFixed(2)} lei
						</span>
					</div>
				</div>
			)}

			{/* Remaining alert */}
			{!fiscalReceipt && typeof remaining === "number" && remaining > 0 && (
				<div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 p-2 rounded-lg">
					Nu poți emite bonul fiscal. Mai ai de încasat:{" "}
					<span className="font-semibold">{remaining.toFixed(2)} lei</span>.
				</div>
			)}

			{/* Eroare runtime fiscalizare */}
			{error && (
				<div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">
					<div className="font-semibold mb-1">Eroare la fiscalizare:</div>
					<div>{error}</div>
				</div>
			)}

			<button
				type="button"
				onClick={handleFiscalize}
				disabled={!canFiscalize}
				className={`w-full py-3 rounded-xl text-white font-semibold text-base transition ${
					canFiscalize ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
				}`}
			>
				{isFiscalizing ? "Se emite bonul fiscal…" : fiscalReceipt ? "Bon emis" : "Emite Bon Fiscal"}
			</button>

			{/* Overlay de lock în timpul fiscalizării (sau după) */}
			{lockAll && (
				<div className="absolute inset-0 rounded-lg bg-black/10 pointer-events-none select-none" />
			)}
		</div>
	);
}

