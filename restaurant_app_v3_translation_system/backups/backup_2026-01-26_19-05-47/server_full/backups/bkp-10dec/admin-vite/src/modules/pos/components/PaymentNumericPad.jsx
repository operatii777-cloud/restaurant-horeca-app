// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

import React from "react";

const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export default function PaymentNumericPad({ value, onChange, disabled }) {
	const safeValue = value ?? "";

	function handleDigit(digit) {
		if (disabled) return;
		let next = safeValue;
		if (next === "0") {
			next = "";
		}
		const dotIndex = next.indexOf(".");
		if (dotIndex !== -1) {
			const decimals = next.length - dotIndex - 1;
			if (decimals >= 2) {
				return;
			}
		}
		onChange?.(next + digit);
	}

	function handleDot() {
		if (disabled) return;
		if (!safeValue) {
			onChange?.("0.");
			return;
		}
		if (!safeValue.includes(".")) {
			onChange?.(safeValue + ".");
		}
	}

	function handleClear() {
		if (disabled) return;
		onChange?.("");
	}

	function handleBackspace() {
		if (disabled) return;
		if (!safeValue) return;
		onChange?.(safeValue.slice(0, -1));
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="grid grid-cols-3 gap-2">
				{digits.slice(0, 9).map((d) => (
					<button
						key={d}
						type="button"
						className="border rounded-lg py-2 text-lg font-medium hover:bg-gray-100 disabled:opacity-50"
						onClick={() => handleDigit(d)}
						disabled={disabled}
					>
						{d}
					</button>
				))}
				<button
					type="button"
					className="border rounded-lg py-2 text-lg font-medium hover:bg-gray-100 disabled:opacity-50"
					onClick={() => handleDigit("0")}
					disabled={disabled}
				>
					0
				</button>
				<button
					type="button"
					className="border rounded-lg py-2 text-xl font-medium hover:bg-gray-100 disabled:opacity-50"
					onClick={handleDot}
					disabled={disabled}
				>
					.
				</button>
				<button
					type="button"
					className="border rounded-lg py-2 text-base font-medium hover:bg-gray-100 disabled:opacity-50"
					onClick={handleBackspace}
					disabled={disabled}
				>
					←
				</button>
			</div>
			<button
				type="button"
				className="border rounded-lg py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
				onClick={handleClear}
				disabled={disabled}
			>
				C – Șterge tot
			</button>
		</div>
	);
}


