"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogOnlinePage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var ComingSoonPage_1 = require("@/modules/placeholder/ComingSoonPage");
var CatalogOnlinePage = function () {
    //   const { t } = useTranslation();
    return (<div className="page">
      <ComingSoonPage_1.ComingSoonPage title="categorii in magazinul online" description="Gestionare categorii pentru magazinul online - în dezvoltare" highlights={[
            'Gestionare categorii produse pentru e-commerce',
            'Sincronizare cu platforma online',
            'Configurare afișare și sortare',
        ]} nextMilestone="Implementare în Admin V4 - Sprint următor"/>
    </div>);
};
exports.CatalogOnlinePage = CatalogOnlinePage;
