import { useState, useEffect } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { httpClient } from '@/shared/api/httpClient';
import './RestaurantConfigPage.css';

interface RestaurantConfig {
  name: string;
  address: string;
  phone: string;
  email: string;
  cui: string;
  regCom: string;
  bank: string;
  iban: string;
  fiscalSeries: string;
  invoiceSeries: string;
  vatFood: number;
  vatDrinks: number;
}

// Mapare între structura frontend și backend
function mapBackendToFrontend(backend: any): RestaurantConfig {
  return {
    name: backend.restaurant_name || backend.name || '',
    address: backend.restaurant_address || backend.address || '',
    phone: backend.restaurant_phone || backend.phone || '',
    email: backend.restaurant_email || backend.email || '',
    cui: backend.restaurant_cui || backend.cui || '',
    regCom: backend.restaurant_reg_com || backend.regCom || '',
    bank: backend.restaurant_bank || backend.bank || '',
    iban: backend.restaurant_iban || backend.iban || '',
    fiscalSeries: backend.fiscal_series || backend.fiscalSeries || 'RC',
    invoiceSeries: backend.invoice_series || backend.invoiceSeries || 'INV',
    vatFood: parseFloat(backend.vat_food || backend.vatFood || '11'),
    vatDrinks: parseFloat(backend.vat_drinks || backend.vatDrinks || '21'),
  };
}

function mapFrontendToBackend(frontend: RestaurantConfig): any {
  return {
    restaurant_name: frontend.name,
    restaurant_address: frontend.address,
    restaurant_phone: frontend.phone,
    restaurant_email: frontend.email,
    restaurant_cui: frontend.cui,
    restaurant_reg_com: frontend.regCom,
    restaurant_bank: frontend.bank,
    restaurant_iban: frontend.iban,
    fiscal_series: frontend.fiscalSeries,
    invoice_series: frontend.invoiceSeries,
    vat_food: frontend.vatFood.toString(),
    vat_drinks: frontend.vatDrinks.toString(),
  };
}

