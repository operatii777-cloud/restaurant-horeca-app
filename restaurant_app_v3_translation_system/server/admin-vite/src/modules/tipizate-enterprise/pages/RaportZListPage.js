"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Raport Z List Page
 * Enterprise list page for Raport Z documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RaportZListPage;
var react_1 = require("react");
var TipizateListPage_1 = require("../components/TipizateListPage");
function RaportZListPage() {
    return (<TipizateListPage_1.TipizateListPage type="RAPORT_Z" newRoute="/tipizate-enterprise/raport-z/new" detailsRouteBase="/tipizate-enterprise/r-ap-or-tz"/>);
}
