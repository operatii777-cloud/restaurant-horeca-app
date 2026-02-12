"use strict";
/**
 * FAZA 2 - Delivery Cart Hook
 * Manages cart state and operations for delivery orders
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.useDeliveryCart = useDeliveryCart;
var react_1 = require("react");
var DELIVERY_FEE = 0; // Can be made configurable later
function useDeliveryCart() {
    var _a = (0, react_1.useState)([]), items = _a[0], setItems = _a[1];
    // Calculate totals
    var subtotal = (0, react_1.useMemo)(function () {
        return items.reduce(function (sum, item) {
            if (item.isFree)
                return sum;
            var itemPrice = item.price + item.customizations.reduce(function (cSum, c) { return cSum + c.extra_price; }, 0);
            return sum + itemPrice * item.quantity;
        }, 0);
    }, [items]);
    var deliveryFee = DELIVERY_FEE;
    var total = subtotal + deliveryFee;
    // Add item to cart
    var addItem = (0, react_1.useCallback)(function (product, quantity, customizations) {
        if (quantity === void 0) { quantity = 1; }
        if (customizations === void 0) { customizations = []; }
        setItems(function (prev) {
            // Check if item with same productId and customizations already exists
            var existingIndex = prev.findIndex(function (item) {
                if (item.productId !== product.id)
                    return false;
                if (item.customizations.length !== customizations.length)
                    return false;
                var existingCustomIds = item.customizations.map(function (c) { return c.id; }).sort().join(',');
                var newCustomIds = customizations.map(function (c) { return c.id; }).sort().join(',');
                return existingCustomIds === newCustomIds;
            });
            if (existingIndex >= 0) {
                // Update quantity of existing item
                var updated = __spreadArray([], prev, true);
                updated[existingIndex] = __assign(__assign({}, updated[existingIndex]), { quantity: updated[existingIndex].quantity + quantity });
                return updated;
            }
            else {
                // Add new item
                var newItem = {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: quantity,
                    customizations: customizations || [],
                    isFree: false
                };
                return __spreadArray(__spreadArray([], prev, true), [newItem], false);
            }
        });
    }, []);
    // Remove item from cart
    var removeItem = (0, react_1.useCallback)(function (productId, customizations) {
        setItems(function (prev) {
            if (!customizations || customizations.length === 0) {
                return prev.filter(function (item) { return item.productId !== productId; });
            }
            // Remove specific item with matching customizations
            var customIds = customizations.map(function (c) { return c.id; }).sort().join(',');
            return prev.filter(function (item) {
                if (item.productId !== productId)
                    return true;
                var itemCustomIds = item.customizations.map(function (c) { return c.id; }).sort().join(',');
                return itemCustomIds !== customIds;
            });
        });
    }, []);
    // Increase quantity
    var increaseQty = (0, react_1.useCallback)(function (productId, customizations) {
        setItems(function (prev) { return prev.map(function (item) {
            if (item.productId !== productId)
                return item;
            if (customizations && customizations.length > 0) {
                var itemCustomIds = item.customizations.map(function (c) { return c.id; }).sort().join(',');
                var targetCustomIds = customizations.map(function (c) { return c.id; }).sort().join(',');
                if (itemCustomIds !== targetCustomIds)
                    return item;
            }
            else if (item.customizations.length > 0)
                return item;
            return __assign(__assign({}, item), { quantity: item.quantity + 1 });
        }); });
    }, []);
    // Decrease quantity
    var decreaseQty = (0, react_1.useCallback)(function (productId, customizations) {
        setItems(function (prev) { return prev.map(function (item) {
            if (item.productId !== productId)
                return item;
            if (customizations && customizations.length > 0) {
                var itemCustomIds = item.customizations.map(function (c) { return c.id; }).sort().join(',');
                var targetCustomIds = customizations.map(function (c) { return c.id; }).sort().join(',');
                if (itemCustomIds !== targetCustomIds)
                    return item;
            }
            else if (item.customizations.length > 0)
                return item;
            if (item.quantity <= 1) {
                // Remove item if quantity would be 0
                return null;
            }
            return __assign(__assign({}, item), { quantity: item.quantity - 1 });
        }).filter(Boolean); });
    }, []);
    // Clear cart
    var clearCart = (0, react_1.useCallback)(function () {
        setItems([]);
    }, []);
    var cartState = {
        items: items,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total
    };
    return __assign(__assign({}, cartState), { addItem: addItem, removeItem: removeItem, increaseQty: increaseQty, decreaseQty: decreaseQty, clearCart: clearCart });
}
