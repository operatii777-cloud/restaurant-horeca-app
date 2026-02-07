// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - POS Store
 * 
 * Zustand store for POS interface.
 * Manages current order, mode, table, customer, and draft items.
 */

import { create } from 'zustand';
import type { CanonicalOrder, OrderItem } from '@/types/order';

export type PosMode = 'TABLES' | 'FAST_SALE' | 'KIOSK' | 'DELIVERY';

export interface PosCustomer {
  name?: string;
  phone?: string;
  email?: string;
  identifier?: string;
}

export interface PosDraftItem {
  id?: string; // Unique ID for item in draft
  productId: number;
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
  categoryId?: number;
  station?: 'kitchen' | 'bar';
  notes?: string;
  options?: Array<{ label: string; value?: string }>;
}

export interface PosPayment {
  id: string; // Unique payment ID
  type: 'cash' | 'card' | 'voucher' | 'protocol' | 'degustare' | 'other';
  amount: number;
  timestamp?: Date;
  reference?: string; // Transaction reference, card last 4 digits, etc.
  groupId?: string; // For split bill payments
}

export interface SplitGroup {
  id: string;
  label: string;
  total: number;
  items: Array<{
    itemId?: string;
    productId: number;
    name: string;
    qty: number;
    price: number;
    total: number;
    percentage?: number;
  }>;
}

export interface SplitBillPayload {
  groups: SplitGroup[];
  unassigned: Array<{
    productId: number;
    name: string;
    qty: number;
    unitPrice: number;
    total: number;
  }>;
}

interface PosOrderState {
  id: number | null;
  tableId: number | null;
  status: 'draft' | "Pending:" | 'in_progress' | 'paid' | 'completed' | 'cancelled';
  items: PosDraftItem[];
  payments: PosPayment[];
  subtotal: number;
  tax: number;
  total: number;
}

interface PosState {
  // Mode & Order
  currentMode: PosMode;
  currentOrderId: number | null;
  draftItems: PosDraftItem[];
  order: PosOrderState | null;
  
  // Table & Customer
  selectedTableId: number | null;
  customer: PosCustomer | null;
  
  // Payments
  payments: PosPayment[];
  
  // Split Bill
  splitBill: SplitBillPayload | null;
  selectedGroupId: string | null;

  // Preț tier (1=standard, 2=preț 2, 3=preț 3)
  priceTier: 1 | 2 | 3;
  
  // Fiscalization
  fiscalReceiptNumber: string | null;
  fiscalReceiptDate: string | null;
  isFiscalized: boolean;
  isStockConsumed: boolean;
  
  // Actions
  setMode: (mode: PosMode) => void;
  setTable: (tableId: number | null) => void;
  setCustomer: (customer: PosCustomer | null) => void;
  
  // Draft Items
  addItem: (item: PosDraftItem) => void;
  removeItem: (productId: number) => void;
  increaseQty: (productId: number) => void;
  decreaseQty: (productId: number) => void;
  updateItemQty: (productId: number, qty: number) => void;
  addNote: (productId: number, note: string) => void;
  updateItemNotes: (productId: number, notes: string) => void;
  updateItemOptions: (productId: number, options: Array<{ label: string; value?: string }>) => void;
  
  // Payments
  addPayment: (payment: PosPayment) => void;
  removePayment: (paymentId: string) => void;
  clearPayments: () => void;
  
  // Split Bill
  setSplitBill: (splitPayload: SplitBillPayload) => void;
  clearSplitBill: () => void;
  setSelectedGroup: (groupId: string | null) => void;

  // Preț tier
  setPriceTier: (tier: 1 | 2 | 3) => void;
  
  // Computed for Split Bill
  getGroupTotal: (groupId: string) => number;
  getGroupPaid: (groupId: string) => number;
  getGroupRemaining: (groupId: string) => number;
  areAllGroupsPaid: () => boolean;
  
  // Fiscalization
  setFiscalData: (data: { fiscalReceiptNumber: string; fiscalReceiptDate: string }) => void;
  markFiscalized: () => void;
  markStockConsumed: () => void;
  
  // Order Management
  loadOrderFromServer: (orderId: number) => Promise<void>;
  updateTotals: () => void;
  resetDraft: () => void;
  
