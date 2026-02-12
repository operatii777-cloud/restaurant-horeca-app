"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorizontalNav = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var navigation_1 = require("@/modules/layout/constants/navigation");
require("./HorizontalNav.css");
var HorizontalNav = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(null), openDropdown = _a[0], setOpenDropdown = _a[1];
    var dropdownRefs = (0, react_1.useRef)({});
    var location = (0, react_router_dom_1.useLocation)();
    (0, react_1.useEffect)(function () {
        var handleClickOutside = function (event) {
            if (openDropdown) {
                var dropdown = dropdownRefs.current[openDropdown];
                if (dropdown && !dropdown.contains(event.target)) {
                    setOpenDropdown(null);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return function () { return document.removeEventListener('mousedown', handleClickOutside); };
    }, [openDropdown]);
    var handleToggleDropdown = function (label) {
        setOpenDropdown(openDropdown === label ? null : label);
    };
    var isActiveRoute = function (item) {
        if (item.path && item.path !== '#' && item.path === location.pathname)
            return true;
        if (item.children) {
            return item.children.some(function (child) { return child.path === location.pathname; });
        }
        return false;
    };
    return (<nav className="horizontal-nav" data-testid="admin-horizontal-nav">

      <div className="horizontal-nav__menu">
        {navigation_1.NAVIGATION_ITEMS.map(function (item, index) {
            var hasChildren = item.children && item.children.length > 0;
            var isActive = isActiveRoute(item);
            if (hasChildren) {
                return (<div key={"nav-dropdown-\"Index\"-".concat(item.label)} className={"horizontal-nav__item horizontal-nav__item--dropdown ".concat(isActive ? 'horizontal-nav__item--active' : '')} ref={function (el) {
                        dropdownRefs.current[item.label] = el;
                    }}>
                <button type="button" className="horizontal-nav__link" onClick={function () { return handleToggleDropdown(item.label); }} aria-expanded={openDropdown === item.label}>
                  <span className="horizontal-nav__icon">{item.icon}</span>
                  <span className="horizontal-nav__label">{item.label}</span>
                  <span className="horizontal-nav__arrow">▼</span>
                </button>

                {openDropdown === item.label && (<div className="horizontal-nav__dropdown">
                    {item.children.map(function (child, childIndex) {
                            // Dacă child are children (nested), afișează ca submenu
                            if (child.children && child.children.length > 0) {
                                return (<div key={"nav-submenu-\"Index\"-".concat(childIndex, "-").concat(child.label)} className="horizontal-nav__submenu">
                            <div className="horizontal-nav__submenu-header">
                              <span className="horizontal-nav__dropdown-icon">{child.icon}</span>
                              <span className="horizontal-nav__dropdown-label">{child.label}</span>
                            </div>
                            <div className="horizontal-nav__submenu-items">
                              {child.children.map(function (grandchild, grandchildIndex) {
                                        // Folosește un key unic bazat pe path, index și label pentru a evita duplicate keys
                                        var uniqueKey = grandchild.path && grandchild.path !== '#'
                                            ? "".concat(grandchild.path, "-\"Index\"-").concat(childIndex, "-").concat(grandchildIndex)
                                            : "nav-grandchild-\"Index\"-".concat(childIndex, "-").concat(grandchildIndex, "-").concat(grandchild.label);
                                        return (<react_router_dom_1.NavLink key={uniqueKey} to={grandchild.path || '#'} className={function (_a) {
                                                var isActive = _a.isActive;
                                                return "horizontal-nav__dropdown-item horizontal-nav__submenu-item ".concat(isActive ? 'horizontal-nav__dropdown-item--active' : '');
                                            }} onClick={function () { return setOpenDropdown(null); }}>
                                    <span className="horizontal-nav__dropdown-icon">{grandchild.icon}</span>
                                    <span className="horizontal-nav__dropdown-label">
                                      {grandchild.label}
                                      {grandchild.badge && (<span className="horizontal-nav__badge">{grandchild.badge}</span>)}
                                    </span>
                                  </react_router_dom_1.NavLink>);
                                    })}
                            </div>
                          </div>);
                            }
                            // Dacă child nu are children, afișează ca link normal
                            // Folosește un key unic bazat pe index și label pentru a evita duplicate keys
                            var uniqueKey = child.path && child.path !== '#'
                                ? "".concat(child.path, "-\"Index\"-").concat(childIndex)
                                : "nav-child-\"Index\"-".concat(childIndex, "-").concat(child.label);
                            return (<react_router_dom_1.NavLink key={uniqueKey} to={child.path || '#'} className={function (_a) {
                                    var isActive = _a.isActive;
                                    return "horizontal-nav__dropdown-item ".concat(isActive ? 'horizontal-nav__dropdown-item--active' : '');
                                }} onClick={function () { return setOpenDropdown(null); }}>
                          <span className="horizontal-nav__dropdown-icon">{child.icon}</span>
                          <span className="horizontal-nav__dropdown-label">
                            {child.label}
                            {child.badge && (<span className="horizontal-nav__badge">{child.badge}</span>)}
                          </span>
                        </react_router_dom_1.NavLink>);
                        })}
                  </div>)}
              </div>);
            }
            // Skip items without path or with path === '#'
            if (!item.path || item.path === '#') {
                return null;
            }
            return (<react_router_dom_1.NavLink key={item.path || "nav-link-\"Index\"-".concat(item.label)} to={item.path} className={function (_a) {
                    var isActive = _a.isActive;
                    return "horizontal-nav__item horizontal-nav__link ".concat(isActive ? 'horizontal-nav__item--active' : '');
                }}>
              <span className="horizontal-nav__icon">{item.icon}</span>
              <span className="horizontal-nav__label">{item.label}</span>
            </react_router_dom_1.NavLink>);
        })}
      </div>

    </nav>);
};
exports.HorizontalNav = HorizontalNav;
