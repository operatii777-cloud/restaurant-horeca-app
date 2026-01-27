import React from 'react';
import { ComingSoonPage } from '@/modules/placeholder/ComingSoonPage';

export const InventoryImportPage = () => {
  return (
    <div className="page">
      <ComingSoonPage
        title="Import Facturi"
        description="Import facturi și documente pentru inventar - în dezvoltare"
        highlights={[
          'Import facturi furnizori',
          'Procesare automată documente',
          'Validare și sincronizare stocuri',
        ]}
        nextMilestone="Implementare în Admin V4 - Sprint următor"
      />
    </div>
  );
};

