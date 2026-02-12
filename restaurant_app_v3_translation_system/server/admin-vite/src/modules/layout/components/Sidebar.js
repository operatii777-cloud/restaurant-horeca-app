"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_router_dom_1 = require("react-router-dom");
var navigation_1 = require("@/modules/layout/constants/navigation");
require("./Sidebar.css");
var Sidebar = function () {
    //   const { t } = useTranslation();
    return (<aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">
          🍽️
        </span>
        <div>
          <div className="sidebar__title">Admin</div>
          <div className="sidebar__subtitle">Restaurant App v4</div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {navigation_1.NAVIGATION_ITEMS.map(function (item, index) { return (<react_router_dom_1.NavLink key={item.path && item.path !== '#' ? item.path : "nav-\"Index\"-".concat(item.label)} to={item.path || '#'} className={function (_a) {
                var isActive = _a.isActive;
                return "sidebar__link ".concat(isActive ? 'sidebar__link--active' : '');
            }}>
            <span className="sidebar__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="sidebar__label">
              {item.label}
              {item.badge ? (<span className="sidebar__badge" aria-hidden="true">
                  {item.badge}
                </span>) : null}
            </span>
          </react_router_dom_1.NavLink>); })}
      </nav>

      <button type="button" className="sidebar__logout">
        <span aria-hidden="true">⬅️</span>
        Logout
      </button>
    </aside>);
};
exports.Sidebar = Sidebar;
