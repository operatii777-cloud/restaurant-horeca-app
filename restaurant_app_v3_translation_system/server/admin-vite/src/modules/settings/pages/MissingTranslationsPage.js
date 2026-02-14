"use strict";
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
exports.MissingTranslationsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var PageHeader_1 = require("@/shared/components/PageHeader");
var httpClient_1 = require("@/shared/api/httpClient");
require("./MissingTranslationsPage.css");
var MissingTranslationsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), translations = _a[0], setTranslations = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(null), updating = _d[0], setUpdating = _d[1];
    (0, react_1.useEffect)(function () {
        loadTranslations();
    }, []);
    var loadTranslations = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setError(null);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/missing-translations')];
                case 1:
                    response = _c.sent();
                    if (response.data.success) {
                        setTranslations(response.data.translations);
                    }
                    else {
                        setError('Eroare la încărcarea traducerilor');
                    }
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _c.sent();
                    console.error('Error loading missing translations:', err_1);
                    setError(((_b = (_a = err_1 === null || err_1 === void 0 ? void 0 : err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la încărcarea traducerilor');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    var markInProgress = function (key) { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setUpdating(key);
                    return [4 /*yield*/, httpClient_1.httpClient.put("/api/missing-translations/".concat(encodeURIComponent(key)), {
                            status: 'in_progress',
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadTranslations()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    console.error('Error updating translation:', err_2);
                    setError('Eroare la actualizarea traducerii');
                    return [3 /*break*/, 5];
                case 4:
                    setUpdating(null);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var markCompleted = function (key) { return __awaiter(void 0, void 0, void 0, function () {
        var err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setUpdating(key);
                    return [4 /*yield*/, httpClient_1.httpClient.delete("/api/missing-translations/".concat(encodeURIComponent(key)))];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadTranslations()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    err_3 = _a.sent();
                    console.error('Error deleting translation:', err_3);
                    setError('Eroare la ștergerea traducerii');
                    return [3 /*break*/, 5];
                case 4:
                    setUpdating(null);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var translationsByStatus = {
        reported: translations.filter(function (t) { return t.status === 'reported'; }),
        in_progress: translations.filter(function (t) { return t.status === 'in_progress'; }),
    };
    var getFileName = function (page) {
        if (!page)
            return 'N/A';
        return page.split('/').pop() || page;
    };
    if (loading) {
        return (<div className="missing-translations-page">
        <PageHeader_1.PageHeader title='Traduceri în așteptare'/>
        <div className="text-center py-5">
          <react_bootstrap_1.Spinner animation="border" variant="primary"/>
          <p className="mt-3">Se încarcă traducerile...</p>
        </div>
      </div>);
    }
    return (<div className="missing-translations-page">
      <PageHeader_1.PageHeader title='Traduceri în așteptare' description="Gestionare traduceri în așteptare" actions={[
            {
                label: '[Reload] Reîncarcă',
                variant: 'secondary',
                onClick: loadTranslations,
            },
        ]}/>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }}>
          {error}
        </react_bootstrap_1.Alert>)}

      <react_bootstrap_1.Alert variant="info" className="mt-4">
        <strong>[Info] Informații:</strong>
        <ul className="mb-0 mt-2">
          <li>Această secțiune afișează DOAR termenii care necesită traducere (Noi sau În Lucru).</li>
          <li>
            <strong>[Check] Când marchezi ca "Finalizat":</strong> Termenul dispare automat din listă</li>
          <li>
            <strong>[Warning] False-positives:</strong> Dacă un termen e deja tradus sau nu necesită traducere,
            apasă "[Check] E Deja Tradus" pentru a-l șterge din listă.
          </li>
        </ul>
      </react_bootstrap_1.Alert>

      {/* Reported (New) Translations */}
      {translationsByStatus.reported.length > 0 && (<react_bootstrap_1.Card className="mt-4">
          <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              Noi
              <react_bootstrap_1.Badge bg="primary" className="ms-2">
                {translationsByStatus.reported.length}
              </react_bootstrap_1.Badge>
            </h5>
          </react_bootstrap_1.Card.Header>
          <react_bootstrap_1.Card.Body>
            <react_bootstrap_1.Table striped hover responsive>
              <thead>
                <tr>
                  <th>Termen românesc</th>
                  <th>Fișier sursă</th>
                  <th>Data raportării</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {translationsByStatus.reported.map(function (translation) { return (<tr key={translation.key}>
                    <td><code>{translation.key}</code></td>
                    <td>{getFileName(translation.page)}</td>
                    <td>{new Date(translation.timestamp).toLocaleDateString()}</td>
                    <td>
                      <react_bootstrap_1.Button size="sm" variant="warning" onClick={function () { return markInProgress(translation.key); }} disabled={updating === translation.key} className="me-2">
                        {updating === translation.key ? 'Se actualizează...' : 'Se lucrează'}
                      </react_bootstrap_1.Button>
                      <react_bootstrap_1.Button size="sm" variant="success" onClick={function () { return markCompleted(translation.key); }} disabled={updating === translation.key}>
                        {updating === translation.key ? 'Se finalizează...' : 'E Deja Tradus'}
                      </react_bootstrap_1.Button>
                    </td>
                  </tr>); })}
              </tbody>
            </react_bootstrap_1.Table>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>)}

      {/* In Progress Translations */}
      {translationsByStatus.in_progress.length > 0 && (<react_bootstrap_1.Card className="mt-4">
          <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              În Lucru
              <react_bootstrap_1.Badge bg="warning" className="ms-2">
                {translationsByStatus.in_progress.length}
              </react_bootstrap_1.Badge>
            </h5>
          </react_bootstrap_1.Card.Header>
          <react_bootstrap_1.Card.Body>
            <react_bootstrap_1.Table striped hover responsive>
              <thead>
                <tr>
                  <th>Termen românesc</th>
                  <th>Fișier sursă</th>
                  <th>Data raportării</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {translationsByStatus.in_progress.map(function (translation) { return (<tr key={translation.key}>
                    <td><code>{translation.key}</code></td>
                    <td>{getFileName(translation.page)}</td>
                    <td>{new Date(translation.timestamp).toLocaleDateString()}</td>
                    <td>
                      <react_bootstrap_1.Button size="sm" variant="success" onClick={function () { return markCompleted(translation.key); }} disabled={updating === translation.key}>
                        {updating === translation.key ? 'Se finalizează...' : 'Finalizează'}
                      </react_bootstrap_1.Button>
                    </td>
                  </tr>); })}
              </tbody>
            </react_bootstrap_1.Table>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>)}

      {/* Empty State */}
      {translationsByStatus.reported.length === 0 && translationsByStatus.in_progress.length === 0 && (<react_bootstrap_1.Alert variant="success" className="mt-4">
          Nu există traduceri în așteptare. Felicitări!
        </react_bootstrap_1.Alert>)}
    </div>);
};
exports.MissingTranslationsPage = MissingTranslationsPage;
