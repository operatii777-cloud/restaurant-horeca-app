"use strict";
/**
 * AdminDataGrid - Wrapper standardizat pentru AG Grid
 * Boogit-like: grid ca element principal, densitate compactă
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
exports.AdminDataGrid = void 0;
var react_1 = require("react");
var ag_grid_react_1 = require("ag-grid-react");
require("ag-grid-community/styles/ag-grid.css");
require("ag-grid-community/styles/ag-theme-quartz.css");
require("./AdminDataGrid.css");
var AdminDataGrid = function (_a) {
    var columnDefs = _a.columnDefs, rowData = _a.rowData, _b = _a.loading, loading = _b === void 0 ? false : _b, quickFilterText = _a.quickFilterText, rowSelection = _a.rowSelection, onRowClicked = _a.onRowClicked, onRowDoubleClicked = _a.onRowDoubleClicked, onSelectedRowsChange = _a.onSelectedRowsChange, getRowId = _a.getRowId, gridOptions = _a.gridOptions, _c = _a.className, className = _c === void 0 ? '' : _c;
    var defaultColDef = (0, react_1.useMemo)(function () { return ({
        resizable: true,
        sortable: true,
        filter: true,
        floatingFilter: true,
    }); }, []);
    var finalGridOptions = (0, react_1.useMemo)(function () { return (__assign({ rowHeight: 44, headerHeight: 48, animateRows: true, suppressCellFocus: true }, gridOptions)); }, 'gridOptions');
    return (<div className={"admin-data-grid ".concat(className)}>
      <ag_grid_react_1.AgGridReact columnDefs={columnDefs} rowData={rowData} defaultColDef={defaultColDef} quickFilterText={quickFilterText} rowSelection={rowSelection} onRowClicked={function (e) {
            if (e.data)
                onRowClicked === null || onRowClicked === void 0 ? void 0 : onRowClicked(e.data);
        }} onRowDoubleClicked={function (e) {
            if (e.data)
                onRowDoubleClicked === null || onRowDoubleClicked === void 0 ? void 0 : onRowDoubleClicked(e.data);
        }} onSelectionChanged={function (e) {
            if (onSelectedRowsChange) {
                var selectedRows = e.api.getSelectedRows();
                onSelectedRowsChange(selectedRows);
            }
        }} getRowId={getRowId} gridOptions={finalGridOptions} loading={loading}/>
    </div>);
};
exports.AdminDataGrid = AdminDataGrid;
