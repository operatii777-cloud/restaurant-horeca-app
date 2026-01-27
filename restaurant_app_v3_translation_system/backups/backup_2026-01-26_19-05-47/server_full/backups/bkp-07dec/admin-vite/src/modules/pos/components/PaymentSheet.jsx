import React, { useMemo, useState } from "react";
import { usePosStore } from "../posStore";
import PaymentMethodSelector from "./PaymentMethodSelector";
import PaymentAmountInput from "./PaymentAmountInput";
import PaymentsList from "./PaymentsList";
import PaymentNumericPad from "./PaymentNumericPad";
import { computePaidTotal, computeRemaining } from "../utils/paymentHelpers";

export default function PaymentSheet({ onAddPayment }) {
	const order = usePosStore((s) => s.order);
	const payments = usePosStore((s) => s.payments);
	const loading = usePosStore((s) => s.loading);

	const [method, setMethod] = useState("CASH");
	const [amount, setAmount] = useState("");
	const [error, setError] = useState(null);
	const [isAdding, setIsAdding] = useState(false);

	const [showSplit, setShowSplit] = useState(false);
	const [splitPersons, setSplitPersons] = useState(2);
	const [isProcessingSplit, setIsProcessingSplit] = useState(false);
	const [splitError, setSplitError] = useState(null);

	const totalPaid = useMemo(() => computePaidTotal(payments), [payments]);
	const remaining = useMemo(
		() => computeRemaining(order?.total || 0, payments),
		[order, payments]
	);

	function parseAmount() {
		if (!amount) return 0;
		const normalized = amount.replace(",", ".");
		const value = parseFloat(normalized);
		if (Number.isNaN(value)) return 0;
		return Math.round(value * 100) / 100;
	}

	async function handleAddPaymentClick() {
		setError(null);
		if (!order) {
			setError("Nu există o comandă încărcată.");
			return;
		}
		if (!method) {
			setError("Selectează metoda de plată.");
			return;
		}
		const numericAmount = parseAmount();
		if (!numericAmount || numericAmount <= 0) {
			setError("Introdu o sumă mai mare decât 0.");
			return;
		}
		if (typeof remaining === "number" && numericAmount - remaining > 0.001) {
			setError("Suma nu poate depăși suma rămasă de încasat.");
			return;
		}
		try {
			setIsAdding(true);
			await Promise.resolve(
				onAddPayment ? onAddPayment({ type: method, amount: numericAmount }) : null
			);
			setAmount("");
		} catch (e) {
			setError(e?.message || "A apărut o eroare la adăugarea plății. Încearcă din nou.");
		} finally {
			setIsAdding(false);
		}
	}

	function handleUseExact(value) {
		if (typeof value !== "number") return;
		setAmount(value.toFixed(2));
	}

	function handleOpenSplit() {
		setShowSplit(true);
		setSplitError(null);
	}

	function handleCloseSplit() {
		if (isProcessingSplit) return;
		setShowSplit(false);
	}

	function handleSplitPersonsChange(e) {
		const v = parseInt(e.target.value, 10);
		if (Number.isNaN(v)) {
			setSplitPersons("");
			return;
		}
		setSplitPersons(Math.max(2, Math.min(20, v)));
	}

	function computeShares(total, persons) {
		const centsTotal = Math.round(total * 100);
		const base = Math.floor(centsTotal / persons);
		const remainder = centsTotal - base * persons;
		const shares = [];
		for (let i = 0; i < persons; i++) {
			let share = base;
			if (i < remainder) {
				share += 1;
			}
			shares.push(share / 100);
		}
		return shares;
	}

	async function handleConfirmSplit() {
		setSplitError(null);
		if (!order) {
			setSplitError("Nu există o comandă încărcată.");
			return;
		}
		if (!method) {
			setSplitError("Selectează mai întâi metoda de plată.");
			return;
		}
		if (typeof remaining !== "number" || remaining <= 0) {
			setSplitError("Nu mai există sumă de încasat pentru split.");
			return;
		}
		const persons = parseInt(splitPersons, 10);
		if (Number.isNaN(persons) || persons < 2) {
			setSplitError("Numărul de persoane trebuie să fie cel puțin 2.");
			return;
		}
		const shares = computeShares(remaining, persons);
		try {
			setIsProcessingSplit(true);
			for (const share of shares) {
				if (share <= 0) continue;
				// plăți secvențiale pentru a evita conflicte
				// eslint-disable-next-line no-await-in-loop
				await Promise.resolve(
					onAddPayment ? onAddPayment({ type: method, amount: share }) : null
				);
			}
			setShowSplit(false);
		} catch (e) {
			setSplitError(e?.message || "A apărut o eroare la aplicarea splitului de plată.");
		} finally {
			setIsProcessingSplit(false);
		}
	}

	const canAddPayment =
		!loading && !isAdding && order && typeof remaining === "number" && remaining > 0;
	const canSplit =
		!loading && !isProcessingSplit && order && typeof remaining === "number" && remaining > 0;

	return (
		<div className="flex flex-col gap-3">
			<div className="grid grid-cols-2 gap-2 text-sm">
				<div className="border rounded-lg p-2 bg-gray-50">
					<div className="text-xs text-gray-500">Plătit</div>
					<div className="text-lg font-semibold">
						{typeof totalPaid === "number" ? totalPaid.toFixed(2) : "-"}
					</div>
				</div>
				<div className="border rounded-lg p-2 bg-gray-50">
					<div className="text-xs text-gray-500">De încasat</div>
					<div className="text-lg font-semibold">
						{typeof remaining === "number" ? remaining.toFixed(2) : "-"}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="flex flex-col gap-2">
					<PaymentMethodSelector value={method} onChange={setMethod} />
					<PaymentAmountInput
						value={amount}
						onChange={setAmount}
						remaining={remaining}
						disabled={loading || isAdding}
						onUseExact={handleUseExact}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<PaymentNumericPad
						value={amount}
						onChange={setAmount}
						disabled={loading || isAdding}
					/>
				</div>
			</div>

			{error && (
				<div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-2 py-1">
					{error}
				</div>
			)}

			<div className="flex flex-wrap gap-2">
				<button
					type="button"
					className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
					onClick={handleAddPaymentClick}
					disabled={!canAddPayment}
				>
					{isAdding ? "Se adaugă plata..." : "Adaugă plată"}
				</button>
				<button
					type="button"
					className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
					onClick={handleOpenSplit}
					disabled={!canSplit}
				>
					Split note
				</button>
			</div>

			<PaymentsList payments={payments} />

			{showSplit && (
				<div className="mt-3 border rounded-xl p-3 bg-gray-50 flex flex-col gap-3">
					<div className="flex items-center justify-between gap-2">
						<div>
							<div className="text-sm font-semibold">Split note</div>
							<div className="text-xs text-gray-500">
								Împarte suma rămasă ({remaining?.toFixed(2) ?? "-"}) la mai multe persoane.
							</div>
						</div>
						<button
							type="button"
							className="text-xs text-gray-500 hover:text-gray-700"
							onClick={handleCloseSplit}
							disabled={isProcessingSplit}
						>
							Închide
						</button>
					</div>
					<div className="flex flex-wrap items-end gap-3">
						<div className="flex flex-col gap-1">
							<label className="text-xs text-gray-600">Număr persoane (minim 2)</label>
							<input
								type="number"
								min={2}
								max={20}
								className="border rounded-lg px-2 py-1 text-sm w-24"
								value={splitPersons}
								onChange={handleSplitPersonsChange}
								disabled={isProcessingSplit}
							/>
						</div>
						<div className="flex-1 text-xs text-gray-500">
							Metodă utilizată pentru toate plățile split:{" "}
							<span className="font-semibold">{method || "–"}</span>
						</div>
					</div>
					{splitError && (
						<div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-2 py-1">
							{splitError}
						</div>
					)}
					<div className="flex justify-end">
						<button
							type="button"
							className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
							onClick={handleConfirmSplit}
							disabled={isProcessingSplit}
						>
							{isProcessingSplit ? "Se aplică split-ul..." : "Aplică split"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}


