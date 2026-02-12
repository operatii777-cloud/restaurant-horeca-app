"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S5.7 - Transfer List Page
 * Enterprise list page for Transfer documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransferListPage;
var react_1 = require("react");
var TipizateListPage_1 = require("../components/TipizateListPage");
function TransferListPage() {
    //   const { t } = useTranslation();
    return (<TipizateListPage_1.TipizateListPage type="TRANSFER" newRoute="/tipizate-enterprise/transfer/new" detailsRouteBase="/tipizate-enterprise/transfer" t={t}/>);
}
