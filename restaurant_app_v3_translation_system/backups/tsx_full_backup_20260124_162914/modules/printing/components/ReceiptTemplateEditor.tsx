// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Receipt Template Editor
 * 
 * Visual editor for creating and customizing receipt templates
 * Drag & drop interface with live preview
 */

import React, { useState, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Badge, Modal } from 'react-bootstrap';
import './ReceiptTemplateEditor.css';

// Template element types
type ElementType = 'text' | 'line' | 'columns' | 'qrcode' | "Barcode" | 'feed' | 'logo';

interface TemplateElement {
  id: string;
  type: ElementType;
  content?: string;
  left?: string;
  right?: string;
  data?: string;
  size?: number;
  lines?: number;
  char?: string;
  options?: {
    align?: 'left' | 'center' | 'right';
    bold?: boolean;
    underline?: boolean;
    doubleHeight?: boolean;
    doubleWidth?: boolean;
    doubleSize?: boolean;
  };
}

interface ReceiptTemplate {
  id?: number;
  name: string;
  type: 'receipt' | 'kitchen' | "Label";
  paperWidth: 58 | 80;
  elements: TemplateElement[];
}

interface ReceiptTemplateEditorProps {
  template?: ReceiptTemplate;
  onSave?: (template: ReceiptTemplate) => void;
  onCancel?: () => void;
}

const defaultTemplate: ReceiptTemplate = {
  name: 'Receipt Standard',
  type: 'receipt',
  paperWidth: 80,
  elements: []
};

// Available template elements palette
const elementPalette: { type: ElementType; label: string; icon: string }[] = [
  { type: 'text', label: 'Text', icon: '📝' },
  { type: 'line', label: 'Line', icon: '➖' },
  { type: 'columns', label: '2 Columns', icon: '📊' },
  { type: 'qrcode', label: 'QR Code', icon: '📱' },
  { type: "Barcode", label: 'Barcode', icon: '📊' },
  { type: 'feed', label: 'Space', icon: '⏎' },
  { type: 'logo', label: 'Logo', icon: '🖼️' }
];

// Variable placeholders for dynamic content
const variablePlaceholders = [
  { key: '{{order_id}}', label: 'Order ID' },
  { key: '{{date}}', label: 'Date' },
  { key: '{{time}}', label: 'Time' },
  { key: '{{table}}', label: 'Table Number' },
  { key: '{{customer}}', label: 'Customer Name' },
  { key: '{{total}}', label: 'Total' },
  { key: '{{subtotal}}', label: 'Subtotal' },
  { key: '{{tax}}', label: 'Tax' },
  { key: '{{discount}}', label: 'Discount' },
  { key: '{{payment_method}}', label: 'Payment Method' },
  { key: '{{restaurant_name}}', label: 'Restaurant Name' },
  { key: '{{restaurant_address}}', label: 'Restaurant Address' },
  { key: '{{items_loop}}', label: 'Items Loop' }
];

