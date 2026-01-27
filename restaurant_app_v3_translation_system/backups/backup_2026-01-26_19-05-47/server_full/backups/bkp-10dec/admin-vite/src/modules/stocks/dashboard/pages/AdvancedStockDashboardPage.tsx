import React from 'react';
import { ComingSoonPage } from '@/modules/placeholder/ComingSoonPage';

export const AdvancedStockDashboardPage = () => {
  return (
    <div className="page">
      <ComingSoonPage
        title="Dashboard Avansat Stocuri"
        description="Dashboard avansat pentru analiză detaliată a stocurilor - în dezvoltare"
        highlights={[
          'Analiză avansată stocuri',
          'Predicții și recomandări',
          'Rapoarte personalizate',
        ]}
        nextMilestone="Implementare în Admin V4 - Sprint următor"
      />
    </div>
  );
};

