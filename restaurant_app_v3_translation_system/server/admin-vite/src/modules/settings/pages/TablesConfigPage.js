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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablesConfigPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var DataGrid_1 = require("@/shared/components/DataGrid");
var TableEditorModal_1 = require("../components/TableEditorModal");
var BulkTableConfigModal_1 = require("../components/BulkTableConfigModal");
require("./TablesConfigPage.css");
var TablesConfigPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), tables = _a[0], setTables = _a[1];
    var _b = (0, react_1.useState)([]), zones = _b[0], setZones = _b[1];
    var _c = (0, react_1.useState)(null), selectedTable = _c[0], setSelectedTable = _c[1];
    var _d = (0, react_1.useState)(false), isEditorOpen = _d[0], setIsEditorOpen = _d[1];
    var _e = (0, react_1.useState)(false), isBulkConfigOpen = _e[0], setIsBulkConfigOpen = _e[1];
    var _f = (0, react_1.useState)(''), areaFilter = _f[0], setAreaFilter = _f[1];
    var _g = (0, react_1.useState)(''), statusFilter = _g[0], setStatusFilter = _g[1];
    var _h = (0, react_1.useState)(null), feedback = _h[0], setFeedback = _h[1];
    var _j = (0, useApiQuery_1.useApiQuery)('/api/tables'), tablesData = _j.data, tablesLoading = _j.loading, refetchTables = _j.refetch;
    var zonesData = (0, useApiQuery_1.useApiQuery)('/api/locations?type=operational').data;
    var _k = (0, useApiMutation_1.useApiMutation)(), updateTable = _k.mutate, isUpdating = _k.loading;
    (0, react_1.useEffect)(function () {
        if (tablesData === null || tablesData === void 0 ? void 0 : tablesData.data) {
            setTables(tablesData.data);
        }
    }, [tablesData]);
    (0, react_1.useEffect)(function () {
        if (zonesData === null || zonesData === void 0 ? void 0 : zonesData.data) {
            setZones(zonesData.data);
        }
    }, [zonesData]);
    var filteredTables = tables.filter(function (table) {
        var _a;
        if (areaFilter && ((_a = table.area_id) === null || _a === void 0 ? void 0 : _a.toString()) !== areaFilter)
            return false;
        if (statusFilter === 'configured' && (!table.area_id || !table.is_active))
            return false;
        if (statusFilter === 'unconfigured' && (table.area_id && table.is_active))
            return false;
        return true;
    });
    var handleEditTable = function (table) {
        setSelectedTable(table);
        setIsEditorOpen(true);
    };
    var handleSaveTable = function (tableData) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedTable)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, updateTable({
                            url: "/api/tables/".concat(selectedTable.id),
                            method: 'PUT',
                            data: {
                                table_number: tableData.table_number || selectedTable.table_number,
                                area_id: tableData.area_id || null,
                                seats: tableData.seats || tableData.capacity || 4,
                                capacity: tableData.capacity || tableData.seats || 4,
                                shape: tableData.shape || 'square',
                                is_active: tableData.is_active !== undefined ? tableData.is_active : true,
                                location: tableData.location || null,
                            },
                        })];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Masă actualizată cu succes!' });
                    setIsEditorOpen(false);
                    setSelectedTable(null);
                    refetchTables();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    setFeedback({ type: 'error', message: 'Eroare la actualizarea mesei' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleBulkConfig = function () {
        setIsBulkConfigOpen(true);
    };
    var columnDefs = [
        {
            headerName: 'Masă #',
            field: "Table Number",
            width: 100,
            cellRenderer: function (params) { return (<strong>Masă #{params.value}</strong>); },
        },
        {
            headerName: 'Zonă',
            field: 'area_name',
            width: 150,
            cellRenderer: function (params) {
                if (params.value) {
                    return <span className="tables-config-zone-badge">{params.value}</span>;
                }
                return <span className="tables-config-zone-none">"Neasociată"</span>;
            },
        },
        {
            headerName: 'Locuri',
            field: 'seats',
            width: 100,
            cellRenderer: function (params) {
                var _a;
                var seats = params.value || ((_a = params.data) === null || _a === void 0 ? void 0 : _a.capacity) || '-';
                return "\"Seats\" locuri";
            },
        },
        {
            headerName: 'Formă',
            field: 'shape',
            width: 100,
            cellRenderer: function (params) { return params.value || '-'; },
        },
        {
            headerName: 'Status',
            field: 'is_active',
            width: 120,
            cellRenderer: function (params) {
                var _a;
                var isActive = params.value;
                var isConfigured = (_a = params.data) === null || _a === void 0 ? void 0 : _a.area_id;
                return (<div className="tables-config-status">
            {isActive ? (<span className="tables-config-status-badge tables-config-status-badge--active">Activ</span>) : (<span className="tables-config-status-badge tables-config-status-badge--inactive">Inactiv</span>)}
            {!isConfigured && (<span className="tables-config-status-badge tables-config-status-badge--warning">Neconfigurat</span>)}
          </div>);
            },
        },
        {
            headerName: 'Acțiuni',
            width: 120,
            cellRenderer: function (params) { return (<button className="tables-config-action-btn" onClick={function () { return handleEditTable(params.data); }}>
          ⚙️ Config
        </button>); },
        },
    ];
    return (<div className="tables-config-page">
      <div className="tables-config-page__header">
        <div>
          <h3>🪑 Configurare Mese (1-200)</h3>
          <p className="tables-config-page__subtitle">Configurează fiecare masă: zonă, număr locuri, formă</p>
        </div>
        <div className="tables-config-page__actions">
          <button className="tables-config-page__btn tables-config-page__btn--secondary" onClick={function () { return refetchTables(); }}>
            🔄 Refresh
          </button>
          <button className="tables-config-page__btn tables-config-page__btn--primary" onClick={handleBulkConfig}>
            📦 Configurare Bulk
          </button>
        </div>
      </div>

      {feedback && (<InlineAlert_1.InlineAlert variant={feedback.type} message={feedback.message} onClose={function () { return setFeedback(null); }}/>)}

      <div className="tables-config-page__filters">
        <div className="tables-config-page__filter">
          <label htmlFor="areaFilter" className="tables-config-page__filter-label">Filtrează după zonă</label>
          <select id="areaFilter" className="tables-config-page__filter-select" value={areaFilter} onChange={function (e) { return setAreaFilter(e.target.value); }}>
            <option value="">"toate zonele"</option>
            {zones.map(function (zone) { return (<option key={zone.id} value={zone.id.toString()}>
                {zone.name}
              </option>); })}
          </select>
        </div>

        <div className="tables-config-page__filter">
          <label htmlFor="statusFilter" className="tables-config-page__filter-label">
            Status:
          </label>
          <select id="statusFilter" className="tables-config-page__filter-select" value={statusFilter} onChange={function (e) { return setStatusFilter(e.target.value); }}>
            <option value="">"Toate"</option>
            <option value="configured">Configurate</option>
            <option value="unconfigured">Neconfigurate</option>
          </select>
        </div>
      </div>

      <div className="tables-config-page__grid">
        <DataGrid_1.DataGrid columnDefs={columnDefs} rowData={filteredTables} loading={tablesLoading} rowSelection="single" height="clamp(400px, 60vh, 800px)"/>
      </div>

      {isEditorOpen && selectedTable && (<TableEditorModal_1.TableEditorModal table={selectedTable} zones={zones} onSave={handleSaveTable} onClose={function () {
                setIsEditorOpen(false);
                setSelectedTable(null);
            }}/>)}

      {isBulkConfigOpen && (<BulkTableConfigModal_1.BulkTableConfigModal tables={tables} zones={zones} onSave={function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    setFeedback({ type: 'success', message: 'Configurare bulk aplicată cu succes!' });
                    setIsBulkConfigOpen(false);
                    refetchTables();
                    return [2 /*return*/];
                });
            }); }} onClose={function () { return setIsBulkConfigOpen(false); }}/>)}
    </div>);
};
exports.TablesConfigPage = TablesConfigPage;
