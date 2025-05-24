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
  XMarkIcon
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
    os_name: '',
    department_id: '',
    responsible_id: '',
    contacts: '+380',
    notes: '',
    processor: '',
    ram: '',
    storage: '',
    monitor: '',
    network: '',
    type: 'Десктоп',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [localWorkstations, setLocalWorkstations] = useState([]);

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

  // Покращена валідація IP - тільки цифри і крапки, не більше 4 токенів, не дві крапки підряд
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

  // Автоформатування MAC
  const handleMACChange = (value) => {
    // Видаляємо всі символи крім hex цифр
    let formatted = value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    
    // Додаємо двокрапки
    if (formatted.length > 2) {
      formatted = formatted.match(/.{1,2}/g).join(':');
    }
    
    // Обмежуємо довжину
    if (formatted.length > 17) {
      formatted = formatted.substring(0, 17);
    }
    
    setFormData(prev => ({ ...prev, mac_address: formatted }));
  };

  // Автодоповнення для технічних полів
  const handleTechFieldChange = (field, value) => {
    let formatted = value;
    
    switch (field) {
      case 'ram':
        // Автодоповнення "ГБ"
        if (value && !value.includes('ГБ') && /^\d+$/.test(value)) {
          formatted = `${value} ГБ`;
        }
        break;
      case 'storage':
        // Автодоповнення "ГБ" або "ТБ"
        if (value && !value.includes('ГБ') && !value.includes('ТБ') && /^\d+$/.test(value)) {
          const num = parseInt(value);
          formatted = num >= 1000 ? `${Math.floor(num/1000)} ТБ` : `${value} ГБ`;
        }
        break;
      default:
        break;
    }
    
    setFormData(prev => ({ ...prev, [field]: formatted }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    
    // Валідація
    if (!formData.inventory_number || !formData.os_name || !formData.department_id) {
      alert('Будь ласка, заповніть обов\'язкові поля');
      return;
    }
    
    if (formData.ip_address && !validateIP(formData.ip_address)) {
      alert('Невірний формат IP адреси');
      return;
    }
    
    if (formData.mac_address && !validateMAC(formData.mac_address)) {
      alert('Невірний формат MAC адреси');
      return;
    }
    
    try {
      const payload = {
        ...formData,
        department_id: parseInt(formData.department_id, 10) || null,
        responsible_id: formData.responsible_id ? parseInt(formData.responsible_id, 10) : null,
      };
      await addWorkstation(payload);
      setShowAddModal(false);
      setActiveTab('main');
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to add workstation:", err);
      alert(`Помилка додавання АРМ: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    if (!formData.inventory_number || !formData.os_name || !formData.department_id) {
      alert('Будь ласка, заповніть обов\'язкові поля');
      return;
    }
    
    if (formData.ip_address && !validateIP(formData.ip_address)) {
      alert('Невірний формат IP адреси');
      return;
    }
    
    if (formData.mac_address && !validateMAC(formData.mac_address)) {
      alert('Невірний формат MAC адреси');
      return;
    }
    
    try {
      const payload = {
        ...formData,
        department_id: parseInt(formData.department_id, 10) || null,
        responsible_id: formData.responsible_id ? parseInt(formData.responsible_id, 10) : null,
      };
      await updateWorkstation(selectedWorkstation.id, payload);
      setShowEditModal(false);
      setActiveTab('main');
      setSelectedWorkstation(null);
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to edit workstation:", err);
      alert(`Помилка оновлення АРМ: ${err.response?.data?.error || err.message}`);
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
    });
    setShowEditModal(true);
    setActiveTab('main');
  };

  const openDetailsModal = (workstation) => {
    setSelectedWorkstation(workstation);
    setShowDetailsModal(true);
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
    <div className="min-h-screen p-6 space-y-6">
      {/* Header - кнопка в одну лінію */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Робочі станції</h1>
          <p className="text-[#8892b0] mt-2">Управління АРМ та технічними характеристиками</p>
        </div>
        <button
          onClick={() => {
            setFormData(initialFormData);
            setShowAddModal(true);
            setActiveTab('main');
          }}
          className="btn-gradient flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Додати АРМ</span>
        </button>
      </div>

      {/* Компактні фільтри в одну лінію */}
      <div className="dark-card rounded-xl p-4">
        <div className="flex items-center gap-3">
          {/* Пошук */}
          <div className="relative flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Пошук..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="modern-input pl-10 py-2"
            />
            <MagnifyingGlassIcon className="h-4 w-4 text-[#8892b0] absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          
          {/* Фільтри з кращими стилями */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="bg-[#16213e] border border-[#2a3f66] rounded-lg px-3 py-2 text-white text-sm min-w-[120px] focus:outline-none focus:ring-2 focus:ring-[#64ffda] focus:border-[#64ffda]"
          >
            <option value="all">Всі підрозділи</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>

          <select
            value={filterGrif}
            onChange={(e) => setFilterGrif(e.target.value)}
            className="bg-[#16213e] border border-[#2a3f66] rounded-lg px-3 py-2 text-white text-sm min-w-[100px] focus:outline-none focus:ring-2 focus:ring-[#64ffda] focus:border-[#64ffda]"
          >
            <option value="all">Всі грифи</option>
            {grifLevels.map(grif => (
              <option key={grif.id} value={grif.value}>{grif.name.replace('\n', ' ')}</option>
            ))}
          </select>

          <select
            value={filterResponsible}
            onChange={(e) => setFilterResponsible(e.target.value)}
            className="bg-[#16213e] border border-[#2a3f66] rounded-lg px-3 py-2 text-white text-sm min-w-[140px] focus:outline-none focus:ring-2 focus:ring-[#64ffda] focus:border-[#64ffda]"
          >
            <option value="all">Всі відповідальні</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.full_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Таблиця без MAC адреси з кращим заголовком */}
      <div className="dark-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead className="bg-[#0e3460]">
              <tr>
                <th>Тип/Інв. номер</th>
                <th>IP адреса</th>
                <th>Гриф</th>
                <th>Підрозділ</th>
                <th>Відповідальний</th>
                <th>Контакти</th>
                <th>Дата реєстрації</th>
                <th className="text-center">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkstations.length > 0 ? filteredWorkstations.map(ws => {
                const department = departments.find(d => d.id === ws.department_id);
                const responsibleUser = users.find(u => u.id === ws.responsible_id);
                const grifObj = grifLevels.find(g => g.value === ws.grif);
                
                return (
                  <tr key={ws.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(ws.type)}
                        <span className="font-semibold">{ws.inventory_number}</span>
                      </div>
                    </td>
                    <td className="font-mono font-medium">{ws.ip_address || '-'}</td>
                    <td>
                      <span className={`status-badge ${grifObj?.color || 'bg-gray-500 bg-opacity-20 text-gray-300'}`}>
                        {grifObj?.name || ws.grif}
                      </span>
                    </td>
                    <td>{department?.name || '-'}</td>
                    <td>{responsibleUser?.full_name || '-'}</td>
                    <td>{ws.contacts || '-'}</td>
                    <td>{ws.registration_date || '-'}</td>
                    <td className="text-center">
                      <button
                        onClick={() => openDetailsModal(ws)}
                        className="text-[#8892b0] hover:text-[#64ffda] p-2 rounded-lg transition-all duration-200 hover:bg-[#0e3460]"
                        title="Деталі"
                      >
                        <Bars3Icon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <ComputerDesktopIcon className="h-16 w-16 mx-auto mb-4 text-[#8892b0] opacity-50" />
                    <p className="text-[#8892b0]">Немає АРМ, що відповідають фільтрам</p>
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
            
            <form onSubmit={showAddModal ? handleAdd : handleEdit}>
              {/* Основні дані */}
              {activeTab === 'main' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">
                      Інвентарний номер <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.inventory_number} 
                      onChange={(e) => setFormData({...formData, inventory_number: e.target.value})} 
                      className="modern-input" 
                      required 
                      placeholder="АРМ-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">
                      Операційна система <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      list="os-list"
                      value={formData.os_name} 
                      onChange={(e) => setFormData({...formData, os_name: e.target.value})} 
                      className="modern-input" 
                      required 
                      placeholder="Windows 11 Pro"
                    />
                    <datalist id="os-list">
                      <option value="Windows 10" />
                      <option value="Windows 11" />
                      <option value="Windows 11 Pro" />
                      <option value="Linux Ubuntu" />
                      <option value="Linux CentOS" />
                      <option value="Linux Debian" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">
                      Підрозділ <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      list="department-list"
                      value={departments.find(d => d.id === parseInt(formData.department_id))?.name || formData.department_id}
                      onChange={(e) => {
                        const dept = departments.find(d => d.name === e.target.value);
                        setFormData({...formData, department_id: dept ? dept.id : e.target.value});
                      }}
                      className="modern-input" 
                      required
                      placeholder="Виберіть або введіть підрозділ"
                    />
                    <datalist id="department-list">
                      {departments.map(dept => <option key={dept.id} value={dept.name} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">Відповідальний</label>
                    <input 
                      type="text" 
                      list="user-list"
                      value={users.find(u => u.id === parseInt(formData.responsible_id))?.full_name || formData.responsible_id}
                      onChange={(e) => {
                        const user = users.find(u => u.full_name === e.target.value);
                        setFormData({...formData, responsible_id: user ? user.id : e.target.value});
                      }}
                      className="modern-input"
                      placeholder="Виберіть або введіть відповідального"
                    />
                    <datalist id="user-list">
                      {users.map(user => <option key={user.id} value={user.full_name} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">Гриф</label>
                    <select 
                      value={formData.grif} 
                      onChange={(e) => setFormData({...formData, grif: e.target.value})} 
                      className="modern-select"
                    >
                      {grifLevels.map(grif => <option key={grif.id} value={grif.value}>{grif.name.replace('\n', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">Тип пристрою</label>
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
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">Контакти</label>
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
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">IP адреса</label>
                    <input 
                      type="text" 
                      value={formData.ip_address} 
                      onChange={(e) => handleIPChange(e.target.value)} 
                      className="modern-input font-mono" 
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">MAC адреса</label>
                    <input 
                      type="text" 
                      value={formData.mac_address} 
                      onChange={(e) => handleMACChange(e.target.value)} 
                      className="modern-input font-mono" 
                      placeholder="00:1A:2B:3C:4D:5E"
                    />
                  </div>
                  <div className="lg:col-span-2">
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
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">ОЗУ</label>
                    <input 
                      type="text" 
                      value={formData.ram} 
                      onChange={(e) => handleTechFieldChange('ram', e.target.value)} 
                      className="modern-input" 
                      placeholder="16 ГБ DDR4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">Накопичувач</label>
                    <input 
                      type="text" 
                      value={formData.storage} 
                      onChange={(e) => handleTechFieldChange('storage', e.target.value)} 
                      className="modern-input" 
                      placeholder="SSD 512 ГБ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8892b0] mb-2">Монітор</label>
                    <input 
                      type="text" 
                      value={formData.monitor} 
                      onChange={(e) => setFormData({...formData, monitor: e.target.value})} 
                      className="modern-input" 
                      placeholder='Dell 24" 1920x1080'
                    />
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
                    showAddModal ? setShowAddModal(false) : setShowEditModal(false); 
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
                  {showAddModal ? 'Додати' : 'Зберегти'}
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
                Деталі АРМ: {selectedWorkstation.inventory_number}
              </h2>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="text-[#8892b0] hover:text-white p-2 rounded-lg hover:bg-[#0e3460] transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
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
                    <span className={`status-badge ${grifLevels.find(g => g.value === selectedWorkstation.grif)?.color || 'bg-gray-500 bg-opacity-20 text-gray-300'}`}>
                      {grifLevels.find(g => g.value === selectedWorkstation.grif)?.name || selectedWorkstation.grif}
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
                    <span className="text-white font-mono font-medium">{selectedWorkstation.ip_address || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">MAC адреса:</span>
                    <span className="text-white font-mono font-medium">{selectedWorkstation.mac_address || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Мережа:</span>
                    <span className="text-white">{selectedWorkstation.network || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Контакти:</span>
                    <span className="text-white">{selectedWorkstation.contacts || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Дата реєстрації:</span>
                    <span className="text-white">{selectedWorkstation.registration_date || 'N/A'}</span>
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

            {/* Дії */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button
                  onClick={() => openEditModal(selectedWorkstation)}
                  className="btn-gradient"
                >
                  Редагувати
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                >
                  Видалити
                </button>
              </div>
              <div className="flex space-x-4">
                <button className="px-6 py-3 rounded-lg bg-[#0f0f23] hover:bg-[#0e3460] text-white font-semibold transition-colors">
                  ПЗ
                </button>
                <button className="px-6 py-3 rounded-lg bg-[#0f0f23] hover:bg-[#0e3460] text-white font-semibold transition-colors">
                  Заявки
                </button>
                <button className="px-6 py-3 rounded-lg bg-[#0f0f23] hover:bg-[#0e3460] text-white font-semibold transition-colors">
                  Ремонти
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workstations;