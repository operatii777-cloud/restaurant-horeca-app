/**
 * PHASE S10 - Order Store (Comanda)
 * 
 * Zustand store for Order interface (comanda.html replacement).
 * Manages cart, menu, categories, and order creation.
 */

import { create } from 'zustand';
import type { CanonicalOrder } from '../../types/order';

export interface MenuItem {
  id: number;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  price: number;
  category_id: number;
  category_name?: string;
  image_url?: string;
  is_available: boolean;
  customizations?: Customization[];
  allergens?: string[];
  additives?: string[];
}

export interface Customization {
  id: number;
  option_name: string;
  extra_price: number;
  is_exclusive?: boolean;
}

export interface CartItem {
  cartId: string;
  product: MenuItem;
  quantity: number;
  customizations: Customization[];
  isFree?: boolean;
}

interface OrderState {
  // Menu data
  menuItems: MenuItem[];
  categories: Array<{ id: number; name: string; name_en?: string }>;
  selectedCategory: number | null;
  
  // Cart
  cart: CartItem[];
  
  // Order creation
  selectedTable: string | number | null;
  orderType: 'dine_in' | 'takeaway' | 'delivery' | null;
  notes: string;
  
  // UI state
  isCartOpen: boolean;
  isLoading: boolean;
  
  // Actions
  setMenuItems: (items: MenuItem[]) => void;
  setCategories: (categories: Array<{ id: number; name: string; name_en?: string }>) => void;
  setSelectedCategory: (categoryId: number | null) => void;
  addToCart: (product: MenuItem, quantity?: number, customizations?: Customization[], isFree?: boolean) => void;
  updateCartQuantity: (cartId: string, change: number) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  setSelectedTable: (table: string | number | null) => void;
  setOrderType: (type: 'dine_in' | 'takeaway' | 'delivery' | null) => void;
  setNotes: (notes: string) => void;
  toggleCart: () => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getFilteredMenuItems: () => MenuItem[];
}

function generateCartId(productId: number, customizations: Customization[]): string {
  if (customizations.length === 0) return `${productId}`;
  const customIds = customizations.map(c => c.id).sort((a, b) => a - b).join('-');
  return `${productId}_${customIds}`;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  menuItems: [],
  categories: [],
  selectedCategory: null,
  cart: [],
  selectedTable: null,
  orderType: null,
  notes: '',
  isCartOpen: false,
  isLoading: false,
  
  setMenuItems: (items) => set({ menuItems: items }),
  
  setCategories: (categories) => set({ categories }),
  
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  
  addToCart: (product, quantity = 1, customizations = [], isFree = false) => {
    const cart = get().cart;
    const cartId = generateCartId(product.id, customizations);
    const existingItem = cart.find(item => item.cartId === cartId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      if (isFree) existingItem.isFree = true;
    } else {
      cart.push({
        cartId,
        product,
        quantity,
        customizations,
        isFree,
      });
    }
    
    set({ cart: [...cart] });
  },
  
  updateCartQuantity: (cartId, change) => {
    const cart = get().cart;
    const item = cart.find(i => i.cartId === cartId);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        set({ cart: cart.filter(i => i.cartId !== cartId) });
      } else {
        set({ cart: [...cart] });
      }
    }
  },
  
  removeFromCart: (cartId) => {
    set({ cart: get().cart.filter(i => i.cartId !== cartId) });
  },
  
  clearCart: () => {
    set({ cart: [] });
  },
  
  setSelectedTable: (table) => set({ selectedTable: table }),
  
  setOrderType: (type) => set({ orderType: type }),
  
  setNotes: (notes) => set({ notes }),
  
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  getCartTotal: () => {
    return get().cart.reduce((sum, item) => {
      if (item.isFree) return sum;
      const basePrice = item.product.price;
      const customPrice = item.customizations.reduce((cSum, c) => cSum + c.extra_price, 0);
      return sum + (basePrice + customPrice) * item.quantity;
    }, 0);
  },
  
  getCartItemCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },
  
  getFilteredMenuItems: () => {
    const { menuItems, selectedCategory } = get();
    if (!selectedCategory) return menuItems;
    return menuItems.filter(item => item.category_id === selectedCategory);
  },
}));

