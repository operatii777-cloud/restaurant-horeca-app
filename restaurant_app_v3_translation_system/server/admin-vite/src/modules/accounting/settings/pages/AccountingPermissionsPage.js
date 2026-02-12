"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S6.3 - Accounting Permissions Page
 *
 * Gestionare Permisiuni Contabilitate:
 * - Lista permisiuni
 * - Asignare permisiuni utilizatori
 * - Roluri contabilitate
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
exports.AccountingPermissionsPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
require("./AccountingPermissionsPage.css");
var AccountingPermissionsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), permissions = _a[0], setPermissions = _a[1];
    var _b = (0, react_1.useState)([]), userPermissions = _b[0], setUserPermissions = _b[1];
    var _c = (0, react_1.useState)([]), users = _c[0], setUsers = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(null), error = _e[0], setError = _e[1];
    var _f = (0, react_1.useState)(false), showAssignModal = _f[0], setShowAssignModal = _f[1];
    var _g = (0, react_1.useState)(null), selectedUser = _g[0], setSelectedUser = _g[1];
    var _h = (0, react_1.useState)(null), selectedPermission = _h[0], setSelectedPermission = _h[1];
    var _j = (0, react_1.useState)(false), showHelpModal = _j[0], setShowHelpModal = _j[1];
    (0, react_1.useEffect)(function () {
        loadData();
    }, []);
    var loadData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            loadPermissions(),
                            loadUserPermissions(),
                            loadUsers()
                        ])];
                case 2:
                    _c.sent();
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('AccountingPermissionsPage Error:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_1.message || 'Eroare la încărcarea datelor');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var loadPermissions = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, permissionsList, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/accounting/settings/permissions')];
                case 1:
                    response = _a.sent();
                    console.log('AccountingPermissionsPage Permissions response:', response.data);
                    permissionsList = [];
                    if (response.data && response.data.success && Array.isArray(response.data.data)) {
                        permissionsList = response.data.data;
                    }
                    else if (Array.isArray(response.data)) {
                        permissionsList = response.data;
                    }
                    else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                        permissionsList = response.data.data;
                    }
                    if (!Array.isArray(permissionsList)) {
                        permissionsList = [];
                    }
                    setPermissions(permissionsList);
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    console.error('AccountingPermissionsPage Error loading permissions:', err_2);
                    setPermissions([]);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var loadUserPermissions = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, userPermsList, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/accounting/settings/user-permissions')];
                case 1:
                    response = _a.sent();
                    console.log('AccountingPermissionsPage User permissions response:', response.data);
                    userPermsList = [];
                    if (response.data && response.data.success && Array.isArray(response.data.data)) {
                        userPermsList = response.data.data;
                    }
                    else if (Array.isArray(response.data)) {
                        userPermsList = response.data;
                    }
                    else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                        userPermsList = response.data.data;
                    }
                    if (!Array.isArray(userPermsList)) {
                        userPermsList = [];
                    }
                    setUserPermissions(userPermsList);
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _a.sent();
                    console.error('AccountingPermissionsPage Error loading user permissions:', err_3);
                    setUserPermissions([]);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var loadUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, usersList, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/accounting/settings/users')];
                case 1:
                    response = _a.sent();
                    console.log('AccountingPermissionsPage Users response:', response.data);
                    usersList = [];
                    if (response.data && response.data.success && Array.isArray(response.data.data)) {
                        usersList = response.data.data;
                    }
                    else if (Array.isArray(response.data)) {
                        usersList = response.data;
                    }
                    else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                        usersList = response.data.data;
                    }
                    if (!Array.isArray(usersList)) {
                        usersList = [];
                    }
                    setUsers(usersList);
                    return [3 /*break*/, 3];
                case 2:
                    err_4 = _a.sent();
                    console.error('AccountingPermissionsPage Error loading users:', err_4);
                    setUsers([]);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleAssignPermission = function (user) {
        setSelectedUser(user);
        setShowAssignModal(true);
    };
    var handleRemovePermission = function (userId, permissionId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_5;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!confirm('Sigur doriți să eliminați această permisiune?')) {
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/accounting/settings/user-permissions/".concat(userId, "/").concat(permissionId))];
                case 2:
                    response = _c.sent();
                    if (response.data.success) {
                        loadUserPermissions();
                    }
                    else {
                        alert('Eroare la eliminare: ' + (response.data.error || 'Eroare necunoscută'));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_5 = _c.sent();
                    alert('Eroare la eliminare: ' + (((_b = (_a = err_5.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_5.message));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmitAssign = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_6;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!selectedUser || !selectedPermission) {
                        alert('Selectați utilizatorul și permisiunea');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/accounting/settings/user-permissions', {
                            user_id: selectedUser.id,
                            permission_id: selectedPermission.id
                        })];
                case 2:
                    response = _c.sent();
                    if (response.data.success) {
                        setShowAssignModal(false);
                        setSelectedUser(null);
                        setSelectedPermission(null);
                        loadUserPermissions();
                    }
                    else {
                        alert('Eroare la asignare: ' + (response.data.error || 'Eroare necunoscută'));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_6 = _c.sent();
                    alert('Eroare la asignare: ' + (((_b = (_a = err_6.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_6.message));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getPermissionCategoryBadge = function (category) {
        var badges = {
            'reports': { bg: 'info', label: 'Rapoarte' },
            'settings': { bg: 'warning', label: 'Setări' },
            'export': { bg: 'success', label: 'Export' },
            "Audit": { bg: 'danger', label: 'Audit' },
            'other': { bg: 'secondary', label: 'Altul' }
        };
        var badge = badges[category] || badges['other'];
        return <react_bootstrap_1.Badge bg={badge.bg}>{badge.label}</react_bootstrap_1.Badge>;
    };
    var getUserPermissions = function (userId) {
        return userPermissions.filter(function (up) { return up.user_id === userId; });
    };
    return (<div className="accounting-permissions-page">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>🔍 Permisiuni Contabilitate</h1>
          <p>Gestionare permisiuni și acces utilizatori pentru modulele financiare</p>
        </div>
        <react_bootstrap_1.Button variant="outline-info" onClick={function () { return setShowHelpModal(true); }}>
          <i className="fas fa-question-circle me-2"></i>
          Ajutor
        </react_bootstrap_1.Button>
      </div>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }} className="mt-3">
          {error}
        </react_bootstrap_1.Alert>)}

      <react_bootstrap_1.Row>
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card className="mb-4">
            <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Permisiuni disponibile</h5>
              <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={loadPermissions}>
                <i className="fas fa-sync me-2"></i>Reîncarcă</react_bootstrap_1.Button>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-4">
                  <i className="fas fa-spinner fa-spin fa-2x"></i>
                </div>) : (<react_bootstrap_1.Table striped hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Nume</th>
                      <th>Categorie</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(function () {
                var safePermissions = Array.isArray(permissions) ? permissions : [];
                if (safePermissions.length > 0) {
                    return safePermissions.map(function (permission) { return (<tr key={permission.id}>
                            <td>
                              <strong>{permission.name}</strong>
                              {permission.description && (<div className="text-muted small">{permission.description}</div>)}
                            </td>
                            <td>{getPermissionCategoryBadge(permission.category || 'other')}</td>
                            <td>
                              <react_bootstrap_1.Badge bg={permission.is_active ? 'success' : 'secondary'}>
                                {permission.is_active ? 'Activă' : 'Inactivă'}
                              </react_bootstrap_1.Badge>
                            </td>
                          </tr>); });
                }
                else {
                    return (<tr>
                            <td colSpan={3} className="text-center text-muted py-4">Nu există permisiuni definite. Permisiunile vor apărea aici.</td>
                          </tr>);
                }
            })()}
                  </tbody>
                </react_bootstrap_1.Table>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>

        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card className="mb-4">
            <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Permisiuni utilizatori</h5>
              <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={loadUserPermissions}>
                <i className="fas fa-sync me-2"></i>Reîncarcă</react_bootstrap_1.Button>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {loading ? (<div className="text-center py-4">
                  <i className="fas fa-spinner fa-spin fa-2x"></i>
                </div>) : (<react_bootstrap_1.Table striped hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Utilizator</th>
                      <th>Permisiune</th>
                      <th>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(function () {
                var safeUserPerms = Array.isArray(userPermissions) ? userPermissions : [];
                if (safeUserPerms.length > 0) {
                    return safeUserPerms.map(function (up, index) { return (<tr key={"".concat(up.user_id, "-").concat(up.permission_id, "-").concat(index)}>
                            <td>{up.username}</td>
                            <td>{up.permission_name}</td>
                            <td>
                              <react_bootstrap_1.Button variant="outline-danger" size="sm" onClick={function () { return handleRemovePermission(up.user_id, up.permission_id); }}>
                                <i className="fas fa-trash"></i>
                              </react_bootstrap_1.Button>
                            </td>
                          </tr>); });
                }
                else {
                    return (<tr>
                            <td colSpan={3} className="text-center text-muted py-4">Nu există permisiuni asignate. Asignează permisiuni.</td>
                          </tr>);
                }
            })()}
                  </tbody>
                </react_bootstrap_1.Table>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      <react_bootstrap_1.Card>
        <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Utilizatori</h5>
          <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={loadUsers}>
            <i className="fas fa-sync me-2"></i>Reîncarcă</react_bootstrap_1.Button>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {loading ? (<div className="text-center py-4">
              <i className="fas fa-spinner fa-spin fa-2x"></i>
            </div>) : (<react_bootstrap_1.Table striped hover responsive>
              <thead>
                <tr>
                  <th>Utilizator</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Permisiuni</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {(function () {
                var safeUsers = Array.isArray(users) ? users : [];
                if (safeUsers.length > 0) {
                    return safeUsers.map(function (user) {
                        var userPerms = getUserPermissions(user.id);
                        return (<tr key={user.id}>
                          <td><strong>{user.username}</strong></td>
                          <td>{user.email || 'N/A'}</td>
                          <td><react_bootstrap_1.Badge bg="info">{user.role || 'N/A'}</react_bootstrap_1.Badge></td>
                          <td>
                            {userPerms.length > 0 ? (<div>
                                {userPerms.map(function (up, idx) { return (<react_bootstrap_1.Badge key={idx} bg="success" className="me-1">
                                    {up.permission_name}
                                  </react_bootstrap_1.Badge>); })}
                              </div>) : (<span className="text-muted">"fara permisiuni"</span>)}
                          </td>
                          <td>
                            <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={function () { return handleAssignPermission(user); }}>
                              <i className="fas fa-plus me-1"></i>Asignează</react_bootstrap_1.Button>
                          </td>
                        </tr>);
                    });
                }
                else {
                    return (<tr>
                        <td colSpan={5} className="text-center text-muted py-4">Nu există utilizatori. Utilizatorii vor apărea aici.</td>
                      </tr>);
                }
            })()}
              </tbody>
            </react_bootstrap_1.Table>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Assign Permission Modal */}
      <react_bootstrap_1.Modal show={showAssignModal} onHide={function () {
            setShowAssignModal(false);
            setSelectedUser(null);
            setSelectedPermission(null);
        }}>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            <i className="fas fa-user-plus me-2"></i>Asignează permisiune</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          {selectedUser && (<div>
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label><strong>Utilizator</strong></react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="text" value={selectedUser.username} readOnly/>
              </react_bootstrap_1.Form.Group>
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label><strong>Selectează Permisiune</strong></react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Select value={(selectedPermission === null || selectedPermission === void 0 ? void 0 : selectedPermission.id) || ''} onChange={function (e) {
                var permId = parseInt(e.target.value);
                var perm = permissions.find(function (p) { return p.id === permId; });
                setSelectedPermission(perm || null);
            }}>
                  <option value="">Selectează permisiune</option>
                  {permissions
                .filter(function (p) { return p.is_active; })
                .map(function (permission) { return (<option key={permission.id} value={permission.id}>
                        {permission.name} - {permission.description || permission.code}
                      </option>); })}
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.Form.Group>
            </div>)}
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () {
            setShowAssignModal(false);
            setSelectedUser(null);
            setSelectedPermission(null);
        }}>Anulează</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="primary" onClick={handleSubmitAssign} disabled={!selectedPermission}>
            <i className="fas fa-check me-2"></i>Asignează</react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>

      {/* Help Modal */}
      <react_bootstrap_1.Modal show={showHelpModal} onHide={function () { return setShowHelpModal(false); }} size="lg" className="help-modal">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            <i className="fas fa-question-circle me-2"></i>Ajutor permisiuni contabilitate</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <div className="help-content">
            <h5>📋 Cum funcționează permisiunile?</h5>
            <p>
              Permisiunile contabilitate controlează accesul utilizatorilor la funcțiile modulului contabilitate.
              Fiecare utilizator poate avea una sau mai multe permisiuni asignate.
            </p>

            <h5 className="mt-4">👤 Cum creez utilizatori?</h5>
            <p>Pentru a crea utilizatori noi, urmează acești pași:</p>
            <ol>
              <li>
                <strong>Accesează pagina de utilizatori</strong>
                <ul>
                  <li>Mergi la <strong>Setări → Utilizatori & Permisiuni</strong></li>
                  <li>Sau accesează direct <code>/admin-vite/settings/users</code></li>
                </ul>
              </li>
              <li>
                <strong>Click pe butonul ➕ Adaugă Utilizator</strong>
              </li>
              <li>
                <strong>Completează formularul</strong>
                <ul>
                  <li><strong>Username</strong> (obligatoriu) - numele de utilizator</li>
                  <li><strong>Email</strong> (opțional) - adresa de email</li>
                  <li><strong>Parolă</strong> (obligatoriu) - parola pentru autentificare</li>
                  <li><strong>Rol</strong> (obligatoriu) - selectează rolul din dropdown</li>
                </ul>
              </li>
              <li>
                <strong>Click pe "Salvează"</strong>
              </li>
            </ol>

            <h5 className="mt-4">🔗 Flux complet: Creare → Asignare Permisiuni</h5>
            <div className="alert alert-info">
              <ol className="mb-0">
                <li><strong>Creezi utilizatorul</strong> → Setări → Utilizatori & Permisiuni</li>
                <li><strong>Utilizatorul apare</strong> în lista de utilizatori</li>
                <li><strong>Mergi la</strong> Contabilitate → Setări → Permisiuni Contabilitate</li>
                <li><strong>Click pe "Asignează"</strong> lângă utilizatorul dorit</li>
                <li><strong>Selectezi permisiunea</strong> din dropdown</li>
                <li><strong>Click "Asignează"</strong> pentru a finaliza</li>
              </ol>
            </div>

            <h5 className="mt-4">📌 Tipuri de permisiuni disponibile</h5>
            <ul>
              <li><strong>Vizualizare Rapoarte</strong> - Poate vizualiza rapoarte contabile</li>
              <li><strong>Export Date</strong> - Poate exporta date contabile</li>
              <li><strong>Gestionare setări</strong> - Poate modifica setările contabilitate</li>
              <li><strong>Vizualizare audit</strong> - Poate vizualiza log-uri audit</li>
            </ul>

            <h5 className="mt-4">🛠️ Endpoint-uri API disponibile</h5>
            <ul>
              <li><code>GET /api/admin/users</code> - Lista utilizatori</li>
              <li><code>POST /api/admin/users</code> - Creare utilizator</li>
              <li><code>PUT /api/admin/users/:id</code> - Actualizare utilizator</li>
              <li><code>DELETE /api/admin/users/:id</code> - Ștergere utilizator</li>
              <li><code>GET /api/admin/roles</code> - Lista roluri disponibile</li>
            </ul>

            <div className="alert alert-warning mt-4">
              <strong>💡 Notă:</strong> Utilizatorii creați în pagina "Utilizatori & Permisiuni" vor apărea automat
              în această pagină pentru asignarea permisiunilor specifice contabilității.
            </div>
          </div>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowHelpModal(false); }}>Închide</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="primary" onClick={function () {
            setShowHelpModal(false);
            window.location.href = '/admin-vite/settings/users';
        }}>
            <i className="fas fa-user-plus me-2"></i>
            Mergi la Utilizatori & Permisiuni
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.AccountingPermissionsPage = AccountingPermissionsPage;
