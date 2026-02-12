"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Chitanță List Page
 * Enterprise list page for Chitanță documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChitantaListPage;
var react_1 = require("react");
var TipizateListPage_1 = require("../components/TipizateListPage");
function ChitantaListPage() {
    //   const { t } = useTranslation();
    return (<TipizateListPage_1.TipizateListPage type="CHITANTA" newRoute="/tipizate-enterprise/chitanta/new" detailsRouteBase="/tipizate-enterprise/c-hi-ta-nt-a" t={t}/>);
}
