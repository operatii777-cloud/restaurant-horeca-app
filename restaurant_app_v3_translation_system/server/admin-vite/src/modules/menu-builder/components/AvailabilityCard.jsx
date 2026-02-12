/**
import { useTranslation } from '@/i18n/I18nContext';
 * AVAILABILITY CARD - Service types & availability rules
 * Data: 04 Decembrie 2025
 */

import { useMenuBuilderStore } from '../store/useMenuBuilderStore';
import { useShallow } from 'zustand/react/shallow';

export function AvailabilityCard() {
  const { t } = useTranslation();
  const { availability, setAvailability } = useMenuBuilderStore(
    useShallow((s) => ({
      availability: s.availability,
      setAvailability: s.setAvailability,
    }))
  );

  const toggleService = (key) => {
    setAvailability({
      serviceTypes: {
        ...availability.serviceTypes,
        [key]: !availability.serviceTypes[key],
      },
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 md:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">
            Disponibilitate
          </h2>
          <p className="text-slate-400 text-xs">
            Controlează unde și când apare produsul: sală, livrare, ridicare.
          </p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={availability.isAvailable}
            onChange={(e) =>
              setAvailability({ isAvailable: e.target.checked })
            }
            className="w-4 h-4"
          />
          <span className="text-slate-200">
            Produs disponibil pentru vânzare
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={availability.autoUnavailableWhenOutOfStock}
            onChange={(e) =>
              setAvailability({
                autoUnavailableWhenOutOfStock: e.target.checked,
              })
            }
            className="w-4 h-4"
          />
          <span className="text-slate-200">
            Dezactivează automat când stocul ajunge la 0
          </span>
        </div>

        <div>
          <span className="block text-slate-400 mb-1.5">
            Tipuri de servicii
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggleService('dineIn')}
              className={`px-3 py-1.5 rounded-full text-[11px] border transition-colors ${
                availability.serviceTypes.dineIn
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                  : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              🍽️ La masă (Dine-in)
            </button>
            <button
              type="button"
              onClick={() => toggleService('takeaway')}
              className={`px-3 py-1.5 rounded-full text-[11px] border transition-colors ${
                availability.serviceTypes.takeaway
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                  : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              🛍️ Ridicare personală
            </button>
            <button
              type="button"
              onClick={() => toggleService('delivery')}
              className={`px-3 py-1.5 rounded-full text-[11px] border transition-colors ${
                availability.serviceTypes.delivery
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                  : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              🚚 Livrare
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

