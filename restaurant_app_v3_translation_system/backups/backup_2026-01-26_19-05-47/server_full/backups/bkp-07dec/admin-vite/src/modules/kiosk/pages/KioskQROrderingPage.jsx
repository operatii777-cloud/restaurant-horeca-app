import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Badge, Row, Col, Form } from 'react-bootstrap';
import QRCode from 'qrcode';
import { 
  Smartphone, QrCode, Download, Printer, 
  RefreshCw, Copy, CheckCircle, Settings,
  Info, ExternalLink
} from 'lucide-react';
import './KioskQROrderingPage.css';

/**
 * KioskQROrderingPage - Meniu QR Mobile (Bar)
 * 
 * Funcționalități:
 * - Generează cod QR pentru bar (table=199)
 * - Afișează QR code mare pentru scanare
 * - Opțiuni de download/print
 * - Configurare locație (bar, terasă, etc.)
 * - Preview link pentru testare
 * 
 * Flux:
 * 1. Client scanează QR de la bar
 * 2. Se deschide comanda.html?table=199&location=bar
 * 3. Aplicația identifică clientul după dispozitiv (clientIdentifier: A, B, C...)
 * 4. Client comandă (dine-in sau takeaway)
 * 5. Comanda apare în livrare10.html (sau ospătar alocat pentru masa 199)
 */

const LOCATIONS = [
  { value: 'bar', label: '🍺 Bar', description: 'Comandă la bar' },
  { value: 'terasa', label: '☀️ Terasă', description: 'Comandă la terasă' },
  { value: 'receptie', label: '🏢 Recepție', description: 'Comandă la recepție' },
  { value: 'takeaway', label: '📦 Takeaway', description: 'Comandă takeaway' },
];

