"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var ComingSoonPage_1 = require("@/modules/placeholder/ComingSoonPage");
var ExportPage = function () {
    //   const { t } = useTranslation();
    return (<div className="page">
      <ComingSoonPage_1.ComingSoonPage title="Export Date" description="Export date din sistem - în dezvoltare" highlights={[
            'Export rapoarte Excel/CSV',
            'Export date pentru contabilitate',
            'Export pentru integrare cu alte sisteme',
        ]} nextMilestone="Implementare în Admin V4 - Sprint următor"/>
    </div>);
};
exports.ExportPage = ExportPage;
