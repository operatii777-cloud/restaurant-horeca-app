import type { Order, OrderFilter, OrderItem, OrderVisit } from '@/types/orders';

export function parseOrderItems(items: Order['items'] | string | null | undefined): OrderItem[] {
  if (!items) {
    return [];
  }

  if (Array.isArray(items)) {
    return items;
  }

  try {
    const parsed = JSON.parse(items as string);
    return Array.isArray(parsed) ? (parsed as OrderItem[]) : [];
  } catch (error) {
    console.warn('[orderHelpers] Nu s-a putut parsa lista de produse din comandă:', error);
    return [];
  }
}

export function calculateOrderTotal(order: Pick<Order, 'items' | 'total'>): number {
  const items = parseOrderItems(order.items);

  if (!items.length) {
    return Number(order.total ?? 0) || 0;
  }

  return items.reduce((sum, item) => {
    const lineTotal = (item.finalPrice ?? item.price ?? 0) * (item.quantity || 0);
    return sum + lineTotal;
  }, 0);
}

export function formatTimestamp(timestamp: string | Date | null | undefined): string {
  if (!timestamp) {
    return 'N/A';
  }

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString('ro-RO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatOrderType(type: Order['type']): string {
  switch (type) {
    case 'here':
      return 'La masă';
    case 'takeout':
      return 'La pachet';
    case 'delivery':
      return 'Livrare';
    default:
      return type ?? 'N/A';
  }
}

export function formatCurrency(value: number, locale: string = 'ro-RO'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 2,
  }).format(value);
}

export function groupOrdersByVisit(orders: Order[]): OrderVisit[] {
  const groups = new Map<string, OrderVisit>();

  orders.forEach((order) => {
    if (!order) {
      return;
    }

    const visitKey = `${order.table_number ?? 'takeout'}::${order.client_identifier ?? 'anonim'}`;
    const existing = groups.get(visitKey);

    const parsedItems = parseOrderItems(order.items);
    const orderTotal = calculateOrderTotal(order);
    const isPaid = Number(order.is_paid) === 1;
    const timestamp = order.timestamp ?? null;

    if (!existing) {
      groups.set(visitKey, {
        key: visitKey,
        tableNumber: order.table_number ?? null,
        clientIdentifier: order.client_identifier ?? null,
        orders: [order],
        isPaid,
        totalAmount: orderTotal,
        firstTimestamp: timestamp,
        lastTimestamp: timestamp,
        allItems: [...parsedItems],
        notes: {
          food: order.food_notes ?? undefined,
          drink: order.drink_notes ?? undefined,
          general: order.general_notes ?? undefined,
        },
      });
      return;
    }

    existing.orders.push(order);
    existing.totalAmount += orderTotal;
    existing.isPaid = existing.isPaid && isPaid;
    existing.allItems.push(...parsedItems);

    if (timestamp) {
      if (!existing.firstTimestamp || new Date(timestamp).getTime() < new Date(existing.firstTimestamp).getTime()) {
        existing.firstTimestamp = timestamp;
      }
      if (!existing.lastTimestamp || new Date(timestamp).getTime() > new Date(existing.lastTimestamp).getTime()) {
        existing.lastTimestamp = timestamp;
      }
    }

    if (!existing.notes.food && order.food_notes) {
      existing.notes.food = order.food_notes;
    }
    if (!existing.notes.drink && order.drink_notes) {
      existing.notes.drink = order.drink_notes;
    }
    if (!existing.notes.general && order.general_notes) {
      existing.notes.general = order.general_notes;
    }
  });

  return Array.from(groups.values()).sort((a, b) => {
    const aTime = a.lastTimestamp ? new Date(a.lastTimestamp).getTime() : 0;
    const bTime = b.lastTimestamp ? new Date(b.lastTimestamp).getTime() : 0;
    return bTime - aTime;
  });
}

export function summariseOrders(orders: Order[]) {
  return orders.reduce(
    (acc, order) => {
      const total = calculateOrderTotal(order);
      const isPaid = Number(order.is_paid) === 1;
      const isCancelled = order.status === 'cancelled';

      acc.totalOrders += 1;
      acc.totalAmount += total;

      if (isCancelled) {
        acc.cancelledOrders += 1;
        acc.cancelledValue += total;
        return acc;
      }

      if (isPaid) {
        acc.paidOrders += 1;
        acc.paidValue += total;
      } else {
        acc.unpaidOrders += 1;
        acc.unpaidValue += total;
      }
      return acc;
    },
    {
      totalOrders: 0,
      totalAmount: 0,
      paidOrders: 0,
      paidValue: 0,
      unpaidOrders: 0,
      unpaidValue: 0,
      cancelledOrders: 0,
      cancelledValue: 0,
    },
  );
}

export function rememberOrdersFilters(filters: OrderFilter) {
  try {
    localStorage.setItem('admin_v4_orders_filters', JSON.stringify(filters));
  } catch (error) {
    console.warn('[orderHelpers] Nu s-au putut salva filtrele de comenzi în localStorage.', error);
  }
}

export function restoreOrdersFilters(): OrderFilter | null {
  try {
    const raw = localStorage.getItem('admin_v4_orders_filters');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OrderFilter;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('status' in parsed) ||
      !('startDate' in parsed) ||
      !('endDate' in parsed)
    ) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('[orderHelpers] Nu s-au putut restaura filtrele de comenzi din localStorage.', error);
    return null;
  }
}


