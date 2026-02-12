/**
import { useTranslation } from '@/i18n/I18nContext';
 * INGREDIENTS CARD - Auto from Technical Sheet
 * Data: 04 Decembrie 2025
 */

  const { t } = useTranslation();
import { useMenuBuilderStore } from '../store/useMenuBuilderStore';
import { useShallow } from 'zustand/react/shallow';

export function IngredientsCard() {
  const { ingredientsSummary, setIngredientsSummary } = useMenuBuilderStore(
    useShallow((s) => ({
      ingredientsSummary: s.ingredientsSummary,
      setIngredientsSummary: s.setIngredientsSummary,
    }))
  );

  const ingredients = ingredientsSummary.fromTechnicalSheet || [];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 md:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">
            Ingrediente (din fișa tehnică)
          </h2>
          <p className="text-slate-400 text-xs">
            Lista completă vine din fișa tehnică. Poți alege ce și cum afișezi clientului.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={ingredientsSummary.showOnMenu}
            onChange={(e) =>
              setIngredientsSummary({
                showOnMenu: e.target.checked,
              })
            }
            className="w-4 h-4"
          />
          <span className="text-slate-200">
            Afișează lista de ingrediente în meniu
          </span>
        </div>

        {ingredientsSummary.showOnMenu && (
          <>
            <div>
              <label className="text-xs text-slate-300 mb-1 block">
                Titlu/etichetă pentru lista de ingrediente
              </label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                value={ingredientsSummary.customLabel}
                onChange={(e) =>
                  setIngredientsSummary({ customLabel: e.target.value })
                }
                placeholder={t('menu.productModal.ingredientsPlaceholder')}
              />
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-40 overflow-auto text-xs">
              {!ingredients.length && (
                <p className="text-slate-500">
                  Nu există ingrediente mapate din fișa tehnică.
                </p>
              )}
              {ingredients.length > 0 && (
                <p className="text-slate-100">
                  {ingredients
                    .map((ing) => ing.name || ing.ingredientName)
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

