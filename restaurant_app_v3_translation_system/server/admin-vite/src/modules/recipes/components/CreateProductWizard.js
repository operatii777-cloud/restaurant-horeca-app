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
exports.CreateProductWizard = CreateProductWizard;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var Modal_1 = require("@/shared/components/Modal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var httpClient_1 = require("@/shared/api/httpClient");
var RecipeEditorModal_1 = require("./RecipeEditorModal");
require("./CreateProductWizard.css");
function CreateProductWizard(_a) {
    var _this = this;
    var open = _a.open, onClose = _a.onClose, onComplete = _a.onComplete;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)('product'), currentStep = _b[0], setCurrentStep = _b[1];
    var _c = (0, react_1.useState)({
        name: '',
        category: '',
        price: 0,
        vat_rate: 9,
        unit: 'buc',
        stock_management: 'fifo',
        has_recipe: true,
    }), productData = _c[0], setProductData = _c[1];
    var _d = (0, react_1.useState)(null), createdProductId = _d[0], setCreatedProductId = _d[1];
    var _e = (0, react_1.useState)(false), recipeEditorOpen = _e[0], setRecipeEditorOpen = _e[1];
    var _f = (0, react_1.useState)(false), technicalSheetGenerated = _f[0], setTechnicalSheetGenerated = _f[1];
    var _g = (0, react_1.useState)(null), feedback = _g[0], setFeedback = _g[1];
    var categoriesData = (0, useApiQuery_1.useApiQuery)(open ? '/api/catalog/categories' : null).data;
    var _h = (0, useApiMutation_1.useApiMutation)(), createProduct = _h.mutate, creatingProduct = _h.loading;
    var _j = (0, useApiMutation_1.useApiMutation)(), generateTechnicalSheet = _j.mutate, generatingSheet = _j.loading;
    var selectedProduct = createdProductId
        ? {
            product_id: createdProductId,
            product_name: productData.name,
            product_category: productData.category,
            recipe_count: 0,
            servings: 1,
        }
        : null;
    var handleProductDataChange = (0, react_1.useCallback)(function (field, value) {
        setProductData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    }, []);
    var handleCreateProduct = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var payload, result, productId, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!productData.name || !productData.category || !productData.price) {
                        setFeedback({ type: 'error', message: 'Completează toate câmpurile obligatorii (nume, categorie, preț).' });
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    payload = {
                        name: productData.name,
                        name_en: productData.name_en || null,
                        category: productData.category,
                        price: productData.price,
                        vat_rate: productData.vat_rate,
                        unit: productData.unit,
                        description: productData.description || null,
                        description_en: productData.description_en || null,
                        preparation_section: productData.preparation_section || null,
                        stock_management: productData.stock_management,
                        is_sellable: 1,
                        has_recipe: productData.has_recipe ? 1 : 0,
                        is_active: 1,
                    };
                    return [4 /*yield*/, createProduct({
                            url: '/api/catalog/products',
                            method: 'post',
                            data: payload,
                        })];
                case 2:
                    result = _b.sent();
                    if (result !== null && ((_a = result.data) === null || _a === void 0 ? void 0 : _a.id)) {
                        productId = result.data.id;
                        setCreatedProductId(productId);
                        setFeedback({ type: 'success', message: 'Produsul a fost creat cu succes!' });
                        setCurrentStep('recipe');
                    }
                    else {
                        setFeedback({ type: 'error', message: 'Eroare la crearea produsului.' });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    setFeedback({ type: 'error', message: error_1.message || 'Eroare la crearea produsului.' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [productData, createProduct]);
    var handleRecipeSaved = (0, react_1.useCallback)(function (message) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setFeedback({ type: 'success', message: message });
            setRecipeEditorOpen(false);
            setCurrentStep('technical-sheet');
            return [2 /*return*/];
        });
    }); }, []);
    var handleGenerateTechnicalSheet = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var recipeResponse, recipes, recipeId, result, error_2;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!createdProductId) {
                        setFeedback({ type: 'error', message: 'Produsul nu a fost creat.' });
                        return [2 /*return*/];
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/recipes/product/".concat(createdProductId))];
                case 2:
                    recipeResponse = _d.sent();
                    recipes = ((_a = recipeResponse.data) === null || _a === void 0 ? void 0 : _a.data) || recipeResponse.data || [];
                    if (!Array.isArray(recipes) || recipes.length === 0) {
                        setFeedback({ type: 'error', message: 'Produsul nu are rețetă definită. Adaugă rețeta mai întâi.' });
                        return [2 /*return*/];
                    }
                    recipeId = ((_b = recipes[0]) === null || _b === void 0 ? void 0 : _b.id) || ((_c = recipes[0]) === null || _c === void 0 ? void 0 : _c.recipe_id);
                    if (!recipeId) {
                        setFeedback({ type: 'error', message: 'Nu s-a putut identifica rețeta.' });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, generateTechnicalSheet({
                            url: '/api/technical-sheets/generate',
                            method: 'post',
                            data: {
                                product_id: createdProductId,
                                recipe_id: recipeId,
                            },
                        })];
                case 3:
                    result = _d.sent();
                    if (result !== null) {
                        setTechnicalSheetGenerated(true);
                        setFeedback({ type: 'success', message: 'Fișa tehnică a fost generată cu succes!' });
                    }
                    else {
                        setFeedback({ type: 'error', message: 'Eroare la generarea fișei tehnice.' });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _d.sent();
                    setFeedback({ type: 'error', message: error_2.message || 'Eroare la generarea fișei tehnice.' });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [createdProductId, generateTechnicalSheet]);
    var handleComplete = (0, react_1.useCallback)(function () {
        if (createdProductId) {
            onComplete(createdProductId);
        }
        handleClose();
    }, [createdProductId, onComplete]);
    var handleClose = (0, react_1.useCallback)(function () {
        setCurrentStep('product');
        setProductData({
            name: '',
            category: '',
            price: 0,
            vat_rate: 9,
            unit: 'buc',
            stock_management: 'fifo',
            has_recipe: true,
        });
        setCreatedProductId(null);
        setRecipeEditorOpen(false);
        setTechnicalSheetGenerated(false);
        setFeedback(null);
        onClose();
    }, [onClose]);
    var categoryOptions = categoriesData || [];
    var stepTitles = {
        product: 'Pasul 1: Detalii Produs',
        recipe: 'Pasul 2: Rețetă',
        'technical-sheet': 'Pasul 3: Fișă Tehnică',
    };
    return (<>
      <Modal_1.Modal isOpen={open} title='wizard produs nou + reteta' size="xl" onClose={handleClose}>
        {feedback && (<InlineAlert_1.InlineAlert variant={feedback.type} title={feedback.type === 'success' ? 'Succes' : 'Eroare'} message={feedback.message}/>)}

        <div className="create-product-wizard">
          {/* Progress Steps */}
          <div className="wizard-progress">
            <div className={"wizard-step ".concat(currentStep === 'product' ? 'active' : currentStep !== 'product' ? 'completed' : '')}>
              <div className="wizard-step-number">1</div>
              <div className="wizard-step-label">Produs</div>
            </div>
            <div className="wizard-step-connector"/>
            <div className={"wizard-step ".concat(currentStep === 'recipe' ? 'active' : currentStep === 'technical-sheet' ? 'completed' : '')}>
              <div className="wizard-step-number">2</div>
              <div className="wizard-step-label">"Rețetă"</div>
            </div>
            <div className="wizard-step-connector"/>
            <div className={"wizard-step ".concat(currentStep === 'technical-sheet' ? 'active' : '')}>
              <div className="wizard-step-number">3</div>
              <div className="wizard-step-label">"fisa tehnica"</div>
            </div>
          </div>

          {/* Step Content */}
          <div className="wizard-content">
            {currentStep === 'product' && (<div className="wizard-step-content">
                <h3>{stepTitles.product}</h3>
                <div className="wizard-form">
                  <div className="form-group">
                    <label htmlFor="product-name">Nume Produs *</label>
                    <input id="product-name" type="text" value={productData.name} onChange={function (e) { return handleProductDataChange('name', e.target.value); }} placeholder="Ex: Pizza Margherita" required/>
                  </div>
                  <div className="form-group">
                    <label htmlFor="product-name-en">Nume (EN)</label>
                    <input id="product-name-en" type="text" value={productData.name_en || ''} onChange={function (e) { return handleProductDataChange('name_en', e.target.value); }} placeholder="Ex: Margherita Pizza"/>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="product-category">Categorie *</label>
                      <select id="product-category" value={productData.category} onChange={function (e) { return handleProductDataChange('category', e.target.value); }} required>
                        <option value="">"selecteaza categorie"</option>
                        {categoryOptions.map(function (cat) { return (<option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>); })}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="product-unit">Unitate *</label>
                      <select id="product-unit" value={productData.unit} onChange={function (e) { return handleProductDataChange('unit', e.target.value); }} required>
                        <option value="buc">buc</option>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="l">l</option>
                        <option value="ml">ml</option>
                        <option value="portie">portie</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="product-price">Preț (RON) *</label>
                      <input id="product-price" type="number" step="0.01" min="0" value={productData.price} onChange={function (e) { return handleProductDataChange('price', parseFloat(e.target.value) || 0); }} required/>
                    </div>
                    <div className="form-group">
                      <label htmlFor="product-vat">TVA (%) *</label>
                      <input id="product-vat" type="number" step="1" min="0" max="100" value={productData.vat_rate} onChange={function (e) { return handleProductDataChange('vat_rate', parseInt(e.target.value) || 9); }} required/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="product-description">Descriere</label>
                    <textarea id="product-description" value={productData.description || ''} onChange={function (e) { return handleProductDataChange("Description", e.target.value); }} rows={3} placeholder="Descriere produs (opțional)"/>
                  </div>
                  <div className="form-group">
                    <label>
                      <input type="checkbox" checked={productData.has_recipe} onChange={function (e) { return handleProductDataChange('has_recipe', e.target.checked); }}/>"produsul are reteta asociata"</label>
                  </div>
                </div>
                <div className="wizard-actions">
                  <button type="button" className="btn btn-ghost" onClick={handleClose}>"Anulează"</button>
                  <button type="button" className="btn btn-primary" onClick={handleCreateProduct} disabled={creatingProduct}>
                    {creatingProduct ? 'Se creează...' : 'Creează Produs →'}
                  </button>
                </div>
              </div>)}

            {currentStep === 'recipe' && createdProductId && (<div className="wizard-step-content">
                <h3>{stepTitles.recipe}</h3>
                <p>Produsul "{productData.name}" a fost creat. Acum adaugă rețeta cu ingredientele necesare.</p>
                <div className="wizard-actions">
                  <button type="button" className="btn btn-ghost" onClick={function () { return setCurrentStep('product'); }}>
                    ← Înapoi
                  </button>
                  <button type="button" className="btn btn-primary" onClick={function () { return setRecipeEditorOpen(true); }}>
                    Adaugă Rețetă →
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={function () { return setCurrentStep('technical-sheet'); }}>
                    Sari peste rețetă →
                  </button>
                </div>
              </div>)}

            {currentStep === 'technical-sheet' && createdProductId && (<div className="wizard-step-content">
                <h3>{stepTitles['technical-sheet']}</h3>
                {technicalSheetGenerated ? (<>
                    <InlineAlert_1.InlineAlert variant="success" title="Succes" message="msg fisa tehnica a fost generata cu succes"/>
                    <p>Produsul "{productData.name}" este complet configurat cu rețetă și fișă tehnică.</p>
                  </>) : (<>
                    <p>Generează fișa tehnică de produs conform Ordin ANSVSA 201/2022.</p>
                    <p className="text-muted">"fisa tehnica va include alergeni aditivi valori nu"</p>
                  </>)}
                <div className="wizard-actions">
                  <button type="button" className="btn btn-ghost" onClick={function () { return setCurrentStep('recipe'); }}>
                    ← Înapoi
                  </button>
                  {!technicalSheetGenerated ? (<button type="button" className="btn btn-primary" onClick={handleGenerateTechnicalSheet} disabled={generatingSheet}>
                      {generatingSheet ? 'Se generează...' : 'Generează Fișă Tehnică'}
                    </button>) : (<button type="button" className="btn btn-success" onClick={handleComplete}>
                      Finalizează ✓
                    </button>)}
                </div>
              </div>)}
          </div>
        </div>
      </Modal_1.Modal>

      {/* Recipe Editor Modal */}
      {selectedProduct && (<RecipeEditorModal_1.RecipeEditorModal open={recipeEditorOpen} product={selectedProduct} onClose={function () { return setRecipeEditorOpen(false); }} onSaved={handleRecipeSaved}/>)}
    </>);
}
