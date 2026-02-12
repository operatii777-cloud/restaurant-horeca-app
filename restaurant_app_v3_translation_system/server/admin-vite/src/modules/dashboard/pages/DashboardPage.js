"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardPage = void 0;
var react_1 = require("react");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useInterfacePins_1 = require("@/modules/waiters/hooks/useInterfacePins");
var pinUtils_1 = require("@/modules/waiters/utils/pinUtils");
var DataGrid_1 = require("@/shared/components/DataGrid");
var TableFilter_1 = require("@/shared/components/TableFilter");
var useDebouncedValue_1 = require("@/shared/hooks/useDebouncedValue");
var KPIBusinessSection_1 = require("@/modules/dashboard/components/KPIBusinessSection");
require("./DashboardPage.css");
var getRotationPriority = function (rotation) {
    var _a, _b;
    if (rotation.kind === 'due') {
        return -1000 - ((_a = rotation.daysSinceRotation) !== null && _a !== void 0 ? _a : 0);
    }
    if (rotation.kind === 'warning') {
        return (_b = rotation.daysUntilDue) !== null && _b !== void 0 ? _b : Number.POSITIVE_INFINITY;
    }
    return Number.POSITIVE_INFINITY;
};
var DashboardPage = function () {
    var _a = (0, useInterfacePins_1.useInterfacePins)(), pins = _a.pins, pinsLoading = _a.loading, pinsError = _a.error, refreshPins = _a.refresh;
    var _b = (0, react_1.useState)(''), rotationFilter = _b[0], setRotationFilter = _b[1];
    var debouncedFilter = (0, useDebouncedValue_1.useDebouncedValue)(rotationFilter, 200);
    var rotationRows = (0, react_1.useMemo)(function () {
        if (!Array.isArray(pins)) {
            return [];
        }
        return pins.map(function (pin) {
            var metadata = (0, pinUtils_1.getInterfaceMetadata)(pin.interface);
            var rotation = (0, pinUtils_1.computeRotationStatus)(pin);
            return { pin: pin, metadata: metadata, rotation: rotation };
        });
    }, [pins]);
    var upcomingRotations = (0, react_1.useMemo)(function () {
        return rotationRows
            .filter(function (_a) {
            var rotation = _a.rotation;
            return rotation.kind === 'due' || rotation.kind === 'warning';
        })
            .sort(function (a, b) { return getRotationPriority(a.rotation) - getRotationPriority(b.rotation); })
            .slice(0, 5);
    }, [rotationRows]);
    var rotationColumns = (0, react_1.useMemo)(function () {
        return [
            {
                headerName: 'Interfață',
                valueGetter: function (params) { var _a, _b; return (_b = (_a = params.data) === null || _a === void 0 ? void 0 : _a.metadata.label) !== null && _b !== void 0 ? _b : ''; },
                minWidth: 200,
                pinned: 'left',
            },
            {
                headerName: 'Categorie',
                valueGetter: function (params) { var _a, _b; return (_b = (_a = params.data) === null || _a === void 0 ? void 0 : _a.metadata.category) !== null && _b !== void 0 ? _b : ''; },
                minWidth: 160,
            },
            {
                headerName: 'Status',
                valueGetter: function (params) { var _a, _b; return (_b = (_a = params.data) === null || _a === void 0 ? void 0 : _a.rotation.label) !== null && _b !== void 0 ? _b : ''; },
                minWidth: 150,
                cellRenderer: function (params) {
                    if (!params.data)
                        return '';
                    var rotation = params.data.rotation;
                    var color = rotation.kind === 'due'
                        ? '#b91c1c'
                        : rotation.kind === 'warning'
                            ? '#b45309'
                            : rotation.kind === 'legacy'
                                ? '#1d4ed8'
                                : '#0f172a';
                    return <span style={{ fontWeight: 600, color: color }}>{rotation.label}</span>;
                },
            },
            {
                headerName: 'Ultima rotație',
                valueGetter: function (params) { var _a, _b; return (_b = (_a = params.data) === null || _a === void 0 ? void 0 : _a.rotation.lastRotatedLabel) !== null && _b !== void 0 ? _b : '—'; },
                minWidth: 190,
            },
            {
                headerName: 'Sumar',
                valueGetter: function (params) { var _a, _b; return (_b = (_a = params.data) === null || _a === void 0 ? void 0 : _a.rotation.summary) !== null && _b !== void 0 ? _b : ''; },
                flex: 1,
                minWidth: 220,
                wrapText: true,
                autoHeight: true,
            },
        ];
    }, []);
    var filteredRotationRows = (0, react_1.useMemo)(function () {
        if (!debouncedFilter) {
            return rotationRows;
        }
        var query = debouncedFilter.toLowerCase();
        return rotationRows.filter(function (_a) {
            var pin = _a.pin, metadata = _a.metadata, rotation = _a.rotation;
            return (metadata.label.toLowerCase().includes(query) ||
                metadata.category.toLowerCase().includes(query) ||
                pin.interface.toLowerCase().includes(query) ||
                rotation.label.toLowerCase().includes(query) ||
                rotation.summary.toLowerCase().includes(query));
        });
    }, [rotationRows, debouncedFilter]);
    return (<div className="dashboard" data-page-ready="true">
      {/* KPI Business Section - Indicatori reali de business */}
      <KPIBusinessSection_1.KPIBusinessSection />

      <section className="dashboard__grid">
        <article className="dashboard__card dashboard__card--pins">
          <header>
            <h3>Audit rotație PIN-uri</h3>
            <span>Monitorizare automată Admin · POS · KDS</span>
          </header>

          {pinsError ? (<InlineAlert_1.InlineAlert type="error" message={"Nu am putut \u00EEnc\u0103rca statusurile PIN: ".concat(pinsError)} actionLabel="Reîncearcă" onAction={refreshPins}/>) : null}

          {pinsLoading ? <InlineAlert_1.InlineAlert type="info" message="Se actualizează statusurile PIN..."/> : null}

          {!pinsLoading && !pinsError ? (<>
              <TableFilter_1.TableFilter value={rotationFilter} onChange={setRotationFilter} placeholder="Filtrează după interfață, categorie sau status"/>
              <DataGrid_1.DataGrid columnDefs={rotationColumns} rowData={filteredRotationRows} quickFilterText={debouncedFilter} height="340px" gridOptions={{
                rowHeight: 56,
                headerHeight: 46,
                suppressScrollOnNewData: true,
            }}/>
              <section>
                <h4 style={{ marginBottom: '8px' }}>Rotații urgente</h4>
                {upcomingRotations.length === 0 ? (<InlineAlert_1.InlineAlert type="success" message="Nicio rotație urgentă identificată în acest moment."/>) : (<DataGrid_1.DataGrid columnDefs={rotationColumns} rowData={upcomingRotations} height="220px" gridOptions={{
                    rowHeight: 54,
                    headerHeight: 44,
                    suppressScrollOnNewData: true,
                }}/>)}
              </section>
            </>) : null}
        </article>
      </section>
    </div>);
};
exports.DashboardPage = DashboardPage;
