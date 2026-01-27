// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.6 - Transfer Editor Page
 * Enterprise editor page for Transfer documents
 */

import React from 'react';
import { useTipizatEditor } from '../hooks/useTipizatEditor';
import { TipizateHeaderForm } from '../components/header/TipizateHeaderForm';
import { TipizateLinesGrid } from '../components/lines/TipizateLinesGrid';
import { TipizateTotalsBar } from '../components/totals/TipizateTotalsBar';
import { TipizateActionsBar } from '../components/TipizateActionsBar';
import { TipizatePdfPreviewModal } from '../components/TipizatePdfPreviewModal';
import { LocationSwitcher } from '@/modules/layout/components/LocationSwitcher';

export default function TransferEditorPage() {
//   const { t } = useTranslation();
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
  } = useTipizatEditor('TRANSFER');

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Location Switcher pentru Transferuri Gestiuni */}
      <div className="flex justify-end items-center gap-2 mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">"Locație:"</span>
        <LocationSwitcher />
      </div>

      <TipizateHeaderForm
        type="TRANSFER"
        form={form}
        setForm={setForm}
        loading={loading}
      />
      <TipizateLinesGrid
        type="TRANSFER"
        lines={lines}
        setLines={setLines}
        loading={loading}
      />
      <TipizateTotalsBar
        type="TRANSFER"
        totals={totals}
      />
      <TipizateActionsBar
        docType="TRANSFER"
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
          docType="TRANSFER"
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
