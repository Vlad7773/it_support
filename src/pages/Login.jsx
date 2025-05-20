import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Login = () => {
  const navigate = useNavigate();
  const { users } = useApp();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Перевіряємо чи існує користувач
    const user = users.find(u => u.username === formData.username);
    
    if (!user) {
      setError('Користувача не знайдено');
      return;
    }

    // Перевіряємо пароль
    if (user.password !== formData.password) {
      setError('Невірний пароль');
      return;
    }

    // Зберігаємо дані користувача в localStorage
    localStorage.setItem('user', JSON.stringify({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
    }));

    // Перенаправляємо на головну сторінку
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="bg-dark-card p-8 rounded-lg shadow-card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white">Вхід в систему</h1>
          <p className="text-dark-textSecondary mt-2">Введіть свої дані для входу</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-dark-textSecondary mb-2">Логін</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Введіть логін"
              required
            />
          </div>

          <div>
            <label className="block text-dark-textSecondary mb-2">Пароль</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Введіть пароль"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors"
          >
            Увійти
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 