"use strict";
/**
 * HelpButton - Component reutilizabil pentru butonul de help
 *
 * Folosit în toate paginile admin-vite pentru a afișa informații de ajutor
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpButton = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./HelpButton.css");
var HelpButton = function (_a) {
    var _b = _a.title, title = _b === void 0 ? 'Ajutor' : _b, content = _a.content, _c = _a.size, size = _c === void 0 ? 'sm' : _c, _d = _a.variant, variant = _d === void 0 ? 'outline-info' : _d, _e = _a.className, className = _e === void 0 ? '' : _e;
    var _f = (0, react_1.useState)(false), showHelpModal = _f[0], setShowHelpModal = _f[1];
    return (<>
      <react_bootstrap_1.Button variant={variant} size={size === 'md' ? 'sm' : size} onClick={function () { return setShowHelpModal(true); }} className={"help-button ".concat(className)}>
        <i className="fas fa-question-circle me-2"></i>
        Ajutor
      </react_bootstrap_1.Button>

      <react_bootstrap_1.Modal show={showHelpModal} onHide={function () { return setShowHelpModal(false); }} size="lg" className="help-modal-global">
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            <i className="fas fa-question-circle me-2"></i>
            {title}
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <div className="help-content-global">
            {content}
          </div>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowHelpModal(false); }}>Închide</react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </>);
};
exports.HelpButton = HelpButton;
