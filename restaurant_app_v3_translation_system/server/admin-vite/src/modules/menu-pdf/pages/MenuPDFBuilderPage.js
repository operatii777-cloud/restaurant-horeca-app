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
exports.MenuPDFBuilderPage = void 0;
// ...existing code...
var react_1 = require("react");
var PageHeader_1 = require("@/shared/components/PageHeader");
var StatCard_1 = require("@/shared/components/StatCard");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var usePdfConfig_1 = require("../hooks/usePdfConfig");
var PdfCategoryCard_1 = require("../components/PdfCategoryCard");
require("./MenuPDFBuilderPage.css");
var MenuPDFBuilderPage = function () {
    // ...existing code...
    var _a = (0, react_1.useState)('food'), activeType = _a[0], setActiveType = _a[1];
    var _b = (0, react_1.useState)(null), feedback = _b[0], setFeedback = _b[1];
    var _c = (0, react_1.useState)(false), regenerating = _c[0], setRegenerating = _c[1];
    var _d = (0, usePdfConfig_1.usePdfConfig)(activeType), config = _d.config, loading = _d.loading, error = _d.error, refetch = _d.refetch, updateCategories = _d.updateCategories, updateProducts = _d.updateProducts, uploadImage = _d.uploadImage, deleteImage = _d.deleteImage, regenerate = _d.regenerate;
    var stats = (0, react_1.useMemo)(function () {
        if (!config) {
            return [
                { label: 'Categorii configurate', value: '0', helper: 'Se încarcă...', icon: '🖨️' },
                { label: 'Produse active', value: '0', helper: 'Se încarcă...', icon: '📄' },
                { label: 'Ultima regenerare', value: '—', helper: 'N/A', icon: '⏱️' },
            ];
        }
        var totalCategories = config.categories.length;
        var visibleCategories = config.categories.filter(function (c) { return c.display_in_pdf; }).length;
        var totalProducts = config.categories.reduce(function (sum, c) { return sum + c.products.length; }, 0);
        var visibleProducts = config.categories.reduce(function (sum, c) { return sum + c.products.filter(function (p) { return p.display_in_pdf; }).length; }, 0);
        return [
            {
                label: 'Categorii configurate',
                value: "".concat(visibleCategories, "/").concat(totalCategories),
                helper: "".concat(totalCategories, " total"),
                icon: '🖨️',
            },
            {
                label: 'Produse active',
                value: "".concat(visibleProducts, "/").concat(totalProducts),
                helper: "".concat(totalProducts, " total"),
                icon: '📄',
            },
            {
                label: 'Ultima regenerare',
                value: config.lastRegenerated ? new Date(config.lastRegenerated).toLocaleDateString('ro-RO') : '—',
                helper: config.lastRegenerated ? 'PDF actualizat' : 'Nu s-a generat',
                icon: '⏱️',
            },
        ];
    }, [config]);
    var handleToggleCategoryVisibility = (0, react_1.useCallback)(function (categoryId, visible) { return __awaiter(void 0, void 0, void 0, function () {
        var category, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!config)
                        return [2 /*return*/];
                    category = config.categories.find(function (c) { return c.id === categoryId; });
                    if (!category)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, updateCategories([
                            {
                                id: categoryId,
                                display_in_pdf: visible,
                            },
                        ])];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Categoria a fost actualizată' });
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    setFeedback({
                        type: 'error',
                        message: err_1 instanceof Error ? err_1.message : 'Eroare la actualizarea categoriei',
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [config, updateCategories]);
    var handleTogglePageBreak = (0, react_1.useCallback)(function (categoryId, pageBreak) { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!config)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, updateCategories([
                            {
                                id: categoryId,
                                page_break_after: pageBreak,
                            },
                        ])];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Page break actualizat' });
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    setFeedback({
                        type: 'error',
                        message: err_2 instanceof Error ? err_2.message : 'Eroare la actualizarea page break',
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [config, updateCategories]);
    var handleToggleProduct = (0, react_1.useCallback)(function (productId, visible) { return __awaiter(void 0, void 0, void 0, function () {
        var err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!config)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, updateProducts([
                            {
                                id: productId,
                                display_in_pdf: visible,
                            },
                        ])];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Produsul a fost actualizat' });
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    setFeedback({
                        type: 'error',
                        message: err_3 instanceof Error ? err_3.message : 'Eroare la actualizarea produsului',
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [config, updateProducts]);
    var handleToggleAllProducts = (0, react_1.useCallback)(function (categoryId, visible) { return __awaiter(void 0, void 0, void 0, function () {
        var category, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!config)
                        return [2 /*return*/];
                    category = config.categories.find(function (c) { return c.id === categoryId; });
                    if (!category)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, updateProducts(category.products.map(function (p) { return ({
                            id: p.id,
                            display_in_pdf: visible,
                        }); }))];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: "Toate produsele au fost ".concat(visible ? 'activate' : 'dezactivate') });
                    return [3 /*break*/, 4];
                case 3:
                    err_4 = _a.sent();
                    setFeedback({
                        type: 'error',
                        message: err_4 instanceof Error ? err_4.message : 'Eroare la actualizarea produselor',
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [config, updateProducts]);
    var handleUploadImage = (0, react_1.useCallback)(function (categoryId, file) { return __awaiter(void 0, void 0, void 0, function () {
        var err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, uploadImage(categoryId, file)];
                case 1:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Imaginea a fost încărcată cu succes' });
                    return [3 /*break*/, 3];
                case 2:
                    err_5 = _a.sent();
                    setFeedback({
                        type: 'error',
                        message: err_5 instanceof Error ? err_5.message : 'Eroare la upload-ul imaginii',
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, 'uploadImage');
    var handleDeleteImage = (0, react_1.useCallback)(function (categoryId) { return __awaiter(void 0, void 0, void 0, function () {
        var err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Ești sigur că vrei să ștergi această imagine?')) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteImage(categoryId)];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Imaginea a fost ștearsă' });
                    return [3 /*break*/, 4];
                case 3:
                    err_6 = _a.sent();
                    setFeedback({
                        type: 'error',
                        message: err_6 instanceof Error ? err_6.message : 'Eroare la ștergerea imaginii',
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, 'deleteImage');
    var handleRegenerate = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm("Regenerezi PDF-urile pentru ".concat(activeType === 'food' ? 'Mâncare' : 'Băuturi', "?"))) {
                        return [2 /*return*/];
                    }
                    setRegenerating(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, regenerate(activeType)];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'PDF-urile au fost regenerate cu succes' });
                    return [3 /*break*/, 5];
                case 3:
                    err_7 = _a.sent();
                    setFeedback({
                        type: 'error',
                        message: err_7 instanceof Error ? err_7.message : 'Eroare la regenerarea PDF-urilor',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setRegenerating(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [activeType, regenerate]);
    var handleRegenerateAll = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Regenerezi toate PDF-urile (Mâncare + Băuturi)?')) {
                        return [2 /*return*/];
                    }
                    setRegenerating(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, regenerate('all')];
                case 2:
                    _a.sent();
                    setFeedback({ type: 'success', message: 'Toate PDF-urile au fost regenerate cu succes' });
                    return [3 /*break*/, 5];
                case 3:
                    err_8 = _a.sent();
                    setFeedback({
                        type: 'error',
                        message: err_8 instanceof Error ? err_8.message : 'Eroare la regenerarea PDF-urilor',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setRegenerating(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [regenerate]);
    return (<div className="menu-pdf-page" data-page-ready={!loading}>
      <PageHeader_1.PageHeader title='Generator PDF Meniu' description="Administrează template-urile de meniu, sincronizează conținutul cu Catalogul și exportă PDF-uri gata de tipar sau distribuție digitală." actions={[
            {
                label: '↻ Reîmprospătează',
                variant: 'secondary',
                onClick: refetch,
            },
            {
                label: regenerating ? '⏳ Se generează...' : '📄 Generează PDF',
                variant: 'primary',
                onClick: handleRegenerate,
            },
            {
                label: regenerating ? '⏳ Se generează...' : '🔄 Generează Toate',
                variant: 'primary',
                onClick: handleRegenerateAll,
            },
        ]}/>

      {feedback ? <InlineAlert_1.InlineAlert type={feedback.type} message={feedback.message}/> : null}
      {error ? <InlineAlert_1.InlineAlert type="error" message={error}/> : null}

      {/* Tabs */}
      <div className="menu-pdf-tabs">
        <button type="button" className={"menu-pdf-tab ".concat(activeType === 'food' ? 'menu-pdf-tab--active' : '')} onClick={function () { return setActiveType('food'); }}>
          🍕 Meniu Mâncare
        </button>
        <button type="button" className={"menu-pdf-tab ".concat(activeType === 'drinks' ? 'menu-pdf-tab--active' : '')} onClick={function () { return setActiveType('drinks'); }}>
          🍷 Meniu Băuturi
        </button>
      </div>

      {/* Stats */}
      <section className="menu-pdf-stats">
        {stats.map(function (stat) { return (<StatCard_1.StatCard key={stat.label} title={stat.label} helper={stat.helper} value={stat.value} icon={<span>{stat.icon}</span>}/>); })}
      </section>

      {/* Categories List */}
      {loading ? (<div className="menu-pdf-loading">
          <div className="spinner"></div>
          <p>Se încarcă configurația...</p>
        </div>) : config && config.categories.length > 0 ? (<section className="menu-pdf-categories">
          {config.categories.map(function (category) { return (<PdfCategoryCard_1.PdfCategoryCard key={category.id} category={category} onToggleVisibility={handleToggleCategoryVisibility} onTogglePageBreak={handleTogglePageBreak} onToggleProduct={handleToggleProduct} onToggleAllProducts={handleToggleAllProducts} onUploadImage={handleUploadImage} onDeleteImage={handleDeleteImage}/>); })}
        </section>) : (<div className="menu-pdf-empty">
          <p>📋 Nicio categorie configurată pentru {activeType === 'food' ? 'Mâncare' : 'Băuturi'}.</p>
        </div>)}
    </div>);
};
exports.MenuPDFBuilderPage = MenuPDFBuilderPage;
