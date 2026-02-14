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
exports.UsersPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./UsersPage.css");
var UsersPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), users = _a[0], setUsers = _a[1];
    var _b = (0, react_1.useState)([]), roles = _b[0], setRoles = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(false), showModal = _d[0], setShowModal = _d[1];
    var _e = (0, react_1.useState)(null), editingUser = _e[0], setEditingUser = _e[1];
    var _f = (0, react_1.useState)(null), alert = _f[0], setAlert = _f[1];
    var _g = (0, useApiQuery_1.useApiQuery)('/api/admin/users'), usersData = _g.data, refetchUsers = _g.refetch;
    var rolesData = (0, useApiQuery_1.useApiQuery)('/api/admin/roles').data;
    var createMutation = (0, useApiMutation_1.useApiMutation)();
    var updateMutation = (0, useApiMutation_1.useApiMutation)();
    (0, react_1.useEffect)(function () {
        if (usersData) {
            setUsers(usersData);
            setLoading(false);
        }
    }, [usersData]);
    (0, react_1.useEffect)(function () {
        if (rolesData) {
            setRoles(rolesData);
        }
    }, [rolesData]);
    var handleSave = function (userData) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!(editingUser === null || editingUser === void 0 ? void 0 : editingUser.id)) return [3 /*break*/, 2];
                    return [4 /*yield*/, updateMutation.mutate({
                            url: "/api/admin/users/".concat(editingUser.id),
                            method: 'PUT',
                            data: userData
                        })];
                case 1:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Utilizator actualizat cu succes!' });
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, createMutation.mutate({
                        url: '/api/admin/users',
                        method: 'POST',
                        data: userData
                    })];
                case 3:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Utilizator creat cu succes!' });
                    _a.label = 4;
                case 4:
                    setShowModal(false);
                    setEditingUser(null);
                    refetchUsers();
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    setAlert({ type: 'error', message: error_1.message || 'Eroare la salvare' });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return <div className="users-page">Se încarcă...</div>;
    }
    return (<div className="users-page">
      <PageHeader_1.PageHeader title='Utilizatori & Permisiuni' description="Gestionare utilizatori și roluri"/>

      {alert && (<InlineAlert_1.InlineAlert type={alert.type} message={alert.message} onClose={function () { return setAlert(null); }}/>)}

      <div className="users-page__actions">
        <button className="btn btn-primary" onClick={function () {
            setEditingUser(null);
            setShowModal(true);
        }}>
          ➕ Adaugă Utilizator
        </button>
      </div>

      <div className="users-page__table">
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Status</th>
              <th>Ultimul Login</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (<tr>
                <td colSpan={6} className="text-center">Nu există utilizatori</td>
              </tr>) : (users.map(function (user) { return (<tr key={user.id}>
                  <td><strong>{user.username}</strong></td>
                  <td>{user.email || '-'}</td>
                  <td>{user.role_name}</td>
                  <td>
                    <span className={"badge ".concat(user.is_active ? 'badge-success' : 'badge-secondary')}>
                      {user.is_active ? 'Activ' : 'Inactiv'}
                    </span>
                  </td>
                  <td>{user.last_login ? new Date(user.last_login).toLocaleString('ro-RO') : '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={function () {
                setEditingUser(user);
                setShowModal(true);
            }}>
                      ✏️ Edit
                    </button>
                  </td>
                </tr>); }))}
          </tbody>
        </table>
      </div>

      {showModal && (<UserModal user={editingUser} roles={roles} onSave={handleSave} onClose={function () {
                setShowModal(false);
                setEditingUser(null);
            }}/>)}
    </div>);
};
exports.UsersPage = UsersPage;
var UserModal = function (_a) {
    var _b;
    var user = _a.user, roles = _a.roles, onSave = _a.onSave, onClose = _a.onClose;
    var _c = (0, react_1.useState)({
        username: (user === null || user === void 0 ? void 0 : user.username) || '',
        email: (user === null || user === void 0 ? void 0 : user.email) || '',
        password: '',
        roleId: (user === null || user === void 0 ? void 0 : user.id) || ((_b = roles[0]) === null || _b === void 0 ? void 0 : _b.id) || 0,
    }), formData = _c[0], setFormData = _c[1];
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.username || !formData.roleId) {
            alert('Username și rolul sunt obligatorii');
            return;
        }
        if (!user && !formData.password) {
            alert('Parola este obligatorie pentru utilizatori noi');
            return;
        }
        onSave(formData);
    };
    return (<div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={function (e) { return e.stopPropagation(); }}>
        <div className="modal-header">
          <h3>{user ? 'Editare Utilizator' : 'Adaugă Utilizator'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username *</label>
            <input type="text" value={formData.username} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { username: e.target.value })); }} required/>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formData.email} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { email: e.target.value })); }}/>
          </div>
          <div className="form-group">
            <label>Parolă {!user && '*'}</label>
            <input type="password" value={formData.password} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { password: e.target.value })); }} required={!user} placeholder={user ? 'Lăsați gol pentru a nu schimba' : ''}/>
          </div>
          <div className="form-group">
            <label>Rol *</label>
            <select value={formData.roleId} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { roleId: parseInt(e.target.value) })); }} required>
              {roles.map(function (role) { return (<option key={role.id} value={role.id}>
                  {role.role_name}
                </option>); })}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Anulează</button>
            <button type="submit" className="btn btn-primary">
              Salvează
            </button>
          </div>
        </form>
      </div>
    </div>);
};
