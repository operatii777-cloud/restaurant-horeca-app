// import { useTranslation } from '@/i18n/I18nContext';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '@/modules/layout/constants/navigation';
import './Sidebar.css';

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
          <NavLink
            key={item.path && item.path !== '#' ? item.path : `nav-"Index"-${item.label}`}
            to={item.path || '#'}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <span className="sidebar__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="sidebar__label">
              {item.label}
              {item.badge ? (
                <span className="sidebar__badge" aria-hidden="true">
                  {item.badge}
                </span>
              ) : null}
            </span>
          </NavLink>
        ))}
      </nav>

      <button type="button" className="sidebar__logout">
        <span aria-hidden="true">⬅️</span>
        Logout
      </button>
    </aside>
  );
};
