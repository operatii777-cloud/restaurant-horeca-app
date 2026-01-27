import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Badge, Tabs, Tab, Row, Col } from 'react-bootstrap';
import { 
  ExternalLink, Copy, CheckCircle, Code as CodeIcon, 
  Eye, Settings, Smartphone, Monitor, Globe
} from 'lucide-react';
import './KioskWidgetPage.css';

/**
 * KioskWidgetPage - Widget Site pentru Integrare în Site-uri Externe
 * 
 * Funcționalități:
 * - Generare cod embed (iframe sau script)
 * - Preview widget
 * - Configurare opțiuni (meniu, comandă, rezervări)
 * - Personalizare aspect (culoare, dimensiuni)
 * - Testare înainte de integrare
 */

const WIDGET_TYPES = [
  { value: 'full', label: 'Complet (Meniu + Comandă + Rezervări)', icon: '🍽️' },
  { value: 'menu', label: 'Doar Meniu', icon: '📋' },
  { value: 'ordering', label: 'Comandă Online', icon: '🛒' },
  { value: 'reservations', label: 'Rezervări', icon: '📅' },
];

const WIDGET_SIZES = [
  { value: 'responsive', label: 'Responsive (100% lățime)', width: '100%', height: '600px' },
  { value: 'small', label: 'Mic (400px)', width: '400px', height: '500px' },
  { value: 'medium', label: 'Mediu (600px)', width: '600px', height: '700px' },
  { value: 'large', label: 'Mare (800px)', width: '800px', height: '900px' },
  { value: 'fullscreen', label: 'Fullscreen', width: '100%', height: '100vh' },
];

