// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React from "react";

export default function PaymentAmountInput({ value, onChange, remaining, disabled, onUseExact }) {
	function handleChange(e) {
		const raw = e.target.value;
		const normalized = raw.replace(",", ".");
		if (!/^[0-9]*[.]?[0-9]*$/.test(normalized) && normalized !== "") {
			return;
		}
		onChange?.(normalized);
	}

	function handleUseExact() {
		if (typeof remaining !== "number") return;
		onUseExact?.(remaining);
	}

	return (
		<div className="flex flex-col gap-1 w-full">
			<label className="text-xs font-semibold text-gray-500">Sumă plată</label>
			<div className="flex gap-2">
				<input
					type="text"
					className="border rounded-lg px-3 py-2 text-right text-lg flex-1 disabled:bg-gray-100"
					value={value ?? ""}
					onChange={handleChange}
					disabled={disabled}
					inputMode="decimal"
					placeholder="0.00"
				/>
				<button
					type="button"
					className="border rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap hover:bg-gray-100 disabled:opacity-50"
					onClick={handleUseExact}
					disabled={disabled || !remaining || remaining <= 0}
				>
					Sumă exactă
					{typeof remaining === "number" && remaining > 0 && (
						<span className="block text-[10px] text-gray-500">({remaining.toFixed(2)})</span>
					)}
				</button>
			</div>
		</div>
	);
}


