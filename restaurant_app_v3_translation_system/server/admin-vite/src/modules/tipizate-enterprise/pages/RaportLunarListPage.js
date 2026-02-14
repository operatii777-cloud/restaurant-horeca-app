"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Raport Lunar List Page
 * Enterprise list page for Raport Lunar documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RaportLunarListPage;
var react_1 = require("react");
var TipizateListPage_1 = require("../components/TipizateListPage");
function RaportLunarListPage() {
    return (<TipizateListPage_1.TipizateListPage type="RAPORT_LUNAR" newRoute="/tipizate-enterprise/raport-lunar/new" detailsRouteBase="/tipizate-enterprise/r-ap-or-tl-un-ar"/>);
}
