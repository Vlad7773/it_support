import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const Settings = () => {
  const { settings: globalSettings, updateSettings } = useAppContext();
  const [settings, setSettings] = useState(globalSettings);

  useEffect(() => {
    // Завантажуємо налаштування з localStorage при монтуванні
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      updateSettings(parsedSettings);
    }
  }, []);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    updateSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };

  const handleThemeChange = (theme) => {
    const newSettings = { ...settings, theme };
    saveSettings(newSettings);
  };

  const handleLanguageChange = (language) => {
    const newSettings = { ...settings, language };
    saveSettings(newSettings);
  };

  const handleNotificationChange = (type, value) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [type]: value
      }
    };
    saveSettings(newSettings);
  };

  const handleDisplayChange = (type, value) => {
    const newSettings = {
      ...settings,
      display: {
        ...settings.display,
        [type]: value
      }
    };
    saveSettings(newSettings);
  };

  const handleSecurityChange = (type, value) => {
    const newSettings = {
      ...settings,
      security: {
        ...settings.security,
        [type]: value
      }
    };
    saveSettings(newSettings);
  };

  const handleBackupChange = (type, value) => {
    const newSettings = {
      ...settings,
      backup: {
        ...settings.backup,
        [type]: value
      }
    };
    saveSettings(newSettings);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Налаштування</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Тема */}
        <div className="bg-dark-card p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Тема</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-4 py-2 rounded-lg ${
                  settings.theme === 'dark'
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-bg text-gray-400 hover:text-white'
                }`}
              >
                Темна
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-4 py-2 rounded-lg ${
                  settings.theme === 'light'
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-bg text-gray-400 hover:text-white'
                }`}
              >
                Світла
              </button>
            </div>
          </div>
        </div>

        {/* Мова */}
        <div className="bg-dark-card p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Мова</h2>
          <select
            value={settings.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
          >
            <option value="uk">Українська</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Сповіщення */}
        <div className="bg-dark-card p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Сповіщення</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Email сповіщення</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Браузерні сповіщення</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.browser}
                  onChange={(e) => handleNotificationChange('browser', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Звукові сповіщення</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.sound}
                  onChange={(e) => handleNotificationChange('sound', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Відображення */}
        <div className="bg-dark-card p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Відображення</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Розмір шрифту</label>
              <select
                value={settings.display.fontSize}
                onChange={(e) => handleDisplayChange('fontSize', e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
              >
                <option value="small">Маленький</option>
                <option value="medium">Середній</option>
                <option value="large">Великий</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Щільність</label>
              <select
                value={settings.display.density}
                onChange={(e) => handleDisplayChange('density', e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
              >
                <option value="compact">Компактна</option>
                <option value="comfortable">Комфортна</option>
                <option value="spacious">Простора</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Показувати аватари</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.display.showAvatars}
                  onChange={(e) => handleDisplayChange('showAvatars', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Безпека */}
        <div className="bg-dark-card p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Безпека</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Двофакторна автентифікація</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactor}
                  onChange={(e) => handleSecurityChange('twoFactor', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Таймаут сесії (хвилини)</label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                min="5"
                max="120"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Термін дії пароля (дні)</label>
              <input
                type="number"
                value={settings.security.passwordExpiry}
                onChange={(e) => handleSecurityChange('passwordExpiry', parseInt(e.target.value))}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                min="30"
                max="365"
              />
            </div>
          </div>
        </div>

        {/* Резервне копіювання */}
        <div className="bg-dark-card p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Резервне копіювання</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Автоматичне резервне копіювання</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.backup.autoBackup}
                  onChange={(e) => handleBackupChange('autoBackup', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Частота резервного копіювання</label>
              <select
                value={settings.backup.backupFrequency}
                onChange={(e) => handleBackupChange('backupFrequency', e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
              >
                <option value="hourly">Щогодини</option>
                <option value="daily">Щодня</option>
                <option value="weekly">Щотижня</option>
                <option value="monthly">Щомісяця</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Період зберігання (дні)</label>
              <input
                type="number"
                value={settings.backup.retentionPeriod}
                onChange={(e) => handleBackupChange('retentionPeriod', parseInt(e.target.value))}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                min="7"
                max="365"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 