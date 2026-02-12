"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Raport Gestiune List Page
 * Enterprise list page for Raport Gestiune documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RaportGestiuneListPage;
var react_1 = require("react");
var TipizateListPage_1 = require("../components/TipizateListPage");
function RaportGestiuneListPage() {
    return (<TipizateListPage_1.TipizateListPage type="RAPORT_GESTIUNE" newRoute="/tipizate-enterprise/raport-gestiune/new" detailsRouteBase="/tipizate-enterprise/r-ap-or-tg-es-ti-un-e"/>);
}
