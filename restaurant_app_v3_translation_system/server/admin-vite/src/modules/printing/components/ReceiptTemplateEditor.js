"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Receipt Template Editor
 *
 * Visual editor for creating and customizing receipt templates
 * Drag & drop interface with live preview
 */
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
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
require("./ReceiptTemplateEditor.css");
var defaultTemplate = {
    name: 'Receipt Standard',
    type: 'receipt',
    paperWidth: 80,
    elements: []
};
// Available template elements palette
var elementPalette = [
    { type: 'text', label: 'Text', icon: '📝' },
    { type: 'line', label: 'Line', icon: '➖' },
    { type: 'columns', label: '2 Columns', icon: '📊' },
    { type: 'qrcode', label: 'QR Code', icon: '📱' },
    { type: "Barcode", label: 'Barcode', icon: '📊' },
    { type: 'feed', label: 'Space', icon: '⏎' },
    { type: 'logo', label: 'Logo', icon: '🖼️' }
];
// Variable placeholders for dynamic content
var variablePlaceholders = [
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
var ReceiptTemplateEditor = function (_a) {
    var _b, _c, _d;
    var initialTemplate = _a.template, onSave = _a.onSave, onCancel = _a.onCancel;
    var _e = (0, react_1.useState)(initialTemplate || defaultTemplate), template = _e[0], setTemplate = _e[1];
    var _f = (0, react_1.useState)(null), selectedElement = _f[0], setSelectedElement = _f[1];
    var _g = (0, react_1.useState)(false), showElementModal = _g[0], setShowElementModal = _g[1];
    var _h = (0, react_1.useState)(null), editingElement = _h[0], setEditingElement = _h[1];
    // Generate unique ID
    var generateId = function () { return "elem_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)); };
    // Add element to template
    var addElement = (0, react_1.useCallback)(function (type) {
        //   const { t } = useTranslation();
        var newElement = {
            id: generateId(),
            type: type,
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
        setTemplate(function (prev) { return (__assign(__assign({}, prev), { elements: __spreadArray(__spreadArray([], prev.elements, true), [newElement], false) })); });
    }, []);
    // Remove element
    var removeElement = (0, react_1.useCallback)(function (id) {
        setTemplate(function (prev) { return (__assign(__assign({}, prev), { elements: prev.elements.filter(function (el) { return el.id !== id; }) })); });
        setSelectedElement(null);
    }, []);
    // Move element up/down
    var moveElement = (0, react_1.useCallback)(function (id, direction) {
        setTemplate(function (prev) {
            var _a;
            var index = prev.elements.findIndex(function (el) { return el.id === id; });
            if (index === -1)
                return prev;
            var newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= prev.elements.length)
                return prev;
            var newElements = __spreadArray([], prev.elements, true);
            _a = [newElements[newIndex], newElements[index]], newElements[index] = _a[0], newElements[newIndex] = _a[1];
            return __assign(__assign({}, prev), { elements: newElements });
        });
    }, []);
    // Update element
    var updateElement = (0, react_1.useCallback)(function (id, updates) {
        setTemplate(function (prev) { return (__assign(__assign({}, prev), { elements: prev.elements.map(function (el) {
                return el.id === id ? __assign(__assign({}, el), updates) : el;
            }) })); });
    }, []);
    // Edit element in modal
    var openEditModal = (0, react_1.useCallback)(function (element) {
        setEditingElement(__assign({}, element));
        setShowElementModal(true);
    }, []);
    // Save element from modal
    var saveElementEdit = (0, react_1.useCallback)(function () {
        if (editingElement) {
            updateElement(editingElement.id, editingElement);
            setShowElementModal(false);
            setEditingElement(null);
        }
    }, [editingElement, updateElement]);
    // Render preview element
    var renderPreviewElement = function (element) {
        var _a, _b, _c, _d, _e;
        var style = {
            textAlign: ((_a = element.options) === null || _a === void 0 ? void 0 : _a.align) || 'left',
            fontWeight: ((_b = element.options) === null || _b === void 0 ? void 0 : _b.bold) ? 'bold' : 'normal',
            textDecoration: ((_c = element.options) === null || _c === void 0 ? void 0 : _c.underline) ? 'underline' : 'none',
            fontSize: ((_d = element.options) === null || _d === void 0 ? void 0 : _d.doubleSize) ? '1.4em' :
                ((_e = element.options) === null || _e === void 0 ? void 0 : _e.doubleHeight) ? '1.2em' : '1em'
        };
        switch (element.type) {
            case 'text':
                return <div style={style}>{element.content}</div>;
            case 'line':
                var width = template.paperWidth === 80 ? 48 : 32;
                return <div className="preview-element-text">{(element.char || '-').repeat(width)}</div>;
            case 'columns':
                return (<div className="preview-element-flex">
            <span>{element.left}</span>
            <span>{element.right}</span>
          </div>);
            case 'qrcode':
                return (<div className="preview-element-center">
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
          </div>);
            case "Barcode":
                return (<div className="preview-element-center">
            <div className="preview-element-barcode"/>
            <small>{element.data}</small>
          </div>);
            case 'feed':
                return <div className="preview-element-line" style={{ height: "".concat((element.lines || 1) * 16, "px") }}/>;
            case 'logo':
                return (<div className="preview-element-center">
            <div className="preview-element-logo">
              🖼️ Logo
            </div>
          </div>);
            default:
                return null;
        }
    };
    return (<react_bootstrap_1.Container fluid className="receipt-template-editor">
      <react_bootstrap_1.Row className="mb-3">
        <react_bootstrap_1.Col>
          <h4>📝 Receipt Template Editor</h4>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col xs="auto">
          <react_bootstrap_1.Button variant="outline-secondary" onClick={onCancel} className="me-2">
            Cancel
          </react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="primary" onClick={function () { return onSave === null || onSave === void 0 ? void 0 : onSave(template); }}>
            💾 Save Template
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      <react_bootstrap_1.Row>
        {/* Element Palette */}
        <react_bootstrap_1.Col md={3}>
          <react_bootstrap_1.Card className="mb-3">
            <react_bootstrap_1.Card.Header>📦 Elements</react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body className="p-2">
              <div className="element-palette">
                {elementPalette.map(function (item) { return (<react_bootstrap_1.Button key={item.type} variant="outline-primary" size="sm" className="element-btn m-1" onClick={function () { return addElement(item.type); }}>
                    {item.icon} {item.label}
                  </react_bootstrap_1.Button>); })}
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          <react_bootstrap_1.Card className="mb-3">
            <react_bootstrap_1.Card.Header>🔤 Variables</react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body className="p-2 preview-scrollable">
              {variablePlaceholders.map(function (v) { return (<react_bootstrap_1.Badge key={v.key} bg="secondary" className="m-1 variable-badge cursor-pointer" onClick={function () { return navigator.clipboard.writeText(v.key); }} title="Click to copy">
                  {v.label}
                </react_bootstrap_1.Badge>); })}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>⚙️ Settings</react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <react_bootstrap_1.Form.Group className="mb-2">
                <react_bootstrap_1.Form.Label>"template name"</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="text" value={template.name} onChange={function (e) { return setTemplate(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); }); }}/>
              </react_bootstrap_1.Form.Group>
              <react_bootstrap_1.Form.Group className="mb-2">
                <react_bootstrap_1.Form.Label>Type</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Select value={template.type} onChange={function (e) { return setTemplate(function (prev) { return (__assign(__assign({}, prev), { type: e.target.value })); }); }} title="Selectează tip șablon">
                  <option value="receipt">Receipt</option>
                  <option value="kitchen">Kitchen Ticket</option>
                  <option value="label">"Label"</option>
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.Form.Group>
              <react_bootstrap_1.Form.Group>
                <react_bootstrap_1.Form.Label>"paper width"</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Select value={template.paperWidth} onChange={function (e) { return setTemplate(function (prev) { return (__assign(__assign({}, prev), { paperWidth: parseInt(e.target.value) })); }); }} title="Selectează lățime hârtie">
                  <option value={58}>58mm (Small)</option>
                  <option value={80}>80mm (Standard)</option>
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.Form.Group>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>

        {/* Element List */}
        <react_bootstrap_1.Col md={4}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>📋 Template Elements</react_bootstrap_1.Card.Header>
            <react_bootstrap_1.ListGroup variant="flush" className="element-list-scrollable">
              {template.elements.length === 0 ? (<react_bootstrap_1.ListGroup.Item className="text-muted text-center py-4">
                  Click elements on the left to add them
                </react_bootstrap_1.ListGroup.Item>) : (template.elements.map(function (element, index) {
            var _a, _b;
            return (<react_bootstrap_1.ListGroup.Item key={element.id} active={selectedElement === element.id} onClick={function () { return setSelectedElement(element.id); }} className="d-flex align-items-center">
                    <span className="me-2">
                      {(_a = elementPalette.find(function (p) { return p.type === element.type; })) === null || _a === void 0 ? void 0 : _a.icon}
                    </span>
                    <span className="flex-grow-1">
                      {element.type === 'text' && ((_b = element.content) === null || _b === void 0 ? void 0 : _b.substring(0, 20))}
                      {element.type === 'line' && 'Horizontal Line'}
                      {element.type === 'columns' && "".concat(element.left, " | ").concat(element.right)}
                      {element.type === 'qrcode' && 'QR Code'}
                      {element.type === "Barcode" && 'Barcode'}
                      {element.type === 'feed' && "Space (".concat(element.lines, " lines)")}
                      {element.type === 'logo' && 'Logo'}
                    </span>
                    <div className="element-actions">
                      <react_bootstrap_1.Button variant="link" size="sm" onClick={function (e) { e.stopPropagation(); moveElement(element.id, 'up'); }} disabled={index === 0}>
                        ⬆️
                      </react_bootstrap_1.Button>
                      <react_bootstrap_1.Button variant="link" size="sm" onClick={function (e) { e.stopPropagation(); moveElement(element.id, 'down'); }} disabled={index === template.elements.length - 1}>
                        ⬇️
                      </react_bootstrap_1.Button>
                      <react_bootstrap_1.Button variant="link" size="sm" onClick={function (e) { e.stopPropagation(); openEditModal(element); }}>
                        ✏️
                      </react_bootstrap_1.Button>
                      <react_bootstrap_1.Button variant="link" size="sm" className="text-danger" onClick={function (e) { e.stopPropagation(); removeElement(element.id); }}>
                        🗑️
                      </react_bootstrap_1.Button>
                    </div>
                  </react_bootstrap_1.ListGroup.Item>);
        }))}
            </react_bootstrap_1.ListGroup>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>

        {/* Preview */}
        <react_bootstrap_1.Col md={5}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>👁️ Live Preview</react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body className="p-0">
              <div className="receipt-preview" style={{
            width: template.paperWidth === 80 ? '302px' : '232px'
        }}>
                {template.elements.map(function (element) { return (<div key={element.id} className="preview-element">
                    {renderPreviewElement(element)}
                  </div>); })}
                {template.elements.length === 0 && (<div className="text-muted text-center py-4">"preview will appear here"</div>)}
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Edit Element Modal */}
      <react_bootstrap_1.Modal show={showElementModal} onHide={function () { return setShowElementModal(false); }}>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>Edit Element</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          {editingElement && (<react_bootstrap_1.Form>
              {editingElement.type === 'text' && (<>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>Content</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control as="textarea" rows={3} value={editingElement.content || ''} onChange={function (e) { return setEditingElement(function (prev) { return prev ? __assign(__assign({}, prev), { content: e.target.value }) : null; }); }}/>
                  </react_bootstrap_1.Form.Group>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>Alignment</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Select value={((_b = editingElement.options) === null || _b === void 0 ? void 0 : _b.align) || 'left'} onChange={function (e) { return setEditingElement(function (prev) { return prev ? __assign(__assign({}, prev), { options: __assign(__assign({}, prev.options), { align: e.target.value }) }) : null; }); }} title="Selectează aliniere">
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </react_bootstrap_1.Form.Select>
                  </react_bootstrap_1.Form.Group>
                  <react_bootstrap_1.Form.Check type="checkbox" label="Bold" checked={((_c = editingElement.options) === null || _c === void 0 ? void 0 : _c.bold) || false} onChange={function (e) { return setEditingElement(function (prev) { return prev ? __assign(__assign({}, prev), { options: __assign(__assign({}, prev.options), { bold: e.target.checked }) }) : null; }); }}/>
                  <react_bootstrap_1.Form.Check type="checkbox" label="Double Size" checked={((_d = editingElement.options) === null || _d === void 0 ? void 0 : _d.doubleSize) || false} onChange={function (e) { return setEditingElement(function (prev) { return prev ? __assign(__assign({}, prev), { options: __assign(__assign({}, prev.options), { doubleSize: e.target.checked }) }) : null; }); }}/>
                </>)}

              {editingElement.type === 'columns' && (<>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>Left Text</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control value={editingElement.left || ''} onChange={function (e) { return setEditingElement(function (prev) { return prev ? __assign(__assign({}, prev), { left: e.target.value }) : null; }); }}/>
                  </react_bootstrap_1.Form.Group>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>Right Text</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control value={editingElement.right || ''} onChange={function (e) { return setEditingElement(function (prev) { return prev ? __assign(__assign({}, prev), { right: e.target.value }) : null; }); }}/>
                  </react_bootstrap_1.Form.Group>
                </>)}

              {editingElement.type === 'qrcode' && (<>
                  <react_bootstrap_1.Form.Group className="mb-3">
                    <react_bootstrap_1.Form.Label>QR Data</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control value={editingElement.data || ''} onChange={function (e) { return setEditingElement(function (prev) { return prev ? __assign(__assign({}, prev), { data: e.target.value }) : null; }); }}/>
                  </react_bootstrap_1.Form.Group>
                  <react_bootstrap_1.Form.Group>
                    <react_bootstrap_1.Form.Label>Size (1-10)</react_bootstrap_1.Form.Label>
                    <react_bootstrap_1.Form.Control type="number" min={1} max={10} value={editingElement.size || 6} onChange={function (e) { return setEditingElement(function (prev) { return prev ? __assign(__assign({}, prev), { size: parseInt(e.target.value) }) : null; }); }}/>
                  </react_bootstrap_1.Form.Group>
                </>)}

              {editingElement.type === 'feed' && (<react_bootstrap_1.Form.Group>
                  <react_bootstrap_1.Form.Label>Lines</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control type="number" min={1} max={10} value={editingElement.lines || 1} onChange={function (e) { return setEditingElement(function (prev) { return prev ? __assign(__assign({}, prev), { lines: parseInt(e.target.value) }) : null; }); }}/>
                </react_bootstrap_1.Form.Group>)}

              {editingElement.type === 'line' && (<react_bootstrap_1.Form.Group>
                  <react_bootstrap_1.Form.Label>Character</react_bootstrap_1.Form.Label>
                  <react_bootstrap_1.Form.Control value={editingElement.char || '-'} maxLength={1} onChange={function (e) { return setEditingElement(function (prev) { return prev ? __assign(__assign({}, prev), { char: e.target.value }) : null; }); }}/>
                </react_bootstrap_1.Form.Group>)}
            </react_bootstrap_1.Form>)}
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowElementModal(false); }}>
            Cancel
          </react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="primary" onClick={saveElementEdit}>
            Save Changes
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </react_bootstrap_1.Container>);
};
exports.default = ReceiptTemplateEditor;
