// import { useTranslation } from '@/i18n/I18nContext';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import classNames from 'classnames';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { MiniBarChart } from '@/shared/components/charts/MiniBarChart';
import { MiniDonutChart } from '@/shared/components/charts/MiniDonutChart';
import { StatCard } from '@/shared/components/StatCard';
import { httpClient } from '@/shared/api/httpClient';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type {
  CancellationAnalytics,
  CancellationPredictionResult,
  StockCancellationCorrelation,
} from '@/types/orders';
import './OrdersAnalyticsPanel.css';

type PeriodOption = 'day' | 'week' | 'month' | 'year' | 'custom';

type OrdersAnalyticsPanelProps = {
  onFeedback: (message: string, type?: 'success' | 'error' | 'info') => void;
};

export const OrdersAnalyticsPanel = ({ onFeedback }: OrdersAnalyticsPanelProps) => {
//   const { t } = useTranslation();
  const [period, setPeriod] = useState<PeriodOption>('week');
  const [customRange, setCustomRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });
  const [predictions, setPredictions] = useState<CancellationPredictionResult | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [correlation, setCorrelation] = useState<StockCancellationCorrelation | null>(null);
  const [correlationLoading, setCorrelationLoading] = useState(false);

  const analyticsEndpoint = useMemo(() => {
    const params = new URLSearchParams({ period });
    if (period === 'custom') {
      if (!customRange.start || !customRange.end) {
        return null;
      }
      params.set('startDate', customRange.start);
      params.set('endDate', customRange.end);
    }
    return `/api/analytics/cancellation-stats?${params.toString()}`;
  }, [customRange.end, customRange.start, period]);

  const {
    data: analytics,
    loading,
    error,
    refetch,
  } = useApiQuery<CancellationAnalytics>(analyticsEndpoint);
  
  // Previne infinite loop: loghează erori doar o dată
  const lastErrorRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      onFeedback(error, 'error');
    } else if (!error) {
      lastErrorRef.current = null;
    }
  }, [error, onFeedback]);

  const hourlyData = useMemo(
    () =>
      (analytics?.hourly_distribution ?? []).map((bucket) => ({
        label: `${bucket.hour}:00`,
        value: bucket.count,
      })),
    [analytics?.hourly_distribution],
  );

  const reasonsData = useMemo(() => {
    const total = (analytics?.cancellation_reasons ?? []).reduce((sum, item) => sum + item.count, 0);
    if (!total) return [];
    return (analytics?.cancellation_reasons ?? []).map((item) => ({
      name: item.reason ?? 'Nespecificat',
      value: Number(((item.count / total) * 100).toFixed(2)),
    }));
  }, [analytics?.cancellation_reasons]);

  const trendsData = useMemo(
    () =>
      (analytics?.trends ?? []).map((item) => ({
        label: item.date,
        value: item.count,
      })),
    [analytics?.trends],
  );

  const handleFetchPredictions = useCallback(async () => {
    setPredictionLoading(true);
    try {
      const response = await httpClient.get<CancellationPredictionResult>('/api/analytics/cancellation-predictions');
      setPredictions(response.data);
      onFeedback('Predicțiile au fost generate.', 'success');
    } catch (err) {
      console.error('Eroare la generarea predicțiilor:', err);
      onFeedback('Nu s-au putut genera predicțiile de anulare.', 'error');
    } finally {
      setPredictionLoading(false);
    }
  }, [onFeedback]);

  const handleFetchCorrelation = useCallback(async () => {
    setCorrelationLoading(true);
    try {
      const response = await httpClient.get<StockCancellationCorrelation>(
        '/api/analytics/stock-cancellation-correlation',
      );
      setCorrelation(response.data);
      onFeedback('Analiza corelațiilor stoc-anulare a fost încărcată.', 'success');
    } catch (err) {
      console.error('Eroare la analiza corelațiilor:', err);
      onFeedback('Nu s-au putut încărca corelațiile stoc-anulare.', 'error');
    } finally {
      setCorrelationLoading(false);
    }
  }, [onFeedback]);

  const handlePeriodChange = useCallback(
    (value: PeriodOption) => {
      setPeriod(value);
      if (value !== 'custom') {
        setCustomRange({ start: null, end: null });
      }
    },
    [],
  );

  return (
    <div className="orders-analytics-panel">
      <section className="analytics-controls">
        <div className="analytics-period">
          <span>"perioada analiza"</span>
          <div className="analytics-period__buttons">
            {(['day', 'week', 'month', 'year', 'custom'] as PeriodOption[]).map((option) => (
              <button
                key={option}
                type="button"
                className={classNames('btn btn-chip', { 'is-active': period === option })}
                onClick={() => handlePeriodChange(option)}
              >
                {option === 'day'
                  ? 'Astăzi'
                  : option === 'week'
                    ? 'Ultima săptămână'
                    : option === 'month'
                      ? 'Ultima lună'
                      : option === 'year'
                        ? 'Ultimul an'
                        : 'Personalizat'}
              </button>
            ))}
          </div>
        </div>

        {period === 'custom' ? (
          <div className="analytics-range">
            <label htmlFor="analytics-start">De la</label>
            <input
              id="analytics-start"
              type="date"
              value={customRange.start ?? ''}
              onChange={(event) => setCustomRange((prev) => ({ ...prev, start: event.target.value || null }))}
            />
            <label htmlFor="analytics-end">Până la</label>
            <input
              id="analytics-end"
              type="date"
              value={customRange.end ?? ''}
              onChange={(event) => setCustomRange((prev) => ({ ...prev, end: event.target.value || null }))}
            />
            <button type="button" className="btn btn-primary" onClick={() => refetch()}>"Aplică"</button>
          </div>
        ) : null}

        <div className="analytics-actions">
          <button type="button" className="btn btn-ghost" onClick={() => refetch()}>"Reîmprospătează"</button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleFetchPredictions}
            disabled={predictionLoading}
          >
            {predictionLoading ? 'Se calculează…' : '🔮 Predicții anulări'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleFetchCorrelation}
            disabled={correlationLoading}
          >
            {correlationLoading ? 'Se analizează…' : '🔗 Corelație stoc'}
          </button>
        </div>
      </section>

      {loading ? <p>"se incarca datele de analiza"</p> : null}
      {!loading && !analytics ? <InlineAlert variant="info" message="Selectați o perioadă pentru a vedea statisticile." /> : null}

      {analytics ? (
        <div className="analytics-content">
          <section className="analytics-stats">
            <StatCard
              title="Total comenzi"
              helper={`Interval: ${analytics.period}`}
              value={`${analytics.general_stats.total_orders}`}
              icon={<span>📦</span>}
            />
            <StatCard
              title="Anulări"
              helper={
                analytics.general_stats.cancelled_orders > 0
                  ? `${analytics.general_stats.cancelled_orders} (${analytics.general_stats.cancellation_rate.toFixed(2)}%)`
                  : 'Fără anulări'
              }
              value={`${analytics.general_stats.cancelled_orders}`}
              trendDirection={analytics.general_stats.cancelled_orders > 0 ? 'down' : 'flat'}
              trendLabel={analytics.general_stats.cancelled_orders > 0 ? 'Impact' : 'OK'}
              icon={<span>❌</span>}
            />
            <StatCard
              title="valoare pierduta"
              helper="Din comenzile anulate"
              value={`${analytics.general_stats.cancelled_value.toFixed(2)} RON`}
              icon={<span>💸</span>}
            />
            <StatCard
              title="timp mediu anulare"
              helper="minute"
              value={`${analytics.general_stats.avg_cancel_time_minutes} min`}
              icon={<span>⏱️</span>}
            />
          </section>

          <section className="analytics-grid">
            <div className="analytics-card">
              <header>
                <h3>"distributie orara"</h3>
                <span>"numar de anulari pe ora"</span>
              </header>
              {hourlyData.length ? (
                <MiniBarChart data={hourlyData} tooltipFormatter={(value) => [`"Value"`, 'Anulări']} />
              ) : (
                <p>"nu exista date"</p>
              )}
            </div>

            <div className="analytics-card">
              <header>
                <h3>"motive anulare"</h3>
                <span>Top 10 motive</span>
              </header>
              {reasonsData.length ? <MiniDonutChart data={reasonsData} /> : <p>"nu exista motive definite"</p>}
            </div>

            <div className="analytics-card">
              <header>
                <h3>"Tendințe"</h3>
                <span>"evolutia zilnica a anularilor"</span>
              </header>
              {trendsData.length ? (
                <MiniBarChart data={trendsData} tooltipFormatter={(value) => [`"Value"`, 'Anulări']} />
              ) : (
                <p>"nu exista date pentru tendinte"</p>
              )}
            </div>

            <div className="analytics-card">
              <header>
                <h3>"top produse anulate"</h3>
              </header>
              <ul className="analytics-top-list">
                {(analytics.top_cancelled_products ?? []).map((product) => (
                  <li key={product.name}>
                    <span>{product.name}</span>
                    <strong>{product.cancellation_count}</strong>
                  </li>
                ))}
                {!analytics.top_cancelled_products?.length ? <li>"nu exista produse in lista"</li> : null}
              </ul>
            </div>
          </section>

          {/* Breakdown pe Tip Comandă - NOU */}
          {analytics.breakdown_by_type && analytics.breakdown_by_type.length > 0 && (
            <section className="analytics-breakdown">
              <div className="analytics-card">
                <header>
                  <h3>"breakdown pe tip comanda"</h3>
                  <span>"anulari per tip de comanda"</span>
                </header>
                <div className="breakdown-grid">
                  {analytics.breakdown_by_type.map((item: any, idx: number) => (
                    <div key={idx} className="breakdown-item">
                      <div className="breakdown-icon">
                        {item.type === 'DELIVERY' ? '🛵' : 
                         item.type === 'DRIVE_THRU' ? '🚗' : 
                         item.type === 'TAKEOUT' ? '📦' : '🍽️'}
                      </div>
                      <div className="breakdown-info">
                        <strong>{item.type || 'N/A'}</strong>
                        <div className="breakdown-stats">
                          <span>{item.count || 0} anulări</span>
                          <span>{item.value?.toFixed(2) || '0.00'} RON</span>
                          <span>{item.percentage?.toFixed(1) || '0'}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      ) : null}

      {predictions ? (
        <section className="analytics-predictions">
          <header>
            <h3>"predictii anulari"</h3>
            <span>
              Interval analizat: {new Date(predictions.analysis_period.start).toLocaleDateString('ro-RO')} –' '
              {new Date(predictions.analysis_period.end).toLocaleDateString('ro-RO')}
            </span>
          </header>
          <div className="analytics-predictions__grid">
            <StatCard
              title="rata curenta"
              helper="Ultimele 7 zile"
              value={predictions.trend_analysis.current_rate}
              icon={<span>📈</span>}
            />
            <StatCard
              title="rata precedenta"
              helper="Zilele 8-14"
              value={predictions.trend_analysis.previous_rate}
              icon={<span>📉</span>}
            />
            <StatCard
              title="Tendință"
              helper={predictions.trend_analysis.trend_description}
              value={predictions.predictions.next_week_rate}
              icon={<span>🔮</span>}
            />
          </div>

          {predictions.alerts && predictions.alerts.length > 0 ? (
            <div className="analytics-alerts">
              {predictions.alerts.map((alert, index) => (
                <div key={`${alert.type}-"Index"`} className={classNames('analytics-alert', `is-${alert.severity}`)}>
                  <strong>{alert.message}</strong>
                </div>
              ))}
            </div>
          ) : null}

          {predictions.recommendations && predictions.recommendations.length > 0 ? (
            <ul className="analytics-recommendations">
              {predictions.recommendations.map((item, index) => (
                <li key={`"Item"-"Index"`}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {correlation ? (
        <section className="analytics-correlation">
          <header>
            <h3>Corelație stoc – anulări</h3>
            <span>{`Analiză generată la ${new Date(correlation.generated_at).toLocaleString('ro-RO')}`}</span>
          </header>
          <div className="analytics-correlation__table">
            <div className="analytics-correlation__header">
              <span>Produs</span>
              <span>"Anulări"</span>
              <span>"stoc curent"</span>
              <span>Risc</span>
            </div>
            <div className="analytics-correlation__body">
              {correlation?.items && correlation.items.length > 0 ? (
                correlation.items.map((item) => (
                  <div key={item.id} className="analytics-correlation__row">
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.category}</small>
                      {item.recommendation ? <p>{item.recommendation}</p> : null}
                    </div>
                    <span>{item.total_cancellations}</span>
                    <span>
                      {item.current_stock}/{item.min_stock}
                    </span>
                    <span className={classNames('risk-badge', `risk-${item.risk_level}`)}>{item.risk_level}</span>
                  </div>
                ))
              ) : (
                <p>"nu au fost identificate produse in risc"</p>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};



