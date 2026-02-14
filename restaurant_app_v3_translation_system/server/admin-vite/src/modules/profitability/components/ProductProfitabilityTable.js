"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S14 - Product Profitability Table Component
 * AG Grid table pentru afișarea profitabilității pe produse cu acțiune Sync COGS
 */
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
exports.ProductProfitabilityTable = void 0;
var react_1 = require("react");
var ag_grid_react_1 = require("ag-grid-react");
var react_bootstrap_1 = require("react-bootstrap");
var profitabilityApi_1 = require("../api/profitabilityApi");
// AG Grid CSS imported globally with theme="legacy"
require("./ProductProfitabilityTable.css");
var ProductProfitabilityTable = function (_a) {
    var rows = _a.rows, _b = _a.loading, loading = _b === void 0 ? false : _b, onSyncComplete = _a.onSyncComplete;
    //   const { t } = useTranslation();
    var handleSyncCogs = function (productId) { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, profitabilityApi_1.syncCogs)(productId)];
                case 1:
                    result = _a.sent();
                    if (result.success) {
                        // Refresh data after sync
                        if (onSyncComplete) {
                            onSyncComplete();
                        }
                    }
                    else {
                        alert('Eroare la sincronizare COGS: ' + (result.message || 'Eroare necunoscută'));
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error syncing COGS:', error_1);
                    alert('Eroare la sincronizare COGS: ' + (error_1.message || 'Eroare necunoscută'));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var getFoodCostBadge = function (foodCostPercent) {
        if (foodCostPercent < 25) {
            return <react_bootstrap_1.Badge bg="success">Excelent</react_bootstrap_1.Badge>;
        }
        else if (foodCostPercent < 30) {
            return <react_bootstrap_1.Badge bg="info">Bun</react_bootstrap_1.Badge>;
        }
        else if (foodCostPercent < 35) {
            return <react_bootstrap_1.Badge bg="warning">Atenție</react_bootstrap_1.Badge>;
        }
        else {
            return <react_bootstrap_1.Badge bg="danger">"Pericol"</react_bootstrap_1.Badge>;
        }
    };
    var columnDefs = (0, react_1.useMemo)(function () { return [
        {
            field: 'productName',
            headerName: 'Produs',
            flex: 2,
            pinned: 'left',
            cellRenderer: function (params) { return (<div>
            <strong>{params.value}</strong>
            <br />
            <small className="text-muted">{params.data.category}</small>
          </div>); },
        },
        {
            field: 'quantity',
            headerName: 'Cantitate',
            width: 100,
            valueFormatter: function (params) { var _a; return ((_a = params.value) === null || _a === void 0 ? void 0 : _a.toFixed(0)) || '0'; },
        },
        {
            field: "Revenue",
            headerName: 'Venituri',
            width: 130,
            valueFormatter: function (params) { var _a; return "".concat(((_a = params.value) === null || _a === void 0 ? void 0 : _a.toFixed(2)) || '0.00', " RON"); },
            cellStyle: { textAlign: 'right' },
        },
        {
            field: 'cogsTotal',
            headerName: 'COGS',
            width: 130,
            valueFormatter: function (params) { var _a; return "".concat(((_a = params.value) === null || _a === void 0 ? void 0 : _a.toFixed(2)) || '0.00', " RON"); },
            cellStyle: { textAlign: 'right' },
        },
        {
            field: 'profit',
            headerName: 'Profit',
            width: 130,
            valueFormatter: function (params) { var _a; return "".concat(((_a = params.value) === null || _a === void 0 ? void 0 : _a.toFixed(2)) || '0.00', " RON"); },
            cellStyle: { textAlign: 'right', fontWeight: 'bold' },
            cellClass: function (params) {
                return params.value >= 0 ? 'profit-positive' : 'profit-negative';
            },
        },
        {
            field: 'foodCostPercent',
            headerName: 'Food Cost %',
            width: 140,
            cellRenderer: function (params) {
                var value = params.value || 0;
                return (<div>
              <strong>{value.toFixed(1)}%</strong>
              <br />
              {getFoodCostBadge(value)}
            </div>);
            },
            cellStyle: { textAlign: 'center' },
        },
        {
            field: 'marginPercent',
            headerName: 'Marjă %',
            width: 120,
            valueFormatter: function (params) { var _a; return "".concat(((_a = params.value) === null || _a === void 0 ? void 0 : _a.toFixed(1)) || '0.0', "%"); },
            cellStyle: { textAlign: 'right' },
        },
        {
            field: 'actions',
            headerName: 'Acțiuni',
            width: 150,
            pinned: 'right',
            cellRenderer: function (params) { return (<react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={function () { return handleSyncCogs(params.data.productId); }} title="recalculeaza cogs pentru acest produs">
            <i className="fas fa-sync-alt me-1"></i>
            Sync COGS
          </react_bootstrap_1.Button>); },
        },
    ]; }, [onSyncComplete]);
    var defaultColDef = (0, react_1.useMemo)(function () { return ({
        sortable: true,
        filter: true,
        resizable: true,
    }); }, []);
    if (loading) {
        return (<div className="product-profitability-table">
        <div className="table-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
          <p className="text-muted mt-2">Se încarcă datele...</p>
        </div>
      </div>);
    }
    return (<div className="product-profitability-table">
      <div className="ag-theme-alpine-dark" style={{ height: '600px', width: '100%' }}>
        <ag_grid_react_1.AgGridReact theme="legacy" rowData={rows} columnDefs={columnDefs} defaultColDef={defaultColDef} pagination={true} paginationPageSize={50} animateRows={true} rowSelection={{ mode: 'singleRow', enableClickSelection: false }}/>
      </div>
    </div>);
};
exports.ProductProfitabilityTable = ProductProfitabilityTable;
