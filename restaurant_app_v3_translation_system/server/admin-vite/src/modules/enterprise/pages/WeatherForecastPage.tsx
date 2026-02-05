// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 🌤️ WEATHER FORECAST PAGE - Predicții vânzări bazate pe vreme
 */

import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import './WeatherForecastPage.css';

interface WeatherData {
  city: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  condition: string;
  category: string;
  correlations: {
    boost: string[];
    reduce: string[];
    boostMultiplier: number;
    reduceMultiplier: number;
  };
}

interface Prediction {
  category: string;
  baseline_orders: number;
  baseline_revenue: string;
  predicted_multiplier: number;
  predicted_orders: number;
  predicted_revenue: string;
  trend: string;
  trend_icon: string;
  recommendation: string;
}

interface WeatherSettings {
  lat: number;
  lon: number;
  city: string;
}

export const WeatherForecastPage = () => {
  //   const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<WeatherSettings>({
    lat: 44.4268,
    lon: 26.1025,
    city: 'București, RO'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load current weather
      const weatherRes = await fetch('/api/weather-forecast/current');
      if (!weatherRes.ok) {
        throw new Error(`HTTP error! status: ${weatherRes.status}`);
      }
      const weatherData = await weatherRes.json();
      console.log('Weather data received:', weatherData);

      if (weatherData.success && weatherData.weather) {
        setWeather(weatherData.weather);

        // Load predictions using weather data
        const temp = weatherData.weather.temperature || 22;
        const condition = weatherData.weather.condition || 'normal';
        const predRes = await fetch(`/api/weather-forecast/predictions?temperature=${temp}&condition=${condition}`);

        if (!predRes.ok) {
          throw new Error(`HTTP error! status: ${predRes.status}`);
        }
        const predData = await predRes.json();
        console.log('Predictions data received:', predData);

        if (predData.success) {
          setPredictions(predData.predictions || []);
          setRecommendations(predData.recommendations);
        } else {
          console.warn('Predictions API returned success: false', predData);
        }
      } else {
        console.warn('Weather API returned success: false or no weather data', weatherData);
        setError('Nu s-au putut încărca datele meteo. Verifică conexiunea la internet.');
      }
    } catch (err: any) {
      console.error('Error loading weather data:', err);
      setError(err.message || 'Eroare la încărcarea datelor meteo');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/weather-forecast/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/weather-forecast/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!res.ok) {
        throw new Error('Eroare la salvarea setărilor');
      }

      const data = await res.json();
      if (data.success) {
        setShowSettings(false);
        // Reîncarcă datele meteo cu noile coordonate
        await loadData();
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      alert('Eroare la salvarea setărilor: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    loadSettings().then(() => {
      loadData();
    });
  }, []);

  const getWeatherIcon = (category: string) => {
    const icons: Record<string, string> = {
      hot: '☀️',
      cold: '❄️',
      rainy: '🌧️',
      sunny: '🌞',
      normal: '⛅',
    };
    return icons[category] || '🌤️';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'increase') return '#22c55e';
    if (trend === 'decrease') return '#ef4444';
    return '#6b7280';
  };

  if (loading) {
    return (
      <div className="weather-forecast-page">
        <PageHeader title="🌤️ Weather Forecast" description="Se încarcă datele..." />
        <div className="loading">⏳ Se analizează vremea...</div>
      </div>
    );
  }

  return (
    <div className="weather-forecast-page" data-page-ready="true">
      <PageHeader
        title="🌤️ Weather-Based Sales Forecasting"
        description="Predicții vânzări bazate pe condițiile meteo"
        actions={[
          { label: '⚙️ Setări Locație', variant: 'primary', onClick: () => setShowSettings(true) },
          { label: '🔄 Refresh', variant: 'secondary', onClick: loadData },
        ]}
      />

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3>⚙️ Setări Locație pentru Weather Forecast</h3>
              <button className="close-btn" onClick={() => setShowSettings(false)}>×</button>
            </div>
            <div className="settings-modal-body">
              <p className="settings-info">
                Introduceți coordonatele locației restaurantului pentru a obține date meteo precise.
                Puteți găsi coordonatele pe <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a>.
              </p>
              <div className="settings-form">
                <div className="form-group">
                  <label>Oraș / Locație</label>
                  <input
                    type="text"
                    value={settings.city}
                    onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                    placeholder="ex bucuresti ro"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>"Latitudine"</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={settings.lat}
                      onChange={(e) => setSettings({ ...settings, lat: parseFloat(e.target.value) || 0 })}
                      placeholder="ex: 44.4268"
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitudine</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={settings.lon}
                      onChange={(e) => setSettings({ ...settings, lon: parseFloat(e.target.value) || 0 })}
                      placeholder="ex: 26.1025"
                    />
                  </div>
                </div>
                <div className="settings-actions">
                  <button className="btn-cancel" onClick={() => setShowSettings(false)}>"Anulează"</button>
                  <button className="btn-save" onClick={saveSettings} disabled={savingSettings}>
                    {savingSettings ? 'Se salvează...' : 'Salvează'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {/* Current Weather Card */}
      {weather && (
        <div className="weather-card">
          <div className="weather-main">
            <span className="weather-icon">{getWeatherIcon(weather.category)}</span>
            <div className="weather-temp">
              <span className="temp-value">{weather.temperature}°C</span>
              <span className="temp-feels">Simțit: {weather.feels_like}°C</span>
            </div>
          </div>
          <div className="weather-details">
            <div className="weather-detail">
              <span className="detail-label">📍 Locație</span>
              <span className="detail-value">{weather.city}</span>
            </div>
            <div className="weather-detail">
              <span className="detail-label">💨 Vânt</span>
              <span className="detail-value">{weather.wind_speed} km/h</span>
            </div>
            <div className="weather-detail">
              <span className="detail-label">💧 Umiditate</span>
              <span className="detail-value">{weather.humidity}%</span>
            </div>
            <div className="weather-detail">
              <span className="detail-label">📝 Condiții</span>
              <span className="detail-value">{weather.description}</span>
            </div>
          </div>
          <div className={`weather-category cat-${weather.category}`}>
            Categorie: <strong>{weather.category.toUpperCase()}</strong>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && (
        <div className="recommendations-section">
          <h2>💡 Recomandări</h2>
          <div className="tip-card">
            {recommendations.general_tip}
          </div>
          <div className="boost-reduce-grid">
            <div className="boost-card">
              <h3>📈 Promovați</h3>
              <div className="category-tags">
                {recommendations.boost_categories?.map((cat: string) => (
                  <span key={cat} className="tag boost">{cat}</span>
                ))}
              </div>
            </div>
            <div className="reduce-card">
              <h3>📉 Reduceți producția</h3>
              <div className="category-tags">
                {recommendations.reduce_categories?.length > 0 ? (
                  recommendations.reduce_categories.map((cat: string) => (
                    <span key={cat} className="tag reduce">{cat}</span>
                  ))
                ) : (
                  <span className="no-items">"nicio categorie afectata negativ"</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Table */}
      <div className="predictions-section">
        <h2>📊 Predicții pe Categorii</h2>
        <div className="predictions-grid">
          {predictions.map((pred) => (
            <div key={pred.category} className={`prediction-card trend-${pred.trend}`}>
              <div className="pred-header">
                <span className="pred-category">{pred.category || 'Necategorizat'}</span>
                <span className="pred-trend" style={{ color: getTrendColor(pred.trend) }}>
                  {pred.trend_icon} {pred.trend === 'increase' ? '+' : pred.trend === 'decrease' ? '-' : ''}{Math.round((pred.predicted_multiplier - 1) * 100)}%
                </span>
              </div>
              <div className="pred-metrics">
                <div className="metric">
                  <span className="metric-label">"comenzi baza"</span>
                  <span className="metric-value">{pred.baseline_orders}</span>
                </div>
                <div className="metric highlight">
                  <span className="metric-label">"Predicție"</span>
                  <span className="metric-value" style={{ color: getTrendColor(pred.trend) }}>
                    {pred.predicted_orders}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Venituri Est.</span>
                  <span className="metric-value">{pred.predicted_revenue} RON</span>
                </div>
              </div>
              <div className="pred-recommendation">
                💡 {pred.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Note */}
      <div className="info-note">
        ℹ️ <strong>"Notă:"</strong>"date meteo reale de la"<strong>"open meteo"</strong> (gratuit, fără API key necesar).
        Pentru alte locații, modificați coordonatele în backend.
      </div>
    </div>
  );
};

export default WeatherForecastPage;