export const KioskQROrderingPage = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [location, setLocation] = useState('bar');
  const [restaurantUrl, setRestaurantUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(400);

  useEffect(() => {
    // Get current domain
    const currentUrl = window.location.origin;
    setRestaurantUrl(currentUrl);
    generateQRCode();
  }, [location, restaurantUrl]);

  const generateQRCode = async () => {
    if (!restaurantUrl) return;

    // Build URL for bar ordering
    const orderUrl = `${restaurantUrl}/comanda.html?table=199&location=${location}`;

    try {
      // Generate QR code as data URL for display
      const dataUrl = await QRCode.toDataURL(orderUrl, {
        width: qrSize,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeDataUrl(dataUrl);
      setQrCodeUrl(orderUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `qr-ordering-${location}-${Date.now()}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const handlePrintQR = () => {
    if (!qrCodeDataUrl) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - Meniu Bar</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 40px;
            }
            .qr-code {
              margin: 20px 0;
            }
            .instructions {
              margin-top: 30px;
              font-size: 18px;
              color: #333;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>Meniu Digital - ${LOCATIONS.find(l => l.value === location)?.label || 'Bar'}</h1>
            <div class="qr-code">
              <img src="${qrCodeDataUrl}" alt="QR Code" style="max-width: 600px; height: auto;" />
            </div>
            <div class="instructions">
              <p><strong>Scanează codul QR pentru a comanda!</strong></p>
              <p>Nu sunt mese libere? Comandă direct de la bar!</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrCodeUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const selectedLocation = LOCATIONS.find(l => l.value === location);

  return (
    <div className="kiosk-qr-ordering-page">
      <div className="page-header">
        <h1><Smartphone size={24} className="me-2" />Meniu QR Mobile</h1>
        <p className="text-muted">Generează cod QR pentru comenzi la bar/terasă</p>
      </div>

      <Alert variant="info" className="mb-4">
        <Info size={18} className="me-2" />
        <strong>Cum funcționează:</strong> Clienții scanează codul QR, se deschide meniul pe telefon, 
        comandă ce doresc (dine-in sau takeaway), și primesc comanda la bar. 
        Fiecare client este identificat automat după dispozitiv (Client A, B, C...).
      </Alert>

      <Row>
        <Col md={4}>
          {/* Configuration */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0"><Settings size={18} className="me-2" />Configurare</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Locație</Form.Label>
                  <Form.Select value={location} onChange={(e) => setLocation(e.target.value)}>
                    {LOCATIONS.map(loc => (
                      <option key={loc.value} value={loc.value}>
                        {loc.label} - {loc.description}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {selectedLocation?.description}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>URL Restaurant</Form.Label>
                  <Form.Control
                    type="text"
                    value={restaurantUrl}
                    onChange={(e) => setRestaurantUrl(e.target.value)}
                    placeholder="https://restaurant.yourdomain.com"
                  />
                  <Form.Text className="text-muted">
                    URL-ul de bază al restaurantului
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Dimensiune QR Code</Form.Label>
                  <Form.Select value={qrSize} onChange={(e) => setQrSize(parseInt(e.target.value))}>
                    <option value="300">Mic (300px) - pentru ecrane</option>
                    <option value="400">Mediu (400px) - recomandat</option>
                    <option value="500">Mare (500px) - pentru print</option>
                    <option value="600">Foarte Mare (600px) - pentru afișe</option>
                  </Form.Select>
                </Form.Group>

                <Button
                  variant="outline-primary"
                  onClick={generateQRCode}
                  className="w-100"
                >
                  <RefreshCw size={16} className="me-1" />Regenerează QR
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Order Info */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">ℹ️ Informații Comandă</h5>
            </Card.Header>
            <Card.Body>
              <div className="info-item mb-3">
                <strong>Masa:</strong> <Badge bg="primary">199</Badge>
                <small className="text-muted d-block mt-1">
                  Masă specială pentru comenzi bar/terasă
                </small>
              </div>
              <div className="info-item mb-3">
                <strong>Ospătar:</strong> <Badge bg="warning">Livrare 10</Badge>
                <small className="text-muted d-block mt-1">
                  Comenzile vor apărea în livrare10.html
                </small>
              </div>
              <div className="info-item">
                <strong>Identificare:</strong> <Badge bg="success">Automată</Badge>
                <small className="text-muted d-block mt-1">
                  Fiecare client primește un identificator unic (A, B, C...)
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          {/* QR Code Display */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <QrCode size={18} className="me-2" />
                Cod QR - {selectedLocation?.label || 'Bar'}
              </h5>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={handleDownloadQR}
                  disabled={!qrCodeDataUrl}
                >
                  <Download size={16} className="me-1" />Descarcă
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handlePrintQR}
                  disabled={!qrCodeDataUrl}
                >
                  <Printer size={16} className="me-1" />Printează
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="text-center">
              {qrCodeDataUrl ? (
                <>
                  <div className="qr-display mb-3">
                    <img 
                      src={qrCodeDataUrl} 
                      alt="QR Code" 
                      className="qr-image"
                      style={{ 
                        maxWidth: '100%', 
                        height: 'auto',
                        border: '8px solid white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    />
                  </div>
                  <div className="qr-info">
                    <p className="mb-2">
                      <strong>Locație:</strong> {selectedLocation?.label} - {selectedLocation?.description}
                    </p>
                    <p className="mb-2">
                      <strong>Link:</strong>{' '}
                      <a 
                        href={qrCodeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        {qrCodeUrl}
                        <ExternalLink size={14} className="ms-1" />
                      </a>
                    </p>
                    <Button
                      variant={copied ? 'success' : 'outline-secondary'}
                      size="sm"
                      onClick={handleCopyLink}
                    >
                      {copied ? (
                        <>
                          <CheckCircle size={16} className="me-1" />Link Copiat!
                        </>
                      ) : (
                        <>
                          <Copy size={16} className="me-1" />Copiază Link
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-muted py-5">
                  <QrCode size={64} className="mb-3" />
                  <p>Se generează codul QR...</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Instructions */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">📖 Instrucțiuni Utilizare</h5>
            </Card.Header>
            <Card.Body>
              <ol>
                <li className="mb-2">
                  <strong>Generează QR Code:</strong> Selectează locația (Bar, Terasă, etc.) și dimensiunea
                </li>
                <li className="mb-2">
                  <strong>Printează sau Afișează:</strong> Folosește butonul "Printează" sau "Descarcă" pentru a salva QR-ul
                </li>
                <li className="mb-2">
                  <strong>Plasează QR-ul:</strong> Lipește sau afișează QR-ul lângă bar/terasă unde clienții îl pot scana
                </li>
                <li className="mb-2">
                  <strong>Client scanează:</strong> Clientul scanează QR-ul cu telefonul, se deschide meniul
                </li>
                <li className="mb-2">
                  <strong>Client comandă:</strong> Clientul selectează produse, alege dine-in sau takeaway, și plasează comanda
                </li>
                <li>
                  <strong>Ospătar preia:</strong> Comanda apare în <code>livrare10.html</code> (sau ospătar alocat pentru masa 199)
                </li>
              </ol>
              <Alert variant="warning" className="mt-3 mb-0">
                <strong>⚠️ Important:</strong> Asigură-te că masa 199 este alocată unui ospătar în sistem (de obicei Livrare 10).
                Comenzile de la această masă vor apărea în interfața ospătarului alocat.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

