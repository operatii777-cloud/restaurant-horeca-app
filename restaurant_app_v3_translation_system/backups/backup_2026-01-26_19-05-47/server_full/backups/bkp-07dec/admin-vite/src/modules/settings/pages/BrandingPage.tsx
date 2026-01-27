import React from 'react';
import { ComingSoonPage } from '@/modules/placeholder/ComingSoonPage';

export const BrandingPage = () => {
  return (
    <div className="page">
      <ComingSoonPage
        title="Aspect & Branding"
        description="Configurare aspect și branding pentru aplicație - în dezvoltare"
        highlights={[
          'Personalizare logo și culori',
          'Configurare temă aplicație',
          'Branding pentru facturi și documente',
        ]}
        nextMilestone="Implementare în Admin V4 - Sprint următor"
      />
    </div>
  );
};

