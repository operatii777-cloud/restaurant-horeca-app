"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Proces Verbal List Page
 * Enterprise list page for Proces Verbal documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProcesVerbalListPage;
var react_1 = require("react");
var TipizateListPage_1 = require("../components/TipizateListPage");
function ProcesVerbalListPage() {
    return (<TipizateListPage_1.TipizateListPage type="PROCES_VERBAL" newRoute="/tipizate-enterprise/proces-verbal/new" detailsRouteBase="/tipizate-enterprise/p-ro-ce-sv-er-ba-l"/>);
}
