// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Button, Badge, Alert, Nav, Tab, Container } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import './ManualInstructiuniPage.css';

export const ManualInstructiuniPage = () => {
//   const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("Manual");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const handleDownloadManual = async () => {
    try {
      // Download the complete manual via API
      const response = await fetch('/server/MANUAL-INSTRUCTIUNI-COMPLETE.md');
      if (!response.ok) {
        throw new Error('Nu s-a putut descărca manualul');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'MANUAL-INSTRUCTIUNI-COMPLETE.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Eroare la descărcarea manualului:', error);
      alert('Nu s-a putut descărca manualul. Vă rugăm să încercați din nou.');
    }
  };

  const handleViewOnline = () => {
    // Open the manual in a new tab
    window.open('/server/MANUAL-INSTRUCTIUNI-COMPLETE.md', '_blank');
  };

  const quickGuides = [
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

  const keyFeatures = [
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

  return (
    <div className="manual-instructiuni-page">
      <PageHeader
        title='📚 manual instructiuni'
        description="Ghid complet pentru utilizarea aplicației Restaurant App v3"
      />

      <Container fluid className="mt-4">
        {/* Header Actions */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-0">"manual instructiuni complet"</h2>
                <p className="text-muted mb-0">
                  Versiune 3.0.0 | Data: {new Date().toLocaleDateString('ro-RO')} | 52 secțiuni documentate
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-primary" onClick={handleViewOnline}>
                  <i className="fas fa-external-link-alt me-2"></i>
                  Vezi Online
                </Button>
                <Button variant="primary" onClick={handleDownloadManual}>
                  <i className="fas fa-download me-2"></i>"descarca manual"</Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Tabs Navigation */}
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')}>
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="manual">"manual complet"</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="overview">"prezentare generala"</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="guides">"ghiduri rapide"</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="features">"functionalitati cheie"</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="support">Suport</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* Manual Complet Tab */}
            <Tab.Pane eventKey="manual">
              <Card className="shadow-sm">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <Card.Title className="mb-0">📚 Manual Complet de Instrucțiuni</Card.Title>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm" onClick={handleViewOnline}>
                        <i className="fas fa-external-link-alt me-2"></i>"deschide in tab nou"</Button>
                      <Button variant="primary" size="sm" onClick={handleDownloadManual}>
                        <i className="fas fa-download me-2"></i>"descarca pdf"</Button>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="p-0" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
                  {!iframeLoaded && (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                      <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                          <span className="visually-hidden">Se încarcă...</span>
                        </div>
                        <p className="text-muted">"se incarca manualul"</p>
                      </div>
                    </div>
                  )}
                  <iframe
                    ref={iframeRef}
                    src="/manual-instructiuni-complet.html"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      display: iframeLoaded ? 'block' : 'none',
                    }}
                    title="manual complet de instructiuni"
                    onLoad={() => setIframeLoaded(true)}
                  />
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Overview Tab */}
            <Tab.Pane eventKey="overview">
              <Row className="g-4 mb-4">
                <Col md={4}>
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <div className="text-center mb-3" style={{ fontSize: '3rem' }}>ℹ️</div>
                      <Card.Title className="text-center">"despre manual"</Card.Title>
                      <Card.Text className="text-muted text-center">
                        Acest manual cuprinde instrucțiuni complete pentru toate modulele aplicației Restaurant App v3,
                        inclusiv Admin-Vite și sistemele POS/Kiosk.
                      </Card.Text>
                      <div className="d-flex justify-content-center gap-2 mt-3">
                        <Badge bg="secondary">52 secțiuni</Badge>
                        <Badge bg="secondary">400+ pagini</Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <div className="text-center mb-3" style={{ fontSize: '3rem' }}>❓</div>
                      <Card.Title className="text-center">Ultima Actualizare</Card.Title>
                      <Card.Text className="text-muted text-center">
                        Manualul este actualizat automat cu cele mai noi funcționalități și include capturi de ecran
                        pentru fiecare interfață.
                      </Card.Text>
                      <p className="text-center text-muted small mt-3">
                        Versiune: 3.0.0 | Data: {new Date().toLocaleDateString('ro-RO')}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <div className="text-center mb-3" style={{ fontSize: '3rem' }}>🔍</div>
                      <Card.Title className="text-center">"cautare rapida"</Card.Title>
                      <Card.Text className="text-muted text-center">
                        Utilizați Ctrl+F pentru a căuta rapid în manual orice funcționalitate sau termen tehnic.
                      </Card.Text>
                      <p className="text-center text-muted small mt-3">"include index complet si cuprins detaliat"</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Main Sections Overview */}
              <Card className="shadow-sm">
                <Card.Header>
                  <Card.Title className="mb-0">"structura manualului"</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h5 className="mb-3">🏠 Dashboard & Acasă</h5>
                      <ul className="text-muted">
                        <li>Dashboard Principal</li>
                        <li>POS/Kiosk Dashboard</li>
                        <li>KDS Bucătărie & Bar</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <h5 className="mb-3">📋 Gestionare Operațiuni</h5>
                      <ul className="text-muted">
                        <li>Gestionare Comenzi</li>
                        <li>"gestionare stocuri"</li>
                        <li>"gestionare personal"</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <h5 className="mb-3">💰 Contabilitate & Fiscal</h5>
                      <ul className="text-muted">
                        <li>Bon Consum</li>
                        <li>"situatia vanzarilor"</li>
                        <li>Integrare ANAF</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <h5 className="mb-3">⚙️ Setări & Configurare</h5>
                      <ul className="text-muted">
                        <li>"setari restaurant"</li>
                        <li>Configurare Mese</li>
                        <li>Backup & Securitate</li>
                      </ul>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Quick Guides Tab */}
            <Tab.Pane eventKey="guides">
              <Row className="g-4 mb-4">
                {quickGuides.map((guide, index) => (
                  <Col key={index} md={6}>
                    <Card className="h-100 shadow-sm">
                      <Card.Body>
                        <div className="text-center mb-3" style={{ fontSize: '3rem' }}>
                          {guide.icon}
                        </div>
                        <Card.Title className="text-center">{guide.title}</Card.Title>
                        <Card.Text className="text-muted text-center mb-3">{guide.description}</Card.Text>
                        <div className="d-flex flex-column gap-1">
                          {guide.sections.map((section, i) => (
                            <div key={i} className="text-muted small d-flex align-items-center">
                              <span className="me-2">•</span>
                              {section}
                            </div>
                          ))}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Alert variant="info">
                <Alert.Heading>
                  <i className="fas fa-info-circle me-2"></i>"Informație"</Alert.Heading>
                <p className="mb-0">
                  Fiecare ghid rapid conține link-uri directe către secțiunile relevante din manualul complet pentru
                  referință detaliată.
                </p>
              </Alert>
            </Tab.Pane>

            {/* Key Features Tab */}
            <Tab.Pane eventKey="features">
              <Row className="g-4 mb-4">
                {keyFeatures.map((feature, index) => (
                  <Col key={index} md={4}>
                    <Card className="h-100 shadow-sm">
                      <Card.Body>
                        <div className="text-center mb-3" style={{ fontSize: '2.5rem' }}>
                          {feature.icon}
                        </div>
                        <Card.Title className="text-center h5">{feature.title}</Card.Title>
                        <Card.Text className="text-muted text-center">{feature.description}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Card className="shadow-sm">
                <Card.Header>
                  <Card.Title className="mb-0">"functionalitati enterprise"</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h5 className="mb-3">🏢 Multi-Locație</h5>
                      <ul className="text-muted">
                        <li>"gestionare lanturi de restaurante"</li>
                        <li>"transferuri intre locatii"</li>
                        <li>Rapoarte consolidate</li>
                        <li>"control acces pe baza de locatie"</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <h5 className="mb-3">🤖 Inteligență Artificială</h5>
                      <ul className="text-muted">
                        <li>"predictie consum stocuri"</li>
                        <li>"optimizare comenzi automate"</li>
                        <li>"analiza comportament clienti"</li>
                        <li>"recomandari pricing dinamic"</li>
                      </ul>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Support Tab */}
            <Tab.Pane eventKey="support">
              <Row className="g-4">
                <Col md={6}>
                  <Card className="shadow-sm">
                    <Card.Header>
                      <Card.Title className="mb-0">📞 Contact Suport Tehnic</Card.Title>
                    </Card.Header>
                    <Card.Body>
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
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="shadow-sm">
                    <Card.Header>
                      <Card.Title className="mb-0">📚 Resurse Adiționale</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-grid gap-2">
                        <Button variant="outline-primary" size="sm" className="text-start">
                          <i className="fas fa-file-alt me-2"></i>"documentatie api"</Button>
                        <Button variant="outline-primary" size="sm" className="text-start">
                          <i className="fas fa-book me-2"></i>"tutoriale video"</Button>
                        <Button variant="outline-primary" size="sm" className="text-start">
                          <i className="fas fa-users me-2"></i>
                          Comunitate Utilizatori
                        </Button>
                        <Button variant="outline-primary" size="sm" className="text-start">
                          <i className="fas fa-question-circle me-2"></i>
                          FAQ Interactiv
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="mt-4 shadow-sm">
                <Card.Header>
                  <Card.Title className="mb-0">"actualizari si noutati"</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-start gap-3">
                      <Badge bg="secondary">v3.0.0</Badge>
                      <div>
                        <h6 className="mb-1">"lansare admin vite enterprise"</h6>
                        <p className="text-muted small mb-0">"interfata complet reactiva cu functii enterprise a"</p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-3">
                      <Badge bg="secondary">v2.9.5</Badge>
                      <div>
                        <h6 className="mb-1">"integrare anaf completa"</h6>
                        <p className="text-muted small mb-0">"sistem e facturare si sincronizare automata"</p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-3">
                      <Badge bg="secondary">v2.8.0</Badge>
                      <div>
                        <h6 className="mb-1">POS/Kiosk Unificat</h6>
                        <p className="text-muted small mb-0">"sistem unificat pentru toate tipurile de comenzi"</p>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>
    </div>
  );
};



