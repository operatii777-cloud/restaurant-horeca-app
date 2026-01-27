/**
 * PHASE S5.6 - Bon Consum Editor Page
 * Enterprise editor page for Bon Consum documents
 */

import React from 'react';
import { useTipizatEditor } from '../hooks/useTipizatEditor';
import { TipizateHeaderForm } from '../components/header/TipizateHeaderForm';
import { TipizateLinesGrid } from '../components/lines/TipizateLinesGrid';
import { TipizateTotalsBar } from '../components/totals/TipizateTotalsBar';
import { TipizateActionsBar } from '../components/TipizateActionsBar';
import { TipizatePdfPreviewModal } from '../components/TipizatePdfPreviewModal';

export default function BonConsumEditorPage() {
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
  } = useTipizatEditor('BON_CONSUM');

  return (
    <div className="flex flex-col gap-4 p-4">
      <TipizateHeaderForm
        type="BON_CONSUM"
        form={form}
        setForm={setForm}
        loading={loading}
      />
      <TipizateLinesGrid
        type="BON_CONSUM"
        lines={lines}
        setLines={setLines}
        loading={loading}
      />
      <TipizateTotalsBar
        type="BON_CONSUM"
        totals={totals}
      />
      <TipizateActionsBar
        docType="BON_CONSUM"
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
        docType="BON_CONSUM"
        docId={document?.id || null}
        show={pdfOpen}
        onHide={() => setPdfOpen(false)}
        documentNumber={document?.number}
        pdfUrl={pdfUrl}
      />
    </div>
  );
}
