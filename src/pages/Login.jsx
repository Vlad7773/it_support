import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Тимчасово хардкодимо адміна для тестування
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'admin',
        role: 'admin',
        name: 'Адміністратор'
      }));
      navigate('/');
    } else {
      setError('Невірний логін або пароль');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="bg-dark-card p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Вхід в систему</h1>
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-dark-textSecondary mb-2" htmlFor="username">
              Логін
            </label>
            <input
              id="username"
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-dark-border text-white focus:outline-none focus:border-primary-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-dark-textSecondary mb-2" htmlFor="password">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-dark-border text-white focus:outline-none focus:border-primary-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Увійти
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 