/**
 * PHASE S5.6 - Factură Editor Page
 * Enterprise editor page for Factură documents
 */

import React from 'react';
import { useTipizatEditor } from '../hooks/useTipizatEditor';
import { TipizateHeaderForm } from '../components/header/TipizateHeaderForm';
import { TipizateLinesGrid } from '../components/lines/TipizateLinesGrid';
import { TipizateTotalsBar } from '../components/totals/TipizateTotalsBar';
import { TipizateActionsBar } from '../components/TipizateActionsBar';
import { TipizatePdfPreviewModal } from '../components/TipizatePdfPreviewModal';

export default function FacturaEditorPage() {
  const {
    form,
    setForm,
    lines,
    setLines,
    totals,
    save,
    sign,
    lock,
    pdf,
    loading,
    saving,
    signing,
    locking,
    isNew,
    document,
    pdfUrl,
    pdfOpen,
    setPdfOpen,
  } = useTipizatEditor('FACTURA');

  return (
    <div className="flex flex-col gap-4 p-4">
      <TipizateHeaderForm
        type="FACTURA"
        form={form}
        setForm={setForm}
        loading={loading}
      />
      <TipizateLinesGrid
        type="FACTURA"
        lines={lines}
        setLines={setLines}
        loading={loading}
      />
      <TipizateTotalsBar
        type="FACTURA"
        totals={totals}
      />
      <TipizateActionsBar
        docType="FACTURA"
        docId={document?.id || null}
        status={document?.status || 'DRAFT'}
        onSave={save}
        onSign={sign}
        onLock={lock}
        onPdf={pdf}
        saving={saving}
        signing={signing}
        locking={locking}
      />
      <TipizatePdfPreviewModal
        docType="FACTURA"
        docId={document?.id || null}
        show={pdfOpen}
        onHide={() => setPdfOpen(false)}
        documentNumber={document?.number}
        pdfUrl={pdfUrl}
      />
    </div>
  );
}
