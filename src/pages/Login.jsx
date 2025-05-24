import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Переконайтесь, що axios встановлено: npm install axios

// Видаляємо: import { useApp } from '../context/AppContext';
// Оскільки логін тепер обробляється через API, а не через контекст користувачів

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Додано для індикації завантаження

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.username || !formData.password) {
      setError('Будь ласка, введіть логін та пароль.');
      setLoading(false);
      return;
    }

    try {
      // URL може бути '/api/login', якщо ви налаштували proxy у vite.config.js
      // Або повний URL, якщо proxy немає: 'http://localhost:3001/api/login'
      const response = await axios.post('/api/login', formData);

      if (response.data && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user)); // Зберігаємо дані користувача
        localStorage.setItem('token', response.data.token); // Якщо ви будете використовувати токени
        // Можливо, вам потрібно буде оновити стан у AppContext тут, якщо він використовується для автентифікації
        navigate('/'); // Перенаправлення на головну сторінку
      } else {
        // Це мало б оброблятися у catch блоці для HTTP помилок
        setError(response.data.error || 'Помилка входу. Невірна відповідь сервера.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.request) {
        setError('Не вдалося підключитися до сервера. Перевірте ваше з\'єднання.');
      } else {
        setError('Сталася невідома помилка під час входу.');
      }
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
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
            <label htmlFor="usernameInput" className="block text-dark-textSecondary mb-2">Логін</label>
            <input
              id="usernameInput"
              type="text"
              name="username" // Додано name
              value={formData.username}
              onChange={handleChange} // Змінено на handleChange
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Введіть логін"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="passwordInput" className="block text-dark-textSecondary mb-2">Пароль</label>
            <input
              id="passwordInput"
              type="password"
              name="password" // Додано name
              value={formData.password}
              onChange={handleChange} // Змінено на handleChange
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Введіть пароль"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;