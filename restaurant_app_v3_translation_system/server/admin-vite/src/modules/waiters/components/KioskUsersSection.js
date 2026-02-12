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
exports.KioskUsersSection = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
var KioskUsersSection = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), users = _a[0], setUsers = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(false), showModal = _d[0], setShowModal = _d[1];
    var _e = (0, react_1.useState)(null), editingUser = _e[0], setEditingUser = _e[1];
    var _f = (0, react_1.useState)({
        username: '',
        password: '',
        role: 'waiter',
        full_name: '',
        is_active: true,
    }), formData = _f[0], setFormData = _f[1];
    (0, react_1.useEffect)(function () {
        loadUsers();
    }, []);
    var loadUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/admin/kiosk/users')];
                case 2:
                    response = _d.sent();
                    setUsers(((_a = response.data) === null || _a === void 0 ? void 0 : _a.users) || []);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _d.sent();
                    console.error('❌ Eroare la încărcarea utilizatorilor:', err_1);
                    setError(((_c = (_b = err_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || 'Nu s-au putut încărca utilizatorii.');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleOpenModal = function (user) {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                password: '',
                role: user.role,
                full_name: user.full_name || '',
                is_active: user.is_active,
            });
        }
        else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                role: 'waiter',
                full_name: '',
                is_active: true,
            });
        }
        setShowModal(true);
    };
    var handleCloseModal = function () {
        setShowModal(false);
        setEditingUser(null);
        setFormData({
            username: '',
            password: '',
            role: 'waiter',
            full_name: '',
            is_active: true,
        });
        setError(null);
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var payload, err_2;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    e.preventDefault();
                    setError(null);
                    // Validare
                    if (!formData.username.trim()) {
                        setError('Username este obligatoriu.');
                        return [2 /*return*/];
                    }
                    if (!editingUser && !formData.password) {
                        setError('Parola este obligatorie pentru utilizatori noi.');
                        return [2 /*return*/];
                    }
                    if (formData.password && formData.password.length < 4) {
                        setError('Parola trebuie să aibă minim 4 caractere.');
                        return [2 /*return*/];
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 6, , 7]);
                    payload = {
                        username: formData.username.trim(),
                        role: formData.role,
                        full_name: ((_a = formData.full_name) === null || _a === void 0 ? void 0 : _a.trim()) || null,
                        is_active: formData.is_active,
                    };
                    if (formData.password) {
                        payload.password = formData.password;
                    }
                    if (!(editingUser && editingUser.id)) return [3 /*break*/, 3];
                    // Update
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/admin/kiosk/users/".concat(editingUser.id), payload)];
                case 2:
                    // Update
                    _d.sent();
                    return [3 /*break*/, 5];
                case 3: 
                // Create
                return [4 /*yield*/, httpClient_1.httpClient.post('/api/admin/kiosk/users', payload)];
                case 4:
                    // Create
                    _d.sent();
                    _d.label = 5;
                case 5:
                    handleCloseModal();
                    loadUsers();
                    return [3 /*break*/, 7];
                case 6:
                    err_2 = _d.sent();
                    console.error('❌ Eroare la salvarea utilizatorului:', err_2);
                    setError(((_c = (_b = err_2.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || 'Nu s-a putut salva utilizatorul.');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        var err_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!window.confirm('Sigur vrei să ștergi acest utilizator?')) {
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/admin/kiosk/users/".concat(userId))];
                case 2:
                    _c.sent();
                    loadUsers();
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _c.sent();
                    console.error('❌ Eroare la ștergerea utilizatorului:', err_3);
                    alert(((_b = (_a = err_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Nu s-a putut șterge utilizatorul.');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleToggleActive = function (user) { return __awaiter(void 0, void 0, void 0, function () {
        var err_4;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!user.id)
                        return [2 /*return*/];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/admin/kiosk/users/".concat(user.id), __assign(__assign({}, user), { is_active: !user.is_active }))];
                case 2:
                    _c.sent();
                    loadUsers();
                    return [3 /*break*/, 4];
                case 3:
                    err_4 = _c.sent();
                    console.error('❌ Eroare la actualizarea statusului:', err_4);
                    alert(((_b = (_a = err_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Nu s-a putut actualiza statusul.');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getRoleBadge = function (role) {
        var badges = {
            admin: { bg: 'danger', label: 'Admin' },
            supervisor: { bg: 'warning', label: 'Supervisor' },
            waiter: { bg: 'info', label: 'Ospătar' },
        };
        var badge = badges[role] || { bg: 'secondary', label: role };
        return <react_bootstrap_1.Badge bg={badge.bg}>{badge.label}</react_bootstrap_1.Badge>;
    };
    return (<div className="kiosk-users-section">
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>
          <i className="fas fa-users me-2"></i>Gestionare Utilizatori KIOSK
        </h3>
        <p style={{ color: '#666', marginBottom: 0 }}>Setează username și parolă pentru acces în KIOSK pentru ospătari, supervisori și admin.</p>
      </div>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }} className="mb-4">
          {error}
        </react_bootstrap_1.Alert>)}

      <react_bootstrap_1.Card>
        <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>Lista Utilizatori
          </h5>
          <react_bootstrap_1.Button variant="primary" onClick={function () { return handleOpenModal(); }}>
            <i className="fas fa-plus me-2"></i>Utilizator Nou
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {loading ? (<div className="text-center py-5">
              <i className="fas fa-spinner fa-spin fa-3x text-primary"></i>
              <p className="mt-3">"se incarca utilizatorii"</p>
            </div>) : users.length === 0 ? (<react_bootstrap_1.Alert variant="info" className="text-center">
              <i className="fas fa-info-circle me-2"></i>"nu exista utilizatori adauga primul utilizator"</react_bootstrap_1.Alert>) : (<div className="table-responsive">
              <react_bootstrap_1.Table hover>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Nume Complet</th>
                    <th>Rol</th>
                    <th>Status</th>
                    <th>"actiuni"</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(function (user) { return (<tr key={user.id}>
                      <td>
                        <strong>{user.username}</strong>
                      </td>
                      <td>{user.full_name || '—'}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>
                        <react_bootstrap_1.Badge bg={user.is_active ? 'success' : 'secondary'}>
                          {user.is_active ? 'Activ' : 'Inactiv'}
                        </react_bootstrap_1.Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={function () { return handleOpenModal(user); }} title="editeaza utilizator">
                            <i className="fas fa-edit"></i>
                          </react_bootstrap_1.Button>
                          <react_bootstrap_1.Button variant={user.is_active ? 'outline-warning' : 'outline-success'} size="sm" onClick={function () { return handleToggleActive(user); }} title={user.is_active ? 'Dezactivează' : 'Activează'}>
                            <i className={"fas fa-".concat(user.is_active ? 'ban' : 'check')}></i>
                          </react_bootstrap_1.Button>
                          {user.role !== 'admin' && (<react_bootstrap_1.Button variant="outline-danger" size="sm" onClick={function () { return user.id && handleDelete(user.id); }} title="sterge utilizator">
                              <i className="fas fa-trash"></i>
                            </react_bootstrap_1.Button>)}
                        </div>
                      </td>
                    </tr>); })}
                </tbody>
              </react_bootstrap_1.Table>
            </div>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Modal Add/Edit User */}
      <react_bootstrap_1.Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            {editingUser ? (<>
                <i className="fas fa-edit me-2"></i>"editeaza utilizator kiosk"</>) : (<>
                <i className="fas fa-plus me-2"></i>Utilizator Nou KIOSK
              </>)}
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Form onSubmit={handleSubmit}>
          <react_bootstrap_1.Modal.Body>
            {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }}>
                {error}
              </react_bootstrap_1.Alert>)}

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>
                Username <span className="text-danger">*</span>
              </react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="text" value={formData.username} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { username: e.target.value })); }} placeholder="username" required disabled={!!editingUser}/>
              {editingUser && (<react_bootstrap_1.Form.Text className="text-muted">"username ul nu poate fi modificat"</react_bootstrap_1.Form.Text>)}
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>
                {editingUser ? 'Parolă Nouă (lasă gol pentru a păstra parola existentă)' : 'Parolă *'}
              </react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="password" value={formData.password} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { password: e.target.value })); }} placeholder={editingUser ? 'Parolă nouă (opțional)' : 'Parolă'} required={!editingUser} minLength={4}/>
              <react_bootstrap_1.Form.Text className="text-muted">Minim 4 caractere.</react_bootstrap_1.Form.Text>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>Nume Complet</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="text" value={formData.full_name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { full_name: e.target.value })); }} placeholder="Nume complet (opțional)"/>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>
                Rol <span className="text-danger">*</span>
              </react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={formData.role} onChange={function (e) {
            return setFormData(__assign(__assign({}, formData), { role: e.target.value }));
        }} required>
                <option value="waiter">Ospătar</option>
                <option value="supervisor">"supervisor"</option>
                <option value="admin">Admin</option>
              </react_bootstrap_1.Form.Select>
              <react_bootstrap_1.Form.Text className="text-muted">"rolul determina nivelul de acces in kiosk"</react_bootstrap_1.Form.Text>
            </react_bootstrap_1.Form.Group>

            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Check type="checkbox" label="Utilizator activ" checked={formData.is_active} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { is_active: e.target.checked })); }}/>
              <react_bootstrap_1.Form.Text className="text-muted">"utilizatorii inactivi nu pot accesa kiosk"</react_bootstrap_1.Form.Text>
            </react_bootstrap_1.Form.Group>
          </react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Modal.Footer>
            <react_bootstrap_1.Button variant="secondary" onClick={handleCloseModal}>
              <i className="fas fa-times me-2"></i>"anuleaza"</react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="primary" type="submit">
              <i className="fas fa-save me-2"></i>Salvează
            </react_bootstrap_1.Button>
          </react_bootstrap_1.Modal.Footer>
        </react_bootstrap_1.Form>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.KioskUsersSection = KioskUsersSection;
