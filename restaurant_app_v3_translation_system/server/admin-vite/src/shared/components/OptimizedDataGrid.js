"use strict";
/**
 * OPTIMIZED DATA GRID
 * Versiune optimizată a DataGrid cu React.memo și useMemo
 * Windows-style: clean, minimal, performant
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizedDataGrid = void 0;
var react_1 = require("react");
var DataGrid_1 = require("./DataGrid");
var SkeletonLoader_1 = require("./SkeletonLoader");
/**
 * Optimized DataGrid - Memoized pentru a preveni re-render-uri inutile
 */
exports.OptimizedDataGrid = (0, react_1.memo)(function (_a) {
    var columnDefs = _a.columnDefs, rowData = _a.rowData, loading = _a.loading, _b = _a.enableOptimization, enableOptimization = _b === void 0 ? true : _b, props = __rest(_a, ["columnDefs", "rowData", "loading", "enableOptimization"]);
    // Memoize columnDefs dacă nu se schimbă
    var memoizedColumnDefs = (0, react_1.useMemo)(function () { return columnDefs; }, [columnDefs]);
    // Memoize rowData dacă nu se schimbă
    var memoizedRowData = (0, react_1.useMemo)(function () {
        if (!rowData)
            return null;
        // Deep clone pentru a evita referințe mutate
        return JSON.parse(JSON.stringify(rowData));
    }, [rowData]);
    if (loading) {
        return <SkeletonLoader_1.TableSkeleton rows={5} columns={memoizedColumnDefs.length}/>;
    }
    return (<DataGrid_1.DataGrid columnDefs={memoizedColumnDefs} rowData={memoizedRowData} loading={loading} {...props}/>);
}, function (prevProps, nextProps) {
    // Custom comparison pentru optimizare
    if (!nextProps.enableOptimization) {
        return false; // Re-render dacă optimizarea e dezactivată
    }
    // Compară doar proprietățile importante
    return (prevProps.loading === nextProps.loading &&
        prevProps.rowData === nextProps.rowData &&
        prevProps.columnDefs === nextProps.columnDefs &&
        prevProps.height === nextProps.height &&
        prevProps.rowSelection === nextProps.rowSelection);
});
exports.OptimizedDataGrid.displayName = 'OptimizedDataGrid';
