import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaCube } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  let menuItems = [
    { path: '/', label: 'Головна', icon: '📊' },
    { path: '/workstations', label: 'АРМ', icon: '💻' },
    { path: '/tickets', label: 'Заявки', icon: '🎫' },
    { path: '/repairs', label: 'Ремонти', icon: '🔧' },
    { path: '/software', label: 'ПЗ', icon: <FaCube /> },
    { path: '/reports', label: 'Звіти', icon: '📈' },
    { path: '/settings', label: 'Налаштування', icon: '⚙️' },
  ];

  // Додаємо пункт меню для користувачів тільки для адміністраторів
  if (user?.role === 'admin') {
    menuItems.splice(4, 0, { path: '/users', label: 'Користувачі', icon: '👥' });
  }

  return (
    <aside className={`bg-dark-card border-r border-dark-border flex flex-col h-full transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && <h1 className="text-2xl font-bold text-white">IT Support</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-dark-textSecondary hover:text-white"
        >
          <FaBars size={24} />
        </button>
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