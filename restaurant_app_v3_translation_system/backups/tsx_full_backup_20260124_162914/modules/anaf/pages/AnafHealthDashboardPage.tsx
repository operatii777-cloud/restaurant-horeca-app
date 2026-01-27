// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 1.7 - ANAF Health Dashboard Page
 * 
 * Displays ANAF system health: certificate status, token status, queue stats, errors, timeline
 */

import React from 'react';
import { useAnafHealth } from '../hooks/useAnafHealth';
import { getAnafErrorMessage } from '../api/anaf.api';
import './AnafHealthDashboardPage.css';

export function AnafHealthDashboardPage() {
//   const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useAnafHealth();

  if (isLoading) {
    return (
      <div className="anaf-health-dashboard">
        <div className="loading-spinner">"se incarca datele anaf"</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="anaf-health-dashboard">
        <div className="alert alert-danger">
          Eroare la încărcarea datelor: {error instanceof Error ? error.message : 'Eroare necunoscută'}
        </div>
      </div>
    );
  }

  const health = data?.data;
  if (!health) {
    return (
      <div className="anaf-health-dashboard">
        <div className="alert alert-warning">"nu exista date disponibile"</div>
      </div>
    );
  }

  /**
   * Get certificate status badge
   */
  const getCertificateBadge = () => {
    if (!health.certificate?.hasCertificate) {
      return <span className="badge badge-danger">"Lipsă"</span>;
    }

    const status = health.certificate.status;
    if (status === 'valid') {
      return <span className="badge badge-success">Valid</span>;
    } else if (status === 'expiring_soon') {
      return <span className="badge badge-warning">"expira curand"</span>;
    } else if (status === 'expired') {
      return <span className="badge badge-danger">Expirat</span>;
    } else {
      return <span className="badge badge-secondary">Invalid</span>;
    }
  };

  /**
   * Get token status badge
   */
  const getTokenBadge = () => {
    if (!health.token?.hasToken) {
      return <span className="badge badge-danger">"Lipsă"</span>;
    }

    const status = health.token.status;
    if (status === 'valid') {
      return <span className="badge badge-success">Valid</span>;
    } else if (status === 'expired') {
      return <span className="badge badge-danger">Expirat</span>;
    } else {
      return <span className="badge badge-secondary">Invalid</span>;
    }
  };

  /**
   * Get queue status badge
   */
  const getQueueBadge = () => {
    const pending = health.queue?.pending || 0;
    const failed = health.queue?.failed || 0;
    const deadLetter = health.queue?.dead_letter || 0;

    if (deadLetter > 0) {
      return <span className="badge badge-danger">Critical ({deadLetter} dead-letter)</span>;
    } else if (failed > 10) {
      return <span className="badge badge-warning">Warning ({failed} failed)</span>;
    } else if (pending > 20) {
      return <span className="badge badge-warning">High ({pending} pending)</span>;
    } else {
      return <span className="badge badge-success">OK ({pending} pending)</span>;
    }
  };

  /**
   * Get ANAF uptime status
   */
  const getUptimeStatus = () => {
    const errors24h = health.errors24h || 0;
    const failed = health.queue?.failed || 0;

    if (errors24h > 50 || failed > 20) {
      return <span className="badge badge-danger">Down</span>;
    } else if (errors24h > 10 || failed > 5) {
      return <span className="badge badge-warning">Partial</span>;
    } else {
      return <span className="badge badge-success">OK</span>;
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  /**
   * Check if certificate needs alert
   */
  const certificateNeedsAlert = () => {
    if (!health.certificate?.hasCertificate) return false;
    if (health.certificate.status === 'expired') return 'danger';
    if (health.certificate.daysUntilExpiry !== null && health.certificate.daysUntilExpiry <= 7) return 'warning';
    return false;
  };

  /**
   * Check if token needs alert
   */
  const tokenNeedsAlert = () => {
    if (!health.token?.hasToken) return false;
    if (health.token.status === 'expired') return 'danger';
    return false;
  };

  const certAlert = certificateNeedsAlert();
  const tokenAlert = tokenNeedsAlert();

  return (
    <div className="anaf-health-dashboard">
      <header className="page-header">
        <h1 className="page-title">ANAF Health Dashboard</h1>
        <p className="page-subtitle">
          Monitorizare status sistem fiscal ANAF: certificat, token, queue, erori
        </p>
        <button onClick={() => refetch()} className="btn btn-secondary btn-sm">
          🔄 Actualizează
        </button>
      </header>

      {/* Alerts */}
      {certAlert && (
        <div className={`alert alert-${certAlert}`}>
          {certAlert === 'danger' 
            ? '⚠️ Certificat ANAF EXPIRAT! Reînnoiește certificatul imediat.'
            : '⚠️ Certificat ANAF expiră în mai puțin de 7 zile. Reînnoiește certificatul.'}
        </div>
      )}

      {tokenAlert && (
        <div className={`alert alert-${tokenAlert}`}>
          ⚠️ Token SPV EXPIRAT! Tokenul va fi reînnoit automat sau reîncearcă manual.
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-cards">
        {/* Certificate Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Certificat ANAF</h3>
            {getCertificateBadge()}
          </div>
          <div className="kpi-card-body">
            {health.certificate?.hasCertificate ? (
              <>
                <div className="kpi-value">
                  {formatDate(health.certificate.expiryDate)}
                </div>
                {health.certificate.daysUntilExpiry !== null && (
                  <div className="kpi-label">
                    {health.certificate.daysUntilExpiry > 0
                      ? `Expiră în ${health.certificate.daysUntilExpiry} zile`
                      : 'Certificat expirat'}
                  </div>
                )}
              </>
            ) : (
              <div className="kpi-value text-muted">"nu exista certificat"</div>
            )}
          </div>
        </div>

        {/* Token Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Token SPV</h3>
            {getTokenBadge()}
          </div>
          <div className="kpi-card-body">
            {health.token?.hasToken ? (
              <>
                <div className="kpi-value">
                  {formatDate(health.token.expiresAt)}
                </div>
                {health.token.daysUntilExpiry !== null && (
                  <div className="kpi-label">
                    {health.token.daysUntilExpiry > 0
                      ? `Expiră în ${health.token.daysUntilExpiry} zile`
                      : 'Token expirat'}
                  </div>
                )}
              </>
            ) : (
              <div className="kpi-value text-muted">"nu exista token"</div>
            )}
          </div>
        </div>

        {/* Submission Queue Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Submission Queue</h3>
            {getQueueBadge()}
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{health.queue?.total || 0}</div>
            <div className="kpi-label">
              {health.queue?.pending || 0} pending, {health.queue?.failed || 0} failed,' '
              {health.queue?.dead_letter || 0} dead-letter
            </div>
          </div>
        </div>

        {/* Printer Queue Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Printer Queue</h3>
            <span className="badge badge-info">
              {health.printerQueue?.pending || 0} pending
            </span>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{health.printerQueue?.total || 0}</div>
            <div className="kpi-label">
              {health.printerQueue?.pending || 0} pending, {health.printerQueue?.failed || 0} failed
            </div>
          </div>
        </div>

        {/* Errors 24h Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Erori Ultimele 24h</h3>
            <span className={`badge ${(health.errors24h || 0) > 10 ? 'badge-danger' : 'badge-success'}`}>
              {(health.errors24h || 0) > 10 ? 'High' : 'Low'}
            </span>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{health.errors24h || 0}</div>
            <div className="kpi-label">Erori în ultimele 24 ore</div>
          </div>
        </div>

        {/* ANAF Uptime Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">ANAF Uptime</h3>
            {getUptimeStatus()}
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">
              {(health.errors24h || 0) > 50 ? 'Down' : (health.errors24h || 0) > 10 ? 'Partial' : 'OK'}
            </div>
            <div className="kpi-label">Status conexiune ANAF</div>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      {health.timeline && health.timeline.length > 0 && (
        <div className="timeline-card">
          <h3 className="card-title">Submission Timeline (Ultimele 7 zile)</h3>
          <div className="timeline-chart">
            <table className="timeline-table">
              <thead>
                <tr>
                  <th>Zi</th>
                  <th>Total</th>
                  <th>Submitted</th>
                  <th>Failed</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {health.timeline.map((day: any, index: number) => (
                  <tr key={index}>
                    <td>{formatDate(day.day)}</td>
                    <td>{day.total || 0}</td>
                    <td className="text-success">{day.submitted || 0}</td>
                    <td className="text-danger">{day.failed || 0}</td>
                    <td>
                      {day.total > 0
                        ? `${Math.round(((day.submitted || 0) / day.total) * 100)}%`
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Submissions */}
      {health.recentSubmissions && health.recentSubmissions.length > 0 && (
        <div className="submissions-card">
          <h3 className="card-title">Submissions Recente</h3>
          <div className="submissions-list">
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>"Document"</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {health.recentSubmissions.slice(0, 10).map((sub: any, index: number) => (
                  <tr key={index}>
                    <td>
                      {sub.document_type} #{sub.document_id}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          sub.status === 'SUBMITTED' || sub.status === 'CONFIRMED'
                            ? 'badge-success'
                            : sub.status === 'FAILED'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td>{formatDate(sub.created_at)}</td>
                    <td>{sub.attempts || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}



