"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - e-Factura Store
 *
 * Zustand store for e-Factura interface.
 * Manages invoice list, filters, and pagination.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEFacturaStore = void 0;
var zustand_1 = require("zustand");
exports.useEFacturaStore = (0, zustand_1.create)(function (set) { return ({
    list: [],
    total: 0,
    page: 1,
    pageSize: 50,
    loading: false,
    filter: { status: 'ALL' },
    setFilter: function (f) { return set(function (s) { return ({
        filter: __assign(__assign({}, s.filter), f),
        page: 1
    }); }); },
    setList: function (_a) {
        var items = _a.items, total = _a.total, page = _a.page, pageSize = _a.pageSize;
        return set({
            list: items,
            total: total,
            page: page,
            pageSize: pageSize
        });
    },
    setLoading: function (v) { return set({ loading: v }); },
    setPage: function (p) { return set({ page: p }); },
}); });
