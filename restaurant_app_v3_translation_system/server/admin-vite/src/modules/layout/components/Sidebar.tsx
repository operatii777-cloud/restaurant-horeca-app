// import { useTranslation } from '@/i18n/I18nContext';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS, type NavItem } from '@/modules/layout/constants/navigation';
import './Sidebar.css';

const NavMenuItem = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const hasValidPath = item.path && item.path !== '#';

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // If item has children, render as expandable menu
  if (hasChildren) {
    return (
      <div className="sidebar__menu-group" style={{ paddingLeft: `${depth * 12}px` }}>
        <button
          type="button"
          onClick={toggleExpand}
          className={`sidebar__link sidebar__link--expandable ${isExpanded ? 'sidebar__link--expanded' : ''}`}
        >
          <span className="sidebar__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="sidebar__label">
            {item.label}
            {item.badge && (
              <span className="sidebar__badge" aria-hidden="true">
                {item.badge}
              </span>
            )}
          </span>
          <span className={`sidebar__expand-icon ${isExpanded ? 'sidebar__expand-icon--rotated' : ''}`}>
            ▼
          </span>
        </button>
        {isExpanded && (
          <div className="sidebar__submenu">
            {item.children.map((child, idx) => (
              <NavMenuItem key={child.path || `submenu-${idx}`} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // If item has valid path, render as NavLink
  if (hasValidPath) {
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
        }
        style={{ paddingLeft: `${depth > 0 ? 12 + depth * 12 : 12}px` }}
      >
        <span className="sidebar__icon" aria-hidden="true">
          {item.icon}
        </span>
        <span className="sidebar__label">
          {item.label}
          {item.badge && (
            <span className="sidebar__badge" aria-hidden="true">
              {item.badge}
            </span>
          )}
        </span>
      </NavLink>
    );
  }

  // Fallback for items without path or children
  return null;
};

export const Sidebar = () => {
//   const { t } = useTranslation();
  return (
    <aside className="sidebar">
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
        {NAVIGATION_ITEMS.map((item, index) => (
          <NavMenuItem
            key={item.path && item.path !== '#' ? item.path : `nav-${index}-${item.label}`}
            item={item}
          />
        ))}
      </nav>

      <button type="button" className="sidebar__logout">
        <span aria-hidden="true">⬅️</span>
        Logout
      </button>
    </aside>
  );
};
