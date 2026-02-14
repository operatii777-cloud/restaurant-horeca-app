"use strict";
/**
 * PHASE S5.2 - Tipizate Actions Bar
 * Action buttons bar for tipizate documents (Save, Sign, Lock, PDF)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipizateActionsBar = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var TipizateStatusBadge_1 = require("./TipizateStatusBadge");
var TipizateActionsBar = function (_a) {
    var docType = _a.docType, docId = _a.docId, status = _a.status, onSave = _a.onSave, onSign = _a.onSign, onLock = _a.onLock, onPdf = _a.onPdf, _b = _a.saving, saving = _b === void 0 ? false : _b, _c = _a.signing, signing = _c === void 0 ? false : _c, _d = _a.locking, locking = _d === void 0 ? false : _d, _e = _a.disabled, disabled = _e === void 0 ? false : _e;
    var canEdit = status === 'DRAFT';
    var canSign = status === 'DRAFT' || status === 'VALIDATED';
    var canLock = status === 'SIGNED';
    return (<div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
      <div>
        <TipizateStatusBadge_1.TipizateStatusBadge status={status} size="md"/>
      </div>

      <react_bootstrap_1.ButtonGroup>
        {/* Preview PDF button - available even for drafts */}
        {docType === 'NIR' && (<react_bootstrap_1.Button variant="outline-info" onClick={onPdf} disabled={disabled || !docId} title="Preview PDF înainte de salvare">
            <i className="bi bi-eye me-1"></i>
            Preview PDF
          </react_bootstrap_1.Button>)}

        {canEdit && onSave && (<react_bootstrap_1.Button variant="primary" onClick={onSave} disabled={disabled || saving}>
            {saving ? (<>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Salvează...
              </>) : (<>
                <i className="bi bi-save me-1"></i>
                Salvează
              </>)}
          </react_bootstrap_1.Button>)}

        {canSign && onSign && (<react_bootstrap_1.Button variant="success" onClick={onSign} disabled={disabled || signing || !docId}>
            {signing ? (<>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Semnează...
              </>) : (<>
                <i className="bi bi-pen me-1"></i>
                Semnează
              </>)}
          </react_bootstrap_1.Button>)}

        {canLock && onLock && (<react_bootstrap_1.Button variant="warning" onClick={onLock} disabled={disabled || locking || !docId}>
            {locking ? (<>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Blochează...
              </>) : (<>
                <i className="bi bi-lock me-1"></i>
                Blochează
              </>)}
          </react_bootstrap_1.Button>)}

        {docId && onPdf && (<react_bootstrap_1.Button variant="outline-primary" onClick={onPdf} disabled={disabled}>
            <i className="bi bi-file-pdf me-1"></i>
            PDF
          </react_bootstrap_1.Button>)}

      </react_bootstrap_1.ButtonGroup>
    </div>);
};
exports.TipizateActionsBar = TipizateActionsBar;