  // Computed
  getDraftTotal: () => number;
  getDraftItemCount: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getTotalPaid: () => number;
  getRemaining: () => number;
}

export const usePosStore = create<PosState>((set, get) => ({
  currentMode: 'TABLES',
  currentOrderId: null,
  draftItems: [],
  order: null,
  selectedTableId: null,
  customer: null,
  payments: [],
  splitBill: null,
  selectedGroupId: null,
  priceTier: 1,
  fiscalReceiptNumber: null,
  fiscalReceiptDate: null,
  isFiscalized: false,
  isStockConsumed: false,
  
  setMode: (mode) => set({ currentMode: mode }),
  
  setTable: (tableId) => set({ selectedTableId: tableId }),
  
  setCustomer: (customer) => set({ customer }),
  
  addItem: (item) => {
    const existing = get().draftItems.find((i) => i.productId === item.productId);
    const newItem = {
      ...item,
      id: item.id || `item-${Date.now()}-${Math.random()}`,
    };
    
    if (existing) {
      set({
        draftItems: get().draftItems.map((i) =>
          i.productId === item.productId
            ? { ...i, qty: i.qty + item.qty, total: (i.qty + item.qty) * i.unitPrice }
            : i
        ),
      });
    } else {
      set({ draftItems: [...get().draftItems, newItem] });
    }
    get().updateTotals();
  },
  
  removeItem: (productId) => {
    set({ draftItems: get().draftItems.filter((i) => i.productId !== productId) });
    get().updateTotals();
  },
  
  increaseQty: (productId) => {
    const item = get().draftItems.find((i) => i.productId === productId);
    if (item) {
      get().updateItemQty(productId, item.qty + 1);
    }
  },
  
  decreaseQty: (productId) => {
    const item = get().draftItems.find((i) => i.productId === productId);
    if (item && item.qty > 1) {
      get().updateItemQty(productId, item.qty - 1);
    } else if (item && item.qty === 1) {
      get().removeItem(productId);
    }
  },
  
  updateItemQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeItem(productId);
    } else {
      set({
        draftItems: get().draftItems.map((i) =>
          i.productId === productId
            ? { ...i, qty, total: qty * i.unitPrice }
            : i
        ),
      });
      get().updateTotals();
    }
  },
  
  addNote: (productId, note) => {
    get().updateItemNotes(productId, note);
  },
  
  updateItemNotes: (productId, notes) => {
    set({
      draftItems: get().draftItems.map((i) =>
        i.productId === productId ? { ...i, notes } : i
      ),
    });
  },
  
  updateItemOptions: (productId, options) => {
    set({
      draftItems: get().draftItems.map((i) =>
        i.productId === productId ? { ...i, options } : i
      ),
    });
  },
  
  // Payments
  addPayment: (payment) => {
    const newPayment: PosPayment = {
      ...payment,
      id: payment.id || `payment-${Date.now()}-${Math.random()}`,
      timestamp: payment.timestamp || new Date(),
    };
    set({ payments: [...get().payments, newPayment] });
  },
  
  removePayment: (paymentId) => {
    set({ payments: get().payments.filter((p) => p.id !== paymentId) });
  },
  
  clearPayments: () => {
    set({ payments: [] });
  },
  
  // Split Bill
  setSplitBill: (splitPayload) => {
    set({ splitBill: splitPayload, selectedGroupId: splitPayload.groups[0]?.id || null });
  },
  
  clearSplitBill: () => {
    set({ splitBill: null, selectedGroupId: null });
  },
  
  setSelectedGroup: (groupId) => {
    set({ selectedGroupId: groupId });
  },

  setPriceTier: (tier) => {
    set({ priceTier: tier });
  },
  
  getGroupTotal: (groupId) => {
    const splitBill = get().splitBill;
    if (!splitBill) return 0;
    const group = splitBill.groups.find((g) => g.id === groupId);
    return group?.total || 0;
  },
  
  getGroupPaid: (groupId) => {
    return get()
      .payments.filter((p) => p.groupId === groupId)
      .reduce((sum, p) => sum + p.amount, 0);
  },
  
  getGroupRemaining: (groupId) => {
    const total = get().getGroupTotal(groupId);
    const paid = get().getGroupPaid(groupId);
    const remaining = total - paid;
    return remaining > 0 ? Math.round(remaining * 100) / 100 : 0;
  },
  
  areAllGroupsPaid: () => {
    const splitBill = get().splitBill;
    if (!splitBill) return false;
    return splitBill.groups.every((group) => {
      const remaining = get().getGroupRemaining(group.id);
      return remaining <= 0.01;
    });
  },
  
  // Fiscalization
  setFiscalData: (data) => {
    set({
      fiscalReceiptNumber: data.fiscalReceiptNumber,
      fiscalReceiptDate: data.fiscalReceiptDate,
      isFiscalized: true,
    });
  },
  
  markFiscalized: () => {
    set({ isFiscalized: true });
  },
  
  markStockConsumed: () => {
    set({ isStockConsumed: true });
  },
  
  // Order Management
  loadOrderFromServer: async (orderId) => {
    try {
      const { posApi } = await import('../api/posApi');
      const order = await posApi.getOrder(orderId);
      
      // Convert order.items to draftItems
      const draftItems: PosDraftItem[] = (order.items || []).map((item: any, index: number) => ({
        id: `item-${orderId}-"Index"`,
        productId: item.product_id || item.productId,
        name: item.name || item.product_name || 'Produs',
        qty: item.quantity || item.qty || 1,
        unitPrice: item.price || item.unit_price || 0,
        total: (item.quantity || item.qty || 1) * (item.price || item.unit_price || 0),
        notes: item.notes,
        options: item.options,
      }));
      
      // Convert order.payments to payments (handle both payment and payments)
      const orderPayments = (order as any).payments || (order as any).payment || [];
      const payments: PosPayment[] = (Array.isArray(orderPayments) ? orderPayments : 'orderPayments').map((payment: any, index: number) => ({
        id: payment.id || `payment-${orderId}-"Index"`,
        type: payment.type || payment.method || 'cash',
        amount: payment.amount || 0,
        timestamp: payment.timestamp ? new Date(payment.timestamp) : new Date(),
        reference: payment.reference,
      }));
      
      set({
        currentOrderId: order.id,
        draftItems,
        payments,
        selectedTableId: order.table_id || order.table || null,
        order: {
          id: order.id,
          tableId: order.table_id || order.table || null,
          status: order.status || "Pending:",
          items: draftItems,
          payments,
          subtotal: order.subtotal || get().getSubtotal(),
          tax: order.tax || get().getTax(),
          total: (order as any).total || (order as any).totals?.total || get().getTotal(),
        },
      });
      
      get().updateTotals();
    } catch (error) {
      console.error('posStore Error loading order:', error);
      throw error;
    }
  },
  
  updateTotals: () => {
    const subtotal = get().getSubtotal();
    const tax = get().getTax();
    const total = subtotal + tax;
    
    set((state) => ({
      order: state.order
        ? {
            ...state.order,
            subtotal,
            tax,
            total,
            items: state.draftItems,
          }
        : null,
    }));
  },
  
  resetDraft: () => {
    set({
      draftItems: [],
      currentOrderId: null,
      selectedTableId: null,
      customer: null,
      payments: [],
      order: null,
      splitBill: null,
      selectedGroupId: null,
      fiscalReceiptNumber: null,
      fiscalReceiptDate: null,
      isFiscalized: false,
      isStockConsumed: false,
    });
  },
  
  // Computed
  getDraftTotal: () => {
    return get().draftItems.reduce((sum, item) => sum + item.total, 0);
  },
  
  getDraftItemCount: () => {
    return get().draftItems.reduce((sum, item) => sum + item.qty, 0);
  },
  
  getSubtotal: () => {
    return get().getDraftTotal();
  },
  
  getTax: () => {
    // VAT 19% (can be made configurable)
    const subtotal = get().getSubtotal();
    return Math.round(subtotal * 0.19 * 100) / 100;
  },
  
  getTotal: () => {
    return get().getSubtotal() + get().getTax();
  },
  
  getTotalPaid: () => {
    return get().payments.reduce((sum, payment) => sum + payment.amount, 0);
  },
  
  getRemaining: () => {
    const total = get().getTotal();
    const paid = get().getTotalPaid();
    const remaining = total - paid;
    return remaining > 0 ? Math.round(remaining * 100) / 100 : 0;
  },
}));



