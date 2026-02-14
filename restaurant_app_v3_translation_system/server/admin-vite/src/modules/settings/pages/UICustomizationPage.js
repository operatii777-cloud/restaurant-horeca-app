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
exports.UICustomizationPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var PageHeader_1 = require("@/shared/components/PageHeader");
var ThemeContext_1 = require("@/shared/context/ThemeContext");
require("./UICustomizationPage.css");
var UICustomizationPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), themes = _a[0], setThemes = _a[1];
    var _b = (0, react_1.useState)({}), settings = _b[0], setSettings = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(false), showThemeModal = _d[0], setShowThemeModal = _d[1];
    var _e = (0, react_1.useState)(null), editingTheme = _e[0], setEditingTheme = _e[1];
    var _f = (0, react_1.useState)(false), darkMode = _f[0], setDarkMode = _f[1];
    var _g = (0, react_1.useState)(null), alert = _g[0], setAlert = _g[1];
    var _h = (0, useApiQuery_1.useApiQuery)('/api/settings/ui/themes'), themesData = _h.data, refetchThemes = _h.refetch;
    var _j = (0, useApiQuery_1.useApiQuery)('/api/settings/ui'), settingsData = _j.data, refetchSettings = _j.refetch;
    var createThemeMutation = (0, useApiMutation_1.useApiMutation)();
    var updateSettingsMutation = (0, useApiMutation_1.useApiMutation)();
    (0, react_1.useEffect)(function () {
        if (themesData) {
            setThemes(themesData);
        }
        if (settingsData) {
            setSettings(settingsData);
        }
        if (themesData && settingsData) {
            setLoading(false);
        }
    }, [themesData, settingsData]);
    // Import ThemeContext pentru sincronizare
    var _k = (0, ThemeContext_1.useTheme)(), themeName = _k.themeName, setTheme = _k.setTheme;
    (0, react_1.useEffect)(function () {
        // Sincronizează dark mode cu ThemeContext
        var isDark = themeName === 'dark';
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
        }
        else {
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'false');
        }
    }, [themeName]);
    var handleToggleDarkMode = function () {
        // Folosește ThemeContext pentru toggle
        var newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        // Sincronizează cu ThemeContext
        if (newDarkMode) {
            setTheme('dark');
        }
        else {
            setTheme('light');
        }
    };
    var handleSaveTheme = function (theme) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!(editingTheme === null || editingTheme === void 0 ? void 0 : editingTheme.id)) return [3 /*break*/, 2];
                    return [4 /*yield*/, createThemeMutation.mutate({
                            url: "/api/settings/ui/themes/".concat(editingTheme.id),
                            method: 'PUT',
                            data: theme
                        })];
                case 1:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Temă actualizată cu succes!' });
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, createThemeMutation.mutate({
                        url: '/api/settings/ui/themes',
                        method: 'POST',
                        data: theme
                    })];
                case 3:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Temă creată cu succes!' });
                    _a.label = 4;
                case 4:
                    setShowThemeModal(false);
                    setEditingTheme(null);
                    refetchThemes();
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    setAlert({ type: 'error', message: error_1.message || 'Eroare la salvare' });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveSettings = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, updateSettingsMutation.mutate({
                            url: '/api/settings/ui',
                            method: 'PUT',
                            data: settings
                        })];
                case 1:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Setări UI salvate cu succes!' });
                    refetchSettings();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    setAlert({ type: 'error', message: error_2.message || 'Eroare la salvare' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleSelectTheme = function (themeId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, updateSettingsMutation.mutate({
                            url: '/api/settings/ui',
                            method: 'PUT',
                            data: __assign(__assign({}, settings), { theme_id: themeId })
                        })];
                case 1:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Temă aplicată cu succes!' });
                    refetchSettings();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    setAlert({ type: 'error', message: error_3.message || 'Eroare la aplicare' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return <div className="ui-customization-page">Se încarcă...</div>;
    }
    return (<div className="ui-customization-page">
      <PageHeader_1.PageHeader title="personalizare ui" description="Configurare teme, culori, logo și dark mode"/>

      {alert && (<InlineAlert_1.InlineAlert type={alert.type} message={alert.message} onClose={function () { return setAlert(null); }}/>)}

      <div className="ui-customization-page__content">
        <div className="ui-section">
          <h3>"dark mode"</h3>
          <div className="dark-mode-toggle">
            <label className="switch">
              <input type="checkbox" checked={darkMode} onChange={handleToggleDarkMode}/>
              <span className="slider"></span>
            </label>
            <span>{darkMode ? 'Dark Mode Activ' : 'Light Mode Activ'}</span>
          </div>
        </div>

        <div className="ui-section">
          <div className="section-header">
            <h3>Teme UI</h3>
            <button className="btn btn-primary" onClick={function () {
            setEditingTheme(null);
            setShowThemeModal(true);
        }}>
              ➕ Adaugă Temă
            </button>
          </div>
          <div className="themes-grid">
            {themes.map(function (theme) { return (<div key={theme.id} className={"theme-card ".concat(settings.theme_id === theme.id ? 'theme-card--active' : '')} onClick={function () { return theme.id && handleSelectTheme(theme.id); }}>
                <div className="theme-preview" style={{
                background: "linear-gradient(135deg, ".concat(theme.primary_color, " 0%, ").concat(theme.secondary_color, " 100%)"),
            }}>
                  <div className="theme-preview__colors">
                    <div className="color-dot" style={{ backgroundColor: theme.primary_color }}/>
                    <div className="color-dot" style={{ backgroundColor: theme.secondary_color }}/>
                    <div className="color-dot" style={{ backgroundColor: theme.accent_color }}/>
                  </div>
                </div>
                <div className="theme-card__body">
                  <h4>{theme.name}</h4>
                  {theme.is_default && <span className="badge badge-info">Implicit</span>}
                </div>
              </div>); })}
          </div>
        </div>

        <div className="ui-section">
          <h3>"setari ui"</h3>
          <div className="form-group">
            <label>Logo URL</label>
            <input type="text" value={settings.logo_url || ''} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { logo_url: e.target.value })); }} placeholder="https://example.com/logo.png"/>
          </div>
          <div className="form-group">
            <label>Favicon URL</label>
            <input type="text" value={settings.favicon_url || ''} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { favicon_url: e.target.value })); }} placeholder="https://example.com/favicon.ico"/>
          </div>
          <div className="form-group">
            <label>"css personalizat"</label>
            <textarea value={settings.custom_css || ''} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { custom_css: e.target.value })); }} rows={5} placeholder="/* CSS personalizat */"/>
          </div>
          <div className="form-group">
            <label>"javascript personalizat"</label>
            <textarea value={settings.custom_js || ''} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { custom_js: e.target.value })); }} rows={5} placeholder="// JavaScript personalizat"/>
          </div>
          <div className="ui-actions">
            <button className="btn btn-primary" onClick={handleSaveSettings}>
              💾 Salvează Setări
            </button>
          </div>
        </div>
      </div>

      {showThemeModal && (<ThemeModal theme={editingTheme} onSave={handleSaveTheme} onClose={function () {
                setShowThemeModal(false);
                setEditingTheme(null);
            }}/>)}
    </div>);
};
exports.UICustomizationPage = UICustomizationPage;
var ThemeModal = function (_a) {
    var _b, _c;
    var theme = _a.theme, onSave = _a.onSave, onClose = _a.onClose;
    var _d = (0, react_1.useState)({
        name: (theme === null || theme === void 0 ? void 0 : theme.name) || '',
        primary_color: (theme === null || theme === void 0 ? void 0 : theme.primary_color) || '#007bff',
        secondary_color: (theme === null || theme === void 0 ? void 0 : theme.secondary_color) || '#6c757d',
        background_color: (theme === null || theme === void 0 ? void 0 : theme.background_color) || '#ffffff',
        text_color: (theme === null || theme === void 0 ? void 0 : theme.text_color) || '#212529',
        accent_color: (theme === null || theme === void 0 ? void 0 : theme.accent_color) || '#28a745',
        is_active: (_b = theme === null || theme === void 0 ? void 0 : theme.is_active) !== null && _b !== void 0 ? _b : true,
        is_default: (_c = theme === null || theme === void 0 ? void 0 : theme.is_default) !== null && _c !== void 0 ? _c : false,
    }), formData = _d[0], setFormData = _d[1];
    var handleSubmit = function (e) {
        e.preventDefault();
        onSave(formData);
    };
    return (<div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={function (e) { return e.stopPropagation(); }}>
        <div className="modal-header">
          <h3>{theme ? 'Editare Temă' : 'Adaugă Temă'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nume *</label>
            <input type="text" value={formData.name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }} required/>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>"culoare principala"</label>
              <div className="color-input-group">
                <input type="color" value={formData.primary_color} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { primary_color: e.target.value })); }}/>
                <input type="text" value={formData.primary_color} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { primary_color: e.target.value })); }}/>
              </div>
            </div>
            <div className="form-group">
              <label>"culoare secundara"</label>
              <div className="color-input-group">
                <input type="color" value={formData.secondary_color} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { secondary_color: e.target.value })); }}/>
                <input type="text" value={formData.secondary_color} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { secondary_color: e.target.value })); }}/>
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>"culoare accent"</label>
              <div className="color-input-group">
                <input type="color" value={formData.accent_color} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { accent_color: e.target.value })); }}/>
                <input type="text" value={formData.accent_color} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { accent_color: e.target.value })); }}/>
              </div>
            </div>
            <div className="form-group">
              <label>"culoare text"</label>
              <div className="color-input-group">
                <input type="color" value={formData.text_color} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { text_color: e.target.value })); }}/>
                <input type="text" value={formData.text_color} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { text_color: e.target.value })); }}/>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>"culoare fundal"</label>
            <div className="color-input-group">
              <input type="color" value={formData.background_color} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { background_color: e.target.value })); }}/>
              <input type="text" value={formData.background_color} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { background_color: e.target.value })); }}/>
            </div>
          </div>
          <div className="theme-preview-box" style={{ background: formData.background_color, color: formData.text_color }}>
            <div style={{ background: formData.primary_color, padding: '1rem', borderRadius: '4px' }}>"preview tema"</div>
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
