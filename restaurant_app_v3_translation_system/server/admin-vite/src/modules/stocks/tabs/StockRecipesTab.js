"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockRecipesTab = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var RecipesPage_1 = require("@/modules/recipes/pages/RecipesPage");
require("./StockRecipesTab.css");
var StockRecipesTab = function () {
    //   const { t } = useTranslation();
    return (<div className="stock-recipes">
      <react_1.Suspense fallback={<div className="stock-recipes__loading">Se încarcă modulele de rețete…</div>}>
        <RecipesPage_1.RecipesPage />
      </react_1.Suspense>
    </div>);
};
exports.StockRecipesTab = StockRecipesTab;
