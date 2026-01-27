import React from 'react';
import { ComingSoonPage } from '@/modules/placeholder/ComingSoonPage';

export const ImportPage = () => {
  return (
    <div className="page">
      <ComingSoonPage
        title="Import Date"
        description="Import date în sistem - în dezvoltare"
        highlights={[
          'Import produse și categorii',
          'Import comenzi și clienți',
          'Import stocuri și inventar',
        ]}
        nextMilestone="Implementare în Admin V4 - Sprint următor"
      />
    </div>
  );
};

