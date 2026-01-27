// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { PageHeader } from '@/shared/components/PageHeader';
import './NotificationsPage.css';

interface NotificationPreference {
  id?: number;
  notification_type: string; // 'order', 'reservation', 'stock', 'system'
  channel: string; // 'in-app', 'email', 'sms', 'push'
  is_enabled: boolean;
}

const NOTIFICATION_TYPES = [
  { value: 'order', label: 'Comenzi' },
  { value: 'reservation', label: 'Rezervări' },
  { value: 'stock', label: 'Stocuri' },
  { value: 'system', label: 'Sistem' },
];

const CHANNELS = [
  { value: 'in-app', label: 'În aplicație' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push Notification' },
];

export const NotificationsPage: React.FC = () => {
//   const { t } = useTranslation();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data, refetch } = useApiQuery<NotificationPreference[]>('/api/settings/notifications/preferences');
  const updateMutation = useApiMutation();

  useEffect(() => {
    if (data) {
      setPreferences(data);
      setLoading(false);
    } else {
      // Inițializează preferințele default dacă nu există
      const defaultPrefs: NotificationPreference[] = [];
      NOTIFICATION_TYPES.forEach(type => {
        CHANNELS.forEach(channel => {
          defaultPrefs.push({
            notification_type: type.value,
            channel: channel.value,
            is_enabled: channel.value === 'in-app', // Doar in_app enabled by default
          });
        });
      });
      setPreferences(defaultPrefs);
      setLoading(false);
    }
  }, [data]);

  const handleToggle = async (type: string, channel: string, enabled: boolean) => {
    const updated = preferences.map(p => {
      if (p.notification_type === type && p.channel === channel) {
        return { ...p, is_enabled: enabled };
      }
      return p;
    });
    setPreferences(updated);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutate({
        url: '/api/settings/notifications/preferences',
        method: 'PUT',
        data: { preferences }
      });
      setAlert({ type: 'success', message: 'Preferințe notificări salvate cu succes!' });
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la salvare' });
    }
  };

  if (loading) {
    return <div className="notifications-page">Se încarcă...</div>;
  }

  return (
    <div className="notifications-page">
      <PageHeader
        title='Notificări și Alerte'
        description="Configurare preferințe notificări și canale de comunicare"
      />

      {alert && (
        <InlineAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="notifications-page__content">
        <div className="notifications-table">
          <table className="table">
            <thead>
              <tr>
                <th>Tip Notificare</th>
                {CHANNELS.map(channel => (
                  <th key={channel.value}>{channel.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NOTIFICATION_TYPES.map(type => (
                <tr key={type.value}>
                  <td><strong>{type.label}</strong></td>
                  {CHANNELS.map(channel => {
                    const pref = preferences.find(
                      p => p.notification_type === type.value && p.channel === channel.value
                    );
                    const enabled = pref?.is_enabled ?? false;
                    return (
                      <td key={channel.value}>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => handleToggle(type.value, channel.value, e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="notifications-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            [Save] Salvează Preferințe
          </button>
        </div>
      </div>
    </div>
  );
};




