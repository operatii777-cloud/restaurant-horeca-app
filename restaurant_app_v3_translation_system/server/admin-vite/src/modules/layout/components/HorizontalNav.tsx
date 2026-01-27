// import { useTranslation } from '@/i18n/I18nContext';
import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '@/modules/layout/constants/navigation';
import './HorizontalNav.css';

export const HorizontalNav = () => {
//   const { t } = useTranslation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        const dropdown = dropdownRefs.current[openDropdown];
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const handleToggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const isActiveRoute = (item: typeof NAVIGATION_ITEMS[0]): boolean => {
    if (item.path && item.path !== '#' && item.path === location.pathname) return true;
    if (item.children) {
      return item.children.some((child) => child.path === location.pathname);
    }
    return false;
  };

  return (
    <nav className="horizontal-nav">

      <div className="horizontal-nav__menu">
        {NAVIGATION_ITEMS.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0;
          const isActive = isActiveRoute(item);

          if (hasChildren) {
            return (
              <div
                key={`nav-dropdown-"Index"-${item.label}`}
                className={`horizontal-nav__item horizontal-nav__item--dropdown ${isActive ? 'horizontal-nav__item--active' : ''}`}
                ref={(el) => {
                  dropdownRefs.current[item.label] = el;
                }}
              >
                <button
                  type="button"
                  className="horizontal-nav__link"
                  onClick={() => handleToggleDropdown(item.label)}
                  aria-expanded={openDropdown === item.label}
                >
                  <span className="horizontal-nav__icon">{item.icon}</span>
                  <span className="horizontal-nav__label">{item.label}</span>
                  <span className="horizontal-nav__arrow">▼</span>
                </button>

                {openDropdown === item.label && (
                  <div className="horizontal-nav__dropdown">
                    {item.children!.map((child, childIndex) => {
                      // Dacă child are children (nested), afișează ca submenu
                      if (child.children && child.children.length > 0) {
                        return (
                          <div key={`nav-submenu-"Index"-${childIndex}-${child.label}`} className="horizontal-nav__submenu">
                            <div className="horizontal-nav__submenu-header">
                              <span className="horizontal-nav__dropdown-icon">{child.icon}</span>
                              <span className="horizontal-nav__dropdown-label">{child.label}</span>
                            </div>
                            <div className="horizontal-nav__submenu-items">
                              {child.children.map((grandchild, grandchildIndex) => {
                                // Folosește un key unic bazat pe path, index și label pentru a evita duplicate keys
                                const uniqueKey = grandchild.path && grandchild.path !== '#' 
                                  ? `${grandchild.path}-"Index"-${childIndex}-${grandchildIndex}` 
                                  : `nav-grandchild-"Index"-${childIndex}-${grandchildIndex}-${grandchild.label}`;
                                return (
                                  <NavLink
                                    key={uniqueKey}
                                    to={grandchild.path || '#'}
                                    className={({ isActive }) =>
                                      `horizontal-nav__dropdown-item horizontal-nav__submenu-item ${isActive ? 'horizontal-nav__dropdown-item--active' : ''}`
                                    }
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    <span className="horizontal-nav__dropdown-icon">{grandchild.icon}</span>
                                    <span className="horizontal-nav__dropdown-label">
                                      {grandchild.label}
                                      {grandchild.badge && (
                                        <span className="horizontal-nav__badge">{grandchild.badge}</span>
                                      )}
                                    </span>
                                  </NavLink>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      
                      // Dacă child nu are children, afișează ca link normal
                      // Folosește un key unic bazat pe index și label pentru a evita duplicate keys
                      const uniqueKey = child.path && child.path !== '#' 
                        ? `${child.path}-"Index"-${childIndex}` 
                        : `nav-child-"Index"-${childIndex}-${child.label}`;
                      return (
                        <NavLink
                          key={uniqueKey}
                          to={child.path || '#'}
                          className={({ isActive }) =>
                            `horizontal-nav__dropdown-item ${isActive ? 'horizontal-nav__dropdown-item--active' : ''}`
                          }
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="horizontal-nav__dropdown-icon">{child.icon}</span>
                          <span className="horizontal-nav__dropdown-label">
                            {child.label}
                            {child.badge && (
                              <span className="horizontal-nav__badge">{child.badge}</span>
                            )}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Skip items without path or with path === '#'
          if (!item.path || item.path === '#') {
            return null;
          }

          return (
            <NavLink
              key={item.path || `nav-link-"Index"-${item.label}`}
              to={item.path}
              className={({ isActive }) =>
                `horizontal-nav__item horizontal-nav__link ${isActive ? 'horizontal-nav__item--active' : ''}`
              }
            >
              <span className="horizontal-nav__icon">{item.icon}</span>
              <span className="horizontal-nav__label">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

    </nav>
  );
};


