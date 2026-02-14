"use strict";
/**
 * PHASE S5.5 - Tipizate Store (Zustand Enterprise)
 * Global state management for all tipizate documents
 *
 * Features:
 * - Cross-document state management
 * - List caching
 * - Document caching
 * - Global filters
 * - UI preferences (persistent)
 * - Undo/Redo
 * - Cross-tab sync
 * - Optimistic updates
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.useTipizateStore = void 0;
var zustand_1 = require("zustand");
var middleware_1 = require("zustand/middleware");
exports.useTipizateStore = (0, zustand_1.create)()((0, middleware_1.persist)((0, middleware_1.subscribeWithSelector)(function (set, get) { return ({
    // Document type curent
    type: 'NIR',
    setType: function (type) { return set({ type: type }); },
    // Cache listări
    listCache: {},
    setListCache: function (type, payload) {
        return set(function (s) {
            var _a;
            return ({
                listCache: __assign(__assign({}, s.listCache), (_a = {}, _a[type] = payload, _a)),
            });
        });
    },
    clearListCache: function (type) {
        return set(function (s) {
            if (type) {
                var _a = s.listCache, _b = type, _ = _a[_b], rest = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
                return { listCache: rest };
            }
            return { listCache: {} };
        });
    },
    // Cache documente individuale
    docCache: {},
    setDocCache: function (type, id, payload) {
        return set(function (s) {
            var _a;
            return ({
                docCache: __assign(__assign({}, s.docCache), (_a = {}, _a["\"Type\"_\"Id\""] = payload, _a)),
            });
        });
    },
    getDocCache: function (type, id) {
        var state = get();
        return state.docCache["\"Type\"_\"Id\""] || null;
    },
    clearDocCache: function (type, id) {
        return set(function (s) {
            if (type && id) {
                var _a = s.docCache, _b = "\"Type\"_\"Id\"", _ = _a[_b], rest = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
                return { docCache: rest };
            }
            else if (type) {
                var filtered = Object.fromEntries(Object.entries(s.docCache).filter(function (_a) {
                    var key = _a[0];
                    return !key.startsWith("".concat(type, "_"));
                }));
                return { docCache: filtered };
            }
            return { docCache: {} };
        });
    },
    // Filtre globale
    filters: {},
    setFilters: function (type, filters) {
        return set(function (s) {
            var _a;
            return ({
                filters: __assign(__assign({}, s.filters), (_a = {}, _a[type] = filters, _a)),
            });
        });
    },
    clearFilters: function (type) {
        return set(function (s) {
            if (type) {
                var _a = s.filters, _b = type, _ = _a[_b], rest = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
                return { filters: rest };
            }
            return { filters: {} };
        });
    },
    // Preferințe UI
    ui: {
        pdfTheme: 'standard',
        hiddenColumns: {},
        gridDensity: 'comfortable',
        pageSize: 50,
    },
    setUi: function (partial) {
        return set(function (s) { return ({
            ui: __assign(__assign({}, s.ui), partial),
        }); });
    },
    toggleColumn: function (type, columnName) {
        return set(function (s) {
            var _a;
            var hidden = s.ui.hiddenColumns[type] || [];
            var exists = hidden.includes(columnName);
            return {
                ui: __assign(__assign({}, s.ui), { hiddenColumns: __assign(__assign({}, s.ui.hiddenColumns), (_a = {}, _a[type] = exists
                        ? hidden.filter(function (c) { return c !== columnName; })
                        : __spreadArray(__spreadArray([], hidden, true), [columnName], false), _a)) }),
            };
        });
    },
    // Undo / Redo
    history: [],
    future: [],
    pushHistory: function (snapshot) {
        return set(function (s) { return ({
            history: __spreadArray(__spreadArray([], s.history, true), [snapshot], false),
            future: [],
        }); });
    },
    undo: function () {
        return set(function (s) {
            if (s.history.length === 0)
                return {};
            var previous = s.history[s.history.length - 1];
            var current = {
                form: s.ui,
                lines: [],
                totals: {},
            };
            return __assign(__assign({}, previous), { history: s.history.slice(0, -1), future: __spreadArray([current], s.future, true) });
        });
    },
    redo: function () {
        return set(function (s) {
            if (s.future.length === 0)
                return {};
            var next = s.future[0];
            var current = {
                form: s.ui,
                lines: [],
                totals: {},
            };
            return __assign(__assign({}, next), { history: __spreadArray(__spreadArray([], s.history, true), [current], false), future: s.future.slice(1) });
        });
    },
    clearHistory: function () {
        return set({
            history: [],
            future: [],
        });
    },
    // Last Used Document
    lastOpened: {},
    setLastOpened: function (type, id) {
        return set(function (s) {
            var _a;
            return ({
                lastOpened: __assign(__assign({}, s.lastOpened), (_a = {}, _a[type] = id, _a)),
            });
        });
    },
    // Global reload trigger
    reloadToken: 0,
    reload: function () {
        return set(function (s) { return ({
            reloadToken: s.reloadToken + 1,
        }); });
    },
}); }), {
    name: 'tipizate-store',
    version: 1,
    partialize: function (state) { return ({
        ui: state.ui,
        filters: state.filters,
        lastOpened: state.lastOpened,
        type: state.type,
    }); },
}));
// Cross-tab sync using BroadcastChannel
if (typeof window !== 'undefined') {
    var channel_1 = new BroadcastChannel('tipizate-store-sync');
    // Listen for changes from other tabs
    channel_1.onmessage = function (event) {
        if (event.data.type === 'RELOAD') {
            exports.useTipizateStore.getState().reload();
        }
        else if (event.data.type === 'CACHE_UPDATE') {
            var _a = event.data, docType = _a.docType, docId = _a.docId, payload = _a.payload;
            exports.useTipizateStore.getState().setDocCache(docType, docId, payload);
        }
    };
    // Subscribe to store changes and broadcast
    exports.useTipizateStore.subscribe(function (state) { return state.reloadToken; }, function () {
        channel_1.postMessage({ type: 'RELOAD' });
    });
}
