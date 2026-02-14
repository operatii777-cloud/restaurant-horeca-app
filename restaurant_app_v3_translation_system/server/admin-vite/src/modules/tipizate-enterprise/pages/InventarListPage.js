"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Inventar List Page
 * Enterprise list page for Inventar documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InventarListPage;
var react_1 = require("react");
var TipizateListPage_1 = require("../components/TipizateListPage");
function InventarListPage() {
    //   const { t } = useTranslation();
    return (<TipizateListPage_1.TipizateListPage type="INVENTAR" newRoute="/tipizate-enterprise/inventar/new" detailsRouteBase="/tipizate-enterprise/i-nv-en-ta-r" t={t}/>);
}
