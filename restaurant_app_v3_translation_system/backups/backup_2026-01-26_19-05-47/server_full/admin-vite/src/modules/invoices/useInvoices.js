import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	fetchInvoices,
	fetchInvoice,
	createInvoiceFromPosOrder,
	generateUblForInvoice,
} from "./invoicesApi";

export function useInvoicesList() {
	return useQuery({
		queryKey: ["invoices"],
		queryFn: fetchInvoices,
	});
}

export function useInvoice(id) {
	return useQuery({
		queryKey: ["invoices", id],
		queryFn: () => fetchInvoice(id),
		enabled: !!id,
	});
}

export function useCreateInvoiceFromPosOrder() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createInvoiceFromPosOrder,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["invoices"] });
		},
	});
}

export function useGenerateUblForInvoice() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: generateUblForInvoice,
		onSuccess: (_data, id) => {
			qc.invalidateQueries({ queryKey: ["invoices", id] });
		},
	});
}


