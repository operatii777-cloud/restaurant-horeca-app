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
exports.AttributeGroupsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var PageHeader_1 = require("@/shared/components/PageHeader");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./AttributeGroupsPage.css");
var ATTRIBUTE_TYPES = [
    { value: 'text', label: 'Text', icon: '📝' },
    { value: 'select', label: 'Select', icon: '📋' },
    { value: 'number', label: 'Număr', icon: '🔢' },
    { value: 'boolean', label: 'Boolean (Da/Nu)', icon: '✅' },
    { value: 'date', label: 'Dată', icon: '📅' },
];
var AttributeGroupsPage = function () {
    var _a, _b, _c;
    //   const { t } = useTranslation();
    var _d = (0, react_1.useState)([]), groups = _d[0], setGroups = _d[1];
    var _e = (0, react_1.useState)(true), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    var _g = (0, react_1.useState)(false), showGroupModal = _g[0], setShowGroupModal = _g[1];
    var _h = (0, react_1.useState)(false), showAttributeModal = _h[0], setShowAttributeModal = _h[1];
    var _j = (0, react_1.useState)(null), editingGroup = _j[0], setEditingGroup = _j[1];
    var _k = (0, react_1.useState)(null), editingAttribute = _k[0], setEditingAttribute = _k[1];
    var _l = (0, react_1.useState)(null), selectedGroup = _l[0], setSelectedGroup = _l[1];
    var _m = (0, react_1.useState)(null), feedback = _m[0], setFeedback = _m[1];
    var _o = (0, react_1.useState)({
        name: '',
        titlu: '',
        minim: 0,
        maxim: 1,
        type: 'select',
        description: '',
        is_active: 1,
        sort_order: 0,
    }), groupFormData = _o[0], setGroupFormData = _o[1];
    var _p = (0, react_1.useState)({
        product_id: 0,
        product_name: '',
        disponibilitate: 1,
        pret1: 0,
        pret2: 0,
        pret3: 0,
        pret4: 0,
        is_active: 1,
        sort_order: 0,
    }), attributeFormData = _p[0], setAttributeFormData = _p[1];
    var _q = (0, react_1.useState)(''), searchQuery = _q[0], setSearchQuery = _q[1];
    var _r = (0, react_1.useState)([]), searchResults = _r[0], setSearchResults = _r[1];
    var _s = (0, react_1.useState)(false), searching = _s[0], setSearching = _s[1];
    var _t = (0, react_1.useState)(null), selectedProduct = _t[0], setSelectedProduct = _t[1];
    var fetchGroups = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/attribute-groups')];
                case 2:
                    response = _b.sent();
                    data = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || response.data || [];
                    setGroups(data);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _b.sent();
                    console.error('❌ Eroare la încărcarea grupurilor:', err_1);
                    setError(err_1.message || 'Eroare la încărcarea grupurilor');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    var fetchGroupDetails = (0, react_1.useCallback)(function (groupId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, err_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/admin/attribute-groups/".concat(groupId))];
                case 1:
                    response = _b.sent();
                    data = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || response.data;
                    setSelectedGroup(data);
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _b.sent();
                    console.error('❌ Eroare la încărcarea detaliilor grupului:', err_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        void fetchGroups();
    }, [fetchGroups]);
    var handleOpenGroupModal = function (group) {
        if (group) {
            setEditingGroup(group);
            setGroupFormData(group);
        }
        else {
            setEditingGroup(null);
            setGroupFormData({
                name: '',
                titlu: '',
                minim: 0,
                maxim: 1,
                type: 'select',
                description: '',
                is_active: 1,
                sort_order: 0,
            });
        }
        setShowGroupModal(true);
        setFeedback(null);
    };
    var handleCloseGroupModal = function () {
        setShowGroupModal(false);
        setEditingGroup(null);
        setFeedback(null);
    };
    var handleGroupSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var err_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    if (!groupFormData.name || !groupFormData.titlu) {
                        setFeedback({ type: 'error', message: 'Nume și titlu sunt obligatorii!' });
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    if (!(editingGroup === null || editingGroup === void 0 ? void 0 : editingGroup.id)) return [3 /*break*/, 3];
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/admin/attribute-groups/".concat(editingGroup.id), groupFormData)];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Grup actualizat cu succes!' });
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/attribute-groups', groupFormData)];
                case 4:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Grup creat cu succes!' });
                    _c.label = 5;
                case 5:
                    setTimeout(function () {
                        handleCloseGroupModal();
                        void fetchGroups();
                    }, 1000);
                    return [3 /*break*/, 7];
                case 6:
                    err_3 = _c.sent();
                    console.error('❌ Eroare la salvare:', err_3);
                    setFeedback({ type: 'error', message: 'Eroare la salvare: ' + (((_b = (_a = err_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_3.message || 'Eroare necunoscută') });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleSearchProducts = (0, react_1.useCallback)(function (query) { return __awaiter(void 0, void 0, void 0, function () {
        var response, products, err_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!query || query.length < 2) {
                        setSearchResults([]);
                        return [2 /*return*/];
                    }
                    setSearching(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/admin/attribute-groups/search/products?query=".concat(encodeURIComponent(query)))];
                case 2:
                    response = _b.sent();
                    products = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || [];
                    setSearchResults(products);
                    return [3 /*break*/, 5];
                case 3:
                    err_4 = _b.sent();
                    console.error('❌ Eroare la căutare produse:', err_4);
                    setSearchResults([]);
                    return [3 /*break*/, 5];
                case 4:
                    setSearching(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    var handleSelectProduct = function (product) {
        setSelectedProduct(product);
        setAttributeFormData(__assign(__assign({}, attributeFormData), { product_id: product.id, product_name: product.name }));
        setSearchQuery(product.name);
        setSearchResults([]);
    };
    var handleDeleteGroup = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var err_5;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!window.confirm('Ești sigur că vrei să ștergi acest grup de atribute? Toate atributele din grup vor fi șterse!'))
                        return [2 /*return*/];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/admin/attribute-groups/\"Id\"")];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Grup șters cu succes!' });
                    void fetchGroups();
                    return [3 /*break*/, 4];
                case 3:
                    err_5 = _c.sent();
                    console.error('❌ Eroare la ștergere:', err_5);
                    setFeedback({ type: 'error', message: 'Eroare la ștergere: ' + (((_b = (_a = err_5.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_5.message || 'Eroare necunoscută') });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleOpenAttributeModal = function (attribute) {
        if (attribute) {
            setEditingAttribute(attribute);
            setAttributeFormData(attribute);
            setSelectedProduct({
                id: attribute.product_id,
                name: attribute.product_name,
                price: attribute.product_base_price || 0,
            });
            setSearchQuery(attribute.product_name);
        }
        else {
            if (!(selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.id)) {
                setFeedback({ type: 'error', message: 'Selectează mai întâi un grup!' });
                return;
            }
            setEditingAttribute(null);
            setAttributeFormData({
                group_id: selectedGroup.id,
                product_id: 0,
                product_name: '',
                disponibilitate: 1,
                pret1: 0,
                pret2: 0,
                pret3: 0,
                pret4: 0,
                is_active: 1,
                sort_order: 0,
            });
            setSelectedProduct(null);
            setSearchQuery('');
        }
        setShowAttributeModal(true);
        setFeedback(null);
    };
    var handleCloseAttributeModal = function () {
        setShowAttributeModal(false);
        setEditingAttribute(null);
        setFeedback(null);
        setSelectedProduct(null);
        setSearchQuery('');
        setSearchResults([]);
    };
    var handleAttributeSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var err_6;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    if (!selectedProduct || !attributeFormData.product_id) {
                        setFeedback({ type: 'error', message: 'Selectează un produs!' });
                        return [2 /*return*/];
                    }
                    if (!(selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.id)) {
                        setFeedback({ type: 'error', message: 'Selectează un grup!' });
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    if (!(editingAttribute === null || editingAttribute === void 0 ? void 0 : editingAttribute.id)) return [3 /*break*/, 3];
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/admin/attributes/".concat(editingAttribute.id), attributeFormData)];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Atribut actualizat cu succes!' });
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, httpClient_1.httpClient.post("/api/admin/attribute-groups/".concat(selectedGroup.id, "/atribute"), {
                        productId: attributeFormData.product_id,
                        disponibilitate: attributeFormData.disponibilitate,
                        pret1: attributeFormData.pret1 || 0,
                        pret2: attributeFormData.pret2 || 0,
                        pret3: attributeFormData.pret3 || 0,
                        pret4: attributeFormData.pret4 || 0,
                    })];
                case 4:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Atribut creat cu succes!' });
                    _c.label = 5;
                case 5:
                    setTimeout(function () {
                        handleCloseAttributeModal();
                        setSelectedProduct(null);
                        setSearchQuery('');
                        if (selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.id) {
                            void fetchGroupDetails(selectedGroup.id);
                        }
                    }, 1000);
                    return [3 /*break*/, 7];
                case 6:
                    err_6 = _c.sent();
                    console.error('❌ Eroare la salvare:', err_6);
                    setFeedback({ type: 'error', message: 'Eroare la salvare: ' + (((_b = (_a = err_6.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_6.message || 'Eroare necunoscută') });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteAttribute = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var err_7;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!window.confirm('Ești sigur că vrei să ștergi acest atribut?'))
                        return [2 /*return*/];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    if (!(selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.id)) return [3 /*break*/, 3];
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/admin/attribute-groups/".concat(selectedGroup.id, "/atribute/\"Id\""))];
                case 2:
                    _c.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, httpClient_1.httpClient.delete("/api/admin/attributes/\"Id\"")];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5:
                    setFeedback({ type: 'success', message: 'Atribut șters cu succes!' });
                    if (selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.id) {
                        void fetchGroupDetails(selectedGroup.id);
                    }
                    return [3 /*break*/, 7];
                case 6:
                    err_7 = _c.sent();
                    console.error('❌ Eroare la ștergere:', err_7);
                    setFeedback({ type: 'error', message: 'Eroare la ștergere: ' + (((_b = (_a = err_7.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_7.message || 'Eroare necunoscută') });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var getTypeLabel = function (type) {
        var _a;
        return ((_a = ATTRIBUTE_TYPES.find(function (t) { return t.value === type; })) === null || _a === void 0 ? void 0 : _a.label) || type;
    };
    var getTypeIcon = function (type) {
        var _a;
        return ((_a = ATTRIBUTE_TYPES.find(function (t) { return t.value === type; })) === null || _a === void 0 ? void 0 : _a.icon) || '📦';
    };
    return (<div className="attribute-groups-page">
      <PageHeader_1.PageHeader title="🏷️ Grupuri Atribute" description="Gestionare grupuri de atribute pentru produse (dimensiuni, culori, opțiuni)"/>

      {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'success' ? 'success' : 'danger'} dismissible onClose={function () { return setFeedback(null); }} className="mb-4">
          {feedback.message}
        </react_bootstrap_1.Alert>)}

      <react_bootstrap_1.Row>
        <react_bootstrap_1.Col md={selectedGroup ? 6 : 12}>
          <react_bootstrap_1.Card className="shadow-sm mb-4">
            <react_bootstrap_1.Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-tags me-2"></i>
                Grupuri Atribute
              </h5>
              <react_bootstrap_1.Button variant="light" size="sm" onClick={function () { return handleOpenGroupModal(); }}>
                <i className="fas fa-plus me-1"></i>"adauga grup"</react_bootstrap_1.Button>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                </div>) : error ? (<react_bootstrap_1.Alert variant="danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </react_bootstrap_1.Alert>) : groups.length === 0 ? (<react_bootstrap_1.Alert variant="info">
                  <i className="fas fa-info-circle me-2"></i>"nu exista grupuri de atribute adauga primul grup"</react_bootstrap_1.Alert>) : (<div className="table-responsive">
                  <react_bootstrap_1.Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Nume</th>
                        <th>Tip</th>
                        <th>Atribute</th>
                        <th>Ordine</th>
                        <th>Status</th>
                        <th>"Acțiuni"</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups
                .sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); })
                .map(function (group) {
                var _a, _b;
                return (<tr key={group.id} className={(selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.id) === group.id ? 'table-primary' : ''} style={{ cursor: 'pointer' }} onClick={function () {
                        if (group.id) {
                            void fetchGroupDetails(group.id);
                        }
                    }}>
                            <td>
                              <strong>{group.name}</strong>
                              {group.titlu && group.titlu !== group.name && (<div className="text-muted small">{group.titlu}</div>)}
                            </td>
                            <td>
                              <react_bootstrap_1.Badge bg="info">
                                {getTypeIcon(group.type)} {getTypeLabel(group.type)}
                              </react_bootstrap_1.Badge>
                              <div className="small text-muted mt-1">
                                Min: {(_a = group.minim) !== null && _a !== void 0 ? _a : 0} | Max: {(_b = group.maxim) !== null && _b !== void 0 ? _b : 1}
                              </div>
                            </td>
                            <td>{group.attributes_count || 0}</td>
                            <td>{group.sort_order || 0}</td>
                            <td>
                              {group.is_active === 1 ? (<react_bootstrap_1.Badge bg="success">Activ</react_bootstrap_1.Badge>) : (<react_bootstrap_1.Badge bg="secondary">Inactiv</react_bootstrap_1.Badge>)}
                            </td>
                            <td onClick={function (e) { return e.stopPropagation(); }}>
                              <div className="d-flex gap-1">
                                <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={function () { return handleOpenGroupModal(group); }} title="Editează">
                                  <i className="fas fa-edit"></i>
                                </react_bootstrap_1.Button>
                                <react_bootstrap_1.Button variant="outline-danger" size="sm" onClick={function () { return group.id && handleDeleteGroup(group.id); }} title="Șterge">
                                  <i className="fas fa-trash"></i>
                                </react_bootstrap_1.Button>
                              </div>
                            </td>
                          </tr>);
            })}
                    </tbody>
                  </react_bootstrap_1.Table>
                </div>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>

        {selectedGroup && (<react_bootstrap_1.Col md={6}>
            <react_bootstrap_1.Card className="shadow-sm mb-4">
              <react_bootstrap_1.Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-list me-2"></i>
                  Atribute: {selectedGroup.name}
                </h5>
                <div>
                  <react_bootstrap_1.Button variant="light" size="sm" onClick={function () { return setSelectedGroup(null); }} className="me-2">
                    <i className="fas fa-times"></i>
                  </react_bootstrap_1.Button>
                  <react_bootstrap_1.Button variant="light" size="sm" onClick={function () { return handleOpenAttributeModal(); }}>
                    <i className="fas fa-plus me-1"></i>"adauga atribut"</react_bootstrap_1.Button>
                </div>
              </react_bootstrap_1.Card.Header>
              <react_bootstrap_1.Card.Body>
                {selectedGroup.attributes && selectedGroup.attributes.length === 0 ? (<react_bootstrap_1.Alert variant="info">
                    <i className="fas fa-info-circle me-2"></i>"nu exista atribute in acest grup adauga primul atr"</react_bootstrap_1.Alert>) : (<div className="table-responsive">
                    <react_bootstrap_1.Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Produs</th>
                          <th>Disponibilitate</th>
                          <th>Preț 1 (Sala)</th>
                          <th>Preț 2 (Glovo)</th>
                          <th>Preț 3 (Tazz)</th>
                          <th>Preț 4 (Bolt)</th>
                          <th>"Acțiuni"</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(_a = selectedGroup.attributes) === null || _a === void 0 ? void 0 : _a.sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); }).map(function (attr) { return (<tr key={attr.id}>
                              <td>
                                <strong>{attr.product_name || attr.product_name_full}</strong>
                                {attr.product_base_price !== undefined && (<div className="text-muted small">
                                    Preț bază: {attr.product_base_price.toFixed(2)} RON
                                  </div>)}
                              </td>
                              <td>
                                {attr.disponibilitate === 1 ? (<react_bootstrap_1.Badge bg="success">Disponibil</react_bootstrap_1.Badge>) : (<react_bootstrap_1.Badge bg="secondary">Indisponibil</react_bootstrap_1.Badge>)}
                              </td>
                              <td>{attr.pret1 > 0 ? "".concat(attr.pret1.toFixed(2), " RON") : '-'}</td>
                              <td>{attr.pret2 > 0 ? "".concat(attr.pret2.toFixed(2), " RON") : '-'}</td>
                              <td>{attr.pret3 > 0 ? "".concat(attr.pret3.toFixed(2), " RON") : '-'}</td>
                              <td>{attr.pret4 > 0 ? "".concat(attr.pret4.toFixed(2), " RON") : '-'}</td>
                              <td>
                                <div className="d-flex gap-1">
                                  <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={function () { return handleOpenAttributeModal(attr); }} title="Editează">
                                    <i className="fas fa-edit"></i>
                                  </react_bootstrap_1.Button>
                                  <react_bootstrap_1.Button variant="outline-danger" size="sm" onClick={function () { return attr.id && handleDeleteAttribute(attr.id); }} title="Șterge">
                                    <i className="fas fa-trash"></i>
                                  </react_bootstrap_1.Button>
                                </div>
                              </td>
                            </tr>); })}
                      </tbody>
                    </react_bootstrap_1.Table>
                  </div>)}
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>)}
      </react_bootstrap_1.Row>

      {/* Modal pentru Grup */}
      <react_bootstrap_1.Modal show={showGroupModal} onHide={handleCloseGroupModal} size="lg" className="attribute-groups-modal">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            {editingGroup ? 'Editează Grup Atribute' : 'Adaugă Grup Atribute'}
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Form onSubmit={handleGroupSubmit}>
          <react_bootstrap_1.Modal.Body>
            {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'success' ? 'success' : 'danger'}>
                {feedback.message}
              </react_bootstrap_1.Alert>)}

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>"nume grup"<span className="text-danger">*</span>
              </react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="text" value={groupFormData.name || ''} onChange={function (e) { return setGroupFormData(__assign(__assign({}, groupFormData), { name: e.target.value })); }} placeholder="ex dimensiuni culori optiuni" required/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>
                Titlu <span className="text-danger">*</span>
              </react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="text" value={groupFormData.titlu || ''} onChange={function (e) { return setGroupFormData(__assign(__assign({}, groupFormData), { titlu: e.target.value })); }} placeholder="titlul afisat in interfata" required/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>
                    Minim (selecții obligatorii) <span className="text-danger">*</span>
                  </react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" min="0" value={(_b = groupFormData.minim) !== null && _b !== void 0 ? _b : 0} onChange={function (e) { return setGroupFormData(__assign(__assign({}, groupFormData), { minim: parseInt(e.target.value) || 0 })); }} required/>
                  <react_bootstrap_1.Form.Text className="text-muted">"numar minim de atribute ce trebuie selectate"</react_bootstrap_1.Form.Text>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>
                    Maxim (selecții maxime) <span className="text-danger">*</span>
                  </react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" min="1" value={(_c = groupFormData.maxim) !== null && _c !== void 0 ? _c : 1} onChange={function (e) { return setGroupFormData(__assign(__assign({}, groupFormData), { maxim: parseInt(e.target.value) || 1 })); }} required/>
                  <react_bootstrap_1.Form.Text className="text-muted">"numar maxim de atribute ce pot fi selectate"</react_bootstrap_1.Form.Text>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>
                    Tip Atribut <span className="text-danger">*</span>
                  </react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Select value={groupFormData.type || 'select'} onChange={function (e) { return setGroupFormData(__assign(__assign({}, groupFormData), { type: e.target.value })); }} required>
                    {ATTRIBUTE_TYPES.map(function (type) { return (<option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>); })}
                  </react_bootstrap_1.Form.Select>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col md={6}>
                <react_bootstrap_1.Form.Group className="mb-3">
                  <react_bootstrap_1.Form.Label>Ordine Sortare</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" value={groupFormData.sort_order || 0} onChange={function (e) { return setGroupFormData(__assign(__assign({}, groupFormData), { sort_order: parseInt(e.target.value) || 0 })); }}/>
                </react_bootstrap_1.Form.Group>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Descriere</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control as="textarea" rows={3} value={groupFormData.description || ''} onChange={function (e) { return setGroupFormData(__assign(__assign({}, groupFormData), { description: e.target.value })); }} placeholder="descriere optionala pentru grup"/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Check type="switch" label="Grup activ" checked={groupFormData.is_active === 1} onChange={function (e) { return setGroupFormData(__assign(__assign({}, groupFormData), { is_active: e.target.checked ? 1 : 0 })); }}/>
            </react_bootstrap_1.Form.Group>
          </react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Modal.Footer>
            <react_bootstrap_1.Button variant="secondary" onClick={handleCloseGroupModal}>"Anulează"</react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="primary" type="submit">
              {editingGroup ? 'Salvează Modificările' : 'Creează Grup'}
            </react_bootstrap_1.Button>
          </react_bootstrap_1.Modal.Footer>
        </react_bootstrap_1.Form>
      </react_bootstrap_1.Modal>

      {/* Modal pentru Atribut */}
      <react_bootstrap_1.Modal show={showAttributeModal} onHide={handleCloseAttributeModal} size="lg">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            {editingAttribute ? 'Editează Atribut' : 'Adaugă Atribut'}
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Form onSubmit={handleAttributeSubmit}>
          <react_bootstrap_1.Modal.Body>
            {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'success' ? 'success' : 'danger'}>
                {feedback.message}
              </react_bootstrap_1.Alert>)}

            {/* Căutare Produs */}
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>
                Caută Produs <span className="text-danger">*</span>
              </react_bootstrap_1.Form.Label>
              <div className="position-relative">
                <react_bootstrap_1.Form.Control type="text" value={searchQuery} onChange={function (e) {
            var query = e.target.value;
            setSearchQuery(query);
            if (query.length >= 2) {
                void handleSearchProducts(query);
            }
            else {
                setSearchResults([]);
            }
        }} placeholder="introdu numele produsului" required/>
                {searching && (<div className="position-absolute top-50 end-0 translate-middle-y me-2">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">"Caută..."</span>
                    </div>
                  </div>)}
                {searchResults.length > 0 && (<div className="list-group position-absolute w-100 mt-1" style={{ zIndex: 1000, maxHeight: '200px', overflowY: "Auto" }}>
                    {searchResults.map(function (product) { return (<button key={product.id} type="button" className={"list-group-item list-group-item-action ".concat((selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.id) === product.id ? 'active' : '')} onClick={function () { return handleSelectProduct(product); }}>
                        <div>
                          <strong>{product.name}</strong>
                          {product.name_en && <small className="text-muted ms-2">({product.name_en})</small>}
                        </div>
                        <small className="text-muted">{product.price.toFixed(2)} RON</small>
                      </button>); })}
                  </div>)}
              </div>
              {selectedProduct && (<react_bootstrap_1.Alert variant="success" className="mt-2 mb-0">
                  <i className="fas fa-check me-2"></i>
                  Produs selectat: <strong>{selectedProduct.name}</strong> ({selectedProduct.price.toFixed(2)} RON)
                </react_bootstrap_1.Alert>)}
            </react_bootstrap_1.Form.Group>

            {/* Disponibilitate */}
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Check type="switch" label="Disponibil" checked={attributeFormData.disponibilitate === 1} onChange={function (e) { return setAttributeFormData(__assign(__assign({}, attributeFormData), { disponibilitate: e.target.checked ? 1 : 0 })); }}/>
            </react_bootstrap_1.Form.Group>

            {/* Prețuri Multiple */}
            <div className="mb-3">
              <h6>"preturi per platforma"</h6>
              <react_bootstrap_1.Row>
                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>Preț 1 - Sala (RON)</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control type="number" step="0.01" value={attributeFormData.pret1 || 0} onChange={function (e) { return setAttributeFormData(__assign(__assign({}, attributeFormData), { pret1: parseFloat(e.target.value) || 0 })); }} placeholder="0.00"/>
                  </react_bootstrap_1.Form.Group>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>Preț 2 - Glovo (RON)</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control type="number" step="0.01" value={attributeFormData.pret2 || 0} onChange={function (e) { return setAttributeFormData(__assign(__assign({}, attributeFormData), { pret2: parseFloat(e.target.value) || 0 })); }} placeholder="0.00"/>
                  </react_bootstrap_1.Form.Group>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>Preț 3 - Tazz (RON)</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control type="number" step="0.01" value={attributeFormData.pret3 || 0} onChange={function (e) { return setAttributeFormData(__assign(__assign({}, attributeFormData), { pret3: parseFloat(e.target.value) || 0 })); }} placeholder="0.00"/>
                  </react_bootstrap_1.Form.Group>
                </react_bootstrap_1.Col>
                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>Preț 4 - Bolt Food (RON)</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control type="number" step="0.01" value={attributeFormData.pret4 || 0} onChange={function (e) { return setAttributeFormData(__assign(__assign({}, attributeFormData), { pret4: parseFloat(e.target.value) || 0 })); }} placeholder="0.00"/>
                  </react_bootstrap_1.Form.Group>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>
            </div>
          </react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Modal.Footer>
            <react_bootstrap_1.Button variant="secondary" onClick={handleCloseAttributeModal}>"Anulează"</react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="primary" type="submit" disabled={!selectedProduct}>
              {editingAttribute ? 'Salvează' : 'Creează Atribut'}
            </react_bootstrap_1.Button>
          </react_bootstrap_1.Modal.Footer>
        </react_bootstrap_1.Form>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.AttributeGroupsPage = AttributeGroupsPage;
