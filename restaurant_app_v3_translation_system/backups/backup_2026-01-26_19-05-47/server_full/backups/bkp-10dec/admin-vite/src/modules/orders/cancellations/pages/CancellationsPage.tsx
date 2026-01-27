import React, { useState, useMemo } from 'react';
import { OrdersAnalyticsPanel } from '../../components/OrdersAnalyticsPanel';

export const CancellationsPage: React.FC = () => {
  const [feedback, setFeedback] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  const handleFeedback = (message: string, type?: 'success' | 'error' | 'info') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="cancellations-page" style={{ padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h1><i className="fas fa-chart-line me-2"></i>Analiză Anulări</h1>
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