export const KioskWidgetPage = () => {
  const [widgetType, setWidgetType] = useState('full');
  const [widgetSize, setWidgetSize] = useState('responsive');
  const [widgetTheme, setWidgetTheme] = useState('light');
  const [enableOrdering, setEnableOrdering] = useState(true);
  const [enableReservations, setEnableReservations] = useState(true);
  const [restaurantUrl, setRestaurantUrl] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    // Get current domain or use default
    const currentUrl = window.location.origin;
    setRestaurantUrl(currentUrl);
    generateEmbedCode();
  }, [widgetType, widgetSize, widgetTheme, enableOrdering, enableReservations, restaurantUrl]);

  const generateEmbedCode = () => {
    if (!restaurantUrl) return;

    const sizeConfig = WIDGET_SIZES.find(s => s.value === widgetSize);
    const width = sizeConfig?.width || '100%';
    const height = sizeConfig?.height || '600px';

    // Build widget URL with parameters
    const params = new URLSearchParams();
    params.append('widget', 'true');
    params.append('type', widgetType);
    params.append('theme', widgetTheme);
    if (enableOrdering) params.append('ordering', 'true');
    if (enableReservations) params.append('reservations', 'true');
    if (widgetType === 'ordering' || widgetType === 'full') {
      params.append('table', '199'); // Table specială pentru comenzi online
    }

    const widgetUrl = `${restaurantUrl}/comanda.html?${params.toString()}`;

    // Generate iframe embed code
    const iframeCode = `<iframe 
  src="${widgetUrl}" 
  width=""Width"" 
  height=""Height"" 
  frameborder="0" 
  scrolling="auto"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
  allow="payment; fullscreen"
  title="Restaurant Menu & Ordering">
</iframe>`;

    // Generate script embed code (alternative)
    const scriptCode = `<div id="restaurant-widget"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${widgetUrl}';
    iframe.width = '"Width"';
    iframe.height = '"Height"';
    iframe.frameBorder = '0';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    iframe.allow = 'payment; fullscreen';
    iframe.title = 'Restaurant Menu & Ordering';
    document.getElementById('restaurant-widget').appendChild(iframe);
  })();
</script>`;

    setEmbedCode(iframeCode);
    setPreviewUrl(widgetUrl);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const selectedSize = WIDGET_SIZES.find(s => s.value === widgetSize);

  return (
    <div className="kiosk-widget-page">
      <div className="page-header">
        <h1><Globe size={24} className="me-2" />Widget Site</h1>
        <p className="text-muted">Integrează meniul și comenzile în site-ul tău web</p>
      </div>

      <div className="widget-config-section">
        <Row>
          <Col md={8}>
            {/* Configuration */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0"><Settings size={18} className="me-2" />Configurare Widget</h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Tip Widget</Form.Label>
                    <Form.Select value={widgetType} onChange={(e) => setWidgetType(e.target.value)}>
                      {WIDGET_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Dimensiune</Form.Label>
                    <Form.Select value={widgetSize} onChange={(e) => setWidgetSize(e.target.value)}>
                      {WIDGET_SIZES.map(size => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </Form.Select>
                    {selectedSize && (
                      <Form.Text className="text-muted">
                        Lățime: {selectedSize.width} | Înălțime: {selectedSize.height}
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Temă</Form.Label>
                    <Form.Select value={widgetTheme} onChange={(e) => setWidgetTheme(e.target.value)}>
                      <option value="light">🌞 Deschis</option>
                      <option value="dark">🌙 Întunecat</option>
                      <option value="auto">🔄 Automat (după preferințe browser)</option>
                    </Form.Select>
                  </Form.Group>

                  {(widgetType === 'full' || widgetType === 'ordering') && (
                    <Form.Check
                      type="checkbox"
                      id="enable-ordering"
                      label="Activează Comandă Online"
                      checked={enableOrdering}
                      onChange={(e) => setEnableOrdering(e.target.checked)}
                      className="mb-3"
                    />
                  )}

                  {(widgetType === 'full' || widgetType === 'reservations') && (
                    <Form.Check
                      type="checkbox"
                      id="enable-reservations"
                      label="Activează Rezervări"
                      checked={enableReservations}
                      onChange={(e) => setEnableReservations(e.target.checked)}
                      className="mb-3"
                    />
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>URL Restaurant</Form.Label>
                    <Form.Control
                      type="text"
                      value={restaurantUrl}
                      onChange={(e) => setRestaurantUrl(e.target.value)}
                      placeholder="https://restaurant.yourdomain.com"
                    />
                    <Form.Text className="text-muted">
                      URL-ul de bază al restaurantului (folosit pentru generarea link-urilor)
                    </Form.Text>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>

            {/* Embed Code */}
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0"><CodeIcon size={18} className="me-2" />Cod Embed</h5>
                <Button
                  variant={copied ? 'success' : 'primary'}
                  size="sm"
                  onClick={handleCopyCode}
                >
                  {copied ? (
                    <>
                      <CheckCircle size={16} className="me-1" />Copiat!
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="me-1" />Copiază Cod
                    </>
                  )}
                </Button>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Label>Cod HTML pentru integrare în site:</Form.Label>
                  <pre className="d-block p-3 bg-light rounded" style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0 }}>
                    <code>{embedCode}</code>
                  </pre>
                  <Form.Text className="text-muted">
                    Copiază acest cod și lipește-l în pagina ta web unde vrei să apară widget-ul
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            {/* Preview */}
            <Card className="mb-4 sticky-top" style={{ top: '20px' }}>
              <Card.Header>
                <h5 className="mb-0"><Eye size={18} className="me-2" />Preview</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {previewUrl ? (
                  <div style={{ 
                    width: '100%', 
                    height: selectedSize?.height || '600px',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <iframe
                      src={previewUrl}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 'none' }}
                      title="Widget Preview"
                    />
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted">
                    <Monitor size={48} className="mb-2" />
                    <p>Preview va apărea aici</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Instructions */}
            <Card>
              <Card.Header>
                <h5 className="mb-0">📖 Instrucțiuni</h5>
              </Card.Header>
              <Card.Body>
                <ol className="small">
                  <li className="mb-2">Configurează opțiunile widget-ului</li>
                  <li className="mb-2">Copiază codul embed generat</li>
                  <li className="mb-2">Lipește codul în pagina ta web</li>
                  <li className="mb-2">Testează widget-ul în browser</li>
                  <li>Widget-ul va apărea automat pe site</li>
                </ol>
                <Alert variant="info" className="small mt-3">
                  <strong>💡 Sfat:</strong> Pentru site-uri WordPress, folosește plugin-ul "Custom HTML" sau "Code Snippets"
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Features Info */}
        <Card className="mt-4">
          <Card.Header>
            <h5 className="mb-0">✨ Funcționalități Widget</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="feature-item">
                  <h6><Smartphone size={20} className="me-2" />Meniu Digital</h6>
                  <ul className="small text-muted">
                    <li>Meniu complet cu imagini</li>
                    <li>Categorii organizate</li>
                    <li>Prețuri actualizate</li>
                    <li>Filtrare alergeni</li>
                  </ul>
                </div>
              </Col>
              <Col md={4}>
                <div className="feature-item">
                  <h6><ExternalLink size={20} className="me-2" />Comandă Online</h6>
                  <ul className="small text-muted">
                    <li>Takeaway & Delivery</li>
                    <li>Coș de cumpărături</li>
                    <li>Plăți online</li>
                    <li>Confirmare comandă</li>
                  </ul>
                </div>
              </Col>
              <Col md={4}>
                <div className="feature-item">
                  <h6><Globe size={20} className="me-2" />Rezervări</h6>
                  <ul className="small text-muted">
                    <li>Calendar interactiv</li>
                    <li>Selectare dată/ora</li>
                    <li>Număr persoane</li>
                    <li>Confirmare email</li>
                  </ul>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

