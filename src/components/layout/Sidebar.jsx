import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from '../../img/Logo.png';
import LogoLow from '../../img/LogoLow.png';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // SVG PaperIcon (гарний документ із загнутим кутиком)
  const PaperIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" fill="#fff" stroke="#64ffda" strokeWidth="1.5"/>
      <path d="M16 3v5a2 2 0 0 0 2 2h5" stroke="#64ffda" strokeWidth="1.5" fill="none"/>
      <polyline points="16 3 21 8" fill="none" stroke="#64ffda" strokeWidth="1.5"/>
      <rect x="7" y="8" width="10" height="1.5" rx="0.75" fill="#b0b0b0"/>
      <rect x="7" y="12" width="7" height="1.5" rx="0.75" fill="#b0b0b0"/>
      <rect x="7" y="16" width="5" height="1.5" rx="0.75" fill="#b0b0b0"/>
    </svg>
  );

  // SVG SoftwareIcon (дискета/пазл)
  const SoftwareIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" fill="#fff" stroke="#64ffda" strokeWidth="1.5"/>
      <rect x="7" y="9" width="10" height="6" rx="1" fill="#64ffda"/>
      <rect x="9" y="7" width="6" height="2" rx="0.5" fill="#b0b0b0"/>
      <circle cx="12" cy="16" r="1.5" fill="#64ffda" />
    </svg>
  );

  let menuItems = [
    { path: '/', label: 'Головна', icon: '📊' },
    { path: '/workstations', label: 'АРМ', icon: '💻' },
    { path: '/tickets', label: 'Заявки', icon: <PaperIcon /> },
    { path: '/repairs', label: 'Ремонти', icon: '🔧' },
    { path: '/software', label: 'ПЗ', icon: <SoftwareIcon /> },
    { path: '/reports', label: 'Звіти', icon: '📈' },
    { path: '/settings', label: 'Налаштування', icon: '⚙️' },
  ];

  if (user?.role === 'admin') {
    menuItems.splice(5, 0, { path: '/users', label: 'Користувачі', icon: '👥' });
  }

  return (
    <aside className={`bg-dark-card border-r border-dark-border flex flex-col h-full transition-all duration-500 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
          {!isCollapsed ? (
            <div className="flex items-center">
              <img src={Logo} alt="Логотип" className="h-12 w-auto object-contain" style={{maxWidth: '180px'}} />
              <div className="ml-3 flex flex-col space-y-1">
                <div className="w-4 h-0.5 bg-primary-500 rounded"></div>
                <div className="w-4 h-0.5 bg-primary-500 rounded"></div>
                <div className="w-4 h-0.5 bg-primary-500 rounded"></div>
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={LogoLow} alt="Лого" className="h-10 w-10 object-contain" />
            </div>
          )}
        </div>
      </div>
      <nav className="flex-1 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-dark-textSecondary hover:bg-dark-border transition-colors ${
                isActive ? 'bg-dark-border text-white' : ''
              }`
            }
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            {!isCollapsed && item.label}
          </NavLink>
        ))}
      </nav>
      {!isCollapsed && (
        <div className="p-4 border-t border-dark-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-dark-textSecondary">
                {user?.role === 'admin' ? 'Адміністратор' : 'Користувач'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-dark-textSecondary hover:text-white hover:bg-dark-border rounded-lg transition-colors"
          >
            Вийти
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar; 