"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Order Store (Comanda)
 *
 * Zustand store for Order interface (comanda.html replacement).
 * Manages cart, menu, categories, and order creation.
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOrderStore = void 0;
var zustand_1 = require("zustand");
function generateCartId(productId, customizations) {
    if (customizations.length === 0)
        return "".concat(productId);
    var customIds = customizations.map(function (c) { return c.id; }).sort(function (a, b) { return a - b; }).join('-');
    return "".concat(productId, "_").concat(customIds);
}
exports.useOrderStore = (0, zustand_1.create)(function (set, get) { return ({
    menuItems: [],
    categories: [],
    selectedCategory: null,
    cart: [],
    selectedTable: null,
    orderType: null,
    notes: '',
    isCartOpen: false,
    isLoading: false,
    setMenuItems: function (items) { return set({ menuItems: items }); },
    setCategories: function (categories) { return set({ categories: categories }); },
    setSelectedCategory: function (categoryId) { return set({ selectedCategory: categoryId }); },
    addToCart: function (product, quantity, customizations, isFree) {
        if (quantity === void 0) { quantity = 1; }
        if (customizations === void 0) { customizations = []; }
        if (isFree === void 0) { isFree = false; }
        var cart = get().cart;
        var cartId = generateCartId(product.id, customizations);
        var existingItem = cart.find(function (item) { return item.cartId === cartId; });
        if (existingItem) {
            existingItem.quantity += quantity;
            if (isFree)
                existingItem.isFree = true;
        }
        else {
            cart.push({
                cartId: cartId,
                product: product,
                quantity: quantity,
                customizations: customizations,
                isFree: isFree,
            });
        }
        set({ cart: __spreadArray([], cart, true) });
    },
    updateCartQuantity: function (cartId, change) {
        var cart = get().cart;
        var item = cart.find(function (i) { return i.cartId === cartId; });
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                set({ cart: cart.filter(function (i) { return i.cartId !== cartId; }) });
            }
            else {
                set({ cart: __spreadArray([], cart, true) });
            }
        }
    },
    removeFromCart: function (cartId) {
        set({ cart: get().cart.filter(function (i) { return i.cartId !== cartId; }) });
    },
    clearCart: function () {
        set({ cart: [] });
    },
    setSelectedTable: function (table) { return set({ selectedTable: table }); },
    setOrderType: function (type) { return set({ orderType: type }); },
    setNotes: function (notes) { return set({ notes: notes }); },
    toggleCart: function () { return set(function (state) { return ({ isCartOpen: !state.isCartOpen }); }); },
    setLoading: function (loading) { return set({ isLoading: loading }); },
    getCartTotal: function () {
        return get().cart.reduce(function (sum, item) {
            if (item.isFree)
                return sum;
            var basePrice = item.product.price;
            var customPrice = item.customizations.reduce(function (cSum, c) { return cSum + c.extra_price; }, 0);
            return sum + (basePrice + customPrice) * item.quantity;
        }, 0);
    },
    getCartItemCount: function () {
        return get().cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
    },
    getFilteredMenuItems: function () {
        var _a = get(), menuItems = _a.menuItems, selectedCategory = _a.selectedCategory;
        if (!selectedCategory)
            return menuItems;
        return menuItems.filter(function (item) { return item.category_id === selectedCategory; });
    },
}); });
