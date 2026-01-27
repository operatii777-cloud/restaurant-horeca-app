import { useState, useEffect } from 'react';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import './KioskLoginHistoryPage.css';

interface LoginHistoryEntry {
  id: number;
  user_id: number | null;
  username: string;
  role: string;
  login_time: string;
  logout_time: string | null;
  device_id: string;
  ip: string | null;
}

export const KioskLoginHistoryPage = () => {
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    date: '',
    username: '',
  });

  useEffect(() => {
    loadHistory();
  }, [filters]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.username) params.append('username', filters.username);

      const response = await httpClient.get(`/api/kiosk/login-history?${params.toString()}`);
      setHistory(response.data?.history || []);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea istoricului login:', err);
      setError(err.response?.data?.error || 'Nu s-a putut încărca istoricul login-urilor.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return '—';
    const date = new Date(dateTime);
    return date.toLocaleString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (loginTime: string, logoutTime: string | null) => {
    if (!logoutTime) return 'În sesiune';
    const login = new Date(loginTime).getTime();
    const logout = new Date(logoutTime).getTime();
    const diff = Math.floor((logout - login) / 1000); // secunde
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'badge-danger';
      case 'supervisor':
        return 'badge-warning';
      case 'waiter':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'supervisor':
        return 'Supervisor';
      case 'waiter':
        return 'Ospătar';
      default:
        return role;
    }
  };

  return (
    <div className="kiosk-login-history-page">
      <PageHeader
        title="Istoric Login KIOSK"
        subtitle="Vizualizează istoricul autentificărilor și sesiunilor KIOSK"
      />

      <div className="kiosk-login-history-filters">
        <div className="kiosk-login-history-filter">
          <label>Data</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="kiosk-login-history-input"
          />
        </div>
        <div className="kiosk-login-history-filter">
          <label>Username</label>
          <input
            type="text"
            value={filters.username}
            onChange={(e) => setFilters({ ...filters, username: e.target.value })}
            placeholder="Filtrează după username"
            className="kiosk-login-history-input"
          />
        </div>
        <div className="kiosk-login-history-filter">
          <button
            onClick={() => setFilters({ date: '', username: '' })}
            className="kiosk-login-history-clear-btn"
          >
            Șterge filtre
          </button>
        </div>
      </div>

      {error && (
        <div className="kiosk-login-history-error">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </div>
      )}

      {loading ? (
        <div className="kiosk-login-history-loading">
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p>Se încarcă istoricul...</p>
        </div>
      ) : (
        <div className="kiosk-login-history-table-container">
          {history.length === 0 ? (
            <div className="kiosk-login-history-empty">
              <i className="fas fa-history fa-3x mb-3"></i>
              <p>Nu există înregistrări de login.</p>
            </div>
          ) : (
            <table className="kiosk-login-history-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Rol</th>
                  <th>Login</th>
                  <th>Logout</th>
                  <th>Durată</th>
                  <th>Device</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.id}</td>
                    <td>
                      <strong>{entry.username}</strong>
                    </td>
                    <td>
                      <span className={`badge ${getRoleBadgeColor(entry.role)}`}>
                        {getRoleLabel(entry.role)}
                      </span>
                    </td>
                    <td>{formatDateTime(entry.login_time)}</td>
                    <td>{formatDateTime(entry.logout_time)}</td>
                    <td>
                      <span
                        className={
                          entry.logout_time
                            ? 'kiosk-login-history-duration'
                            : 'kiosk-login-history-active'
                        }
                      >
                        {formatDuration(entry.login_time, entry.logout_time)}
                      </span>
                    </td>
                    <td>{entry.device_id || '—'}</td>
                    <td>{entry.ip || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className="kiosk-login-history-stats">
          <div className="kiosk-login-history-stat">
            <span className="kiosk-login-history-stat-label">Total înregistrări:</span>
            <span className="kiosk-login-history-stat-value">{history.length}</span>
          </div>
          <div className="kiosk-login-history-stat">
            <span className="kiosk-login-history-stat-label">Sesiuni active:</span>
            <span className="kiosk-login-history-stat-value">
              {history.filter((h) => !h.logout_time).length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

