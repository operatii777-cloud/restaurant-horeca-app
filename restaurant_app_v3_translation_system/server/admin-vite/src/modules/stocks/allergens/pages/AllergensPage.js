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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllergensPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var PageHeader_1 = require("@/shared/components/PageHeader");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var allergensApi_1 = require("../api/allergensApi");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./AllergensPage.css");
// Lista standard de alergeni (UE 14 alergeni majori)
var COMMON_ALLERGENS = [
    'lapte', 'ouă', 'gluten', 'pește', 'crustacee', 'moluște',
    'nuci', 'arahide', 'soia', 'țelină', 'muștar', 'susan',
    'lupină', 'dioxid de sulf', 'sulfiti'
];
var AllergensPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), products = _a[0], setProducts = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(null), selectedProduct = _d[0], setSelectedProduct = _d[1];
    var _e = (0, react_1.useState)(false), isModalOpen = _e[0], setIsModalOpen = _e[1];
    var _f = (0, react_1.useState)(false), isRecalculating = _f[0], setIsRecalculating = _f[1];
    var _g = (0, react_1.useState)([]), selectedAllergens = _g[0], setSelectedAllergens = _g[1];
    var _h = (0, react_1.useState)(''), filterText = _h[0], setFilterText = _h[1];
    var _j = (0, react_1.useState)('id'), sortField = _j[0], setSortField = _j[1];
    var _k = (0, react_1.useState)('asc'), sortDirection = _k[0], setSortDirection = _k[1];
    var _l = (0, react_1.useState)(null), feedback = _l[0], setFeedback = _l[1];
    var fetchProducts = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, allergensApi_1.allergensApi.fetchProducts()];
                case 2:
                    data = _a.sent();
                    setProducts(data);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('❌ Eroare la încărcarea produselor:', err_1);
                    setError(err_1.message || 'Eroare la încărcarea datelor');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        void fetchProducts();
    }, [fetchProducts]);
    // Calculează statistici
    var stats = {
        total: products.length,
        withDifferences: products.filter(function (p) { return p.has_difference; }).length,
        withoutAllergens: products.filter(function (p) { return !p.current_allergens || p.current_allergens.trim() === ''; }).length,
        complete: products.filter(function (p) { return p.current_allergens && !p.has_difference; }).length
    };
    // Sortare și filtrare
    var filteredAndSortedProducts = products
        .filter(function (p) {
        var _a, _b, _c, _d;
        if (!filterText)
            return true;
        var searchLower = filterText.toLowerCase();
        return (((_a = p.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchLower)) ||
            ((_b = p.category) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchLower)) ||
            ((_c = p.current_allergens) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(searchLower)) ||
            ((_d = p.calculated_allergens) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(searchLower)));
    })
        .sort(function (a, b) {
        var aVal = a[sortField] || '';
        var bVal = b[sortField] || '';
        if (sortDirection === 'asc') {
            return aVal > bVal ? 1 : -1;
        }
        else {
            return aVal < bVal ? 1 : -1;
        }
    });
    var handleEdit = function (product) {
        setSelectedProduct(product);
        var current = product.current_allergens || '';
        var allergensList = current.split(',').map(function (a) { return a.trim(); }).filter(function (a) { return a; });
        setSelectedAllergens(allergensList);
        setIsModalOpen(true);
    };
    var handleRecalculate = function (productId) { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Recalculezi alergenii pentru acest produs?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, allergensApi_1.allergensApi.recalculateProduct(productId)];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: '✅ Alergeni recalculați cu succes!' });
                    return [4 /*yield*/, fetchProducts()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _a.sent();
                    console.error('❌ Eroare la recalculare:', err_2);
                    setFeedback({ type: 'error', message: '❌ Eroare la recalculare: ' + (err_2.message || 'Eroare necunoscută') });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleRecalculateAll = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm("Recalculezi alergenii pentru TOATE cele ".concat(stats.total, " produse? Poate dura c\u00E2teva secunde...")))
                        return [2 /*return*/];
                    setIsRecalculating(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, allergensApi_1.allergensApi.recalculateAll()];
                case 2:
                    response = _a.sent();
                    setFeedback({
                        type: 'success',
                        message: "\u2705 ".concat(response.message, "\nActualizate: ").concat(response.success_count, "/").concat(response.total_products)
                    });
                    return [4 /*yield*/, fetchProducts()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    err_3 = _a.sent();
                    console.error('❌ Eroare la recalculare totală:', err_3);
                    setFeedback({ type: 'error', message: '❌ Eroare: ' + (err_3.message || 'Eroare necunoscută') });
                    return [3 /*break*/, 6];
                case 5:
                    setIsRecalculating(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveAllergens = function () { return __awaiter(void 0, void 0, void 0, function () {
        var allergensText, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedProduct)
                        return [2 /*return*/];
                    allergensText = selectedAllergens.join(', ');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, allergensApi_1.allergensApi.updateProductAllergens(selectedProduct.id, allergensText, allergensText)];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: '✅ Alergeni salvați cu succes!' });
                    setIsModalOpen(false);
                    return [4 /*yield*/, fetchProducts()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_4 = _a.sent();
                    console.error('❌ Eroare la salvare:', err_4);
                    setFeedback({ type: 'error', message: '❌ Eroare la salvare: ' + (err_4.message || 'Eroare necunoscută') });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var toggleAllergen = function (allergen) {
        setSelectedAllergens(function (prev) {
            if (prev.includes(allergen)) {
                return prev.filter(function (a) { return a !== allergen; });
            }
            else {
                return __spreadArray(__spreadArray([], prev, true), [allergen], false);
            }
        });
    };
    var handleExportCSV = function () {
        var headers = ['ID', 'Produs', 'Categorie', 'Ingrediente', 'Alergeni Declarați', 'Alergeni Calculați', 'Diferență'];
        var rows = filteredAndSortedProducts.map(function (p) { return [
            p.id,
            p.name,
            p.category,
            p.ingredient_count,
            p.current_allergens || '',
            p.calculated_allergens || '',
            p.has_difference ? 'DA' : 'NU'
        ]; });
        var csvContent = __spreadArray([
            headers.join(',')
        ], rows.map(function (row) { return row.map(function (cell) { return "\"\"Cell\"\""; }).join(','); }), true).join('\n');
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "alergeni_produse_".concat(new Date().toISOString().split('T')[0], ".csv");
        link.click();
    };
    var handleSort = function (field) {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortField(field);
            setSortDirection('asc');
        }
    };
    return (<div className="allergens-page">
      <PageHeader_1.PageHeader title="🏷️ Gestionare Alergeni" description="Calculare automată din ingrediente și gestionare alergeni produse" actions={[
            {
                label: isRecalculating ? '⏳ Se recalculează...' : '🔄 Recalculează Tot',
                variant: 'secondary',
                onClick: handleRecalculateAll,
            },
            {
                label: '📥 Export CSV',
                variant: 'secondary',
                onClick: handleExportCSV,
            },
            {
                label: '🔄 Reîncarcă',
                variant: 'secondary',
                onClick: fetchProducts,
            },
        ]}/>

      {feedback && (<InlineAlert_1.InlineAlert type={feedback.type} message={feedback.message} onClose={function () { return setFeedback(null); }}/>)}
      {error && <InlineAlert_1.InlineAlert type="error" message={error} onClose={function () { return setError(null); }}/>}

      {/* Stats Cards */}
      <div className="row mt-4">
        <div className="col-md-3">
          <react_bootstrap_1.Card className="text-center shadow-sm">
            <react_bootstrap_1.Card.Body>
              <h3 className="mb-0">{stats.total}</h3>
              <p className="text-muted mb-0">Total Produse</p>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
        <div className="col-md-3">
          <react_bootstrap_1.Card className="text-center shadow-sm border-danger">
            <react_bootstrap_1.Card.Body>
              <h3 className="mb-0 text-danger">{stats.withDifferences}</h3>
              <p className="text-muted mb-0">"cu diferente"</p>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
        <div className="col-md-3">
          <react_bootstrap_1.Card className="text-center shadow-sm border-warning">
            <react_bootstrap_1.Card.Body>
              <h3 className="mb-0 text-warning">{stats.withoutAllergens}</h3>
              <p className="text-muted mb-0">Fără Alergeni</p>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
        <div className="col-md-3">
          <react_bootstrap_1.Card className="text-center shadow-sm border-success">
            <react_bootstrap_1.Card.Body>
              <h3 className="mb-0 text-success">{stats.complete}</h3>
              <p className="text-muted mb-0">Complete</p>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
      </div>

      {/* Filter */}
      <div className="mt-4">
        <react_bootstrap_1.Form.Control type="text" placeholder='[🔍_cauta_produs_categorie_sau_alergeni]' value={filterText} onChange={function (e) { return setFilterText(e.target.value); }}/>
      </div>

      {/* Table */}
      {loading ? (<div className="text-center mt-4">
          <react_bootstrap_1.Spinner animation="border" size="sm" className="me-2"/>"se incarca produsele"</div>) : (<react_bootstrap_1.Card className="mt-4 shadow-sm">
          <react_bootstrap_1.Card.Body className="p-0">
            <react_bootstrap_1.Table striped bordered hover responsive className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th onClick={function () { return handleSor[id]; }} style={{ cursor: 'pointer' }}>
                    ID {sortField === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={function () { return handleSor[name]; }} style={{ cursor: 'pointer' }}>
                    🍽️ Produs {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={function () { return handleSor[category]; }} style={{ cursor: 'pointer' }}>
                    📁 Categorie {sortField === 'category' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>📦 Ingrediente</th>
                  <th>🏷️ Alergeni Declarați</th>
                  <th>🧮 Alergeni Calculați</th>
                  <th>⚠️ Diferență</th>
                  <th>⚙️ Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedProducts.map(function (product) { return (<tr key={product.id}>
                    <td>{product.id}</td>
                    <td style={{ fontWeight: 'bold' }}>{product.name}</td>
                    <td>{product.category}</td>
                    <td className="text-center">{product.ingredient_count}</td>
                    <td style={{
                    backgroundColor: (!product.current_allergens || product.current_allergens.trim() === '') ? '#ffebee' : 'transparent',
                    color: (!product.current_allergens || product.current_allergens.trim() === '') ? '#c62828' : 'inherit'
                }}>
                      {product.current_allergens || 'niciunul'}
                    </td>
                    <td style={{ backgroundColor: '#e8f5e9' }}>
                      {product.calculated_allergens || 'niciunul'}
                    </td>
                    <td className="text-center">
                      {product.has_difference ?
                    <react_bootstrap_1.Badge bg="warning">⚠️ DA</react_bootstrap_1.Badge> :
                    <react_bootstrap_1.Badge bg="success">✓ OK</react_bootstrap_1.Badge>}
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <react_bootstrap_1.Button variant="primary" size="sm" onClick={function () { return handleEdit(product); }} title="Editează">
                          <i className="fas fa-edit"></i>
                        </react_bootstrap_1.Button>
                        <react_bootstrap_1.Button variant="warning" size="sm" onClick={function () { return handleRecalculate(product.id); }} title="Recalculează">
                          <i className="fas fa-sync-alt"></i>
                        </react_bootstrap_1.Button>
                      </div>
                    </td>
                  </tr>); })}
              </tbody>
            </react_bootstrap_1.Table>
          </react_bootstrap_1.Card.Body>
        </react_bootstrap_1.Card>)}

      <div className="mt-3 text-center text-muted">
        Afișare: {filteredAndSortedProducts.length} / {products.length} produse
      </div>

      {/* Modal Editare */}
      <react_bootstrap_1.Modal show={isModalOpen} onHide={function () { return setIsModalOpen(false); }} size="lg" centered>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>✏️ Editează Alergeni: {selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.name}</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          {selectedProduct && (<>
              <react_bootstrap_1.Alert variant="info">
                <p className="mb-1"><strong>📦 Ingrediente în rețetă:</strong> {selectedProduct.ingredient_count}</p>
                <p className="mb-1"><strong>🧮 Alergeni calculați automat:</strong> {selectedProduct.calculated_allergens || 'niciunul'}</p>
                <p className="mb-0"><strong>🏷️ Alergeni declarați curent:</strong> {selectedProduct.current_allergens || 'niciunul'}</p>
              </react_bootstrap_1.Alert>

              <h5 className="mt-3">"selecteaza alergenii"</h5>
              <div className="allergen-checkboxes">
                {COMMON_ALLERGENS.map(function (allergen) { return (<react_bootstrap_1.Form.Check key={allergen} type="checkbox" id={"allergen-\"Allergen\""} label={allergen} checked={selectedAllergens.includes(allergen)} onChange={function () { return toggleAllergen(allergen); }} className="allergen-checkbox"/>); })}
              </div>

              <react_bootstrap_1.Form.Group className="mt-3">
                <react_bootstrap_1.Form.Label>"alergeni selectati"</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="text" value={selectedAllergens.join(', ')} readOnly style={{ backgroundColor: '#f5f5f5' }}/>
              </react_bootstrap_1.Form.Group>
            </>)}
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setIsModalOpen(false); }}>"Anulează"</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="success" onClick={handleSaveAllergens}>
            💾 Salvează Alergeni
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
};
exports.AllergensPage = AllergensPage;
