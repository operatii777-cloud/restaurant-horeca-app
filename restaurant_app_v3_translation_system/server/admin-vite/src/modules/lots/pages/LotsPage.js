"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LotsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var StatCard_1 = require("@/shared/components/StatCard");
var DataGrid_1 = require("@/shared/components/DataGrid");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var TableFilter_1 = require("@/shared/components/TableFilter");
var MiniBarChart_1 = require("@/shared/components/charts/MiniBarChart");
var MiniDonutChart_1 = require("@/shared/components/charts/MiniDonutChart");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var LotEditorModal_1 = require("@/modules/lots/components/LotEditorModal");
var useIngredientBatches_1 = require("@/modules/lots/hooks/useIngredientBatches");
require("./LotsPage.css");
var formatDate = function (value) {
    return value ? new Date(value).toLocaleDateString('ro-RO') : '-';
};
var formatQty = function (value) {
    return value === null || value === undefined ? '-' : value.toLocaleString('ro-RO', { maximumFractionDigits: 2 });
};
var palette = ['#2563eb', '#38bdf8', '#f97316', '#22c55e', '#6366f1', '#ec4899'];
var LotsPage = function () {
    var _a;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)(''), quickFilter = _b[0], setQuickFilter = _b[1];
    var _c = (0, react_1.useState)(null), selectedIngredientId = _c[0], setSelectedIngredientId = _c[1];
    var _d = (0, react_1.useState)(false), lotModalOpen = _d[0], setLotModalOpen = _d[1];
    var _e = (0, useApiQuery_1.useApiQuery)('/api/ingredients'), ingredientsData = _e.data, ingredientsLoading = _e.loading, ingredientsError = _e.error, refetchIngredients = _e.refetch;
    (0, react_1.useEffect)(function () {
        if (ingredientsData && ingredientsData.length > 0 && selectedIngredientId === null) {
            setSelectedIngredientId(ingredientsData[0].id);
        }
    }, [ingredientsData, selectedIngredientId]);
    var ingredientColumns = (0, react_1.useMemo)(function () { return [
        { field: 'name', headerName: 'Ingredient', minWidth: 200, pinned: 'left' },
        { field: 'category', headerName: 'Categorie', minWidth: 160 },
        {
            field: 'current_stock',
            headerName: 'Stoc',
            width: 120,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatQty(Number(value));
            },
        },
        {
            field: 'min_stock',
            headerName: 'Minim',
            width: 110,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatQty(Number(value));
            },
        },
    ]; }, []);
    var _f = (0, useIngredientBatches_1.useIngredientBatches)(selectedIngredientId), batches = _f.batches, lotsLoading = _f.loading, lotsError = _f.error, selectedBatchId = _f.selectedBatchId, setSelectedBatchId = _f.setSelectedBatchId, refreshLots = _f.refresh;
    var lotColumns = (0, react_1.useMemo)(function () { return [
        { field: 'batch_number', headerName: 'Lot', minWidth: 150, pinned: 'left' },
        {
            field: 'purchase_date',
            headerName: 'Recepționat',
            width: 150,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatDate(value);
            },
        },
        {
            field: 'expiry_date',
            headerName: 'Expiră',
            width: 150,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatDate(value);
            },
        },
        {
            field: 'quantity',
            headerName: 'Cantitate inițială',
            width: 170,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatQty(Number(value));
            },
        },
        {
            field: 'remaining_quantity',
            headerName: 'Cantitate rămasă',
            width: 170,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatQty(Number(value));
            },
        },
        { field: 'supplier', headerName: 'Furnizor', minWidth: 160 },
        { field: 'invoice_number', headerName: 'Factură', minWidth: 140 },
    ]; }, []);
    var selectedIngredient = (0, react_1.useMemo)(function () { var _a; return (_a = ingredientsData === null || ingredientsData === void 0 ? void 0 : ingredientsData.find(function (item) { return item.id === selectedIngredientId; })) !== null && _a !== void 0 ? _a : null; }, [ingredientsData, selectedIngredientId]);
    var totalIngredients = (_a = ingredientsData === null || ingredientsData === void 0 ? void 0 : ingredientsData.length) !== null && _a !== void 0 ? _a : 0;
    var belowMinStock = (0, react_1.useMemo)(function () {
        return (ingredientsData !== null && ingredientsData !== void 0 ? ingredientsData : []).filter(function (item) {
            var _a, _b;
            var current = Number((_a = item.current_stock) !== null && _a !== void 0 ? _a : 0);
            var min = Number((_b = item.min_stock) !== null && _b !== void 0 ? _b : 0);
            return current <= min;
        }).length;
    }, [ingredientsData]);
    var activeLots = batches.length;
    var expiringSoon = (0, react_1.useMemo)(function () {
        return batches.filter(function (lot) {
            if (!lot.expiry_date)
                return false;
            var diff = new Date(lot.expiry_date).getTime() - Date.now();
            return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 5;
        }).length;
    }, [batches]);
    var receivingTrend = (0, react_1.useMemo)(function () {
        if (!batches.length)
            return [];
        var order = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];
        var map = new Map();
        batches.forEach(function (lot) {
            var _a, _b;
            if (!lot.purchase_date)
                return;
            var weekday = new Date(lot.purchase_date).toLocaleDateString('ro-RO', { weekday: 'short' });
            map.set(weekday, ((_a = map.get(weekday)) !== null && _a !== void 0 ? _a : 0) + Number((_b = lot.quantity) !== null && _b !== void 0 ? _b : 0));
        });
        return order
            .filter(function (day) { return map.has(day); })
            .map(function (day) { var _a, _b; return ({ label: day, value: Number((_b = (_a = map.get(day)) === null || _a === void 0 ? void 0 : _a.toFixed(2)) !== null && _b !== void 0 ? _b : 0) }); });
    }, [batches]);
    var supplierDistribution = (0, react_1.useMemo)(function () {
        if (!batches.length)
            return [];
        var map = new Map();
        batches.forEach(function (lot) {
            var _a;
            if (!lot.supplier)
                return;
            map.set(lot.supplier, ((_a = map.get(lot.supplier)) !== null && _a !== void 0 ? _a : 0) + 1);
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
    }, [batches]);
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
    var handleAddLot = (0, react_1.useCallback)(function () {
        if (!selectedIngredientId)
            return;
        setLotModalOpen(true);
    }, [selectedIngredientId]);
    var handleLotSelection = (0, react_1.useCallback)(function (selected) {
        var _a, _b;
        var lotId = (_b = (_a = selected[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null;
        setSelectedBatchId(lotId);
    }, [setSelectedBatchId]);
    var handleLotGridReady = (0, react_1.useCallback)(function (event) {
        var _a;
        if (!event.api)
            return;
        if (selectedBatchId) {
            event.api.forEachNode(function (node) {
                var _a;
                if (((_a = node.data) === null || _a === void 0 ? void 0 : _a.id) === selectedBatchId) {
                    node.setSelected(true);
                }
            });
        }
        else {
            var firstRow = event.api.getDisplayedRowAtIndex(0);
            if ((_a = firstRow === null || firstRow === void 0 ? void 0 : firstRow.data) === null || _a === void 0 ? void 0 : _a.id) {
                firstRow.setSelected(true);
                setSelectedBatchId(firstRow.data.id);
            }
        }
    }, [selectedBatchId, setSelectedBatchId]);
    var ingredientsReady = !ingredientsLoading && (ingredientsData !== null || ingredientsError !== null);
    var lotsFetchCompleted = selectedIngredientId === null ? true : !lotsLoading;
    var isPageReady = ingredientsReady && lotsFetchCompleted;
    return (<div className="lots-page" data-page-ready={isPageReady ? 'true' : 'false'}>
      <section className="lots-hero">
        <div className="lots-hero__info">
          <div className="lots-hero__labels">
            <span className="lots-chip lots-chip--primary">FIFO & trasabilitate ANSVSA</span>
            <span className="lots-chip">Integrat cu recepții digitale</span>
            <span className="lots-chip">Documente HACCP atașate</span>
          </div>
          <h2>Loturi și recepții - control complet pe lanțul rece</h2>
          <p>
            Monitorizează recepțiile, temperaturile și documentele asociate fiecărui ingredient. Afișăm loturile active,
            serviciile de stoc FIFO și te ajutăm să identifici rapid expirările din următoarele zile.
          </p>
        </div>

        <div className="lots-hero__stats">
          <StatCard_1.StatCard title="Ingrediente urmărite" helper="Înregistrate în gestiune" value={"".concat(totalIngredients)} trendLabel="Sub minim" trendValue={"".concat(belowMinStock)} trendDirection={belowMinStock > 0 ? 'down' : 'up'} icon={<span>📦</span>}/>

          <StatCard_1.StatCard title="Loturi active" helper={selectedIngredient ? "Ingredient curent: ".concat(selectedIngredient.name) : 'Selectează un ingredient'} value={"".concat(activeLots)} trendLabel="Expiră ≤ 5 zile" trendValue={"".concat(expiringSoon)} trendDirection={expiringSoon > 0 ? 'down' : 'up'} icon={<span>⌛</span>}/>

          <StatCard_1.StatCard title="Documente atașate" helper="NIR + certificări furnizor" value={"".concat(Math.max(activeLots - 1, 0), " documente")} trendLabel="Necesită validare" trendValue={expiringSoon > 0 ? "".concat(expiringSoon) : '0'} trendDirection={expiringSoon > 0 ? 'flat' : 'up'} icon={<span>📄</span>} footer={<button type="button" className="lots-link-button">
                Deschide manager documente →
              </button>}/>
        </div>

        <div className="lots-hero__analytics">
          <div className="lots-analytics-card">
            <header>
              <span className="lots-analytics-title">Recepții per zi (cantitate totală)</span>
              <span className="lots-analytics-helper">kg / zi</span>
            </header>
            <MiniBarChart_1.MiniBarChart data={receivingTrend.length ? receivingTrend : [{ label: 'N/A', value: 0 }]}/>
          </div>

          <div className="lots-analytics-card">
            <header>
              <span className="lots-analytics-title">Principalii furnizori</span>
              <span className="lots-analytics-helper">% din loturile ingredientului selectat</span>
            </header>
            <MiniDonutChart_1.MiniDonutChart data={supplierDistribution.length
            ? supplierDistribution.map(function (item) { return ({ name: item.name, value: item.value, color: item.color }); })
            : [{ name: 'Fără date', value: 100, color: '#94a3b8' }]}/>
            <ul className="lots-legend">
              {supplierDistribution.length === 0 ? (<li>
                  <span style={{ backgroundColor: '#94a3b8' }} aria-hidden="true"/>
                  <span>Fără date disponibile</span>
                  <strong>100%</strong>
                </li>) : (supplierDistribution.map(function (item) { return (<li key={item.name}>
                    <span style={{ backgroundColor: item.color }} aria-hidden="true"/>
                    <span>{item.name}</span>
                    <strong>
                      {item.value}%
                      <small>{item.raw} loturi</small>
                    </strong>
                  </li>); }))}
            </ul>
          </div>
        </div>
      </section>

      <section className="lots-toolbar" aria-label="Filtre loturi">
        <div className="lots-toolbar__left">
          <TableFilter_1.TableFilter value={quickFilter} onChange={setQuickFilter} placeholder="Caută ingredient după nume, categorie sau furnizor..." aria-label="Filtru rapid loturi"/>
          <label className="lots-toggle">
            <input type="checkbox"/>Afișează doar ingrediente sub minim</label>
        </div>
        <div className="lots-toolbar__actions">
          <button type="button" className="lots-btn lots-btn--ghost" onClick={function () { return refetchIngredients(); }}>
            🔄 Reîmprospătează ingrediente
          </button>
          <button type="button" className="lots-btn lots-btn--ghost" onClick={function () { return refreshLots(); }}>
            🔄 Reîmprospătează loturi
          </button>
          <button type="button" className="lots-btn lots-btn--primary" onClick={handleAddLot} disabled={!selectedIngredientId}>
            ➕ Creează recepție
          </button>
        </div>
      </section>

      <div className="lots-grid">
        <section className="lots-grid__panel">
          <header>
            <div>
              <h3>Ingrediente urmărite</h3>
              <p>{"".concat(totalIngredients, " ingrediente \u2022 ").concat(belowMinStock, " sub minimul de siguran\u021B\u0103")}</p>
            </div>
            <button type="button" className="lots-btn lots-btn--outline">Export listă ingrediente</button>
          </header>

          {ingredientsError ? <InlineAlert_1.InlineAlert type="error" message={ingredientsError}/> : null}

          <DataGrid_1.DataGrid columnDefs={ingredientColumns} rowData={ingredientsData !== null && ingredientsData !== void 0 ? ingredientsData : []} loading={ingredientsLoading} quickFilterText={quickFilter} rowSelection="single" height="62vh" onSelectedRowsChange={handleIngredientSelection} onGridReady={handleIngredientGridReady} gridOptions={{
            rowHeight: 48,
            headerHeight: 44,
            getRowId: function (params) { var _a; return (((_a = params.data) === null || _a === void 0 ? void 0 : _a.id) ? params.data.id.toString() : ''); },
        }}/>
        </section>

        <section className="lots-grid__panel">
          <header>
            <div>
              <h3>Loturi active & documente</h3>
              <p>
                {selectedIngredient
            ? "Ingredient selectat: ".concat(selectedIngredient.name)
            : 'Selectează un ingredient din lista din stânga.'}
              </p>
            </div>
            <div className="lots-grid__panel-actions">
              <button type="button" className="lots-btn lots-btn--outline">
                Export loturi CSV
              </button>
              <button type="button" className="lots-btn lots-btn--outline">Atașează document</button>
            </div>
          </header>

          {lotsError ? <InlineAlert_1.InlineAlert type="error" message={lotsError}/> : null}
          {!selectedIngredientId && !lotsLoading ? (<InlineAlert_1.InlineAlert type="info" message="Selectează un ingredient pentru a vedea loturile."/>) : null}

          <DataGrid_1.DataGrid columnDefs={lotColumns} rowData={batches} loading={lotsLoading} height="62vh" rowSelection="single" onSelectedRowsChange={handleLotSelection} onGridReady={handleLotGridReady} gridOptions={{
            rowHeight: 50,
            headerHeight: 44,
            getRowId: function (params) { var _a; return (((_a = params.data) === null || _a === void 0 ? void 0 : _a.id) ? params.data.id.toString() : ''); },
        }}/>
        </section>
      </div>

      <section className="lots-secondary">
        <article className="lots-secondary__card">
          <header>
            <span>Checklist recepție</span>
            <button type="button" className="lots-link-button">
              Deschide șablon HACCP →
            </button>
          </header>
          <ul>
            <li>
              <strong>Temperatură corectă</strong>
              <span>3 loturi în verificare</span>
            </li>
            <li>
              <strong>Documente veterinare</strong>
              <span>2 documente expiră în 7 zile</span>
            </li>
            <li>
              <strong>Trasabilitate completă</strong>
              <span>Loturi mapate 100%</span>
            </li>
          </ul>
        </article>

        <article className="lots-secondary__card">
          <header>
            <span>Automatizări recepții</span>
            <button type="button" className="lots-link-button">
              Configurează alerte →
            </button>
          </header>
          <ul>
            <li>
              <strong>Alerte expirare</strong>
              <span>Notificare email + SMS</span>
            </li>
            <li>
              <strong>Integrare furnizor</strong>
              <span>Upload facturi PDF automat</span>
            </li>
            <li>
              <strong>Sync cu contabilitate</strong>
              <span>Export zilnic 02:00</span>
            </li>
          </ul>
        </article>
      </section>
      <LotEditorModal_1.LotEditorModal open={lotModalOpen} ingredientId={selectedIngredientId} ingredientName={selectedIngredient === null || selectedIngredient === void 0 ? void 0 : selectedIngredient.name} onClose={function () { return setLotModalOpen(false); }} onSaved={function () {
            refreshLots();
            refetchIngredients();
        }}/>
    </div>);
};
exports.LotsPage = LotsPage;
