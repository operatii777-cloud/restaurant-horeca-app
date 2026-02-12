/**
import { useTranslation } from '@/i18n/I18nContext';
 * ALLERGENS CARD - Visual allergen display
 * Data: 04 Decembrie 2025
 */

  const { t } = useTranslation();
import { useMenuBuilderStore } from '../store/useMenuBuilderStore';
import { useShallow } from 'zustand/react/shallow';

const ALLERGEN_ICON_MAP = {
  Gluten: '🌾',
  Lapte: '🥛',
  'Ouă': '🥚',
  Pește: '🐟',
  Arahide: '🥜',
  Soia: '🫘',
  Țelină: '🥬',
  Muștar: '🟡',
  Susan: '🌰',
  'Fructe cu coajă': '🥜',
  'Dioxid de sulf': '⚗️',
  Lupin: '🌱',
  Moluște: '🐚',
  Crustacee: '🦐',
};

export function AllergensCard() {
  const { allergens, setAllergens } = useMenuBuilderStore(
    useShallow((s) => ({
      allergens: s.allergens,
      setAllergens: s.setAllergens,
    }))
  );

  const toggleExtra = (name) => {
    const exists = allergens.extra.includes(name);
    setAllergens({
      extra: exists
        ? allergens.extra.filter((x) => x !== name)
        : [...allergens.extra, name],
    });
  };

  const toggleTrace = (name) => {
    const exists = allergens.traces.includes(name);
    setAllergens({
      traces: exists
        ? allergens.traces.filter((x) => x !== name)
        : [...allergens.traces, name],
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 md:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">
            {t('menu.productModal.allergens')}
          </h2>
          <p className="text-slate-400 text-xs">
            {t('menu.menuBuilder.allergensList')}
          </p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allergens.showIcons}
            onChange={(e) =>
              setAllergens({ showIcons: e.target.checked })
            }
            className="w-4 h-4"
          />
          <span className="text-slate-200">
            Afișează iconițe pentru alergeni în meniu
          </span>
        </div>

        <div>
          <span className="block text-slate-400 mb-1">
            {t('menu.productModal.allergens')}:
          </span>
          <div className="flex flex-wrap gap-1">
            {!(allergens.fromTechnicalSheet || []).length && (
              <span className="text-slate-500">
                Niciun alergen setat în fișa tehnică.
              </span>
            )}
            {(allergens.fromTechnicalSheet || []).map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-900/30 border border-red-700/60 text-red-200"
              >
                <span>{ALLERGEN_ICON_MAP[a] || '⚠️'}</span>
                <span className="text-[11px] font-semibold">
                  {a.toUpperCase()}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <span className="block text-slate-400 mb-1">
              {t('menu.menuBuilder.allergensList')}
            </span>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 flex flex-wrap gap-1">
              {Object.keys(ALLERGEN_ICON_MAP).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleExtra(a)}
                  className={`px-2 py-1 rounded-full text-[11px] flex items-center gap-1 border transition-colors ${
                    allergens.extra.includes(a)
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span>{ALLERGEN_ICON_MAP[a] || '⚠️'}</span>
                  <span>{a}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-slate-400 mb-1">
              Poate conține urme de:
            </span>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 flex flex-wrap gap-1">
              {Object.keys(ALLERGEN_ICON_MAP).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleTrace(a)}
                  className={`px-2 py-1 rounded-full text-[11px] flex items-center gap-1 border transition-colors ${
                    allergens.traces.includes(a)
                      ? 'bg-orange-500/20 border-orange-500/60 text-orange-200'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span>{ALLERGEN_ICON_MAP[a] || '⚠️'}</span>
                  <span>{a}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-300 mb-1 block">
            Text avertizare alergeni (opțional)
          </label>
          <textarea
            rows={2}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            value={allergens.warningText}
            onChange={(e) =>
              setAllergens({ warningText: e.target.value })
            }
            placeholder="Ex: Preparatele pot conține urme de alergeni din cauza utilizării echipamentelor comune."
          />
        </div>
      </div>
    </div>
  );
}

