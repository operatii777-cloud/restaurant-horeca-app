"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataGrid = DataGrid;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var ag_grid_react_1 = require("ag-grid-react");
var ag_grid_community_1 = require("ag-grid-community");
var ag_grid_community_2 = require("ag-grid-community");
var presets_1 = require("@/shared/agGrid/presets");
require("./DataGrid.css");
// Register AG Grid modules at module level (no translation needed for module names)
ag_grid_community_1.ModuleRegistry.registerModules([ag_grid_community_2.AllCommunityModule]);
function DataGrid(_a) {
    var columnDefs = _a.columnDefs, rowData = _a.rowData, _b = _a.loading, loading = _b === void 0 ? false : _b, quickFilterText = _a.quickFilterText, _c = _a.height, height = _c === void 0 ? '65vh' : _c, rowSelection = _a.rowSelection, gridOptions = _a.gridOptions, agGridProps = _a.agGridProps, onSelectedRowsChange = _a.onSelectedRowsChange, onSelectionChanged = _a.onSelectionChanged, onGridReady = _a.onGridReady;
    var gridRef = (0, react_1.useRef)(null);
    //   const { t } = useTranslation(); // ✅ Hook apelat la nivelul componentei
    var rowSelectionConfig = (0, presets_1.getRowSelectionOptions)(rowSelection);
    var defaultOptions = (0, presets_1.getDefaultGridOptions)();
    // Don't set theme in gridOptions - use className instead (ag-theme-alpine)
    // AG Grid v34+ requires theme to be "legacy" or a Theming API object
    var mergedGridOptions = (0, presets_1.mergeGridOptions)(gridOptions, defaultOptions);
    (0, react_1.useEffect)(function () {
        if (!gridRef.current)
            return;
        var api = gridRef.current.api;
        if (!api)
            return;
        // Use new AG Grid v32+ API instead of deprecated showLoadingOverlay
        if (loading) {
            api.setGridOption('loading', true);
        }
        else {
            api.setGridOption('loading', false);
            if (!rowData || rowData.length === 0) {
                api.showNoRowsOverlay();
            }
            else {
                api.hideOverlay();
            }
        }
    }, [loading, rowData]);
    (0, react_1.useEffect)(function () {
        if (!gridRef.current)
            return;
        if (!gridRef.current.api)
            return;
        gridRef.current.api.setGridOption('quickFilterText', quickFilterText !== null && quickFilterText !== void 0 ? quickFilterText : '');
    }, [quickFilterText]);
    var handleSelectionChanged = function (event) {
        var selected = event.api.getSelectedRows();
        console.log('DataGrid Selection changed, selected rows:', selected.length, selected);
        if (onSelectedRowsChange) {
            onSelectedRowsChange(selected);
        }
        if (onSelectionChanged) {
            onSelectionChanged(selected, event);
        }
        if (agGridProps === null || agGridProps === void 0 ? void 0 : agGridProps.onSelectionChanged) {
            agGridProps.onSelectionChanged(event);
        }
    };
    var handleGridReady = function (event) {
        var _a, _b;
        console.log('DataGrid Grid ready:', {
            rowCount: event.api.getDisplayedRowCount(),
            columnCount: ((_a = event.api.getColumnDefs()) === null || _a === void 0 ? void 0 : _a.length) || 0,
            height: height,
        });
        // Force size calculation
        setTimeout(function () {
            event.api.sizeColumnsToFit();
        }, 100);
        onGridReady === null || onGridReady === void 0 ? void 0 : onGridReady(event);
        (_b = agGridProps === null || agGridProps === void 0 ? void 0 : agGridProps.onGridReady) === null || _b === void 0 ? void 0 : _b.call(agGridProps, event);
    };
    return (<div className="data-grid ag-theme-alpine" style={{ height: height, margin: 0, padding: 0, width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <ag_grid_react_1.AgGridReact ref={gridRef} theme="legacy" columnDefs={columnDefs} rowData={rowData !== null && rowData !== void 0 ? rowData : []} defaultColDef={presets_1.DEFAULT_COLUMN_DEF} animateRows={false} // Minimal - Excel nu are animații
     suppressDragLeaveHidesColumns suppressCellFocus={false} // Excel-like - permitem focus
     rowSelection={rowSelectionConfig} onSelectionChanged={handleSelectionChanged} onGridReady={handleGridReady} gridOptions={mergedGridOptions} domLayout="normal" 
    // Paginare - doar dacă e specificat în props (minimal)
    {...agGridProps}/>
    </div>);
}
