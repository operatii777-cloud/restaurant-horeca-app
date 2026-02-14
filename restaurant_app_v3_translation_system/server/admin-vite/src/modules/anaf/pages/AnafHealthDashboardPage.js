"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 1.7 - ANAF Health Dashboard Page
 *
 * Displays ANAF system health: certificate status, token status, queue stats, errors, timeline
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnafHealthDashboardPage = AnafHealthDashboardPage;
var react_1 = require("react");
var useAnafHealth_1 = require("../hooks/useAnafHealth");
require("./AnafHealthDashboardPage.css");
function AnafHealthDashboardPage() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    //   const { t } = useTranslation();
    var _l = (0, useAnafHealth_1.useAnafHealth)(), data = _l.data, isLoading = _l.isLoading, error = _l.error, refetch = _l.refetch;
    if (isLoading) {
        return (<div className="anaf-health-dashboard">
        <div className="loading-spinner">Se încarcă datele ANAF...</div>
      </div>);
    }
    if (error) {
        return (<div className="anaf-health-dashboard">
        <div className="alert alert-danger">
          Eroare la încărcarea datelor: {error instanceof Error ? error.message : 'Eroare necunoscută'}
        </div>
      </div>);
    }
    var health = data === null || data === void 0 ? void 0 : data.data;
    if (!health) {
        return (<div className="anaf-health-dashboard">
        <div className="alert alert-warning">"nu exista date disponibile"</div>
      </div>);
    }
    /**
     * Get certificate status badge
     */
    var getCertificateBadge = function () {
        var _a;
        if (!((_a = health.certificate) === null || _a === void 0 ? void 0 : _a.hasCertificate)) {
            return <span className="badge badge-danger">"Lipsă"</span>;
        }
        var status = health.certificate.status;
        if (status === 'valid') {
            return <span className="badge badge-success">Valid</span>;
        }
        else if (status === 'expiring_soon') {
            return <span className="badge badge-warning">"expira curand"</span>;
        }
        else if (status === 'expired') {
            return <span className="badge badge-danger">Expirat</span>;
        }
        else {
            return <span className="badge badge-secondary">Invalid</span>;
        }
    };
    /**
     * Get token status badge
     */
    var getTokenBadge = function () {
        var _a;
        if (!((_a = health.token) === null || _a === void 0 ? void 0 : _a.hasToken)) {
            return <span className="badge badge-danger">"Lipsă"</span>;
        }
        var status = health.token.status;
        if (status === 'valid') {
            return <span className="badge badge-success">Valid</span>;
        }
        else if (status === 'expired') {
            return <span className="badge badge-danger">Expirat</span>;
        }
        else {
            return <span className="badge badge-secondary">Invalid</span>;
        }
    };
    /**
     * Get queue status badge
     */
    var getQueueBadge = function () {
        var _a, _b, _c;
        var pending = ((_a = health.queue) === null || _a === void 0 ? void 0 : _a.pending) || 0;
        var failed = ((_b = health.queue) === null || _b === void 0 ? void 0 : _b.failed) || 0;
        var deadLetter = ((_c = health.queue) === null || _c === void 0 ? void 0 : _c.dead_letter) || 0;
        if (deadLetter > 0) {
            return <span className="badge badge-danger">Critical ({deadLetter} dead-letter)</span>;
        }
        else if (failed > 10) {
            return <span className="badge badge-warning">Warning ({failed} failed)</span>;
        }
        else if (pending > 20) {
            return <span className="badge badge-warning">High ({pending} pending)</span>;
        }
        else {
            return <span className="badge badge-success">OK ({pending} pending)</span>;
        }
    };
    /**
     * Get ANAF uptime status
     */
    var getUptimeStatus = function () {
        var _a;
        var errors24h = health.errors24h || 0;
        var failed = ((_a = health.queue) === null || _a === void 0 ? void 0 : _a.failed) || 0;
        if (errors24h > 50 || failed > 20) {
            return <span className="badge badge-danger">Down</span>;
        }
        else if (errors24h > 10 || failed > 5) {
            return <span className="badge badge-warning">Partial</span>;
        }
        else {
            return <span className="badge badge-success">OK</span>;
        }
    };
    /**
     * Format date
     */
    var formatDate = function (dateString) {
        if (!dateString)
            return 'N/A';
        return new Date(dateString).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };
    /**
     * Check if certificate needs alert
     */
    var certificateNeedsAlert = function () {
        var _a;
        if (!((_a = health.certificate) === null || _a === void 0 ? void 0 : _a.hasCertificate))
            return false;
        if (health.certificate.status === 'expired')
            return 'danger';
        if (health.certificate.daysUntilExpiry !== null && health.certificate.daysUntilExpiry <= 7)
            return 'warning';
        return false;
    };
    /**
     * Check if token needs alert
     */
    var tokenNeedsAlert = function () {
        var _a;
        if (!((_a = health.token) === null || _a === void 0 ? void 0 : _a.hasToken))
            return false;
        if (health.token.status === 'expired')
            return 'danger';
        return false;
    };
    var certAlert = certificateNeedsAlert();
    var tokenAlert = tokenNeedsAlert();
    return (<div className="anaf-health-dashboard">
      <header className="page-header">
        <h1 className="page-title">ANAF Health Dashboard</h1>
        <p className="page-subtitle">
          Monitorizare status sistem fiscal ANAF: certificat, token, queue, erori
        </p>
        <button onClick={function () { return refetch(); }} className="btn btn-secondary btn-sm">
          🔄 Actualizează
        </button>
      </header>

      {/* Alerts */}
      {certAlert && (<div className={"alert alert-".concat(certAlert)}>
          {certAlert === 'danger'
                ? '⚠️ Certificat ANAF EXPIRAT! Reînnoiește certificatul imediat.'
                : '⚠️ Certificat ANAF expiră în mai puțin de 7 zile. Reînnoiește certificatul.'}
        </div>)}

      {tokenAlert && (<div className={"alert alert-".concat(tokenAlert)}>
          ⚠️ Token SPV EXPIRAT! Tokenul va fi reînnoit automat sau reîncearcă manual.
        </div>)}

      {/* KPI Cards */}
      <div className="kpi-cards">
        {/* Certificate Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Certificat ANAF</h3>
            {getCertificateBadge()}
          </div>
          <div className="kpi-card-body">
            {((_a = health.certificate) === null || _a === void 0 ? void 0 : _a.hasCertificate) ? (<>
                <div className="kpi-value">
                  {formatDate(health.certificate.expiryDate)}
                </div>
                {health.certificate.daysUntilExpiry !== null && (<div className="kpi-label">
                    {health.certificate.daysUntilExpiry > 0
                    ? "Expir\u0103 \u00EEn ".concat(health.certificate.daysUntilExpiry, " zile")
                    : 'Certificat expirat'}
                  </div>)}
              </>) : (<div className="kpi-value text-muted">Nu există certificat</div>)}
          </div>
        </div>

        {/* Token Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Token SPV</h3>
            {getTokenBadge()}
          </div>
          <div className="kpi-card-body">
            {((_b = health.token) === null || _b === void 0 ? void 0 : _b.hasToken) ? (<>
                <div className="kpi-value">
                  {formatDate(health.token.expiresAt)}
                </div>
                {health.token.daysUntilExpiry !== null && (<div className="kpi-label">
                    {health.token.daysUntilExpiry > 0
                    ? "Expir\u0103 \u00EEn ".concat(health.token.daysUntilExpiry, " zile")
                    : 'Token expirat'}
                  </div>)}
              </>) : (<div className="kpi-value text-muted">Nu există token</div>)}
          </div>
        </div>

        {/* Submission Queue Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Submission Queue</h3>
            {getQueueBadge()}
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{((_c = health.queue) === null || _c === void 0 ? void 0 : _c.total) || 0}</div>
            <div className="kpi-label">
              {((_d = health.queue) === null || _d === void 0 ? void 0 : _d.pending) || 0} pending, {((_e = health.queue) === null || _e === void 0 ? void 0 : _e.failed) || 0} failed,' '
              {((_f = health.queue) === null || _f === void 0 ? void 0 : _f.dead_letter) || 0} dead-letter
            </div>
          </div>
        </div>

        {/* Printer Queue Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Printer Queue</h3>
            <span className="badge badge-info">
              {((_g = health.printerQueue) === null || _g === void 0 ? void 0 : _g.pending) || 0} pending
            </span>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{((_h = health.printerQueue) === null || _h === void 0 ? void 0 : _h.total) || 0}</div>
            <div className="kpi-label">
              {((_j = health.printerQueue) === null || _j === void 0 ? void 0 : _j.pending) || 0} pending, {((_k = health.printerQueue) === null || _k === void 0 ? void 0 : _k.failed) || 0} failed
            </div>
          </div>
        </div>

        {/* Errors 24h Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Erori Ultimele 24h</h3>
            <span className={"badge ".concat((health.errors24h || 0) > 10 ? 'badge-danger' : 'badge-success')}>
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
      {health.timeline && health.timeline.length > 0 && (<div className="timeline-card">
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
                {health.timeline.map(function (day, index) { return (<tr key={index}>
                    <td>{formatDate(day.day)}</td>
                    <td>{day.total || 0}</td>
                    <td className="text-success">{day.submitted || 0}</td>
                    <td className="text-danger">{day.failed || 0}</td>
                    <td>
                      {day.total > 0
                    ? "".concat(Math.round(((day.submitted || 0) / day.total) * 100), "%")
                    : 'N/A'}
                    </td>
                  </tr>); })}
              </tbody>
            </table>
          </div>
        </div>)}

      {/* Recent Submissions */}
      {health.recentSubmissions && health.recentSubmissions.length > 0 && (<div className="submissions-card">
          <h3 className="card-title">Submissions Recente</h3>
          <div className="submissions-list">
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {health.recentSubmissions.slice(0, 10).map(function (sub, index) { return (<tr key={index}>
                    <td>
                      {sub.document_type} #{sub.document_id}
                    </td>
                    <td>
                      <span className={"badge ".concat(sub.status === 'SUBMITTED' || sub.status === 'CONFIRMED'
                    ? 'badge-success'
                    : sub.status === 'FAILED'
                        ? 'badge-danger'
                        : 'badge-warning')}>
                        {sub.status}
                      </span>
                    </td>
                    <td>{formatDate(sub.created_at)}</td>
                    <td>{sub.attempts || 0}</td>
                  </tr>); })}
              </tbody>
            </table>
          </div>
        </div>)}
    </div>);
}
