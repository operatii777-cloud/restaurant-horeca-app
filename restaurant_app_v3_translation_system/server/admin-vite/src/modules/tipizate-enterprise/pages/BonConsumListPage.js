"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Bon Consum List Page
 * Enterprise list page for Bon Consum documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BonConsumListPage;
var react_1 = require("react");
var TipizateListPage_1 = require("../components/TipizateListPage");
function BonConsumListPage() {
    return (<TipizateListPage_1.TipizateListPage type="BON_CONSUM" newRoute="/tipizate-enterprise/bon-consum/new" detailsRouteBase="/tipizate-enterprise/b-on-co-ns-um"/>);
}
