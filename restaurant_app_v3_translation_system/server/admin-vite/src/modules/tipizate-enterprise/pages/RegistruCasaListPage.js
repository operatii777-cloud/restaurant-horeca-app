"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Registru Casă List Page
 * Enterprise list page for Registru Casă documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RegistruCasaListPage;
var react_1 = require("react");
var TipizateListPage_1 = require("../components/TipizateListPage");
function RegistruCasaListPage() {
    //   const { t } = useTranslation();
    return (<TipizateListPage_1.TipizateListPage type="REGISTRU_CASA" newRoute="/tipizate-enterprise/registru-casa/new" detailsRouteBase="/tipizate-enterprise/r-eg-is-tr-uc-as-a" t={t}/>);
}
