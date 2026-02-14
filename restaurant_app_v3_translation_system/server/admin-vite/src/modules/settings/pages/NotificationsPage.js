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
exports.NotificationsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./NotificationsPage.css");
var NOTIFICATION_TYPES = [
    { value: 'order', label: 'Comenzi' },
    { value: 'reservation', label: 'Rezervări' },
    { value: 'stock', label: 'Stocuri' },
    { value: 'system', label: 'Sistem' },
];
var CHANNELS = [
    { value: 'in-app', label: 'În aplicație' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Push Notification' },
];
var NotificationsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), preferences = _a[0], setPreferences = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), alert = _c[0], setAlert = _c[1];
    var _d = (0, useApiQuery_1.useApiQuery)('/api/settings/notifications/preferences'), data = _d.data, refetch = _d.refetch;
    var updateMutation = (0, useApiMutation_1.useApiMutation)();
    (0, react_1.useEffect)(function () {
        if (data) {
            setPreferences(data);
            setLoading(false);
        }
        else {
            // Inițializează preferințele default dacă nu există
            var defaultPrefs_1 = [];
            NOTIFICATION_TYPES.forEach(function (type) {
                CHANNELS.forEach(function (channel) {
                    defaultPrefs_1.push({
                        notification_type: type.value,
                        channel: channel.value,
                        is_enabled: channel.value === 'in-app', // Doar in_app enabled by default
                    });
                });
            });
            setPreferences(defaultPrefs_1);
            setLoading(false);
        }
    }, [data]);
    var handleToggle = function (type, channel, enabled) { return __awaiter(void 0, void 0, void 0, function () {
        var updated;
        return __generator(this, function (_a) {
            updated = preferences.map(function (p) {
                if (p.notification_type === type && p.channel === channel) {
                    return __assign(__assign({}, p), { is_enabled: enabled });
                }
                return p;
            });
            setPreferences(updated);
            return [2 /*return*/];
        });
    }); };
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, updateMutation.mutate({
                            url: '/api/settings/notifications/preferences',
                            method: 'PUT',
                            data: { preferences: preferences }
                        })];
                case 1:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Preferințe notificări salvate cu succes!' });
                    refetch();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    setAlert({ type: 'error', message: error_1.message || 'Eroare la salvare' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return <div className="notifications-page">Se încarcă...</div>;
    }
    return (<div className="notifications-page">
      <PageHeader_1.PageHeader title='Notificări și Alerte' description="Configurare preferințe notificări și canale de comunicare"/>

      {alert && (<InlineAlert_1.InlineAlert type={alert.type} message={alert.message} onClose={function () { return setAlert(null); }}/>)}

      <div className="notifications-page__content">
        <div className="notifications-table">
          <table className="table">
            <thead>
              <tr>
                <th>Tip Notificare</th>
                {CHANNELS.map(function (channel) { return (<th key={channel.value}>{channel.label}</th>); })}
              </tr>
            </thead>
            <tbody>
              {NOTIFICATION_TYPES.map(function (type) { return (<tr key={type.value}>
                  <td><strong>{type.label}</strong></td>
                  {CHANNELS.map(function (channel) {
                var _a;
                var pref = preferences.find(function (p) { return p.notification_type === type.value && p.channel === channel.value; });
                var enabled = (_a = pref === null || pref === void 0 ? void 0 : pref.is_enabled) !== null && _a !== void 0 ? _a : false;
                return (<td key={channel.value}>
                        <label className="switch">
                          <input type="checkbox" checked={enabled} onChange={function (e) { return handleToggle(type.value, channel.value, e.target.checked); }}/>
                          <span className="slider"></span>
                        </label>
                      </td>);
            })}
                </tr>); })}
            </tbody>
          </table>
        </div>

        <div className="notifications-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            [Save] Salvează Preferințe
          </button>
        </div>
      </div>
    </div>);
};
exports.NotificationsPage = NotificationsPage;
