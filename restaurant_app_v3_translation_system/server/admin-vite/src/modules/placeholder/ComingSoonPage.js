"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComingSoonPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
require("./ComingSoonPage.css");
var ComingSoonPage = function (_a) {
    var title = _a.title, description = _a.description, _b = _a.highlights, highlights = _b === void 0 ? [] : _b, _c = _a.nextMilestone, nextMilestone = _c === void 0 ? 'Sprint în curs – livrare în Admin V4.' : _c;
    //   const { t } = useTranslation();
    return (<div className="coming-soon" data-page-ready="true">
      <section className="coming-soon__hero">
        <div className="coming-soon__badge">"in lucru"</div>
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="coming-soon__milestone">
          <span className="coming-soon__milestone-label">"urmatoarea etapa"</span>
          <strong>{nextMilestone}</strong>
        </div>
      </section>

      <section className="coming-soon__details">
        <article className="coming-soon__card">
          <header>
            <span aria-hidden="true">🚀</span>
            <h3>"ce pregatim"</h3>
          </header>
          <ul>
            {highlights.length ? (highlights.map(function (item) { return (<li key={item}>
                  <span aria-hidden="true">•</span>
                  {item}
                </li>); })) : (<li>
                <span aria-hidden="true">•</span>
                Integrare completă cu noul backend Admin V4.
              </li>)}
          </ul>
        </article>

        <article className="coming-soon__card coming-soon__card--secondary">
          <header>
            <span aria-hidden="true">📅</span>
            <h3>Programul sprintului</h3>
          </header>
          <ol>
            <li>Inventariere & gap analysis finalizează maparea modulelor v3 → v4.</li>
            <li>Implementare construiește componentele React + API-urile dedicate.</li>
            <li>QA pregătește suite Playwright/Jest și rulează testele end-to-end.</li>
            <li>Documentație & Compliance fac update ghiduri + checklist legal.</li>
          </ol>
        </article>
      </section>
    </div>);
};
exports.ComingSoonPage = ComingSoonPage;
