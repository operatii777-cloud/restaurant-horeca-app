/**
 * PHASE S5.6 - Aviz Editor Page
 * Enterprise editor page for Aviz documents
 */

import React from 'react';
import { useTipizatEditor } from '../hooks/useTipizatEditor';
import { TipizateHeaderForm } from '../components/header/TipizateHeaderForm';
import { TipizateLinesGrid } from '../components/lines/TipizateLinesGrid';
import { TipizateTotalsBar } from '../components/totals/TipizateTotalsBar';
import { TipizateActionsBar } from '../components/TipizateActionsBar';
import { TipizatePdfPreviewModal } from '../components/TipizatePdfPreviewModal';

export default function AvizEditorPage() {
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
  } = useTipizatEditor('AVIZ');

  return (
    <div className="flex flex-col gap-4 p-4">
      <TipizateHeaderForm
        type="AVIZ"
        form={form}
        setForm={setForm}
        loading={loading}
      />
      <TipizateLinesGrid
        type="AVIZ"
        lines={lines}
        setLines={setLines}
        loading={loading}
      />
      <TipizateTotalsBar
        type="AVIZ"
        totals={totals}
      />
      <TipizateActionsBar
        docType="AVIZ"
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
        docType="AVIZ"
        docId={document?.id || null}
        show={pdfOpen}
        onHide={() => setPdfOpen(false)}
        documentNumber={document?.number}
        pdfUrl={pdfUrl}
      />
    </div>
  );
}
