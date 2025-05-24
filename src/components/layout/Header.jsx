import React from 'react';
import { useApp } from '../../context/AppContext'; // Оновлений шлях до AppContext
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { currentUser, logout } = useApp(); // Отримуємо currentUser та logout з контексту
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Викликаємо функцію logout з AppContext
    navigate('/login'); // Перенаправляємо на сторінку входу
  };

  return (
    <header className="bg-dark-header text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-semibold">Панель керування</h1>
        <div className="flex items-center">
          {currentUser && (
            <span className="mr-4">Вітаємо, {currentUser.full_name}!</span>
          )}
          <button
            onClick={handleLogout}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Вийти
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;