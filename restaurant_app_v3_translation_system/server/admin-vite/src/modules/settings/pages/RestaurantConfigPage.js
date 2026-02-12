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
exports.RestaurantConfigPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var httpClient_1 = require("@/shared/api/httpClient");
require("./RestaurantConfigPage.css");
// Mapare între structura frontend și backend
function mapBackendToFrontend(backend) {
    return {
        name: backend.restaurant_name || backend.name || '',
        address: backend.restaurant_address || backend.address || '',
        phone: backend.restaurant_phone || backend.phone || '',
        email: backend.restaurant_email || backend.email || '',
        cui: backend.restaurant_cui || backend.cui || '',
        regCom: backend.restaurant_reg_com || backend.regCom || '',
        bank: backend.restaurant_bank || backend.bank || '',
        iban: backend.restaurant_iban || backend.iban || '',
        fiscalSeries: backend.fiscal_series || backend.fiscalSeries || 'RC',
        invoiceSeries: backend.invoice_series || backend.invoiceSeries || 'INV',
        vatFood: parseFloat(backend.vat_food || backend.vatFood || '11'),
        vatDrinks: parseFloat(backend.vat_drinks || backend.vatDrinks || '21'),
    };
}
function mapFrontendToBackend(frontend) {
    return {
        restaurant_name: frontend.name,
        restaurant_address: frontend.address,
        restaurant_phone: frontend.phone,
        restaurant_email: frontend.email,
        restaurant_cui: frontend.cui,
        restaurant_reg_com: frontend.regCom,
        restaurant_bank: frontend.bank,
        restaurant_iban: frontend.iban,
        fiscal_series: frontend.fiscalSeries,
        invoice_series: frontend.invoiceSeries,
        vat_food: frontend.vatFood.toString(),
        vat_drinks: frontend.vatDrinks.toString(),
    };
}
var RestaurantConfigPage = function () {
    // const { t } = useTranslation();
    var _a = (0, react_1.useState)({
        name: '',
        address: '',
        phone: '',
        email: '',
        cui: '',
        regCom: '',
        bank: '',
        iban: '',
        fiscalSeries: 'RC',
        invoiceSeries: 'INV',
        vatFood: 11,
        vatDrinks: 21,
    }), config = _a[0], setConfig = _a[1];
    var _b = (0, react_1.useState)(null), feedback = _b[0], setFeedback = _b[1];
    var _c = (0, useApiQuery_1.useApiQuery)('/api/settings/restaurant'), existingConfig = _c.data, isLoading = _c.loading;
    var _d = (0, useApiMutation_1.useApiMutation)(), saveConfig = _d.mutate, isSaving = _d.loading;
    (0, react_1.useEffect)(function () {
        if (existingConfig) {
            var mapped = mapBackendToFrontend(existingConfig);
            setConfig(mapped);
        }
    }, [existingConfig]);
    var handleChange = function (field, value) {
        setConfig(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var backendData;
        return __generator(this, function (_a) {
            e.preventDefault();
            setFeedback(null);
            backendData = mapFrontendToBackend(config);
            saveConfig({
                url: '/api/settings/restaurant',
                method: 'PUT',
                data: backendData,
            })
                .then(function () {
                setFeedback({ type: 'success', message: 'Configurația a fost salvată cu succes!' });
            })
                .catch(function (error) {
                setFeedback({ type: 'error', message: error.message || 'Eroare la salvarea configurației' });
            });
            return [2 /*return*/];
        });
    }); };
    var handleReload = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, mapped, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/settings/restaurant')];
                case 1:
                    response = _a.sent();
                    if (response.data) {
                        mapped = mapBackendToFrontend(response.data);
                        setConfig(mapped);
                        setFeedback({ type: 'success', message: 'Datele au fost reîncărcate' });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    setFeedback({ type: 'error', message: 'Eroare la reîncărcarea datelor' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return <div className="restaurant-config-loading">Se încarcă configurația...</div>;
    }
    return (<div className="restaurant-config-page">
      <div className="restaurant-config-page__alert">
        <InlineAlert_1.InlineAlert variant="info" message="Aceste date vor apărea pe toate documentele fiscale (bonuri fiscale, facturi, chitanțe). Asigurați-vă că introduceți datele corecte ale persoanei juridice."/>
      </div>

      {feedback && (<InlineAlert_1.InlineAlert variant={feedback.type} message={feedback.message} onClose={function () { return setFeedback(null); }}/>)}

      <form onSubmit={handleSubmit} className="restaurant-config-form">
        <div className="restaurant-config-form__section">
          <h3 className="restaurant-config-form__section-title">
            <span className="restaurant-config-form__section-icon">🏢</span>Date Persoană Juridică</h3>

          <div className="restaurant-config-form__grid">
            <div className="restaurant-config-form__field">
              <label htmlFor="restaurantName" className="restaurant-config-form__label">Numele restaurantului<span className="required">*</span>
              </label>
              <input type="text" id="restaurantName" className="restaurant-config-form__input" value={config.name} onChange={function (e) { return handleChange('name', e.target.value); }} placeholder="ex: Restaurant Trattoria" required/>
              <small className="restaurant-config-form__help">Numele complet al restaurantului</small>
            </div>

            <div className="restaurant-config-form__field restaurant-config-form__field--full">
              <label htmlFor="restaurantAddress" className="restaurant-config-form__label">Adresa completă<span className="required">*</span>
              </label>
              <textarea id="restaurantAddress" className="restaurant-config-form__input" rows={3} value={config.address} onChange={function (e) { return handleChange('address', e.target.value); }} placeholder="ex: Strada Principală 123, Sector 1, București" required/>
              <small className="restaurant-config-form__help">Adresa completă cu sectorul și orașul</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="restaurantPhone" className="restaurant-config-form__label">Telefon</label>
              <input type="tel" id="restaurantPhone" className="restaurant-config-form__input" value={config.phone} onChange={function (e) { return handleChange('phone', e.target.value); }} placeholder="ex: 021.123.4567"/>
              <small className="restaurant-config-form__help">Numărul de telefon al restaurantului</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="restaurantEmail" className="restaurant-config-form__label">Email</label>
              <input type="email" id="restaurantEmail" className="restaurant-config-form__input" value={config.email} onChange={function (e) { return handleChange('email', e.target.value); }} placeholder="ex: contact@restaurant.ro"/>
              <small className="restaurant-config-form__help">Adresa de email pentru contact</small>
            </div>
          </div>
        </div>

        <div className="restaurant-config-form__section">
          <h3 className="restaurant-config-form__section-title">
            <span className="restaurant-config-form__section-icon">📄</span>
            Date Fiscale
          </h3>

          <div className="restaurant-config-form__grid">
            <div className="restaurant-config-form__field">
              <label htmlFor="restaurantCUI" className="restaurant-config-form__label">
                Cod Fiscal (CUI) <span className="required">*</span>
              </label>
              <input type="text" id="restaurantCUI" className="restaurant-config-form__input" value={config.cui} onChange={function (e) { return handleChange('cui', e.target.value); }} placeholder="ex: RO12345678" required/>
              <small className="restaurant-config-form__help">Codul de identificare fiscală</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="restaurantRegCom" className="restaurant-config-form__label">Registrul Comerțului</label>
              <input type="text" id="restaurantRegCom" className="restaurant-config-form__input" value={config.regCom} onChange={function (e) { return handleChange('regCom', e.target.value); }} placeholder="ex: J40/1234/2023"/>
              <small className="restaurant-config-form__help">Numărul din registrul comerțului</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="restaurantBank" className="restaurant-config-form__label">Banca</label>
              <input type="text" id="restaurantBank" className="restaurant-config-form__input" value={config.bank} onChange={function (e) { return handleChange('bank', e.target.value); }} placeholder="ex: Banca Transilvania"/>
              <small className="restaurant-config-form__help">Numele băncii</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="restaurantIBAN" className="restaurant-config-form__label">IBAN</label>
              <input type="text" id="restaurantIBAN" className="restaurant-config-form__input" value={config.iban} onChange={function (e) { return handleChange('iban', e.target.value); }} placeholder="ex: RO49BTRL1234567890123456"/>
              <small className="restaurant-config-form__help">Contul bancar IBAN</small>
            </div>
          </div>
        </div>

        <div className="restaurant-config-form__section">
          <h3 className="restaurant-config-form__section-title">
            <span className="restaurant-config-form__section-icon">⚙️</span>Setări Documente Fiscale</h3>

          <div className="restaurant-config-form__grid">
            <div className="restaurant-config-form__field">
              <label htmlFor="fiscalSeries" className="restaurant-config-form__label">Seria Documentelor</label>
              <input type="text" id="fiscalSeries" className="restaurant-config-form__input" value={config.fiscalSeries} onChange={function (e) { return handleChange('fiscalSeries', e.target.value); }} placeholder="ex: RC" maxLength={5}/>
              <small className="restaurant-config-form__help">Seria pentru bonuri fiscale (ex: RC)</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="invoiceSeries" className="restaurant-config-form__label">Seria Facturilor</label>
              <input type="text" id="invoiceSeries" className="restaurant-config-form__input" value={config.invoiceSeries} onChange={function (e) { return handleChange('invoiceSeries', e.target.value); }} placeholder="ex: INV" maxLength={5}/>
              <small className="restaurant-config-form__help">Seria pentru facturi (ex: INV)</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="vatFood" className="restaurant-config-form__label">TVA Alimente (%)</label>
              <input type="number" id="vatFood" className="restaurant-config-form__input" value={config.vatFood} onChange={function (e) { return handleChange('vatFood', parseFloat(e.target.value) || 0); }} min={0} max={100} step={0.01}/>
              <small className="restaurant-config-form__help">TVA pentru alimente și mâncare</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="vatDrinks" className="restaurant-config-form__label">TVA Băuturi (%)</label>
              <input type="number" id="vatDrinks" className="restaurant-config-form__input" value={config.vatDrinks} onChange={function (e) { return handleChange('vatDrinks', parseFloat(e.target.value) || 0); }} min={0} max={100} step={0.01}/>
              <small className="restaurant-config-form__help">TVA pentru băuturi alcoolice și non-alcoolice</small>
            </div>
          </div>
        </div>

        <div className="restaurant-config-form__actions">
          <button type="button" className="restaurant-config-form__button restaurant-config-form__button--secondary" onClick={handleReload}>
            🔄 Reîncarcă Datele
          </button>
          <button type="submit" className="restaurant-config-form__button restaurant-config-form__button--primary" disabled={isSaving}>
            {isSaving ? 'Se salvează...' : '💾 Salvează Configurația'}
          </button>
        </div>
      </form>
    </div>);
};
exports.RestaurantConfigPage = RestaurantConfigPage;
