import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '@/modules/layout/constants/navigation';
import './HorizontalNav.css';

export const HorizontalNav = () => {
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
        {NAVIGATION_ITEMS.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isActive = isActiveRoute(item);

          if (hasChildren) {
            return (
              <div
                key={item.label}
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
                    {item.children!.map((child) => (
                      <NavLink
                        key={child.path}
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
                    ))}
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
              key={item.path}
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

