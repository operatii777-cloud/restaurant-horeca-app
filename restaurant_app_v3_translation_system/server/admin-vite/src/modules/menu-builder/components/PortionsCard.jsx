/**
import { useTranslation } from '@/i18n/I18nContext';
 * PORTIONS CARD - S/M/L Portions + Pricing
 * Data: 04 Decembrie 2025
 */

import { useMenuBuilderStore } from '../store/useMenuBuilderStore';
import { useShallow } from 'zustand/react/shallow';

export function PortionsCard() {
  const { t } = useTranslation();
  const {
    portions,
    pricing,
    validationErrors,
    addPortion,
    updatePortion,
    removePortion,
  } = useMenuBuilderStore(
    useShallow((s) => ({
      portions: s.portions,
      pricing: s.pricing,
      validationErrors: s.validationErrors,
      addPortion: s.addPortion,
      updatePortion: s.updatePortion,
      removePortion: s.removePortion,
    }))
  );

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 md:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">
            Porții & Prețuri
          </h2>
          <p className="text-slate-400 text-xs">
            Setează porțiile (S/M/L) și prețurile. Costul vine din fișa tehnică.
          </p>
        </div>
        <button
          type="button"
          onClick={addPortion}
          className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          {t('menu.menuBuilder.addPortion')}
        </button>
      </div>

      <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
        {!portions.length && (
          <div className="p-3 text-xs text-slate-400">
            {t('menu.menuBuilder.noPortion')}
          </div>
        )}
        
        {portions.map((p) => (
          <div
            key={p.id}
            className="p-3 flex flex-col gap-2 bg-slate-950/40"
          >
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={(e) =>
                    updatePortion(p.id, { enabled: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-slate-200 font-medium">
                  {p.label || p.code}
                </span>
                {p.isDefault && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40">
                    implicit
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => removePortion(p.id)}
                className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
              >
                Șterge
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Cod</label>
                <input
                  type="text"
                  value={p.code}
                  onChange={(e) =>
                    updatePortion(p.id, { code: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-400 mb-1">
                  Denumire porție
                </label>
                <input
                  type="text"
                  value={p.label}
                  onChange={(e) =>
                    updatePortion(p.id, { label: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-100"
                  placeholder="Ex: Mică (25cm)"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">
                  Gramaj net (g)
                </label>
                <input
                  type="number"
                  value={p.grams ?? ''}
                  onChange={(e) =>
                    updatePortion(p.id, { grams: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">
                  Preț vânzare {pricing.currency}
                </label>
                <input
                  type="number"
                  value={p.price ?? ''}
                  onChange={(e) =>
                    updatePortion(p.id, { price: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">
                  {t('menu.menuBuilder.defaultPortion')}
                </label>
                <input
                  type="radio"
                  name="defaultPortion"
                  checked={p.isDefault}
                  onChange={() =>
                    portions.forEach((pp) =>
                      updatePortion(pp.id, {
                        isDefault: pp.id === p.id,
                      })
                    )
                  }
                  className="w-4 h-4"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
              <div>
                <span className="block text-slate-500">Cost / porție</span>
                <span className="font-mono">
                  {p.cost != null ? `${p.cost.toFixed(2)} ${pricing.currency}` : '–'}
                </span>
              </div>
              <div>
                <span className="block text-slate-500">% marjă</span>
                <span className="font-mono">
                  {p.margin != null ? `${p.margin.toFixed(1)}%` : '–'}
                </span>
              </div>
              <div>
                <span className="block text-slate-500">% markup</span>
                <span className="font-mono">
                  {p.cost && p.price
                    ? `${(((p.price - p.cost) / p.cost) * 100).toFixed(1)}%`
                    : '–'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {validationErrors.portions && (
        <p className="text-xs text-red-400 mt-1">
          {validationErrors.portions}
        </p>
      )}
    </div>
  );
}

