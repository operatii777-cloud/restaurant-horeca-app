// components/PdfSettingsPanel.tsx
import { useState } from 'react';
import { Card, Form, Row, Col, Button, Accordion, Badge } from 'react-bootstrap';
import { usePdfSettings, type PdfSettings } from '../hooks/usePdfSettings';
import './PdfSettingsPanel.css';

interface PdfSettingsPanelProps {
  onSettingsChange?: (settings: PdfSettings) => void;
}

export const PdfSettingsPanel = ({ onSettingsChange }: PdfSettingsPanelProps) => {
  const { settings, loading, updateSettings, resetSettings } = usePdfSettings();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = async (field: keyof PdfSettings, value: any) => {
    try {
      setSaving(true);
      setFeedback(null);
      await updateSettings({ [field]: value });
      if (onSettingsChange) {
        onSettingsChange({ ...settings, [field]: value });
      }
      setFeedback({ type: 'success', message: 'Setări salvate!' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Eroare la salvare' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Sigur vrei să resetezi toate setările la valorile implicite?')) {
      return;
    }
    
    try {
      setSaving(true);
      await resetSettings();
      setFeedback({ type: 'success', message: 'Setări resetate la valorile implicite' });
    } catch (err) {
      setFeedback({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Eroare la resetare' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="pdf-settings-panel">
        <Card.Body className="text-center">
          <span className="spinner-border spinner-border-sm me-2" />
          Se încarcă setările...
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="pdf-settings-panel">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <i className="fas fa-cog me-2" />
          <strong>Setări PDF</strong>
        </div>
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={handleReset}
          disabled={saving}
        >
          <i className="fas fa-undo me-1" />
          Resetează
        </Button>
      </Card.Header>

      <Card.Body>
        {feedback && (
          <div className={`alert alert-${feedback.type === 'success' ? 'success' : 'danger'} alert-dismissible`}>
            {feedback.message}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setFeedback(null)}
            />
          </div>
        )}

        <Accordion defaultActiveKey="0">
          {/* Font Settings */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <i className="fas fa-font me-2" />
              Font & Tipografie
            </Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-3">
                <Form.Label>Familie Font</Form.Label>
                <Form.Select
                  value={settings.fontFamily}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                  disabled={saving}
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                  <option value="Helvetica, sans-serif">Helvetica</option>
                  <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                </Form.Select>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dimensiune Font (px)</Form.Label>
                    <Form.Control
                      type="number"
                      min="8"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                      disabled={saving}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Grosime Font</Form.Label>
                    <Form.Select
                      value={settings.fontWeight}
                      onChange={(e) => handleChange('fontWeight', e.target.value)}
                      disabled={saving}
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>

          {/* Color Scheme */}
          <Accordion.Item eventKey="1">
            <Accordion.Header>
              <i className="fas fa-palette me-2" />
              Culori
            </Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Culoare Header</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="color"
                        value={settings.headerColor}
                        onChange={(e) => handleChange('headerColor', e.target.value)}
                        disabled={saving}
                        style={{ width: '60px' }}
                      />
                      <Form.Control
                        type="text"
                        value={settings.headerColor}
                        onChange={(e) => handleChange('headerColor', e.target.value)}
                        disabled={saving}
                        placeholder="#2c3e50"
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Culoare Fundal</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                        disabled={saving}
                        style={{ width: '60px' }}
                      />
                      <Form.Control
                        type="text"
                        value={settings.backgroundColor}
                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                        disabled={saving}
                        placeholder="#ffffff"
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Culoare Text</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="color"
                        value={settings.textColor}
                        onChange={(e) => handleChange('textColor', e.target.value)}
                        disabled={saving}
                        style={{ width: '60px' }}
                      />
                      <Form.Control
                        type="text"
                        value={settings.textColor}
                        onChange={(e) => handleChange('textColor', e.target.value)}
                        disabled={saving}
                        placeholder="#333333"
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Culoare Preț</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="color"
                        value={settings.priceColor}
                        onChange={(e) => handleChange('priceColor', e.target.value)}
                        disabled={saving}
                        style={{ width: '60px' }}
                      />
                      <Form.Control
                        type="text"
                        value={settings.priceColor}
                        onChange={(e) => handleChange('priceColor', e.target.value)}
                        disabled={saving}
                        placeholder="#27ae60"
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>

          {/* Layout */}
          <Accordion.Item eventKey="2">
            <Accordion.Header>
              <i className="fas fa-th-large me-2" />
              Layout & Format
            </Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Structură Layout</Form.Label>
                    <Form.Select
                      value={settings.layout}
                      onChange={(e) => handleChange('layout', e.target.value)}
                      disabled={saving}
                    >
                      <option value="single-column">O Coloană</option>
                      <option value="two-column">Două Coloane</option>
                      <option value="three-column">Trei Coloane</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Orientare Pagină</Form.Label>
                    <Form.Select
                      value={settings.orientation}
                      onChange={(e) => handleChange('orientation', e.target.value)}
                      disabled={saving}
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dimensiune Pagină</Form.Label>
                    <Form.Select
                      value={settings.pageSize}
                      onChange={(e) => handleChange('pageSize', e.target.value)}
                      disabled={saving}
                    >
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                      <option value="A5">A5</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Template</Form.Label>
                    <Form.Select
                      value={settings.template}
                      onChange={(e) => handleChange('template', e.target.value)}
                      disabled={saving}
                    >
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="elegant">Elegant</option>
                      <option value="minimal">Minimal</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>

          {/* Spacing */}
          <Accordion.Item eventKey="3">
            <Accordion.Header>
              <i className="fas fa-arrows-alt me-2" />
              Spațiere & Margini
            </Accordion.Header>
            <Accordion.Body>
              <Form.Label>Margini Pagină (mm)</Form.Label>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Sus</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="50"
                      value={settings.marginTop}
                      onChange={(e) => handleChange('marginTop', parseInt(e.target.value))}
                      disabled={saving}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Jos</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="50"
                      value={settings.marginBottom}
                      onChange={(e) => handleChange('marginBottom', parseInt(e.target.value))}
                      disabled={saving}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Stânga</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="50"
                      value={settings.marginLeft}
                      onChange={(e) => handleChange('marginLeft', parseInt(e.target.value))}
                      disabled={saving}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Dreapta</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="50"
                      value={settings.marginRight}
                      onChange={(e) => handleChange('marginRight', parseInt(e.target.value))}
                      disabled={saving}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Spațiu între Categorii (px)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="50"
                      value={settings.categorySpacing}
                      onChange={(e) => handleChange('categorySpacing', parseInt(e.target.value))}
                      disabled={saving}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Spațiu între Produse (px)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="30"
                      value={settings.productSpacing}
                      onChange={(e) => handleChange('productSpacing', parseInt(e.target.value))}
                      disabled={saving}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>

          {/* Content Display */}
          <Accordion.Item eventKey="4">
            <Accordion.Header>
              <i className="fas fa-eye me-2" />
              Afișare Conținut
            </Accordion.Header>
            <Accordion.Body>
              <Form.Check
                type="switch"
                id="show-prices"
                label="Afișează Prețuri"
                checked={settings.showPrices}
                onChange={(e) => handleChange('showPrices', e.target.checked)}
                disabled={saving}
                className="mb-3"
              />

              <Form.Check
                type="switch"
                id="show-descriptions"
                label="Afișează Descrieri Produse"
                checked={settings.showDescriptions}
                onChange={(e) => handleChange('showDescriptions', e.target.checked)}
                disabled={saving}
                className="mb-3"
              />

              <Form.Check
                type="switch"
                id="show-images"
                label="Afișează Imagini"
                checked={settings.showImages}
                onChange={(e) => handleChange('showImages', e.target.checked)}
                disabled={saving}
                className="mb-3"
              />

              <div className="alert alert-info small">
                <i className="fas fa-info-circle me-1" />
                Aceste setări se aplică la regenerarea PDF-ului
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Card.Body>
    </Card>
  );
};
