"use strict";
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
exports.parseOrderItems = parseOrderItems;
exports.calculateOrderTotal = calculateOrderTotal;
exports.formatTimestamp = formatTimestamp;
exports.formatOrderType = formatOrderType;
exports.formatCurrency = formatCurrency;
exports.groupOrdersByVisit = groupOrdersByVisit;
exports.summariseOrders = summariseOrders;
exports.rememberOrdersFilters = rememberOrdersFilters;
exports.restoreOrdersFilters = restoreOrdersFilters;
function parseOrderItems(items) {
    if (!items) {
        return [];
    }
    if (Array.isArray(items)) {
        return items;
    }
    try {
        var parsed = JSON.parse(items);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch (error) {
        console.warn('orderHelpers Nu s-a putut parsa lista de produse din comandă:', error);
        return [];
    }
}
function calculateOrderTotal(order) {
    var _a;
    var items = parseOrderItems(order.items);
    if (!items.length) {
        return Number((_a = order.total) !== null && _a !== void 0 ? _a : 0) || 0;
    }
    return items.reduce(function (sum, item) {
        var _a, _b;
        var lineTotal = ((_b = (_a = item.finalPrice) !== null && _a !== void 0 ? _a : item.price) !== null && _b !== void 0 ? _b : 0) * (item.quantity || 0);
        return sum + lineTotal;
    }, 0);
}
function formatTimestamp(timestamp) {
    if (!timestamp) {
        return 'N/A';
    }
    var date = timestamp instanceof Date ? timestamp : new Date(timestamp);
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
function formatOrderType(type) {
    switch (type) {
        case 'here':
            return 'La masă';
        case 'takeout':
            return 'La pachet';
        case "Delivery":
            return 'Livrare';
        default:
            return type !== null && type !== void 0 ? type : 'N/A';
    }
}
function formatCurrency(value, locale) {
    if (locale === void 0) { locale = 'ro-RO'; }
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'RON',
        minimumFractionDigits: 2,
    }).format(value);
}
function groupOrdersByVisit(orders) {
    var groups = new Map();
    orders.forEach(function (order) {
        var _a;
        var _b, _c, _d, _e, _f, _g, _h, _j;
        if (!order) {
            return;
        }
        var visitKey = "".concat((_b = order.table_number) !== null && _b !== void 0 ? _b : 'takeout', "::").concat((_c = order.client_identifier) !== null && _c !== void 0 ? _c : 'anonim');
        var existing = groups.get(visitKey);
        var parsedItems = parseOrderItems(order.items);
        var orderTotal = calculateOrderTotal(order);
        var isPaid = Number(order.is_paid) === 1;
        var timestamp = (_d = order.timestamp) !== null && _d !== void 0 ? _d : null;
        if (!existing) {
            groups.set(visitKey, {
                key: visitKey,
                tableNumber: (_e = order.table_number) !== null && _e !== void 0 ? _e : null,
                clientIdentifier: (_f = order.client_identifier) !== null && _f !== void 0 ? _f : null,
                orders: [order],
                isPaid: isPaid,
                totalAmount: orderTotal,
                firstTimestamp: timestamp,
                lastTimestamp: timestamp,
                allItems: __spreadArray([], parsedItems, true),
                notes: {
                    food: (_g = order.food_notes) !== null && _g !== void 0 ? _g : undefined,
                    drink: (_h = order.drink_notes) !== null && _h !== void 0 ? _h : undefined,
                    general: (_j = order.general_notes) !== null && _j !== void 0 ? _j : undefined,
                },
            });
            return;
        }
        existing.orders.push(order);
        existing.totalAmount += orderTotal;
        existing.isPaid = existing.isPaid && isPaid;
        (_a = existing.allItems).push.apply(_a, parsedItems);
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
    return Array.from(groups.values()).sort(function (a, b) {
        var aTime = a.lastTimestamp ? new Date(a.lastTimestamp).getTime() : 0;
        var bTime = b.lastTimestamp ? new Date(b.lastTimestamp).getTime() : 0;
        return bTime - aTime;
    });
}
function summariseOrders(orders) {
    return orders.reduce(function (acc, order) {
        var total = calculateOrderTotal(order);
        var isPaid = Number(order.is_paid) === 1;
        var isCancelled = order.status === 'cancelled';
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
        }
        else {
            acc.unpaidOrders += 1;
            acc.unpaidValue += total;
        }
        return acc;
    }, {
        totalOrders: 0,
        totalAmount: 0,
        paidOrders: 0,
        paidValue: 0,
        unpaidOrders: 0,
        unpaidValue: 0,
        cancelledOrders: 0,
        cancelledValue: 0,
    });
}
function rememberOrdersFilters(filters) {
    try {
        localStorage.setItem('admin_v4_orders_filters', JSON.stringify(filters));
    }
    catch (error) {
        console.warn('orderHelpers Nu s-au putut salva filtrele de comenzi în localStorage.', error);
    }
}
function restoreOrdersFilters() {
    try {
        var raw = localStorage.getItem('admin_v4_orders_filters');
        if (!raw)
            return null;
        var parsed = JSON.parse(raw);
        if (!parsed ||
            typeof parsed !== 'object' ||
            !('status' in parsed) ||
            !('startDate' in parsed) ||
            !('endDate' in parsed)) {
            return null;
        }
        return parsed;
    }
    catch (error) {
        console.warn('orderHelpers Nu s-au putut restaura filtrele de comenzi din localStorage.', error);
        return null;
    }
}
