// import { useTranslation } from '@/i18n/I18nContext';
import { Suspense } from 'react';
import { RecipesPage } from '@/modules/recipes/pages/RecipesPage';
import './StockRecipesTab.css';

export const StockRecipesTab = () => {
//   const { t } = useTranslation();
  return (
    <div className="stock-recipes">
      <Suspense fallback={<div className="stock-recipes__loading">Se încarcă modulele de rețete…</div>}>
        <RecipesPage />
      </Suspense>
    </div>
  );
};
