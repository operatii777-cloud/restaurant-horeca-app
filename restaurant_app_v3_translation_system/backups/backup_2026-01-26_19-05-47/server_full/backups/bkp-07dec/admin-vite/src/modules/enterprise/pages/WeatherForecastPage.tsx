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

export const WeatherForecastPage = () => {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load current weather
      const weatherRes = await fetch('/api/weather-forecast/current');
      const weatherData = await weatherRes.json();
      if (weatherData.success) {
        setWeather(weatherData.weather);
      }

      // Load predictions
      const predRes = await fetch(`/api/weather-forecast/predictions?temperature=${weatherData.weather?.temperature || 22}&condition=${weatherData.weather?.condition || 'normal'}`);
      const predData = await predRes.json();
      if (predData.success) {
        setPredictions(predData.predictions || []);
        setRecommendations(predData.recommendations);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
          { label: '🔄 Refresh', variant: 'secondary', onClick: loadData },
        ]}
      />

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
                  <span className="no-items">Nicio categorie afectată negativ</span>
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
                  <span className="metric-label">Comenzi Bază</span>
                  <span className="metric-value">{pred.baseline_orders}</span>
                </div>
                <div className="metric highlight">
                  <span className="metric-label">Predicție</span>
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
        ℹ️ <strong>Notă:</strong> Pentru date meteo reale, configurați <code>OPENWEATHER_API_KEY</code> în variabilele de mediu.
        Momentan se folosesc date simulate pentru demo.
      </div>
    </div>
  );
};

export default WeatherForecastPage;

