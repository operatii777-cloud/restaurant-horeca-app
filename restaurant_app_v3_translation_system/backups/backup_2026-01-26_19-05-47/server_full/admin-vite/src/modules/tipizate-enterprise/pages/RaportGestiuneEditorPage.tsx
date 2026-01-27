// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.6 - Raport Gestiune Editor Page
 * Enterprise editor page for Raport Gestiune documents
 */

import React from 'react';
import { useTipizatEditor } from '../hooks/useTipizatEditor';
import { TipizateHeaderForm } from '../components/header/TipizateHeaderForm';
import { TipizateLinesGrid } from '../components/lines/TipizateLinesGrid';
import { TipizateTotalsBar } from '../components/totals/TipizateTotalsBar';
import { TipizateActionsBar } from '../components/TipizateActionsBar';
import { TipizatePdfPreviewModal } from '../components/TipizatePdfPreviewModal';


export default function RaportGestiuneEditorPage() {
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
  } = useTipizatEditor('RAPORT_GESTIUNE');

  return (
    <div className="flex flex-col gap-4 p-4">
      <TipizateHeaderForm
        type="RAPORT_GESTIUNE"
        form={form}
        setForm={setForm}
        loading={loading}
      />
      <TipizateLinesGrid
        type="RAPORT_GESTIUNE"
        lines={lines}
        setLines={setLines}
        loading={loading}
      />
      <TipizateTotalsBar
        type="RAPORT_GESTIUNE"
        totals={totals}
      />
      <TipizateActionsBar
        docType="RAPORT_GESTIUNE"
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
      {pdfUrl && (
        <TipizatePdfPreviewModal
          docType="RAPORT_GESTIUNE"
          docId={document?.id || null}
          show={pdfOpen}
          onHide={() => setPdfOpen(false)}
          documentNumber={document?.number}
          pdfUrl={pdfUrl}
        />
      )}
    </div>
  );
}