export const RestaurantConfigPage = () => {
  const [config, setConfig] = useState<RestaurantConfig>({
    name: '',
    address: '',
    phone: '',
    email: '',
    cui: '',
    regCom: '',
    bank: '',
    iban: '',
    fiscalSeries: 'RC',
    invoiceSeries: 'INV',
    vatFood: 11,
    vatDrinks: 21,
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: existingConfig, loading: isLoading } = useApiQuery<RestaurantConfig>('/api/settings/restaurant');
  const { mutate: saveConfig, loading: isSaving } = useApiMutation<RestaurantConfig>();

  useEffect(() => {
    if (existingConfig) {
      const mapped = mapBackendToFrontend(existingConfig);
      setConfig(mapped);
    }
  }, [existingConfig]);

  const handleChange = (field: keyof RestaurantConfig, value: string | number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const backendData = mapFrontendToBackend(config);
    saveConfig({
      url: '/api/settings/restaurant',
      method: 'PUT',
      data: backendData,
    })
      .then(() => {
        setFeedback({ type: 'success', message: 'Configurația a fost salvată cu succes!' });
      })
      .catch((error: Error) => {
        setFeedback({ type: 'error', message: error.message || 'Eroare la salvarea configurației' });
      });
  };

  const handleReload = async () => {
    try {
      const response = await httpClient.get<any>('/api/settings/restaurant');
      if (response.data) {
        const mapped = mapBackendToFrontend(response.data);
        setConfig(mapped);
        setFeedback({ type: 'success', message: 'Datele au fost reîncărcate' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Eroare la reîncărcarea datelor' });
    }
  };

  if (isLoading) {
    return <div className="restaurant-config-loading">Se încarcă configurația...</div>;
  }

  return (
    <div className="restaurant-config-page">
      <div className="restaurant-config-page__alert">
        <InlineAlert
          variant="info"
          message="Aceste date vor apărea pe toate documentele fiscale (bonuri fiscale, facturi, chitanțe). Asigurați-vă că introduceți datele corecte ale persoanei juridice."
        />
      </div>

      {feedback && (
        <InlineAlert
          variant={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="restaurant-config-form">
        <div className="restaurant-config-form__section">
          <h3 className="restaurant-config-form__section-title">
            <span className="restaurant-config-form__section-icon">🏢</span>
            Date Persoană Juridică
          </h3>

          <div className="restaurant-config-form__grid">
            <div className="restaurant-config-form__field">
              <label htmlFor="restaurantName" className="restaurant-config-form__label">
                Numele Restaurantului <span className="required">*</span>
              </label>
              <input
                type="text"
                id="restaurantName"
                className="restaurant-config-form__input"
                value={config.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="ex: Restaurant Trattoria"
                required
              />
              <small className="restaurant-config-form__help">Numele complet al restaurantului</small>
            </div>

            <div className="restaurant-config-form__field restaurant-config-form__field--full">
              <label htmlFor="restaurantAddress" className="restaurant-config-form__label">
                Adresa Completă <span className="required">*</span>
              </label>
              <textarea
                id="restaurantAddress"
                className="restaurant-config-form__input"
                rows={3}
                value={config.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="ex: Strada Principală 123, Sector 1, București"
                required
              />
              <small className="restaurant-config-form__help">Adresa completă cu sectorul și orașul</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="restaurantPhone" className="restaurant-config-form__label">Telefon</label>
              <input
                type="tel"
                id="restaurantPhone"
                className="restaurant-config-form__input"
                value={config.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="ex: 021.123.4567"
              />
              <small className="restaurant-config-form__help">Numărul de telefon al restaurantului</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="restaurantEmail" className="restaurant-config-form__label">Email</label>
              <input
                type="email"
                id="restaurantEmail"
                className="restaurant-config-form__input"
                value={config.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="ex: contact@restaurant.ro"
              />
              <small className="restaurant-config-form__help">Adresa de email pentru contact</small>
            </div>
          </div>
        </div>

        <div className="restaurant-config-form__section">
          <h3 className="restaurant-config-form__section-title">
            <span className="restaurant-config-form__section-icon">📄</span>
            Date Fiscale
          </h3>

          <div className="restaurant-config-form__grid">
            <div className="restaurant-config-form__field">
              <label htmlFor="restaurantCUI" className="restaurant-config-form__label">
                Cod Fiscal (CUI) <span className="required">*</span>
              </label>
              <input
                type="text"
                id="restaurantCUI"
                className="restaurant-config-form__input"
                value={config.cui}
                onChange={(e) => handleChange('cui', e.target.value)}
                placeholder="ex: RO12345678"
                required
              />
              <small className="restaurant-config-form__help">Codul de identificare fiscală</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="restaurantRegCom" className="restaurant-config-form__label">
                Registrul Comerțului
              </label>
              <input
                type="text"
                id="restaurantRegCom"
                className="restaurant-config-form__input"
                value={config.regCom}
                onChange={(e) => handleChange('regCom', e.target.value)}
                placeholder="ex: J40/1234/2023"
              />
              <small className="restaurant-config-form__help">Numărul din Registrul Comerțului</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="restaurantBank" className="restaurant-config-form__label">Banca</label>
              <input
                type="text"
                id="restaurantBank"
                className="restaurant-config-form__input"
                value={config.bank}
                onChange={(e) => handleChange('bank', e.target.value)}
                placeholder="ex: Banca Transilvania"
              />
              <small className="restaurant-config-form__help">Numele băncii</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="restaurantIBAN" className="restaurant-config-form__label">IBAN</label>
              <input
                type="text"
                id="restaurantIBAN"
                className="restaurant-config-form__input"
                value={config.iban}
                onChange={(e) => handleChange('iban', e.target.value)}
                placeholder="ex: RO49BTRL1234567890123456"
              />
              <small className="restaurant-config-form__help">Contul bancar IBAN</small>
            </div>
          </div>
        </div>

        <div className="restaurant-config-form__section">
          <h3 className="restaurant-config-form__section-title">
            <span className="restaurant-config-form__section-icon">⚙️</span>
            Settings Documente Fiscale
          </h3>

          <div className="restaurant-config-form__grid">
            <div className="restaurant-config-form__field">
              <label htmlFor="fiscalSeries" className="restaurant-config-form__label">Seria Documentelor</label>
              <input
                type="text"
                id="fiscalSeries"
                className="restaurant-config-form__input"
                value={config.fiscalSeries}
                onChange={(e) => handleChange('fiscalSeries', e.target.value)}
                placeholder="ex: RC"
                maxLength={5}
              />
              <small className="restaurant-config-form__help">Seria pentru bonuri fiscale (ex: RC)</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="invoiceSeries" className="restaurant-config-form__label">Seria Facturilor</label>
              <input
                type="text"
                id="invoiceSeries"
                className="restaurant-config-form__input"
                value={config.invoiceSeries}
                onChange={(e) => handleChange('invoiceSeries', e.target.value)}
                placeholder="ex: INV"
                maxLength={5}
              />
              <small className="restaurant-config-form__help">Seria pentru facturi (ex: INV)</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="vatFood" className="restaurant-config-form__label">TVA Alimente (%)</label>
              <input
                type="number"
                id="vatFood"
                className="restaurant-config-form__input"
                value={config.vatFood}
                onChange={(e) => handleChange('vatFood', parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
                step={0.01}
              />
              <small className="restaurant-config-form__help">TVA pentru alimente și mâncare</small>
            </div>

            <div className="restaurant-config-form__field">
              <label htmlFor="vatDrinks" className="restaurant-config-form__label">TVA Beverages (%)</label>
              <input
                type="number"
                id="vatDrinks"
                className="restaurant-config-form__input"
                value={config.vatDrinks}
                onChange={(e) => handleChange('vatDrinks', parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
                step={0.01}
              />
              <small className="restaurant-config-form__help">TVA pentru băuturi alcoolice și non-alcoolice</small>
            </div>
          </div>
        </div>

        <div className="restaurant-config-form__actions">
          <button type="button" className="restaurant-config-form__button restaurant-config-form__button--secondary" onClick={handleReload}>
            🔄 Reîncarcă Datele
          </button>
          <button type="submit" className="restaurant-config-form__button restaurant-config-form__button--primary" disabled={isSaving}>
            {isSaving ? 'Se salvează...' : '💾 Salvează Configurația'}
          </button>
        </div>
      </form>
    </div>
  );
};

