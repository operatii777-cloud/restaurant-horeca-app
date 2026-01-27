// import { useTranslation } from '@/i18n/I18nContext';
import React from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { ComingSoonPage } from '@/modules/placeholder/ComingSoonPage';

export const CatalogOnlinePage = () => {
//   const { t } = useTranslation();
  return (
    <div className="page">
      <ComingSoonPage
        title="categorii in magazinul online"
        description="Gestionare categorii pentru magazinul online - în dezvoltare"
        highlights={[
          'Gestionare categorii produse pentru e-commerce',
          'Sincronizare cu platforma online',
          'Configurare afișare și sortare',
        ]}
        nextMilestone="Implementare în Admin V4 - Sprint următor"
      />
    </div>
  );
};



