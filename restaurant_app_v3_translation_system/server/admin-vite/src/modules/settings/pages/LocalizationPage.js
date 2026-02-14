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
exports.LocalizationPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var PageHeader_1 = require("@/shared/components/PageHeader");
var ThemeContext_1 = require("@/shared/context/ThemeContext");
var themes_1 = require("@/shared/themes/themes");
require("./LocalizationPage.css");
var LANGUAGES = [
    { value: 'ro', label: 'Română' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
];
var TIMEZONES = [
    { value: 'Europe/Bucharest', label: 'București (GMT+2)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' },
];
var DATE_FORMATS = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];
var LocalizationPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, ThemeContext_1.useTheme)(), theme = _a.theme, themeName = _a.themeName, setTheme = _a.setTheme;
    var _b = (0, react_1.useState)({
        language: 'ro',
        timezone: 'Europe/Bucharest',
        date_format: 'DD/MM/YYYY',
        time_format: '24h',
        currency: 'RON',
        currency_symbol: 'RON',
        currency_position: 'after',
        decimal_separator: ',',
        thousand_separator: '.',
        first_day_of_week: 1,
    }), settings = _b[0], setSettings = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), alert = _d[0], setAlert = _d[1];
    var _e = (0, useApiQuery_1.useApiQuery)('/api/settings/localization'), data = _e.data, refetch = _e.refetch;
    var updateMutation = (0, useApiMutation_1.useApiMutation)();
    (0, react_1.useEffect)(function () {
        if (data) {
            setSettings(data);
            setLoading(false);
        }
        else {
            setLoading(false);
        }
    }, [data]);
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, updateMutation.mutate({
                            url: '/api/settings/localization',
                            method: 'PUT',
                            data: settings
                        })];
                case 1:
                    _a.sent();
                    setAlert({ type: 'success', message: 'Setări localizare salvate cu succes!' });
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
    var getPreview = function () {
        var date = new Date();
        var formattedDate = date.toLocaleDateString('ro-RO');
        var formattedTime = date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
        var amount = 1234.56;
        var formattedAmount = settings.currency_position === 'before'
            ? "".concat(settings.currency_symbol, " ").concat(amount.toFixed(2).replace('.', settings.decimal_separator).replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousand_separator))
            : "".concat(amount.toFixed(2).replace('.', settings.decimal_separator).replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousand_separator), " ").concat(settings.currency_symbol);
        return {
            date: formattedDate,
            time: formattedTime,
            amount: formattedAmount,
        };
    };
    if (loading) {
        return <div className="localization-page">Se încarcă...</div>;
    }
    var preview = getPreview();
    return (<div className="localization-page">
      <PageHeader_1.PageHeader title="Localizare" description="Configurare limbă, timezone, format dată/timp și monedă"/>

      {alert && (<InlineAlert_1.InlineAlert type={alert.type} message={alert.message} onClose={function () { return setAlert(null); }}/>)}

      <div className="localization-page__content">
        <div className="localization-form">
          {/* ✅ NOU: Secțiune pentru schimbarea temei cu previzualizare fond */}
          <div className="form-section">
            <h3>🎨 Tema Aplicației</h3>
            <div className="form-row">
              <div className="form-group">
                <label>"tema activa"</label>
                <select value={themeName} onChange={function (e) { return setTheme(e.target.value); }} title="tema activa" style={{
            padding: '0.75rem',
            borderRadius: '8px',
            border: "1px solid ".concat(theme.border),
            background: theme.surface,
            color: theme.text,
            fontSize: '1rem',
            cursor: 'pointer',
        }}>
                  {Object.values(themes_1.themes).map(function (t) { return (<option key={t.name} value={t.name}>
                      {t.displayName}
                    </option>); })}
                </select>
              </div>
            </div>
            {/* Previzualizare fond în timp real */}
            <div className="theme-preview" style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: theme.text }}>
                Previzualizare Fond:
              </label>
              <div className="theme-preview-box" style={{
            width: '100%',
            minHeight: '180px',
            background: theme.bg,
            borderRadius: '12px',
            border: "2px solid ".concat(theme.border),
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: "0 4px 12px ".concat(theme.shadowColor),
            transition: 'all 0.3s ease',
        }}>
                <div style={{ color: theme.text, fontWeight: 600, fontSize: '1.1rem' }}>
                  Tema: {themes_1.themes[themeName].displayName}
                </div>
                <div style={{ color: theme.textMuted, fontSize: '0.9rem' }}>
                  Fond: {theme.bgSolid}
                </div>
                <div style={{ color: theme.textMuted, fontSize: '0.9rem' }}>
                  Text: {theme.text}
                </div>
                <div style={{ color: theme.accent, fontSize: '0.9rem' }}>
                  Accent: {theme.accent}
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Limbă & Timezone</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Limbă *</label>
                <select value={settings.language} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { language: e.target.value })); }} title="Limbă">
                  {LANGUAGES.map(function (lang) { return (<option key={lang.value} value={lang.value}>{lang.label}</option>); })}
                </select>
              </div>
              <div className="form-group">
                <label>Timezone *</label>
                <select value={settings.timezone} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { timezone: e.target.value })); }} title="Timezone">
                  {TIMEZONES.map(function (tz) { return (<option key={tz.value} value={tz.value}>{tz.label}</option>); })}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Format Dată & Timp</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Format Dată *</label>
                <select value={settings.date_format} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { date_format: e.target.value })); }} title="Format Dată">
                  {DATE_FORMATS.map(function (format) { return (<option key={format.value} value={format.value}>{format.label}</option>); })}
                </select>
              </div>
              <div className="form-group">
                <label>Format Timp *</label>
                <select value={settings.time_format} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { time_format: e.target.value })); }} title="Format Timp">
                  <option value="24h">24 ore</option>
                  <option value="12h">12 ore (AM/PM)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>"Monedă"</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Monedă *</label>
                <input type="text" value={settings.currency} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { currency: e.target.value })); }} placeholder="RON"/>
              </div>
              <div className="form-group">
                <label>Simbol Monedă *</label>
                <input type="text" value={settings.currency_symbol} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { currency_symbol: e.target.value })); }} placeholder="RON"/>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>"pozitie simbol"</label>
                <select value={settings.currency_position} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { currency_position: e.target.value })); }} title="pozitie simbol">
                  <option value="before">Înainte (RON 100)</option>
                  <option value="after">După (100 RON)</option>
                </select>
              </div>
              <div className="form-group">
                <label>"prima zi saptamana"</label>
                <select value={settings.first_day_of_week} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { first_day_of_week: parseInt(e.target.value) })); }} title="prima zi saptamana">
                  <option value="0">"Duminică"</option>
                  <option value="1">Luni</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Separatori</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Separator Zecimal</label>
                <input type="text" value={settings.decimal_separator} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { decimal_separator: e.target.value })); }} maxLength={1} placeholder=","/>
              </div>
              <div className="form-group">
                <label>Separator Mii</label>
                <input type="text" value={settings.thousand_separator} onChange={function (e) { return setSettings(__assign(__assign({}, settings), { thousand_separator: e.target.value })); }} maxLength={1} placeholder="."/>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Preview</h3>
            <div className="preview-box">
              <p><strong>"Dată:"</strong> {preview.date}</p>
              <p><strong>Timp:</strong> {preview.time}</p>
              <p><strong>"Sumă:"</strong> {preview.amount}</p>
            </div>
          </div>

          <div className="localization-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              💾 Salvează Setări
            </button>
          </div>
        </div>
      </div>
    </div>);
};
exports.LocalizationPage = LocalizationPage;
