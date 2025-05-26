import React, { useState, useEffect } from 'react';
import { 
  CogIcon,
  PaintBrushIcon,
  LanguageIcon,
  BellIcon,
  EyeIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  UserIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  ChartBarIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('appearance');
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  
  // Налаштування за замовчуванням
  const [settings, setSettings] = useState({
    appearance: {
      theme: 'dark',
      accentColor: '#64ffda',
      fontSize: 'medium',
      density: 'comfortable',
      sidebarCollapsed: false,
      showAnimations: true,
      compactMode: false
    },
    language: {
      interface: 'uk',
      dateFormat: 'dd.mm.yyyy',
      timeFormat: '24h',
      numberFormat: 'space',
      currency: 'UAH'
    },
    notifications: {
      email: true,
      browser: true,
      sound: false,
      newTickets: true,
      repairUpdates: true,
      systemAlerts: true,
      weeklyReports: false,
      criticalOnly: false
    },
    display: {
      itemsPerPage: 25,
      showAvatars: true,
      showTooltips: true,
      autoRefresh: true,
      refreshInterval: 30,
      showGridLines: true,
      highlightChanges: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: 60,
      passwordExpiry: 90,
      autoLogout: true,
      requirePasswordChange: false,
      loginHistory: true,
      ipRestriction: false
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionPeriod: 30,
      includeFiles: true,
      cloudSync: false,
      compressionLevel: 'medium'
    },
    system: {
      debugMode: false,
      logLevel: 'info',
      performanceMode: false,
      cacheEnabled: true,
      analyticsEnabled: true,
      errorReporting: true
    }
  });

  useEffect(() => {
    // Завантажуємо налаштування з localStorage
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      } catch (error) {
        console.error('Error parsing settings:', error);
      }
    }
  }, []);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    
    // Показуємо повідомлення про збереження
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const updateSetting = (category, key, value) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    };
    saveSettings(newSettings);
  };

  const resetToDefaults = () => {
    if (window.confirm('Ви впевнені, що хочете скинути всі налаштування до значень за замовчуванням?')) {
      localStorage.removeItem('appSettings');
      window.location.reload();
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          saveSettings(importedSettings);
          alert('Налаштування успішно імпортовано!');
        } catch (error) {
          alert('Помилка при імпорті налаштувань. Перевірте формат файлу.');
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'appearance', name: 'Зовнішній вигляд', icon: PaintBrushIcon },
    { id: 'language', name: 'Мова та регіон', icon: LanguageIcon },
    { id: 'notifications', name: 'Сповіщення', icon: BellIcon },
    { id: 'display', name: 'Відображення', icon: EyeIcon },
    { id: 'security', name: 'Безпека', icon: ShieldCheckIcon },
    { id: 'backup', name: 'Резервні копії', icon: CloudArrowUpIcon },
    { id: 'system', name: 'Система', icon: CogIcon }
  ];

  const accentColors = [
    { name: 'Бірюзовий', value: '#64ffda' },
    { name: 'Синій', value: '#2196f3' },
    { name: 'Зелений', value: '#4caf50' },
    { name: 'Помаранчевий', value: '#ff9800' },
    { name: 'Фіолетовий', value: '#9c27b0' },
    { name: 'Червоний', value: '#f44336' }
  ];

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-white font-medium">{label}</div>
        {description && <div className="text-gray-400 text-sm mt-1">{description}</div>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
      </label>
    </div>
  );

  const SelectField = ({ label, value, onChange, options, description }) => (
    <div className="py-3">
      <label className="block text-white font-medium mb-2">{label}</label>
      {description && <p className="text-gray-400 text-sm mb-3">{description}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const NumberField = ({ label, value, onChange, min, max, description, suffix }) => (
    <div className="py-3">
      <label className="block text-white font-medium mb-2">{label}</label>
      {description && <p className="text-gray-400 text-sm mb-3">{description}</p>}
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          min={min}
          max={max}
          className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {suffix && <span className="absolute right-3 top-2 text-gray-400">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Налаштування</h1>
          <p className="text-gray-400 mt-1">Персоналізуйте свій досвід роботи з системою</p>
        </div>
        <div className="flex space-x-3">
          <input
            type="file"
            accept=".json"
            onChange={importSettings}
            className="hidden"
            id="import-settings"
          />
          <label
            htmlFor="import-settings"
            className="px-4 py-2 rounded-lg bg-dark-bg text-white hover:bg-dark-hover transition-colors cursor-pointer"
          >
            Імпорт
          </label>
          <button
            onClick={exportSettings}
            className="px-4 py-2 rounded-lg bg-dark-bg text-white hover:bg-dark-hover transition-colors"
          >
            Експорт
          </button>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Скинути
          </button>
        </div>
      </div>

      {/* Notification */}
      {showSaveNotification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fadeIn flex items-center gap-3">
          <CheckIcon className="h-5 w-5" />
          <span>Налаштування збережено!</span>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 bg-dark-card rounded-lg p-4">
          <nav className="space-y-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-hover'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-dark-card rounded-lg p-6">
          {/* Зовнішній вигляд */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Зовнішній вигляд</h2>
                
                {/* Тема */}
                <div className="py-4 border-b border-dark-border">
                  <h3 className="text-white font-medium mb-4">Тема</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => updateSetting('appearance', 'theme', 'dark')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                        settings.appearance.theme === 'dark'
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-border hover:border-gray-500'
                      }`}
                    >
                      <div className="w-full h-20 bg-gray-900 rounded mb-2"></div>
                      <div className="text-white text-sm">Темна тема</div>
                    </button>
                    <button
                      onClick={() => updateSetting('appearance', 'theme', 'light')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                        settings.appearance.theme === 'light'
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-border hover:border-gray-500'
                      }`}
                    >
                      <div className="w-full h-20 bg-gray-100 rounded mb-2"></div>
                      <div className="text-white text-sm">Світла тема</div>
                    </button>
                  </div>
                </div>

                {/* Акцентний колір */}
                <div className="py-4 border-b border-dark-border">
                  <h3 className="text-white font-medium mb-4">Акцентний колір</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {accentColors.map(color => (
                      <button
                        key={color.value}
                        onClick={() => updateSetting('appearance', 'accentColor', color.value)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          settings.appearance.accentColor === color.value
                            ? 'border-white scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <SelectField
                  label="Розмір шрифту"
                  value={settings.appearance.fontSize}
                  onChange={(value) => updateSetting('appearance', 'fontSize', value)}
                  options={[
                    { value: 'small', label: 'Маленький' },
                    { value: 'medium', label: 'Середній' },
                    { value: 'large', label: 'Великий' }
                  ]}
                />

                <SelectField
                  label="Щільність інтерфейсу"
                  value={settings.appearance.density}
                  onChange={(value) => updateSetting('appearance', 'density', value)}
                  options={[
                    { value: 'compact', label: 'Компактна' },
                    { value: 'comfortable', label: 'Комфортна' },
                    { value: 'spacious', label: 'Простора' }
                  ]}
                />

                <ToggleSwitch
                  checked={settings.appearance.showAnimations}
                  onChange={(value) => updateSetting('appearance', 'showAnimations', value)}
                  label="Анімації"
                  description="Увімкнути плавні переходи та анімації"
                />

                <ToggleSwitch
                  checked={settings.appearance.compactMode}
                  onChange={(value) => updateSetting('appearance', 'compactMode', value)}
                  label="Компактний режим"
                  description="Зменшити відступи для більшої щільності інформації"
                />
              </div>
            </div>
          )}

          {/* Мова та регіон */}
          {activeTab === 'language' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Мова та регіон</h2>
              
              <SelectField
                label="Мова інтерфейсу"
                value={settings.language.interface}
                onChange={(value) => updateSetting('language', 'interface', value)}
                options={[
                  { value: 'uk', label: 'Українська' },
                  { value: 'en', label: 'English' },
                  { value: 'ru', label: 'Русский' }
                ]}
              />

              <SelectField
                label="Формат дати"
                value={settings.language.dateFormat}
                onChange={(value) => updateSetting('language', 'dateFormat', value)}
                options={[
                  { value: 'dd.mm.yyyy', label: 'ДД.ММ.РРРР (31.12.2023)' },
                  { value: 'mm/dd/yyyy', label: 'ММ/ДД/РРРР (12/31/2023)' },
                  { value: 'yyyy-mm-dd', label: 'РРРР-ММ-ДД (2023-12-31)' }
                ]}
              />

              <SelectField
                label="Формат часу"
                value={settings.language.timeFormat}
                onChange={(value) => updateSetting('language', 'timeFormat', value)}
                options={[
                  { value: '24h', label: '24-годинний (14:30)' },
                  { value: '12h', label: '12-годинний (2:30 PM)' }
                ]}
              />

              <SelectField
                label="Формат чисел"
                value={settings.language.numberFormat}
                onChange={(value) => updateSetting('language', 'numberFormat', value)}
                options={[
                  { value: 'space', label: 'Пробіл (1 000 000)' },
                  { value: 'comma', label: 'Кома (1,000,000)' },
                  { value: 'dot', label: 'Крапка (1.000.000)' }
                ]}
              />

              <SelectField
                label="Валюта"
                value={settings.language.currency}
                onChange={(value) => updateSetting('language', 'currency', value)}
                options={[
                  { value: 'UAH', label: 'Гривня (₴)' },
                  { value: 'USD', label: 'Долар ($)' },
                  { value: 'EUR', label: 'Євро (€)' }
                ]}
              />
            </div>
          )}

          {/* Сповіщення */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Сповіщення</h2>
              
              <div className="space-y-1">
                <ToggleSwitch
                  checked={settings.notifications.email}
                  onChange={(value) => updateSetting('notifications', 'email', value)}
                  label="Email сповіщення"
                  description="Отримувати сповіщення на електронну пошту"
                />

                <ToggleSwitch
                  checked={settings.notifications.browser}
                  onChange={(value) => updateSetting('notifications', 'browser', value)}
                  label="Браузерні сповіщення"
                  description="Показувати сповіщення в браузері"
                />

                <ToggleSwitch
                  checked={settings.notifications.sound}
                  onChange={(value) => updateSetting('notifications', 'sound', value)}
                  label="Звукові сповіщення"
                  description="Відтворювати звуки при сповіщеннях"
                />

                <div className="border-t border-dark-border pt-4 mt-6">
                  <h3 className="text-white font-medium mb-4">Типи сповіщень</h3>
                  
                  <ToggleSwitch
                    checked={settings.notifications.newTickets}
                    onChange={(value) => updateSetting('notifications', 'newTickets', value)}
                    label="Нові заявки"
                    description="Сповіщення про створення нових заявок"
                  />

                  <ToggleSwitch
                    checked={settings.notifications.repairUpdates}
                    onChange={(value) => updateSetting('notifications', 'repairUpdates', value)}
                    label="Оновлення ремонтів"
                    description="Сповіщення про зміни статусу ремонтів"
                  />

                  <ToggleSwitch
                    checked={settings.notifications.systemAlerts}
                    onChange={(value) => updateSetting('notifications', 'systemAlerts', value)}
                    label="Системні сповіщення"
                    description="Важливі повідомлення системи"
                  />

                  <ToggleSwitch
                    checked={settings.notifications.weeklyReports}
                    onChange={(value) => updateSetting('notifications', 'weeklyReports', value)}
                    label="Тижневі звіти"
                    description="Автоматичні звіти щотижня"
                  />

                  <ToggleSwitch
                    checked={settings.notifications.criticalOnly}
                    onChange={(value) => updateSetting('notifications', 'criticalOnly', value)}
                    label="Тільки критичні"
                    description="Показувати лише найважливіші сповіщення"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Відображення */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Відображення</h2>
              
              <SelectField
                label="Елементів на сторінці"
                value={settings.display.itemsPerPage}
                onChange={(value) => updateSetting('display', 'itemsPerPage', parseInt(value))}
                options={[
                  { value: '10', label: '10' },
                  { value: '25', label: '25' },
                  { value: '50', label: '50' },
                  { value: '100', label: '100' }
                ]}
                description="Кількість записів у таблицях"
              />

              <NumberField
                label="Інтервал автооновлення"
                value={settings.display.refreshInterval}
                onChange={(value) => updateSetting('display', 'refreshInterval', value)}
                min={10}
                max={300}
                suffix="сек"
                description="Частота автоматичного оновлення даних"
              />

              <ToggleSwitch
                checked={settings.display.showAvatars}
                onChange={(value) => updateSetting('display', 'showAvatars', value)}
                label="Показувати аватари"
                description="Відображати аватари користувачів"
              />

              <ToggleSwitch
                checked={settings.display.showTooltips}
                onChange={(value) => updateSetting('display', 'showTooltips', value)}
                label="Підказки"
                description="Показувати спливаючі підказки"
              />

              <ToggleSwitch
                checked={settings.display.autoRefresh}
                onChange={(value) => updateSetting('display', 'autoRefresh', value)}
                label="Автооновлення"
                description="Автоматично оновлювати дані"
              />

              <ToggleSwitch
                checked={settings.display.showGridLines}
                onChange={(value) => updateSetting('display', 'showGridLines', value)}
                label="Лінії сітки"
                description="Показувати лінії в таблицях"
              />

              <ToggleSwitch
                checked={settings.display.highlightChanges}
                onChange={(value) => updateSetting('display', 'highlightChanges', value)}
                label="Підсвічувати зміни"
                description="Виділяти нові та змінені записи"
              />
            </div>
          )}

          {/* Безпека */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Безпека</h2>
              
              <ToggleSwitch
                checked={settings.security.twoFactor}
                onChange={(value) => updateSetting('security', 'twoFactor', value)}
                label="Двофакторна автентифікація"
                description="Додатковий рівень захисту для входу"
              />

              <NumberField
                label="Таймаут сесії"
                value={settings.security.sessionTimeout}
                onChange={(value) => updateSetting('security', 'sessionTimeout', value)}
                min={5}
                max={480}
                suffix="хв"
                description="Час неактивності до автоматичного виходу"
              />

              <NumberField
                label="Термін дії пароля"
                value={settings.security.passwordExpiry}
                onChange={(value) => updateSetting('security', 'passwordExpiry', value)}
                min={30}
                max={365}
                suffix="днів"
                description="Період після якого потрібно змінити пароль"
              />

              <ToggleSwitch
                checked={settings.security.autoLogout}
                onChange={(value) => updateSetting('security', 'autoLogout', value)}
                label="Автоматичний вихід"
                description="Виходити з системи при неактивності"
              />

              <ToggleSwitch
                checked={settings.security.loginHistory}
                onChange={(value) => updateSetting('security', 'loginHistory', value)}
                label="Історія входів"
                description="Зберігати журнал входів в систему"
              />

              <ToggleSwitch
                checked={settings.security.ipRestriction}
                onChange={(value) => updateSetting('security', 'ipRestriction', value)}
                label="Обмеження по IP"
                description="Дозволити вхід тільки з певних IP-адрес"
              />
            </div>
          )}

          {/* Резервні копії */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Резервні копії</h2>
              
              <ToggleSwitch
                checked={settings.backup.autoBackup}
                onChange={(value) => updateSetting('backup', 'autoBackup', value)}
                label="Автоматичне резервне копіювання"
                description="Створювати резервні копії автоматично"
              />

              <SelectField
                label="Частота резервного копіювання"
                value={settings.backup.backupFrequency}
                onChange={(value) => updateSetting('backup', 'backupFrequency', value)}
                options={[
                  { value: 'hourly', label: 'Щогодини' },
                  { value: 'daily', label: 'Щодня' },
                  { value: 'weekly', label: 'Щотижня' },
                  { value: 'monthly', label: 'Щомісяця' }
                ]}
              />

              <NumberField
                label="Період зберігання"
                value={settings.backup.retentionPeriod}
                onChange={(value) => updateSetting('backup', 'retentionPeriod', value)}
                min={7}
                max={365}
                suffix="днів"
                description="Скільки днів зберігати резервні копії"
              />

              <ToggleSwitch
                checked={settings.backup.includeFiles}
                onChange={(value) => updateSetting('backup', 'includeFiles', value)}
                label="Включати файли"
                description="Додавати файли до резервних копій"
              />

              <ToggleSwitch
                checked={settings.backup.cloudSync}
                onChange={(value) => updateSetting('backup', 'cloudSync', value)}
                label="Синхронізація з хмарою"
                description="Зберігати копії в хмарному сховищі"
              />

              <SelectField
                label="Рівень стиснення"
                value={settings.backup.compressionLevel}
                onChange={(value) => updateSetting('backup', 'compressionLevel', value)}
                options={[
                  { value: 'none', label: 'Без стиснення' },
                  { value: 'low', label: 'Низький' },
                  { value: 'medium', label: 'Середній' },
                  { value: 'high', label: 'Високий' }
                ]}
              />
            </div>
          )}

          {/* Система */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Система</h2>
              
              <ToggleSwitch
                checked={settings.system.debugMode}
                onChange={(value) => updateSetting('system', 'debugMode', value)}
                label="Режим налагодження"
                description="Увімкнути детальне логування для розробників"
              />

              <SelectField
                label="Рівень логування"
                value={settings.system.logLevel}
                onChange={(value) => updateSetting('system', 'logLevel', value)}
                options={[
                  { value: 'error', label: 'Тільки помилки' },
                  { value: 'warn', label: 'Попередження та помилки' },
                  { value: 'info', label: 'Інформація' },
                  { value: 'debug', label: 'Налагодження' }
                ]}
              />

              <ToggleSwitch
                checked={settings.system.performanceMode}
                onChange={(value) => updateSetting('system', 'performanceMode', value)}
                label="Режим продуктивності"
                description="Оптимізувати для швидкодії"
              />

              <ToggleSwitch
                checked={settings.system.cacheEnabled}
                onChange={(value) => updateSetting('system', 'cacheEnabled', value)}
                label="Кешування"
                description="Використовувати кеш для прискорення роботи"
              />

              <ToggleSwitch
                checked={settings.system.analyticsEnabled}
                onChange={(value) => updateSetting('system', 'analyticsEnabled', value)}
                label="Аналітика"
                description="Збирати дані для покращення системи"
              />

              <ToggleSwitch
                checked={settings.system.errorReporting}
                onChange={(value) => updateSetting('system', 'errorReporting', value)}
                label="Звіти про помилки"
                description="Автоматично відправляти звіти про помилки"
              />

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-6">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-yellow-500 font-medium">Увага</div>
                    <div className="text-gray-300 text-sm">
                      Зміна системних налаштувань може вплинути на продуктивність
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 