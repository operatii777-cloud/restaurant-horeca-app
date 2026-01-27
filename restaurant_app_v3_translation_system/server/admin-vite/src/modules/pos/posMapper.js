export function mapOrderApiToStore(apiOrder) {
  return {
    id: apiOrder.id,
    table: apiOrder.table_number,
    total: apiOrder.total,
    items: Array.isArray(apiOrder.items) ? apiOrder.items : [],
    isPaid: apiOrder.is_paid === 1 || apiOrder.is_paid === true,
    hasFiscal: apiOrder.has_fiscal_receipt === 1 || apiOrder.has_fiscal_receipt === true,
  };
}

export function mapPaymentsToPayload(payments) {
  return {
    payments: (payments || []).map((p) => ({
      type: p.type,
      amount: Number(p.amount || 0),
    })),
  };
}


