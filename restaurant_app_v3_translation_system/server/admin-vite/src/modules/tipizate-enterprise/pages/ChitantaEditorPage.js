"use strict";
/**
 * PHASE S5.6 - Chitanta Editor Page
 * Enterprise editor page for Chitanta documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChitantaEditorPage;
var react_1 = require("react");
var useTipizatEditor_1 = require("../hooks/useTipizatEditor");
var TipizateHeaderForm_1 = require("../components/header/TipizateHeaderForm");
var TipizateLinesGrid_1 = require("../components/lines/TipizateLinesGrid");
var TipizateTotalsBar_1 = require("../components/totals/TipizateTotalsBar");
var TipizateActionsBar_1 = require("../components/TipizateActionsBar");
var TipizatePdfPreviewModal_1 = require("../components/TipizatePdfPreviewModal");
function ChitantaEditorPage() {
    var _a = (0, useTipizatEditor_1.useTipizatEditor)('CHITANTA'), form = _a.form, setForm = _a.setForm, lines = _a.lines, setLines = _a.setLines, totals = _a.totals, save = _a.save, sign = _a.sign, lock = _a.lock, pdf = _a.pdf, loading = _a.loading, saving = _a.saving, signing = _a.signing, locking = _a.locking, isNew = _a.isNew, document = _a.document, pdfUrl = _a.pdfUrl, pdfOpen = _a.pdfOpen, setPdfOpen = _a.setPdfOpen;
    return (<div className="flex flex-col gap-4 p-4">
      <TipizateHeaderForm_1.TipizateHeaderForm type="CHITANTA" form={form} setForm={setForm} loading={loading}/>
      <TipizateLinesGrid_1.TipizateLinesGrid type="CHITANTA" lines={lines} setLines={setLines} loading={loading}/>
      <TipizateTotalsBar_1.TipizateTotalsBar type="CHITANTA" totals={totals}/>
      <TipizateActionsBar_1.TipizateActionsBar docType="CHITANTA" docId={(document === null || document === void 0 ? void 0 : document.id) || null} status={(document === null || document === void 0 ? void 0 : document.status) || 'DRAFT'} onSave={save} onSign={sign} onLock={lock} onPdf={pdf} saving={saving} signing={signing} locking={locking}/>
      {pdfUrl && (<TipizatePdfPreviewModal_1.TipizatePdfPreviewModal docType="CHITANTA" docId={(document === null || document === void 0 ? void 0 : document.id) || null} show={pdfOpen} onHide={function () { return setPdfOpen(false); }} documentNumber={document === null || document === void 0 ? void 0 : document.number} pdfUrl={pdfUrl}/>)}
    </div>);
}
