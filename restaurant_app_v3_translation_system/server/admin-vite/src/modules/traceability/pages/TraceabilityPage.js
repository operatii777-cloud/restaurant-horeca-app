"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceabilityPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var StatCard_1 = require("@/shared/components/StatCard");
var DataGrid_1 = require("@/shared/components/DataGrid");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var MiniBarChart_1 = require("@/shared/components/charts/MiniBarChart");
var MiniDonutChart_1 = require("@/shared/components/charts/MiniDonutChart");
var TableFilter_1 = require("@/shared/components/TableFilter");
var TraceOrderModal_1 = require("@/modules/traceability/components/TraceOrderModal");
var useTraceabilityGridData_1 = require("@/modules/traceability/hooks/useTraceabilityGridData");
var useDebouncedValue_1 = require("@/shared/hooks/useDebouncedValue");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
require("./TraceabilityPage.css");
var formatDateTime = function (value) {
    return value ? new Date(value).toLocaleString('ro-RO') : '-';
};
var formatQty = function (value) {
    return value === null || value === undefined ? '-' : value.toLocaleString('ro-RO', { maximumFractionDigits: 2 });
};
var palette = ['#2563eb', '#38bdf8', '#6366f1', '#f97316', '#22c55e', '#ec4899'];
var TraceabilityPage = function () {
    var _a, _b;
    //   const { t } = useTranslation();
    var _c = (0, react_1.useState)(''), quickFilter = _c[0], setQuickFilter = _c[1];
    var _d = (0, react_1.useState)(null), selectedIngredientId = _d[0], setSelectedIngredientId = _d[1];
    var _e = (0, react_1.useState)(false), orderModalOpen = _e[0], setOrderModalOpen = _e[1];
    var _f = (0, react_1.useState)(null), selectedOrderId = _f[0], setSelectedOrderId = _f[1];
    var debouncedFilter = (0, useDebouncedValue_1.useDebouncedValue)(quickFilter, 200);
    var _g = (0, useTraceabilityGridData_1.useTraceabilityGridData)(debouncedFilter), ingredients = _g.ingredients, filteredIngredients = _g.filteredIngredients, ingredientsLoading = _g.ingredientsLoading, ingredientsError = _g.ingredientsError, refetchIngredients = _g.refetchIngredients, ingredientStats = _g.stats;
    (0, react_1.useEffect)(function () {
        if (ingredients.length > 0 && selectedIngredientId === null) {
            setSelectedIngredientId(ingredients[0].id);
        }
    }, [ingredients, selectedIngredientId]);
    var ingredientColumns = (0, react_1.useMemo)(function () { return [
        { field: 'name', headerName: 'Ingredient', minWidth: 200, pinned: 'left' },
        { field: 'category', headerName: 'Categorie', minWidth: 150 },
        { field: 'unit', headerName: 'Unitate', width: 120 },
    ]; }, []);
    var traceEndpoint = selectedIngredientId ? "/api/ingredients/".concat(selectedIngredientId, "/traceability") : null;
    var _h = (0, useApiQuery_1.useApiQuery)(traceEndpoint), traceData = _h.data, traceLoading = _h.loading, traceError = _h.error, refetchTrace = _h.refetch;
    var traceColumns = (0, react_1.useMemo)(function () { return [
        { field: 'order_id', headerName: 'Comandă', width: 120, pinned: 'left' },
        {
            field: 'order_timestamp',
            headerName: 'Dată comandă',
            minWidth: 190,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatDateTime(value);
            },
        },
        { field: 'batch_number', headerName: 'Lot', minWidth: 140 },
        {
            field: 'quantity_used',
            headerName: 'Cantitate folosită',
            minWidth: 160,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatQty(Number(value));
            },
        },
        { field: 'supplier', headerName: 'Furnizor', minWidth: 160 },
        { field: 'order_status', headerName: 'Status comandă', minWidth: 150 },
        {
            field: 'is_paid',
            headerName: 'Plată',
            width: 120,
            valueFormatter: function (_a) {
                var value = _a.value;
                return (value ? 'Achitată' : 'Neachitată');
            },
        },
        {
            headerName: 'Acțiuni',
            colId: 'actions',
            width: 140,
            pinned: 'right',
            sortable: false,
            filter: false,
            valueGetter: function () { return 'Detalii comandă →'; },
            cellClass: 'trace-grid__action-cell',
        },
    ]; }, []);
    var selectedIngredient = (0, react_1.useMemo)(function () { var _a; return (_a = ingredients.find(function (item) { return item.id === selectedIngredientId; })) !== null && _a !== void 0 ? _a : null; }, [ingredients, selectedIngredientId]);
    var recordStats = (0, react_1.useMemo)(function () { return (0, useTraceabilityGridData_1.getTraceabilityRecordStats)(traceData !== null && traceData !== void 0 ? traceData : []); }, [traceData]);
    var totalTraceRecords = recordStats.totalRecords;
    var totalQuantityUsed = recordStats.totalQuantityUsed;
    var paidOrders = recordStats.paid;
    var orderStatusDistribution = (0, react_1.useMemo)(function () {
        if (!traceData || traceData.length === 0)
            return [];
        var map = new Map();
        traceData.forEach(function (record) {
            var _a;
            if (!record.order_status)
                return;
            map.set(record.order_status, ((_a = map.get(record.order_status)) !== null && _a !== void 0 ? _a : 0) + 1);
        });
        var entries = Array.from(map.entries()).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 6);
        var total = entries.reduce(function (sum, _a) {
            var count = _a[1];
            return sum + count;
        }, 0) || 1;
        return entries.map(function (_a, index) {
            var name = _a[0], count = _a[1];
            return ({
                name: name,
                value: Number(((count / total) * 100).toFixed(1)),
                raw: count,
                color: palette[index % palette.length],
            });
        });
    }, [traceData]);
    var usageTrend = (0, react_1.useMemo)(function () {
        if (!traceData || traceData.length === 0)
            return [];
        var map = new Map();
        traceData.forEach(function (record) {
            var _a, _b;
            if (!record.order_timestamp)
                return;
            var day = new Date(record.order_timestamp).toLocaleDateString('ro-RO', { weekday: 'short' });
            map.set(day, ((_a = map.get(day)) !== null && _a !== void 0 ? _a : 0) + ((_b = record.quantity_used) !== null && _b !== void 0 ? _b : 0));
        });
        var order = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];
        return order
            .filter(function (day) { return map.has(day); })
            .map(function (day) { var _a; return ({ label: day, value: Number(((_a = map.get(day)) !== null && _a !== void 0 ? _a : 0).toFixed(2)) }); });
    }, [traceData]);
    var paymentDistribution = (0, react_1.useMemo)(function () {
        if (!traceData || traceData.length === 0)
            return [];
        var paid = paidOrders;
        var unpaid = traceData.length - paid;
        return [
            { name: 'Achitate', value: traceData.length ? Number(((paid / traceData.length) * 100).toFixed(1)) : 0, raw: paid, color: '#22c55e' },
            { name: 'Neachitate', value: traceData.length ? Number(((unpaid / traceData.length) * 100).toFixed(1)) : 0, raw: unpaid, color: '#f97316' },
        ];
    }, [traceData, paidOrders]);
    var handleIngredientSelection = function (selected) {
        if (selected.length) {
            setSelectedIngredientId(selected[0].id);
        }
    };
    var handleIngredientGridReady = function (event) {
        var _a;
        if (!event.api)
            return;
        if (selectedIngredientId) {
            event.api.forEachNode(function (node) {
                var _a;
                if (((_a = node.data) === null || _a === void 0 ? void 0 : _a.id) === selectedIngredientId) {
                    node.setSelected(true);
                }
            });
        }
        else {
            var firstRow = event.api.getDisplayedRowAtIndex(0);
            if ((_a = firstRow === null || firstRow === void 0 ? void 0 : firstRow.data) === null || _a === void 0 ? void 0 : _a.id) {
                firstRow.setSelected(true);
                setSelectedIngredientId(firstRow.data.id);
            }
        }
    };
    var openOrderModal = (0, react_1.useCallback)(function (orderId) {
        if (!orderId)
            return;
        setSelectedOrderId(orderId);
        setOrderModalOpen(true);
    }, []);
    var handleTraceCellClicked = (0, react_1.useCallback)(function (event) {
        if (event.colDef.colId === 'actions' && event.data) {
            openOrderModal(event.data.order_id);
        }
    }, 'openOrderModal');
    var handleTraceRowDoubleClicked = (0, react_1.useCallback)(function (event) {
        if (event.data) {
            openOrderModal(event.data.order_id);
        }
    }, 'openOrderModal');
    var ingredientsReady = !ingredientsLoading;
    var traceFetchCompleted = traceEndpoint === null ? true : !traceLoading;
    var isPageReady = ingredientsReady && traceFetchCompleted;
    return (<div className="trace-page" data-page-ready={isPageReady ? 'true' : 'false'}>
      <section className="trace-hero">
        <div className="trace-hero__info">
          <div className="trace-hero__labels">
            <span className="trace-chip trace-chip--primary">Trasabilitate completă ANSVSA / ANPC</span>
            <span className="trace-chip">Order → Ingredient → Lot</span>
            <span className="trace-chip">Audit ready în &lt; 3 sec</span>
          </div>
          <h2>Trasabilitate operațională – fiecare ingredient urmărit până la livrare</h2>
          <p>
            Verifici în timp real ce lot s-a folosit pentru fiecare comandă, ce documente sunt atașate și dacă plata a
            fost procesată. Avem integrare directă cu istoricul recepțiilor și rapoarte gata de audit.
          </p>
        </div>

        <div className="trace-hero__stats">
          <StatCard_1.StatCard title="Înregistrări trasabilitate" helper={selectedIngredient ? "Ingredient: ".concat(selectedIngredient.name) : 'Selectează un ingredient'} value={"".concat(totalTraceRecords)} trendLabel="Cantitate totală" trendValue={"".concat(formatQty(totalQuantityUsed), " ").concat((_a = selectedIngredient === null || selectedIngredient === void 0 ? void 0 : selectedIngredient.unit) !== null && _a !== void 0 ? _a : '')} trendDirection={totalQuantityUsed > 0 ? 'up' : 'flat'} icon={<span>🔗</span>}/>

          <StatCard_1.StatCard title="Comenzi achitate" helper="Status sincronizat cu POS și livrări" value={"".concat(paidOrders)} trendLabel="Neachitate" trendValue={"".concat(Math.max(totalTraceRecords - paidOrders, 0))} trendDirection={totalTraceRecords - paidOrders > 0 ? 'down' : 'up'} icon={<span>💳</span>}/>

          <StatCard_1.StatCard title="Ingrediente monitorizate" helper="Trasabilitate activă & loturi mapate" value={"".concat(ingredientStats.totalIngredients)} trendLabel="Sub stoc de siguranță" trendValue={"".concat(ingredientStats.belowSafetyStock)} trendDirection={ingredientStats.belowSafetyStock > 0 ? 'down' : 'up'} icon={<span>🥕</span>} footer={<button type="button" className="trace-link-button">
                Deschide registrul oficial →
              </button>}/>
        </div>

        <div className="trace-hero__analytics">
          <div className="trace-analytics-card">
            <header>
              <span className="trace-analytics-title">Consum per zi (cantitate trasată)</span>
              <span className="trace-analytics-helper">Unitatea ingredientului selectat</span>
            </header>
            <MiniBarChart_1.MiniBarChart data={usageTrend.length ? usageTrend : [{ label: 'N/A', value: 0 }]}/>
          </div>

          <div className="trace-analytics-card">
            <header>
              <span className="trace-analytics-title">Distribuție status comenzi</span>
              <span className="trace-analytics-helper">% din total înregistrări</span>
            </header>
            <MiniDonutChart_1.MiniDonutChart data={orderStatusDistribution.length
            ? orderStatusDistribution.map(function (item) { return ({ name: item.name, value: item.value, color: item.color }); })
            : [{ name: 'Fără date', value: 100, color: '#94a3b8' }]}/>
            <ul className="trace-legend">
              {orderStatusDistribution.length === 0 ? (<li>
                  <span className="trace-legend__dot trace-legend__dot--default" aria-hidden="true"/>
                  <span>fără date disponibile</span>
                  <strong>100%</strong>
                </li>) : (orderStatusDistribution.map(function (item, index) { return (<li key={"".concat(item.name, "-index")}>
                    <span className={"trace-legend__dot trace-legend__dot--palette-".concat(index % palette.length)} aria-hidden="true"/>
                    <span>{item.name}</span>
                    <strong>
                      {item.value}%
                      <small>{item.raw} intrări</small>
                    </strong>
                  </li>); }))}
            </ul>
          </div>

          <div className="trace-analytics-card">
            <header>
              <span className="trace-analytics-title">Status plată</span>
              <span className="trace-analytics-helper">% din total comenzi trasate</span>
            </header>
            <MiniDonutChart_1.MiniDonutChart data={paymentDistribution.length
            ? paymentDistribution.map(function (item) { return ({ name: item.name, value: item.value, color: item.color }); })
            : [{ name: 'Fără date', value: 100, color: '#94a3b8' }]}/>
            <ul className="trace-legend">
              {paymentDistribution.length === 0 ? (<li>
                  <span className="trace-legend__dot trace-legend__dot--default" aria-hidden="true"/>
                  <span>fără date disponibile</span>
                  <strong>100%</strong>
                </li>) : (paymentDistribution.map(function (item, index) {
            var normalized = item.name.toLowerCase();
            var colorClass = normalized.includes('achitat') || index === 0
                ? 'trace-legend__dot--paid'
                : 'trace-legend__dot--unpaid';
            return (<li key={"".concat(item.name, "-index")}>
                      <span className={"trace-legend__dot ".concat(colorClass)} aria-hidden="true"/>
                      <span>{item.name}</span>
                      <strong>
                        {item.value}%
                        <small>{item.raw} comenzi</small>
                      </strong>
                    </li>);
        }))}
            </ul>
          </div>
        </div>
      </section>

      <section className="trace-toolbar" aria-label="Filtre trasabilitate">
        <div className="trace-toolbar__left">
          <TableFilter_1.TableFilter value={quickFilter} onChange={setQuickFilter} placeholder="Caută ingredient după nume, categorie, lot, furnizor..." aria-label="Filtru rapid trasabilitate"/>
          <label className="trace-toggle">
            <input type="checkbox"/>afișează doar înregistrările neachitate</label>
        </div>
        <div className="trace-toolbar__actions">
          <button type="button" className="trace-btn trace-btn--ghost" onClick={function () { return refetchIngredients(); }}>
            ⟳ Reîmprospătează ingrediente
          </button>
          <button type="button" className="trace-btn trace-btn--ghost" onClick={function () { return refetchTrace(); }}>
            ⟳ Reîmprospătează trasabilitate
          </button>
          <button type="button" className="trace-btn trace-btn--primary">
            ⬇️ Export registru oficial
          </button>
        </div>
      </section>

      <div className="trace-grid">
        <section className="trace-grid__panel">
          <header>
            <div>
              <h3>Ingrediente monitorizate</h3>
              <p>{"".concat(ingredients.length, " ingrediente \u00B7 trasabilitate complet\u0103")}</p>
            </div>
            <button type="button" className="trace-btn trace-btn--outline">importă lista audit</button>
          </header>

          {ingredientsError ? <InlineAlert_1.InlineAlert type="error" message={ingredientsError}/> : null}

          <DataGrid_1.DataGrid columnDefs={ingredientColumns} rowData={filteredIngredients} loading={ingredientsLoading} quickFilterText={quickFilter} rowSelection="single" height="62vh" onSelectedRowsChange={handleIngredientSelection} onGridReady={handleIngredientGridReady} gridOptions={{
            rowHeight: 48,
            headerHeight: 44,
            getRowId: function (params) { var _a; return (((_a = params.data) === null || _a === void 0 ? void 0 : _a.id) ? params.data.id.toString() : ''); },
        }}/>
        </section>

        <section className="trace-grid__panel">
          <header>
            <div>
              <h3>Consum și mapare loturi</h3>
              <p>
                {selectedIngredient
            ? "Ingredient selectat: ".concat(selectedIngredient.name, " (").concat((_b = selectedIngredient.unit) !== null && _b !== void 0 ? _b : '', ")")
            : 'Selectează un ingredient pentru a urmări consumul.'}
              </p>
            </div>
            <div className="trace-grid__panel-actions">
              <button type="button" className="trace-btn trace-btn--outline">
                Export Excel trasabilitate
              </button>
              <button type="button" className="trace-btn trace-btn--outline">generează raport PDF</button>
            </div>
          </header>

          {traceError ? <InlineAlert_1.InlineAlert type="error" message={traceError}/> : null}
          {!selectedIngredientId && !traceLoading ? (<InlineAlert_1.InlineAlert type="info" message="Selectează un ingredient pentru a vedea trasabilitatea."/>) : null}

          <DataGrid_1.DataGrid columnDefs={traceColumns} rowData={traceData !== null && traceData !== void 0 ? traceData : []} loading={traceLoading} height="62vh" gridOptions={{
            rowHeight: 50,
            headerHeight: 44,
        }} agGridProps={{
            onCellClicked: handleTraceCellClicked,
            onRowDoubleClicked: handleTraceRowDoubleClicked,
            getRowId: function (params) { return (params.data ? "".concat(params.data.order_id, "-").concat(params.data.batch_number) : "".concat(Math.random())); },
        }}/>
        </section>
      </div>

      <TraceOrderModal_1.TraceOrderModal open={orderModalOpen} orderId={selectedOrderId} onClose={function () {
            setOrderModalOpen(false);
            setSelectedOrderId(null);
        }}/>
    </div>);
};
exports.TraceabilityPage = TraceabilityPage;
