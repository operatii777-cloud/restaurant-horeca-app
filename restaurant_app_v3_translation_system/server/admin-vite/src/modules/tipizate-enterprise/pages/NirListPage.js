"use strict";
/**
 * PHASE S5.7 - NIR List Page
 * Enterprise list page for NIR documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NirListPage;
var react_1 = require("react");
// import { useTranslation } from '@/i18n/I18nContext';
var TipizateListPage_1 = require("../components/TipizateListPage");
function NirListPage() {
    //   const { t } = useTranslation();
    return (<TipizateListPage_1.TipizateListPage type="NIR" newRoute="/kiosk/tipizate-enterprise/nir/new" detailsRouteBase="/kiosk/tipizate-enterprise/nir" t={t}/>);
}
