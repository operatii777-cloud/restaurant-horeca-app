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
exports.ManualInstructiuniPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./ManualInstructiuniPage.css");
var ManualInstructiuniPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)("Manual"), activeTab = _a[0], setActiveTab = _a[1];
    var iframeRef = (0, react_1.useRef)(null);
    var _b = (0, react_1.useState)(false), iframeLoaded = _b[0], setIframeLoaded = _b[1];
    var handleDownloadManual = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, blob, url, link, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/server/MANUAL-INSTRUCTIUNI-COMPLETE.md')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Nu s-a putut descărca manualul');
                    }
                    return [4 /*yield*/, response.blob()];
                case 2:
                    blob = _a.sent();
                    url = window.URL.createObjectURL(blob);
                    link = document.createElement('a');
                    link.href = url;
                    link.download = 'MANUAL-INSTRUCTIUNI-COMPLETE.md';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Eroare la descărcarea manualului:', error_1);
                    alert('Nu s-a putut descărca manualul. Vă rugăm să încercați din nou.');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleViewOnline = function () {
        // Open the manual in a new tab
        window.open('/server/MANUAL-INSTRUCTIUNI-COMPLETE.md', '_blank');
    };
    var quickGuides = [
        {
            title: 'Pentru Administratori',
            description: 'Ghid complet pentru configurarea și administrarea sistemului',
            icon: '⚙️',
            sections: ['Dashboard Principal', 'Gestionare Utilizatori', 'Setări Sistem', 'Backup & Securitate']
        },
        {
            title: 'Pentru Ospătari',
            description: 'Instrucțiuni pentru preluarea comenzilor și gestionarea clienților',
            icon: '👥',
            sections: ['POS Split Screen', 'Gestionare Comenzi', 'Plăți și Facturare', 'Rezervări']
        },
        {
            title: 'Pentru Bucătari',
            description: 'Sistemul KDS și specificații pentru preparare',
            icon: '👨‍🍳',
            sections: ['KDS Bucătărie', 'Comenzi Active', 'Timer-e Automate', 'Notificări']
        },
        {
            title: 'Pentru Barmani',
            description: 'Gestionare comenzi băuturi și cocktail-uri',
            icon: '🍸',
            sections: ['KDS Bar', 'Rețete Cocktail-uri', 'Gestionare Stocuri', 'Happy Hour']
        }
    ];
    var keyFeatures = [
        {
            title: 'Dashboard Analitic',
            description: 'Monitorizare în timp real a tuturor indicatorilor cheie',
            icon: '📊'
        },
        {
            title: 'Sisteme POS/Kiosk',
            description: 'Interfețe moderne pentru preluarea comenzilor',
            icon: '📱'
        },
        {
            title: 'Kitchen Display System',
            description: 'Sincronizare perfectă între ospătari și bucătari',
            icon: '🖥️'
        },
        {
            title: 'Gestionare Stocuri',
            description: 'Sistem inteligent cu alerte și predicții',
            icon: '🚚'
        },
        {
            title: 'Conformitate Fiscală',
            description: 'Integrare completă cu ANAF și case de marcat',
            icon: '🛡️'
        },
        {
            title: 'Rapoarte Avansate',
            description: 'Business Intelligence și analiză detaliată',
            icon: '📄'
        }
    ];
    return (<div className="manual-instructiuni-page">
      <PageHeader_1.PageHeader title='📚 manual instructiuni' description="Ghid complet pentru utilizarea aplicației Restaurant App v3"/>

      <react_bootstrap_1.Container fluid className="mt-4">
        {/* Header Actions */}
        <react_bootstrap_1.Row className="mb-4">
          <react_bootstrap_1.Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-0">"manual instructiuni complet"</h2>
                <p className="text-muted mb-0">
                  Versiune 3.0.0 | Data: {new Date().toLocaleDateString('ro-RO')} | 52 secțiuni documentate
                </p>
              </div>
              <div className="d-flex gap-2">
                <react_bootstrap_1.Button variant="outline-primary" onClick={handleViewOnline}>
                  <i className="fas fa-external-link-alt me-2"></i>
                  Vezi Online
                </react_bootstrap_1.Button>
                <react_bootstrap_1.Button variant="primary" onClick={handleDownloadManual}>
                  <i className="fas fa-download me-2"></i>"descarca manual"</react_bootstrap_1.Button>
              </div>
            </div>
          </react_bootstrap_1.Col>
        </react_bootstrap_1.Row>

        {/* Tabs Navigation */}
        <react_bootstrap_1.Tab.Container activeKey={activeTab} onSelect={function (k) { return setActiveTab(k || 'overview'); }}>
          <react_bootstrap_1.Nav variant="tabs" className="mb-4">
            <react_bootstrap_1.Nav.Item>
              <react_bootstrap_1.Nav.Link eventKey="manual">"manual complet"</react_bootstrap_1.Nav.Link>
            </react_bootstrap_1.Nav.Item>
            <react_bootstrap_1.Nav.Item>
              <react_bootstrap_1.Nav.Link eventKey="overview">"prezentare generala"</react_bootstrap_1.Nav.Link>
            </react_bootstrap_1.Nav.Item>
            <react_bootstrap_1.Nav.Item>
              <react_bootstrap_1.Nav.Link eventKey="guides">"ghiduri rapide"</react_bootstrap_1.Nav.Link>
            </react_bootstrap_1.Nav.Item>
            <react_bootstrap_1.Nav.Item>
              <react_bootstrap_1.Nav.Link eventKey="features">"functionalitati cheie"</react_bootstrap_1.Nav.Link>
            </react_bootstrap_1.Nav.Item>
            <react_bootstrap_1.Nav.Item>
              <react_bootstrap_1.Nav.Link eventKey="support">Suport</react_bootstrap_1.Nav.Link>
            </react_bootstrap_1.Nav.Item>
          </react_bootstrap_1.Nav>

          <react_bootstrap_1.Tab.Content>
            {/* Manual Complet Tab */}
            <react_bootstrap_1.Tab.Pane eventKey="manual">
              <react_bootstrap_1.Card className="shadow-sm">
                <react_bootstrap_1.Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <react_bootstrap_1.Card.Title className="mb-0">📚 Manual Complet de Instrucțiuni</react_bootstrap_1.Card.Title>
                    <div className="d-flex gap-2">
                      <react_bootstrap_1.Button variant="outline-primary" size="sm" onClick={handleViewOnline}>
                        <i className="fas fa-external-link-alt me-2"></i>"deschide in tab nou"</react_bootstrap_1.Button>
                      <react_bootstrap_1.Button variant="primary" size="sm" onClick={handleDownloadManual}>
                        <i className="fas fa-download me-2"></i>"descarca pdf"</react_bootstrap_1.Button>
                    </div>
                  </div>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body className="p-0" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
                  {!iframeLoaded && (<div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                      <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                          <span className="visually-hidden">Se încarcă...</span>
                        </div>
                        <p className="text-muted">"se incarca manualul"</p>
                      </div>
                    </div>)}
                  <iframe ref={iframeRef} src="/manual-instructiuni-complet.html" style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: iframeLoaded ? 'block' : 'none',
        }} title="manual complet de instructiuni" onLoad={function () { return setIframeLoaded(true); }}/>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Tab.Pane>

            {/* Overview Tab */}
            <react_bootstrap_1.Tab.Pane eventKey="overview">
              <react_bootstrap_1.Row className="g-4 mb-4">
                <react_bootstrap_1.Col md={4}>
                  <react_bootstrap_1.Card className="h-100 shadow-sm">
                    <react_bootstrap_1.Card.Body>
                      <div className="text-center mb-3" style={{ fontSize: '3rem' }}>ℹ️</div>
                      <react_bootstrap_1.Card.Title className="text-center">"despre manual"</react_bootstrap_1.Card.Title>
                      <react_bootstrap_1.Card.Text className="text-muted text-center">
                        Acest manual cuprinde instrucțiuni complete pentru toate modulele aplicației Restaurant App v3,
                        inclusiv Admin-Vite și sistemele POS/Kiosk.
                      </react_bootstrap_1.Card.Text>
                      <div className="d-flex justify-content-center gap-2 mt-3">
                        <react_bootstrap_1.Badge bg="secondary">52 secțiuni</react_bootstrap_1.Badge>
                        <react_bootstrap_1.Badge bg="secondary">400+ pagini</react_bootstrap_1.Badge>
                      </div>
                    </react_bootstrap_1.Card.Body>
                  </react_bootstrap_1.Card>
                </react_bootstrap_1.Col>

                <react_bootstrap_1.Col md={4}>
                  <react_bootstrap_1.Card className="h-100 shadow-sm">
                    <react_bootstrap_1.Card.Body>
                      <div className="text-center mb-3" style={{ fontSize: '3rem' }}>❓</div>
                      <react_bootstrap_1.Card.Title className="text-center">Ultima Actualizare</react_bootstrap_1.Card.Title>
                      <react_bootstrap_1.Card.Text className="text-muted text-center">
                        Manualul este actualizat automat cu cele mai noi funcționalități și include capturi de ecran
                        pentru fiecare interfață.
                      </react_bootstrap_1.Card.Text>
                      <p className="text-center text-muted small mt-3">
                        Versiune: 3.0.0 | Data: {new Date().toLocaleDateString('ro-RO')}
                      </p>
                    </react_bootstrap_1.Card.Body>
                  </react_bootstrap_1.Card>
                </react_bootstrap_1.Col>

                <react_bootstrap_1.Col md={4}>
                  <react_bootstrap_1.Card className="h-100 shadow-sm">
                    <react_bootstrap_1.Card.Body>
                      <div className="text-center mb-3" style={{ fontSize: '3rem' }}>🔍</div>
                      <react_bootstrap_1.Card.Title className="text-center">"cautare rapida"</react_bootstrap_1.Card.Title>
                      <react_bootstrap_1.Card.Text className="text-muted text-center">
                        Utilizați Ctrl+F pentru a căuta rapid în manual orice funcționalitate sau termen tehnic.
                      </react_bootstrap_1.Card.Text>
                      <p className="text-center text-muted small mt-3">"include index complet si cuprins detaliat"</p>
                    </react_bootstrap_1.Card.Body>
                  </react_bootstrap_1.Card>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>

              {/* Main Sections Overview */}
              <react_bootstrap_1.Card className="shadow-sm">
                <react_bootstrap_1.Card.Header>
                  <react_bootstrap_1.Card.Title className="mb-0">"structura manualului"</react_bootstrap_1.Card.Title>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  <react_bootstrap_1.Row>
                    <react_bootstrap_1.Col md={6}>
                      <h5 className="mb-3">🏠 Dashboard & Acasă</h5>
                      <ul className="text-muted">
                        <li>Dashboard Principal</li>
                        <li>POS/Kiosk Dashboard</li>
                        <li>KDS Bucătărie & Bar</li>
                      </ul>
                    </react_bootstrap_1.Col>
                    <react_bootstrap_1.Col md={6}>
                      <h5 className="mb-3">📋 Gestionare Operațiuni</h5>
                      <ul className="text-muted">
                        <li>Gestionare Comenzi</li>
                        <li>"gestionare stocuri"</li>
                        <li>"gestionare personal"</li>
                      </ul>
                    </react_bootstrap_1.Col>
                    <react_bootstrap_1.Col md={6}>
                      <h5 className="mb-3">💰 Contabilitate & Fiscal</h5>
                      <ul className="text-muted">
                        <li>Bon Consum</li>
                        <li>"situatia vanzarilor"</li>
                        <li>Integrare ANAF</li>
                      </ul>
                    </react_bootstrap_1.Col>
                    <react_bootstrap_1.Col md={6}>
                      <h5 className="mb-3">⚙️ Setări & Configurare</h5>
                      <ul className="text-muted">
                        <li>"setari restaurant"</li>
                        <li>Configurare Mese</li>
                        <li>Backup & Securitate</li>
                      </ul>
                    </react_bootstrap_1.Col>
                  </react_bootstrap_1.Row>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Tab.Pane>

            {/* Quick Guides Tab */}
            <react_bootstrap_1.Tab.Pane eventKey="guides">
              <react_bootstrap_1.Row className="g-4 mb-4">
                {quickGuides.map(function (guide, index) { return (<react_bootstrap_1.Col key={index} md={6}>
                    <react_bootstrap_1.Card className="h-100 shadow-sm">
                      <react_bootstrap_1.Card.Body>
                        <div className="text-center mb-3" style={{ fontSize: '3rem' }}>
                          {guide.icon}
                        </div>
                        <react_bootstrap_1.Card.Title className="text-center">{guide.title}</react_bootstrap_1.Card.Title>
                        <react_bootstrap_1.Card.Text className="text-muted text-center mb-3">{guide.description}</react_bootstrap_1.Card.Text>
                        <div className="d-flex flex-column gap-1">
                          {guide.sections.map(function (section, i) { return (<div key={i} className="text-muted small d-flex align-items-center">
                              <span className="me-2">•</span>
                              {section}
                            </div>); })}
                        </div>
                      </react_bootstrap_1.Card.Body>
                    </react_bootstrap_1.Card>
                  </react_bootstrap_1.Col>); })}
              </react_bootstrap_1.Row>

              <react_bootstrap_1.Alert variant="info">
                <react_bootstrap_1.Alert.Heading>
                  <i className="fas fa-info-circle me-2"></i>"Informație"</react_bootstrap_1.Alert.Heading>
                <p className="mb-0">
                  Fiecare ghid rapid conține link-uri directe către secțiunile relevante din manualul complet pentru
                  referință detaliată.
                </p>
              </react_bootstrap_1.Alert>
            </react_bootstrap_1.Tab.Pane>

            {/* Key Features Tab */}
            <react_bootstrap_1.Tab.Pane eventKey="features">
              <react_bootstrap_1.Row className="g-4 mb-4">
                {keyFeatures.map(function (feature, index) { return (<react_bootstrap_1.Col key={index} md={4}>
                    <react_bootstrap_1.Card className="h-100 shadow-sm">
                      <react_bootstrap_1.Card.Body>
                        <div className="text-center mb-3" style={{ fontSize: '2.5rem' }}>
                          {feature.icon}
                        </div>
                        <react_bootstrap_1.Card.Title className="text-center h5">{feature.title}</react_bootstrap_1.Card.Title>
                        <react_bootstrap_1.Card.Text className="text-muted text-center">{feature.description}</react_bootstrap_1.Card.Text>
                      </react_bootstrap_1.Card.Body>
                    </react_bootstrap_1.Card>
                  </react_bootstrap_1.Col>); })}
              </react_bootstrap_1.Row>

              <react_bootstrap_1.Card className="shadow-sm">
                <react_bootstrap_1.Card.Header>
                  <react_bootstrap_1.Card.Title className="mb-0">"functionalitati enterprise"</react_bootstrap_1.Card.Title>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  <react_bootstrap_1.Row>
                    <react_bootstrap_1.Col md={6}>
                      <h5 className="mb-3">🏢 Multi-Locație</h5>
                      <ul className="text-muted">
                        <li>"gestionare lanturi de restaurante"</li>
                        <li>"transferuri intre locatii"</li>
                        <li>Rapoarte consolidate</li>
                        <li>"control acces pe baza de locatie"</li>
                      </ul>
                    </react_bootstrap_1.Col>
                    <react_bootstrap_1.Col md={6}>
                      <h5 className="mb-3">🤖 Inteligență Artificială</h5>
                      <ul className="text-muted">
                        <li>"predictie consum stocuri"</li>
                        <li>"optimizare comenzi automate"</li>
                        <li>"analiza comportament clienti"</li>
                        <li>"recomandari pricing dinamic"</li>
                      </ul>
                    </react_bootstrap_1.Col>
                  </react_bootstrap_1.Row>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Tab.Pane>

            {/* Support Tab */}
            <react_bootstrap_1.Tab.Pane eventKey="support">
              <react_bootstrap_1.Row className="g-4">
                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Card className="shadow-sm">
                    <react_bootstrap_1.Card.Header>
                      <react_bootstrap_1.Card.Title className="mb-0">📞 Contact Suport Tehnic</react_bootstrap_1.Card.Title>
                    </react_bootstrap_1.Card.Header>
                    <react_bootstrap_1.Card.Body>
                      <div className="mb-4">
                        <h5 className="mb-3">Contact Rapid</h5>
                        <p className="mb-1">
                          <strong>Telefon:</strong> +40 123 456 789
                        </p>
                        <p className="mb-1">
                          <strong>"Email:"</strong> suport@restaurantapp.ro
                        </p>
                        <p className="mb-0">
                          <strong>Chat Live:</strong> Disponibil 24/7
                        </p>
                      </div>

                      <div>
                        <h5 className="mb-3">🕒 Program Suport</h5>
                        <p className="mb-1">Luni - Vineri: 08:00 - 18:00</p>
                        <p className="mb-1">Sâmbătă: 09:00 - 14:00</p>
                        <p className="mb-0">"duminica urgente doar"</p>
                      </div>
                    </react_bootstrap_1.Card.Body>
                  </react_bootstrap_1.Card>
                </react_bootstrap_1.Col>

                <react_bootstrap_1.Col md={6}>
                  <react_bootstrap_1.Card className="shadow-sm">
                    <react_bootstrap_1.Card.Header>
                      <react_bootstrap_1.Card.Title className="mb-0">📚 Resurse Adiționale</react_bootstrap_1.Card.Title>
                    </react_bootstrap_1.Card.Header>
                    <react_bootstrap_1.Card.Body>
                      <div className="d-grid gap-2">
                        <react_bootstrap_1.Button variant="outline-primary" size="sm" className="text-start">
                          <i className="fas fa-file-alt me-2"></i>"documentatie api"</react_bootstrap_1.Button>
                        <react_bootstrap_1.Button variant="outline-primary" size="sm" className="text-start">
                          <i className="fas fa-book me-2"></i>"tutoriale video"</react_bootstrap_1.Button>
                        <react_bootstrap_1.Button variant="outline-primary" size="sm" className="text-start">
                          <i className="fas fa-users me-2"></i>
                          Comunitate Utilizatori
                        </react_bootstrap_1.Button>
                        <react_bootstrap_1.Button variant="outline-primary" size="sm" className="text-start">
                          <i className="fas fa-question-circle me-2"></i>
                          FAQ Interactiv
                        </react_bootstrap_1.Button>
                      </div>
                    </react_bootstrap_1.Card.Body>
                  </react_bootstrap_1.Card>
                </react_bootstrap_1.Col>
              </react_bootstrap_1.Row>

              <react_bootstrap_1.Card className="mt-4 shadow-sm">
                <react_bootstrap_1.Card.Header>
                  <react_bootstrap_1.Card.Title className="mb-0">"actualizari si noutati"</react_bootstrap_1.Card.Title>
                </react_bootstrap_1.Card.Header>
                <react_bootstrap_1.Card.Body>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-start gap-3">
                      <react_bootstrap_1.Badge bg="secondary">v3.0.0</react_bootstrap_1.Badge>
                      <div>
                        <h6 className="mb-1">"lansare admin vite enterprise"</h6>
                        <p className="text-muted small mb-0">"interfata complet reactiva cu functii enterprise a"</p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-3">
                      <react_bootstrap_1.Badge bg="secondary">v2.9.5</react_bootstrap_1.Badge>
                      <div>
                        <h6 className="mb-1">"integrare anaf completa"</h6>
                        <p className="text-muted small mb-0">"sistem e facturare si sincronizare automata"</p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-3">
                      <react_bootstrap_1.Badge bg="secondary">v2.8.0</react_bootstrap_1.Badge>
                      <div>
                        <h6 className="mb-1">POS/Kiosk Unificat</h6>
                        <p className="text-muted small mb-0">"sistem unificat pentru toate tipurile de comenzi"</p>
                      </div>
                    </div>
                  </div>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>
            </react_bootstrap_1.Tab.Pane>
          </react_bootstrap_1.Tab.Content>
        </react_bootstrap_1.Tab.Container>
      </react_bootstrap_1.Container>
    </div>);
};
exports.ManualInstructiuniPage = ManualInstructiuniPage;
