"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Aviz List Page
 * Enterprise list page for Aviz documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AvizListPage;
var react_1 = require("react");
var TipizateListPage_1 = require("../components/TipizateListPage");
function AvizListPage() {
    return (<TipizateListPage_1.TipizateListPage type="AVIZ" newRoute="/tipizate-enterprise/aviz/new" detailsRouteBase="/tipizate-enterprise/a-vi-z"/>);
}
