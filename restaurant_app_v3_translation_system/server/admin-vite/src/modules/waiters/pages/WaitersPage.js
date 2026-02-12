"use strict";
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
exports.WaitersPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var PageHeader_1 = require("@/shared/components/PageHeader");
var StatCard_1 = require("@/shared/components/StatCard");
var TableFilter_1 = require("@/shared/components/TableFilter");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var DataGrid_1 = require("@/shared/components/DataGrid");
var Modal_1 = require("@/shared/components/Modal");
var useDebouncedValue_1 = require("@/shared/hooks/useDebouncedValue");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var useInterfacePins_1 = require("@/modules/waiters/hooks/useInterfacePins");
var PinEditorModal_1 = require("@/modules/waiters/components/PinEditorModal");
var pinUtils_1 = require("@/modules/waiters/utils/pinUtils");
var KioskUsersSection_1 = require("@/modules/waiters/components/KioskUsersSection");
var UserPinsSection_1 = require("@/modules/waiters/components/UserPinsSection");
require("./WaitersPage.css");
var DeleteConfirmModal = function (_a) {
    var open = _a.open, interfaceLabel = _a.interfaceLabel, loading = _a.loading, error = _a.error, onCancel = _a.onCancel, onConfirm = _a.onConfirm;
    return (<Modal_1.Modal isOpen={open} onClose={onCancel} title="Ștergere PIN interfață" description="Confirmă ștergerea PIN-ului. Interfața va rămâne fără cod de acces până la configurarea unui PIN nou." size="sm">
    {error ? <InlineAlert_1.InlineAlert type="error" message={error}/> : null}
    <p className="pin-delete__message">Ești sigur că vrei să elimini PIN-ul pentru <strong>{interfaceLabel}</strong>?
    </p>
    <div className="pin-delete__actions">
      <button type="button" onClick={onCancel} className="pin-delete__button pin-delete__button--secondary">Anulează</button>
      <button type="button" onClick={onConfirm} className="pin-delete__button pin-delete__button--danger" disabled={loading}>
        {loading ? 'Se șterge…' : 'Șterge PIN'}
      </button>
    </div>
  </Modal_1.Modal>);
};
var WaitersPage = function () {
    var _a, _b, _c;
    //   const { t } = useTranslation();
    var _d = (0, react_1.useState)(''), filter = _d[0], setFilter = _d[1];
    var debouncedFilter = (0, useDebouncedValue_1.useDebouncedValue)(filter, 250);
    var _e = (0, react_1.useState)(null), selectedPin = _e[0], setSelectedPin = _e[1];
    var _f = (0, react_1.useState)(false), editorOpen = _f[0], setEditorOpen = _f[1];
    var _g = (0, react_1.useState)(null), pendingDelete = _g[0], setPendingDelete = _g[1];
    var _h = (0, react_1.useState)(null), feedback = _h[0], setFeedback = _h[1];
    var _j = (0, react_1.useState)('pins'), activeTab = _j[0], setActiveTab = _j[1];
    var _k = (0, useInterfacePins_1.useInterfacePins)(), pins = _k.pins, loading = _k.loading, error = _k.error, refresh = _k.refresh;
    var _l = (0, useApiMutation_1.useApiMutation)(), deletePin = _l.mutate, deleteLoading = _l.loading, deleteError = _l.error, resetDeleteMutation = _l.reset;
    var pinRows = (0, react_1.useMemo)(function () {
        return pins
            .map(function (pin) {
            var metadata = (0, pinUtils_1.getInterfaceMetadata)(pin.interface);
            var rotation = (0, pinUtils_1.computeRotationStatus)(pin);
            return __assign(__assign({}, pin), { metadata: metadata, label: metadata.label, category: metadata.category, sortIndex: metadata.sortIndex, rotation: rotation, statusKind: rotation.kind, statusLabel: rotation.label, statusSummary: rotation.summary, lastRotatedLabel: rotation.lastRotatedLabel });
        })
            .sort(function (a, b) { return a.sortIndex - b.sortIndex; });
    }, [pins]);
    var filteredRows = (0, react_1.useMemo)(function () {
        if (!debouncedFilter) {
            return pinRows;
        }
        var query = debouncedFilter.toLowerCase();
        return pinRows.filter(function (row) {
            return row.label.toLowerCase().includes(query) ||
                row.interface.toLowerCase().includes(query) ||
                row.category.toLowerCase().includes(query);
        });
    }, [pinRows, debouncedFilter]);
    var rotationSummary = (0, react_1.useMemo)(function () { return (0, pinUtils_1.summarizeRotationStatuses)(pins); }, [pins]);
    var stats = (0, react_1.useMemo)(function () { return ({
        total: rotationSummary.total,
        configured: rotationSummary.configured,
        legacy: rotationSummary.legacy,
        due: rotationSummary.due,
        warning: rotationSummary.warning,
        missing: rotationSummary.missing,
    }); }, [rotationSummary]);
    var handleOpenEditor = (0, react_1.useCallback)(function (row) {
        setSelectedPin(row);
        setEditorOpen(true);
    }, []);
    var handleCloseEditor = (0, react_1.useCallback)(function () {
        setEditorOpen(false);
    }, []);
    var handleEditorSuccess = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setFeedback({ type: 'success', message: 'PIN-ul a fost actualizat cu succes.' });
                    return [4 /*yield*/, refresh()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [refresh]);
    var handleDeleteClick = (0, react_1.useCallback)(function (row) {
        resetDeleteMutation();
        setPendingDelete(row);
    }, [resetDeleteMutation]);
    var handleCancelDelete = (0, react_1.useCallback)(function () {
        setPendingDelete(null);
    }, []);
    var handleConfirmDelete = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!pendingDelete) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, deletePin({
                            url: '/api/admin/delete-pin',
                            method: 'post',
                            data: {
                                interface: pendingDelete.interface,
                            },
                        })];
                case 1:
                    result = _a.sent();
                    if (!(result !== null)) return [3 /*break*/, 3];
                    setFeedback({
                        type: 'success',
                        message: "PIN-ul pentru ".concat(pendingDelete.label, " a fost \u0219ters."),
                    });
                    setPendingDelete(null);
                    return [4 /*yield*/, refresh()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); }, [pendingDelete, deletePin, refresh]);
    var columnDefs = (0, react_1.useMemo)(function () {
        return [
            {
                headerName: 'Interfață',
                field: "label",
                pinned: 'left',
                minWidth: 240,
                cellRenderer: function (params) {
                    var row = params.data;
                    if (!row) {
                        return params.value;
                    }
                    return (<div className="pin-grid__interface">
              <span className="pin-grid__interface-label">{row.label}</span>
              <span className="pin-grid__interface-code">{row.interface}</span>
            </div>);
                },
            },
            {
                headerName: 'Categorie',
                field: 'category',
                minWidth: 160,
            },
            {
                headerName: 'Status PIN',
                field: 'statusLabel',
                minWidth: 170,
                cellRenderer: function (params) {
                    var row = params.data;
                    if (!row) {
                        return params.value;
                    }
                    return <span className={"pin-status pin-status--".concat(row.statusKind)}>{row.statusLabel}</span>;
                },
            },
            {
                headerName: 'Ultima rotație',
                field: 'lastRotatedLabel',
                minWidth: 200,
            },
            {
                headerName: 'Rotit de',
                field: 'rotatedBy',
                minWidth: 180,
                valueGetter: function (params) { var _a, _b; return (_b = (_a = params.data) === null || _a === void 0 ? void 0 : _a.rotatedBy) !== null && _b !== void 0 ? _b : '—'; },
            },
            {
                headerName: 'Politică',
                field: 'policyVersion',
                minWidth: 120,
                valueFormatter: function (params) {
                    return params.value ? "v".concat(params.value) : '—';
                },
            },
            {
                headerName: 'Algoritm',
                field: 'algorithm',
                minWidth: 140,
                valueFormatter: function (params) { var _a; return (_a = params.value) !== null && _a !== void 0 ? _a : '—'; },
            },
            {
                headerName: 'Acțiuni',
                field: 'interface',
                pinned: 'right',
                minWidth: 230,
                cellRenderer: function (params) {
                    var row = params.data;
                    if (!row) {
                        return null;
                    }
                    var label = row.hasPin ? 'Actualizează PIN' : 'Setează PIN';
                    return (<div className="pin-actions">
              <button type="button" onClick={function () { return handleOpenEditor(row); }} className="pin-actions__button">
                {label}
              </button>
              <button type="button" onClick={function () { return handleDeleteClick(row); }} className="pin-actions__button pin-actions__button--delete" disabled={!row.hasPin || deleteLoading}>Șterge</button>
            </div>);
                },
            },
        ];
    }, [handleOpenEditor, handleDeleteClick, deleteLoading]);
    var isReady = !loading;
    return (<div className="waiters-page" data-page-ready={isReady ? 'true' : 'false'}>
      <PageHeader_1.PageHeader title="Gestionare PIN-uri Interfețe" description="Administrează codurile de acces pentru Admin Panel, ospătari POS, KDS și stațiile de bar. Rotația PIN-urilor garantează securitatea operațională." actions={[
            {
                label: '↻ Reîncarcă lista',
                variant: 'secondary',
                onClick: function () {
                    void refresh();
                },
            },
        ]}/>

      {/* Tabs pentru PIN-uri și Utilizatori KIOSK */}
      <div className="waiters-tabs" style={{ marginBottom: '2rem', borderBottom: '2px solid #e0e0e0' }}>
        <button type="button" onClick={function () { return setActiveTab('pins'); }} className={"waiters-tab ".concat(activeTab === 'pins' ? 'active' : '')} style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderBottom: activeTab === 'pins' ? '3px solid #007bff' : '3px solid transparent',
            color: activeTab === 'pins' ? '#007bff' : '#666',
            fontWeight: activeTab === 'pins' ? '600' : '400',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
        }}>
          <i className="fas fa-key me-2"></i>PIN-uri Interfețe</button>
        <button type="button" onClick={function () { return setActiveTab('user-pins'); }} className={"waiters-tab ".concat(activeTab === 'user-pins' ? 'active' : '')} style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderBottom: activeTab === 'user-pins' ? '3px solid #007bff' : '3px solid transparent',
            color: activeTab === 'user-pins' ? '#007bff' : '#666',
            fontWeight: activeTab === 'user-pins' ? '600' : '400',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
        }}>
          <i className="fas fa-user-lock me-2"></i>PIN-uri Utilizatori
        </button>
        <button type="button" onClick={function () { return setActiveTab('kiosk-users'); }} className={"waiters-tab ".concat(activeTab === 'kiosk-users' ? 'active' : '')} style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderBottom: activeTab === 'kiosk-users' ? '3px solid #007bff' : '3px solid transparent',
            color: activeTab === 'kiosk-users' ? '#007bff' : '#666',
            fontWeight: activeTab === 'kiosk-users' ? '600' : '400',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
        }}>
          <i className="fas fa-users me-2"></i>Utilizatori KIOSK
        </button>
      </div>

      {activeTab === 'user-pins' && <UserPinsSection_1.UserPinsSection />}
      {activeTab === 'kiosk-users' && <KioskUsersSection_1.KioskUsersSection />}

      {activeTab === 'pins' && (<>

          {feedback ? <InlineAlert_1.InlineAlert type={feedback.type} message={feedback.message}/> : null}
          {error ? <InlineAlert_1.InlineAlert type="error" message={error}/> : null}

          <section className="waiters-stats">
            <StatCard_1.StatCard title="Interfețe totale" value={"".concat(stats.total)} helper="conectate la POS"/>
            <StatCard_1.StatCard title="PIN-uri active (hash)" value={"".concat(stats.configured)} helper={"".concat(stats.missing + stats.legacy, " nesetate sau legacy")}/>
            <StatCard_1.StatCard title="rotatie intarziata" value={"".concat(stats.due)} helper="necesită acțiune imediată"/>
            <StatCard_1.StatCard title="atentie rotatie" value={"".concat(stats.warning)} helper="sub 5 zile până la expirare"/>
            <StatCard_1.StatCard title="PIN-uri legacy" value={"".concat(stats.legacy)} helper="de migrat la hash"/>
          </section>

          <section className="waiters-toolbar">
            <TableFilter_1.TableFilter value={filter} onChange={setFilter} placeholder="Caută după interfață, cod sau categorie"/>
          </section>

          <section className="pin-grid-section">
            <DataGrid_1.DataGrid columnDefs={columnDefs} rowData={filteredRows} loading={loading} quickFilterText={debouncedFilter} height="60vh" agGridProps={{
                rowHeight: 60, // ✅ Înălțime mărită pentru a vedea bine categoriile
            }}/>
          </section>

          <PinEditorModal_1.PinEditorModal open={editorOpen} interfaceId={(_a = selectedPin === null || selectedPin === void 0 ? void 0 : selectedPin.interface) !== null && _a !== void 0 ? _a : null} interfaceLabel={(_b = selectedPin === null || selectedPin === void 0 ? void 0 : selectedPin.label) !== null && _b !== void 0 ? _b : ''} onClose={handleCloseEditor} onSuccess={handleEditorSuccess}/>

          <DeleteConfirmModal open={Boolean(pendingDelete)} interfaceLabel={(_c = pendingDelete === null || pendingDelete === void 0 ? void 0 : pendingDelete.label) !== null && _c !== void 0 ? _c : ''} loading={deleteLoading} error={deleteError} onCancel={handleCancelDelete} onConfirm={handleConfirmDelete}/>
        </>)}
    </div>);
};
exports.WaitersPage = WaitersPage;
