"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Raport X List Page
 * Enterprise list page for Raport X documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RaportXListPage;
var react_1 = require("react");
var TipizateListPage_1 = require("../components/TipizateListPage");
function RaportXListPage() {
    return (<TipizateListPage_1.TipizateListPage type="RAPORT_X" newRoute="/tipizate-enterprise/raport-x/new" detailsRouteBase="/tipizate-enterprise/r-ap-or-tx"/>);
}
