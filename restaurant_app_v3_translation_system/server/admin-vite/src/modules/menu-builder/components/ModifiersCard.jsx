/**
import { useTranslation } from '@/i18n/I18nContext';
 * MODIFIERS CARD - Extras, Toppings, Combos
 * Data: 04 Decembrie 2025
 * CRITICAL FEATURE - Lipsea complet din aplicație
 */
  const { t } = useTranslation();
import React, { useState } from 'react';
import { useMenuBuilderStore } from '../store/useMenuBuilderStore';
import { useShallow } from 'zustand/react/shallow';

export function ModifiersCard() {
  const {
    modifiers,
    modifierGroupsAvailable,
    addModifierGroup,
    removeModifierGroup,
    updateModifierGroup,
  } = useMenuBuilderStore(
    useShallow((s) => ({
      modifiers: s.modifiers,
      modifierGroupsAvailable: s.modifierGroupsAvailable,
      addModifierGroup: s.addModifierGroup,
      removeModifierGroup: s.removeModifierGroup,
      updateModifierGroup: s.updateModifierGroup,
    }))
  );

  const [showAddModal, setShowAddModal] = useState(false);

  const linkedGroupIds = modifiers.groups.map((g) => g.id);
  const availableGroups = modifierGroupsAvailable.filter(
    (g) => !linkedGroupIds.includes(g.id)
  );

  const handleAddGroup = (group) => {
    addModifierGroup({
      ...group,
      is_required: false,
      display_order: modifiers.groups.length,
    });
    setShowAddModal(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 md:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">
            {t('menu.modifiers.title')}
          </h2>
          <p className="text-slate-400 text-xs">
            <strong className="text-amber-400">{t('common.info')}</strong> {t('menu.productModal.customizationsSubtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          {t('menu.menuBuilder.addModifier')}
        </button>
      </div>

      {/* Lista modificatori legați */}
      <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
        {!modifiers.groups.length && (
          <div className="p-4 text-center">
            <p className="text-slate-400 text-sm mb-2">
              Nu există modificatori setați pentru acest produs.
            </p>
            <p className="text-slate-500 text-xs">
              Exemplu: "Extra Brânză (+3 lei)", "Alege Sosul", "Dimensiune Băutură"
            </p>
          </div>
        )}

        {modifiers.groups.map((group, idx) => (
          <div key={group.id} className="p-3 bg-slate-950/40">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-100 font-medium text-sm">
                    {group.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                    {group.type === 'single' && 'Selectare unică'}
                    {group.type === 'multiple' && 'Selectare multiplă'}
                    {group.type === 'combo' && 'Combo'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={group.is_required || false}
                      onChange={(e) =>
                        updateModifierGroup(group.id, {
                          is_required: e.target.checked,
                        })
                      }
                      className="w-3.5 h-3.5"
                    />
                    <span className="text-slate-300">Obligatoriu</span>
                  </label>

                  {group.items && group.items.length > 0 && (
                    <span className="text-slate-500">
                      {group.items.length} opțiuni
                    </span>
                  )}
                </div>

                {group.items && group.items.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {group.items.slice(0, 5).map((item) => (
                      <span
                        key={item.id}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {item.name}
                        {item.price_delta > 0 && (
                          <span className="text-emerald-400 ml-1">
                            +{item.price_delta} RON
                          </span>
                        )}
                      </span>
                    ))}
                    {group.items.length > 5 && (
                      <span className="text-[11px] text-slate-500">
                        +{group.items.length - 5} mai multe
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeModifierGroup(group.id)}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors"
              >
                Șterge
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal adăugare modificator */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">
                Alege modificator
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {availableGroups.length === 0 && (
              <p className="text-slate-400 text-sm">
                {t('menu.menuBuilder.noModifiers')}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleAddGroup(group)}
                  className="p-3 bg-slate-950 border border-slate-700 rounded-lg text-left hover:border-emerald-500/50 transition-colors"
                >
                  <div className="font-medium text-slate-100 text-sm mb-1">
                    {group.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {group.type === 'single' && '📍 Selectare unică'}
                    {group.type === 'multiple' && '☑️ Selectare multiplă'}
                    {group.type === 'combo' && '🎁 Combo'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

