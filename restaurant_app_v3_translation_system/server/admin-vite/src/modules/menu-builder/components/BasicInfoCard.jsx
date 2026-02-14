/**
import { useTranslation } from '@/i18n/I18nContext';
 * BASIC INFO CARD - Nume, Categorie, Descriere
 * Data: 04 Decembrie 2025
 */

import { useMenuBuilderStore } from '../store/useMenuBuilderStore';
import { useShallow } from 'zustand/react/shallow';

export function BasicInfoCard() {
  const { t } = useTranslation();
  const {
    basicInfo,
    categories,
    validationErrors,
    setBasicInfo,
  } = useMenuBuilderStore(
    useShallow((s) => ({
      basicInfo: s.basicInfo,
      categories: s.categories,
      validationErrors: s.validationErrors,
      setBasicInfo: s.setBasicInfo,
    }))
  );

  const handleChange = (field) => (e) => {
    setBasicInfo({ [field]: e.target.value });
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 md:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">
            Informații de bază
          </h2>
          <p className="text-slate-400 text-xs">
            Nume produs, categorie, descriere – ce vede clientul în meniu.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-300 mb-1 block">
            Nume afișat în meniu *
          </label>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={basicInfo.displayName}
            onChange={handleChange('displayName')}
            placeholder={t('menu.productModal.productNamePlaceholder')}
          />
          {validationErrors.basicInfo_displayName && (
            <p className="text-xs text-red-400 mt-1">
              {validationErrors.basicInfo_displayName}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs text-slate-300 mb-1 block">
            Nume intern (rapoarte)
          </label>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            value={basicInfo.internalName}
            onChange={handleChange('internalName')}
            placeholder={t('menu.productModal.productNameEnPlaceholder')}
          />
        </div>

        <div>
          <label className="text-xs text-slate-300 mb-1 block">
            Categoria *
          </label>
          <select
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            value={basicInfo.categoryId || ''}
            onChange={(e) =>
              setBasicInfo({ categoryId: e.target.value || null })
            }
          >
            <option value="">Alege categorie...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {validationErrors.basicInfo_categoryId && (
            <p className="text-xs text-red-400 mt-1">
              {validationErrors.basicInfo_categoryId}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs text-slate-300 mb-1 block">
            Etichete (tag-uri)
          </label>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            value={basicInfo.tags.join(', ')}
            onChange={(e) =>
              setBasicInfo({
                tags: e.target.value
                  .split(',')
                  .map((x) => x.trim())
                  .filter(Boolean),
              })
            }
            placeholder={t('common.category')}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-300 mb-1 block">
            Descriere scurtă (apare în meniu)
          </label>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            value={basicInfo.descriptionShort}
            onChange={handleChange('descriptionShort')}
            placeholder={t('menu.productModal.descriptionRoPlaceholder')}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-300 mb-1 block">
            Descriere detaliată (opțional)
          </label>
          <textarea
            rows={3}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            value={basicInfo.descriptionLong}
            onChange={handleChange('descriptionLong')}
            placeholder={t('menu.productModal.descriptionEnPlaceholder')}
          />
        </div>
      </div>
    </div>
  );
}

