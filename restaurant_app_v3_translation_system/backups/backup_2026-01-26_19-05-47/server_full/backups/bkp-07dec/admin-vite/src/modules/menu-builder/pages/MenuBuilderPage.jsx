/**
 * MENU BUILDER PAGE - Pagina principală completă
 * Data: 04 Decembrie 2025
 * Unificare: Product + Recipe + Technical Sheet + Menu Item + Modifiers
 */

import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMenuBuilderStore } from '../store/useMenuBuilderStore';
import { useShallow } from 'zustand/react/shallow';
import { BasicInfoCard } from '../components/BasicInfoCard';
import { PortionsCard } from '../components/PortionsCard';
import { IngredientsCard } from '../components/IngredientsCard';
import { AllergensCard } from '../components/AllergensCard';
import { ModifiersCard } from '../components/ModifiersCard';
import { AvailabilityCard } from '../components/AvailabilityCard';
import { PreviewCard } from '../components/PreviewCard';

export function MenuBuilderPage() {
  const [searchParams] = useSearchParams();

  const {
    loading,
    saving,
    dirty,
    mode,
    loadInitialData,
    save,
  } = useMenuBuilderStore(
    useShallow((s) => ({
      loading: s.loading,
      saving: s.saving,
      dirty: s.dirty,
      mode: s.mode,
      loadInitialData: s.loadInitialData,
      save: s.save,
    }))
  );

  const menuItemId = searchParams.get('menuItemId') || null;
  const productId = searchParams.get('productId') || null;
  const restaurantId = searchParams.get('restaurantId') || null;

  useEffect(() => {
    loadInitialData({ menuItemId, productId, restaurantId });
  }, [menuItemId, productId, restaurantId, loadInitialData]);

  const handleSave = async () => {
    const result = await save();
    if (!result.ok) {
      console.error('Save error', result);
      alert('Eroare la salvare: ' + (result.error?.message || result.reason));
    } else {
      alert('✅ Produs salvat cu succes!');
    }
  };

  return (
    <div className="flex flex-col h-full gap-3 md:gap-4 p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
            🔥 Menu Builder
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'create'
              ? 'Creează un produs complet de meniu plecând de la rețetă și fișa tehnică.'
              : 'Editează configurarea produsului în meniu.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="text-[11px] text-amber-300">
              • Modificări nesalvate
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-xs font-semibold text-white transition-colors"
          >
            {saving ? 'Se salvează...' : '💾 Salvează produsul'}
          </button>
        </div>
      </div>

      {/* BODY */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
            <span>Se încarcă Builder Menu...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[2fr,1fr] gap-3 md:gap-4">
          {/* Col stânga */}
          <div className="flex flex-col gap-3 md:gap-4">
            <BasicInfoCard />
            <PortionsCard />
            <IngredientsCard />
            <AllergensCard />
            <ModifiersCard />
            <AvailabilityCard />
          </div>

          {/* Col dreapta: Preview + viitoare extensii */}
          <div className="flex flex-col gap-3 md:gap-4">
            <PreviewCard />
            
            {/* Placeholder pentru viitoare features */}
            <div className="bg-slate-900/50 border border-slate-700/50 border-dashed rounded-2xl p-4 text-center">
              <p className="text-slate-500 text-xs">
                Aici vor apărea: Dynamic Pricing, Upload Poze, etc.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuBuilderPage;

