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
exports.TechnicalSheetsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
var HelpButton_1 = require("@/shared/components/HelpButton");
require("bootstrap/dist/css/bootstrap.min.css");
require("./TechnicalSheetsPage.css");
var TechnicalSheetsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), sheets = _a[0], setSheets = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(false), showModal = _c[0], setShowModal = _c[1];
    var _d = (0, react_1.useState)(null), selectedSheet = _d[0], setSelectedSheet = _d[1];
    var _e = (0, react_1.useState)(null), feedback = _e[0], setFeedback = _e[1];
    // State pentru modal
    var _f = (0, react_1.useState)([]), products = _f[0], setProducts = _f[1];
    var _g = (0, react_1.useState)(null), selectedProductId = _g[0], setSelectedProductId = _g[1];
    var _h = (0, react_1.useState)([]), recipes = _h[0], setRecipes = _h[1];
    var _j = (0, react_1.useState)(null), selectedRecipeId = _j[0], setSelectedRecipeId = _j[1];
    var _k = (0, react_1.useState)(false), loadingProducts = _k[0], setLoadingProducts = _k[1];
    var _l = (0, react_1.useState)(false), loadingRecipes = _l[0], setLoadingRecipes = _l[1];
    var _m = (0, react_1.useState)(false), generating = _m[0], setGenerating = _m[1];
    (0, react_1.useEffect)(function () {
        loadSheets();
    }, []);
    var loadSheets = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/technical-sheets')];
                case 2:
                    response = _b.sent();
                    setSheets(((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || []);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error loading technical sheets:', error_1);
                    setFeedback({ type: 'error', message: 'Eroare la încărcarea fișelor tehnice' });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Încarcă produsele care au rețete definite
     */
    var loadProductsWithRecipes = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoadingProducts(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/catalog-produse/products', {
                            params: { has_recipe: 1, is_active: 1 }
                        })];
                case 2:
                    response = _b.sent();
                    if (((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) && Array.isArray(response.data.data)) {
                        setProducts(response.data.data);
                    }
                    else if (Array.isArray(response.data)) {
                        setProducts(response.data);
                    }
                    else {
                        setProducts([]);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _b.sent();
                    console.error('Error loading products with recipes:', error_2);
                    setFeedback({ type: 'error', message: 'Eroare la încărcarea produselor' });
                    setProducts([]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoadingProducts(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Încarcă rețetele pentru un produs selectat
     */
    var loadRecipesForProduct = function (productId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setLoadingRecipes(true);
                    setRecipes([]);
                    setSelectedRecipeId(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/recipes/product/".concat(productId))];
                case 2:
                    response = _c.sent();
                    if (((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) && Array.isArray(response.data.data)) {
                        setRecipes(response.data.data);
                    }
                    else if (Array.isArray(response.data)) {
                        setRecipes(response.data);
                    }
                    else if (((_b = response.data) === null || _b === void 0 ? void 0 : _b.data) && Array.isArray(response.data.data)) {
                        setRecipes(response.data.data);
                    }
                    else {
                        setRecipes([]);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _c.sent();
                    console.error('Error loading recipes:', error_3);
                    setFeedback({ type: 'error', message: 'Eroare la încărcarea rețetelor' });
                    setRecipes([]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoadingRecipes(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Generează fișă tehnică din rețetă
     */
    var generateFromRecipe = function (productId, recipeId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_4;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!productId || !recipeId) {
                        setFeedback({ type: 'error', message: 'Selectează un produs și o rețetă' });
                        return [2 /*return*/];
                    }
                    setGenerating(true);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/technical-sheets/generate', {
                            product_id: productId,
                            recipe_id: recipeId
                        })];
                case 2:
                    response = _e.sent();
                    if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) {
                        setFeedback({ type: 'success', message: 'Fișă tehnică generată cu succes!' });
                        setShowModal(false);
                        // Reset modal state
                        setSelectedProductId(null);
                        setSelectedRecipeId(null);
                        setRecipes([]);
                        // Reload sheets
                        loadSheets();
                    }
                    else {
                        setFeedback({ type: 'error', message: ((_b = response.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la generare' });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_4 = _e.sent();
                    console.error('Error generating technical sheet:', error_4);
                    setFeedback({ type: 'error', message: ((_d = (_c = error_4.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || 'Eroare la generare' });
                    return [3 /*break*/, 5];
                case 4:
                    setGenerating(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var approveByChef = function (sheetId) { return __awaiter(void 0, void 0, void 0, function () {
        var chefName, notes, error_5;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    chefName = prompt('Nume Chef:');
                    if (!chefName)
                        return [2 /*return*/];
                    notes = prompt('Notițe (opțional):');
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/technical-sheets/".concat(sheetId, "/approve-chef"), {
                            chef_name: chefName,
                            notes: notes
                        })];
                case 1:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Aprobat de Chef!' });
                    loadSheets();
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _c.sent();
                    setFeedback({ type: 'error', message: ((_b = (_a = error_5.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la aprobare' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var approveByManager = function (sheetId) { return __awaiter(void 0, void 0, void 0, function () {
        var managerName, notes, error_6;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    managerName = prompt('Nume Manager:');
                    if (!managerName)
                        return [2 /*return*/];
                    notes = prompt('Notițe (opțional):');
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/technical-sheets/".concat(sheetId, "/approve-manager"), {
                            manager_name: managerName,
                            notes: notes
                        })];
                case 1:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Aprobat de Manager! PDF generat automat.' });
                    loadSheets();
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _c.sent();
                    setFeedback({ type: 'error', message: ((_b = (_a = error_6.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la aprobare' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var lockSheet = function (sheetId) { return __awaiter(void 0, void 0, void 0, function () {
        var reason, error_7;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!confirm('Ești sigur? Fișa LOCKED nu mai poate fi modificată!'))
                        return [2 /*return*/];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    reason = prompt('Motiv lock:') || 'Aprobat final';
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/technical-sheets/".concat(sheetId, "/lock"), {
                            locked_by: 'Admin',
                            reason: reason
                        })];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Fișă tehnică LOCKED!' });
                    loadSheets();
                    return [3 /*break*/, 4];
                case 3:
                    error_7 = _c.sent();
                    setFeedback({ type: 'error', message: ((_b = (_a = error_7.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la lock' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var downloadPDF = function (sheetId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, url, link, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/technical-sheets/".concat(sheetId, "/pdf"), {
                            responseType: 'blob'
                        })];
                case 1:
                    response = _a.sent();
                    url = window.URL.createObjectURL(new Blob([response.data]));
                    link = document.createElement('a');
                    link.href = url;
                    link.download = "fisa-tehnica-".concat(sheetId, ".pdf");
                    link.click();
                    return [3 /*break*/, 3];
                case 2:
                    error_8 = _a.sent();
                    setFeedback({ type: 'error', message: 'Eroare la descărcare PDF' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var getStatusBadge = function (status) {
        var variants = {
            'draft': 'secondary',
            'approved': 'success',
            'locked': 'primary',
            'archived': 'dark'
        };
        return <react_bootstrap_1.Badge bg={variants[status] || 'secondary'}>{status.toUpperCase()}</react_bootstrap_1.Badge>;
    };
    return (<div className="technical-sheets-page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <PageHeader_1.PageHeader title="fise tehnice de produs" subtitle="Conform Ordin ANSVSA 201/2022 + UE 1169/2011"/>
        <HelpButton_1.HelpButton title="ajutor fise tehnice de produs" content={<div>
              <h5>📄 Ce este o Fișă Tehnică de Produs?</h5>
              <p>
                Fișa Tehnică de Produs (FTP) este un document obligatoriu conform Ordinului ANSVSA 201/2022 
                și Regulamentului UE 1169/2011, care conține informații complete despre compoziția, 
                alergenii, valoarea nutritivă și procesul de preparare al unui produs.
              </p>
              <h5 className="mt-4">📝 Cum să generezi o Fișă Tehnică de Produs?</h5>
              <ol>
                <li><strong>"asigura te ca produsul are reteta"</strong> - Produsul trebuie să aibă o rețetă 
                  completă cu toate ingredientele definite în pagina "Rețete & Fișe Tehnice"</li>
                <li><strong>Click pe "Generează Fișă Nouă"</strong> - Butonul se află în partea dreaptă sus</li>
                <li><strong>"selecteaza produsul"</strong> - Alege produsul pentru care vrei să generezi fișa tehnică
                  <ul>
                    <li>"doar produsele cu retete definite vor aparea in li"</li>
                    <li>"daca produsul nu apare verifica ca are reteta comp"</li>
                  </ul>
                </li>
                <li><strong>Selectează rețeta</strong> - Dacă produsul are mai multe rețete, alege rețeta dorită</li>
                <li><strong>"completeaza informatiile"</strong>:
                  <ul>
                    <li><strong>Nume produs (RO)</strong> - Numele produsului în română</li>
                    <li><strong>Nume produs (EN)</strong> - Numele produsului în engleză (opțional)</li>
                    <li><strong>Categorie</strong> - Categoria produsului</li>
                    <li><strong>Mărime porție (g)</strong> - Greutatea porției în grame</li>
                    <li><strong>"cost per portie"</strong> - Costul calculat automat pe baza rețetei</li>
                  </ul>
                </li>
                <li><strong>"verifica alergenii"</strong> - Sistemul va calcula automat alergenii pe baza 
                  ingredientelor din rețetă. Verifică și completează dacă este necesar</li>
                <li><strong>"salveaza fisa"</strong> - Click pe "Salvează" pentru a genera fișa tehnică</li>
              </ol>
              <h5 className="mt-4">✅ Statusuri disponibile:</h5>
              <ul>
                <li><strong>Draft</strong> - Fișa este în lucru, poate fi editată</li>
                <li><strong>Approved</strong> - Fișa este aprobată de bucătar/manager</li>
                <li><strong>Locked</strong> - Fișa este blocată, nu poate fi editată</li>
                <li><strong>Archived</strong> - Fișa este arhivată</li>
              </ul>
              <h5 className="mt-4">🔍 Informații incluse în Fișa Tehnică:</h5>
              <ul>
                <li><strong>"Compoziție"</strong> - Lista completă de ingrediente cu cantități</li>
                <li><strong>Alergeni</strong> - Alergenii majori identificați (14 alergeni UE)</li>
                <li><strong>"valoare nutritiva"</strong> - Calorii, proteine, grăsimi, carbohidrați</li>
                <li><strong>"proces de preparare"</strong> - Instrucțiuni de preparare</li>
                <li><strong>"conditii de pastrare"</strong> - Temperatură și durata de valabilitate</li>
                <li><strong>Costuri</strong> - Cost per porție și cost per 100g</li>
              </ul>
              <h5 className="mt-4">⚠️ Conformitate legală:</h5>
              <p>"fisele tehnice trebuie sa respecte"</p>
              <ul>
                <li><strong>Ordinul ANSVSA 201/2022</strong> - Reglementări naționale privind etichetarea alimentelor</li>
                <li><strong>Regulamentul UE 1169/2011</strong> - Reglementări europene privind informarea consumatorilor</li>
                <li><strong>14 alergeni majori</strong> - Trebuie declarați obligatoriu</li>
              </ul>
              <div className="alert alert-warning mt-4">
                <strong>⚠️ Important:</strong> Fișele tehnice sunt documente legale obligatorii. 
                Asigură-te că toate informațiile sunt corecte și actualizate. Consultă întotdeauna 
                un specialist în siguranța alimentară pentru validare.
              </div>
              <div className="alert alert-info mt-4">
                <strong>💡 Sfat:</strong> După generarea fișei tehnice, poți o exporta în PDF pentru 
                afișare în bucătărie sau pentru inspecții sanitare.
              </div>
            </div>}/>
      </div>

      {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'success' ? 'success' : 'danger'} dismissible onClose={function () { return setFeedback(null); }}>
          {feedback.message}
        </react_bootstrap_1.Alert>)}

      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>"lista fise tehnice"</h5>
            <react_bootstrap_1.Button variant="primary" onClick={function () { return setShowModal(true); }}>
              <i className="fas fa-plus me-2"></i>"genereaza fisa noua"</react_bootstrap_1.Button>
          </div>

          {loading ? (<div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>) : sheets.length === 0 ? (<react_bootstrap_1.Alert variant="info">"nu exista fise tehnice genereaza prima fisa din re"</react_bootstrap_1.Alert>) : (<react_bootstrap_1.Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produs</th>
                  <th>Categorie</th>
                  <th>Alergeni</th>
                  <th>Gramaj</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th>"Acțiuni"</th>
                </tr>
              </thead>
              <tbody>
                {sheets.map(function (sheet) {
                var _a;
                var allergens = JSON.parse(sheet.allergens || '[]');
                return (<tr key={sheet.id}>
                      <td>{sheet.id}</td>
                      <td>
                        <strong>{sheet.name_ro}</strong>
                        {sheet.name_en && <div className="text-muted small">{sheet.name_en}</div>}
                      </td>
                      <td>{sheet.category}</td>
                      <td>
                        {allergens.length > 0 ? (<div className="allergen-badges">
                            {allergens.map(function (a) { return (<react_bootstrap_1.Badge key={a} bg="danger" className="me-1">{a}</react_bootstrap_1.Badge>); })}
                          </div>) : (<react_bootstrap_1.Badge bg="success">"fara alergeni"</react_bootstrap_1.Badge>)}
                      </td>
                      <td>{sheet.portion_size_grams}g</td>
                      <td>{(_a = sheet.cost_per_portion) === null || _a === void 0 ? void 0 : _a.toFixed(2)} RON</td>
                      <td>{getStatusBadge(sheet.status)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {sheet.status === 'draft' && (<>
                              <react_bootstrap_1.Button variant="success" size="sm" onClick={function () { return approveByChef(sheet.id); }}>
                                👨‍🍳 Chef
                              </react_bootstrap_1.Button>
                              <react_bootstrap_1.Button variant="primary" size="sm" onClick={function () { return approveByManager(sheet.id); }}>
                                👔 Manager
                              </react_bootstrap_1.Button>
                            </>)}
                          
                          {sheet.status === 'approved' && (<react_bootstrap_1.Button variant="warning" size="sm" onClick={function () { return lockSheet(sheet.id); }}>
                              🔒 Lock
                            </react_bootstrap_1.Button>)}
                          
                          <react_bootstrap_1.Button variant="info" size="sm" onClick={function () { return downloadPDF(sheet.id); }}>
                            📄 PDF
                          </react_bootstrap_1.Button>
                        </div>
                      </td>
                    </tr>);
            })}
              </tbody>
            </react_bootstrap_1.Table>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Modal pentru generare fișă nouă */}
      <react_bootstrap_1.Modal show={showModal} onHide={function () {
            setShowModal(false);
            setSelectedProductId(null);
            setSelectedRecipeId(null);
            setRecipes([]);
        }} size="lg" onShow={loadProductsWithRecipes}>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>"genereaza fisa tehnica"</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Alert variant="info">
            Selectează un produs cu rețetă pentru a genera automat fișa tehnică.
            Sistemul va calcula automat: alergeni, aditivi, valori nutriționale, cost FIFO.
          </react_bootstrap_1.Alert>
          
          <react_bootstrap_1.Form>
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>
                Produs {loadingProducts && <span className="spinner-border spinner-border-sm ms-2"/>}
              </react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={selectedProductId || ''} onChange={function (e) {
            var productId = parseInt(e.target.value);
            setSelectedProductId(productId || null);
            setSelectedRecipeId(null);
            if (productId) {
                loadRecipesForProduct(productId);
            }
            else {
                setRecipes([]);
            }
        }} disabled={loadingProducts}>
                <option value="">"selecteaza produs"</option>
                {products.map(function (product) { return (<option key={product.id} value={product.id}>
                    {product.name} {product.name_en ? "(".concat(product.name_en, ")") : ''} - {product.category}
                  </option>); })}
              </react_bootstrap_1.Form.Select>
              {products.length === 0 && !loadingProducts && (<react_bootstrap_1.Form.Text className="text-muted">"nu exista produse cu retete definite"</react_bootstrap_1.Form.Text>)}
            </react_bootstrap_1.Form.Group>
            
            <react_bootstrap_1.Form.Group className="mb-3">
              <react_bootstrap_1.Form.Label>
                Rețetă {loadingRecipes && <span className="spinner-border spinner-border-sm ms-2"/>}
              </react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={selectedRecipeId || ''} onChange={function (e) { return setSelectedRecipeId(parseInt(e.target.value) || null); }} disabled={!selectedProductId || loadingRecipes || recipes.length === 0}>
                <option value="">"selecteaza reteta"</option>
                {recipes.map(function (recipe) { return (<option key={recipe.id} value={recipe.id}>
                    Rețetă #{recipe.id} {recipe.name ? "- ".concat(recipe.name) : ''}
                  </option>); })}
              </react_bootstrap_1.Form.Select>
              {selectedProductId && !loadingRecipes && recipes.length === 0 && (<react_bootstrap_1.Form.Text className="text-warning">"acest produs nu are retete definite"</react_bootstrap_1.Form.Text>)}
              {selectedProductId && loadingRecipes && (<react_bootstrap_1.Form.Text className="text-muted">"se incarca retetele"</react_bootstrap_1.Form.Text>)}
            </react_bootstrap_1.Form.Group>
          </react_bootstrap_1.Form>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () {
            setShowModal(false);
            setSelectedProductId(null);
            setSelectedRecipeId(null);
            setRecipes([]);
        }} disabled={generating}>"Anulează"</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="primary" onClick={function () {
            if (selectedProductId && selectedRecipeId) {
                generateFromRecipe(selectedProductId, selectedRecipeId);
            }
            else {
                setFeedback({ type: 'error', message: 'Selectează un produs și o rețetă' });
            }
        }} disabled={!selectedProductId || !selectedRecipeId || generating}>
            {generating ? (<>
                <span className="spinner-border spinner-border-sm me-2"/>"se genereaza"</>) : ('Generează Fișă Tehnică')}
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.TechnicalSheetsPage = TechnicalSheetsPage;
