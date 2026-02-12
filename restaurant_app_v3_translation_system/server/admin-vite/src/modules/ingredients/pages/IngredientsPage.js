"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
exports.IngredientsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var StatCard_1 = require("@/shared/components/StatCard");
var DataGrid_1 = require("@/shared/components/DataGrid");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var TableFilter_1 = require("@/shared/components/TableFilter");
var MiniBarChart_1 = require("@/shared/components/charts/MiniBarChart");
var MiniDonutChart_1 = require("@/shared/components/charts/MiniDonutChart");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var IngredientEditorModal_1 = require("@/modules/ingredients/components/IngredientEditorModal");
var IngredientBulkUpdateModal_1 = require("@/modules/ingredients/components/IngredientBulkUpdateModal");
var IngredientDetailsDrawer_1 = require("@/modules/ingredients/components/IngredientDetailsDrawer");
var httpClient_1 = require("@/shared/api/httpClient");
require("./IngredientsPage.css");
var formatNumber = function (value) {
    return value === null || value === undefined ? '-' : value.toLocaleString('ro-RO', { maximumFractionDigits: 2 });
};
var isTrue = function (value) { return value === true || value === 1 || value === '1'; };
var topConsumptionData = [
    { label: 'Lun', value: 36 },
    { label: 'Mar', value: 28 },
    { label: 'Mie', value: 32 },
    { label: 'Joi', value: 48 },
    { label: 'Vin', value: 54 },
    { label: 'Sâm', value: 42 },
    { label: 'Dum', value: 38 },
];
var stockDistributionData = [
    { name: 'Legume', value: 28, color: '#2563eb' },
    { name: 'Carne', value: 18, color: '#38bdf8' },
    { name: 'Lactate', value: 14, color: '#6366f1' },
    { name: 'Uleiuri', value: 12, color: '#f97316' },
    { name: 'Condimente', value: 9, color: '#22c55e' },
    { name: 'Altele', value: 19, color: '#94a3b8' },
];
var IngredientsPage = function () {
    var _a;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)(''), quickFilter = _b[0], setQuickFilter = _b[1];
    var _c = (0, react_1.useState)(false), showHidden = _c[0], setShowHidden = _c[1];
    var _d = (0, react_1.useState)(false), editorOpen = _d[0], setEditorOpen = _d[1];
    var _e = (0, react_1.useState)(null), editingIngredient = _e[0], setEditingIngredient = _e[1];
    var _f = (0, react_1.useState)([]), selectedIngredients = _f[0], setSelectedIngredients = _f[1];
    var _g = (0, react_1.useState)(false), bulkModalOpen = _g[0], setBulkModalOpen = _g[1];
    var _h = (0, react_1.useState)(false), detailsOpen = _h[0], setDetailsOpen = _h[1];
    var _j = (0, react_1.useState)('overview'), detailsTab = _j[0], setDetailsTab = _j[1];
    var _k = (0, react_1.useState)(null), feedback = _k[0], setFeedback = _k[1];
    var _l = (0, useApiQuery_1.useApiQuery)('/api/ingredients'), data = _l.data, loading = _l.loading, error = _l.error, refetch = _l.refetch;
    var isPageReady = !loading && (data !== null || error !== null);
    var filteredData = (0, react_1.useMemo)(function () {
        if (!data)
            return [];
        return data.filter(function (item) { return (showHidden ? true : !isTrue(item.is_hidden)); });
    }, [data, showHidden]);
    var columnDefs = (0, react_1.useMemo)(function () { return [
        {
            field: 'name',
            headerName: 'Ingredient',
            minWidth: 220,
            filter: 'agTextColumnFilter',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true,
        },
        { field: 'category', headerName: 'Categorie', minWidth: 160 },
        { field: 'unit', headerName: 'Unitate', width: 110 },
        {
            field: 'is_hidden',
            headerName: 'Vizibil',
            width: 120,
            valueFormatter: function (_a) {
                var value = _a.value;
                return (isTrue(value) ? 'Ascuns' : 'Activ');
            },
            cellClass: function (params) { return (isTrue(params.value) ? 'cell-inactive' : 'cell-active'); },
        },
        {
            field: 'current_stock',
            headerName: 'Stoc curent',
            width: 140,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatNumber(Number(value));
            },
        },
        {
            field: 'min_stock',
            headerName: 'Stoc minim',
            width: 130,
            valueFormatter: function (_a) {
                var value = _a.value;
                return formatNumber(Number(value));
            },
        },
        {
            field: 'cost_per_unit',
            headerName: 'Cost/unitate',
            width: 140,
            valueFormatter: function (_a) {
                var value = _a.value;
                return value === null || value === undefined ? '-' : "".concat(Number(value).toFixed(2), " RON");
            },
        },
        { field: 'supplier', headerName: 'Furnizor', minWidth: 180 },
        {
            field: 'origin_country',
            headerName: 'Țară origine',
            width: 150,
            valueFormatter: function (_a) {
                var value = _a.value;
                return value !== null && value !== void 0 ? value : '-';
            },
        },
        {
            headerName: 'Acțiuni',
            colId: 'actions',
            width: 130,
            pinned: 'right',
            sortable: false,
            filter: false,
            valueGetter: function () { return 'Gestionează →'; },
            cellClass: 'ingredients-grid__action-cell',
        },
    ]; }, []);
    var handleAddIngredient = (0, react_1.useCallback)(function () {
        setEditingIngredient(null);
        setEditorOpen(true);
    }, []);
    var handleEditIngredient = (0, react_1.useCallback)(function (ingredientToEdit) {
        if (!ingredientToEdit)
            return;
        setEditingIngredient(ingredientToEdit);
        setEditorOpen(true);
    }, []);
    var handleSelectionChange = function (selected) {
        setSelectedIngredients(selected);
    };
    var handleCellClicked = (0, react_1.useCallback)(function (event) {
        if (event.colDef.colId === 'actions' && event.data) {
            handleEditIngredient(event.data);
        }
    }, [handleEditIngredient]);
    var handleRowDoubleClicked = (0, react_1.useCallback)(function (event) {
        if (event.data) {
            handleEditIngredient(event.data);
        }
    }, [handleEditIngredient]);
    var totalIngredients = filteredData.length;
    var activeIngredients = filteredData.filter(function (item) { return !isTrue(item.is_hidden); }).length;
    var hiddenIngredients = totalIngredients - activeIngredients;
    var selectionCount = selectedIngredients.length;
    var primaryIngredient = (_a = selectedIngredients[0]) !== null && _a !== void 0 ? _a : null;
    var handleOpenDetails = (0, react_1.useCallback)(function (tab) {
        if (tab === void 0) { tab = 'overview'; }
        if (!primaryIngredient) {
            setFeedback({ type: 'warning', message: 'Selectează un ingredient pentru a vizualiza detaliile.' });
            return;
        }
        setDetailsTab(tab);
        setDetailsOpen(true);
    }, [primaryIngredient]);
    var handleOpenBulkModal = (0, react_1.useCallback)(function () {
        if (!selectionCount) {
            setFeedback({ type: 'warning', message: 'Selectează cel puțin un ingredient pentru actualizare în masă.' });
            return;
        }
        setBulkModalOpen(true);
    }, [selectionCount]);
    var handleBulkApplied = (0, react_1.useCallback)(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var parts;
        var updatedCount = _b.updatedCount, visibilityAction = _b.visibilityAction, minStock = _b.minStock, costPerUnit = _b.costPerUnit;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    parts = ["Actualizare aplicat\u0103 pentru ".concat(updatedCount, " ingrediente.")];
                    if (typeof minStock === 'number') {
                        parts.push("Stoc minim setat la ".concat(minStock, "."));
                    }
                    if (typeof costPerUnit === 'number') {
                        parts.push("Cost/unitate actualizat la ".concat(costPerUnit.toFixed(2), " RON."));
                    }
                    if (visibilityAction === 'hide') {
                        parts.push('Ingredientele au fost marcate ca neinventariabile.');
                    }
                    else if (visibilityAction === 'restore') {
                        parts.push('Ingredientele au fost restaurate în gestiune.');
                    }
                    setFeedback({ type: 'success', message: parts.join(' ') });
                    setBulkModalOpen(false);
                    setSelectedIngredients([]);
                    return [4 /*yield*/, refetch()];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); }, []);
    var handleHideSelected = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var apiError_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!selectionCount) {
                        setFeedback({ type: 'warning', message: 'Selectează ingredientele pe care dorești să le ascunzi.' });
                        return [2 /*return*/];
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Promise.all(selectedIngredients.map(function (item) { return httpClient_1.httpClient.patch("/api/ingredients/".concat(item.id, "/hide")); }))];
                case 2:
                    _d.sent();
                    setFeedback({ type: 'success', message: "Au fost ascunse ".concat(selectionCount, " ingrediente.") });
                    setSelectedIngredients([]);
                    return [4 /*yield*/, refetch()];
                case 3:
                    _d.sent();
                    return [3 /*break*/, 5];
                case 4:
                    apiError_1 = _d.sent();
                    console.error('❌ Eroare la ascunderea ingredientelor:', apiError_1);
                    setFeedback({ type: 'error', message: (_c = (_b = (_a = apiError_1 === null || apiError_1 === void 0 ? void 0 : apiError_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) !== null && _c !== void 0 ? _c : 'Nu s-a putut finaliza acțiunea.' });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [selectedIngredients, selectionCount, refetch]);
    var handleRestoreSelected = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var apiError_2;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!selectionCount) {
                        setFeedback({ type: 'warning', message: 'Selectează ingredientele pe care dorești să le restaurezi.' });
                        return [2 /*return*/];
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Promise.all(selectedIngredients.map(function (item) { return httpClient_1.httpClient.patch("/api/ingredients/".concat(item.id, "/restore")); }))];
                case 2:
                    _d.sent();
                    setFeedback({ type: 'success', message: "Au fost restaurate ".concat(selectionCount, " ingrediente.") });
                    setSelectedIngredients([]);
                    return [4 /*yield*/, refetch()];
                case 3:
                    _d.sent();
                    return [3 /*break*/, 5];
                case 4:
                    apiError_2 = _d.sent();
                    console.error('❌ Eroare la restaurarea ingredientelor:', apiError_2);
                    setFeedback({ type: 'error', message: (_c = (_b = (_a = apiError_2 === null || apiError_2 === void 0 ? void 0 : apiError_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) !== null && _c !== void 0 ? _c : 'Nu s-a putut finaliza acțiunea de restaurare.' });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [selectedIngredients, selectionCount, refetch]);
    var handleExportCsv = (0, react_1.useCallback)(function () {
        if (!filteredData.length) {
            setFeedback({ type: 'warning', message: 'Nu există date de exportat.' });
            return;
        }
        var headers = [
            'ID',
            'Nume',
            'Categorie',
            'Unitate',
            'Stoc curent',
            'Stoc minim',
            'Cost/unitate',
            'Furnizor',
            'Țară origine',
            'Vizibil',
        ];
        var rows = filteredData.map(function (item) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return [
                item.id,
                "\"".concat((_a = item.name) !== null && _a !== void 0 ? _a : '', "\""),
                "\"".concat((_b = item.category) !== null && _b !== void 0 ? _b : '', "\""),
                (_c = item.unit) !== null && _c !== void 0 ? _c : '',
                (_d = item.current_stock) !== null && _d !== void 0 ? _d : '',
                (_e = item.min_stock) !== null && _e !== void 0 ? _e : '',
                (_f = item.cost_per_unit) !== null && _f !== void 0 ? _f : '',
                "\"".concat((_g = item.supplier) !== null && _g !== void 0 ? _g : '', "\""),
                "\"".concat((_h = item.origin_country) !== null && _h !== void 0 ? _h : '', "\""),
                isTrue(item.is_hidden) ? 'Ascuns' : 'Activ',
            ];
        });
        var csvContent = __spreadArray([headers.join(',')], rows.map(function (row) { return row.join(','); }), true).join('\n');
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = "ingredients-".concat(new Date().toISOString().slice(0, 10), ".csv");
        link.click();
        URL.revokeObjectURL(url);
        setFeedback({ type: 'success', message: 'Export CSV generat cu succes.' });
    }, [filteredData]);
    var handleDrawerVisibility = (0, react_1.useCallback)(function (action) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!primaryIngredient)
                        return [2 /*return*/];
                    if (!(action === 'hide')) return [3 /*break*/, 2];
                    return [4 /*yield*/, httpClient_1.httpClient.patch("/api/ingredients/".concat(primaryIngredient.id, "/hide"))];
                case 1:
                    _a.sent();
                    setFeedback({ type: 'success', message: "Ingredientul \"".concat(primaryIngredient.name, "\" a fost ascuns.") });
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, httpClient_1.httpClient.patch("/api/ingredients/".concat(primaryIngredient.id, "/restore"))];
                case 3:
                    _a.sent();
                    setFeedback({ type: 'success', message: "Ingredientul \"".concat(primaryIngredient.name, "\" a fost restaurat.") });
                    _a.label = 4;
                case 4: return [4 /*yield*/, refetch()];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [primaryIngredient, refetch]);
    var handleCloseDetails = (0, react_1.useCallback)(function () {
        setDetailsOpen(false);
    }, []);
    return (<div className="ingredients-page" data-page-ready={isPageReady ? 'true' : 'false'}>
      <section className="ingredients-hero">
        <div className="ingredients-hero__info">
          <div className="ingredients-hero__labels">
            <span className="ingredients-chip ingredients-chip--primary">Trasabilitate live</span>
            <span className="ingredients-chip">HACCP ready</span>
            <span className="ingredients-chip">Integrat cu recepții loturi</span>
          </div>
          <h2>Inventar operațional "“ Ingrediente</h2>
          <p>
            Vizualizezi în timp real stocurile, temperaturile controlate și documentele asociate fiecărui ingredient.
            AG Grid oferă filtrare avansată, sortare și export Excel.
          </p>
        </div>

        <div className="ingredients-hero__stats">
          <StatCard_1.StatCard title="Ingrediente active" helper="Disponibile în meniuri și rețete" value={"".concat(activeIngredients)} trendLabel="vs. săptămâna trecută" trendValue="▲ 12%" trendDirection="up" icon={<span>✅</span>}/>

          <StatCard_1.StatCard title="Stoc critic" helper="Sub nivelul de reaprovisionare" value="18 ingrediente" trendLabel="Necesită acțiune" trendValue="9 urgente" trendDirection="down" icon={<span>⚠️</span>} footer={<button type="button" className="ingredients-link-button">
                Vezi lista
              </button>}/>

          <StatCard_1.StatCard title="documente haccp" helper="Fișe actualizate în ultimele 30 zile" value="96% conform" trendLabel="Documente expirate" trendValue="2" trendDirection="flat" icon={<span>📄</span>}/>
        </div>

        <div className="ingredients-hero__analytics">
          <div className="ingredients-analytics-card">
            <header>
              <span className="ingredients-analytics-title">Top consum săptămânal</span>
              <span className="ingredients-analytics-helper">kg utilizați / zi</span>
            </header>
            <MiniBarChart_1.MiniBarChart data={topConsumptionData}/>
          </div>

          <div className="ingredients-analytics-card">
            <header>
              <span className="ingredients-analytics-title">Distribuție stoc pe categorii</span>
              <span className="ingredients-analytics-helper">% din total stoc</span>
            </header>
            <MiniDonutChart_1.MiniDonutChart data={stockDistributionData}/>
            <ul className="ingredients-legend">
              {stockDistributionData.map(function (item) { return (<li key={item.name}>
                  <span style={{ backgroundColor: item.color }} aria-hidden="true"/>
                  {item.name}
                  <strong>{item.value}%</strong>
                </li>); })}
            </ul>
          </div>
        </div>
      </section>

      <section className="ingredients-toolbar" aria-label="filtre si actiuni">
        <div className="ingredients-toolbar__left">
          <TableFilter_1.TableFilter value={quickFilter} onChange={setQuickFilter} placeholder="Caută ingredient după nume, categorie sau furnizor..." aria-label="Filtru rapid ingrediente"/>
          <label className="ingredients-toggle">
            <input type="checkbox" checked={showHidden} onChange={function (event) { return setShowHidden(event.target.checked); }}/>
            Afișează ingredientele ascunse ({hiddenIngredients})
          </label>
        </div>
        <div className="ingredients-toolbar__actions">
          <button type="button" className="ingredients-btn ingredients-btn--ghost" onClick={function () { return refetch(); }}>
            🔄 Reîmprospătează datele
          </button>
          <button type="button" className="ingredients-btn ingredients-btn--ghost" onClick={handleOpenBulkModal} disabled={selectionCount === 0}>
            📦 Ajustare în masă
          </button>
          <button type="button" className="ingredients-btn ingredients-btn--ghost" onClick={function () { return handleOpenDetails('documents'); }} disabled={!primaryIngredient}>
            📄 Documente HACCP
          </button>
          <button type="button" className="ingredients-btn ingredients-btn--ghost" onClick={function () { return handleOpenDetails('traceability'); }} disabled={!primaryIngredient}>
            🧭 Trasabilitate
          </button>
          <button type="button" className="ingredients-btn ingredients-btn--ghost" onClick={handleHideSelected} disabled={selectionCount === 0}>
            👻 Marchează neinventariabil
          </button>
          <button type="button" className="ingredients-btn ingredients-btn--ghost" onClick={handleRestoreSelected} disabled={selectionCount === 0}>
            ✅ Restaurează selecția
          </button>
          <button type="button" className="ingredients-btn ingredients-btn--primary" onClick={handleExportCsv}>
            ⬇️ Export CSV
          </button>
        </div>
      </section>

      <div className="ingredients-feedback">
        {feedback ? (<InlineAlert_1.InlineAlert variant={feedback.type} title={feedback.type === 'success' ? 'Succes' : feedback.type === 'error' ? 'Eroare' : 'Informație'} message={feedback.message}/>) : null}
        {error ? <InlineAlert_1.InlineAlert type="error" message={error}/> : null}
      </div>

      <section className="ingredients-grid-panel">
        <header>
          <div>
            <h3>Lista completă de ingrediente</h3>
            <p>{"".concat(totalIngredients, " ingrediente \u2022 Mod filtrare rapid\u0103 activ")}</p>
          </div>
          <div className="ingredients-selection">
            {primaryIngredient
            ? "Ingredient selectat: ".concat(primaryIngredient.name)
            : selectionCount > 1
                ? "".concat(selectionCount, " ingrediente selectate.")
                : 'Selectează ingrediente pentru acțiuni bulk sau detalii.'}
          </div>
          <button type="button" className="ingredients-btn ingredients-btn--outline" onClick={handleAddIngredient}>
            + Adaugă ingredient nou
          </button>
        </header>
        <DataGrid_1.DataGrid columnDefs={columnDefs} rowData={filteredData} loading={loading} quickFilterText={quickFilter} height="60vh" rowSelection="multiple" gridOptions={{
            rowHeight: 52,
            headerHeight: 46,
            suppressScrollOnNewData: true,
        }} agGridProps={{
            onCellClicked: handleCellClicked,
            onRowDoubleClicked: handleRowDoubleClicked,
            getRowId: function (params) { var _a; return (((_a = params.data) === null || _a === void 0 ? void 0 : _a.id) ? params.data.id.toString() : ''); },
        }} onSelectedRowsChange={handleSelectionChange}/>
      </section>

      <section className="ingredients-secondary">
        <article className="ingredients-secondary__card">
          <header>
            <span>Trasabilitate & documente</span>
            <button type="button" className="ingredients-link-button">
              Vezi traseu complet →
            </button>
          </header>
          <ul>
            <li>
              <strong>Documente HACCP valabile</strong>
              <span>184 / 192</span>
            </li>
            <li>
              <strong>Loturi recepționate săptămâna aceasta</strong>
              <span>27 loturi</span>
            </li>
            <li>
              <strong>Ingrediente cu temperatură critică</strong>
              <span>3 ingrediente</span>
            </li>
          </ul>
        </article>

        <article className="ingredients-secondary__card">
          <header>
            <span>Automatizări & alerte</span>
            <button type="button" className="ingredients-link-button">
              Configurează notificări →
            </button>
          </header>
          <ul>
            <li>
              <strong>Alerte stoc critic</strong>
              <span>Livrare în 6h</span>
            </li>
            <li>
              <strong>Recepții în curs de validare</strong>
              <span>2 documente</span>
            </li>
            <li>
              <strong>Integrare GPT Bridge</strong>
              <span>Online</span>
            </li>
          </ul>
        </article>
      </section>
      <IngredientEditorModal_1.IngredientEditorModal open={editorOpen} ingredient={editingIngredient} onClose={function () { return setEditorOpen(false); }} onSaved={function () { return refetch(); }}/>

      <IngredientBulkUpdateModal_1.IngredientBulkUpdateModal open={bulkModalOpen} ingredientIds={selectedIngredients.map(function (item) { return item.id; })} onClose={function () { return setBulkModalOpen(false); }} onApplied={handleBulkApplied}/>

      <IngredientDetailsDrawer_1.IngredientDetailsDrawer open={detailsOpen} ingredient={primaryIngredient} initialTab={detailsTab} onClose={handleCloseDetails} onVisibilityChanged={handleDrawerVisibility}/>
    </div>);
};
exports.IngredientsPage = IngredientsPage;
