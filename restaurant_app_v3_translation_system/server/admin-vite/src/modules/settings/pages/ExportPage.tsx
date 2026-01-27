// import { useTranslation } from '@/i18n/I18nContext';
import React from 'react';
import { ComingSoonPage } from '@/modules/placeholder/ComingSoonPage';

export const ExportPage = () => {
//   const { t } = useTranslation();
  return (
    <div className="page">
      <ComingSoonPage
        title="Export Date"
        description="Export date din sistem - în dezvoltare"
        highlights={[
          'Export rapoarte Excel/CSV',
          'Export date pentru contabilitate',
          'Export pentru integrare cu alte sisteme',
        ]}
        nextMilestone="Implementare în Admin V4 - Sprint următor"
      />
    </div>
  );
};

