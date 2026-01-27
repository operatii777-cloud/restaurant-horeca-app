// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useEffect, useCallback } from 'react';
import { SideDrawer } from '@/shared/components/SideDrawer';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './RiskAlertsDrawer.css';

interface RiskAlert {
  id: number;
  ingredient_name: string;
  location: string;
  risk_type: 'negative_stock' | 'high_variance' | 'expiring_soon' | 'low_turnover' | 'cost_increase';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  current_value: number;
  expected_value: number;
  variance_percent: number;
  last_updated: string;
}

interface RiskAlertsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const RiskAlertsDrawer = ({ open, onClose }: RiskAlertsDrawerProps) => {
//   const { t } = useTranslation();
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('');

  useEffect(() => {
    if (open) {
      loadRiskAlerts();
    }
  }, [open, filterType, filterSeverity]);

  const loadRiskAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/admin/inventory/risk-alerts', {
        params: {
          risk_type: filterType || undefined,
          severity: filterSeverity || undefined,
        },
      });

      if (response.data?.success) {
        setAlerts(response.data.data || []);
      }
    } catch (error) {
      console.error('❌ Eroare la încărcarea alertelor de risc:', error);
      // Fallback pentru development
      setAlerts([
        {
          id: 1,
          ingredient_name: 'Mozzarella',
          location: 'Bucătărie Principală',
          risk_type: 'negative_stock',
          severity: 'critical',
          message: 'Stoc negativ detectat!',
          current_value: -5,
          expected_value: 50,
          variance_percent: -110,
          last_updated: new Date().toISOString(),
        },
        {
          id: 2,
          ingredient_name: 'Sos roșii',
          location: 'Bucătărie Principală',
          risk_type: 'high_variance',
          severity: 'warning',
          message: 'Varianță mare la inventar (25%)',
          current_value: 125,
          expected_value: 100,
          variance_percent: 25,
          last_updated: new Date().toISOString(),
        },
        {
          id: 3,
          ingredient_name: 'Ulei de măsline',
          location: 'Bar',
          risk_type: 'low_turnover',
          severity: 'info',
          message: 'Rotație scăzută - posibil stoc vechi',
          current_value: 80,
          expected_value: 80,
          variance_percent: 0,
          last_updated: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterSeverity]);

  const getRiskTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      negative_stock: 'Stoc Negativ',
      high_variance: 'Varianță Mare',
      expiring_soon: 'Expiră Curând',
      low_turnover: 'Rotație Scăzută',
      cost_increase: 'Creștere Cost',
    };
    return labels[type] || type;
  };

  const getSeverityBadge = (severity: string) => {
    const badges: Record<string, { bg: string; label: string }> = {
      critical: { bg: 'danger', label: 'Critic' },
      warning: { bg: 'warning', label: 'Avertisment' },
      info: { bg: 'info', label: 'Informare' },
    };
    const badge = badges[severity] || badges.info;
    return <span className={`badge bg-${badge.bg}`}>{badge.label}</span>;
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filterType && alert.risk_type !== filterType) return false;
    if (filterSeverity && alert.severity !== filterSeverity) return false;
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const infoCount = alerts.filter((a) => a.severity === 'info').length;

  return (
    <SideDrawer open={open} onClose={onClose} title="alerte risc stocuri" width="600px">
      <div className="risk-alerts-drawer">
        {/* Summary */}
        <div className="risk-alerts-summary mb-3">
          <div className="row g-2">
            <div className="col-4">
              <div className="alert alert-danger mb-0 text-center">
                <strong>{criticalCount}</strong>
                <br />
                <small>Critice</small>
              </div>
            </div>
            <div className="col-4">
              <div className="alert alert-warning mb-0 text-center">
                <strong>{warningCount}</strong>
                <br />
                <small>Avertismente</small>
              </div>
            </div>
            <div className="col-4">
              <div className="alert alert-info mb-0 text-center">
                <strong>{infoCount}</strong>
                <br />
                <small>"Informări"</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filtre */}
        <div className="risk-alerts-filters mb-3">
          <div className="row g-2">
            <div className="col-6">
              <select
                className="form-select form-select-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                title="Filtru tip alertă"
              >
                <option value="">"toate tipurile"</option>
                <option value="negative_stock">Stoc Negativ</option>
                <option value="high_variance">"varianta mare"</option>
                <option value="expiring_soon">Expiră Curând</option>
                <option value="low_turnover">"rotatie scazuta"</option>
                <option value="cost_increase">"crestere cost"</option>
              </select>
            </div>
            <div className="col-6">
              <select
                className="form-select form-select-sm"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                title="Filtru severitate"
              >
                <option value="">"toate severitatile"</option>
                <option value="critical">Critic</option>
                <option value="warning">Avertisment</option>
                <option value="info">Informare</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista Alerte */}
        {loading ? (
          <div className="text-center py-4">
            <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
            <p className="mt-2">"se incarca alertele"</p>
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className="risk-alerts-list">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className={`risk-alert-item risk-alert-item--${alert.severity} mb-3`}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="mb-1">
                      {alert.ingredient_name}
                      {getSeverityBadge(alert.severity)}
                    </h6>
                    <small className="text-muted">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {alert.location}
                    </small>
                  </div>
                  <small className="text-muted">
                    {new Date(alert.last_updated).toLocaleDateString('ro-RO')}
                  </small>
                </div>
                <div className="mb-2">
                  <strong>Tip Risc:</strong> {getRiskTypeLabel(alert.risk_type)}
                </div>
                <div className="mb-2">
                  <strong>Mesaj:</strong> {alert.message}
                </div>
                {alert.risk_type === 'high_variance' || alert.risk_type === 'negative_stock' ? (
                  <div className="row g-2">
                    <div className="col-4">
                      <small className="text-muted">"Așteptat:"</small>
                      <div>{alert.expected_value}</div>
                    </div>
                    <div className="col-4">
                      <small className="text-muted">Real:</small>
                      <div className={alert.current_value < 0 ? 'text-danger' : ''}>
                        {alert.current_value}
                      </div>
                    </div>
                    <div className="col-4">
                      <small className="text-muted">"Varianță:"</small>
                      <div
                        className={
                          alert.variance_percent > 10 || alert.variance_percent < -10
                            ? 'text-danger'
                            : alert.variance_percent > 5 || alert.variance_percent < -5
                              ? 'text-warning'
                              : ''
                        }
                      >
                        {alert.variance_percent > 0 ? '+' : ''}
                        {alert.variance_percent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted py-4">
            <i className="fas fa-check-circle fa-2x mb-2"></i>
            <p>"nu exista alerte de risc pentru filtrele selectate"</p>
          </div>
        )}
      </div>
    </SideDrawer>
  );
};




