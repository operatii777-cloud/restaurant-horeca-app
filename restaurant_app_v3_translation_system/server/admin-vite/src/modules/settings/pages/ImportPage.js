"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var ComingSoonPage_1 = require("@/modules/placeholder/ComingSoonPage");
var ImportPage = function () {
    //   const { t } = useTranslation();
    return (<div className="page">
      <ComingSoonPage_1.ComingSoonPage title="Import Date" description="Import date în sistem - în dezvoltare" highlights={[
            'Import produse și categorii',
            'Import comenzi și clienți',
            'Import stocuri și inventar',
        ]} nextMilestone="Implementare în Admin V4 - Sprint următor"/>
    </div>);
};
exports.ImportPage = ImportPage;
