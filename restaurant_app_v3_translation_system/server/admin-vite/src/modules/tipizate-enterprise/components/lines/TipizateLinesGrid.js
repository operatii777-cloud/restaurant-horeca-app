"use strict";
/**
 * PHASE S5.3 - Tipizate Lines Grid
 * Generic AG Grid component for tipizate document lines
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
exports.TipizateLinesGrid = void 0;
var react_1 = require("react");
var ag_grid_react_1 = require("ag-grid-react");
var tipizate_config_1 = require("../../config/tipizate.config");
var TipizateLineEditorModal_1 = require("./TipizateLineEditorModal");
var TipizateLinesGrid = function (_a) {
    var type = _a.type, lines = _a.lines, setLines = _a.setLines, _b = _a.loading, loading = _b === void 0 ? false : _b, onAddLine = _a.onAddLine, onEditLine = _a.onEditLine, onDeleteLine = _a.onDeleteLine;
    var _c = (0, react_1.useState)(false), modalOpen = _c[0], setModalOpen = _c[1];
    var _d = (0, react_1.useState)(null), editingLine = _d[0], setEditingLine = _d[1];
    var _e = (0, react_1.useState)(-1), editingIndex = _e[0], setEditingIndex = _e[1];
    // Set up global functions for AG Grid cell renderers
    react_1.default.useEffect(function () {
        window.editLine = function (index) {
            var line = lines[index];
            if (line && onEditLine) {
                onEditLine(line, index);
            }
        };
        window.deleteLine = function (index) {
            if (onDeleteLine) {
                onDeleteLine(index);
            }
        };
        return function () {
            delete window.editLine;
            delete window.deleteLine;
        };
    }, [lines, onEditLine, onDeleteLine]);
    var handleAddLine = function () {
        setEditingLine(null);
        setEditingIndex(-1);
        setModalOpen(true);
    };
    var handleEditLine = function (line, index) {
        setEditingLine(line);
        setEditingIndex(index);
        setModalOpen(true);
    };
    var handleSaveLine = function (line) {
        var newLines = __spreadArray([], lines, true);
        if (editingIndex >= 0) {
            // Edit existing line
            newLines[editingIndex] = __assign(__assign({}, line), { lineNumber: editingIndex + 1 });
            if (onEditLine)
                onEditLine(line, editingIndex);
        }
        else {
            // Add new line
            newLines.push(__assign(__assign({}, line), { lineNumber: newLines.length + 1 }));
            if (onAddLine)
                onAddLine();
        }
        setLines(newLines);
        setModalOpen(false);
        setEditingLine(null);
        setEditingIndex(-1);
    };
    var handleDeleteLine = function (index) {
        if (window.confirm('Sigur vrei să ștergi această linie?')) {
            var newLines = lines.filter(function (_, i) { return i !== index; });
            // Renumber lines
            newLines.forEach(function (line, i) {
                line.lineNumber = i + 1;
            });
            setLines(newLines);
            if (onDeleteLine)
                onDeleteLine(index);
        }
    };
    var columnDefs = (0, react_1.useMemo)(function () {
        var config = (0, tipizate_config_1.columnsFor)(type);
        var cols = config.map(function (col) {
            var _a, _b;
            return ({
                field: col.field,
                headerName: col.headerName,
                editable: (_a = col.editable) !== null && _a !== void 0 ? _a : false,
                width: (_b = col.width) !== null && _b !== void 0 ? _b : 150,
                cellRenderer: col.type === 'currency'
                    ? function (params) { return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(params.value || 0); }
                    : undefined,
                valueParser: col.type === 'number' || col.type === 'currency'
                    ? function (params) { return parseFloat(params.newValue) || 0; }
                    : undefined,
            });
        });
        // Add actions column with custom cell renderer
        cols.push({
            headerName: 'Acțiuni',
            width: 120,
            cellRenderer: function (params) {
                var index = params.rowIndex;
                return "\n          <div class=\"flex gap-2 items-center\">\n            <button class=\"px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors\"\n                    title=\"Editeaz\u0103\"\n                    onclick=\"window.editLine(".concat(index, ")\">\u270F\uFE0F</button>\n            <button class=\"px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors\"\n                    title=\"\u0218terge\"\n                    onclick=\"window.deleteLine(").concat(index, ")\">\uD83D\uDDD1\uFE0F</button>\n          </div>\n        ");
            },
            sortable: false,
            filter: false,
        });
        return cols;
    }, [type, lines]);
    var defaultColDef = (0, react_1.useMemo)(function () { return ({
        resizable: true,
        sortable: true,
        filter: true,
    }); }, []);
    var onCellValueChanged = function (params) {
        var _a;
        var newLines = __spreadArray([], lines, true);
        var index = params.rowIndex;
        newLines[index] = __assign(__assign({}, newLines[index]), (_a = {}, _a[params.colDef.field] = params.newValue, _a));
        // Auto-calculate totals if needed
        if (params.colDef.field === 'quantity' || params.colDef.field === 'unitPrice') {
            var line = newLines[index];
            var totalWithoutVat = (line.quantity || 0) * (line.unitPrice || 0);
            var totalVat = (totalWithoutVat * (line.vatRate || 0)) / 100;
            newLines[index] = __assign(__assign({}, line), { totalWithoutVat: totalWithoutVat, totalVat: totalVat, totalWithVat: totalWithoutVat + totalVat });
        }
        setLines(newLines);
    };
    return (<>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Linii Document ({lines.length})
        </h3>
        <button onClick={handleAddLine} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-bold shadow-sm border-2 border-blue-700" style={{
            backgroundColor: '#1e40af !important',
            color: '#ffffff !important',
            fontWeight: 'bold'
        }}>
          + Adaugă Linie
        </button>
      </div>

      <div className="ag-theme-alpine-dark w-full" style={{ height: '500px', margin: 0, padding: 0 }}>
        <ag_grid_react_1.AgGridReact theme="legacy" rowData={lines} columnDefs={columnDefs} defaultColDef={defaultColDef} onCellValueChanged={onCellValueChanged} animateRows={true} rowSelection={{ mode: 'multiRow', enableClickSelection: false }} loading={loading} pagination={true} paginationPageSize={25} paginationPageSizeSelector={[10, 25, 50, 100]} // Dropdown for page size
    />
      </div>

      <TipizateLineEditorModal_1.TipizateLineEditorModal isOpen={modalOpen} onClose={function () {
            setModalOpen(false);
            setEditingLine(null);
            setEditingIndex(-1);
        }} onSave={handleSaveLine} line={editingLine} mode={editingIndex >= 0 ? 'edit' : 'create'} loading={loading}/>
    </>);
};
exports.TipizateLinesGrid = TipizateLinesGrid;
