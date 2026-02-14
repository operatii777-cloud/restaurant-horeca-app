"use strict";
/**
 * AgGridTable - Global AG Grid Wrapper Component
 *
 * Standardizare pentru toate tabelele AG Grid din aplicație.
 * Elimină duplicarea configurației și asigură consistență.
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
exports.AgGridTable = void 0;
var react_1 = require("react");
var ag_grid_react_1 = require("ag-grid-react");
var agGridConfig_1 = require("./agGridConfig");
// AG Grid CSS imported globally with theme="legacy"
require("./AgGridTable.css");
var AgGridTable = function (_a) {
    var columnDefs = _a.columnDefs, rowData = _a.rowData, _b = _a.loading, loading = _b === void 0 ? false : _b, _c = _a.gridOptions, gridOptions = _c === void 0 ? {} : _c, _d = _a.className, className = _d === void 0 ? '' : _d, _e = _a.height, height = _e === void 0 ? 600 : _e, _f = _a.width, width = _f === void 0 ? '100%' : _f, onGridReady = _a.onGridReady, onRowSelected = _a.onRowSelected, onCellClicked = _a.onCellClicked;
    // Merge local options with defaults
    var mergedGridOptions = (0, react_1.useMemo)(function () {
        return (0, agGridConfig_1.mergeGridOptions)(__assign(__assign({}, gridOptions), { loading: loading, onGridReady: onGridReady, onRowSelected: onRowSelected, onCellClicked: onCellClicked }));
    }, [gridOptions, loading, onGridReady, onRowSelected, onCellClicked]);
    return (<div className={"ag-grid-table-wrapper ag-theme-alpine-dark ".concat(className)} style={{ height: typeof height === 'number' ? "".concat(height, "px") : height, width: width }}>
      <ag_grid_react_1.AgGridReact theme="legacy" columnDefs={columnDefs} rowData={rowData || []} {...mergedGridOptions}/>
    </div>);
};
exports.AgGridTable = AgGridTable;
