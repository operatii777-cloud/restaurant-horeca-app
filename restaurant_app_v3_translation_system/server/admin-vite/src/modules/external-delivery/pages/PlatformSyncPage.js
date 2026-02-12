"use strict";
// ﻿import { useTranslation } from '@/i18n/I18nContext';
/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PLATFORM SYNC MANAGEMENT PAGE
 *
 * Gestionare sincronizare cu platformele externe (Glovo, Wolt, etc.)
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
exports.PlatformSyncPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var externalDeliveryApi_1 = require("../api/externalDeliveryApi");
var PageHeader_1 = require("@/shared/components/PageHeader");
var react_toastify_1 = require("react-toastify");
require("./PlatformSyncPage.css");
var PLATFORM_LABELS = {
    'GLOVO': 'Glovo',
    'WOLT': 'Wolt',
    'BOLT_FOOD': 'Bolt Food',
    'TAZZ': 'Tazz',
    'UBER_EATS': 'Uber Eats',
};
var PLATFORM_COLORS = {
    'GLOVO': '#10b981',
    'WOLT': '#f59e0b',
    'BOLT_FOOD': '#00d4ff',
    'TAZZ': '#ef4444',
    'UBER_EATS': '#000000',
};
var PlatformSyncPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)([]), connectors = _b[0], setConnectors = _b[1];
    var _c = (0, react_1.useState)({}), syncing = _c[0], setSyncing = _c[1];
    var _d = (0, react_1.useState)(false), showModal = _d[0], setShowModal = _d[1];
    var _e = (0, react_1.useState)(null), editingConnector = _e[0], setEditingConnector = _e[1];
    var _f = (0, react_1.useState)({}), formData = _f[0], setFormData = _f[1];
    var _g = (0, react_1.useState)(null), error = _g[0], setError = _g[1];
    (0, react_1.useEffect)(function () {
        loadConnectors();
    }, []);
    var loadConnectors = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setError(null);
                    return [4 /*yield*/, externalDeliveryApi_1.externalDeliveryApi.getConnectors()];
                case 1:
                    response = _a.sent();
                    if (response.data.success) {
                        setConnectors(response.data.connectors || []);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    console.error('Error loading connectors:', err_1);
                    setError(err_1.message || 'Eroare la încărcarea conectărilor');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSyncMenu = function (platform) { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setSyncing(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[platform] = true, _a)));
                    });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, externalDeliveryApi_1.externalDeliveryApi.syncMenu(platform)];
                case 2:
                    response = _b.sent();
                    if (response.data.success) {
                        react_toastify_1.toast.success("Meniul a fost sincronizat cu ".concat(PLATFORM_labels[platform] || platform));
                        loadConnectors(); // Refresh to update last_sync_at
                    }
                    else {
                        react_toastify_1.toast.error("Eroare la sincronizare: ".concat(((_a = response.data.result) === null || _a === void 0 ? void 0 : _a.message) || 'Eroare necunoscută'));
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _b.sent();
                    console.error('Error syncing menu:', err_2);
                    react_toastify_1.toast.error("Eroare la sincronizare: ".concat(err_2.message || 'Eroare necunoscută'));
                    return [3 /*break*/, 5];
                case 4:
                    setSyncing(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[platform] = false, _a)));
                    });
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSyncAll = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, results, successCount, totalCount, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSyncing(function (prev) { return (__assign(__assign({}, prev), { all: true })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, externalDeliveryApi_1.externalDeliveryApi.syncAllPlatforms()];
                case 2:
                    response = _a.sent();
                    if (response.data.success) {
                        results = response.data.results;
                        successCount = Object.values(results).filter(function (r) { return r.success; }).length;
                        totalCount = Object.keys(results).length;
                        react_toastify_1.toast.success("Sincronizare complet\u0103: ".concat(successCount, "/").concat(totalCount, " platforme"));
                        loadConnectors();
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_3 = _a.sent();
                    console.error('Error syncing all platforms:', err_3);
                    react_toastify_1.toast.error("Eroare la sincronizare: ".concat(err_3.message || 'Eroare necunoscută'));
                    return [3 /*break*/, 5];
                case 4:
                    setSyncing(function (prev) { return (__assign(__assign({}, prev), { all: false })); });
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleEdit = function (connector) {
        setEditingConnector(connector);
        setFormData({
            provider: connector.provider,
            api_key: connector.api_key || '',
            api_secret: connector.api_secret || '',
            webhook_secret: connector.webhook_secret || '',
            is_enabled: connector.is_enabled,
        });
        setShowModal(true);
    };
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!editingConnector)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!editingConnector.id) return [3 /*break*/, 3];
                    // Update existing
                    return [4 /*yield*/, externalDeliveryApi_1.externalDeliveryApi.updateConnector(editingConnector.id, formData)];
                case 2:
                    // Update existing
                    _a.sent();
                    react_toastify_1.toast.success('Conectare actualizată cu succes');
                    return [3 /*break*/, 5];
                case 3: 
                // Create new
                return [4 /*yield*/, externalDeliveryApi_1.externalDeliveryApi.createConnector(formData)];
                case 4:
                    // Create new
                    _a.sent();
                    react_toastify_1.toast.success('Conectare creată cu succes');
                    _a.label = 5;
                case 5:
                    setShowModal(false);
                    setEditingConnector(null);
                    loadConnectors();
                    return [3 /*break*/, 7];
                case 6:
                    err_4 = _a.sent();
                    console.error('Error saving connector:', err_4);
                    react_toastify_1.toast.error("Eroare: ".concat(err_4.message || 'Eroare necunoscută'));
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var getStatusBadge = function (status) {
        if (!status)
            return <react_bootstrap_1.Badge bg="secondary">N/A</react_bootstrap_1.Badge>;
        switch (status) {
            case 'success':
                return <react_bootstrap_1.Badge bg="success">Succes</react_bootstrap_1.Badge>;
            case 'failed':
                return <react_bootstrap_1.Badge bg="danger">"Eșuat"</react_bootstrap_1.Badge>;
            case "Pending:":
                return <react_bootstrap_1.Badge bg="warning" text="dark">"in asteptare"</react_bootstrap_1.Badge>;
            default:
                return <react_bootstrap_1.Badge bg="secondary">{status}</react_bootstrap_1.Badge>;
        }
    };
    if (loading) {
        return (<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <react_bootstrap_1.Spinner animation="border" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </react_bootstrap_1.Spinner>
      </div>);
    }
    return (<div className="platform-sync-page">
      <PageHeader_1.PageHeader title="sincronizare platforme externe" subtitle="gestionare conectari si sincronizare meniu cu glov"/>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }}>
          {error}
        </react_bootstrap_1.Alert>)}

      {/* Sync All Button */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">"sincronizare rapida"</h5>
              <p className="text-muted mb-0">"sincronizeaza meniul cu toate platformele active"</p>
            </div>
            <react_bootstrap_1.Button variant="primary" size="lg" onClick={handleSyncAll} disabled={syncing.all}>
              {syncing.all ? (<>
                  <react_bootstrap_1.Spinner size="sm" className="me-2"/>"se sincronizeaza"</>) : ('Sincronizează Toate Platformele')}
            </react_bootstrap_1.Button>
          </div>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Connectors Table */}
      <react_bootstrap_1.Card>
        <react_bootstrap_1.Card.Header>
          <h5 className="mb-0">"conectari platforme"</h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {connectors.length === 0 ? (<div className="text-center text-muted py-4">
              <p className="mb-0">"nu exista conectari configurate"</p>
              <small>"adauga o conectare noua pentru a incepe sincroniza"</small>
            </div>) : (<react_bootstrap_1.Table striped hover responsive>
              <thead>
                <tr>
                  <th>Platformă</th>
                  <th>Status</th>
                  <th>Ultima Sincronizare</th>
                  <th>Status Sincronizare</th>
                  <th>"Acțiuni"</th>
                </tr>
              </thead>
              <tbody>
                {connectors.map(function (connector) { return (<tr key={connector.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="platform-color-indicator me-2" style={{ backgroundColor: PLATFORM_COLORS[connector.provider] || '#6b7280' }}/>
                        <strong>{PLATFORM_LABELS[connector.provider] || connector.provider}</strong>
                      </div>
                    </td>
                    <td>
                      {connector.is_enabled ? (<react_bootstrap_1.Badge bg="success">Activ</react_bootstrap_1.Badge>) : (<react_bootstrap_1.Badge bg="secondary">Inactiv</react_bootstrap_1.Badge>)}
                    </td>
                    <td>
                      {connector.last_sync_at ? (new Date(connector.last_sync_at).toLocaleString('ro-RO')) : (<span className="text-muted">"Niciodată"</span>)}
                    </td>
                    <td>
                      {getStatusBadge(connector.last_sync_status)}
                      {connector.last_sync_error && (<small className="d-block text-danger mt-1">
                          {connector.last_sync_error}
                        </small>)}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={function () { return handleSyncMenu(connector.provider); }} disabled={syncing[connector.provider] || !connector.is_enabled}>
                          {syncing[connector.provider] ? (<>
                              <react_bootstrap_1.Spinner size="sm" className="me-1"/>
                              Sync...
                            </>) : ('Sincronizează Meniu')}
                        </react_bootstrap_1.Button>
                        <react_bootstrap_1.Button variant="outline-secondary" size="sm" onClick={function () { return handleEdit(connector); }}>"Editează"</react_bootstrap_1.Button>
                      </div>
                    </td>
                  </tr>); })}
              </tbody>
            </react_bootstrap_1.Table>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Edit Modal */}
      <react_bootstrap_1.Modal show={showModal} onHide={function () { return setShowModal(false); }} size="lg">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            {(editingConnector === null || editingConnector === void 0 ? void 0 : editingConnector.id) ? 'Editează Conectare' : 'Conectare Nouă'}
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Form>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Platformă</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={formData.provider || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { provider: e.target.value })); }} disabled={!!(editingConnector === null || editingConnector === void 0 ? void 0 : editingConnector.id)}>
                <option value="">"selecteaza platforma"</option>
                {Object.entries(PLATFORM_LABELS).map(function (_a) {
            var key = _a[0], label = _a[1];
            return (<option key={key} value={key}>{label}</option>);
        })}
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>API Key</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="text" value={formData.api_key || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { api_key: e.target.value })); }} placeholder="Introdu API Key"/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>API Secret</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="password" value={formData.api_secret || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { api_secret: e.target.value })); }} placeholder="Introdu API Secret"/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Webhook Secret</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="password" value={formData.webhook_secret || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { webhook_secret: e.target.value })); }} placeholder="Introdu Webhook Secret (opțional)"/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Check type="switch" label="Activ" checked={formData.is_enabled || false} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { is_enabled: e.target.checked })); }}/>
          </react_bootstrap_1.Form>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowModal(false); }}>"Anulează"</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="primary" onClick={handleSave}>
            Salvează
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.PlatformSyncPage = PlatformSyncPage;