const ReceiptTemplateEditor: React.FC<ReceiptTemplateEditorProps> = ({
  template: initialTemplate,
  onSave,
  onCancel
}) => {
  const [template, setTemplate] = useState<ReceiptTemplate>(initialTemplate || defaultTemplate);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showElementModal, setShowElementModal] = useState(false);
  const [editingElement, setEditingElement] = useState<TemplateElement | null>(null);

  // Generate unique ID
  const generateId = () => `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add element to template
  const addElement = useCallback((type: ElementType) => {
//   const { t } = useTranslation();
    const newElement: TemplateElement = {
      id: generateId(),
      type,
      options: { align: 'left' }
    };

    switch (type) {
      case 'text':
        newElement.content = 'Enter text...';
        break;
      case 'line':
        newElement.char = '-';
        break;
      case 'columns':
        newElement.left = 'Left';
        newElement.right = 'Right';
        break;
      case 'qrcode':
        newElement.data = 'https://example.com';
        newElement.size = 6;
        break;
      case "Barcode":
        newElement.data = '123456789';
        break;
      case 'feed':
        newElement.lines = 1;
        break;
      case 'logo':
        newElement.content = '{{restaurant_logo}}';
        break;
    }

    setTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  }, []);

  // Remove element
  const removeElement = useCallback((id: string) => {
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id)
    }));
    setSelectedElement(null);
  }, []);

  // Move element up/down
  const moveElement = useCallback((id: string, direction: 'up' | 'down') => {
    setTemplate(prev => {
      const index = prev.elements.findIndex(el => el.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.elements.length) return prev;
      
      const newElements = [...prev.elements];
      [newElements[index], newElements[newIndex]] = [newElements[newIndex], newElements[index]];
      
      return { ...prev, elements: newElements };
    });
  }, []);

  // Update element
  const updateElement = useCallback((id: string, updates: Partial<TemplateElement>) => {
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    }));
  }, []);

  // Edit element in modal
  const openEditModal = useCallback((element: TemplateElement) => {
    setEditingElement({ ...element });
    setShowElementModal(true);
  }, []);

  // Save element from modal
  const saveElementEdit = useCallback(() => {
    if (editingElement) {
      updateElement(editingElement.id, editingElement);
      setShowElementModal(false);
      setEditingElement(null);
    }
  }, [editingElement, updateElement]);

  // Render preview element
  const renderPreviewElement = (element: TemplateElement) => {
    const style: React.CSSProperties = {
      textAlign: element.options?.align || 'left',
      fontWeight: element.options?.bold ? 'bold' : 'normal',
      textDecoration: element.options?.underline ? 'underline' : 'none',
      fontSize: element.options?.doubleSize ? '1.4em' : 
                element.options?.doubleHeight ? '1.2em' : '1em'
    };

    switch (element.type) {
      case 'text':
        return <div style={style}>{element.content}</div>;
      case 'line':
        const width = template.paperWidth === 80 ? 48 : 32;
        return <div className="preview-element-text">{(element.char || '-').repeat(width)}</div>;
      case 'columns':
        return (
          <div className="preview-element-flex">
            <span>{element.left}</span>
            <span>{element.right}</span>
          </div>
        );
      case 'qrcode':
        return (
          <div className="preview-element-center">
            <div style={{ 
              width: (element.size || 6) * 20, 
              height: (element.size || 6) * 20, 
              background: '#f0f0f0', 
              border: '1px solid #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              📱 QR
            </div>
            <small>{element.data}</small>
          </div>
        );
      case "Barcode":
        return (
          <div className="preview-element-center">
            <div className="preview-element-barcode" />
            <small>{element.data}</small>
          </div>
        );
      case 'feed':
        return <div className="preview-element-line" style={{ height: `${(element.lines || 1) * 16}px` }} />;
      case 'logo':
        return (
          <div className="preview-element-center">
            <div className="preview-element-logo">
              🖼️ Logo
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Container fluid className="receipt-template-editor">
      <Row className="mb-3">
        <Col>
          <h4>📝 Receipt Template Editor</h4>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" onClick={onCancel} className="me-2">
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onSave?.(template)}>
            💾 Save Template
          </Button>
        </Col>
      </Row>

      <Row>
        {/* Element Palette */}
        <Col md={3}>
          <Card className="mb-3">
            <Card.Header>📦 Elements</Card.Header>
            <Card.Body className="p-2">
              <div className="element-palette">
                {elementPalette.map(item => (
                  <Button
                    key={item.type}
                    variant="outline-primary"
                    size="sm"
                    className="element-btn m-1"
                    onClick={() => addElement(item.type)}
                  >
                    {item.icon} {item.label}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header>🔤 Variables</Card.Header>
            <Card.Body className="p-2 preview-scrollable">
              {variablePlaceholders.map(v => (
                <Badge 
                  key={v.key} 
                  bg="secondary" 
                  className="m-1 variable-badge cursor-pointer"
                  onClick={() => navigator.clipboard.writeText(v.key)}
                  title="Click to copy"
                >
                  {v.label}
                </Badge>
              ))}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>⚙️ Settings</Card.Header>
            <Card.Body>
              <Form.Group className="mb-2">
                <Form.Label>"template name"</Form.Label>
                <Form.Control
                  type="text"
                  value={template.name}
                  onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={template.type}
                  onChange={(e) => setTemplate(prev => ({ ...prev, type: e.target.value as any }))}
                  title="Selectează tip șablon"
                >
                  <option value="receipt">Receipt</option>
                  <option value="kitchen">Kitchen Ticket</option>
                  <option value="label">"Label"</option>
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>"paper width"</Form.Label>
                <Form.Select
                  value={template.paperWidth}
                  onChange={(e) => setTemplate(prev => ({ ...prev, paperWidth: parseInt(e.target.value) as 58 | 80 }))}
                  title="Selectează lățime hârtie"
                >
                  <option value={58}>58mm (Small)</option>
                  <option value={80}>80mm (Standard)</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* Element List */}
        <Col md={4}>
          <Card>
            <Card.Header>📋 Template Elements</Card.Header>
            <ListGroup variant="flush" className="element-list-scrollable">
              {template.elements.length === 0 ? (
                <ListGroup.Item className="text-muted text-center py-4">
                  Click elements on the left to add them
                </ListGroup.Item>
              ) : (
                template.elements.map((element, index) => (
                  <ListGroup.Item
                    key={element.id}
                    active={selectedElement === element.id}
                    onClick={() => setSelectedElement(element.id)}
                    className="d-flex align-items-center"
                  >
                    <span className="me-2">
                      {elementPalette.find(p => p.type === element.type)?.icon}
                    </span>
                    <span className="flex-grow-1">
                      {element.type === 'text' && element.content?.substring(0, 20)}
                      {element.type === 'line' && 'Horizontal Line'}
                      {element.type === 'columns' && `${element.left} | ${element.right}`}
                      {element.type === 'qrcode' && 'QR Code'}
                      {element.type === "Barcode" && 'Barcode'}
                      {element.type === 'feed' && `Space (${element.lines} lines)`}
                      {element.type === 'logo' && 'Logo'}
                    </span>
                    <div className="element-actions">
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); moveElement(element.id, 'up'); }}
                        disabled={index === 0}
                      >
                        ⬆️
                      </Button>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); moveElement(element.id, 'down'); }}
                        disabled={index === template.elements.length - 1}
                      >
                        ⬇️
                      </Button>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); openEditModal(element); }}
                      >
                        ✏️
                      </Button>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-danger"
                        onClick={(e) => { e.stopPropagation(); removeElement(element.id); }}
                      >
                        🗑️
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>

        {/* Preview */}
        <Col md={5}>
          <Card>
            <Card.Header>👁️ Live Preview</Card.Header>
            <Card.Body className="p-0">
              <div 
                className="receipt-preview"
                style={{ 
                  width: template.paperWidth === 80 ? '302px' : '232px'
                }}
              >
                {template.elements.map(element => (
                  <div key={element.id} className="preview-element">
                    {renderPreviewElement(element)}
                  </div>
                ))}
                {template.elements.length === 0 && (
                  <div className="text-muted text-center py-4">"preview will appear here"</div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Element Modal */}
      <Modal show={showElementModal} onHide={() => setShowElementModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Element</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingElement && (
            <Form>
              {editingElement.type === 'text' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Content</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={editingElement.content || ''}
                      onChange={(e) => setEditingElement(prev => prev ? { ...prev, content: e.target.value } : null)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Alignment</Form.Label>
                    <Form.Select
                      value={editingElement.options?.align || 'left'}
                      onChange={(e) => setEditingElement(prev => prev ? {
                        ...prev,
                        options: { ...prev.options, align: e.target.value as any }
                      } : null)}
                      title="Selectează aliniere"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="Bold"
                    checked={editingElement.options?.bold || false}
                    onChange={(e) => setEditingElement(prev => prev ? { 
                      ...prev, 
                      options: { ...prev.options, bold: e.target.checked } 
                    } : null)}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Double Size"
                    checked={editingElement.options?.doubleSize || false}
                    onChange={(e) => setEditingElement(prev => prev ? { 
                      ...prev, 
                      options: { ...prev.options, doubleSize: e.target.checked } 
                    } : null)}
                  />
                </>
              )}

              {editingElement.type === 'columns' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Left Text</Form.Label>
                    <Form.Control
                      value={editingElement.left || ''}
                      onChange={(e) => setEditingElement(prev => prev ? { ...prev, left: e.target.value } : null)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Right Text</Form.Label>
                    <Form.Control
                      value={editingElement.right || ''}
                      onChange={(e) => setEditingElement(prev => prev ? { ...prev, right: e.target.value } : null)}
                    />
                  </Form.Group>
                </>
              )}

              {editingElement.type === 'qrcode' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>QR Data</Form.Label>
                    <Form.Control
                      value={editingElement.data || ''}
                      onChange={(e) => setEditingElement(prev => prev ? { ...prev, data: e.target.value } : null)}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Size (1-10)</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      max={10}
                      value={editingElement.size || 6}
                      onChange={(e) => setEditingElement(prev => prev ? { ...prev, size: parseInt(e.target.value) } : null)}
                    />
                  </Form.Group>
                </>
              )}

              {editingElement.type === 'feed' && (
                <Form.Group>
                  <Form.Label>Lines</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={10}
                    value={editingElement.lines || 1}
                    onChange={(e) => setEditingElement(prev => prev ? { ...prev, lines: parseInt(e.target.value) } : null)}
                  />
                </Form.Group>
              )}

              {editingElement.type === 'line' && (
                <Form.Group>
                  <Form.Label>Character</Form.Label>
                  <Form.Control
                    value={editingElement.char || '-'}
                    maxLength={1}
                    onChange={(e) => setEditingElement(prev => prev ? { ...prev, char: e.target.value } : null)}
                  />
                </Form.Group>
              )}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowElementModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveElementEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReceiptTemplateEditor;




