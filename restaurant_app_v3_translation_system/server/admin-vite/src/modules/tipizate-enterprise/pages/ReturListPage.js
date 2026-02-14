"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Retur List Page
 * Enterprise list page for Retur documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReturListPage;
var react_1 = require("react");
var TipizateListPage_1 = require("../components/TipizateListPage");
function ReturListPage() {
    return (<TipizateListPage_1.TipizateListPage type="RETUR" newRoute="/tipizate-enterprise/retur/new" detailsRouteBase="/tipizate-enterprise/retur"/>);
}
