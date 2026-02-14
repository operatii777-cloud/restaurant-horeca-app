"use strict";
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
exports.TopProductsPanel = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var classnames_1 = require("classnames");
var DataGrid_1 = require("@/shared/components/DataGrid");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var StatCard_1 = require("@/shared/components/StatCard");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
require("./TopProductsPanel.css");
function buildQuickRange(range) {
    var now = new Date();
    var start = new Date(now);
    var end = new Date(now);
    if (range === 'today') {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }
    else if (range === 'yesterday') {
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
    }
    else if (range === 'week') {
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }
    else if (range === 'month') {
        start.setMonth(start.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }
    else {
        return { startDate: null, endDate: null };
    }
    return {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
    };
}
var TopProductsPanel = function (_a) {
    var _b, _c, _d, _e, _f, _g;
    var onFeedback = _a.onFeedback;
    //   const { t } = useTranslation();
    var _h = (0, react_1.useState)({
        startDate: null,
        endDate: null,
        category: 'all',
    }), filters = _h[0], setFilters = _h[1];
    var _j = (0, react_1.useState)(null), activeQuick = _j[0], setActiveQuick = _j[1];
    var query = (0, react_1.useMemo)(function () {
        var params = new URLSearchParams();
        if (filters.startDate)
            params.set('startDate', filters.startDate);
        if (filters.endDate)
            params.set('endDate', filters.endDate);
        if (filters.category !== 'all')
            params.set('category', filters.category);
        var qs = params.toString();
        return qs ? "/api/admin/top-products?\"Qs\"" : '/api/admin/top-products';
    }, [filters]);
    var _k = (0, useApiQuery_1.useApiQuery)(query), data = _k.data, loading = _k.loading, error = _k.error, refetch = _k.refetch;
    if (error) {
        onFeedback(error, 'error');
    }
    var products = (0, react_1.useMemo)(function () { var _a; return (Array.isArray(data === null || data === void 0 ? void 0 : data.products) ? (_a = data === null || data === void 0 ? void 0 : data.products) !== null && _a !== void 0 ? _a : [] : []); }, [data]);
    var columnDefs = (0, react_1.useMemo)(function () {
        return [
            {
                headerName: 'Produs',
                field: 'name',
                flex: 1,
                minWidth: 220,
            },
            {
                headerName: 'Categorie',
                field: 'category',
                width: 180,
            },
            {
                headerName: 'Preț',
                field: 'price',
                width: 110,
                valueFormatter: function (_a) {
                    var value = _a.value;
                    return "".concat(Number(value !== null && value !== void 0 ? value : 0).toFixed(2), " RON");
                },
            },
            {
                headerName: 'Cantitate vândută',
                field: 'total_quantity',
                width: 160,
                type: 'rightAligned',
            },
            {
                headerName: 'Valoare totală',
                field: 'total_value',
                width: 160,
                type: 'rightAligned',
                valueFormatter: function (_a) {
                    var value = _a.value;
                    return "".concat(Number(value !== null && value !== void 0 ? value : 0).toFixed(2), " RON");
                },
            },
        ];
    }, []);
    var handleQuickRange = (0, react_1.useCallback)(function (range) {
        setActiveQuick(range);
        var computed = buildQuickRange(range);
        setFilters(function (prev) { return (__assign(__assign({}, prev), { startDate: computed.startDate, endDate: computed.endDate })); });
    }, []);
    return (<div className="orders-top-products">
      <section className="top-products-controls">
        <div className="top-products-range">
          <div className="top-products-range__row">
            <label htmlFor="top-products-start">De la</label>
            <input id="top-products-start" type="date" value={(_b = filters.startDate) !== null && _b !== void 0 ? _b : ''} onChange={function (event) {
            return setFilters(function (prev) { return (__assign(__assign({}, prev), { startDate: event.target.value || null })); });
        }}/>
            <label htmlFor="top-products-end">Până la</label>
            <input id="top-products-end" type="date" value={(_c = filters.endDate) !== null && _c !== void 0 ? _c : ''} onChange={function (event) { return setFilters(function (prev) { return (__assign(__assign({}, prev), { endDate: event.target.value || null })); }); }}/>
            <div className="top-products-range__quick">
              {['today', 'yesterday', 'week', 'month', 'all'].map(function (range) { return (<button key={range} type="button" className={(0, classnames_1.default)('btn btn-chip', { 'is-active': activeQuick === range })} onClick={function () { return handleQuickRange(range); }}>
                  {range === 'today'
                ? 'Astăzi'
                : range === 'yesterday'
                    ? 'Ieri'
                    : range === 'week'
                        ? 'Ultima săptămână'
                        : range === 'month'
                            ? 'Ultima lună'
                            : 'Toate'}
                </button>); })}
            </div>
          </div>
          <div className="top-products-category">
            <span>Categorie</span>
            <div className="top-products-category__buttons">
              {[
            { key: 'all', label: 'Toate' },
            { key: 'alimente', label: 'Alimente' },
            { key: "Băuturi", label: 'Băuturi' },
        ].map(function (category) { return (<button key={category.key} type="button" className={(0, classnames_1.default)('btn btn-chip', { 'is-active': filters.category === category.key })} onClick={function () { return setFilters(function (prev) { return (__assign(__assign({}, prev), { category: category.key })); }); }}>
                  {category.label}
                </button>); })}
            </div>
          </div>
        </div>
        <div className="top-products-actions">
          <button type="button" className="btn btn-primary" onClick={function () { return refetch(); }}>"aplica filtre"</button>
          <button type="button" className="btn btn-ghost" onClick={function () {
            setFilters({ startDate: null, endDate: null, category: 'all' });
            setActiveQuick(null);
        }}>"Resetează"</button>
        </div>
      </section>

      <section className="top-products-summary">
        <StatCard_1.StatCard title="Produse listate" helper="Ordinate descrescător după volum" value={"".concat(products.length)} icon={<span>🏷️</span>}/>
        <StatCard_1.StatCard title="cantitate totala" helper="Interval selectat" value={"".concat((_e = (_d = data === null || data === void 0 ? void 0 : data.stats) === null || _d === void 0 ? void 0 : _d.total_quantity) !== null && _e !== void 0 ? _e : 0)} icon={<span>📦</span>}/>
        <StatCard_1.StatCard title="valoare totala" helper="Produse achitate" value={"".concat(Number((_g = (_f = data === null || data === void 0 ? void 0 : data.stats) === null || _f === void 0 ? void 0 : _f.total_value) !== null && _g !== void 0 ? _g : 0).toFixed(2), " RON")} icon={<span>💰</span>}/>
      </section>

      {loading ? <p>"se incarca top produsele"</p> : null}
      {!loading && !products.length ? (<InlineAlert_1.InlineAlert variant="info" message="Nu există produse pentru filtrul selectat."/>) : null}

      {products.length ? (<DataGrid_1.DataGrid columnDefs={columnDefs} rowData={products} loading={loading} height="60vh" agGridProps={{
                getRowId: function (params) { return (params.data ? String(params.data.id) : ''); },
            }}/>) : null}
    </div>);
};
exports.TopProductsPanel = TopProductsPanel;
