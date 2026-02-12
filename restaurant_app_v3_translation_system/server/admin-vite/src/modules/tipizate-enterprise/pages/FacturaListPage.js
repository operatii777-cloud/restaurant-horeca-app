"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Factură List Page
 * Enterprise list page for Factură documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FacturaListPage;
var react_1 = require("react");
var TipizateListPage_1 = require("../components/TipizateListPage");
function FacturaListPage() {
    //   const { t } = useTranslation();
    return (<TipizateListPage_1.TipizateListPage type="FACTURA" newRoute="/tipizate-enterprise/factura/new" detailsRouteBase="/tipizate-enterprise/f-ac-tu-ra" t={t}/>);
}
