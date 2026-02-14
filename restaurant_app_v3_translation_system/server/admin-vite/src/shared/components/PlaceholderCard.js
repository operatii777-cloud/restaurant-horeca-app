"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceholderCard = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
require("./PlaceholderCard.css");
var PlaceholderCard = function (_a) {
    var title = _a.title, description = _a.description;
    //   const { t } = useTranslation();
    return (<div className="placeholder-card">
      <div className="placeholder-card__tag">"in lucru"</div>
      <h3 className="placeholder-card__title">{title}</h3>
      <p className="placeholder-card__description">{description}</p>
      <ul className="placeholder-card__checklist">
        <li>📡 Conectare AG Grid la API</li>
        <li>🧮 Configurare coloane dinamice + export Excel</li>
        <li>⚡ Performanță optimizată pentru dataset-uri mari</li>
      </ul>
    </div>);
};
exports.PlaceholderCard = PlaceholderCard;
