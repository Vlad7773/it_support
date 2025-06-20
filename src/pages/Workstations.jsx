import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  Bars3Icon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  TvIcon,
  ServerIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  XMarkIcon,
  WrenchScrewdriverIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

const Workstations = () => {
  const {
    workstations: contextWorkstations,
    loading,
    error,
    addWorkstation,
    updateWorkstation,
    deleteWorkstation,
    departments,
    users,
    workstationStatuses,
    grifLevels,
    allSoftware,
    selectedWorkstationSoftware,
    fetchSoftwareForWorkstation,
    tickets,
    repairs,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWorkstation, setSelectedWorkstation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterGrif, setFilterGrif] = useState('all');
  const [filterResponsible, setFilterResponsible] = useState('all');
  const [activeTab, setActiveTab] = useState('main');

  const initialFormData = {
    inventory_number: 'АРМ-',
    ip_address: '',
    mac_address: '',
    grif: 'ДСК',
    os_name: 'Win 10',
    department_id: '',
    responsible_id: '',
    contacts: '+380',
    notes: '',
    processor: '',
    ram: '8',
    storage: '',
    monitor: '',
    network: '',
    type: 'Десктоп',
    keyboard: false,
    mouse: false,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [localWorkstations, setLocalWorkstations] = useState([]);

  // Додаємо стан для відстеження завантаження ПЗ
  const [loadingSoftware, setLoadingSoftware] = useState(false);
  const [softwareError, setSoftwareError] = useState(null);
  
  // Додаємо стан для фільтрації ремонтів та ПЗ
  const [workstationRepairs, setWorkstationRepairs] = useState([]);
  const [workstationTickets, setWorkstationTickets] = useState([]);

  useEffect(() => {
    if (contextWorkstations) {
      setLocalWorkstations(contextWorkstations);
    }
  }, [contextWorkstations]);

  const location = useLocation();
  useEffect(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDetailsModal(false);
    setSelectedWorkstation(null);
  }, [location.pathname]);

  // Функція для отримання іконки типу пристрою
  const getDeviceIcon = (type) => {
    switch (type) {
      case 'Ноутбук':
        return <DevicePhoneMobileIcon className="h-4 w-4 text-gray-400 transform rotate-90" />;
      case 'Моноблок':
        return <TvIcon className="h-4 w-4 text-gray-400" />;
      case 'Сервер':
        return <ServerIcon className="h-4 w-4 text-gray-400" />;
      default: // Десктоп
        return <ComputerDesktopIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  // Валідація IP адреси
  const validateIP = (ip) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  // Валідація MAC адреси
  const validateMAC = (mac) => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  };

  // Валідація форми
  const validateForm = () => {
    const errors = [];
    
    // Обов'язкові поля
    if (!formData.inventory_number?.trim()) {
      errors.push('Інвентарний номер обов\'язковий');
    } else if (!formData.inventory_number.startsWith('АРМ-')) {
      errors.push('Інвентарний номер повинен починатися з "АРМ-"');
    }
    
    if (!formData.department_id) {
      errors.push('Виберіть відділ');
    }
    
    if (!formData.os_name?.trim()) {
      errors.push('Вкажіть операційну систему');
    }
    
    // IP адреса (якщо вказана)
    if (formData.ip_address?.trim()) {
      if (!validateIP(formData.ip_address)) {
        errors.push('Невірний формат IP адреси (приклад: 192.168.1.100)');
      }
      
      // Перевірка на дублікати IP
      const duplicateIP = localWorkstations.find(w => 
        w.ip_address === formData.ip_address && 
        w.id !== selectedWorkstation?.id
      );
      if (duplicateIP) {
        errors.push(`IP адреса ${formData.ip_address} вже використовується на АРМ ${duplicateIP.inventory_number}`);
      }
    }
    
    // MAC адреса (якщо вказана)
    if (formData.mac_address?.trim()) {
      if (!validateMAC(formData.mac_address)) {
        errors.push('Невірний формат MAC адреси (приклад: 00:1A:2B:3C:4D:5E)');
      }
      
      // Перевірка на дублікати MAC
      const duplicateMAC = localWorkstations.find(w => 
        w.mac_address === formData.mac_address && 
        w.id !== selectedWorkstation?.id
      );
      if (duplicateMAC) {
        errors.push(`MAC адреса ${formData.mac_address} вже використовується на АРМ ${duplicateMAC.inventory_number}`);
      }
    }
    
    // Контакти
    if (formData.contacts?.trim() && !formData.contacts.startsWith('+380')) {
      errors.push('Номер телефону повинен починатися з "+380"');
    }
    
    // RAM
    if (formData.ram) {
      const ramValue = parseInt(formData.ram, 10);
      if (isNaN(ramValue) || ramValue < 1 || ramValue > 128) {
        errors.push('Об\'єм RAM повинен бути від 1 до 128 GB');
      }
    }
    
    return errors;
  };

  // Покращена валідація IP з підказками
  const handleIPChange = (value) => {
    // Видаляємо всі символи крім цифр і крапок
    let formatted = value.replace(/[^\d.]/g, '');
    
    // Не дозволяємо дві крапки підряд
    formatted = formatted.replace(/\.{2,}/g, '.');
    
    // Не дозволяємо крапку на початку
    if (formatted.startsWith('.')) {
      formatted = formatted.substring(1);
    }
    
    // Розбиваємо на частини і обмежуємо до 4 токенів
    const parts = formatted.split('.');
    if (parts.length > 4) {
      formatted = parts.slice(0, 4).join('.');
    }
    
    // Обмежуємо кожну частину до 255
    const validParts = parts.map(part => {
      if (part === '') return '';
      const num = parseInt(part, 10);
      if (isNaN(num)) return '';
      return Math.min(num, 255).toString();
    });
    
    formatted = validParts.join('.');
    
    setFormData(prev => ({ ...prev, ip_address: formatted }));
  };

  // Покращене автоформатування MAC з підказками
  const handleMACChange = (value) => {
    // Видаляємо всі символи крім hex цифр
    let formatted = value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    
    // Додаємо двокрапки автоматично
    if (formatted.length > 0) {
      formatted = formatted.match(/.{1,2}/g)?.join(':') || formatted;
    }
    
    // Обмежуємо довжину
    if (formatted.length > 17) {
      formatted = formatted.substring(0, 17);
    }
    
    setFormData(prev => ({ ...prev, mac_address: formatted }));
  };

  // Функція для показу помилок
  const showErrors = (errors) => {
    if (!Array.isArray(errors)) {
      errors = [errors];
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fadeIn';
    errorDiv.innerHTML = `
      <div class="flex items-start gap-3">
        <svg class="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <div>
          ${errors.map(err => `<div class="mb-1">${err}</div>`).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.classList.add('animate-fadeOut');
      setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      showErrors(errors);
      return;
    }
    
    try {
      const payload = {
        ...formData,
        department_id: parseInt(formData.department_id, 10) || null,
        responsible_id: formData.responsible_id ? parseInt(formData.responsible_id, 10) : null,
        ram: parseInt(formData.ram, 10) || null,
      };
      await addWorkstation(payload);
      setShowAddModal(false);
      setActiveTab('main');
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to add workstation:", err);
      showErrors(err.response?.data?.error || err.message);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      showErrors(errors);
      return;
    }
    
    try {
      const payload = {
        ...formData,
        department_id: parseInt(formData.department_id, 10) || null,
        responsible_id: formData.responsible_id ? parseInt(formData.responsible_id, 10) : null,
        ram: parseInt(formData.ram, 10) || null,
      };
      await updateWorkstation(selectedWorkstation.id, payload);
      setShowEditModal(false);
      setActiveTab('main');
      setSelectedWorkstation(null);
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to edit workstation:", err);
      showErrors(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedWorkstation) return;
    try {
      await deleteWorkstation(selectedWorkstation.id);
      setShowDeleteModal(false);
      setSelectedWorkstation(null);
    } catch (err) {
      console.error("Failed to delete workstation:", err);
      // Обробка помилки з активними заявками/ремонтами
      if (err.response?.data?.error?.includes('active tickets or repairs')) {
        alert('Не можна видалити АРМ з активними заявками або ремонтами. Спочатку переназначте або вирішіть їх.');
      } else {
        alert(`Помилка видалення АРМ: ${err.response?.data?.error || err.message}`);
      }
    }
  };

  const openEditModal = (workstation) => {
    setSelectedWorkstation(workstation);
    setFormData({
      inventory_number: workstation.inventory_number || '',
      ip_address: workstation.ip_address || '',
      mac_address: workstation.mac_address || '',
      grif: workstation.grif || 'ДСК',
      os_name: workstation.os_name || '',
      department_id: workstation.department_id || '',
      responsible_id: workstation.responsible_id || '',
      contacts: workstation.contacts || '+380',
      notes: workstation.notes || '',
      processor: workstation.processor || '',
      ram: workstation.ram || '',
      storage: workstation.storage || '',
      monitor: workstation.monitor || '',
      network: workstation.network || '',
      type: workstation.type || 'Десктоп',
      keyboard: workstation.keyboard || false,
      mouse: workstation.mouse || false,
    });
    setShowEditModal(true);
    setActiveTab('main');
  };

  const openDetailsModal = (workstation) => {
    setSelectedWorkstation(workstation);
    setShowDetailsModal(true);
    setActiveTab('main');
    loadWorkstationData(workstation);
  };

  const filteredWorkstations = (localWorkstations || []).filter(ws => {
    const department = departments.find(d => d.id === ws.department_id);
    const responsibleUser = users.find(u => u.id === ws.responsible_id);

    const matchesSearch = 
      ws.inventory_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.os_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.mac_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      responsibleUser?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = filterDepartment === 'all' || ws.department_id === parseInt(filterDepartment);
    const matchesGrif = filterGrif === 'all' || ws.grif === filterGrif;
    const matchesResponsible = filterResponsible === 'all' || ws.responsible_id === parseInt(filterResponsible);

    return matchesSearch && matchesDepartment && matchesGrif && matchesResponsible;
  });

  // Функція для завантаження даних конкретного АРМ
  const loadWorkstationData = async (workstation) => {
    try {
      // Завантажуємо ПЗ
      setLoadingSoftware(true);
      await fetchSoftwareForWorkstation(workstation.id);
      
      // Фільтруємо ремонти для цього АРМ
      const filteredRepairs = repairs.filter(r => r.workstation_id === workstation.id);
      setWorkstationRepairs(filteredRepairs);
      
      // Фільтруємо заявки для цього АРМ
      const filteredTickets = tickets.filter(t => t.workstation_id === workstation.id);
      setWorkstationTickets(filteredTickets);
      
      setSoftwareError(null);
    } catch (err) {
      console.error('Error loading workstation data:', err);
      setSoftwareError('Помилка завантаження даних АРМ');
    } finally {
      setLoadingSoftware(false);
    }
  };

  // Функція для зміни вкладки
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (selectedWorkstation && tab === 'software') {
      loadWorkstationData(selectedWorkstation);
    }
  };

  // Компонент для відображення вкладок
  const TabButton = ({ tab, label, icon: Icon }) => (
    <button
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
        ${activeTab === tab 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-500 hover:bg-gray-100'}`}
      onClick={() => handleTabChange(tab)}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );

  // Оновлений рендер деталей АРМ
  const renderWorkstationDetails = () => {
    if (!selectedWorkstation) return null;

    return (
      <div className="space-y-4">
        {/* Вкладки */}
        <div className="flex gap-2 border-b pb-2">
          <TabButton 
            tab="main" 
            label="Основне" 
            icon={ComputerDesktopIcon} 
          />
          <TabButton 
            tab="software" 
            label="Програмне забезпечення" 
            icon={CpuChipIcon} 
          />
          <TabButton 
            tab="repairs" 
            label="Ремонти" 
            icon={WrenchScrewdriverIcon} 
          />
        </div>

        {/* Контент вкладок */}
        <div className="mt-4">
          {activeTab === 'main' && (
            <div className="grid grid-cols-2 gap-4">
              {/* Основна інформація */}
              <div className="space-y-2">
                <p><strong>Інв. номер:</strong> {selectedWorkstation.inventory_number}</p>
                <p><strong>IP адреса:</strong> {selectedWorkstation.ip_address}</p>
                <p><strong>MAC адреса:</strong> {selectedWorkstation.mac_address}</p>
                <p><strong>Тип:</strong> {selectedWorkstation.type}</p>
                <p><strong>ОС:</strong> {selectedWorkstation.os_name}</p>
              </div>
              <div className="space-y-2">
                <p><strong>Відділ:</strong> {departments.find(d => d.id === selectedWorkstation.department_id)?.name}</p>
                <p><strong>Відповідальний:</strong> {users.find(u => u.id === selectedWorkstation.responsible_id)?.full_name}</p>
                <p><strong>Гриф:</strong> {selectedWorkstation.grif}</p>
                <p><strong>Контакти:</strong> {selectedWorkstation.contacts}</p>
              </div>
              {/* Характеристики */}
              <div className="col-span-2 mt-4">
                <h3 className="font-medium mb-2">Характеристики:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Процесор:</strong> {selectedWorkstation.processor}</p>
                  <p><strong>RAM:</strong> {selectedWorkstation.ram} GB</p>
                  <p><strong>Накопичувач:</strong> {selectedWorkstation.storage}</p>
                  <p><strong>Монітор:</strong> {selectedWorkstation.monitor}</p>
                  <p><strong>Мережа:</strong> {selectedWorkstation.network}</p>
                  <p><strong>Периферія:</strong> {[
                    selectedWorkstation.keyboard && 'Клавіатура',
                    selectedWorkstation.mouse && 'Миша'
                  ].filter(Boolean).join(', ') || 'Немає'}</p>
                </div>
              </div>
              {/* Примітки */}
              {selectedWorkstation.notes && (
                <div className="col-span-2 mt-4">
                  <h3 className="font-medium mb-2">Примітки:</h3>
                  <p className="text-gray-600">{selectedWorkstation.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'software' && (
            <div className="space-y-4">
              {loadingSoftware ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                </div>
              ) : softwareError ? (
                <div className="text-red-600 text-center py-4">{softwareError}</div>
              ) : (
                <>
                  <h3 className="font-medium">Встановлене ПЗ:</h3>
                  {selectedWorkstationSoftware.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">ПЗ не знайдено</p>
                  ) : (
                    <div className="grid gap-4">
                      {selectedWorkstationSoftware.map(software => (
                        <div key={software.id} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium">{software.name}</h4>
                          <p className="text-sm text-gray-600">Версія: {software.version}</p>
                          <p className="text-sm text-gray-600">Встановлено: {new Date(software.installation_date).toLocaleDateString()}</p>
                          {software.license_key && (
                            <p className="text-sm text-gray-600">Ліцензія: {software.license_key}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'repairs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Історія ремонтів:</h3>
              </div>
              {workstationRepairs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Ремонтів не знайдено</p>
              ) : (
                <div className="grid gap-4">
                  {workstationRepairs.map(repair => (
                    <div key={repair.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{repair.repair_type}</h4>
                          <p className="text-sm text-gray-600">{repair.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-sm ${
                          repair.status === 'completed' ? 'bg-green-100 text-green-800' :
                          repair.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {repair.status}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Технік: {users.find(u => u.id === repair.technician_id)?.full_name}</p>
                        <p>Дата: {new Date(repair.repair_date).toLocaleDateString()}</p>
                        {repair.cost && <p>Вартість: {repair.cost} грн</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Функція для фільтрації користувачів при виборі відповідального
  const getAvailableResponsibles = () => {
    // Якщо відділ не вибрано, показуємо всіх користувачів
    if (!formData.department_id) {
      return users;
    }
    // Інакше показуємо тільки користувачів з вибраного відділу
    return users.filter(user => user.department_id === parseInt(formData.department_id));
  };

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#64ffda] mx-auto mb-4"></div>
        <p className="text-[#8892b0]">Завантаження робочих станцій...</p>
      </div>
    </div>
  );

  if (error && !localWorkstations.length) return (
    <div className="p-6 text-center">
      <p className="text-red-400">Помилка завантаження робочих станцій: {error}</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Робочі станції</h1>
          <p className="text-gray-400 mt-1">Управління АРМ та технічними характеристиками</p>
        </div>
        <button
          onClick={() => {
            setFormData(initialFormData);
            setShowAddModal(true);
            setActiveTab('main');
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Додати АРМ
        </button>
      </div>

      {/* Компактні фільтри */}
      <div className="bg-dark-card rounded-lg shadow-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Пошук - зменшено на 40% */}
          <div className="relative w-[300px]">
            <input
              type="text"
              placeholder="Пошук за інв. номером, IP адресою, відділом..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-dark-textSecondary absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          
          {/* Фільтри в новому порядку: підрозділ, гриф, відповідальний */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Всі підрозділи</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>

          <select
            value={filterGrif}
            onChange={(e) => setFilterGrif(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Всі грифи</option>
            {grifLevels.map(grif => (
              <option key={grif.id} value={grif.value}>{grif.name}</option>
            ))}
          </select>

          <select
            value={filterResponsible}
            onChange={(e) => setFilterResponsible(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Всі відповідальні</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.full_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Таблиця */}
      <div className="bg-dark-card rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-hover">
              <tr className="text-left text-dark-textSecondary text-sm">
                <th className="px-6 py-4 font-semibold">Тип/Інв. номер</th>
                <th className="px-6 py-4 font-semibold">IP адреса</th>
                <th className="px-6 py-4 font-semibold">Гриф</th>
                <th className="px-6 py-4 font-semibold">Підрозділ</th>
                <th className="px-6 py-4 font-semibold">Відповідальний</th>
                <th className="px-6 py-4 font-semibold">Контакти</th>
                <th className="px-6 py-4 font-semibold">Дата реєстрації</th>
                <th className="px-6 py-4 font-semibold text-center">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredWorkstations.length > 0 ? filteredWorkstations.map(ws => {
                const department = departments.find(d => d.id === ws.department_id);
                const responsibleUser = users.find(u => u.id === ws.responsible_id);
                const grifObj = grifLevels.find(g => g.value === ws.grif);
                
                return (
                  <tr key={ws.id} className="hover:bg-dark-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(ws.type)}
                        <span className="text-white font-medium">{ws.inventory_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white font-mono">{ws.ip_address || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="text-white">
                        {grifLevels.find(g => g.value === ws.grif)?.name.replace('\n', ' ') || ws.grif}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{department?.name || '-'}</td>
                    <td className="px-6 py-4 text-gray-300">{responsibleUser?.full_name || '-'}</td>
                    <td className="px-6 py-4 text-gray-300">{ws.contacts || '-'}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {ws.registration_date ? 
                        new Date(ws.registration_date).toLocaleDateString('uk-UA', {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric'
                        }) : '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openDetailsModal(ws)}
                        className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                        title="Деталі"
                      >
                        <Bars3Icon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-dark-textSecondary">
                    <ComputerDesktopIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Немає АРМ, що відповідають фільтрам</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальне вікно додавання/редагування АРМ з фіксованим розміром */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="modal-content rounded-xl p-7 w-full max-w-5xl h-[85vh] overflow-y-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-7">
              <h2 className="text-3xl font-bold text-white">{showAddModal ? 'Додати АРМ' : 'Редагувати АРМ'}</h2>
              <button onClick={() => {
                showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                setActiveTab('main');
                setSelectedWorkstation(null);
                setFormData(initialFormData);
              }} className="text-[#8892b0] hover:text-white p-2 rounded-lg hover:bg-[#0e3460] transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Навігація по вкладках */}
            <div className="flex space-x-2 mb-7 bg-[#0f0f23] rounded-xl p-2">
              <button
                type="button"
                onClick={() => setActiveTab('main')}
                className={`px-5 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'main' ? 'bg-[#64ffda] text-[#0f0f23]' : 'text-[#8892b0] hover:text-white hover:bg-[#0e3460]'
                }`}
              >
                Основні дані
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('network')}
                className={`px-5 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'network' ? 'bg-[#64ffda] text-[#0f0f23]' : 'text-[#8892b0] hover:text-white hover:bg-[#0e3460]'
                }`}
              >
                Мережа
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('hardware')}
                className={`px-5 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'hardware' ? 'bg-[#64ffda] text-[#0f0f23]' : 'text-[#8892b0] hover:text-white hover:bg-[#0e3460]'
                }`}
              >
                Обладнання
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('other')}
                className={`px-5 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'other' ? 'bg-[#64ffda] text-[#0f0f23]' : 'text-[#8892b0] hover:text-white hover:bg-[#0e3460]'
                }`}
              >
                Інше
              </button>
            </div>
            
            <form onSubmit={showEditModal ? handleEdit : handleAdd} className="space-y-4">
              {/* Основні дані */}
              {activeTab === 'main' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-dark-textSecondary mb-2">Інвентарний номер</label>
                    <input
                      type="text"
                      value={formData.inventory_number}
                      onChange={(e) => setFormData({...formData, inventory_number: e.target.value})}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-dark-textSecondary mb-2">Відділ</label>
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Виберіть відділ</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-dark-textSecondary mb-2">Відповідальний</label>
                    <select
                      value={formData.responsible_id || ''}
                      onChange={(e) => setFormData({...formData, responsible_id: e.target.value})}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Виберіть відповідального</option>
                      {getAvailableResponsibles().map(user => (
                        <option key={user.id} value={user.id}>{user.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-dark-textSecondary mb-2">Гриф</label>
                    <select 
                      value={formData.grif} 
                      onChange={(e) => setFormData({...formData, grif: e.target.value})} 
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Виберіть гриф</option>
                      {grifLevels.map(grif => (
                        <option key={grif.id} value={grif.value}>{grif.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-dark-textSecondary mb-2">Тип пристрою</label>
                    <select 
                      value={formData.type} 
                      onChange={(e) => setFormData({...formData, type: e.target.value})} 
                      className="modern-select"
                    >
                      <option value="Десктоп">Десктоп</option>
                      <option value="Ноутбук">Ноутбук</option>
                      <option value="Моноблок">Моноблок</option>
                      <option value="Сервер">Сервер</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-dark-textSecondary mb-2">Контакти</label>
                    <input 
                      type="text" 
                      value={formData.contacts} 
                      onChange={(e) => setFormData({...formData, contacts: e.target.value})} 
                      className="modern-input" 
                      placeholder="+380501234567"
                    />
                  </div>
                </div>
              )}

              {/* Мережа */}
              {activeTab === 'network' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">
                      Операційна система <span className="text-red-400">*</span>
                    </label>
                    <select 
                      value={formData.os_name} 
                      onChange={(e) => setFormData({...formData, os_name: e.target.value})} 
                      className="modern-select" 
                      required
                    >
                      <option value="">Виберіть ОС</option>
                      <option value="Win 11">Win 11</option>
                      <option value="Win 10">Win 10</option>
                      <option value="Linux">Linux</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">
                      IP адреса
                      <span className="text-xs text-[#64ffda] ml-2">(Приклад: 192.168.1.100)</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.ip_address} 
                      onChange={(e) => handleIPChange(e.target.value)} 
                      className="modern-input font-mono" 
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">
                      MAC адреса
                      <span className="text-xs text-[#64ffda] ml-2">(Приклад: 00:1A:2B:3C:4D:5E)</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.mac_address} 
                      onChange={(e) => handleMACChange(e.target.value)} 
                      className="modern-input font-mono" 
                      placeholder="00:1A:2B:3C:4D:5E"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">Мережеві інтерфейси</label>
                    <input 
                      type="text" 
                      value={formData.network} 
                      onChange={(e) => setFormData({...formData, network: e.target.value})} 
                      className="modern-input" 
                      placeholder="Gigabit Ethernet, Wi-Fi 6"
                    />
                  </div>
                </div>
              )}

              {/* Обладнання */}
              {activeTab === 'hardware' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">Процесор</label>
                    <input 
                      type="text" 
                      value={formData.processor} 
                      onChange={(e) => setFormData({...formData, processor: e.target.value})} 
                      className="modern-input" 
                      placeholder="Intel Core i7-12700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">ОЗУ (ГБ)</label>
                    <select 
                      value={formData.ram} 
                      onChange={(e) => setFormData({...formData, ram: e.target.value})} 
                      className="modern-select"
                    >
                      <option value="2">2 ГБ</option>
                      <option value="4">4 ГБ</option>
                      <option value="6">6 ГБ</option>
                      <option value="8">8 ГБ</option>
                      <option value="10">10 ГБ</option>
                      <option value="12">12 ГБ</option>
                      <option value="14">14 ГБ</option>
                      <option value="16">16 ГБ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">Накопичувач</label>
                    <input 
                      type="text" 
                      value={formData.storage} 
                      onChange={(e) => setFormData({...formData, storage: e.target.value})} 
                      className="modern-input" 
                      placeholder="512 ГБ SSD"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">Монітор</label>
                    <input 
                      type="text" 
                      value={formData.monitor} 
                      onChange={(e) => setFormData({...formData, monitor: e.target.value})} 
                      className="modern-input" 
                      placeholder="24&quot; Full HD"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-[#8892b0] mb-3">Додаткове обладнання</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.keyboard} 
                          onChange={(e) => setFormData({...formData, keyboard: e.target.checked})} 
                          className="w-4 h-4 text-[#64ffda] bg-dark-bg border-dark-border rounded focus:ring-[#64ffda] focus:ring-2"
                        />
                        <span className="text-white">Клавіатура</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.mouse} 
                          onChange={(e) => setFormData({...formData, mouse: e.target.checked})} 
                          className="w-4 h-4 text-[#64ffda] bg-dark-bg border-dark-border rounded focus:ring-[#64ffda] focus:ring-2"
                        />
                        <span className="text-white">Миша</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Інше - тут тепер примітки */}
              {activeTab === 'other' && (
                <div className="mb-7">
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#8892b0] mb-2">Примітки</label>
                      <textarea 
                        value={formData.notes} 
                        onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                        className="modern-input resize-none" 
                        rows="5"
                        placeholder="Додаткова інформація..."
                      />
                    </div>
                  </div>
                  
                  <div className="dark-card rounded-xl p-5 border border-[#2a3f66] mt-5">
                    <h3 className="text-xl font-semibold text-white mb-5">Технічні характеристики</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-sm">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-[#8892b0]">Процесор:</span>
                          <span className="text-white font-medium">{formData.processor || 'Не вказано'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8892b0]">ОЗУ:</span>
                          <span className="text-white font-medium">{formData.ram || 'Не вказано'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8892b0]">Накопичувач:</span>
                          <span className="text-white font-medium">{formData.storage || 'Не вказано'}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-[#8892b0]">Монітор:</span>
                          <span className="text-white font-medium">{formData.monitor || 'Не вказано'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8892b0]">Мережа:</span>
                          <span className="text-white font-medium">{formData.network || 'Не вказано'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8892b0]">Тип:</span>
                          <span className="text-white font-medium">{formData.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={() => { 
                    showEditModal ? setShowEditModal(false) : setShowAddModal(false); 
                    setActiveTab('main'); 
                    setSelectedWorkstation(null); 
                    setFormData(initialFormData); 
                  }} 
                  className="px-6 py-3 rounded-lg bg-[#0f0f23] text-[#8892b0] hover:text-white hover:bg-[#0e3460] transition-colors font-medium"
                >
                  Скасувати
                </button>
                <button 
                  type="submit" 
                  className="btn-gradient"
                >
                  {showEditModal ? 'Зберегти' : 'Додати'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальне вікно підтвердження видалення */}
      {showDeleteModal && selectedWorkstation && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="modal-content rounded-xl p-8 w-full max-w-md animate-fadeIn">
            <h3 className="text-2xl font-bold text-white mb-4">Підтвердити видалення</h3>
            <p className="text-[#8892b0] mb-8">
              Ви впевнені, що хочете видалити АРМ "{selectedWorkstation.inventory_number}"? 
              Цю дію неможливо буде скасувати.
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="px-6 py-3 rounded-lg bg-[#0f0f23] text-[#8892b0] hover:text-white hover:bg-[#0e3460] transition-colors font-semibold"
              >
                Скасувати
              </button>
              <button 
                onClick={handleDelete} 
                className="px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно деталей АРМ - додаємо MAC адресу сюди */}
      {showDetailsModal && selectedWorkstation && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="modal-content rounded-xl p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">
                Деталі: <span className="ml-8">{selectedWorkstation.inventory_number}</span>
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // Перевіряємо чи є ПЗ для цього АРМ
                    const workstationSoftware = allSoftware.filter(s => s.workstation_id === selectedWorkstation.id);
                    
                    if (workstationSoftware.length === 0) {
                      alert(`Немає ПЗ для АРМ ${selectedWorkstation.inventory_number}`);
                      return;
                    }
                    
                    // Перенаправлення на сторінку ПЗ з фільтром по поточному АРМ
                    window.location.href = `/software?workstation=${selectedWorkstation.id}`;
                  }}
                  className="px-4 py-2 rounded-lg bg-[#64ffda] hover:bg-[#4fd1c7] text-[#0f0f23] font-semibold transition-colors"
                >
                  ПЗ
                </button>
                <button 
                  onClick={() => {
                    // Перевіряємо чи є заявки для цього АРМ
                    const workstationTickets = tickets.filter(t => t.workstation_id === selectedWorkstation.id);
                    
                    if (workstationTickets.length === 0) {
                      alert(`Немає заявок для АРМ ${selectedWorkstation.inventory_number}`);
                      return;
                    }
                    
                    // Перенаправлення на сторінку заявок з фільтром по поточному АРМ
                    window.location.href = `/tickets?workstation=${selectedWorkstation.id}`;
                  }}
                  className="px-4 py-2 rounded-lg bg-[#0f0f23] hover:bg-[#0e3460] text-white font-semibold transition-colors"
                >
                  Заявки
                </button>
                <button 
                  onClick={() => {
                    // Перевіряємо чи є ремонти для цього АРМ
                    const workstationRepairs = repairs.filter(r => r.workstation_id === selectedWorkstation.id);
                    
                    if (workstationRepairs.length === 0) {
                      alert(`Немає ремонтів для АРМ ${selectedWorkstation.inventory_number}`);
                      return;
                    }
                    
                    // Перенаправлення на сторінку ремонтів з фільтром по поточному АРМ
                    window.location.href = `/repairs?workstation=${selectedWorkstation.id}`;
                  }}
                  className="px-4 py-2 rounded-lg bg-[#0f0f23] hover:bg-[#0e3460] text-white font-semibold transition-colors"
                >
                  Ремонти
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openEditModal(selectedWorkstation);
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                >
                  Редагувати
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                >
                  Видалити
                </button>
                <button 
                  onClick={() => setShowDetailsModal(false)} 
                  className="text-[#8892b0] hover:text-white p-2 rounded-lg hover:bg-[#0e3460] transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Основна інформація */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white border-b border-[#2a3f66] pb-3">
                  Основна інформація
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Інвентарний номер:</span>
                    <span className="text-white font-semibold">{selectedWorkstation.inventory_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">ОС:</span>
                    <span className="text-white">{selectedWorkstation.os_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Підрозділ:</span>
                    <span className="text-white">{departments.find(d => d.id === selectedWorkstation.department_id)?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Відповідальний:</span>
                    <span className="text-white">{users.find(u => u.id === selectedWorkstation.responsible_id)?.full_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Гриф:</span>
                    <span className="text-white">
                      {grifLevels.find(g => g.value === selectedWorkstation.grif)?.name.replace('\n', ' ') || selectedWorkstation.grif}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white border-b border-[#2a3f66] pb-3">
                  Мережа та контакти
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">IP адреса:</span>
                    <span className="text-white font-mono">{selectedWorkstation.ip_address || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">MAC адреса:</span>
                    <span className="text-white font-mono">{selectedWorkstation.mac_address || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Дата реєстрації:</span>
                    <span className="text-white">
                      {selectedWorkstation.registration_date ? 
                        new Date(selectedWorkstation.registration_date).toLocaleDateString('uk-UA', {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric'
                        }) : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Контакти:</span>
                    <span className="text-white">{selectedWorkstation.contacts || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Технічні характеристики */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white border-b border-[#2a3f66] pb-3 mb-6">
                Технічні характеристики
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="dark-card rounded-lg p-4 border border-[#2a3f66]">
                  <div className="text-[#8892b0] text-sm mb-2">Процесор</div>
                  <div className="text-white font-semibold">{selectedWorkstation.processor || 'Не вказано'}</div>
                </div>
                <div className="dark-card rounded-lg p-4 border border-[#2a3f66]">
                  <div className="text-[#8892b0] text-sm mb-2">ОЗУ</div>
                  <div className="text-white font-semibold">{selectedWorkstation.ram || 'Не вказано'}</div>
                </div>
                <div className="dark-card rounded-lg p-4 border border-[#2a3f66]">
                  <div className="text-[#8892b0] text-sm mb-2">Накопичувач</div>
                  <div className="text-white font-semibold">{selectedWorkstation.storage || 'Не вказано'}</div>
                </div>
                <div className="dark-card rounded-lg p-4 border border-[#2a3f66]">
                  <div className="text-[#8892b0] text-sm mb-2">Монітор</div>
                  <div className="text-white font-semibold">{selectedWorkstation.monitor || 'Не вказано'}</div>
                </div>
                <div className="dark-card rounded-lg p-4 border border-[#2a3f66]">
                  <div className="text-[#8892b0] text-sm mb-2">Тип пристрою</div>
                  <div className="text-white font-semibold">{selectedWorkstation.type || 'Не вказано'}</div>
                </div>
              </div>
            </div>

            {/* Примітки */}
            {selectedWorkstation.notes && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white border-b border-[#2a3f66] pb-3 mb-6">
                  Примітки
                </h3>
                <div className="dark-card rounded-lg p-6 border border-[#2a3f66]">
                  <p className="text-white">{selectedWorkstation.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Workstations;