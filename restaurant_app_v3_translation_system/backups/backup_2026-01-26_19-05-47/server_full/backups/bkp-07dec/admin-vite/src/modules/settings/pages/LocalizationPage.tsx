import React, { useState, useEffect } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { PageHeader } from '@/shared/components/PageHeader';
import './LocalizationPage.css';

interface LocalizationSettings {
  id?: number;
  language: string;
  timezone: string;
  date_format: string;
  time_format: string;
  currency: string;
  currency_symbol: string;
  currency_position: string;
  decimal_separator: string;
  thousand_separator: string;
  first_day_of_week: number;
}

const LANGUAGES = [
  { value: 'ro', label: 'Română' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
];

const TIMEZONES = [
  { value: 'Europe/Bucharest', label: 'București (GMT+2)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

export const LocalizationPage: React.FC = () => {
  const [settings, setSettings] = useState<LocalizationSettings>({
    language: 'ro',
    timezone: 'Europe/Bucharest',
    date_format: 'DD/MM/YYYY',
    time_format: '24h',
    currency: 'RON',
    currency_symbol: 'RON',
    currency_position: 'after',
    decimal_separator: ',',
    thousand_separator: '.',
    first_day_of_week: 1,
  });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data, refetch } = useApiQuery<LocalizationSettings>('/api/settings/localization');
  const updateMutation = useApiMutation();

  useEffect(() => {
    if (data) {
      setSettings(data);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateMutation.mutate({
        url: '/api/settings/localization',
        method: 'PUT',
        data: settings
      });
      setAlert({ type: 'success', message: 'Setări localizare salvate cu succes!' });
      refetch();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la salvare' });
    }
  };

  const getPreview = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('ro-RO');
    const formattedTime = date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    const amount = 1234.56;
    const formattedAmount = settings.currency_position === 'before'
      ? `${settings.currency_symbol} ${amount.toFixed(2).replace('.', settings.decimal_separator).replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousand_separator)}`
      : `${amount.toFixed(2).replace('.', settings.decimal_separator).replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousand_separator)} ${settings.currency_symbol}`;
    
    return {
      date: formattedDate,
      time: formattedTime,
      amount: formattedAmount,
    };
  };

  if (loading) {
    return <div className="localization-page">Se încarcă...</div>;
  }

  const preview = getPreview();

  return (
    <div className="localization-page">
      <PageHeader
        title="Localizare"
        description="Configurare limbă, timezone, format dată/timp și monedă"
      />

      {alert && (
        <InlineAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="localization-page__content">
        <div className="localization-form">
          <div className="form-section">
            <h3>Limbă & Timezone</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Limbă *</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Timezone *</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Format Dată & Timp</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Format Dată *</label>
                <select
                  value={settings.date_format}
                  onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
                >
                  {DATE_FORMATS.map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Format Timp *</label>
                <select
                  value={settings.time_format}
                  onChange={(e) => setSettings({ ...settings, time_format: e.target.value })}
                >
                  <option value="24h">24 ore</option>
                  <option value="12h">12 ore (AM/PM)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Monedă</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Monedă *</label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  placeholder="RON"
                />
              </div>
              <div className="form-group">
                <label>Simbol Monedă *</label>
                <input
                  type="text"
                  value={settings.currency_symbol}
                  onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                  placeholder="RON"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Poziție Simbol</label>
                <select
                  value={settings.currency_position}
                  onChange={(e) => setSettings({ ...settings, currency_position: e.target.value })}
                >
                  <option value="before">Înainte (RON 100)</option>
                  <option value="after">După (100 RON)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Prima Zi Săptămână</label>
                <select
                  value={settings.first_day_of_week}
                  onChange={(e) => setSettings({ ...settings, first_day_of_week: parseInt(e.target.value) })}
                >
                  <option value="0">Duminică</option>
                  <option value="1">Luni</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Separatori</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Separator Zecimal</label>
                <input
                  type="text"
                  value={settings.decimal_separator}
                  onChange={(e) => setSettings({ ...settings, decimal_separator: e.target.value })}
                  maxLength={1}
                  placeholder=","
                />
              </div>
              <div className="form-group">
                <label>Separator Mii</label>
                <input
                  type="text"
                  value={settings.thousand_separator}
                  onChange={(e) => setSettings({ ...settings, thousand_separator: e.target.value })}
                  maxLength={1}
                  placeholder="."
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Preview</h3>
            <div className="preview-box">
              <p><strong>Dată:</strong> {preview.date}</p>
              <p><strong>Timp:</strong> {preview.time}</p>
              <p><strong>Sumă:</strong> {preview.amount}</p>
            </div>
          </div>

          <div className="localization-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              💾 Salvează Setări
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

