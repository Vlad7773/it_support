import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  UserIcon,
  ComputerDesktopIcon,
  XMarkIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

const Repairs = () => {
  const {
    repairs: contextRepairs,
    workstations,
    users,
    departments,
    loading,
    error,
    addRepair,
    updateRepair,
    deleteRepair,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTechnician, setFilterTechnician] = useState('all');
  const [filterWorkstation, setFilterWorkstation] = useState('all');
  const [activeTab, setActiveTab] = useState('main');

  const statusLevels = [
    { id: 1, value: 'pending', name: 'Очікує', color: 'bg-blue-500 text-blue-100' },
    { id: 2, value: 'diagnosed', name: 'Продіагностовано', color: 'bg-purple-500 text-purple-100' },
    { id: 3, value: 'parts_ordered', name: 'Замовлено запчастини', color: 'bg-indigo-500 text-indigo-100' },
    { id: 4, value: 'in_progress', name: 'В процесі', color: 'bg-yellow-500 text-yellow-100' },
    { id: 5, value: 'testing', name: 'Тестування', color: 'bg-orange-500 text-orange-100' },
    { id: 6, value: 'completed', name: 'Завершено', color: 'bg-green-500 text-green-100' },
    { id: 7, value: 'cancelled', name: 'Скасовано', color: 'bg-gray-500 text-gray-100' }
  ];

  const repairTypes = [
    { value: 'hardware_replacement', name: 'Заміна комплектуючих' },
    { value: 'hardware_repair', name: 'Ремонт комплектуючих' },
    { value: 'maintenance', name: 'Технічне обслуговування' },
    { value: 'upgrade', name: 'Оновлення компонентів' },
    { value: 'other', name: 'Інше' }
  ];

  const initialFormData = {
    workstation_id: '',
    workstation_number: 'АРМ-',
    technician_id: '',
    repair_type: '',
    description: '',
    diagnosis: '',
    parts_used: '',
    repair_date: new Date().toISOString().split('T')[0],
    completion_date: '',
    cost: '',
    warranty_period: '',
    status: 'pending',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [localRepairs, setLocalRepairs] = useState([]);

  useEffect(() => {
    if (contextRepairs) {
      setLocalRepairs(contextRepairs);
    }
  }, [contextRepairs]);

  const location = useLocation();
  useEffect(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDetailsModal(false);
    setSelectedRepair(null);
  }, [location.pathname]);

  // Автопідтягування відповідального користувача при виборі АРМ
  const handleWorkstationChange = (workstationId) => {
    setFormData(prev => ({ ...prev, workstation_id: workstationId }));
    
    if (workstationId) {
      const workstation = workstations.find(w => w.id === parseInt(workstationId));
      if (workstation && workstation.responsible_id) {
        // Можна автоматично призначити відповідального як техніка або залишити на вибір
        // setFormData(prev => ({ ...prev, technician_id: workstation.responsible_id.toString() }));
      }
    }
  };

  // Валідація форми
  const validateForm = () => {
    const errors = [];
    
    if (!formData.workstation_id) {
      errors.push('Виберіть АРМ');
    }
    
    if (!formData.technician_id) {
      errors.push('Виберіть техніка');
    }
    
    if (!formData.repair_type) {
      errors.push('Виберіть тип ремонту');
    }
    
    if (!formData.description?.trim()) {
      errors.push('Додайте опис ремонту');
    }
    
    if (formData.status === 'completed') {
      if (!formData.completion_date) {
        errors.push('Вкажіть дату завершення ремонту');
      }
      if (!formData.diagnosis?.trim()) {
        errors.push('Додайте діагностичний висновок');
      }
    }
    
    if (formData.cost) {
      const cost = parseFloat(formData.cost);
      if (isNaN(cost) || cost < 0) {
        errors.push('Вартість повинна бути додатнім числом');
      }
    }
    
    // Перевірка дат
    const repairDate = new Date(formData.repair_date);
    if (formData.completion_date) {
      const completionDate = new Date(formData.completion_date);
      if (completionDate < repairDate) {
        errors.push('Дата завершення не може бути раніше дати початку ремонту');
      }
    }
    
    return errors;
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
        workstation_id: parseInt(formData.workstation_id, 10),
        technician_id: parseInt(formData.technician_id, 10),
        cost: formData.cost ? parseFloat(formData.cost) : null,
      };
      await addRepair(payload);
      setShowAddModal(false);
      setActiveTab('main');
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to add repair:", err);
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
        workstation_id: parseInt(formData.workstation_id, 10),
        technician_id: parseInt(formData.technician_id, 10),
        cost: formData.cost ? parseFloat(formData.cost) : null,
      };
      await updateRepair(selectedRepair.id, payload);
      setShowEditModal(false);
      setActiveTab('main');
      setSelectedRepair(null);
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to edit repair:", err);
      showErrors(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedRepair) return;
    try {
      await deleteRepair(selectedRepair.id);
      setShowDeleteModal(false);
      setSelectedRepair(null);
    } catch (err) {
      console.error("Failed to delete repair:", err);
      alert(`Помилка видалення ремонту: ${err.response?.data?.error || err.message}`);
    }
  };

  const openEditModal = (repair) => {
    setSelectedRepair(repair);
    const workstation = workstations.find(w => w.id === repair.workstation_id);
    setFormData({
      workstation_id: repair.workstation_id?.toString() || '',
      workstation_number: workstation?.inventory_number || 'АРМ-',
      technician_id: repair.technician_id?.toString() || '',
      description: repair.description || '',
      repair_date: repair.repair_date || new Date().toISOString().split('T')[0],
      cost: repair.cost?.toString() || '',
      status: repair.status || 'pending',
    });
    setShowEditModal(true);
    setActiveTab('main');
  };

  const openDetailsModal = (repair) => {
    setSelectedRepair(repair);
    setShowDetailsModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'in_progress':
        return <PlayIcon className="h-4 w-4" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <WrenchScrewdriverIcon className="h-4 w-4" />;
    }
  };

  const filteredRepairs = (localRepairs || []).filter(repair => {
    const workstation = workstations.find(w => w.id === repair.workstation_id);
    const technician = users.find(u => u.id === repair.technician_id);

    const matchesSearch = 
      repair.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workstation?.inventory_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || repair.status === filterStatus;
    const matchesTechnician = filterTechnician === 'all' || repair.technician_id === parseInt(filterTechnician);
    const matchesWorkstation = filterWorkstation === 'all' || repair.workstation_id === parseInt(filterWorkstation);

    return matchesSearch && matchesStatus && matchesTechnician && matchesWorkstation;
  });

  // Оновлений рендер деталей ремонту
  const renderRepairDetails = () => {
    if (!selectedRepair) return null;

    const workstation = workstations.find(w => w.id === selectedRepair.workstation_id);
    const technician = users.find(u => u.id === selectedRepair.technician_id);
    const status = statusLevels.find(s => s.value === selectedRepair.status);
    const repairType = repairTypes.find(t => t.value === selectedRepair.repair_type);

    return (
      <div className="space-y-6">
        {/* Основна інформація */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p>
              <strong>АРМ:</strong> {workstation?.inventory_number}
            </p>
            <p>
              <strong>Технік:</strong> {technician?.full_name}
            </p>
            <p>
              <strong>Тип ремонту:</strong> {repairType?.name}
            </p>
            <p>
              <strong>Статус:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${status?.color}`}>
                {status?.name}
              </span>
            </p>
          </div>
          <div className="space-y-2">
            <p>
              <strong>Дата початку:</strong> {new Date(selectedRepair.repair_date).toLocaleDateString()}
            </p>
            {selectedRepair.completion_date && (
              <p>
                <strong>Дата завершення:</strong> {new Date(selectedRepair.completion_date).toLocaleDateString()}
              </p>
            )}
            {selectedRepair.cost && (
              <p>
                <strong>Вартість:</strong> {selectedRepair.cost} грн
              </p>
            )}
            {selectedRepair.warranty_period && (
              <p>
                <strong>Гарантія:</strong> {selectedRepair.warranty_period}
              </p>
            )}
          </div>
        </div>

        {/* Опис та діагностика */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Опис проблеми:</h3>
            <p className="text-gray-300">{selectedRepair.description}</p>
          </div>
          
          {selectedRepair.diagnosis && (
            <div>
              <h3 className="font-medium mb-2">Діагностика:</h3>
              <p className="text-gray-300">{selectedRepair.diagnosis}</p>
            </div>
          )}
          
          {selectedRepair.parts_used && (
            <div>
              <h3 className="font-medium mb-2">Використані запчастини:</h3>
              <p className="text-gray-300">{selectedRepair.parts_used}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Завантаження ремонтів...</p>
      </div>
    </div>
  );

  if (error && !localRepairs.length) return (
    <div className="p-6 text-center">
      <p className="text-red-400">Помилка завантаження ремонтів: {error}</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Ремонти</h1>
          <p className="text-gray-400 mt-1">Управління ремонтними роботами та технічним обслуговуванням</p>
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
          Створити ремонт
        </button>
      </div>

      {/* Компактні фільтри */}
      <div className="bg-dark-card rounded-lg shadow-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Пошук */}
          <div className="relative flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Пошук за описом, АРМ, технік..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-dark-textSecondary absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          
          {/* Фільтри */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Всі статуси</option>
            {statusLevels.map(status => (
              <option key={status.id} value={status.value}>{status.name}</option>
            ))}
          </select>

          <select
            value={filterTechnician}
            onChange={(e) => setFilterTechnician(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Всі техніки</option>
            {users.filter(u => u.role === 'admin').map(user => (
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
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">АРМ</th>
                <th className="px-6 py-4 font-semibold">Опис роботи</th>
                <th className="px-6 py-4 font-semibold">Статус</th>
                <th className="px-6 py-4 font-semibold">Технік</th>
                <th className="px-6 py-4 font-semibold">Дата ремонту</th>
                <th className="px-6 py-4 font-semibold">Вартість</th>
                <th className="px-6 py-4 font-semibold text-center">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredRepairs.length > 0 ? filteredRepairs.map(repair => {
                const workstation = workstations.find(w => w.id === repair.workstation_id);
                const technician = users.find(u => u.id === repair.technician_id);
                const statusObj = statusLevels.find(s => s.value === repair.status);
                
                return (
                  <tr key={repair.id} className="hover:bg-dark-hover transition-colors">
                    <td className="px-6 py-4 text-white font-medium">RP-{String(repair.id).padStart(3, '0')}</td>
                    <td className="px-6 py-4 text-gray-300">{workstation?.inventory_number || '-'}</td>
                    <td className="px-6 py-4 text-gray-300 max-w-[300px] truncate">{repair.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(repair.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusObj?.color || 'bg-gray-500 text-gray-100'}`}>
                          {statusObj?.name || repair.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{technician?.full_name || '-'}</td>
                    <td className="px-6 py-4 text-gray-300">{repair.repair_date ? new Date(repair.repair_date).toLocaleDateString('uk-UA') : '-'}</td>
                    <td className="px-6 py-4 text-gray-300">{repair.cost ? `₴${parseFloat(repair.cost).toFixed(2)}` : '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openDetailsModal(repair)}
                        className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                        title="Деталі"
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-dark-textSecondary">
                    <WrenchScrewdriverIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Немає ремонтів, що відповідають фільтрам</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальне вікно додавання/редагування ремонту */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{showAddModal ? 'Створити ремонт' : 'Редагувати ремонт'}</h2>
              <button onClick={() => {
                showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                setActiveTab('main');
                setSelectedRepair(null);
                setFormData(initialFormData);
              }} className="text-dark-textSecondary hover:text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={showAddModal ? handleAdd : handleEdit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">
                    АРМ <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    value={formData.workstation_number || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({...formData, workstation_number: value});
                      
                      // Автопошук АРМ
                      if (value.length >= 3) {
                        const matchingWorkstation = workstations.find(ws => 
                          ws.inventory_number.toLowerCase().includes(value.toLowerCase())
                        );
                        if (matchingWorkstation) {
                          setFormData(prev => ({
                            ...prev, 
                            workstation_id: matchingWorkstation.id.toString(),
                            workstation_number: matchingWorkstation.inventory_number
                          }));
                        }
                      }
                    }}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" 
                    placeholder="АРМ-001"
                    required
                    list="workstation-suggestions-repairs"
                  />
                  <datalist id="workstation-suggestions-repairs">
                    {workstations
                      .filter(ws => formData.workstation_number ? 
                        ws.inventory_number.toLowerCase().includes(formData.workstation_number.toLowerCase()) : true)
                      .map(ws => (
                        <option key={ws.id} value={ws.inventory_number}>
                          {ws.inventory_number} - {departments.find(d => d.id === ws.department_id)?.name || 'Без підрозділу'}
                        </option>
                      ))
                    }
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">
                    Технік <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.technician_id} 
                    onChange={(e) => setFormData({...formData, technician_id: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" 
                    required
                  >
                    <option value="">Виберіть техніка</option>
                    {users.filter(u => u.role === 'admin').map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} - {departments.find(d => d.id === user.department_id)?.name || 'Без підрозділу'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">
                    Опис ремонтних робіт <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" 
                    rows="4"
                    placeholder="Детально опишіть виконані роботи..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">Дата ремонту</label>
                  <input 
                    type="date"
                    value={formData.repair_date} 
                    onChange={(e) => setFormData({...formData, repair_date: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">Вартість ремонту (₴)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost} 
                    onChange={(e) => setFormData({...formData, cost: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">Статус</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500"
                  >
                    {statusLevels.map(status => (
                      <option key={status.id} value={status.value}>{status.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => { 
                    showAddModal ? setShowAddModal(false) : setShowEditModal(false); 
                    setActiveTab('main'); 
                    setSelectedRepair(null); 
                    setFormData(initialFormData); 
                  }} 
                  className="px-4 py-2 rounded-lg bg-dark-bg text-dark-textSecondary hover:bg-dark-hover transition-colors"
                >
                  Скасувати
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  {showAddModal ? 'Створити' : 'Зберегти'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальне вікно підтвердження видалення */}
      {showDeleteModal && selectedRepair && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-dark-card rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Підтвердити видалення</h3>
            <p className="text-dark-textSecondary mb-6">
              Ви впевнені, що хочете видалити ремонт "RP-{String(selectedRepair.id).padStart(3, '0')}"? 
              Цю дію неможливо буде скасувати.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="px-4 py-2 rounded-lg bg-dark-bg text-dark-textSecondary hover:bg-dark-hover transition-colors"
              >
                Скасувати
              </button>
              <button 
                onClick={handleDelete} 
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно деталей ремонту */}
      {showDetailsModal && selectedRepair && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Деталі ремонту: RP-{String(selectedRepair.id).padStart(3, '0')}
              </h2>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="text-dark-textSecondary hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {renderRepairDetails()}

            {/* Технічна інформація АРМ */}
            {(() => {
              const workstation = workstations.find(w => w.id === selectedRepair.workstation_id);
              if (!workstation) return null;
              
              return (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white border-b border-dark-border pb-2 mb-4">
                    Технічна інформація АРМ
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-dark-bg rounded-lg p-4">
                      <div className="text-gray-400 text-sm">IP адреса</div>
                      <div className="text-white font-medium font-mono">{workstation.ip_address || 'Не вказано'}</div>
                    </div>
                    <div className="bg-dark-bg rounded-lg p-4">
                      <div className="text-gray-400 text-sm">MAC адреса</div>
                      <div className="text-white font-medium font-mono">{workstation.mac_address || 'Не вказано'}</div>
                    </div>
                    <div className="bg-dark-bg rounded-lg p-4">
                      <div className="text-gray-400 text-sm">Операційна система</div>
                      <div className="text-white font-medium">{workstation.os_name || 'Не вказано'}</div>
                    </div>
                    <div className="bg-dark-bg rounded-lg p-4">
                      <div className="text-gray-400 text-sm">Процесор</div>
                      <div className="text-white font-medium">{workstation.processor || 'Не вказано'}</div>
                    </div>
                    <div className="bg-dark-bg rounded-lg p-4">
                      <div className="text-gray-400 text-sm">ОЗУ</div>
                      <div className="text-white font-medium">{workstation.ram || 'Не вказано'}</div>
                    </div>
                    <div className="bg-dark-bg rounded-lg p-4">
                      <div className="text-gray-400 text-sm">Накопичувач</div>
                      <div className="text-white font-medium">{workstation.storage || 'Не вказано'}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Дії */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <button
                  onClick={() => openEditModal(selectedRepair)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Редагувати
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Видалити
                </button>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => {
                    // Перенаправлення на сторінку АРМ з фільтром по поточному АРМ
                    window.location.href = `/workstations`;
                  }}
                  className="bg-dark-bg hover:bg-dark-hover text-white px-4 py-2 rounded-lg transition-colors"
                >
                  АРМ
                </button>
                <button 
                  onClick={() => {
                    // Перенаправлення на сторінку заявок з фільтром по поточному АРМ
                    window.location.href = `/tickets`;
                  }}
                  className="bg-dark-bg hover:bg-dark-hover text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Заявки
                </button>
                <button 
                  onClick={() => {
                    // Перенаправлення на сторінку ПЗ з фільтром по поточному АРМ
                    window.location.href = `/software`;
                  }}
                  className="bg-dark-bg hover:bg-dark-hover text-white px-4 py-2 rounded-lg transition-colors"
                >
                  ПЗ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repairs; 