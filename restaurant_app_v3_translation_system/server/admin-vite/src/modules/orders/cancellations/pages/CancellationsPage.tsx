// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useMemo } from 'react';
import { OrdersAnalyticsPanel } from '../../components/OrdersAnalyticsPanel';

export const CancellationsPage: React.FC = () => {
  //   const { t } = useTranslation();
  const [feedback, setFeedback] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  const handleFeedback = (message: string, type?: 'success' | 'error' | 'info') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="cancellations-page padding-20">
      <div className="page-header margin-bottom-20">
        <h1><i className="fas fa-chart-line me-2"></i>Analiza anulări</h1>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type === 'error' ? 'danger' : feedback.type === 'success' ? 'success' : 'info'}`} role="alert">
          {feedback.message}
        </div>
      )}

      <OrdersAnalyticsPanel onFeedback={handleFeedback} />
    </div>
  );
};




