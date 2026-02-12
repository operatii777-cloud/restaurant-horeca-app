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
exports.WelcomePage = WelcomePage;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var react_bootstrap_1 = require("react-bootstrap");
var PageHeader_1 = require("@/shared/components/PageHeader");
var httpClient_1 = require("@/shared/api/httpClient");
require("./WelcomePage.css");
function WelcomePage() {
    var _this = this;
    var _a = (0, react_1.useState)([]), categories = _a[0], setCategories = _a[1];
    var _b = (0, react_1.useState)(false), loadingCategories = _b[0], setLoadingCategories = _b[1];
    (0, react_1.useEffect)(function () {
        loadCategories();
    }, []);
    var loadCategories = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, categoryMap_1, cats, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoadingCategories(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/catalog/products')];
                case 2:
                    response = _a.sent();
                    if (response.data && Array.isArray(response.data)) {
                        categoryMap_1 = new Map();
                        response.data.forEach(function (product) {
                            var cat = product.category || 'Fără categorie';
                            categoryMap_1.set(cat, (categoryMap_1.get(cat) || 0) + 1);
                        });
                        cats = Array.from(categoryMap_1.entries()).map(function (_a) {
                            var name = _a[0], productCount = _a[1];
                            return ({
                                name: name,
                                productCount: productCount
                            });
                        }).sort(function (a, b) { return b.productCount - a.productCount; }).slice(0, 6);
                        setCategories(cats);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error loading categories:', err_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoadingCategories(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var features = [
        {
            icon: '📊',
            title: 'Dashboard',
            description: 'Vizualizează KPI-uri, vânzări și performanță',
            link: '/dashboard',
            color: 'primary'
        },
        {
            icon: '🍽️',
            title: 'Meniu',
            description: 'Gestionează produse, categorii și prețuri',
            link: '/menu',
            color: 'success'
        },
        {
            icon: '📝',
            title: 'Rețete',
            description: 'Creează și editează rețete pentru produse',
            link: '/recipes',
            color: 'info'
        },
        {
            icon: '📦',
            title: 'Stocuri',
            description: 'Gestionează inventarul și ingredientele',
            link: '/stocks',
            color: 'warning'
        },
        {
            icon: '🛒',
            title: 'Comenzi',
            description: 'Urmărește și gestionează comenzile',
            link: '/orders',
            color: 'danger'
        },
        {
            icon: '📅',
            title: 'Rezervări',
            description: 'Gestionează rezervările clienților',
            link: '/reservations',
            color: 'secondary'
        },
        {
            icon: '💰',
            title: 'Rapoarte',
            description: 'Generează rapoarte financiare și de vânzări',
            link: '/reports',
            color: 'primary'
        },
        {
            icon: '⚙️',
            title: 'Setări',
            description: 'Configurează aplicația și utilizatorii',
            link: '/settings',
            color: 'warning'
        },
        {
            icon: '📚',
            title: 'Manual Instrucțiuni',
            description: 'Ghid complet pentru utilizarea aplicației',
            link: '/settings/manual-instructiuni',
            color: 'info'
        }
    ];
    return (<div className="welcome-page">
      <PageHeader_1.PageHeader title="Bun venit în Restaurant App" description="Sistem complet de gestionare pentru restaurante"/>

      <div className="welcome-hero mb-5">
        <div className="text-center">
          <h1 className="display-4 mb-3">🍽️ Restaurant App</h1>
          <p className="lead text-muted mb-4">Soluție completă pentru gestionarea restaurantului tău</p>
          <div className="d-flex gap-3 justify-content-center">
            <react_bootstrap_1.Button variant="primary" size="lg" as={react_router_dom_1.Link} to="/dashboard">
              <i className="fas fa-tachometer-alt me-2"></i>Accesează Dashboard</react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="outline-primary" size="lg" as={react_router_dom_1.Link} to="/menu">
              <i className="fas fa-utensils me-2"></i>Gestionează Meniul</react_bootstrap_1.Button>
          </div>
        </div>
      </div>

      <div className="welcome-features">
        <h2 className="text-center mb-4">Funcționalități Principale</h2>
        <react_bootstrap_1.Row className="g-4">
          {features.map(function (feature, index) { return (<react_bootstrap_1.Col key={index} md={6} lg={3}>
              <react_bootstrap_1.Card className="h-100 feature-card shadow-sm">
                <react_bootstrap_1.Card.Body className="text-center">
                  <div className="feature-icon mb-3" style={{ fontSize: '3rem' }}>
                    {feature.icon}
                  </div>
                  <react_bootstrap_1.Card.Title>{feature.title}</react_bootstrap_1.Card.Title>
                  <react_bootstrap_1.Card.Text className="text-muted">{feature.description}</react_bootstrap_1.Card.Text>
                  <react_bootstrap_1.Button variant={feature.color} as={react_router_dom_1.Link} to={feature.link} className="mt-auto">Accesează<i className="fas fa-arrow-right ms-2"></i>
                  </react_bootstrap_1.Button>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Col>); })}
        </react_bootstrap_1.Row>
      </div>

      {/* Quick Catalog Section */}
      <div className="welcome-quick-catalog mt-5">
        <h2 className="text-center mb-4">📦 Catalog Rapid</h2>
        {loadingCategories ? (<div className="text-center py-4">
            <react_bootstrap_1.Spinner animation="border" variant="primary"/>
            <p className="mt-2 text-muted">Se încarcă categoriile...</p>
          </div>) : categories.length > 0 ? (<react_bootstrap_1.Row className="g-3">
            {categories.map(function (category, index) { return (<react_bootstrap_1.Col key={index} md={4} lg={2}>
                <react_bootstrap_1.Card className="h-100 category-card shadow-sm" style={{ cursor: 'pointer' }}>
                  <react_bootstrap_1.Card.Body className="text-center">
                    <div className="category-icon mb-2" style={{ fontSize: '2rem' }}>
                      📁
                    </div>
                    <react_bootstrap_1.Card.Title className="h6 mb-1">{category.name}</react_bootstrap_1.Card.Title>
                    <react_bootstrap_1.Card.Text className="text-muted small mb-0">
                      {category.productCount} {category.productCount === 1 ? 'produs' : 'produse'}
                    </react_bootstrap_1.Card.Text>
                    <react_bootstrap_1.Button variant="outline-primary" size="sm" as={react_router_dom_1.Link} to={"/menu?category=".concat(encodeURIComponent(category.name))} className="mt-2">
                      Vezi produse
                    </react_bootstrap_1.Button>
                  </react_bootstrap_1.Card.Body>
                </react_bootstrap_1.Card>
              </react_bootstrap_1.Col>); })}
          </react_bootstrap_1.Row>) : (<div className="text-center py-4 text-muted">
            <p>Nu există categorii disponibile.</p>
            <react_bootstrap_1.Button variant="primary" as={react_router_dom_1.Link} to="/menu">
              <i className="fas fa-plus me-2"></i>Adaugă produse</react_bootstrap_1.Button>
          </div>)}
      </div>

      <div className="welcome-stats mt-5">
        <react_bootstrap_1.Row className="g-4">
          <react_bootstrap_1.Col md={4}>
            <react_bootstrap_1.Card className="text-center shadow-sm">
              <react_bootstrap_1.Card.Body>
                <div className="display-4 mb-2">🚀</div>
                <h5>Performanță</h5>
                <p className="text-muted">Sistem optimizat pentru viteză și eficiență</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={4}>
            <react_bootstrap_1.Card className="text-center shadow-sm">
              <react_bootstrap_1.Card.Body>
                <div className="display-4 mb-2">🔒</div>
                <h5>Securitate</h5>
                <p className="text-muted">Date protejate și acces controlat</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
          <react_bootstrap_1.Col md={4}>
            <react_bootstrap_1.Card className="text-center shadow-sm">
              <react_bootstrap_1.Card.Body>
                <div className="display-4 mb-2">📱</div>
                <h5>Accesibil</h5>
                <p className="text-muted">Funcționează pe orice dispozitiv</p>
              </react_bootstrap_1.Card.Body>
            </react_bootstrap_1.Card>
          </react_bootstrap_1.Col>
        </react_bootstrap_1.Row>
      </div>
    </div>);
}
