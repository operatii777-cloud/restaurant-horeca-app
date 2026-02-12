/**
import { useTranslation } from '@/i18n/I18nContext';
 * PREVIEW CARD - Live client preview
 * Data: 04 Decembrie 2025
 */

  const { t } = useTranslation();
import { useMenuBuilderStore } from '../store/useMenuBuilderStore';
import { useShallow } from 'zustand/react/shallow';

export function PreviewCard() {
  const { basicInfo, pricing, portions, allergens, media } =
    useMenuBuilderStore(
      useShallow((s) => ({
        basicInfo: s.basicInfo,
        pricing: s.pricing,
        portions: s.portions,
        allergens: s.allergens,
        media: s.media,
      }))
    );

  const defaultPortion = portions.find((p) => p.isDefault) || portions[0];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 md:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">
            Preview Client
          </h2>
          <p className="text-slate-400 text-xs">
            Așa va arăta produsul în meniul digital (client view).
          </p>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
            {media.mainImageUrl ? (
              <img
                src={media.mainImageUrl}
                alt={basicInfo.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                Fără imagine
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-slate-100 font-semibold text-sm">
                  {basicInfo.displayName || t('menu.productModal.productName')}
                </div>
                {basicInfo.descriptionShort && (
                  <div className="text-slate-400 text-xs line-clamp-2">
                    {basicInfo.descriptionShort}
                  </div>
                )}
              </div>
              {defaultPortion?.price && (
                <div className="text-right">
                  <div className="text-emerald-400 font-semibold text-sm">
                    {defaultPortion.price.toFixed
                      ? defaultPortion.price.toFixed(2)
                      : Number(defaultPortion.price).toFixed(2)}{' '}
                    {pricing.currency}
                  </div>
                  {defaultPortion.label && (
                    <div className="text-slate-500 text-[11px]">
                      {defaultPortion.label}
                    </div>
                  )}
                </div>
              )}
            </div>

            {allergens.showIcons &&
              (allergens.fromTechnicalSheet?.length ||
                allergens.extra.length) && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {[
                    ...(allergens.fromTechnicalSheet || []),
                    ...allergens.extra,
                  ]
                    .filter((v, idx, arr) => arr.indexOf(v) === idx)
                    .map((a) => (
                      <span
                        key={a}
                        className="px-2 py-0.5 rounded-full bg-red-900/30 border border-red-700/60 text-[10px] text-red-200"
                      >
                        ⚠️ {a}
                      </span>
                    ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

