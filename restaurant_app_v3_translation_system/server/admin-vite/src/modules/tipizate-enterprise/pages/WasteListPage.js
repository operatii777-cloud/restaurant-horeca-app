"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Waste List Page
 * Enterprise list page for Waste documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WasteListPage;
var react_1 = require("react");
var TipizateListPage_1 = require("../components/TipizateListPage");
function WasteListPage() {
    return (<TipizateListPage_1.TipizateListPage type="WASTE" newRoute="/tipizate-enterprise/waste/new" detailsRouteBase="/tipizate-enterprise/w-as-te" titleStyle={{ color: '#1E40AF' }} // Albastru Bleu
    />);
}
