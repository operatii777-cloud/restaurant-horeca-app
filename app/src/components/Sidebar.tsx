import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/orders', label: '📋 Orders', group: 'Operations' },
  { path: '/war-room', label: '🖥️ War Room', group: 'Operations' },
  { path: '/supply-chain', label: '📦 Supply Chain', group: 'Operations' },
  { path: '/dark-kitchen', label: '🍳 Dark Kitchen', group: 'Operations' },
  { path: '/labor', label: '👥 Labor AI', group: 'Operations' },
  { path: '/guests', label: '🪪 Guest Identity', group: 'Guests & Revenue' },
  { path: '/superapp', label: '📱 SuperApp', group: 'Guests & Revenue' },
  { path: '/revenue', label: '📈 Revenue Science', group: 'Guests & Revenue' },
  { path: '/financial', label: '💰 Financial CFO', group: 'Guests & Revenue' },
  { path: '/payments', label: '💳 Payments', group: 'Guests & Revenue' },
  { path: '/franchise', label: '🏪 Franchise', group: 'Enterprise' },
  { path: '/risk', label: '🔒 Risk Engine', group: 'Enterprise' },
  { path: '/data-network', label: '🌐 Data Network', group: 'Enterprise' },
  { path: '/api-economy', label: '⚙️ API Economy', group: 'Enterprise' },
  { path: '/experience', label: '✨ Experience', group: 'Enterprise' },
  { path: '/infrastructure', label: '🛠️ Infrastructure', group: 'Enterprise' },
  { path: '/audit-logs', label: '📝 Audit Logs', group: 'Enterprise' },
];

const groups = ['Operations', 'Guests & Revenue', 'Enterprise'];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <span className="sidebar-logo">🍽️ Horeca</span>}
        <button className="sidebar-toggle" onClick={() => setCollapsed(c => !c)}>
          {collapsed ? '→' : '←'}
        </button>
      </div>
      {groups.map(group => (
        <div key={group} className="sidebar-group">
          {!collapsed && <div className="sidebar-group-label">{group}</div>}
          {navItems.filter(i => i.group === group).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              title={item.label}
            >
              {collapsed ? item.label.split(' ')[0] : item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
